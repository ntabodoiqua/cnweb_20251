import { useState } from "react";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

/**
 * AdminOverviewPage - Trang tổng quan dashboard
 * Hiển thị các thống kê quan trọng và biểu đồ
 */
const AdminOverviewPage = () => {
  // Mock data - sẽ thay thế bằng API sau
  const stats = [
    {
      id: 1,
      title: "Tổng người dùng",
      value: "12,543",
      icon: <UserOutlined />,
      trend: { type: "up", value: "+12.5%" },
      label: "So với tháng trước",
    },
    {
      id: 2,
      title: "Tổng đơn hàng",
      value: "8,234",
      icon: <ShoppingOutlined />,
      trend: { type: "up", value: "+8.2%" },
      label: "So với tháng trước",
    },
    {
      id: 3,
      title: "Doanh thu",
      value: "₫45,231,890",
      icon: <DollarOutlined />,
      trend: { type: "up", value: "+23.5%" },
      label: "So với tháng trước",
    },
    {
      id: 4,
      title: "Sản phẩm",
      value: "2,456",
      icon: <ShoppingOutlined />,
      trend: { type: "down", value: "-2.4%" },
      label: "So với tháng trước",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-2024-001",
      customer: "Nguyễn Văn A",
      product: "Laptop Dell XPS 13",
      amount: "₫25,000,000",
      status: "Đang xử lý",
      date: "2024-11-14",
    },
    {
      id: "ORD-2024-002",
      customer: "Trần Thị B",
      product: "iPhone 15 Pro Max",
      amount: "₫35,000,000",
      status: "Hoàn thành",
      date: "2024-11-14",
    },
    {
      id: "ORD-2024-003",
      customer: "Lê Văn C",
      product: "Samsung Galaxy S24",
      amount: "₫22,000,000",
      status: "Đang giao",
      date: "2024-11-13",
    },
    {
      id: "ORD-2024-004",
      customer: "Phạm Thị D",
      product: "MacBook Pro M3",
      amount: "₫45,000,000",
      status: "Đang xử lý",
      date: "2024-11-13",
    },
    {
      id: "ORD-2024-005",
      customer: "Hoàng Văn E",
      product: "AirPods Pro 2",
      amount: "₫6,500,000",
      status: "Hoàn thành",
      date: "2024-11-12",
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "status-completed";
      case "Đang xử lý":
        return "status-processing";
      case "Đang giao":
        return "status-shipping";
      case "Đã hủy":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="admin-overview">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">{stat.title}</span>
              <div className="admin-stat-icon">{stat.icon}</div>
            </div>
            <h2 className="admin-stat-value">{stat.value}</h2>
            <div className="admin-stat-label">
              <span className={`admin-stat-trend ${stat.trend.type}`}>
                {stat.trend.type === "up" ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}
                {stat.trend.value}
              </span>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="admin-section">
        <h2 className="admin-section-title">Đơn hàng gần đây</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                  </td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>{order.amount}</strong>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2 className="admin-section-title">Thao tác nhanh</h2>
        <div className="admin-quick-actions">
          <button className="admin-btn admin-btn-primary">
            <UserOutlined />
            Thêm người dùng mới
          </button>
          <button className="admin-btn admin-btn-primary">
            <ShoppingOutlined />
            Thêm sản phẩm mới
          </button>
          <button className="admin-btn admin-btn-secondary">
            <DollarOutlined />
            Xem báo cáo doanh thu
          </button>
        </div>
      </div>

      <style jsx>{`
        .admin-overview {
          animation: fadeIn 0.5s ease-out;
        }

        .admin-section {
          margin-bottom: 32px;
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

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .status-completed {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-processing {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-shipping {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .status-cancelled {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .admin-quick-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .admin-quick-actions {
            flex-direction: column;
          }

          .admin-quick-actions .admin-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOverviewPage;
