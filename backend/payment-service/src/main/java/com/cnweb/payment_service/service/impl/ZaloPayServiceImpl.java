package com.cnweb.payment_service.service.impl;

import com.cnweb.payment_service.config.ZaloPayConfig;
import com.cnweb.payment_service.dto.zalopay.*;
import com.cnweb.payment_service.entity.ZaloPayTransaction;
import com.cnweb.payment_service.repository.ZaloPayTransactionRepository;
import com.cnweb.payment_service.service.ZaloPayService;
import com.cnweb.payment_service.util.ZaloPayHMACUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/**
 * Implementation của ZaloPayService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ZaloPayServiceImpl implements ZaloPayService {
    
    private final ZaloPayConfig zaloPayConfig;
    private final ObjectMapper objectMapper;
    private final ZaloPayTransactionRepository transactionRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    private static final String DATE_FORMAT = "yyMMdd";
    
    @Override
    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        try {
            // Generate app_trans_id với format: yyMMdd_timestamp
            String appTransId = generateAppTransId();
            
            // Lấy thời gian hiện tại (milliseconds)
            long appTime = System.currentTimeMillis();
            
            // Convert items sang JSON string
            String itemJson = objectMapper.writeValueAsString(request.getItems());
            
            // Xử lý embed_data
            String embedDataJson = buildEmbedData(request.getEmbedData());
            
            // Tạo HMAC input theo format: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
            String hmacInput = String.format("%d|%s|%s|%d|%d|%s|%s",
                    zaloPayConfig.getAppId(),
                    appTransId,
                    request.getAppUser(),
                    request.getAmount(),
                    appTime,
                    embedDataJson,
                    itemJson
            );
            
            // Tạo MAC
            String mac = ZaloPayHMACUtil.computeHmacSHA256(hmacInput, zaloPayConfig.getKey1());
            
            log.info("Creating ZaloPay order - AppTransId: {}, Amount: {}, MAC Input: {}", 
                    appTransId, request.getAmount(), hmacInput);
            
            // Build request gửi tới ZaloPay
            ZaloPayOrderRequest zaloPayRequest = ZaloPayOrderRequest.builder()
                    .appId(zaloPayConfig.getAppId())
                    .appUser(request.getAppUser())
                    .appTransId(appTransId)
                    .appTime(appTime)
                    .amount(request.getAmount())
                    .item(itemJson)
                    .description(request.getDescription())
                    .embedData(embedDataJson)
                    .bankCode(request.getBankCode())
                    .mac(mac)
                    .callbackUrl(zaloPayConfig.getCallbackUrl())
                    .expireDurationSeconds(
                            request.getExpireDurationSeconds() != null 
                                    ? request.getExpireDurationSeconds() 
                                    : zaloPayConfig.getExpireDurationSeconds()
                    )
                    .title(request.getTitle())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .address(request.getAddress())
                    .subAppId(request.getSubAppId())
                    .build();
            
            // Gọi API ZaloPay
            ZaloPayOrderResponse zaloPayResponse = callZaloPayCreateOrderAPI(zaloPayRequest);
            
            // Lưu transaction vào database
            saveTransaction(appTransId, request, itemJson, embedDataJson, zaloPayResponse);
            
            // Xử lý response
            return buildCreateOrderResponse(appTransId, zaloPayResponse);
            
        } catch (JsonProcessingException e) {
            log.error("Error processing JSON: {}", e.getMessage(), e);
            return CreateOrderResponse.builder()
                    .status("FAILED")
                    .message("Lỗi xử lý dữ liệu JSON")
                    .build();
        } catch (Exception e) {
            log.error("Error creating ZaloPay order: {}", e.getMessage(), e);
            return CreateOrderResponse.builder()
                    .status("FAILED")
                    .message("Lỗi tạo đơn hàng: " + e.getMessage())
                    .build();
        }
    }
    
    @Override
    @Transactional
    public String handleCallback(ZaloPayCallbackRequest callbackRequest) {
        try {
            log.info("=== ZALOPAY CALLBACK RECEIVED ===");
            log.info("Type: {}, MAC: {}", callbackRequest.getType(), callbackRequest.getMac());
            log.debug("Data: {}", callbackRequest.getData());
            
            // Bước 1: Verify MAC để đảm bảo callback đến từ ZaloPay
            String computedMac = ZaloPayHMACUtil.computeHmacSHA256(
                    callbackRequest.getData(), 
                    zaloPayConfig.getKey2()
            );
            
            if (!computedMac.equalsIgnoreCase(callbackRequest.getMac())) {
                log.error("❌ INVALID MAC - Computed: {}, Received: {}", 
                        computedMac, callbackRequest.getMac());
                return buildCallbackResponse(-1, "mac not equal");
            }
            
            log.info("✅ MAC verified successfully");
            
            // Bước 2: Parse callback data
            ZaloPayCallbackData callbackData = objectMapper.readValue(
                    callbackRequest.getData(), 
                    ZaloPayCallbackData.class
            );
            
            log.info("Parsed callback data - AppTransId: {}, ZpTransId: {}, Amount: {}, Channel: {}", 
                    callbackData.getAppTransId(), 
                    callbackData.getZpTransId(),
                    callbackData.getAmount(),
                    callbackData.getChannel());
            
            // Bước 3: Kiểm tra idempotency - nếu đã xử lý rồi thì return code = 2
            ZaloPayTransaction existingTransaction = transactionRepository
                    .findByAppTransId(callbackData.getAppTransId())
                    .orElse(null);
            
            if (existingTransaction != null && 
                existingTransaction.getStatus() == ZaloPayTransaction.TransactionStatus.SUCCESS) {
                log.warn("⚠️ Duplicate callback - Transaction already processed: {}", 
                        callbackData.getAppTransId());
                // Theo đặc tả ZaloPay: return_code = 2 khi trùng mã giao dịch
                return buildCallbackResponse(2, "success");
            }
            
            // Bước 4: Cập nhật transaction trong database
            log.info("💰 Processing payment success for AppTransId: {}", callbackData.getAppTransId());
            updateTransactionOnCallback(callbackData);
            
            // TODO: Xử lý business logic khi thanh toán thành công
            // - Cập nhật trạng thái order
            // - Gửi notification cho user
            // - Trigger các service khác (order, inventory, etc.)
            
            log.info("✅ Callback processed successfully - AppTransId: {}", callbackData.getAppTransId());
            return buildCallbackResponse(1, "success");
            
        } catch (JsonProcessingException e) {
            log.error("❌ JSON parsing error in callback: {}", e.getMessage(), e);
            // Return 0 để ZaloPay callback lại (tối đa 3 lần)
            return buildCallbackResponse(0, "Invalid JSON format: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Unexpected error handling ZaloPay callback: {}", e.getMessage(), e);
            // Return 0 để ZaloPay callback lại (tối đa 3 lần)
            return buildCallbackResponse(0, e.getMessage());
        }
    }
    
    /**
     * Generate app_trans_id theo format: yyMMdd_timestamp
     * QUAN TRỌNG: Sử dụng TimeZone GMT+7 (Vietnam) theo yêu cầu của ZaloPay
     */
    private String generateAppTransId() {
        // Sử dụng Calendar với GMT+7 timezone giống như code mẫu ZaloPay
        Calendar cal = new GregorianCalendar(TimeZone.getTimeZone("GMT+7"));
        SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
        sdf.setCalendar(cal);
        String datePrefix = sdf.format(cal.getTimeInMillis());
        
        // Sử dụng random ID để tránh trùng lặp trong cùng 1 millisecond
        Random rand = new Random();
        int randomId = rand.nextInt(1000000);
        
        return String.format("%s_%d", datePrefix, randomId);
    }
    
    /**
     * Build embed_data JSON string
     */
    private String buildEmbedData(EmbedData embedData) throws JsonProcessingException {
        if (embedData == null) {
            embedData = new EmbedData();
        }
        
        // Set redirect URL mặc định nếu chưa có
        if (embedData.getRedirectUrl() == null || embedData.getRedirectUrl().isEmpty()) {
            embedData.setRedirectUrl(zaloPayConfig.getRedirectUrl());
        }
        
        return objectMapper.writeValueAsString(embedData);
    }
    
    /**
     * Gọi ZaloPay Create Order API
     */
    private ZaloPayOrderResponse callZaloPayCreateOrderAPI(ZaloPayOrderRequest request) {
        try {
            // Sử dụng application/x-www-form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Convert request object sang form data
            MultiValueMap<String, String> formData = convertToFormData(request);
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);
            
            log.info("Calling ZaloPay API: {}", zaloPayConfig.getCreateOrderUrl());
            
            ResponseEntity<ZaloPayOrderResponse> response = restTemplate.exchange(
                    zaloPayConfig.getCreateOrderUrl(),
                    HttpMethod.POST,
                    entity,
                    ZaloPayOrderResponse.class
            );
            
            ZaloPayOrderResponse responseBody = response.getBody();
            
            log.info("ZaloPay API response - ReturnCode: {}, Message: {}", 
                    responseBody != null ? responseBody.getReturnCode() : null,
                    responseBody != null ? responseBody.getReturnMessage() : null);
            
            return responseBody;
            
        } catch (RestClientException e) {
            log.error("Error calling ZaloPay API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call ZaloPay API", e);
        }
    }
    
    /**
     * Convert request object sang form data
     */
    private MultiValueMap<String, String> convertToFormData(ZaloPayOrderRequest request) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        
        formData.add("app_id", String.valueOf(request.getAppId()));
        formData.add("app_user", request.getAppUser());
        formData.add("app_trans_id", request.getAppTransId());
        formData.add("app_time", String.valueOf(request.getAppTime()));
        formData.add("amount", String.valueOf(request.getAmount()));
        formData.add("item", request.getItem());
        formData.add("description", request.getDescription());
        formData.add("embed_data", request.getEmbedData());
        formData.add("mac", request.getMac());
        
        // Optional fields
        if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
            formData.add("bank_code", request.getBankCode());
        }
        if (request.getCallbackUrl() != null && !request.getCallbackUrl().isEmpty()) {
            formData.add("callback_url", request.getCallbackUrl());
        }
        if (request.getExpireDurationSeconds() != null) {
            formData.add("expire_duration_seconds", String.valueOf(request.getExpireDurationSeconds()));
        }
        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            formData.add("title", request.getTitle());
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            formData.add("phone", request.getPhone());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            formData.add("email", request.getEmail());
        }
        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            formData.add("address", request.getAddress());
        }
        if (request.getSubAppId() != null && !request.getSubAppId().isEmpty()) {
            formData.add("sub_app_id", request.getSubAppId());
        }
        
        return formData;
    }
    
    /**
     * Build CreateOrderResponse từ ZaloPay response
     */
    private CreateOrderResponse buildCreateOrderResponse(String appTransId, ZaloPayOrderResponse zaloPayResponse) {
        if (zaloPayResponse == null) {
            return CreateOrderResponse.builder()
                    .status("FAILED")
                    .message("Không nhận được response từ ZaloPay")
                    .build();
        }
        
        boolean isSuccess = zaloPayResponse.getReturnCode() != null && zaloPayResponse.getReturnCode() == 1;
        
        return CreateOrderResponse.builder()
                .appTransId(appTransId)
                .orderUrl(zaloPayResponse.getOrderUrl())
                .zpTransToken(zaloPayResponse.getZpTransToken())
                .qrCode(zaloPayResponse.getQrCode())
                .status(isSuccess ? "SUCCESS" : "FAILED")
                .message(zaloPayResponse.getReturnMessage())
                .errorCode(zaloPayResponse.getSubReturnCode())
                .build();
    }
    
    /**
     * Build callback response JSON
     */
    private String buildCallbackResponse(int returnCode, String returnMessage) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("return_code", returnCode);
            response.put("return_message", returnMessage);
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e) {
            log.error("Error building callback response: {}", e.getMessage(), e);
            return "{\"return_code\": 0, \"return_message\": \"Error\"}";
        }
    }
    
    /**
     * Lưu transaction vào database
     */
    private void saveTransaction(String appTransId, CreateOrderRequest request, 
                                 String itemJson, String embedDataJson, 
                                 ZaloPayOrderResponse zaloPayResponse) {
        try {
            boolean isSuccess = zaloPayResponse != null && 
                              zaloPayResponse.getReturnCode() != null && 
                              zaloPayResponse.getReturnCode() == 1;
            
            ZaloPayTransaction transaction = ZaloPayTransaction.builder()
                    .appTransId(appTransId)
                    .appUser(request.getAppUser())
                    .amount(request.getAmount())
                    .description(request.getDescription())
                    .items(itemJson)
                    .embedData(embedDataJson)
                    .bankCode(request.getBankCode())
                    .zpTransToken(zaloPayResponse != null ? zaloPayResponse.getZpTransToken() : null)
                    .orderUrl(zaloPayResponse != null ? zaloPayResponse.getOrderUrl() : null)
                    .qrCode(zaloPayResponse != null ? zaloPayResponse.getQrCode() : null)
                    .status(isSuccess ? ZaloPayTransaction.TransactionStatus.PENDING 
                                     : ZaloPayTransaction.TransactionStatus.FAILED)
                    .returnCode(zaloPayResponse != null ? zaloPayResponse.getReturnCode() : null)
                    .returnMessage(zaloPayResponse != null ? zaloPayResponse.getReturnMessage() : null)
                    .build();
            
            transactionRepository.save(transaction);
            log.info("Saved transaction to database: {}", appTransId);
            
        } catch (Exception e) {
            log.error("Error saving transaction: {}", e.getMessage(), e);
            // Không throw exception để không block flow tạo đơn hàng
        }
    }
    
    /**
     * Cập nhật transaction khi nhận callback
     */
    private void updateTransactionOnCallback(ZaloPayCallbackData callbackData) {
        try {
            ZaloPayTransaction transaction = transactionRepository
                    .findByAppTransId(callbackData.getAppTransId())
                    .orElseThrow(() -> new RuntimeException(
                            "Transaction not found: " + callbackData.getAppTransId()));
            
            // Cập nhật thông tin từ callback
            transaction.setZpTransId(callbackData.getZpTransId());
            transaction.setStatus(ZaloPayTransaction.TransactionStatus.SUCCESS);
            transaction.setChannel(callbackData.getChannel());
            transaction.setUserFeeAmount(callbackData.getUserFeeAmount());
            transaction.setDiscountAmount(callbackData.getDiscountAmount());
            
            // Convert server_time từ milliseconds sang LocalDateTime
            if (callbackData.getServerTime() != null) {
                transaction.setPaidAt(LocalDateTime.ofInstant(
                        Instant.ofEpochMilli(callbackData.getServerTime()),
                        ZoneId.systemDefault()
                ));
            }
            
            transactionRepository.save(transaction);
            log.info("Updated transaction on callback: {}", callbackData.getAppTransId());
            
        } catch (Exception e) {
            log.error("Error updating transaction on callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update transaction", e);
        }
    }
    
    @Override
    public QueryOrderResponse queryOrderStatus(QueryOrderRequest request) {
        try {
            String appTransId = request.getAppTransId();
            
            log.info("Querying order status - AppTransId: {}", appTransId);
            
            // Tạo HMAC input theo format: app_id|app_trans_id|key1
            String hmacInput = String.format("%d|%s|%s",
                    zaloPayConfig.getAppId(),
                    appTransId,
                    zaloPayConfig.getKey1()
            );
            
            // Tạo MAC
            String mac = ZaloPayHMACUtil.computeHmacSHA256(hmacInput, zaloPayConfig.getKey1());
            
            log.debug("Query MAC Input: {}", hmacInput);
            
            // Build request gửi tới ZaloPay
            ZaloPayQueryRequest zaloPayRequest = ZaloPayQueryRequest.builder()
                    .appId(zaloPayConfig.getAppId())
                    .appTransId(appTransId)
                    .mac(mac)
                    .build();
            
            // Gọi API ZaloPay
            ZaloPayQueryResponse zaloPayResponse = callZaloPayQueryOrderAPI(zaloPayRequest);
            
            // Cập nhật transaction trong database nếu có thay đổi
            updateTransactionFromQuery(appTransId, zaloPayResponse);
            
            // Xử lý response
            return buildQueryOrderResponse(appTransId, zaloPayResponse);
            
        } catch (Exception e) {
            log.error("Error querying order status: {}", e.getMessage(), e);
            return QueryOrderResponse.builder()
                    .appTransId(request.getAppTransId())
                    .status("ERROR")
                    .message("Lỗi truy vấn trạng thái: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Gọi ZaloPay Query Order API
     */
    private ZaloPayQueryResponse callZaloPayQueryOrderAPI(ZaloPayQueryRequest request) {
        try {
            // Sử dụng application/x-www-form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Convert request object sang form data
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("app_id", String.valueOf(request.getAppId()));
            formData.add("app_trans_id", request.getAppTransId());
            formData.add("mac", request.getMac());
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);
            
            log.info("Calling ZaloPay Query API: {}", zaloPayConfig.getQueryOrderUrl());
            
            ResponseEntity<ZaloPayQueryResponse> response = restTemplate.exchange(
                    zaloPayConfig.getQueryOrderUrl(),
                    HttpMethod.POST,
                    entity,
                    ZaloPayQueryResponse.class
            );
            
            ZaloPayQueryResponse responseBody = response.getBody();
            
            log.info("ZaloPay Query API response - ReturnCode: {}, Message: {}", 
                    responseBody != null ? responseBody.getReturnCode() : null,
                    responseBody != null ? responseBody.getReturnMessage() : null);
            
            return responseBody;
            
        } catch (RestClientException e) {
            log.error("Error calling ZaloPay Query API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call ZaloPay Query API", e);
        }
    }
    
    /**
     * Build QueryOrderResponse từ ZaloPay response
     */
    private QueryOrderResponse buildQueryOrderResponse(String appTransId, ZaloPayQueryResponse zaloPayResponse) {
        if (zaloPayResponse == null) {
            return QueryOrderResponse.builder()
                    .appTransId(appTransId)
                    .status("ERROR")
                    .message("Không nhận được response từ ZaloPay")
                    .build();
        }
        
        // Map return_code sang status
        String status;
        switch (zaloPayResponse.getReturnCode()) {
            case 1:
                status = "SUCCESS";
                break;
            case 2:
                status = "FAILED";
                break;
            case 3:
                status = "PENDING";
                break;
            default:
                status = "UNKNOWN";
        }
        
        return QueryOrderResponse.builder()
                .appTransId(appTransId)
                .zpTransId(zaloPayResponse.getZpTransId())
                .status(status)
                .message(zaloPayResponse.getReturnMessage())
                .amount(zaloPayResponse.getAmount())
                .discountAmount(zaloPayResponse.getDiscountAmount())
                .isProcessing(zaloPayResponse.getIsProcessing())
                .errorCode(zaloPayResponse.getSubReturnCode())
                .build();
    }
    
    /**
     * Cập nhật transaction từ query response
     */
    private void updateTransactionFromQuery(String appTransId, ZaloPayQueryResponse queryResponse) {
        try {
            if (queryResponse == null || queryResponse.getReturnCode() != 1) {
                return; // Không update nếu không thành công
            }
            
            ZaloPayTransaction transaction = transactionRepository
                    .findByAppTransId(appTransId)
                    .orElse(null);
            
            if (transaction == null) {
                log.warn("Transaction not found for query update: {}", appTransId);
                return;
            }
            
            // Chỉ update nếu status hiện tại là PENDING
            if (transaction.getStatus() == ZaloPayTransaction.TransactionStatus.PENDING) {
                transaction.setZpTransId(queryResponse.getZpTransId());
                transaction.setStatus(ZaloPayTransaction.TransactionStatus.SUCCESS);
                transaction.setDiscountAmount(queryResponse.getDiscountAmount());
                transaction.setPaidAt(LocalDateTime.now());
                
                transactionRepository.save(transaction);
                log.info("Updated transaction from query: {}", appTransId);
            }
            
        } catch (Exception e) {
            log.error("Error updating transaction from query: {}", e.getMessage(), e);
            // Không throw exception để không block query response
        }
    }
    
    @Override
    public GetBankListResponse getBankList() {
        try {
            log.info("Getting bank list from ZaloPay");
            
            // Lấy thời gian hiện tại (milliseconds)
            long reqTime = System.currentTimeMillis();
            
            // Tạo HMAC input theo format: appid|reqtime
            String hmacInput = String.format("%d|%d",
                    zaloPayConfig.getAppId(),
                    reqTime
            );
            
            // Tạo MAC
            String mac = ZaloPayHMACUtil.computeHmacSHA256(hmacInput, zaloPayConfig.getKey1());
            
            log.debug("GetBankList MAC Input: {}", hmacInput);
            
            // Gọi API ZaloPay
            GetBankListResponse response = callZaloPayGetBankListAPI(reqTime, mac);
            
            if (response != null && response.getReturnCode() != null && response.getReturnCode() == 1) {
                log.info("Get bank list successfully - Total PMCs: {}",
                        response.getBanks() != null ? response.getBanks().size() : 0);
            } else {
                log.warn("Get bank list failed - Code: {}, Message: {}",
                        response != null ? response.getReturnCode() : null,
                        response != null ? response.getReturnMessage() : null);
            }
            
            return response;
            
        } catch (Exception e) {
            log.error("❌ Error getting bank list: {}", e.getMessage(), e);
            return GetBankListResponse.builder()
                    .returnCode(0)
                    .returnMessage("Lỗi lấy danh sách ngân hàng: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Gọi ZaloPay Get Bank List API
     */
    private GetBankListResponse callZaloPayGetBankListAPI(long reqTime, String mac) {
        try {
            // Sử dụng application/x-www-form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Convert request object sang form data
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("appid", String.valueOf(zaloPayConfig.getAppId()));
            formData.add("reqtime", String.valueOf(reqTime));
            formData.add("mac", mac);
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);
            
            String getBankListUrl = zaloPayConfig.getGetBankListUrl();
            log.info("Calling ZaloPay Get Bank List API: {}", getBankListUrl);
            
            ResponseEntity<GetBankListResponse> response = restTemplate.exchange(
                    getBankListUrl,
                    HttpMethod.POST,
                    entity,
                    GetBankListResponse.class
            );
            
            GetBankListResponse responseBody = response.getBody();
            
            log.info("ZaloPay Get Bank List API response - ReturnCode: {}, Message: {}", 
                    responseBody != null ? responseBody.getReturnCode() : null,
                    responseBody != null ? responseBody.getReturnMessage() : null);
            
            return responseBody;
            
        } catch (RestClientException e) {
            log.error("Error calling ZaloPay Get Bank List API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call ZaloPay Get Bank List API", e);
        }
    }
}
