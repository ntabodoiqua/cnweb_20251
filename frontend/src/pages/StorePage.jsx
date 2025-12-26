import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Empty,
  Pagination,
  Select,
  Input,
  Space,
  Button,
  message,
  Tag,
  Rate,
  Typography,
  Spin,
  Divider,
  Carousel,
} from "antd";
import {
  SearchOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TagsOutlined,
  MessageOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  getPublicStoreDetailApi,
  getPublicStoreCategoriesApi,
  getPublicProductsApi,
  getWardInfoApi,
  getStoreBannersApi,
  followStoreApi,
  unfollowStoreApi,
  getFollowStatusApi,
} from "../util/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ChatButton from "../components/chat/ChatButton";
import styles from "./StorePage.module.css";

const { Title, Text } = Typography;
const { Search } = Input;

const StorePage = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wardInfo, setWardInfo] = useState(null);
  const [bannerSlides, setBannerSlides] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryId") || null
  );

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("access_token");

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortDirection: searchParams.get("sortDirection") || "desc",
  });

  // Debounce timer
  const debounceTimerRef = useRef(null);

  // Fetch store detail and categories on mount
  useEffect(() => {
    if (storeId) {
      fetchStoreData();
      // Fetch follow status if user is logged in
      if (isLoggedIn) {
        fetchFollowStatus();
      }
    }
  }, [storeId, isLoggedIn]);

  // Fetch products when filters change
  useEffect(() => {
    if (store) {
      fetchProducts();
    }
  }, [
    store,
    selectedCategory,
    filters,
    pagination.current,
    pagination.pageSize,
  ]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const [storeResponse, categoriesResponse, bannersResponse] =
        await Promise.all([
          getPublicStoreDetailApi(storeId),
          getPublicStoreCategoriesApi(storeId),
          getStoreBannersApi(storeId),
        ]);

      // Handle store response
      if (storeResponse) {
        setStore(storeResponse);
        // Fetch ward info if wardId exists
        if (storeResponse.wardId) {
          fetchWardInfo(storeResponse.wardId);
        }
      }

      // Handle categories response
      if (categoriesResponse.code === 1000) {
        setCategories(categoriesResponse.result || []);
      }

      // Handle banners response
      if (bannersResponse?.code === 1000) {
        setBannerSlides(bannersResponse.result || []);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      message.error("Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchWardInfo = async (wardId) => {
    try {
      const response = await getWardInfoApi(wardId);
      if (response.code === 1000) {
        setWardInfo(response.result);
      }
    } catch (error) {
      console.error("Error fetching ward info:", error);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const response = await getFollowStatusApi(storeId);
      if (response.code === 1000) {
        setIsFollowing(response.result.following);
        setFollowerCount(response.result.followerCount);
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      message.warning("Vui lòng đăng nhập để theo dõi cửa hàng");
      navigate("/login", { state: { from: `/store/${storeId}` } });
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const response = await unfollowStoreApi(storeId);
        if (response.code === 1000) {
          setIsFollowing(false);
          setFollowerCount(response.result.followerCount);
          message.success("Đã hủy theo dõi cửa hàng");
        }
      } else {
        const response = await followStoreApi(storeId);
        if (response.code === 1000) {
          setIsFollowing(true);
          setFollowerCount(response.result.followerCount);
          message.success("Đã theo dõi cửa hàng thành công!");
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      message.error(errorMessage);
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const params = {
        storeId: storeId,
        keyword: filters.keyword || undefined,
        categoryId: selectedCategory || undefined,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        isActive: true,
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
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, keyword: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (value) => {
    const [sortBy, sortDirection] = value.split("-");
    setFilters((prev) => ({ ...prev, sortBy, sortDirection }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
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

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleAddToWishlist = (product, e) => {
    e.stopPropagation();
    message.success(`Đã thêm "${product.name}" vào danh sách yêu thích!`);
  };

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
              src={
                product.thumbnailImage ||
                "https://via.placeholder.com/300x300?text=No+Image"
              }
              className={styles.productImage}
            />
            <div className={styles.productOverlay}>
              <Space>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ShoppingCartOutlined />}
                  onClick={(e) => handleAddToCart(product, e)}
                />
                <Button
                  type="default"
                  shape="circle"
                  icon={<HeartOutlined />}
                  onClick={(e) => handleAddToWishlist(product, e)}
                />
                <Button type="default" shape="circle" icon={<EyeOutlined />} />
              </Space>
            </div>
            {product.soldCount > 0 && (
              <div className={`${styles.productBadge} ${styles.sold}`}>
                Đã bán {product.soldCount}
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
              <Text className={styles.productDescription} ellipsis>
                {product.shortDescription}
              </Text>
              <div className={styles.productPrice}>{priceDisplay}</div>

              {/* Rating */}
              <div className={styles.productRatingRow}>
                {product.averageRating ? (
                  <Space size="small">
                    <Rate
                      disabled
                      allowHalf
                      value={product.averageRating}
                      style={{ fontSize: 12 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({product.ratingCount} đánh giá)
                    </Text>
                  </Space>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <StarOutlined /> Chưa có đánh giá
                  </Text>
                )}
              </div>

              {/* Categories */}
              <div className={styles.productMeta}>
                <Space wrap size="small">
                  <Tag color="blue">{product.platformCategoryName}</Tag>
                  {product.brandName && (
                    <Tag color="purple">{product.brandName}</Tag>
                  )}
                </Space>
              </div>

              {/* Stock and Date */}
              <div className={styles.productFooterInfo}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Kho: {product.totalAvailableStock}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined /> {formatDate(product.createdAt)}
                </Text>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={styles.storePage}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner
            tip="Đang tải thông tin cửa hàng..."
            fullScreen={false}
          />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className={styles.storePage}>
        <div className={styles.emptyContainer}>
          <Empty description="Không tìm thấy cửa hàng" />
          <Button type="primary" onClick={() => navigate("/products")}>
            Quay lại trang sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${store.storeName || "Cửa hàng"} - HUSTBuy`}</title>
        <meta
          name="description"
          content={
            store.storeDescription || `Cửa hàng ${store.storeName} trên HUSTBuy`
          }
        />
      </Helmet>

      <div className={styles.storePage}>
        {/* Store Header with Banner */}
        <div className={styles.storeHeader}>
          {store.bannerUrl ? (
            <img
              src={store.bannerUrl}
              alt={`${store.storeName} banner`}
              className={styles.storeBanner}
            />
          ) : (
            <div className={styles.storeBannerPlaceholder}>
              <ShopOutlined
                style={{ fontSize: 80, color: "rgba(255,255,255,0.5)" }}
              />
            </div>
          )}

          <div className={styles.storeInfoOverlay}>
            <div className={styles.storeInfoContainer}>
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.storeName}
                  className={styles.storeLogo}
                />
              ) : (
                <div className={styles.storeLogoPlaceholder}>
                  <ShopOutlined style={{ fontSize: 40, color: "#ee4d2d" }} />
                </div>
              )}

              <div className={styles.storeDetails}>
                <h1 className={styles.storeName}>{store.storeName}</h1>
                {store.storeDescription && (
                  <p className={styles.storeDescription}>
                    {store.storeDescription}
                  </p>
                )}
                <div className={styles.storeStats}>
                  <span className={styles.storeStat}>
                    <AppstoreOutlined />
                    {categories.length} danh mục
                  </span>
                  <span className={styles.storeStat}>
                    <TagsOutlined />
                    {pagination.total} sản phẩm
                  </span>
                  <span className={styles.storeStat}>
                    <TeamOutlined />
                    {followerCount} người theo dõi
                  </span>
                  <span className={styles.storeStat}>
                    <ClockCircleOutlined />
                    Tham gia: {formatDate(store.createdAt)}
                  </span>
                </div>
                <div className={styles.storeActions}>
                  <Button
                    type={isFollowing ? "default" : "primary"}
                    danger={isFollowing}
                    icon={isFollowing ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFollowToggle}
                    loading={followLoading}
                    size="large"
                    className={
                      isFollowing ? styles.unfollowButton : styles.followButton
                    }
                  >
                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </Button>
                  <ChatButton
                    shopId={storeId}
                    shopName={store.storeName}
                    type="default"
                    size="large"
                  >
                    Chat với Shop
                  </ChatButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Slides Carousel - Below Store Header */}
        {bannerSlides.length > 0 && (
          <div className={styles.storeBannerSlides}>
            <Carousel
              autoplay
              autoplaySpeed={4000}
              dots={true}
              swipe={true}
              draggable={true}
              className={styles.bannerCarousel}
            >
              {bannerSlides.map((banner) => (
                <div key={banner.id} className={styles.bannerSlide}>
                  <img
                    src={banner.imageUrl}
                    alt={banner.imageName || "Store Banner"}
                    className={styles.bannerSlideImage}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        )}

        {/* Store Content */}
        <div className={styles.storeContent}>
          {/* Contact Info */}
          {(store.contactEmail ||
            store.contactPhone ||
            store.shopAddress ||
            wardInfo) && (
            <div className={styles.storeContactInfo}>
              <div className={styles.contactCard}>
                <div className={styles.contactGrid}>
                  {store.contactEmail && (
                    <div className={styles.contactItem}>
                      <div className={styles.contactIcon}>
                        <MailOutlined />
                      </div>
                      <div className={styles.contactDetails}>
                        <h4>Email</h4>
                        <p>{store.contactEmail}</p>
                      </div>
                    </div>
                  )}
                  {store.contactPhone && (
                    <div className={styles.contactItem}>
                      <div className={styles.contactIcon}>
                        <PhoneOutlined />
                      </div>
                      <div className={styles.contactDetails}>
                        <h4>Điện thoại</h4>
                        <p>{store.contactPhone}</p>
                      </div>
                    </div>
                  )}
                  {(store.shopAddress || wardInfo) && (
                    <div className={styles.contactItem}>
                      <div className={styles.contactIcon}>
                        <EnvironmentOutlined />
                      </div>
                      <div className={styles.contactDetails}>
                        <h4>Địa chỉ</h4>
                        <p>
                          {[store.shopAddress, wardInfo?.pathWithType]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Store Categories */}
          {categories.length > 0 && (
            <div className={styles.storeCategoriesSection}>
              <h2 className={styles.sectionTitle}>
                <AppstoreOutlined />
                Danh mục sản phẩm
              </h2>
              <div className={styles.categoriesGrid}>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`${styles.categoryCard} ${
                      selectedCategory === category.id ? styles.active : ""
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className={styles.categoryImage}
                      />
                    ) : (
                      <div className={styles.categoryImagePlaceholder}>
                        <AppstoreOutlined
                          style={{ fontSize: 24, color: "#bbb" }}
                        />
                      </div>
                    )}
                    <p className={styles.categoryName}>{category.name}</p>
                    {category.productCount !== undefined && (
                      <p className={styles.categoryProductCount}>
                        {category.productCount} sản phẩm
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className={styles.productsSection}>
            <div className={styles.productsHeader}>
              <h2 className={styles.sectionTitle}>
                <TagsOutlined />
                Sản phẩm của cửa hàng
                {selectedCategory && (
                  <Tag
                    color="orange"
                    closable
                    onClose={() => setSelectedCategory(null)}
                    style={{ marginLeft: 8 }}
                  >
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </Tag>
                )}
              </h2>
              <div className={styles.productsFilters}>
                <Search
                  placeholder="Tìm trong cửa hàng..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  defaultValue={filters.keyword}
                  style={{ width: 280 }}
                />
                <Select
                  style={{ width: 180 }}
                  value={`${filters.sortBy}-${filters.sortDirection}`}
                  onChange={handleSortChange}
                >
                  <Select.Option value="createdAt-desc">Mới nhất</Select.Option>
                  <Select.Option value="createdAt-asc">Cũ nhất</Select.Option>
                  <Select.Option value="price-asc">
                    Giá thấp đến cao
                  </Select.Option>
                  <Select.Option value="price-desc">
                    Giá cao đến thấp
                  </Select.Option>
                  <Select.Option value="name-asc">Tên A-Z</Select.Option>
                  <Select.Option value="name-desc">Tên Z-A</Select.Option>
                  <Select.Option value="soldCount-desc">
                    Bán chạy nhất
                  </Select.Option>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className={styles.loadingContainer}>
                <Spin tip="Đang tải sản phẩm..." />
              </div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[16, 16]} className={styles.productsGrid}>
                  {products.map((product) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product.id}>
                      {renderProductCard(product)}
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                <div className={styles.productsPagination}>
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
                description={
                  selectedCategory
                    ? "Không có sản phẩm trong danh mục này"
                    : "Cửa hàng chưa có sản phẩm nào"
                }
                style={{ marginTop: 60 }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePage;
