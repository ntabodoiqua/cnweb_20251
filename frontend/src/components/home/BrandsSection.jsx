import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { TrophyOutlined } from "@ant-design/icons";

/**
 * Brands Section Component
 * Displays top brands with their logos
 */
const BrandsSection = ({ brands, title = "Thương Hiệu Nổi Bật" }) => {
  const navigate = useNavigate();

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
            onClick={() => navigate(`/brand/${brand.name.toLowerCase()}`)}
            role="button"
            tabIndex={0}
            aria-label={`Thương hiệu ${brand.name}`}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="brand-logo"
              loading="lazy"
            />
            <div className="brand-name">{brand.name}</div>
            <div className="brand-products-count">
              {brand.productsCount} sản phẩm
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

BrandsSection.propTypes = {
  brands: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      logo: PropTypes.string.isRequired,
      productsCount: PropTypes.number.isRequired,
    })
  ).isRequired,
  title: PropTypes.string,
};

export default BrandsSection;
