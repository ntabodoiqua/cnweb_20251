import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RightOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  getPublicProductsApi,
  getPublicCategoryByIdApi,
  getBrandsApi,
} from "../util/api";
import LoadingSpinner from "../components/LoadingSpinner";
import NoImage from "../assets/NoImages.webp";
import styles from "./CategoryPage.module.css";

const { Title, Text } = Typography;

const CategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  // State
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Debounce ref
  const debounceTimerRef = useRef(null);

  // Fetch category details
  const fetchCategory = useCallback(async () => {
    try {
      const response = await getPublicCategoryByIdApi(categoryId);
      if (response.code === 1000) {
        setCategory(response.result);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  }, [categoryId]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const params = {
        categoryId: selectedSubCategory || categoryId,
        brandId: selectedBrand || undefined,
        isActive: true,
        sortBy,
        sortDirection,
        page: pagination.current - 1,
        size: pagination.pageSize,
      };

      // Remove undefined values
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

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
  }, [
    categoryId,
    selectedSubCategory,
    selectedBrand,
    sortBy,
    sortDirection,
    pagination.current,
    pagination.pageSize,
  ]);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const response = await getBrandsApi(0, 50);
      if (response.code === 1000) {
        const brandsData = response.result?.content || response.result || [];
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategory(), fetchBrands()]);
      setLoading(false);
    };
    loadData();
    // Reset filters when category changes
    setSelectedSubCategory(null);
    setSelectedBrand(null);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [categoryId]);

  // Fetch products when filters change
  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [
    categoryId,
    selectedSubCategory,
    selectedBrand,
    sortBy,
    sortDirection,
    pagination.current,
    pagination.pageSize,
    loading,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSortChange = (value) => {
    const [newSortBy, newSortDirection] = value.split("-");
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSubCategoryClick = (subCatId) => {
    setSelectedSubCategory(subCatId === selectedSubCategory ? null : subCatId);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleBrandClick = (brandId) => {
    setSelectedBrand(brandId === selectedBrand ? null : brandId);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải danh mục..." fullScreen={true} />;
  }

  if (!category) {
    return (
      <div className={styles.categoryPage}>
        <Empty
          description="Không tìm thấy danh mục"
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
        <title>{category.name} - HUSTBuy</title>
        <meta
          name="description"
          content={
            category.description ||
            `Mua sắm ${category.name} chất lượng với giá tốt nhất tại HUSTBuy`
          }
        />
      </Helmet>

      <div className={styles.categoryPage}>
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
                title: category.name,
              },
            ]}
          />
        </div>

        {/* Category Header */}
        <div className={styles.categoryHeader}>
          <div className={styles.categoryInfo}>
            {category.imageUrl && (
              <img
                src={category.imageUrl}
                alt={category.name}
                className={styles.categoryImage}
                onError={(e) => {
                  e.target.src = NoImage;
                }}
              />
            )}
            <div className={styles.categoryText}>
              <Title level={2} className={styles.categoryTitle}>
                {category.name}
              </Title>
              {category.description && (
                <Text className={styles.categoryDescription}>
                  {category.description}
                </Text>
              )}
              <div className={styles.categoryStats}>
                <Tag color="blue">{pagination.total} sản phẩm</Tag>
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <Tag color="green">
                      {category.subCategories.length} danh mục con
                    </Tag>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.categoryContent}>
          <Row gutter={[24, 24]}>
            {/* Sidebar Filters */}
            <Col xs={24} lg={6}>
              <div className={styles.filterSidebar}>
                {/* Subcategories */}
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <Card
                      title={
                        <span>
                          <AppstoreOutlined /> Danh mục con
                        </span>
                      }
                      className={styles.filterCard}
                      size="small"
                    >
                      <div className={styles.subCategoryList}>
                        {category.subCategories.map((subCat) => (
                          <div
                            key={subCat.id}
                            className={`${styles.subCategoryItem} ${
                              selectedSubCategory === subCat.id
                                ? styles.active
                                : ""
                            }`}
                            onClick={() => handleSubCategoryClick(subCat.id)}
                          >
                            <span>{subCat.name}</span>
                            <span className={styles.productCount}>
                              ({subCat.productCount || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                {/* Brands Filter */}
                {brands.length > 0 && (
                  <Card
                    title={
                      <span>
                        <FilterOutlined /> Thương hiệu
                      </span>
                    }
                    className={styles.filterCard}
                    size="small"
                  >
                    <div className={styles.brandList}>
                      {brands.slice(0, 10).map((brand) => (
                        <div
                          key={brand.id}
                          className={`${styles.brandItem} ${
                            selectedBrand === brand.id ? styles.active : ""
                          }`}
                          onClick={() => handleBrandClick(brand.id)}
                        >
                          {brand.logoUrl && (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className={styles.brandLogo}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <span>{brand.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </Col>

            {/* Products Grid */}
            <Col xs={24} lg={18}>
              {/* Sort Controls */}
              <Card className={styles.sortCard} size="small">
                <div className={styles.sortControls}>
                  <div className={styles.resultInfo}>
                    <Text strong>
                      {pagination.total} sản phẩm
                      {selectedSubCategory && (
                        <Tag
                          closable
                          onClose={() => setSelectedSubCategory(null)}
                          style={{ marginLeft: 8 }}
                        >
                          {
                            category.subCategories.find(
                              (s) => s.id === selectedSubCategory
                            )?.name
                          }
                        </Tag>
                      )}
                      {selectedBrand && (
                        <Tag
                          closable
                          onClose={() => setSelectedBrand(null)}
                          style={{ marginLeft: 8 }}
                        >
                          {brands.find((b) => b.id === selectedBrand)?.name}
                        </Tag>
                      )}
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
                      <Col xs={24} sm={12} md={8} xl={6} key={product.id}>
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

export default CategoryPage;
