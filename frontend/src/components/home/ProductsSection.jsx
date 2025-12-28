import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import ProductCard from "./ProductCard";

/**
 * Products Section Component
 * Reusable section for displaying product grids with header
 */
const ProductsSection = ({
  title,
  subtitle,
  icon,
  products,
  onProductClick,
  formatPrice,
  showProgress = false,
  showViewAll = false,
  viewAllLink = "/products",
  viewAllText = "Xem thêm",
}) => {
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">{icon}</span>
          <div className="title-content">
            <h2>{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
        {showViewAll && (
          <Button
            type="default"
            className="view-all-btn"
            onClick={() => navigate(viewAllLink)}
          >
            {viewAllText}
            <RightOutlined />
          </Button>
        )}
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            formatPrice={formatPrice}
            showProgress={showProgress}
          />
        ))}
      </div>
    </section>
  );
};

ProductsSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node.isRequired,
  products: PropTypes.array.isRequired,
  onProductClick: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired,
  showProgress: PropTypes.bool,
  showViewAll: PropTypes.bool,
  viewAllLink: PropTypes.string,
  viewAllText: PropTypes.string,
};

export default ProductsSection;
