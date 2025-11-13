import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { EyeOutlined } from "@ant-design/icons";
import ProductCard from "./ProductCard";

/**
 * Recently Viewed Products Section Component
 * Displays products the user has viewed recently
 */
const RecentlyViewed = ({ formatPrice, onProductClick }) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Load recently viewed products from localStorage
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem("recentlyViewed");
        if (stored) {
          const products = JSON.parse(stored);
          setRecentProducts(products.slice(0, 8)); // Show max 8 products
        }
      } catch (error) {
        console.error("Error loading recently viewed:", error);
      }
    };

    loadRecentlyViewed();
  }, []);

  // Don't render if no recently viewed products
  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="section recently-viewed-section">
      <div className="section-header">
        <div className="section-title">
          <EyeOutlined className="icon" />
          <h2>Đã Xem Gần Đây</h2>
        </div>
      </div>
      <div className="products-grid">
        {recentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </section>
  );
};

RecentlyViewed.propTypes = {
  formatPrice: PropTypes.func.isRequired,
  onProductClick: PropTypes.func.isRequired,
};

export default RecentlyViewed;

// Utility function to add product to recently viewed
export const addToRecentlyViewed = (product) => {
  try {
    const stored = localStorage.getItem("recentlyViewed");
    let recentProducts = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    recentProducts = recentProducts.filter((p) => p.id !== product.id);

    // Add to beginning
    recentProducts.unshift(product);

    // Keep only last 20
    recentProducts = recentProducts.slice(0, 20);

    localStorage.setItem("recentlyViewed", JSON.stringify(recentProducts));
  } catch (error) {
    console.error("Error saving to recently viewed:", error);
  }
};
