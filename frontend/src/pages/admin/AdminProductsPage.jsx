import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import {
  ShopOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import axios from "../../util/axios.customize";
import {
  getPlatformCategoriesApi,
  getPublicStoresApi,
  getBrandsApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminProductsPage.module.css";

/**
 * AdminProductsPage - Trang quản lý sản phẩm (Admin chỉ có quyền xem và xóa)
 */
const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown options data
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    keyword: "",
    name: "",
    categoryId: "",
    storeId: "",
    brandId: "",
    createdBy: "",
    isActive: "",
    isDeleted: "", // Filter for deleted products
    priceFrom: "",
    priceTo: "",
    stockFrom: "",
    stockTo: "",
    ratingFrom: "",
    ratingTo: "",
    createdFrom: "",
    createdTo: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  // Fetch products from API
  const fetchProducts = async (page = 0) => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("size", pageSize);
      params.append("sortBy", filters.sortBy);
      params.append("sortDirection", filters.sortDirection);

      // Add filters if they have values
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== "" &&
          filters[key] !== null &&
          key !== "sortBy" &&
          key !== "sortDirection"
        ) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(
        `/api/product/products?${params.toString()}`,
        {
          headers: {
            "Accept-Language": "vi",
          },
        }
      );

      if (response.code === 1000 && response.result) {
        setProducts(response.result.content || []);
        setTotalElements(response.result.totalElements || 0);
        setTotalPages(response.result.totalPages || 0);
        setCurrentPage(response.result.number || 0);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(currentPage);
    fetchDropdownData();
  }, []);

  // Fetch categories, stores, brands for dropdown
  const fetchDropdownData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await getPlatformCategoriesApi();
      if (categoriesRes.code === 1000 && categoriesRes.result) {
        // Flatten nested categories for dropdown
        const flattenCategories = (cats, prefix = "") => {
          let result = [];
          cats.forEach((cat) => {
            result.push({
              id: cat.id,
              name: prefix + cat.name,
            });
            if (cat.children && cat.children.length > 0) {
              result = result.concat(
                flattenCategories(cat.children, prefix + "-- ")
              );
            }
          });
          return result;
        };
        setCategories(flattenCategories(categoriesRes.result));
      }

      // Fetch stores
      const storesRes = await getPublicStoresApi(0, 1000);
      if (storesRes.code === 1000 && storesRes.result) {
        setStores(storesRes.result.content || []);
      }

      // Fetch brands
      const brandsRes = await getBrandsApi(0, 1000);
      if (brandsRes.code === 1000 && brandsRes.result) {
        setBrands(brandsRes.result.content || brandsRes.result || []);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? styles.statusActive : styles.statusInactive;
  };

  const getStatusText = (isActive) => {
    return isActive ? "Đang hoạt động" : "Ngừng hoạt động";
  };

  const handleDeleteProduct = async (productId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await axios.delete(`/api/product/products/${productId}`);
          notification.success({
            message: "Thành công",
            description: "Xóa sản phẩm thành công!",
            placement: "topRight",
          });
          fetchProducts(currentPage);
        } catch (err) {
          console.error("Error deleting product:", err);
          notification.error({
            message: "Lỗi",
            description: "Không thể xóa sản phẩm. Vui lòng thử lại.",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleRestoreProduct = async (productId) => {
    Modal.confirm({
      title: "Xác nhận khôi phục",
      content: "Bạn có chắc chắn muốn khôi phục sản phẩm này?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      okType: "primary",
      onOk: async () => {
        try {
          await axios.post(`/api/product/products/${productId}/restore`);
          notification.success({
            message: "Thành công",
            description: "Khôi phục sản phẩm thành công!",
            placement: "topRight",
          });
          fetchProducts(currentPage);
        } catch (err) {
          console.error("Error restoring product:", err);
          notification.error({
            message: "Lỗi",
            description: "Không thể khôi phục sản phẩm. Vui lòng thử lại.",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchProducts(0);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      name: "",
      categoryId: "",
      storeId: "",
      brandId: "",
      createdBy: "",
      isActive: "",
      isDeleted: "",
      priceFrom: "",
      priceTo: "",
      stockFrom: "",
      stockTo: "",
      ratingFrom: "",
      ratingTo: "",
      createdFrom: "",
      createdTo: "",
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    setCurrentPage(0);
    setTimeout(() => fetchProducts(0), 100);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className={styles.adminProducts}>
      {/* Toolbar */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminFilters}>
            <div className={styles.adminSearchBox}>
              <SearchOutlined className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo từ khóa..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className={styles.adminSearchInput}
              />
            </div>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className={styles.adminSelect}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </select>
            <select
              value={filters.isDeleted}
              onChange={(e) => handleFilterChange("isDeleted", e.target.value)}
              className={styles.adminSelect}
            >
              <option value="">Chưa xóa</option>
              <option value="true">Đã xóa</option>
              <option value="false">Chưa xóa</option>
            </select>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterOutlined /> {showFilters ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSearch}
            >
              <SearchOutlined /> Tìm kiếm
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
            >
              <ReloadOutlined /> Đặt lại
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Tên sản phẩm</label>
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Danh mục</label>
                <select
                  value={filters.categoryId}
                  onChange={(e) =>
                    handleFilterChange("categoryId", e.target.value)
                  }
                  className={styles.filterInput}
                >
                  <option value="">-- Tất cả danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Cửa hàng</label>
                <select
                  value={filters.storeId}
                  onChange={(e) =>
                    handleFilterChange("storeId", e.target.value)
                  }
                  className={styles.filterInput}
                >
                  <option value="">-- Tất cả cửa hàng --</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.storeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Thương hiệu</label>
                <select
                  value={filters.brandId}
                  onChange={(e) =>
                    handleFilterChange("brandId", e.target.value)
                  }
                  className={styles.filterInput}
                >
                  <option value="">-- Tất cả thương hiệu --</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Người tạo</label>
                <input
                  type="text"
                  placeholder="Username..."
                  value={filters.createdBy}
                  onChange={(e) =>
                    handleFilterChange("createdBy", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Giá từ</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceFrom}
                  onChange={(e) =>
                    handleFilterChange("priceFrom", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Giá đến</label>
                <input
                  type="number"
                  placeholder="50000000"
                  value={filters.priceTo}
                  onChange={(e) =>
                    handleFilterChange("priceTo", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Tồn kho từ</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.stockFrom}
                  onChange={(e) =>
                    handleFilterChange("stockFrom", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Tồn kho đến</label>
                <input
                  type="number"
                  placeholder="9999"
                  value={filters.stockTo}
                  onChange={(e) =>
                    handleFilterChange("stockTo", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Đánh giá từ</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.ratingFrom}
                  onChange={(e) =>
                    handleFilterChange("ratingFrom", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Đánh giá đến</label>
                <input
                  type="number"
                  placeholder="5"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.ratingTo}
                  onChange={(e) =>
                    handleFilterChange("ratingTo", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Ngày tạo từ</label>
                <input
                  type="datetime-local"
                  value={filters.createdFrom}
                  onChange={(e) =>
                    handleFilterChange("createdFrom", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Ngày tạo đến</label>
                <input
                  type="datetime-local"
                  value={filters.createdTo}
                  onChange={(e) =>
                    handleFilterChange("createdTo", e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sắp xếp theo</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className={styles.filterInput}
                >
                  <option value="createdAt">Ngày tạo</option>
                  <option value="price">Giá</option>
                  <option value="name">Tên</option>
                  <option value="soldCount">Đã bán</option>
                  <option value="averageRating">Đánh giá</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Thứ tự</label>
                <select
                  value={filters.sortDirection}
                  onChange={(e) =>
                    handleFilterChange("sortDirection", e.target.value)
                  }
                  className={styles.filterInput}
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Products Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách sản phẩm ({totalElements})
        </h2>

        {loading ? (
          <LoadingSpinner
            tip="Đang tải danh sách sản phẩm..."
            fullScreen={false}
          />
        ) : error ? (
          <div className={styles.error}>
            <div className={styles.errorIcon}>
              <ExclamationCircleOutlined />
            </div>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Cửa hàng</th>
                    <th>Danh mục</th>
                    <th>Thương hiệu</th>
                    <th>Giá</th>
                    <th>Đã bán</th>
                    <th>Đánh giá</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Đã xóa</th>
                    <th className={styles.stickyColumn}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          {product.thumbnailImage ? (
                            <img
                              src={product.thumbnailImage}
                              alt={product.name}
                              loading="lazy"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                backgroundColor: "#f0f0f0",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML =
                                  '<div style="width:50px;height:50px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#999;font-size:10px;">No Image</div>';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                background: "#f0f0f0",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#999",
                                fontSize: "10px",
                              }}
                            >
                              No Image
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                          {product.shortDescription && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "4px",
                              }}
                            >
                              {product.shortDescription.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{product.storeName || "N/A"}</div>
                          {product.storeId && (
                            <div style={{ fontSize: "11px", color: "#999" }}>
                              ID: {product.storeId.substring(0, 8)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{product.platformCategoryName || "N/A"}</div>
                          {product.storeCategoryName &&
                            product.storeCategoryName.length > 0 && (
                              <div style={{ fontSize: "11px", color: "#666" }}>
                                {product.storeCategoryName.join(", ")}
                              </div>
                            )}
                        </td>
                        <td>{product.brandName || "N/A"}</td>
                        <td>
                          <div style={{ color: "#ee4d2d", fontWeight: "bold" }}>
                            {formatPrice(product.minPrice)}
                          </div>
                          {product.minPrice !== product.maxPrice && (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              - {formatPrice(product.maxPrice)}
                            </div>
                          )}
                        </td>
                        <td>{product.soldCount || 0}</td>
                        <td>
                          {product.averageRating ? (
                            <div>
                              <span style={{ color: "#faad14" }}>
                                ⭐ {product.averageRating.toFixed(1)}
                              </span>
                              <div style={{ fontSize: "11px", color: "#999" }}>
                                ({product.ratingCount || 0} đánh giá)
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "#999" }}>Chưa có</span>
                          )}
                        </td>
                        <td>{formatDate(product.createdAt)}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              product.active
                            )}`}
                            title={getStatusText(product.active)}
                          >
                            {product.active ? (
                              <CheckCircleOutlined />
                            ) : (
                              <CloseCircleOutlined />
                            )}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              product.deleted
                                ? styles.statusDeleted
                                : styles.statusNotDeleted
                            }`}
                            title={product.deleted ? "Đã xóa" : "Chưa xóa"}
                          >
                            {product.deleted ? (
                              <CloseCircleOutlined
                                style={{ color: "#ff4d4f" }}
                              />
                            ) : (
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                            )}
                          </span>
                        </td>
                        <td className={styles.stickyColumn}>
                          <div className={styles.adminActionButtons}>
                            <button
                              className={`${styles.adminActionBtn} ${styles.view}`}
                              title="Xem chi tiết"
                              onClick={() =>
                                window.open(`/products/${product.id}`, "_blank")
                              }
                            >
                              <EyeOutlined />
                            </button>
                            {product.deleted ? (
                              <button
                                className={`${styles.adminActionBtn} ${styles.restore}`}
                                title="Khôi phục"
                                onClick={() => handleRestoreProduct(product.id)}
                              >
                                <UndoOutlined />
                              </button>
                            ) : (
                              <button
                                className={`${styles.adminActionBtn} ${styles.delete}`}
                                title="Xóa"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <DeleteOutlined />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="12"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <div className="admin-empty-state">
                          <ShopOutlined
                            style={{ fontSize: "64px", color: "#ddd" }}
                          />
                          <p>Không tìm thấy sản phẩm nào</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Trang {currentPage + 1} / {totalPages} - Tổng {totalElements}{" "}
                  sản phẩm
                </div>
                <div className={styles.paginationControls}>
                  <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                  >
                    Đầu
                  </button>
                  <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Trước
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx;
                    } else if (currentPage < 3) {
                      pageNum = idx;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageButton} ${
                          currentPage === pageNum ? styles.active : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau
                  </button>
                  <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Cuối
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
