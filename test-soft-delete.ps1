# Script kiểm tra tính năng Soft Delete User
# Chạy script này sau khi đã khởi động user-service và product-service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING SOFT DELETE USER FEATURE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Biến cấu hình
$userServiceUrl = "http://localhost:8081"
$testUsername = "testuser_delete_" + (Get-Date -Format "HHmmss")
$testPassword = "Test@123456"
$testEmail = "testdelete_" + (Get-Date -Format "HHmmss") + "@example.com"
$testPhone = "099" + (Get-Random -Minimum 1000000 -Maximum 9999999)

# ============================================
# TEST 1: Tạo User Mới
# ============================================
Write-Host "[TEST 1] Creating new test user..." -ForegroundColor Yellow

$createUserBody = @{
    username = $testUsername
    password = $testPassword
    email = $testEmail
    phone = $testPhone
    firstName = "Test"
    lastName = "Delete"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$userServiceUrl/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $createUserBody

    Write-Host "✅ User created: $testUsername" -ForegroundColor Green
    $userId = $createResponse.result.id
    Write-Host "   User ID: $userId`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# TEST 2: Login để lấy Token
# ============================================
Write-Host "[TEST 2] Logging in to get token..." -ForegroundColor Yellow

$loginBody = @{
    username = $testUsername
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$userServiceUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.result.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# TEST 3: Kiểm tra thông tin user
# ============================================
Write-Host "[TEST 3] Getting user info..." -ForegroundColor Yellow

try {
    $userInfo = Invoke-RestMethod -Uri "$userServiceUrl/users/myInfo" `
        -Method GET `
        -Headers @{Authorization = "Bearer $token"}

    Write-Host "✅ User info retrieved" -ForegroundColor Green
    Write-Host "   Username: $($userInfo.result.username)" -ForegroundColor Gray
    Write-Host "   Email: $($userInfo.result.email)" -ForegroundColor Gray
    Write-Host "   Enabled: $($userInfo.result.enabled)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get user info: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# TEST 4: SOFT DELETE (Tính năng mới!)
# ============================================
Write-Host "[TEST 4] ⭐ SOFT DELETING ACCOUNT (NEW FEATURE)..." -ForegroundColor Yellow

try {
    $softDeleteResponse = Invoke-RestMethod -Uri "$userServiceUrl/users/soft-delete" `
        -Method DELETE `
        -Headers @{Authorization = "Bearer $token"}

    Write-Host "✅ SOFT DELETE SUCCESSFUL!" -ForegroundColor Green
    Write-Host "   Message: $($softDeleteResponse.message)" -ForegroundColor Gray
    Write-Host "   Result: $($softDeleteResponse.result)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Soft delete failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# ============================================
# TEST 5: Thử login lại (nên thất bại)
# ============================================
Write-Host "[TEST 5] Trying to login again (should fail)..." -ForegroundColor Yellow

try {
    $loginAgain = Invoke-RestMethod -Uri "$userServiceUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "❌ UNEXPECTED: Login succeeded after soft delete!" -ForegroundColor Red
} catch {
    Write-Host "✅ Login failed as expected after soft delete" -ForegroundColor Green
    Write-Host "   Error: User is disabled/deleted`n" -ForegroundColor Gray
}

# ============================================
# TEST 6: Admin Login
# ============================================
Write-Host "[TEST 6] Logging in as admin..." -ForegroundColor Yellow

$adminLoginBody = @{
    username = "admin"
    password = "admin"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "$userServiceUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $adminLoginBody

    $adminToken = $adminLoginResponse.result.token
    Write-Host "✅ Admin login successful" -ForegroundColor Green
    Write-Host "   Admin Token: $($adminToken.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Note: Make sure admin user exists with credentials admin/admin`n" -ForegroundColor Yellow
    # Continue without admin tests
    $adminToken = $null
}

if ($adminToken) {
    # ============================================
    # TEST 7: Xem danh sách Soft Deleted Users
    # ============================================
    Write-Host "[TEST 7] ⭐ Getting soft deleted users (ADMIN - NEW FEATURE)..." -ForegroundColor Yellow

    try {
        $softDeletedUsers = Invoke-RestMethod -Uri "$userServiceUrl/admin/users/soft-deleted" `
            -Method GET `
            -Headers @{Authorization = "Bearer $adminToken"}

        Write-Host "✅ Soft deleted users retrieved" -ForegroundColor Green
        Write-Host "   Total count: $($softDeletedUsers.result.Count)" -ForegroundColor Gray

        $foundUser = $softDeletedUsers.result | Where-Object { $_.username -eq $testUsername }
        if ($foundUser) {
            Write-Host "   ✓ Test user found in soft deleted list" -ForegroundColor Green
            Write-Host "   Username: $($foundUser.username)" -ForegroundColor Gray
            Write-Host "   Email: $($foundUser.email)`n" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠ Test user not found in list (might need to wait)`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to get soft deleted users: $($_.Exception.Message)`n" -ForegroundColor Red
    }

    # ============================================
    # TEST 8: Đếm số lượng Soft Deleted Users
    # ============================================
    Write-Host "[TEST 8] ⭐ Counting soft deleted users (ADMIN - NEW FEATURE)..." -ForegroundColor Yellow

    try {
        $countResponse = Invoke-RestMethod -Uri "$userServiceUrl/admin/users/soft-deleted/count" `
            -Method GET `
            -Headers @{Authorization = "Bearer $adminToken"}

        Write-Host "✅ Count retrieved" -ForegroundColor Green
        Write-Host "   Soft deleted users count: $($countResponse.result)`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to count soft deleted users: $($_.Exception.Message)`n" -ForegroundColor Red
    }

    # ============================================
    # TEST 9: Restore User
    # ============================================
    Write-Host "[TEST 9] ⭐ RESTORING USER (ADMIN - NEW FEATURE)..." -ForegroundColor Yellow

    try {
        $restoreResponse = Invoke-RestMethod -Uri "$userServiceUrl/admin/users/$userId/restore" `
            -Method PUT `
            -Headers @{Authorization = "Bearer $adminToken"}

        Write-Host "✅ USER RESTORED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "   Message: $($restoreResponse.message)" -ForegroundColor Gray
        Write-Host "   Result: $($restoreResponse.result)`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to restore user: $($_.Exception.Message)`n" -ForegroundColor Red
    }

    Start-Sleep -Seconds 2

    # ============================================
    # TEST 10: Login lại sau khi restore
    # ============================================
    Write-Host "[TEST 10] Trying to login after restore..." -ForegroundColor Yellow

    try {
        $loginAfterRestore = Invoke-RestMethod -Uri "$userServiceUrl/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $loginBody

        Write-Host "✅ LOGIN SUCCESSFUL AFTER RESTORE!" -ForegroundColor Green
        Write-Host "   User has been successfully restored`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Login failed after restore: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This might indicate an issue with the restore process`n" -ForegroundColor Yellow
    }
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n✅ Core Features Tested:" -ForegroundColor Green
Write-Host "   - User Creation" -ForegroundColor Gray
Write-Host "   - User Login" -ForegroundColor Gray
Write-Host "   - Soft Delete (NEW)" -ForegroundColor Yellow
Write-Host "   - Login Prevention after Soft Delete" -ForegroundColor Gray

if ($adminToken) {
    Write-Host "`n✅ Admin Features Tested:" -ForegroundColor Green
    Write-Host "   - View Soft Deleted Users (NEW)" -ForegroundColor Yellow
    Write-Host "   - Count Soft Deleted Users (NEW)" -ForegroundColor Yellow
    Write-Host "   - Restore User (NEW)" -ForegroundColor Yellow
    Write-Host "   - Login after Restore" -ForegroundColor Gray
}

Write-Host "`n📝 Test User Credentials:" -ForegroundColor Cyan
Write-Host "   Username: $testUsername" -ForegroundColor Gray
Write-Host "   Password: $testPassword" -ForegroundColor Gray
Write-Host "   User ID: $userId" -ForegroundColor Gray

Write-Host "`n⏭️  Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check database to verify deleted and deleted_at columns" -ForegroundColor Gray
Write-Host "   2. Check RabbitMQ for USER_SOFT_DELETED events" -ForegroundColor Gray
Write-Host "   3. Check product-service logs for event handling" -ForegroundColor Gray
Write-Host "   4. Wait until 2 AM to test scheduler (or trigger manually)" -ForegroundColor Gray

Write-Host "`n📖 For detailed testing guide, see: TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host "`n========================================`n" -ForegroundColor Cyan

