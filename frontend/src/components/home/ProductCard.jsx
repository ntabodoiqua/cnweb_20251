import React from "react";
import PropTypes from "prop-types";
import { Rate, Progress, Button, message } from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
} from "@ant-design/icons";

/**
 * Product Card Component
 * Reusable card for displaying product information
 */
const ProductCard = ({
  product,
  onProductClick,
  formatPrice,
  showProgress = false,
  onQuickView,
  onAddToCart,
  onAddToWishlist,
}) => {
  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      message.success("Đã thêm vào giỏ hàng!");
    }
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product);
    } else {
      message.success("Đã thêm vào danh sách yêu thích!");
    }
  };

  return (
    <div
      className="product-card"
      onClick={() => onProductClick(product.id)}
      role="button"
      tabIndex={0}
    >
      <div className="product-image-wrapper">
        <img
          src={
            product.thumbnailImage ||
            product.image ||
            "https://via.placeholder.com/300x300?text=No+Image"
          }
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {product.badge && <div className="product-badge">{product.badge}</div>}
        {product.soldCount > 0 && (
          <div className="product-badge sold-badge">
            Đã bán {product.soldCount}
          </div>
        )}
        {!product.active && (
          <div className="product-badge inactive-badge">Ngừng kinh doanh</div>
        )}
        {product.discount > 0 && (
          <div className="product-discount">-{product.discount}%</div>
        )}

        {/* Quick Actions Overlay */}
        <div className="product-quick-actions">
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={handleQuickView}
            className="quick-action-btn"
            title="Xem nhanh"
          />
          <Button
            type="default"
            shape="circle"
            icon={<HeartOutlined />}
            onClick={handleAddToWishlist}
            className="quick-action-btn"
            title="Yêu thích"
          />
          <Button
            type="primary"
            shape="circle"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            className="quick-action-btn"
            title="Thêm vào giỏ"
          />
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="product-short-desc">{product.shortDescription}</p>
        )}

        {/* Rating */}
        <div className="product-rating">
          {product.averageRating ? (
            <>
              <Rate
                disabled
                allowHalf
                defaultValue={product.averageRating || product.rating}
                style={{ fontSize: 14 }}
              />
              <span className="rating-count">
                ({product.ratingCount || product.reviews})
              </span>
            </>
          ) : (
            <span className="no-rating">Chưa có đánh giá</span>
          )}
        </div>

        {/* Price */}
        <div className="product-price-wrapper">
          <span className="product-price">
            {product.minPrice && product.maxPrice
              ? product.minPrice === product.maxPrice
                ? formatPrice(product.minPrice)
                : `${formatPrice(product.minPrice)} - ${formatPrice(
                    product.maxPrice
                  )}`
              : formatPrice(product.price || product.salePrice)}
          </span>
          {(product.originalPrice ||
            (product.salePrice && product.originalPrice)) && (
            <span className="product-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Store and Category Info */}
        <div className="product-meta-info">
          {product.storeName && (
            <span className="store-name" title={product.storeName}>
              <ShoppingCartOutlined /> {product.storeName}
            </span>
          )}
          {product.brandName && (
            <span className="brand-name">• {product.brandName}</span>
          )}
        </div>

        {/* Stock Progress or Sold Count */}
        {showProgress &&
        (product.soldCount !== undefined || product.sold !== undefined) &&
        (product.totalAvailableStock !== undefined ||
          product.stock !== undefined) ? (
          <div className="stock-progress">
            <Progress
              percent={Math.round(
                ((product.soldCount || product.sold) /
                  ((product.soldCount || product.sold) +
                    (product.totalAvailableStock || product.stock))) *
                  100
              )}
              status="active"
              strokeColor="#ee4d2d"
              format={(percent) =>
                `Đã bán ${product.soldCount || product.sold}`
              }
            />
          </div>
        ) : (
          (product.soldCount !== undefined || product.sold !== undefined) && (
            <div className="product-sold">
              <span>
                Đã bán{" "}
                {((product.soldCount ?? product.sold) || 0).toLocaleString()}
              </span>
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
  onQuickView: PropTypes.func,
  onAddToCart: PropTypes.func,
  onAddToWishlist: PropTypes.func,
};

export default ProductCard;
