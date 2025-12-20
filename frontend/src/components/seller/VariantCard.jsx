import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DownOutlined, RightOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Tag, Checkbox, Switch, Tooltip } from "antd";
import styles from "./VariantsManager.module.css";

const VariantCard = memo(
  ({
    variant,
    productId,
    isExpanded,
    isSelected,
    onToggleExpand,
    onToggleStatus,
    onSelect,
  }) => {
    const navigate = useNavigate();
    const handleToggle = useCallback(() => {
      onToggleExpand(variant.id);
    }, [variant.id, onToggleExpand]);

    const handleStatusToggle = useCallback(
      (checked) => {
        onToggleStatus(variant.id, checked);
      },
      [variant.id, onToggleStatus]
    );

    const handleSelect = useCallback(
      (e) => {
        onSelect(variant.id, e.target.checked);
      },
      [variant.id, onSelect]
    );

    const handleViewDetail = useCallback(
      (e) => {
        e.stopPropagation();
        navigate(`/seller/products/${productId}/variants/${variant.id}`);
      },
      [navigate, productId, variant.id]
    );

    return (
      <div
        className={`${styles.variantCard} ${
          !variant.active ? styles.inactiveVariant : ""
        }`}
      >
        {/* Main Row */}
        <div className={styles.variantRow}>
          <Checkbox
            checked={isSelected}
            onChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
          />
          <button className={styles.expandBtn} onClick={handleToggle}>
            {isExpanded ? <DownOutlined /> : <RightOutlined />}
          </button>

          <div className={styles.variantInfo}>
            {/* View Mode Only */}
            <div className={styles.variantName}>
              {variant.variantName}
              {!variant.active && (
                <Tag color="default" style={{ marginLeft: "8px" }}>
                  Ngừng bán
                </Tag>
              )}
            </div>
            <div className={styles.variantMeta}>
              <span className={styles.sku}>{variant.sku}</span>
              <span className={styles.price}>
                ₫{variant.price?.toLocaleString("vi-VN")}
              </span>
              {variant.originalPrice !== variant.price && (
                <span className={styles.originalPrice}>
                  ₫{variant.originalPrice?.toLocaleString("vi-VN")}
                </span>
              )}
              <span
                className={
                  variant.availableStock < 10 ? styles.lowStock : styles.inStock
                }
              >
                Kho: {variant.availableStock}
              </span>
              <span className={styles.sold}>
                Đã bán: {variant.soldQuantity}
              </span>
              {variant.active ? (
                <Tag color="success">Đang bán</Tag>
              ) : (
                <Tag color="default">Ngừng bán</Tag>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <div className={styles.statusSwitch}>
              <span>{variant.active ? "Đang bán" : "Ngừng bán"}</span>
              <Switch
                checked={variant.active}
                onChange={handleStatusToggle}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
            <Tooltip title="Xem chi tiết & chỉnh sửa">
              <Button
                size="small"
                type="primary"
                icon={<EyeOutlined />}
                onClick={handleViewDetail}
              >
                Chi tiết
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Expanded Attributes Section */}
        {isExpanded && (
          <div className={styles.expandedContent}>
            <div className={styles.attributesHeader}>
              <h5>Thuộc tính biến thể</h5>
            </div>

            <div className={styles.attributesList}>
              {variant.attributeValues && variant.attributeValues.length > 0 ? (
                variant.attributeValues.map((attr) => (
                  <div key={attr.id} className={styles.attributeItem}>
                    <Tag color="blue" className={styles.attributeTag}>
                      {attr.attributeName}: {attr.value}
                    </Tag>
                  </div>
                ))
              ) : (
                <div className={styles.emptyAttributes}>
                  Chưa có thuộc tính nào. Bấm "Chi tiết" để chỉnh sửa.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

VariantCard.displayName = "VariantCard";

export default VariantCard;
