import React from "react";
import PropTypes from "prop-types";

/**
 * Promotion Banners Component
 * Displays promotional information cards (Free Shipping, Warranty, etc.)
 */
const PromotionBanners = ({ banners }) => {
  return (
    <section className="promotion-banners">
      {banners.map((promo) => (
        <div
          key={promo.id}
          className="promo-card"
          style={{ borderTopColor: promo.color }}
        >
          <span className="promo-icon">{promo.icon}</span>
          <h3 style={{ color: promo.color }}>{promo.title}</h3>
          <p>{promo.subtitle}</p>
        </div>
      ))}
    </section>
  );
};

PromotionBanners.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      icon: PropTypes.node.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PromotionBanners;