import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { TrophyOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import NoImage from "../../assets/NoImages.webp";

/**
 * Brands Section Component
 * Displays top brands with their logos from API
 */
const BrandsSection = ({ brands = [], title = "Thương Hiệu Nổi Bật" }) => {
  const navigate = useNavigate();

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">
            <TrophyOutlined />
          </span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="brands-grid">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="brand-card"
            onClick={() => navigate(`/brand/${brand.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/brand/${brand.id}`);
              }
            }}
            aria-label={`Thương hiệu ${brand.name}`}
          >
            <img
              src={brand.logo || NoImage}
              alt={brand.name}
              className="brand-logo"
              loading="lazy"
              onError={(e) => {
                e.target.src = NoImage;
              }}
            />
            <div className="brand-name">{brand.name}</div>
            {brand.productsCount > 0 && (
              <div className="brand-products-count">
                {brand.productsCount} sản phẩm
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

BrandsSection.propTypes = {
  brands: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      logo: PropTypes.string,
      productsCount: PropTypes.number,
    })
  ),
  title: PropTypes.string,
};

export default BrandsSection;
