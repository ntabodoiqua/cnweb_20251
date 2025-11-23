package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.response.InventoryStockResponse;
import com.vdt2025.product_service.enums.InventoryStatus;
import com.vdt2025.product_service.exception.AppException;

/**
 * Service interface cho quản lý tồn kho (Inventory Management)
 * 
 * Áp dụng Single Responsibility Principle:
 * - Tách biệt logic inventory khỏi ProductService
 * - Xử lý tất cả các thao tác liên quan đến stock: reserve, confirm, release, adjust
 * - Đảm bảo data consistency với proper locking và transaction management
 * 
 * Flow chuẩn cho e-commerce:
 * 1. Customer places order -> reserveStock() (tăng reserved)
 * 2. Payment success -> confirmSale() (trừ cả onHand và reserved)
 * 3. Payment failed/timeout -> releaseReservation() (giảm reserved, giữ nguyên onHand)
 * 4. Seller adjusts stock -> adjustStock() (admin/seller điều chỉnh)
 * 5. Product return -> increaseStock() (hoàn hàng)
 */
public interface InventoryService {

    /**
     * Lấy thông tin tồn kho của variant
     * 
     * @param variantId ID của product variant
     * @return InventoryStockResponse chứa thông tin onHand, reserved, available
     */
    InventoryStockResponse getInventoryStock(String variantId);

    /**
     * Giữ chỗ hàng khi customer đặt hàng (chưa thanh toán)
     * Sử dụng Pessimistic Locking để đảm bảo atomic operation
     * 
     * Flow:
     * 1. Lock inventory row (SELECT FOR UPDATE)
     * 2. Check available stock (onHand - reserved >= quantity)
     * 3. Increase reserved quantity
     * 4. Save and release lock
     * 
     * @param variantId ID của product variant
     * @param quantity Số lượng cần reserve
     * @throws AppException với ErrorCode.OUT_OF_STOCK nếu không đủ hàng
     * @throws AppException với ErrorCode.INVENTORY_STOCK_NOT_FOUND nếu không tìm thấy inventory
     */
    void reserveStock(String variantId, Integer quantity);

    /**
     * Xác nhận bán hàng khi thanh toán thành công
     * Trừ cả quantityOnHand và quantityReserved
     * 
     * Flow:
     * 1. Lock inventory row
     * 2. Check reserved >= quantity (must have reserved before)
     * 3. Decrease both onHand and reserved
     * 4. Save and release lock
     * 
     * @param variantId ID của product variant
     * @param quantity Số lượng confirm
     * @throws AppException nếu reserved không đủ hoặc inventory không tồn tại
     */
    void confirmSale(String variantId, Integer quantity);

    /**
     * Xả hàng đã giữ chỗ khi đơn hàng bị hủy hoặc timeout
     * Chỉ giảm quantityReserved, giữ nguyên quantityOnHand
     * 
     * @param variantId ID của product variant
     * @param quantity Số lượng release
     * @throws AppException nếu reserved không đủ
     */
    void releaseReservation(String variantId, Integer quantity);

    /**
     * Điều chỉnh tồn kho (Admin/Seller)
     * Set cứng quantityOnHand về giá trị mới
     * Validate: newQuantity phải >= quantityReserved
     * 
     * @param variantId ID của product variant
     * @param newQuantity Số lượng mới (absolute value, không phải delta)
     * @throws AppException nếu newQuantity < reserved hoặc newQuantity < 0
     */
    void adjustStock(String variantId, Integer newQuantity);

    /**
     * Tăng tồn kho (nhập hàng, hoàn hàng)
     * Cộng thêm quantity vào quantityOnHand
     * 
     * @param variantId ID của product variant
     * @param quantity Số lượng tăng (delta, phải > 0)
     */
    void increaseStock(String variantId, Integer quantity);

    /**
     * Giảm tồn kho (seller điều chỉnh giảm, bán offline)
     * Trừ quantity từ quantityOnHand
     * Validate: (onHand - quantity) >= reserved (không được trừ vào phần reserved)
     * 
     * @param variantId ID của product variant
     * @param quantity Số lượng giảm (delta, phải > 0)
     * @throws AppException với ErrorCode.INSUFFICIENT_STOCK nếu không đủ
     */
    void decreaseStock(String variantId, Integer quantity);

    /**
     * Kiểm tra có đủ stock available không
     * 
     * @param variantId ID của product variant
     * @param quantity Số lượng cần check
     * @return true nếu (onHand - reserved) >= quantity
     */
    boolean hasAvailableStock(String variantId, Integer quantity);

    /**
     * Lấy số lượng available stock (onHand - reserved)
     * 
     * @param variantId ID của product variant
     * @return Số lượng available, hoặc 0 nếu không tìm thấy
     */
    Integer getAvailableStock(String variantId);

    /**
     * Kiểm tra số lượng còn lại của variant có phải gần hết không
     * Khi available stock <= 10% của onHand
     */
    boolean isLowStock(String variantId);

    /**
     * Tạo inventory stock mới cho variant
     * Thường được gọi khi tạo variant mới
     * 
     * @param variantId ID của product variant
     * @param initialQuantity Số lượng ban đầu
     * @return InventoryStockResponse
     */
    InventoryStockResponse createInventoryStock(String variantId, Integer initialQuantity);
}
