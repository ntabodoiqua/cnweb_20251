import { useState, memo, useCallback } from "react";
import { BranchesOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import VariantsManager from "./VariantsManager";
import styles from "./ProductVariantsSection.module.css";

const ProductVariantsSection = memo(
  ({ variants, productId, categoryId, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    return (
      <div className={styles.variantsSection}>
        <div className={styles.sectionHeader} onClick={toggleExpand}>
          <div className={styles.headerLeft}>
            <BranchesOutlined className={styles.icon} />
            <h3 className={styles.title}>Quản lý biến thể</h3>
            <span className={styles.badge}>
              {variants?.length || 0} biến thể
            </span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.expandText}>
              {isExpanded ? "Thu gọn" : "Xem chi tiết"}
            </span>
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        </div>

        {isExpanded && (
          <div className={styles.sectionContent}>
            <VariantsManager
              variants={variants || []}
              productId={productId}
              categoryId={categoryId}
              onUpdate={onUpdate}
            />
          </div>
        )}
      </div>
    );
  }
);

ProductVariantsSection.displayName = "ProductVariantsSection";

export default ProductVariantsSection;
