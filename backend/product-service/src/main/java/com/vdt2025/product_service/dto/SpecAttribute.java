package com.vdt2025.product_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO để định nghĩa một thuộc tính spec với đầy đủ thông tin
 * Support đa ngôn ngữ (i18n) cho các key động
 * 
 * Example:
 * {
 *   "key": "stereoSpeakers",
 *   "value": "yes",
 *   "labelEn": "Stereo Speakers",
 *   "labelVi": "Loa Stereo",
 *   "dataType": "boolean",
 *   "unit": null
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SpecAttribute {
    
    /**
     * Key kỹ thuật của spec (dùng cho backend/database)
     * VD: "stereoSpeakers", "screenSize", "batteryCapacity"
     */
    @NotBlank(message = "Spec key cannot be blank")
    String key;
    
    /**
     * Giá trị của spec
     * Có thể là String, Number, Boolean tùy theo dataType
     */
    Object value;
    
    /**
     * Label tiếng Anh cho spec này
     * VD: "Stereo Speakers", "Screen Size"
     */
    @NotBlank(message = "Label English cannot be blank")
    String labelEn;
    
    /**
     * Label tiếng Việt cho spec này
     * VD: "Loa Stereo", "Kích thước màn hình"
     */
    @NotBlank(message = "Label Vietnamese cannot be blank")
    String labelVi;
    
    /**
     * Kiểu dữ liệu của giá trị
     * Các giá trị hợp lệ: "string", "number", "boolean"
     */
    @NotBlank(message = "Data type cannot be blank")
    String dataType; // string, number, boolean
    
    /**
     * Đơn vị đo lường (nếu có)
     * VD: "inch", "mAh", "GB", "MP", "Hz"
     * Null nếu không có đơn vị
     */
    String unit;
    
    /**
     * Thứ tự hiển thị (optional)
     * Số càng nhỏ hiển thị càng trước
     */
    @Builder.Default
    Integer displayOrder = 999;
    
    /**
     * Có hiển thị trong danh sách sản phẩm hay không
     * True: hiển thị làm điểm nổi bật
     * False: chỉ hiển thị trong chi tiết sản phẩm
     */
    @Builder.Default
    Boolean showInList = false;
    
    /**
     * Group/Category của spec này
     * VD: "Display", "Performance", "Camera", "Battery"
     * Dùng để nhóm các specs liên quan khi hiển thị
     */
    String group;
    
    /**
     * Label group bằng tiếng Anh
     */
    String groupLabelEn;
    
    /**
     * Label group bằng tiếng Việt
     */
    String groupLabelVi;
}
