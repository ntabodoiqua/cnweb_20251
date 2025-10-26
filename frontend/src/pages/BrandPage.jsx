import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Empty,
  Pagination,
  Select,
  Breadcrumb,
  Tag,
  Rate,
  Typography,
} from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  ShopOutlined,
  StarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { getPublicProductsApi, getPublicBrandByIdApi } from "../util/api";
import LoadingSpinner from "../components/LoadingSpinner";
import NoImage from "../assets/NoImages.webp";
import styles from "./BrandPage.module.css";

const { Title, Text } = Typography;

const BrandPage = () => {
  const navigate = useNavigate();
  const { brandId } = useParams();

  // State
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch brand details
  const fetchBrand = useCallback(async () => {
    try {
      const response = await getPublicBrandByIdApi(brandId);
      if (response.code === 1000) {
        setBrand(response.result);
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
    }
  }, [brandId]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const params = {
        brandId: brandId,
        isActive: true,
        sortBy,
        sortDirection,
        page: pagination.current - 1,
        size: pagination.pageSize,
      };

      const response = await getPublicProductsApi(params);
      if (response.code === 1000) {
        const result = response.result;
        setProducts(result.content || []);
        setPagination((prev) => ({
          ...prev,
          total: result.totalElements || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, [brandId, sortBy, sortDirection, pagination.current, pagination.pageSize]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBrand();
      setLoading(false);
    };
    loadData();
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [brandId]);

  // Fetch products when filters change
  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [
    brandId,
    sortBy,
    sortDirection,
    pagination.current,
    pagination.pageSize,
    loading,
  ]);

  const handleSortChange = (value) => {
    const [newSortBy, newSortDirection] = value.split("-");
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải thương hiệu..." fullScreen={true} />;
  }

  if (!brand) {
    return (
      <div className={styles.brandPage}>
        <Empty
          description="Không tìm thấy thương hiệu"
          style={{ marginTop: 100 }}
        />
      </div>
    );
  }

  const renderProductCard = (product) => {
    const priceDisplay =
      product.minPrice === product.maxPrice
        ? formatPrice(product.minPrice)
        : `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`;

    return (
      <Card
        key={product.id}
        hoverable
        className={styles.productCard}
        onClick={() => handleProductClick(product.id)}
        cover={
          <div className={styles.productImageWrapper}>
            <img
              alt={product.name}
              src={product.thumbnailImage || NoImage}
              className={styles.productImage}
              onError={(e) => {
                e.target.src = NoImage;
              }}
            />
            {product.soldCount > 0 && (
              <div className={`${styles.productBadge} ${styles.sold}`}>
                Đã bán {product.soldCount}
              </div>
            )}
            {!product.active && (
              <div className={`${styles.productBadge} ${styles.inactive}`}>
                Ngừng kinh doanh
              </div>
            )}
          </div>
        }
      >
        <Card.Meta
          title={
            <div className={styles.productTitle} title={product.name}>
              {product.name}
            </div>
          }
          description={
            <div className={styles.productDetails}>
              <div className={styles.productPrice}>{priceDisplay}</div>

              {/* Rating */}
              <div className={styles.productRatingRow}>
                {product.averageRating ? (
                  <>
                    <Rate
                      disabled
                      allowHalf
                      value={product.averageRating}
                      style={{ fontSize: 12 }}
                    />
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, marginLeft: 4 }}
                    >
                      ({product.ratingCount})
                    </Text>
                  </>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <StarOutlined /> Chưa có đánh giá
                  </Text>
                )}
              </div>

              {/* Store Info */}
              <div className={styles.productStore}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.storeId) {
                      navigate(`/store/${product.storeId}`);
                    }
                  }}
                  className={styles.storeLink}
                >
                  <ShopOutlined /> {product.storeName}
                </Text>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>{brand.name} - HUSTBuy</title>
        <meta
          name="description"
          content={
            brand.description ||
            `Mua sắm sản phẩm ${brand.name} chính hãng với giá tốt nhất tại HUSTBuy`
          }
        />
      </Helmet>

      <div className={styles.brandPage}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/">
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/products">
                    <AppstoreOutlined /> Sản phẩm
                  </Link>
                ),
              },
              {
                title: brand.name,
              },
            ]}
          />
        </div>

        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandInfo}>
            <img
              src={brand.logoUrl || NoImage}
              alt={brand.name}
              className={styles.brandLogo}
              onError={(e) => {
                e.target.src = NoImage;
              }}
            />
            <div className={styles.brandText}>
              <Title level={2} className={styles.brandTitle}>
                {brand.name}
              </Title>
              {brand.description && (
                <Text className={styles.brandDescription}>
                  {brand.description}
                </Text>
              )}
              <div className={styles.brandStats}>
                <Tag color="blue" icon={<TagOutlined />}>
                  {pagination.total} sản phẩm
                </Tag>
                {brand.isActive && <Tag color="green">Đang hoạt động</Tag>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.brandContent}>
          <Row gutter={[24, 24]}>
            {/* Products Grid */}
            <Col xs={24}>
              {/* Sort Controls */}
              <Card className={styles.sortCard} size="small">
                <div className={styles.sortControls}>
                  <div className={styles.resultInfo}>
                    <Text strong>
                      {pagination.total} sản phẩm của {brand.name}
                    </Text>
                  </div>
                  <div className={styles.sortSelect}>
                    <Text type="secondary" style={{ marginRight: 8 }}>
                      Sắp xếp:
                    </Text>
                    <Select
                      value={`${sortBy}-${sortDirection}`}
                      onChange={handleSortChange}
                      style={{ width: 180 }}
                    >
                      <Select.Option value="createdAt-desc">
                        Mới nhất
                      </Select.Option>
                      <Select.Option value="createdAt-asc">
                        Cũ nhất
                      </Select.Option>
                      <Select.Option value="price-asc">
                        Giá thấp đến cao
                      </Select.Option>
                      <Select.Option value="price-desc">
                        Giá cao đến thấp
                      </Select.Option>
                      <Select.Option value="soldCount-desc">
                        Bán chạy
                      </Select.Option>
                      <Select.Option value="averageRating-desc">
                        Đánh giá cao
                      </Select.Option>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Products */}
              {productsLoading ? (
                <LoadingSpinner tip="Đang tải sản phẩm..." fullScreen={false} />
              ) : products.length > 0 ? (
                <>
                  <Row gutter={[16, 16]} className={styles.productsGrid}>
                    {products.map((product) => (
                      <Col
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        xl={6}
                        key={product.id}
                      >
                        {renderProductCard(product)}
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination */}
                  <div className={styles.paginationWrapper}>
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onChange={handlePageChange}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total) => `Tổng ${total} sản phẩm`}
                      pageSizeOptions={["12", "20", "40", "60"]}
                    />
                  </div>
                </>
              ) : (
                <Empty
                  description="Không tìm thấy sản phẩm nào"
                  style={{ marginTop: 60 }}
                />
              )}
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default BrandPage;
