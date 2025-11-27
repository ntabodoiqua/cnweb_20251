import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { notification, Modal, Switch } from "antd";
import AddProductModal from "../../components/seller/AddProductModal";
import {
  getProductsByStoreApi,
  bulkUpdateProductStatusApi,
  getMyStoresApi,
} from "../../util/api";
import NoImages from "../../assets/NoImages.webp";
import styles from "./SellerProductsPage.module.css";

/**
 * SellerProductsPage - Trang quản lý sản phẩm của người bán
 */
const SellerProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Fetch stores của người bán hiện tại
  useEffect(() => {
    const fetchMyStores = async () => {
      try {
        setStoreLoading(true);
        const response = await getMyStoresApi(0, 100);
        if (response && response.result && response.result.content) {
          const myStores = response.result.content;
          setStores(myStores);
          // Tự động chọn store đầu tiên nếu có
          if (myStores.length > 0 && !selectedStoreId) {
            setSelectedStoreId(myStores[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching my stores:", error);
        notification.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể tải danh sách cửa hàng của bạn",
          placement: "topRight",
        });
      } finally {
        setStoreLoading(false);
      }
    };
    fetchMyStores();
  }, []);

  // Fetch products from API
  useEffect(() => {
    if (selectedStoreId) {
      fetchProducts();
    }
  }, [selectedStoreId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsByStoreApi(
        selectedStoreId,
        pagination.page,
        pagination.size
      );

      if (response && response.result) {
        const { content, totalElements, totalPages, number, size } =
          response.result;

        // Transform API data to component format
        const transformedProducts = content.map((product) => ({
          id: product.id,
          name: product.name,
          shortDescription: product.shortDescription,
          sku: `SKU-${product.id.substring(0, 8).toUpperCase()}`,
          category: product.platformCategoryName || "Chưa phân loại",
          storeCategories: product.storeCategoryName || null,
          storeName: product.storeName,
          storeId: product.storeId,
          price: `₫${product.minPrice.toLocaleString("vi-VN")}${
            product.maxPrice > product.minPrice
              ? ` - ₫${product.maxPrice.toLocaleString("vi-VN")}`
              : ""
          }`,
          minPrice: product.minPrice,
          maxPrice: product.maxPrice,
          stock: product.totalAvailableStock || 0,
          sold: product.soldCount || 0,
          status: product.active ? "active" : "inactive",
          image: product.thumbnailImage || NoImages,
          brandName: product.brandName,
          rating: product.averageRating,
          ratingCount: product.ratingCount || 0,
          createdAt: product.createdAt,
        }));

        setProducts(transformedProducts);
        setPagination({
          page: number,
          size: size,
          totalElements: totalElements,
          totalPages: totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách sản phẩm",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      sku: "IPH15PM256",
      category: "Điện thoại",
      price: "₫35,000,000",
      stock: 23,
      sold: 45,
      status: "active",
      image: NoImages,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      sku: "SGS24U",
      category: "Điện thoại",
      price: "₫30,000,000",
      stock: 15,
      sold: 38,
      status: "active",
      image: NoImages,
    },
    {
      id: 3,
      name: "MacBook Pro M3 14 inch",
      sku: "MBPM314",
      category: "Laptop",
      price: "₫45,000,000",
      stock: 8,
      sold: 27,
      status: "active",
      image: NoImages,
    },
    {
      id: 4,
      name: "Dell XPS 13 Plus",
      sku: "DXPS13P",
      category: "Laptop",
      price: "₫25,000,000",
      stock: 12,
      sold: 22,
      status: "active",
      image: NoImages,
    },
    {
      id: 5,
      name: "AirPods Pro 2nd Gen",
      sku: "APP2",
      category: "Phụ kiện",
      price: "₫6,500,000",
      stock: 45,
      sold: 156,
      status: "active",
      image: NoImages,
    },
    {
      id: 6,
      name: "iPad Air M2 11 inch",
      sku: "IPADAIR11M2",
      category: "Máy tính bảng",
      price: "₫18,000,000",
      stock: 0,
      sold: 34,
      status: "out_of_stock",
      image: NoImages,
    },
  ];

  const categories = [
    "all",
    "Điện thoại",
    "Laptop",
    "Máy tính bảng",
    "Phụ kiện",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status, stock) => {
    if (status === "inactive") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
          Ngừng bán
        </span>
      );
    }
    if (status === "out_of_stock" || stock === 0) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusOutOfStock}`}>
          Hết hàng
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusLowStock}`}>
          Sắp hết
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
        Đang bán
      </span>
    );
  };

  const handleAddProduct = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleProductCreated = () => {
    fetchProducts(); // Refresh product list
    notification.success({
      message: "Thành công",
      description: "Tạo sản phẩm thành công!",
      placement: "topRight",
      duration: 2,
    });
  };

  const handleViewProduct = (productId) => {
    navigate(`/seller/products/${productId}`);
  };

  const handleSelectProduct = (productId, checked) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedProducts(checked ? filteredProducts.map((p) => p.id) : []);
  };

  const handleBulkUpdateStatus = async (isActive) => {
    if (selectedProducts.length === 0) {
      notification.warning({
        message: "Chưa chọn sản phẩm",
        description: "Vui lòng chọn ít nhất một sản phẩm",
        placement: "topRight",
      });
      return;
    }

    // Show warning when deactivating products
    if (!isActive) {
      Modal.confirm({
        title: "Xác nhận vô hiệu hóa sản phẩm",
        content: (
          <div>
            <p style={{ marginBottom: "12px" }}>
              Bạn đang chuẩn bị vô hiệu hóa{" "}
              <strong>{selectedProducts.length}</strong> sản phẩm.
            </p>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: 0, color: "#d46b08", fontWeight: 600 }}>
                ⚠️ Lưu ý quan trọng:
              </p>
              <p style={{ margin: "8px 0 0 0", color: "#595959" }}>
                Khi vô hiệu hóa sản phẩm, <strong>toàn bộ biến thể</strong> của
                sản phẩm cũng sẽ bị vô hiệu hóa. Khách hàng sẽ không thể xem và
                mua các sản phẩm này nữa.
              </p>
            </div>
          </div>
        ),
        okText: "Xác nhận vô hiệu hóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        width: 500,
        onOk: async () => {
          try {
            await bulkUpdateProductStatusApi(selectedProducts, isActive);
            notification.success({
              message: "Thành công",
              description: `Vô hiệu hóa ${selectedProducts.length} sản phẩm thành công`,
              placement: "topRight",
              duration: 2,
            });
            setSelectedProducts([]);
            fetchProducts();
          } catch (error) {
            console.error("Error bulk updating product status:", error);
            notification.error({
              message: "Lỗi cập nhật",
              description: "Không thể cập nhật trạng thái sản phẩm",
              placement: "topRight",
            });
          }
        },
      });
    } else {
      // No warning for activation
      try {
        await bulkUpdateProductStatusApi(selectedProducts, isActive);
        notification.success({
          message: "Thành công",
          description: `Kích hoạt ${selectedProducts.length} sản phẩm thành công`,
          placement: "topRight",
          duration: 2,
        });
        setSelectedProducts([]);
        fetchProducts();
      } catch (error) {
        console.error("Error bulk updating product status:", error);
        notification.error({
          message: "Lỗi cập nhật",
          description: "Không thể cập nhật trạng thái sản phẩm",
          placement: "topRight",
        });
      }
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    const isActive = currentStatus !== "active";

    // Show warning when deactivating a product
    if (!isActive) {
      Modal.confirm({
        title: "Xác nhận vô hiệu hóa sản phẩm",
        content: (
          <div>
            <p style={{ marginBottom: "12px" }}>
              Bạn đang chuẩn bị vô hiệu hóa sản phẩm này.
            </p>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: 0, color: "#d46b08", fontWeight: 600 }}>
                ⚠️ Lưu ý quan trọng:
              </p>
              <p style={{ margin: "8px 0 0 0", color: "#595959" }}>
                Khi vô hiệu hóa sản phẩm, <strong>toàn bộ biến thể</strong> của
                sản phẩm cũng sẽ bị vô hiệu hóa. Khách hàng sẽ không thể xem và
                mua sản phẩm này nữa.
              </p>
            </div>
          </div>
        ),
        okText: "Xác nhận vô hiệu hóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        width: 500,
        onOk: async () => {
          try {
            await bulkUpdateProductStatusApi([productId], isActive);
            notification.success({
              message: "Thành công",
              description: "Vô hiệu hóa sản phẩm thành công",
              placement: "topRight",
              duration: 2,
            });
            fetchProducts();
          } catch (error) {
            console.error("Error updating product status:", error);
            notification.error({
              message: "Lỗi cập nhật",
              description: "Không thể cập nhật trạng thái sản phẩm",
              placement: "topRight",
            });
          }
        },
      });
    } else {
      // No warning for activation
      try {
        await bulkUpdateProductStatusApi([productId], isActive);
        notification.success({
          message: "Thành công",
          description: "Kích hoạt sản phẩm thành công",
          placement: "topRight",
          duration: 2,
        });
        fetchProducts();
      } catch (error) {
        console.error("Error updating product status:", error);
        notification.error({
          message: "Lỗi cập nhật",
          description: "Không thể cập nhật trạng thái sản phẩm",
          placement: "topRight",
        });
      }
    }
  };

  // Loading khi đang fetch stores
  if (storeLoading) {
    return (
      <div className={styles.sellerProducts}>
        <LoadingSpinner />
      </div>
    );
  }

  // Chưa có cửa hàng nào
  if (!stores || stores.length === 0) {
    return (
      <div className={styles.sellerProducts}>
        <div className={styles.emptyState}>
          <ShopOutlined className={styles.emptyIcon} />
          <h3>Bạn chưa có cửa hàng nào</h3>
          <p>Vui lòng tạo cửa hàng trước khi quản lý sản phẩm</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sellerProducts}>
      {/* Header Actions */}
      <div className={styles.sellerProductsHeader}>
        <div className={styles.sellerSearchBox}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.sellerFilterGroup}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Tất cả danh mục" : cat}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
          <button
            className={`${styles.sellerBtn} ${styles.sellerBtnPrimary}`}
            onClick={handleAddProduct}
          >
            <PlusOutlined />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className={styles.bulkActionsBar}>
          <div className={styles.bulkActionsInfo}>
            <span>
              Đã chọn <strong>{selectedProducts.length}</strong> sản phẩm
            </span>
          </div>
          <div className={styles.bulkActionsButtons}>
            <button
              className={`${styles.sellerBtn} ${styles.sellerBtnSuccess}`}
              onClick={() => handleBulkUpdateStatus(true)}
            >
              Kích hoạt ({selectedProducts.length})
            </button>
            <button
              className={`${styles.sellerBtn} ${styles.sellerBtnDanger}`}
              onClick={() => handleBulkUpdateStatus(false)}
            >
              Vô hiệu hóa ({selectedProducts.length})
            </button>
            <button
              className={`${styles.sellerBtn} ${styles.sellerBtnDefault}`}
              onClick={() => setSelectedProducts([])}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className={styles.sellerTableContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <LoadingSpinner tip="Đang tải sản phẩm..." fullScreen={false} />
          </div>
        )}
        <table className={styles.sellerTable}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>
                <input
                  type="checkbox"
                  checked={
                    filteredProducts.length > 0 &&
                    selectedProducts.length === filteredProducts.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th>Sản phẩm</th>
              <th>Danh mục Shop</th>
              <th>Danh mục Platform</th>
              <th>Thương hiệu</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Đã bán</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) =>
                        handleSelectProduct(product.id, e.target.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>
                    <div className={styles.productInfo}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                      />
                      <div>
                        <strong>{product.name}</strong>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          ID: {product.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {product.storeCategories &&
                    product.storeCategories.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        {product.storeCategories.map((cat, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              backgroundColor: "rgba(238, 77, 45, 0.1)",
                              color: "#ee4d2d",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brandName || "-"}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>
                      {product.price}
                    </strong>
                  </td>
                  <td>
                    <span
                      style={{
                        color:
                          product.stock === 0
                            ? "#ff4d4f"
                            : product.stock < 10
                            ? "#faad14"
                            : "#52c41a",
                        fontWeight: "500",
                      }}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.sold}</td>
                  <td>
                    {product.rating ? (
                      <div>
                        <span style={{ color: "#ffce3d" }}>★</span>{" "}
                        {product.rating.toFixed(1)} ({product.ratingCount})
                      </div>
                    ) : (
                      <span style={{ color: "#999" }}>Chưa có đánh giá</span>
                    )}
                  </td>
                  <td>{getStatusBadge(product.status, product.stock)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <div className={styles.statusToggle}>
                        <span className={styles.toggleLabel}>
                          {product.status === "active"
                            ? "Đang bán"
                            : "Ngừng bán"}
                        </span>
                        <Switch
                          checked={product.status === "active"}
                          onChange={() =>
                            handleToggleProductStatus(
                              product.id,
                              product.status
                            )
                          }
                          checkedChildren="ON"
                          unCheckedChildren="OFF"
                        />
                      </div>
                      <button
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                        title="Xem chi tiết"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        <EyeOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className={styles.noData}>
                  <ShopOutlined style={{ fontSize: "48px", color: "#ccc" }} />
                  <p>Không tìm thấy sản phẩm nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className={styles.productsSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tổng sản phẩm:</span>
          <span className={styles.summaryValue}>{filteredProducts.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Đang bán:</span>
          <span className={styles.summaryValue}>
            {filteredProducts.filter((p) => p.status === "active").length}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Ngừng bán:</span>
          <span className={styles.summaryValue}>
            {filteredProducts.filter((p) => p.status === "inactive").length}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Hết hàng:</span>
          <span className={styles.summaryValue}>
            {filteredProducts.filter((p) => p.stock === 0).length}
          </span>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSuccess={handleProductCreated}
        storeId={selectedStoreId}
      />
    </div>
  );
};

export default SellerProductsPage;
