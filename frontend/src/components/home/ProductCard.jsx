import React from "react";
import PropTypes from "prop-types";
import { Rate, Progress } from "antd";

/**
 * Product Card Component
 * Reusable card for displaying product information
 */
const ProductCard = ({
  product,
  onProductClick,
  formatPrice,
  showProgress = false,
}) => {
  return (
    <div
      className="product-card"
      onClick={() => onProductClick(product.id)}
      role="button"
      tabIndex={0}
    >
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {product.badge && <div className="product-badge">{product.badge}</div>}
        {product.discount > 0 && (
          <div className="product-discount">-{product.discount}%</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <Rate
            disabled
            defaultValue={product.rating}
            style={{ fontSize: 14 }}
          />
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-price-wrapper">
          <span className="product-price">
            {formatPrice(product.price || product.salePrice)}
          </span>
          {(product.originalPrice ||
            (product.salePrice && product.originalPrice)) && (
            <span className="product-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {showProgress &&
        product.sold !== undefined &&
        product.stock !== undefined ? (
          <div className="stock-progress">
            <Progress
              percent={Math.round(
                (product.sold / (product.sold + product.stock)) * 100
              )}
              status="active"
              strokeColor="#ee4d2d"
              format={(percent) => `Đã bán ${product.sold}`}
            />
          </div>
        ) : (
          product.sold !== undefined && (
            <div className="product-sold">
              <span>Đã bán {product.sold.toLocaleString()}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number,
    salePrice: PropTypes.number,
    originalPrice: PropTypes.number,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.number.isRequired,
    discount: PropTypes.number,
    badge: PropTypes.string,
    sold: PropTypes.number,
    stock: PropTypes.number,
  }).isRequired,
  onProductClick: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired,
  showProgress: PropTypes.bool,
};

export default ProductCard;
