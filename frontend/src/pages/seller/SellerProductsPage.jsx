import { useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ShopOutlined,
} from "@ant-design/icons";

/**
 * SellerProductsPage - Trang quản lý sản phẩm của người bán
 */
const SellerProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock data
  const products = [
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
      return <span className="status-badge status-out-of-stock">Hết hàng</span>;
    }
    if (stock < 10) {
      return <span className="status-badge status-low-stock">Sắp hết</span>;
    }
    return <span className="status-badge status-active">Đang bán</span>;
  };

  return (
    <div className="seller-products">
      {/* Header Actions */}
      <div className="seller-products-header">
        <div className="seller-search-box">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="seller-filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Tất cả danh mục" : cat}
              </option>
            ))}
          </select>
          <button className="seller-btn seller-btn-primary">
            <PlusOutlined />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="seller-table-container">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Đã bán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>
                      {product.price}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={product.stock < 10 ? "low-stock-text" : ""}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.sold}</td>
                  <td>{getStatusBadge(product.status, product.stock)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="Xem chi tiết"
                      >
                        <EyeOutlined />
                      </button>
                      <button className="action-btn edit-btn" title="Chỉnh sửa">
                        <EditOutlined />
                      </button>
                      <button className="action-btn delete-btn" title="Xóa">
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <ShopOutlined style={{ fontSize: "48px", color: "#ccc" }} />
                  <p>Không tìm thấy sản phẩm nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="products-summary">
        <div className="summary-item">
          <span className="summary-label">Tổng sản phẩm:</span>
          <span className="summary-value">{filteredProducts.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Đang bán:</span>
          <span className="summary-value">
            {
              filteredProducts.filter(
                (p) => p.status === "active" && p.stock > 0
              ).length
            }
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Hết hàng:</span>
          <span className="summary-value">
            {filteredProducts.filter((p) => p.stock === 0).length}
          </span>
        </div>
      </div>

      <style jsx>{`
        .seller-products {
          animation: fadeIn 0.5s ease-out;
        }

        .seller-products-header {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        .seller-search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 18px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #ee4d2d;
          box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .seller-filter-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .filter-select:focus {
          outline: none;
          border-color: #ee4d2d;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e8e8e8;
        }

        .low-stock-text {
          color: #ff4d4f;
          font-weight: 600;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .status-active {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-low-stock {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-out-of-stock {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .view-btn {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .view-btn:hover {
          background: #1890ff;
          color: white;
          transform: scale(1.1);
        }

        .edit-btn {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .edit-btn:hover {
          background: #faad14;
          color: white;
          transform: scale(1.1);
        }

        .delete-btn {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .delete-btn:hover {
          background: #ff4d4f;
          color: white;
          transform: scale(1.1);
        }

        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .no-data p {
          margin-top: 16px;
          font-size: 16px;
        }

        .products-summary {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(
            135deg,
            rgba(238, 77, 45, 0.05) 0%,
            rgba(255, 107, 53, 0.05) 100%
          );
          border-radius: 12px;
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-label {
          font-size: 14px;
          color: #666;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #ee4d2d;
        }

        @media (max-width: 768px) {
          .seller-products-header {
            flex-direction: column;
            align-items: stretch;
          }

          .seller-search-box {
            min-width: 100%;
          }

          .seller-filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select,
          .seller-btn {
            width: 100%;
          }

          .products-summary {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerProductsPage;
