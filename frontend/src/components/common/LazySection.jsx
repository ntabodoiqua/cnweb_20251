import React from "react";
import { Skeleton } from "antd";
import "./LazySection.css";

/**
 * LazySection Component
 * Wrapper component để lazy load các section khi người dùng cuộn đến
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung section
 * @param {number} props.minHeight - Chiều cao tối thiểu của placeholder (default: 300)
 * @param {boolean} props.isLoading - Đang loading data hay không
 * @param {boolean} props.isLoaded - Data đã load xong chưa
 * @param {string} props.className - Class CSS bổ sung
 * @param {Object} props.skeletonProps - Props cho Skeleton component
 */
const LazySection = ({
  children,
  minHeight = 300,
  isLoading = false,
  isLoaded = false,
  className = "",
  skeletonProps = {},
}) => {
  const showSkeleton = isLoading || !isLoaded;

  return (
    <div
      className={`lazy-section ${className} ${
        isLoaded ? "lazy-section--loaded" : ""
      }`}
      style={{ minHeight: isLoaded ? "auto" : minHeight }}
    >
      {isLoaded ? (
        <div className="lazy-section__content">{children}</div>
      ) : (
        showSkeleton && (
          <div className="lazy-section__placeholder">
            <Skeleton active paragraph={{ rows: 4 }} {...skeletonProps} />
          </div>
        )
      )}
    </div>
  );
};

export default LazySection;
