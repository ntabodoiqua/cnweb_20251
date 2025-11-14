import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ShopOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import AddProductModal from "../../components/seller/AddProductModal";
import { getProductsByStoreApi } from "../../util/api";
import styles from "./SellerProductsPage.module.css";

/**
 * SellerProductsPage - Trang quản lý sản phẩm của người bán
 */
const SellerProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(
    "61127fcd-8c22-4e3e-9419-93c7c05d9f83"
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
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
          sku: `SKU-${product.id.substring(0, 8).toUpperCase()}`,
          category: product.platformCategoryName || "Chưa phân loại",
          storeCategory: product.storeCategoryName,
          price: `₫${product.minPrice.toLocaleString("vi-VN")}${
            product.maxPrice > product.minPrice
              ? ` - ₫${product.maxPrice.toLocaleString("vi-VN")}`
              : ""
          }`,
          minPrice: product.minPrice,
          maxPrice: product.maxPrice,
          stock: 0, // API doesn't provide stock info
          sold: product.soldCount,
          status: product.active ? "active" : "inactive",
          image: product.thumbnailImage || "https://via.placeholder.com/60",
          brandName: product.brandName,
          rating: product.averageRating,
          ratingCount: product.ratingCount,
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
      message.error("Không thể tải danh sách sản phẩm");
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
      image: "https://via.placeholder.com/60",
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
      image: "https://via.placeholder.com/60",
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
      image: "https://via.placeholder.com/60",
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
      image: "https://via.placeholder.com/60",
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
      image: "https://via.placeholder.com/60",
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
      image: "https://via.placeholder.com/60",
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
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status, stock) => {
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
    message.success("Tạo sản phẩm thành công!");
  };

  const handleViewProduct = (productId) => {
    navigate(`/seller/products/${productId}`);
  };

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
          <button
            className={`${styles.sellerBtn} ${styles.sellerBtnPrimary}`}
            onClick={handleAddProduct}
          >
            <PlusOutlined />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.sellerTableContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <LoadingOutlined style={{ fontSize: 48, color: "#ee4d2d" }} />
            <p>Đang tải sản phẩm...</p>
          </div>
        )}
        <table className={styles.sellerTable}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục Shop</th>
              <th>Danh mục Platform</th>
              <th>Thương hiệu</th>
              <th>Giá bán</th>
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
                  <td>{product.storeCategory || "-"}</td>
                  <td>{product.category}</td>
                  <td>{product.brandName || "-"}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>
                      {product.price}
                    </strong>
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
                <td colSpan="9" className={styles.noData}>
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
            {
              filteredProducts.filter(
                (p) => p.status === "active" && p.stock > 0
              ).length
            }
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
