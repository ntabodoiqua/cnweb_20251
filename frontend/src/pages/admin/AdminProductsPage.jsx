import { useState } from "react";
import {
  ShopOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";

/**
 * AdminProductsPage - Trang quản lý sản phẩm
 */
const AdminProductsPage = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Laptop Dell XPS 13",
      category: "Laptop",
      price: "25,000,000",
      stock: 15,
      sold: 45,
      status: "active",
      seller: "TechStore",
      createdAt: "2024-10-01",
    },
    {
      id: 2,
      name: "iPhone 15 Pro Max",
      category: "Smartphone",
      price: "35,000,000",
      stock: 8,
      sold: 120,
      status: "active",
      seller: "MobileShop",
      createdAt: "2024-10-15",
    },
    {
      id: 3,
      name: "Samsung Galaxy S24",
      category: "Smartphone",
      price: "22,000,000",
      stock: 0,
      sold: 67,
      status: "out_of_stock",
      seller: "MobileShop",
      createdAt: "2024-09-20",
    },
    {
      id: 4,
      name: "MacBook Pro M3",
      category: "Laptop",
      price: "45,000,000",
      stock: 5,
      sold: 23,
      status: "active",
      seller: "AppleStore",
      createdAt: "2024-11-01",
    },
    {
      id: 5,
      name: "AirPods Pro 2",
      category: "Accessory",
      price: "6,500,000",
      stock: 30,
      sold: 200,
      status: "active",
      seller: "AppleStore",
      createdAt: "2024-08-12",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Laptop", "Smartphone", "Accessory", "Tablet"];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "status-active";
      case "out_of_stock":
        return "status-out-stock";
      case "inactive":
        return "status-inactive";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang bán";
      case "out_of_stock":
        return "Hết hàng";
      case "inactive":
        return "Ngừng bán";
      default:
        return status;
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      console.log("Delete product:", productId);
    }
  };

  return (
    <div className="admin-products">
      {/* Stats */}
      <div
        className="admin-stats-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tổng sản phẩm</span>
            <div className="admin-stat-icon">
              <ShopOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{products.length}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đang bán</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              }}
            >
              <ShopOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">
            {products.filter((p) => p.status === "active").length}
          </h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Hết hàng</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
              }}
            >
              <ShopOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">
            {products.filter((p) => p.status === "out_of_stock").length}
          </h2>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-section">
        <div className="admin-toolbar">
          <div className="admin-filters">
            <div className="admin-search-box">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, người bán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              <option value="all">Tất cả danh mục</option>
              {categories
                .filter((c) => c !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
          <button className="admin-btn admin-btn-primary">
            <PlusOutlined />
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Danh sách sản phẩm ({filteredProducts.length})
        </h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Người bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>#{product.id}</strong>
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <strong style={{ color: "#ee4d2d" }}>
                        ₫{product.price}
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          color: product.stock > 0 ? "#52c41a" : "#ff4d4f",
                        }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.sold}</td>
                    <td>{product.seller}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          product.status
                        )}`}
                      >
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-action-btn view"
                          title="Xem chi tiết"
                        >
                          <EyeOutlined />
                        </button>
                        <button
                          className="admin-action-btn edit"
                          title="Chỉnh sửa"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          className="admin-action-btn delete"
                          title="Xóa"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
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
      </div>

      <style jsx>{`
        .admin-products {
          animation: fadeIn 0.5s ease-out;
        }

        .admin-section {
          margin-bottom: 24px;
        }

        .admin-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-section-title::before {
          content: "";
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          border-radius: 2px;
        }

        .admin-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .admin-filters {
          display: flex;
          gap: 12px;
          flex: 1;
          flex-wrap: wrap;
        }

        .admin-search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 16px;
        }

        .admin-search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }

        .admin-search-input:focus {
          border-color: #ee4d2d;
          box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .admin-select {
          padding: 12px 16px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
          background: white;
          cursor: pointer;
          min-width: 180px;
        }

        .admin-select:focus {
          border-color: #ee4d2d;
          box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .status-active {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-out-stock {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .status-inactive {
          background: rgba(0, 0, 0, 0.1);
          color: #666;
        }

        .admin-action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .admin-action-btn {
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

        .admin-action-btn.view {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .admin-action-btn.view:hover {
          background: #52c41a;
          color: white;
          transform: scale(1.1);
        }

        .admin-action-btn.edit {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .admin-action-btn.edit:hover {
          background: #1890ff;
          color: white;
          transform: scale(1.1);
        }

        .admin-action-btn.delete {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .admin-action-btn.delete:hover {
          background: #ff4d4f;
          color: white;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .admin-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-filters {
            flex-direction: column;
          }

          .admin-search-box {
            min-width: 100%;
          }

          .admin-select {
            width: 100%;
          }

          .admin-toolbar .admin-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminProductsPage;
