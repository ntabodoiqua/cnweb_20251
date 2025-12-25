package com.vdt2025.product_service.util;

import com.vdt2025.product_service.dto.SpecAttribute;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class để xử lý specs data
 * Bao gồm validation, transformation và formatting
 */
@Slf4j
@UtilityClass
public class SpecsHelper {
    
    private static final Set<String> VALID_DATA_TYPES = Set.of("string", "number", "boolean");
    
    /**
     * Validate specs data structure
     * 
     * @param specs Map của specs cần validate
     * @throws AppException nếu dữ liệu không hợp lệ
     */
    public static void validateSpecs(Map<String, SpecAttribute> specs) {
        if (specs == null || specs.isEmpty()) {
            return;
        }
        
        for (Map.Entry<String, SpecAttribute> entry : specs.entrySet()) {
            String key = entry.getKey();
            SpecAttribute spec = entry.getValue();
            
            // Validate key matches
            if (!key.equals(spec.getKey())) {
                throw new AppException(ErrorCode.INVALID_SPEC_DATA);
            }
            
            // Validate dataType
            if (!VALID_DATA_TYPES.contains(spec.getDataType().toLowerCase())) {
                throw new AppException(ErrorCode.INVALID_SPEC_DATA);
            }
            
            // Validate value matches dataType
            validateValueType(spec);
            
            // Validate required fields
            if (spec.getLabelEn() == null || spec.getLabelEn().trim().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_SPEC_DATA);
            }
            
            if (spec.getLabelVi() == null || spec.getLabelVi().trim().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_SPEC_DATA);
            }
        }
    }
    
    /**
     * Validate giá trị phải khớp với dataType
     */
    private static void validateValueType(SpecAttribute spec) {
        Object value = spec.getValue();
        String dataType = spec.getDataType().toLowerCase();
        
        if (value == null) {
            return; // Allow null values
        }
        
        try {
            switch (dataType) {
                case "string":
                    if (!(value instanceof String)) {
                        throw new AppException(ErrorCode.INVALID_SPEC_DATA);
                    }
                    break;
                    
                case "number":
                    // Accept String, Integer, Long, Double, Float, BigDecimal
                    if (value instanceof String) {
                        new BigDecimal((String) value); // Test if parseable
                    } else if (!(value instanceof Number)) {
                        throw new AppException(ErrorCode.INVALID_SPEC_DATA);
                    }
                    break;
                    
                case "boolean":
                    if (value instanceof String) {
                        String strValue = ((String) value).toLowerCase();
                        if (!strValue.equals("true") && !strValue.equals("false") &&
                            !strValue.equals("yes") && !strValue.equals("no")) {
                            throw new AppException(ErrorCode.INVALID_SPEC_DATA);
                        }
                    } else if (!(value instanceof Boolean)) {
                        throw new AppException(ErrorCode.INVALID_SPEC_DATA);
                    }
                    break;
            }
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.INVALID_SPEC_DATA);
        }
    }
    
    /**
     * Normalize giá trị theo dataType
     * Convert các giá trị về định dạng chuẩn
     */
    public static void normalizeSpecs(Map<String, SpecAttribute> specs) {
        if (specs == null || specs.isEmpty()) {
            return;
        }
        
        specs.values().forEach(spec -> {
            Object value = spec.getValue();
            if (value == null) {
                return;
            }
            
            String dataType = spec.getDataType().toLowerCase();
            
            switch (dataType) {
                case "number":
                    if (value instanceof String) {
                        spec.setValue(new BigDecimal((String) value));
                    }
                    break;
                    
                case "boolean":
                    if (value instanceof String) {
                        String strValue = ((String) value).toLowerCase();
                        spec.setValue(strValue.equals("true") || strValue.equals("yes"));
                    }
                    break;
                    
                case "string":
                    // Ensure it's a string
                    if (!(value instanceof String)) {
                        spec.setValue(value.toString());
                    }
                    break;
            }
            
            // Set default displayOrder if not set
            if (spec.getDisplayOrder() == null) {
                spec.setDisplayOrder(999);
            }
            
            // Set default showInList if not set
            if (spec.getShowInList() == null) {
                spec.setShowInList(false);
            }
        });
    }
    
    /**
     * Lọc specs theo language
     * Trả về Map<String, Object> đơn giản cho FE theo ngôn ngữ cụ thể
     * 
     * @param specs Map của specs
     * @param language "en" hoặc "vi"
     * @return Map với key là label theo ngôn ngữ, value là giá trị
     */
    public static Map<String, Object> getSimplifiedSpecs(Map<String, SpecAttribute> specs, String language) {
        if (specs == null || specs.isEmpty()) {
            return Collections.emptyMap();
        }
        
        return specs.entrySet().stream()
            .collect(Collectors.toMap(
                entry -> "vi".equalsIgnoreCase(language) 
                    ? entry.getValue().getLabelVi() 
                    : entry.getValue().getLabelEn(),
                entry -> formatValue(entry.getValue()),
                (v1, v2) -> v1, // In case of duplicate keys, keep first
                LinkedHashMap::new
            ));
    }
    
    /**
     * Format value với unit nếu có
     */
    private static String formatValue(SpecAttribute spec) {
        Object value = spec.getValue();
        if (value == null) {
            return "";
        }
        
        String formattedValue = value.toString();
        
        // Add unit if available
        if (spec.getUnit() != null && !spec.getUnit().trim().isEmpty()) {
            formattedValue += " " + spec.getUnit();
        }
        
        return formattedValue;
    }
    
    /**
     * Nhóm specs theo group
     * Trả về Map với key là group name, value là list specs trong group đó
     */
    public static Map<String, List<SpecAttribute>> groupSpecs(Map<String, SpecAttribute> specs, String language) {
        if (specs == null || specs.isEmpty()) {
            return Collections.emptyMap();
        }
        
        return specs.values().stream()
            .sorted(Comparator.comparing(SpecAttribute::getDisplayOrder))
            .collect(Collectors.groupingBy(
                spec -> {
                    if (spec.getGroup() == null || spec.getGroup().isEmpty()) {
                        return "vi".equalsIgnoreCase(language) ? "Khác" : "Other";
                    }
                    return "vi".equalsIgnoreCase(language) 
                        ? (spec.getGroupLabelVi() != null ? spec.getGroupLabelVi() : spec.getGroup())
                        : (spec.getGroupLabelEn() != null ? spec.getGroupLabelEn() : spec.getGroup());
                },
                LinkedHashMap::new,
                Collectors.toList()
            ));
    }
    
    /**
     * Lấy danh sách specs để hiển thị trong danh sách sản phẩm (highlights)
     */
    public static List<SpecAttribute> getHighlightSpecs(Map<String, SpecAttribute> specs) {
        if (specs == null || specs.isEmpty()) {
            return Collections.emptyList();
        }
        
        return specs.values().stream()
            .filter(spec -> Boolean.TRUE.equals(spec.getShowInList()))
            .sorted(Comparator.comparing(SpecAttribute::getDisplayOrder))
            .collect(Collectors.toList());
    }
}
