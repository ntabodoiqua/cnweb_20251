import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "antd";
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  getPublicProductsApi,
  getPublicPlatformCategoriesApi,
  getBrandsApi,
  getPublicStoresApi,
} from "../util/api";
import ProductFilters from "../components/ProductFilters";
import LoadingSpinner from "../components/LoadingSpinner";
import styles from "./ProductsPage.module.css";

const { Title, Text } = Typography;
const { Search } = Input;

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    categoryId: searchParams.get("categoryId") || undefined,
    storeId: searchParams.get("storeId") || undefined,
    brandId: searchParams.get("brandId") || undefined,
    isActive: true,
    priceFrom: Number(searchParams.get("priceFrom")) || undefined,
    priceTo: Number(searchParams.get("priceTo")) || undefined,
    stockFrom: Number(searchParams.get("stockFrom")) || undefined,
    stockTo: Number(searchParams.get("stockTo")) || undefined,
    ratingFrom: Number(searchParams.get("ratingFrom")) || undefined,
    ratingTo: Number(searchParams.get("ratingTo")) || undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortDirection: searchParams.get("sortDirection") || "desc",
  });

  // Debounce timer for slider filters
  const debounceTimerRef = useRef(null);
  const skipFetchRef = useRef(false);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchStores();
  }, []);

  // Fetch products when filters change (skip if debouncing slider filters)
  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    fetchProducts();
  }, [filters, pagination.current, pagination.pageSize]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getPublicPlatformCategoriesApi();
      if (response.code === 1000) {
        // Flatten categories to include both parent and child categories
        const allCategories = [];
        const resultArray = Array.isArray(response.result)
          ? response.result
          : [];
        resultArray.forEach((category) => {
          allCategories.push(category);
          if (category.subCategories && category.subCategories.length > 0) {
            allCategories.push(...category.subCategories);
          }
        });
        setCategories(allCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await getBrandsApi(0, 100);
      console.log("Brands API response:", response);
      if (response.code === 1000) {
        const brandsData = response.result?.content || response.result || [];
        console.log("Brands data:", brandsData);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await getPublicStoresApi(0, 100);
      console.log("Stores API response:", response);
      // Response structure: { content: [...], pageable: {...}, ... }
      const storesData = response.content || [];
      console.log("Stores data:", storesData);
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
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
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, keyword: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    // Debounce for slider filters (price, stock, rating) to prevent API spam
    const isSliderFilter =
      newFilters.hasOwnProperty("priceFrom") ||
      newFilters.hasOwnProperty("priceTo") ||
      newFilters.hasOwnProperty("stockFrom") ||
      newFilters.hasOwnProperty("stockTo") ||
      newFilters.hasOwnProperty("ratingFrom") ||
      newFilters.hasOwnProperty("ratingTo");

    if (isSliderFilter) {
      // Skip the useEffect fetch for slider changes
      skipFetchRef.current = true;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer - only fetch after 1000ms (1 second) of no changes
      debounceTimerRef.current = setTimeout(() => {
        skipFetchRef.current = false;
        fetchProducts();
      }, 1000);
    }

    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      categoryId: undefined,
      storeId: undefined,
      brandId: undefined,
      isActive: true,
      priceFrom: undefined,
      priceTo: undefined,
      stockFrom: undefined,
      stockTo: undefined,
      ratingFrom: undefined,
      ratingTo: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (value) => {
    const [sortBy, sortDirection] = value.split("-");
    setFilters((prev) => ({ ...prev, sortBy, sortDirection }));
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
        className={`${styles.productCard} ${
          viewMode === "list" ? styles.listView : ""
        }`}
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
                {product.soldCount > 0 && (
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginLeft: 8 }}
                  >
                    | Đã bán {product.soldCount}
                  </Text>
                )}
              </div>

              {/* Categories and Brand */}
              <div className={styles.productMeta}>
                <Space wrap size="small">
                  <Tag color="blue">{product.platformCategoryName}</Tag>
                  {product.brandName && (
                    <Tag color="purple">{product.brandName}</Tag>
                  )}
                  {product.storeCategoryName &&
                    product.storeCategoryName.length > 0 && (
                      <Tag
                        color="cyan"
                        title={product.storeCategoryName.join(", ")}
                      >
                        {product.storeCategoryName[0]}
                        {product.storeCategoryName.length > 1 &&
                          ` +${product.storeCategoryName.length - 1}`}
                      </Tag>
                    )}
                </Space>
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

  return (
    <>
      <Helmet>
        <title>Danh sách sản phẩm - HUSTBuy</title>
        <meta
          name="description"
          content="Tìm kiếm và mua sắm hàng nghìn sản phẩm chất lượng với giá tốt nhất"
        />
      </Helmet>

      <div className={styles.productsPage}>
        <div className={styles.productsContainer}>
          <Row gutter={[24, 24]}>
            {/* Filters Sidebar */}
            <Col xs={24} lg={6}>
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                categories={categories}
                brands={brands}
                stores={stores}
                loading={loading}
              />
            </Col>

            {/* Products List */}
            <Col xs={24} lg={18}>
              <div className={styles.productsContent}>
                {/* Search and Controls */}
                <Card className={styles.productsControls}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                      <Search
                        placeholder="Tìm kiếm sản phẩm..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        defaultValue={filters.keyword}
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Select
                        style={{ width: "100%" }}
                        value={`${filters.sortBy}-${filters.sortDirection}`}
                        onChange={handleSortChange}
                        size="large"
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
                        <Select.Option value="name-asc">Tên A-Z</Select.Option>
                        <Select.Option value="name-desc">Tên Z-A</Select.Option>
                      </Select>
                    </Col>
                    <Col xs={24} md={6}>
                      <Space>
                        <Button
                          type={viewMode === "grid" ? "primary" : "default"}
                          icon={<AppstoreOutlined />}
                          onClick={() => setViewMode("grid")}
                        >
                          Lưới
                        </Button>
                        <Button
                          type={viewMode === "list" ? "primary" : "default"}
                          icon={<UnorderedListOutlined />}
                          onClick={() => setViewMode("list")}
                        >
                          Danh sách
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Products Grid/List */}
                {loading ? (
                  <LoadingSpinner
                    tip="Đang tải sản phẩm..."
                    fullScreen={false}
                  />
                ) : products.length > 0 ? (
                  <>
                    <Row
                      gutter={[16, 16]}
                      className={`${styles.productsGrid} ${
                        viewMode === "list" ? styles.listView : ""
                      }`}
                    >
                      {viewMode === "grid" ? (
                        products.map((product) => (
                          <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                            {renderProductCard(product)}
                          </Col>
                        ))
                      ) : (
                        <Col span={24}>
                          {products.map((product) =>
                            renderProductCard(product)
                          )}
                        </Col>
                      )}
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
                    description="Không tìm thấy sản phẩm nào"
                    style={{ marginTop: 60 }}
                  />
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
