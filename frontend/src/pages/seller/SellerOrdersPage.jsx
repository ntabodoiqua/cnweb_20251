import { useState } from "react";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";

/**
 * SellerOrdersPage - Trang quản lý đơn hàng của người bán
 */
const SellerOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data
  const orders = [
    {
      id: "ORD-2024-156",
      customer: "Nguyễn Văn A",
      phone: "0901234567",
      product: "Laptop Dell XPS 13",
      quantity: 1,
      amount: "₫25,000,000",
      status: "pending",
      date: "2024-11-14 10:30",
      address: "123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    },
    {
      id: "ORD-2024-157",
      customer: "Trần Thị B",
      phone: "0902345678",
      product: "iPhone 15 Pro Max",
      quantity: 1,
      amount: "₫35,000,000",
      status: "preparing",
      date: "2024-11-14 09:15",
      address: "456 Giải Phóng, Thanh Xuân, Hà Nội",
    },
    {
      id: "ORD-2024-158",
      customer: "Lê Văn C",
      phone: "0903456789",
      product: "Samsung Galaxy S24",
      quantity: 2,
      amount: "₫44,000,000",
      status: "shipping",
      date: "2024-11-14 08:45",
      address: "789 Láng Hạ, Đống Đa, Hà Nội",
    },
    {
      id: "ORD-2024-159",
      customer: "Phạm Thị D",
      phone: "0904567890",
      product: "MacBook Pro M3",
      quantity: 1,
      amount: "₫45,000,000",
      status: "completed",
      date: "2024-11-13 16:20",
      address: "321 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    },
    {
      id: "ORD-2024-160",
      customer: "Hoàng Văn E",
      phone: "0905678901",
      product: "AirPods Pro 2",
      quantity: 3,
      amount: "₫19,500,000",
      status: "completed",
      date: "2024-11-13 14:10",
      address: "654 Tôn Đức Thắng, Đống Đa, Hà Nội",
    },
    {
      id: "ORD-2024-161",
      customer: "Đặng Thị F",
      phone: "0906789012",
      product: "iPad Air M2",
      quantity: 1,
      amount: "₫18,000,000",
      status: "cancelled",
      date: "2024-11-12 11:30",
      address: "987 Xuân Thủy, Cầu Giấy, Hà Nội",
    },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "preparing", label: "Đang chuẩn bị" },
    { value: "shipping", label: "Đang giao hàng" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <ClockCircleOutlined />,
        label: "Chờ xác nhận",
        className: "status-pending",
      },
      preparing: {
        icon: <CheckCircleOutlined />,
        label: "Đang chuẩn bị",
        className: "status-preparing",
      },
      shipping: {
        icon: <CarOutlined />,
        label: "Đang giao",
        className: "status-shipping",
      },
      completed: {
        icon: <CheckCircleOutlined />,
        label: "Hoàn thành",
        className: "status-completed",
      },
      cancelled: {
        icon: <CloseCircleOutlined />,
        label: "Đã hủy",
        className: "status-cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getStatusCount = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <div className="seller-orders">
      {/* Status Summary Cards */}
      <div className="status-summary-grid">
        {statusOptions.slice(1).map((statusOpt) => (
          <div
            key={statusOpt.value}
            className={`status-summary-card ${
              filterStatus === statusOpt.value ? "active" : ""
            }`}
            onClick={() => setFilterStatus(statusOpt.value)}
          >
            <div className="status-count">
              {getStatusCount(statusOpt.value)}
            </div>
            <div className="status-label">{statusOpt.label}</div>
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="seller-orders-header">
        <div className="seller-search-box">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="seller-table-container">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>SL</th>
              <th>Tổng tiền</th>
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
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customer}</div>
                      <div className="customer-phone">{order.phone}</div>
                    </div>
                  </td>
                  <td className="product-cell">{order.product}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>{order.amount}</strong>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{order.date}</td>
                  <td>
                    <button
                      className="action-btn view-btn"
                      title="Xem chi tiết"
                    >
                      <EyeOutlined />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <ClockCircleOutlined
                    style={{ fontSize: "48px", color: "#ccc" }}
                  />
                  <p>Không tìm thấy đơn hàng nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .seller-orders {
          animation: fadeIn 0.5s ease-out;
        }

        .status-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .status-summary-card {
          padding: 20px;
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .status-summary-card:hover,
        .status-summary-card.active {
          border-color: #ee4d2d;
          background: linear-gradient(
            135deg,
            rgba(238, 77, 45, 0.05) 0%,
            rgba(255, 107, 53, 0.05) 100%
          );
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(238, 77, 45, 0.15);
        }

        .status-count {
          font-size: 32px;
          font-weight: 700;
          color: #ee4d2d;
          margin-bottom: 8px;
        }

        .status-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .seller-orders-header {
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

        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          min-width: 200px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #ee4d2d;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-name {
          font-weight: 600;
          color: #333;
        }

        .customer-phone {
          font-size: 13px;
          color: #888;
        }

        .product-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .status-pending {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-preparing {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .status-shipping {
          background: rgba(114, 46, 209, 0.1);
          color: #722ed1;
        }

        .status-completed {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-cancelled {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
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

        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .no-data p {
          margin-top: 16px;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .status-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .seller-orders-header {
            flex-direction: column;
            align-items: stretch;
          }

          .seller-search-box {
            min-width: 100%;
          }

          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerOrdersPage;
