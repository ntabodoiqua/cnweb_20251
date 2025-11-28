import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Empty,
  Pagination,
  Select,
  Space,
  Button,
  message,
  Tag,
  Rate,
  Typography,
  Skeleton,
  Checkbox,
  Collapse,
  Badge,
} from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
  StarOutlined,
  ShopOutlined,
  FilterOutlined,
  ClearOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { quickSearchProductsApi } from "../util/api";
import LoadingSpinner from "../components/LoadingSpinner";
import NoImages from "../assets/NoImages.webp";
import styles from "./SearchPage.module.css";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get search query from URL
  const query = searchParams.get("q") || "";

  // State
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [aggregations, setAggregations] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || "",
    storeId: searchParams.get("storeId") || "",
    brandId: searchParams.get("brandId") || "",
    priceFrom: searchParams.get("priceFrom") || "",
    priceTo: searchParams.get("priceTo") || "",
    minRating: searchParams.get("minRating") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
    sortDir: searchParams.get("sortDir") || "desc",
  });

  // Search metadata
  const [searchMeta, setSearchMeta] = useState({
    took: 0,
    maxScore: 0,
  });

  // Debounce timer ref for price filters
  const debounceTimerRef = useRef(null);
  const skipFetchRef = useRef(false);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch products when query or filters change
  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    if (query) {
      fetchProducts();
    } else {
      setProducts([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    }
  }, [query, filters, pagination.current, pagination.pageSize]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        ...filters,
        page: pagination.current - 1,
        size: pagination.pageSize,
        aggregations: true, // Enable aggregations for filters
      };

      // Remove empty values
      Object.keys(params).forEach(
        (key) =>
          (params[key] === "" || params[key] === undefined) &&
          delete params[key]
      );

      const response = await quickSearchProductsApi(params);

      if (response.code === 1000) {
        const result = response.result;
        // Map hits to products with their highlights
        const mappedProducts = (result.hits || []).map((hit) => ({
          ...hit.product,
          score: hit.score,
          highlights: hit.highlights,
        }));
        setProducts(mappedProducts);
        setPagination((prev) => ({
          ...prev,
          total: result.totalHits || 0,
        }));
        // Map aggregations from API response format
        if (result.aggregations) {
          setAggregations({
            categories: (result.aggregations.categories || []).map((cat) => ({
              id: cat.key,
              name: cat.label,
              count: cat.docCount,
            })),
            brands: (result.aggregations.brands || []).map((brand) => ({
              id: brand.key,
              name: brand.label,
              count: brand.docCount,
            })),
            stores: (result.aggregations.stores || []).map((store) => ({
              id: store.key,
              name: store.label,
              count: store.docCount,
            })),
            priceRange: result.aggregations.priceRange,
          });
        } else {
          setAggregations(null);
        }
        setSearchMeta({
          took: result.took || 0,
          maxScore: result.maxScore || 0,
        });
      }
    } catch (error) {
      console.error("Error searching products:", error);
      message.error("Không thể tìm kiếm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    // Check if this is a debounced filter (price inputs)
    const isDebouncedFilter = key === "priceFrom" || key === "priceTo";

    if (isDebouncedFilter) {
      // Skip the useEffect fetch for debounced changes
      skipFetchRef.current = true;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Update state immediately for UI responsiveness
      setFilters((prev) => ({ ...prev, [key]: value }));

      // Set new timer - only fetch after 800ms of no changes
      debounceTimerRef.current = setTimeout(() => {
        skipFetchRef.current = false;
        setPagination((prev) => ({ ...prev, current: 1 }));

        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
        setSearchParams(newParams);

        // Trigger fetch
        fetchProducts();
      }, 800);
    } else {
      // Non-debounced filters (checkboxes, etc.)
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPagination((prev) => ({ ...prev, current: 1 }));

      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      categoryId: "",
      storeId: "",
      brandId: "",
      priceFrom: "",
      priceTo: "",
      minRating: "",
      sortBy: "relevance",
      sortDir: "desc",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));

    // Reset URL params, keep only query
    const newParams = new URLSearchParams();
    newParams.set("q", query);
    setSearchParams(newParams);
  };

  const handleSortChange = (value) => {
    const [sortBy, sortDir] = value.split("-");
    setFilters((prev) => ({ ...prev, sortBy, sortDir }));

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", sortBy);
    newParams.set("sortDir", sortDir);
    setSearchParams(newParams);
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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

  const renderHighlightedText = (text, highlights) => {
    if (!highlights || highlights.length === 0) {
      return text;
    }
    // Highlights from Elasticsearch contain <em> tags
    return <span dangerouslySetInnerHTML={{ __html: highlights[0] }} />;
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
              src={product.thumbnailImage || NoImages}
              className={styles.productImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = NoImages;
              }}
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
            {product.soldCount > 100 && (
              <div className={`${styles.productBadge} ${styles.hot}`}>
                <FireOutlined /> Hot
              </div>
            )}
            {product.score && product.score > 5 && (
              <div className={`${styles.productBadge} ${styles.relevance}`}>
                <ThunderboltOutlined /> Phù hợp nhất
              </div>
            )}
          </div>
        }
      >
        <Card.Meta
          title={
            <div className={styles.productTitle} title={product.name}>
              {product.highlights?.name
                ? renderHighlightedText(product.name, product.highlights.name)
                : product.name}
            </div>
          }
          description={
            <div className={styles.productDetails}>
              <Text className={styles.productDescription} ellipsis>
                {product.highlights?.description
                  ? renderHighlightedText(
                      product.shortDescription,
                      product.highlights.description
                    )
                  : product.shortDescription}
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
                      ({product.ratingCount || 0})
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
                  {product.platformCategoryName && (
                    <Tag color="blue">{product.platformCategoryName}</Tag>
                  )}
                  {product.brandName && (
                    <Tag color="purple">{product.brandName}</Tag>
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
            </div>
          }
        />
      </Card>
    );
  };

  const renderFilters = () => (
    <Card className={styles.filtersCard}>
      <div className={styles.filtersHeader}>
        <Title level={5}>
          <FilterOutlined /> Bộ lọc
        </Title>
        <Button
          type="link"
          icon={<ClearOutlined />}
          onClick={handleResetFilters}
        >
          Xóa bộ lọc
        </Button>
      </div>

      <Collapse defaultActiveKey={["price", "rating"]} ghost>
        {/* Price Filter */}
        <Panel header="Khoảng giá" key="price">
          <div className={styles.priceFilter}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.priceFrom}
                  onChange={(e) =>
                    handleFilterChange("priceFrom", e.target.value)
                  }
                  className={styles.priceInput}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.priceTo}
                  onChange={(e) =>
                    handleFilterChange("priceTo", e.target.value)
                  }
                  className={styles.priceInput}
                />
              </div>
              <div className={styles.pricePresets}>
                <Tag
                  className={styles.priceTag}
                  onClick={() => {
                    handleFilterChange("priceFrom", "0");
                    handleFilterChange("priceTo", "100000");
                  }}
                >
                  Dưới 100K
                </Tag>
                <Tag
                  className={styles.priceTag}
                  onClick={() => {
                    handleFilterChange("priceFrom", "100000");
                    handleFilterChange("priceTo", "500000");
                  }}
                >
                  100K - 500K
                </Tag>
                <Tag
                  className={styles.priceTag}
                  onClick={() => {
                    handleFilterChange("priceFrom", "500000");
                    handleFilterChange("priceTo", "1000000");
                  }}
                >
                  500K - 1M
                </Tag>
                <Tag
                  className={styles.priceTag}
                  onClick={() => {
                    handleFilterChange("priceFrom", "1000000");
                    handleFilterChange("priceTo", "");
                  }}
                >
                  Trên 1M
                </Tag>
              </div>
            </Space>
          </div>
        </Panel>

        {/* Rating Filter */}
        <Panel header="Đánh giá" key="rating">
          <Space direction="vertical">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Checkbox
                key={rating}
                checked={filters.minRating === String(rating)}
                onChange={(e) =>
                  handleFilterChange(
                    "minRating",
                    e.target.checked ? String(rating) : ""
                  )
                }
              >
                <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
                <span style={{ marginLeft: 8 }}>trở lên</span>
              </Checkbox>
            ))}
          </Space>
        </Panel>

        {/* Categories from Aggregations */}
        {aggregations?.categories && aggregations.categories.length > 0 && (
          <Panel header="Danh mục" key="category">
            <Space direction="vertical" style={{ width: "100%" }}>
              {aggregations.categories.slice(0, 10).map((cat) => (
                <Checkbox
                  key={cat.id}
                  checked={filters.categoryId === cat.id}
                  onChange={(e) =>
                    handleFilterChange(
                      "categoryId",
                      e.target.checked ? cat.id : ""
                    )
                  }
                >
                  {cat.name}{" "}
                  <Badge
                    count={cat.count}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </Checkbox>
              ))}
            </Space>
          </Panel>
        )}

        {/* Brands from Aggregations */}
        {aggregations?.brands && aggregations.brands.length > 0 && (
          <Panel header="Thương hiệu" key="brand">
            <Space direction="vertical" style={{ width: "100%" }}>
              {aggregations.brands.slice(0, 10).map((brand) => (
                <Checkbox
                  key={brand.id}
                  checked={filters.brandId === brand.id}
                  onChange={(e) =>
                    handleFilterChange(
                      "brandId",
                      e.target.checked ? brand.id : ""
                    )
                  }
                >
                  {brand.name}{" "}
                  <Badge
                    count={brand.count}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </Checkbox>
              ))}
            </Space>
          </Panel>
        )}

        {/* Stores from Aggregations */}
        {aggregations?.stores && aggregations.stores.length > 0 && (
          <Panel header="Cửa hàng" key="store">
            <Space direction="vertical" style={{ width: "100%" }}>
              {aggregations.stores.slice(0, 10).map((store) => (
                <Checkbox
                  key={store.id}
                  checked={filters.storeId === store.id}
                  onChange={(e) =>
                    handleFilterChange(
                      "storeId",
                      e.target.checked ? store.id : ""
                    )
                  }
                >
                  {store.name}{" "}
                  <Badge
                    count={store.count}
                    style={{ backgroundColor: "#faad14" }}
                  />
                </Checkbox>
              ))}
            </Space>
          </Panel>
        )}
      </Collapse>
    </Card>
  );

  const renderSkeletons = () => (
    <Row gutter={[16, 16]}>
      {[...Array(8)].map((_, index) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={index}>
          <Card className={styles.skeletonCard}>
            <Skeleton.Image style={{ width: "100%", height: 200 }} active />
            <div style={{ padding: 16 }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      filters.categoryId ||
      filters.storeId ||
      filters.brandId ||
      filters.priceFrom ||
      filters.priceTo ||
      filters.minRating
    );
  };

  return (
    <>
      <Helmet>
        <title>
          {query ? `Tìm kiếm: ${query}` : "Tìm kiếm sản phẩm"} - HUSTBuy
        </title>
        <meta
          name="description"
          content={`Kết quả tìm kiếm cho "${query}" trên HUSTBuy`}
        />
      </Helmet>

      <div className={styles.searchPage}>
        <div className={styles.searchContainer}>
          {/* Search Header */}
          <div className={styles.searchHeader}>
            <Title level={3}>
              <SearchOutlined style={{ color: "#ee4d2d", marginRight: 12 }} />
              Kết quả tìm kiếm cho "{query}"
            </Title>
            {!loading && (
              <Text type="secondary">
                Tìm thấy{" "}
                <strong style={{ color: "#ee4d2d" }}>
                  {pagination.total.toLocaleString()}
                </strong>{" "}
                sản phẩm
                {searchMeta.took > 0 && ` (${searchMeta.took}ms)`}
              </Text>
            )}
          </div>

          <Row gutter={[24, 24]}>
            {/* Filters Sidebar */}
            <Col xs={24} lg={6}>
              {renderFilters()}
            </Col>

            {/* Products List */}
            <Col xs={24} lg={18}>
              <div className={styles.productsContent}>
                {/* Sort and View Controls */}
                <Card className={styles.productsControls}>
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                      <Space size="middle">
                        <Text strong>Sắp xếp:</Text>
                        <Select
                          style={{ width: 180 }}
                          value={`${filters.sortBy}-${filters.sortDir}`}
                          onChange={handleSortChange}
                        >
                          <Select.Option value="relevance-desc">
                            <ThunderboltOutlined /> Liên quan nhất
                          </Select.Option>
                          <Select.Option value="price-asc">
                            Giá thấp đến cao
                          </Select.Option>
                          <Select.Option value="price-desc">
                            Giá cao đến thấp
                          </Select.Option>
                          <Select.Option value="sold-desc">
                            <FireOutlined /> Bán chạy nhất
                          </Select.Option>
                          <Select.Option value="rating-desc">
                            <StarOutlined /> Đánh giá cao nhất
                          </Select.Option>
                          <Select.Option value="newest-desc">
                            Mới nhất
                          </Select.Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Button
                          type={viewMode === "grid" ? "primary" : "default"}
                          icon={<AppstoreOutlined />}
                          onClick={() => setViewMode("grid")}
                        />
                        <Button
                          type={viewMode === "list" ? "primary" : "default"}
                          icon={<UnorderedListOutlined />}
                          onClick={() => setViewMode("list")}
                        />
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Products Grid/List */}
                {loading ? (
                  <LoadingSpinner tip="Đang tìm kiếm..." fullScreen={false} />
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
                        showTotal={(total) =>
                          `Tổng ${total.toLocaleString()} sản phẩm`
                        }
                        pageSizeOptions={["12", "20", "40", "60"]}
                      />
                    </div>
                  </>
                ) : (
                  <Card className={styles.emptyState}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <Title level={4} style={{ color: "#666" }}>
                            Không tìm thấy sản phẩm nào
                          </Title>
                          <Text type="secondary">
                            Không có kết quả cho "<strong>{query}</strong>"
                            {hasActiveFilters() && (
                              <span> với bộ lọc hiện tại</span>
                            )}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
                          </Text>
                        </div>
                      }
                    >
                      {hasActiveFilters() && (
                        <Button
                          type="primary"
                          icon={<ClearOutlined />}
                          onClick={handleResetFilters}
                          style={{
                            background:
                              "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
                            border: "none",
                          }}
                        >
                          Xóa bộ lọc
                        </Button>
                      )}
                    </Empty>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
