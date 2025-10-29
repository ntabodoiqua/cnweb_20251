package com.cnweb.payment_service.service;

import com.cnweb.payment_service.dto.zalopay.*;
import com.cnweb.payment_service.entity.ZaloPayTransaction;

/**
 * Service xử lý tích hợp ZaloPay
 */
public interface ZaloPayService {
    
    /**
     * Tạo đơn hàng thanh toán ZaloPay
     * 
     * @param request Thông tin đơn hàng
     * @return Response chứa thông tin đơn hàng và URL thanh toán
     */
    CreateOrderResponse createOrder(CreateOrderRequest request);
    
    /**
     * Xử lý callback từ ZaloPay khi thanh toán hoàn tất
     * 
     * @param callbackRequest Callback data từ ZaloPay
     * @return Response xác nhận đã nhận callback
     */
    String handleCallback(ZaloPayCallbackRequest callbackRequest);
    
    /**
     * Truy vấn trạng thái đơn hàng
     * 
     * @param request Request chứa app_trans_id
     * @return Response chứa trạng thái đơn hàng
     */
    QueryOrderResponse queryOrderStatus(QueryOrderRequest request);
    
    /**
     * Lấy danh sách ngân hàng được hỗ trợ từ ZaloPay
     * 
     * @return Response chứa danh sách các ngân hàng theo từng payment method
     */
    GetBankListResponse getBankList();
    
    /**
     * Gửi thông báo thanh toán thành công
     * 
     * @param transaction Transaction đã thanh toán thành công
     */
    void sendPaymentSuccessNotification(ZaloPayTransaction transaction);
    
    /**
     * Gửi thông báo thanh toán thất bại
     * 
     * @param transaction Transaction thất bại
     * @param failureReason Lý do thất bại
     */
    void sendPaymentFailedNotification(ZaloPayTransaction transaction, String failureReason);
}
