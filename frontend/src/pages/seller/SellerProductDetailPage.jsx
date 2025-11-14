import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  TagOutlined,
  StarOutlined,
  EyeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { message, Modal } from "antd";
import { getProductDetailApi } from "../../util/api";
import styles from "./SellerProductDetailPage.module.css";

/**
 * SellerProductDetailPage - Trang chi tiết sản phẩm của người bán
 */
const SellerProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await getProductDetailApi(productId);

      if (response && response.result) {
        const productData = response.result;
        setProduct(productData);

        // Set primary image as default selected
        const primaryImage = productData.images?.find((img) => img.isPrimary);
        setSelectedImage(
          primaryImage?.imageUrl || productData.images?.[0]?.imageUrl || null
        );
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      message.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    message.info("Chức năng chỉnh sửa đang được phát triển");
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        message.success("Xóa sản phẩm thành công!");
        navigate(-1);
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingOutlined style={{ fontSize: 48, color: "#ee4d2d" }} />
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.loadingContainer}>
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeftOutlined />
          Quay lại
        </button>
        <div className={styles.headerActions}>
          <button className={styles.editBtn} onClick={handleEdit}>
            <EditOutlined />
            Chỉnh sửa
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            <DeleteOutlined />
            Xóa
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        {/* Left Column - Images */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            <img
              src={selectedImage || "https://via.placeholder.com/500"}
              alt={product.name}
              className={styles.mainImage}
            />
          </div>
          <div className={styles.thumbnailList}>
            {product.images && product.images.length > 0 ? (
              product.images.map((image) => (
                <div
                  key={image.id}
                  className={`${styles.thumbnail} ${
                    selectedImage === image.imageUrl
                      ? styles.activeThumbnail
                      : ""
                  }`}
                  onClick={() => setSelectedImage(image.imageUrl)}
                >
                  <img
                    src={image.imageUrl}
                    alt={`Thumbnail ${image.displayOrder}`}
                  />
                  {image.isPrimary && (
                    <div className={styles.primaryBadge}>Chính</div>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.noImages}>Chưa có hình ảnh</p>
            )}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className={styles.infoSection}>
          {/* Product Name & Status */}
          <div className={styles.productHeader}>
            <h1 className={styles.productName}>{product.name}</h1>
            <span
              className={`${styles.statusBadge} ${
                product.active ? styles.statusActive : styles.statusInactive
              }`}
            >
              {product.active ? (
                <>
                  <CheckCircleOutlined /> Đang bán
                </>
              ) : (
                <>
                  <CloseCircleOutlined /> Ngừng bán
                </>
              )}
            </span>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <StarOutlined className={styles.statIcon} />
              <span>
                {product.averageRating
                  ? `${product.averageRating.toFixed(1)} (${
                      product.ratingCount
                    } đánh giá)`
                  : "Chưa có đánh giá"}
              </span>
            </div>
            <div className={styles.statItem}>
              <EyeOutlined className={styles.statIcon} />
              <span>{product.viewCount || 0} lượt xem</span>
            </div>
            <div className={styles.statItem}>
              <TagOutlined className={styles.statIcon} />
              <span>{product.soldCount || 0} đã bán</span>
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.priceSection}>
            <div className={styles.priceLabel}>Giá bán:</div>
            <div className={styles.priceValue}>
              ₫{product.minPrice?.toLocaleString("vi-VN")}
              {product.maxPrice > product.minPrice &&
                ` - ₫${product.maxPrice?.toLocaleString("vi-VN")}`}
            </div>
          </div>

          {/* Short Description */}
          <div className={styles.infoBlock}>
            <h3 className={styles.blockTitle}>Mô tả ngắn</h3>
            <p className={styles.shortDesc}>{product.shortDescription}</p>
          </div>

          {/* Category & Brand */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Danh mục Platform:</span>
              <span className={styles.infoValue}>
                {product.category?.name || "-"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thương hiệu:</span>
              <span className={styles.infoValue}>
                {product.brand?.name || "-"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tổng tồn kho:</span>
              <span className={styles.infoValue}>
                {product.totalStock || 0} sản phẩm
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ngày tạo:</span>
              <span className={styles.infoValue}>
                {new Date(product.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Store Info */}
          <div className={styles.storeCard}>
            <div className={styles.storeHeader}>
              <ShopOutlined className={styles.storeIcon} />
              <span className={styles.storeLabel}>Thông tin cửa hàng</span>
            </div>
            <div className={styles.storeBody}>
              {product.store?.logoUrl && (
                <img
                  src={product.store.logoUrl}
                  alt={product.store.storeName}
                  className={styles.storeLogo}
                />
              )}
              <div className={styles.storeInfo}>
                <h4 className={styles.storeName}>{product.store?.storeName}</h4>
                <p className={styles.storeDesc}>
                  {product.store?.storeDescription}
                </p>
                <div className={styles.storeContact}>
                  <span>📧 {product.store?.contactEmail}</span>
                  <span>📞 {product.store?.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className={styles.descriptionSection}>
        <h2 className={styles.sectionTitle}>Mô tả chi tiết</h2>
        <div className={styles.descriptionContent}>
          {product.description || "Chưa có mô tả chi tiết"}
        </div>
      </div>

      {/* Variants Section */}
      <div className={styles.variantsSection}>
        <h2 className={styles.sectionTitle}>
          Phân loại hàng ({product.variants?.length || 0})
        </h2>
        <div className={styles.variantsTable}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Phân loại</th>
                <th>Thuộc tính</th>
                <th>Giá bán</th>
                <th>Giá gốc</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td>
                      <code className={styles.sku}>{variant.sku}</code>
                    </td>
                    <td>
                      <strong>{variant.variantName}</strong>
                    </td>
                    <td>
                      <div className={styles.attributes}>
                        {variant.attributeValues?.map((attr) => (
                          <span key={attr.id} className={styles.attributeTag}>
                            {attr.attributeName}: {attr.value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={styles.price}>
                        ₫{variant.price?.toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td>
                      <span className={styles.originalPrice}>
                        ₫{variant.originalPrice?.toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          variant.stockQuantity < 10
                            ? styles.lowStock
                            : styles.inStock
                        }
                      >
                        {variant.stockQuantity}
                      </span>
                    </td>
                    <td>{variant.soldQuantity}</td>
                    <td>
                      {variant.active ? (
                        <span className={styles.variantActive}>
                          <CheckCircleOutlined /> Hoạt động
                        </span>
                      ) : (
                        <span className={styles.variantInactive}>
                          <CloseCircleOutlined /> Ngừng
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noVariants}>
                    Chưa có phân loại hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetailPage;
