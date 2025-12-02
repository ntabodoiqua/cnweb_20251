import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Input,
  List,
  Avatar,
  Spin,
  Empty,
  Button,
  Tag,
  Rate,
} from "antd";
import {
  SearchOutlined,
  ShoppingOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { getPublicProductsApi } from "../../util/api";
import styles from "./PickerModal.module.css";

const ProductPickerModal = ({
  visible,
  onClose,
  onSelect,
  storeId,
  title = "Chọn sản phẩm để gửi",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(
    async (reset = false) => {
      if (!storeId) return;

      setLoading(true);
      try {
        const currentPage = reset ? 0 : page;
        const response = await getPublicProductsApi({
          storeId,
          keyword: searchKeyword,
          page: currentPage,
          size: 10,
          isActive: true,
          sortBy: "createdAt",
          sortDirection: "DESC",
        });

        if (response?.result) {
          const result = response.result;
          const productList = result.content || result || [];

          if (reset) {
            setProducts(productList);
            setPage(0);
          } else {
            setProducts((prev) => [...prev, ...productList]);
          }

          setHasMore(productList.length === 10);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [storeId, searchKeyword, page]
  );

  // Load products when modal opens
  useEffect(() => {
    if (visible && storeId) {
      setProducts([]);
      setPage(0);
      setSelectedProduct(null);
      fetchProducts(true);
    }
  }, [visible, storeId]);

  // Search with debounce
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      fetchProducts(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchProducts(false);
  };

  const handleSelect = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
      onClose();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  // Format price range display
  const getPriceDisplay = (product) => {
    if (product.minPrice && product.maxPrice) {
      if (product.minPrice === product.maxPrice) {
        return formatPrice(product.minPrice);
      }
      return `${formatPrice(product.minPrice)} - ${formatPrice(
        product.maxPrice
      )}`;
    }
    return formatPrice(product.sellingPrice || product.price || 0);
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <ShoppingOutlined /> {title}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="select"
          type="primary"
          onClick={handleSelect}
          disabled={!selectedProduct}
        >
          Gửi sản phẩm
        </Button>,
      ]}
      width={600}
      className={styles.pickerModal}
    >
      <div className={styles.searchBox}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
        />
      </div>

      <div className={styles.listContainer}>
        {loading && products.length === 0 ? (
          <div className={styles.loadingContainer}>
            <Spin tip="Đang tải..." />
          </div>
        ) : products.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy sản phẩm"
          />
        ) : (
          <List
            dataSource={products}
            renderItem={(product) => (
              <List.Item
                className={`${styles.listItem} ${
                  selectedProduct?.id === product.id ? styles.selected : ""
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size={72}
                      src={
                        product.thumbnailImage ||
                        product.thumbnailUrl ||
                        product.images?.[0]?.url
                      }
                      icon={<ShoppingOutlined />}
                      className={styles.productAvatar}
                    />
                  }
                  title={
                    <div className={styles.productTitle}>
                      <span className={styles.productName}>{product.name}</span>
                      {product.soldCount > 0 && (
                        <Tag color="orange">Đã bán {product.soldCount}</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div className={styles.productMeta}>
                      <div className={styles.priceRow}>
                        <span className={styles.productPrice}>
                          {getPriceDisplay(product)}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        {product.averageRating > 0 ? (
                          <span className={styles.ratingInfo}>
                            <Rate
                              disabled
                              allowHalf
                              value={product.averageRating}
                              style={{ fontSize: 12 }}
                            />
                            <span className={styles.ratingCount}>
                              ({product.ratingCount || 0})
                            </span>
                          </span>
                        ) : (
                          <span className={styles.noRating}>
                            <StarOutlined /> Chưa có đánh giá
                          </span>
                        )}
                        {product.totalStock !== undefined && (
                          <span className={styles.productStock}>
                            Kho: {product.totalStock}
                          </span>
                        )}
                      </div>
                      {product.shortDescription && (
                        <div className={styles.productDescription}>
                          {product.shortDescription}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
            loadMore={
              hasMore && !loading ? (
                <div className={styles.loadMore}>
                  <Button onClick={handleLoadMore}>Xem thêm</Button>
                </div>
              ) : null
            }
          />
        )}
        {loading && products.length > 0 && (
          <div className={styles.loadingMore}>
            <Spin size="small" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductPickerModal;
