import { useState } from "react";
import {
  ShoppingOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

/**
 * AdminOrdersPage - Trang quản lý đơn hàng
 */
const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([
    {
      id: "ORD-2024-001",
      customer: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      products: 3,
      amount: "47,500,000",
      status: "pending",
      paymentStatus: "paid",
      createdAt: "2024-11-14 09:30",
    },
    {
      id: "ORD-2024-002",
      customer: "Trần Thị B",
      email: "tranthib@example.com",
      products: 1,
      amount: "35,000,000",
      status: "completed",
      paymentStatus: "paid",
      createdAt: "2024-11-14 08:15",
    },
    {
      id: "ORD-2024-003",
      customer: "Lê Văn C",
      email: "levanc@example.com",
      products: 2,
      amount: "28,500,000",
      status: "shipping",
      paymentStatus: "paid",
      createdAt: "2024-11-13 16:45",
    },
    {
      id: "ORD-2024-004",
      customer: "Phạm Thị D",
      email: "phamthid@example.com",
      products: 4,
      amount: "52,000,000",
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2024-11-13 14:20",
    },
    {
      id: "ORD-2024-005",
      customer: "Hoàng Văn E",
      email: "hoangvane@example.com",
      products: 1,
      amount: "6,500,000",
      status: "cancelled",
      paymentStatus: "refunded",
      createdAt: "2024-11-12 11:10",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statuses = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "confirmed":
        return "status-confirmed";
      case "shipping":
        return "status-shipping";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="payment-paid">Đã thanh toán</span>;
      case "pending":
        return <span className="payment-pending">Chưa thanh toán</span>;
      case "refunded":
        return <span className="payment-refunded">Đã hoàn tiền</span>;
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    shipping: orders.filter((o) => o.status === "shipping").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="admin-orders">
      {/* Stats */}
      <div
        className="admin-stats-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tổng đơn hàng</span>
            <div className="admin-stat-icon">
              <ShoppingOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{orderStats.total}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Chờ xử lý</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              }}
            >
              <ShoppingOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{orderStats.pending}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đang giao</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              }}
            >
              <ShoppingOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{orderStats.shipping}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Hoàn thành</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              }}
            >
              <ShoppingOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{orderStats.completed}</h2>
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
                placeholder="Tìm kiếm theo mã đơn, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="admin-select"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Danh sách đơn hàng ({filteredOrders.length})
        </h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Số SP</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.email}</td>
                    <td>{order.products}</td>
                    <td>
                      <strong style={{ color: "#ee4d2d" }}>
                        ₫{order.amount}
                      </strong>
                    </td>
                    <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{order.createdAt}</td>
                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-action-btn view"
                          title="Xem chi tiết"
                        >
                          <EyeOutlined />
                        </button>
                        {order.status === "pending" && (
                          <>
                            <button
                              className="admin-action-btn confirm"
                              title="Xác nhận"
                            >
                              <CheckCircleOutlined />
                            </button>
                            <button
                              className="admin-action-btn cancel"
                              title="Hủy"
                            >
                              <CloseCircleOutlined />
                            </button>
                          </>
                        )}
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
                      <ShoppingOutlined
                        style={{ fontSize: "64px", color: "#ddd" }}
                      />
                      <p>Không tìm thấy đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .admin-orders {
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

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .status-pending {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-confirmed {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .status-shipping {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .status-completed {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-cancelled {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .payment-paid {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .payment-pending {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .payment-refunded {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
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
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .admin-action-btn.view:hover {
          background: #1890ff;
          color: white;
          transform: scale(1.1);
        }

        .admin-action-btn.confirm {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .admin-action-btn.confirm:hover {
          background: #52c41a;
          color: white;
          transform: scale(1.1);
        }

        .admin-action-btn.cancel {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .admin-action-btn.cancel:hover {
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
        }
      `}</style>
    </div>
  );
};

export default AdminOrdersPage;
