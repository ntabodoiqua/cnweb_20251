import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button, Empty, Skeleton } from "antd";
import { ShoppingOutlined, RightOutlined } from "@ant-design/icons";
import NoImage from "../../assets/NoImages.webp";

/**
 * Categories Section Component
 * Displays featured product categories from API
 */
const CategoriesSection = ({
  categories = [],
  onCategoryClick,
  loading = false,
}) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <div className="categories-grid">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="category-card">
          <Skeleton.Image active style={{ width: "100%", height: 150 }} />
          <div className="category-info">
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </div>
        </div>
      ))}
    </div>
  );

  // Render empty state
  const renderEmpty = () => (
    <Empty
      description="Chưa có danh mục nào"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  return (
    <section className="section">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">
            <ShoppingOutlined />
          </span>
          <h2>Danh Mục Nổi Bật</h2>
        </div>
        <Button
          type="default"
          className="view-all-btn"
          onClick={() => navigate("/categories")}
        >
          Xem tất cả
          <RightOutlined />
        </Button>
      </div>

      {loading ? (
        renderSkeleton()
      ) : categories.length === 0 ? (
        renderEmpty()
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCategoryClick(category.id);
                }
              }}
              aria-label={`Danh mục ${category.name}`}
            >
              <img
                src={category.image || NoImage}
                alt={category.name}
                className="category-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = NoImage;
                }}
              />
              <div className="category-info">
                <div className="category-name">
                  <span>{category.icon}</span>
                  {category.name}
                </div>
                <div className="category-count">
                  {(category.productCount || 0).toLocaleString()} sản phẩm
                </div>
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <div className="category-subcategories">
                      {category.subCategories.length} danh mục con
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

CategoriesSection.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
      icon: PropTypes.node,
      productCount: PropTypes.number,
      subCategories: PropTypes.array,
    })
  ),
  onCategoryClick: PropTypes.func,
  loading: PropTypes.bool,
};

export default CategoriesSection;
