import React from "react";
import PropTypes from "prop-types";
import { Modal, Rate, Tag, Button, Space, Divider } from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

/**
 * Quick View Modal Component
 * Allows users to preview product details without leaving the homepage
 */
const QuickViewModal = ({ visible, onClose, product, formatPrice }) => {
  if (!product) return null;

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", product.id);
  };

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality
    console.log("Add to wishlist:", product.id);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="quick-view-modal"
      centered
    >
      <div className="quick-view-content">
        <div className="quick-view-left">
          {/* Product Image */}
          <div className="quick-view-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="quick-view-image"
            />
            {product.discount && (
              <Tag color="red" className="quick-view-discount">
                -{product.discount}%
              </Tag>
            )}
            {product.badge && (
              <Tag color="orange" className="quick-view-badge">
                {product.badge}
              </Tag>
            )}
          </div>
        </div>

        <div className="quick-view-right">
          {/* Product Name */}
          <h2 className="quick-view-title">{product.name}</h2>

          {/* Rating & Reviews */}
          <div className="quick-view-rating">
            <Rate disabled value={product.rating} allowHalf />
            <span className="rating-text">
              {product.rating} ({product.reviews} đánh giá)
            </span>
            {product.sold && (
              <span className="sold-text">| Đã bán {product.sold}</span>
            )}
          </div>

          {/* Price */}
          <div className="quick-view-price-section">
            <div className="quick-view-price">{formatPrice(product.price)}</div>
            {product.originalPrice && (
              <div className="quick-view-original-price">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="quick-view-features">
            <div className="feature-item">
              <TruckOutlined className="feature-icon" />
              <span>Miễn phí vận chuyển</span>
            </div>
            <div className="feature-item">
              <SafetyOutlined className="feature-icon" />
              <span>Bảo hành chính hãng</span>
            </div>
            <div className="feature-item">
              <CheckCircleOutlined className="feature-icon" />
              <span>Hàng chính hãng 100%</span>
            </div>
          </div>

          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="quick-view-stock">
              <span className="stock-label">Tình trạng:</span>
              <span
                className={`stock-value ${
                  product.stock > 0 ? "in-stock" : "out-of-stock"
                }`}
              >
                {product.stock > 0
                  ? `Còn ${product.stock} sản phẩm`
                  : "Hết hàng"}
              </span>
            </div>
          )}

          <Divider />

          {/* Actions */}
          <div className="quick-view-actions">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="add-to-cart-btn"
            >
              Thêm vào giỏ hàng
            </Button>
            <Button
              size="large"
              icon={<HeartOutlined />}
              onClick={handleAddToWishlist}
              className="wishlist-btn"
            >
              Yêu thích
            </Button>
            <Button
              size="large"
              icon={<ShareAltOutlined />}
              className="share-btn"
            >
              Chia sẻ
            </Button>
          </div>

          {/* View Full Details */}
          <Button
            type="link"
            onClick={() => {
              onClose();
              // TODO: Navigate to product detail page
            }}
            className="view-details-link"
          >
            Xem chi tiết sản phẩm →
          </Button>
        </div>
      </div>
    </Modal>
  );
};

QuickViewModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  formatPrice: PropTypes.func.isRequired,
};

export default QuickViewModal;