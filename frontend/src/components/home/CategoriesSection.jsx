import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ShoppingOutlined, RightOutlined } from "@ant-design/icons";

/**
 * Categories Section Component
 * Displays featured product categories
 */
const CategoriesSection = ({ categories, onCategoryClick }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categorySlug) => {
    if (onCategoryClick) {
      onCategoryClick(categorySlug);
    } else {
      navigate(`/category/${categorySlug}`);
    }
  };

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
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category.slug)}
            role="button"
            tabIndex={0}
            aria-label={`Danh mục ${category.name}`}
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
              loading="lazy"
            />
            <div className="category-info">
              <div className="category-name">
                <span>{category.icon}</span>
                {category.name}
              </div>
              <div className="category-count">
                {category.productCount.toLocaleString()} sản phẩm
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

CategoriesSection.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      icon: PropTypes.node,
      productCount: PropTypes.number.isRequired,
    })
  ).isRequired,
  onCategoryClick: PropTypes.func,
};

export default CategoriesSection;