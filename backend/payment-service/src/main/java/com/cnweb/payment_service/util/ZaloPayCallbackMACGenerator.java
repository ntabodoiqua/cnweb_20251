package com.cnweb.payment_service.util;

import lombok.extern.slf4j.Slf4j;

/**
 * Utility class để generate MAC cho testing ZaloPay callback
 * 
 * Chạy class này để tạo MAC cho test callback requests
 */
@Slf4j
public class ZaloPayCallbackMACGenerator {
    
    /**
     * Main method để generate MAC cho callback testing
     * 
     * Thay đổi giá trị DATA và KEY2 phù hợp với test case của bạn
     */
    public static void main(String[] args) {
        // ===== CONFIGURATION =====
        // Key2 từ ZaloPay Dashboard (Mac Key)
        String KEY2 = "eG4r0GcoNtRGbO8"; // THAY ĐỔI KEY2 CỦA BẠN Ở ĐÂY
        
        // ===== TEST CASE 1: Success Case =====
        String data1 = "{\"app_id\":2553,\"app_trans_id\":\"251028_123456\",\"app_time\":1730102400000,\"app_user\":\"user123\",\"amount\":50000,\"embed_data\":\"{\\\"merchantinfo\\\":\\\"test\\\"}\",\"item\":\"[{\\\"itemid\\\":\\\"item1\\\",\\\"itemname\\\":\\\"Product 1\\\",\\\"itemprice\\\":50000,\\\"itemquantity\\\":1}]\",\"zp_trans_id\":251028000000123,\"server_time\":1730102450000,\"channel\":38,\"merchant_user_id\":\"merchant_user_123\",\"user_fee_amount\":0,\"discount_amount\":0}";
        
        System.out.println("=".repeat(80));
        System.out.println("ZALOPAY CALLBACK MAC GENERATOR");
        System.out.println("=".repeat(80));
        System.out.println();
        
        // Generate MAC for test case 1
        System.out.println("📝 TEST CASE 1: Success Callback");
        System.out.println("-".repeat(80));
        System.out.println("Data:");
        System.out.println(data1);
        System.out.println();
        
        String mac1 = ZaloPayHMACUtil.computeHmacSHA256(data1, KEY2);
        System.out.println("✅ Generated MAC:");
        System.out.println(mac1);
        System.out.println();
        System.out.println("📋 Full Callback Request:");
        System.out.println("{");
        System.out.println("  \"data\": \"" + data1 + "\",");
        System.out.println("  \"mac\": \"" + mac1 + "\",");
        System.out.println("  \"type\": 1");
        System.out.println("}");
        System.out.println();
        
        // ===== TEST CASE 2: Different Channel =====
        String data2 = "{\"app_id\":2553,\"app_trans_id\":\"251028_visa_001\",\"app_time\":1730102400000,\"app_user\":\"user123\",\"amount\":100000,\"embed_data\":\"{}\",\"item\":\"[]\",\"zp_trans_id\":251028000000124,\"server_time\":1730102450000,\"channel\":36,\"merchant_user_id\":\"test\",\"user_fee_amount\":2000,\"discount_amount\":5000}";
        
        System.out.println("=".repeat(80));
        System.out.println("📝 TEST CASE 2: Visa/Master/JCB (Channel 36)");
        System.out.println("-".repeat(80));
        
        String mac2 = ZaloPayHMACUtil.computeHmacSHA256(data2, KEY2);
        System.out.println("✅ Generated MAC: " + mac2);
        System.out.println();
        
        // ===== TEST CASE 3: ATM Channel =====
        String data3 = "{\"app_id\":2553,\"app_trans_id\":\"251028_atm_001\",\"app_time\":1730102400000,\"app_user\":\"user123\",\"amount\":150000,\"embed_data\":\"{}\",\"item\":\"[]\",\"zp_trans_id\":251028000000127,\"server_time\":1730102450000,\"channel\":39,\"merchant_user_id\":\"test\",\"user_fee_amount\":1500,\"discount_amount\":0}";
        
        System.out.println("=".repeat(80));
        System.out.println("📝 TEST CASE 3: ATM (Channel 39)");
        System.out.println("-".repeat(80));
        
        String mac3 = ZaloPayHMACUtil.computeHmacSHA256(data3, KEY2);
        System.out.println("✅ Generated MAC: " + mac3);
        System.out.println();
        
        // ===== VERIFY MAC =====
        System.out.println("=".repeat(80));
        System.out.println("🔍 VERIFY MAC EXAMPLE");
        System.out.println("-".repeat(80));
        
        String testData = data1;
        String testMac = mac1;
        
        boolean isValid = ZaloPayHMACUtil.verifyHmacSHA256(testData, KEY2, testMac);
        System.out.println("Data: " + testData.substring(0, Math.min(50, testData.length())) + "...");
        System.out.println("MAC: " + testMac);
        System.out.println("Verification: " + (isValid ? "✅ VALID" : "❌ INVALID"));
        System.out.println();
        
        // ===== USAGE INSTRUCTIONS =====
        System.out.println("=".repeat(80));
        System.out.println("📖 USAGE INSTRUCTIONS");
        System.out.println("-".repeat(80));
        System.out.println("1. Copy generated MAC từ output trên");
        System.out.println("2. Paste vào file zalopay-callback-test.http");
        System.out.println("3. Replace 'REPLACE_WITH_COMPUTED_MAC' bằng MAC đã copy");
        System.out.println("4. Sử dụng REST Client hoặc cURL để test callback endpoint");
        System.out.println();
        System.out.println("🔑 Remember to update KEY2 with your actual ZaloPay Mac Key!");
        System.out.println("=".repeat(80));
    }
    
    /**
     * Generate MAC cho custom data
     * 
     * @param data Callback data string
     * @param key2 Mac Key từ ZaloPay
     * @return MAC string
     */
    public static String generateCallbackMAC(String data, String key2) {
        String mac = ZaloPayHMACUtil.computeHmacSHA256(data, key2);
        
        log.info("Generated MAC for callback data");
        log.debug("Data: {}", data);
        log.debug("MAC: {}", mac);
        
        return mac;
    }
    
    /**
     * Verify MAC cho callback
     * 
     * @param data Callback data string
     * @param key2 Mac Key từ ZaloPay
     * @param receivedMac MAC nhận được từ callback
     * @return true nếu MAC hợp lệ
     */
    public static boolean verifyCallbackMAC(String data, String key2, String receivedMac) {
        boolean isValid = ZaloPayHMACUtil.verifyHmacSHA256(data, key2, receivedMac);
        
        log.info("MAC verification: {}", isValid ? "VALID" : "INVALID");
        
        if (!isValid) {
            String expectedMac = ZaloPayHMACUtil.computeHmacSHA256(data, key2);
            log.warn("Expected MAC: {}, Received MAC: {}", expectedMac, receivedMac);
        }
        
        return isValid;
    }
}
