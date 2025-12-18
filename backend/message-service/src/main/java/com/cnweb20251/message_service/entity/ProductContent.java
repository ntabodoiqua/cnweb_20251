package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Embedded document chứa thông tin sản phẩm được chia sẻ trong tin nhắn.
 * Dữ liệu được lấy từ product-service và lưu snapshot tại thời điểm gửi.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductContent {

    /**
     * ID của sản phẩm từ product-service.
     */
    private String productId;

    /**
     * Tên sản phẩm.
     */
    private String productName;

    /**
     * Mô tả ngắn gọn.
     */
    private String description;

    /**
     * Giá sản phẩm.
     */
    private BigDecimal price;

    /**
     * Giá gốc (trước khi giảm giá, nếu có).
     */
    private BigDecimal originalPrice;

    /**
     * Đơn vị tiền tệ.
     */
    @Builder.Default
    private String currency = "VND";

    /**
     * URL hình ảnh đại diện của sản phẩm.
     */
    private String imageUrl;

    /**
     * Danh sách URL các hình ảnh khác (nếu cần hiển thị nhiều hình).
     */
    private List<String> imageUrls;

    /**
     * ID của shop bán sản phẩm.
     */
    private String shopId;

    /**
     * Tên shop bán sản phẩm.
     */
    private String shopName;

    /**
     * Trạng thái sản phẩm (còn hàng, hết hàng, v.v.).
     */
    private ProductStatus status;

    /**
     * Số lượng đã bán.
     */
    private Integer soldCount;

    /**
     * Điểm đánh giá trung bình.
     */
    private Double rating;

    /**
     * Số lượng đánh giá.
     */
    private Integer ratingCount;

    /**
     * URL deeplink đến trang chi tiết sản phẩm.
     */
    private String productUrl;

    /**
     * Thông tin variant được chọn (nếu có).
     */
    private ProductVariant selectedVariant;

    /**
     * Text ghi chú thêm khi chia sẻ sản phẩm.
     */
    private String note;
}
