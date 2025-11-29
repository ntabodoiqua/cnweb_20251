import {
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from "@ant-design/icons";

/**
 * AdminPaymentsPage - Trang quản lý thanh toán
 */
const AdminPaymentsPage = () => {
  const payments = [
    {
      id: "PAY-2024-001",
      orderId: "ORD-2024-001",
      customer: "Nguyễn Văn A",
      amount: "47,500,000",
      method: "VNPay",
      status: "completed",
      createdAt: "2024-11-14 09:35",
    },
    {
      id: "PAY-2024-002",
      orderId: "ORD-2024-002",
      customer: "Trần Thị B",
      amount: "35,000,000",
      method: "MoMo",
      status: "completed",
      createdAt: "2024-11-14 08:20",
    },
    {
      id: "PAY-2024-003",
      orderId: "ORD-2024-003",
      customer: "Lê Văn C",
      amount: "28,500,000",
      method: "COD",
      status: "pending",
      createdAt: "2024-11-13 16:50",
    },
    {
      id: "PAY-2024-004",
      orderId: "ORD-2024-004",
      customer: "Phạm Thị D",
      amount: "52,000,000",
      method: "Bank Transfer",
      status: "pending",
      createdAt: "2024-11-13 14:25",
    },
    {
      id: "PAY-2024-005",
      orderId: "ORD-2024-005",
      customer: "Hoàng Văn E",
      amount: "6,500,000",
      method: "VNPay",
      status: "refunded",
      createdAt: "2024-11-12 11:15",
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      case "refunded":
        return "status-refunded";
      case "failed":
        return "status-failed";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "refunded":
        return "Đã hoàn tiền";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const stats = {
    total: payments.reduce(
      (sum, p) => sum + parseFloat(p.amount.replace(/,/g, "")),
      0
    ),
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    refunded: payments.filter((p) => p.status === "refunded").length,
  };

  return (
    <div className="admin-payments">
      {/* Stats */}
      <div
        className="admin-stats-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tổng doanh thu</span>
            <div className="admin-stat-icon">
              <DollarOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">₫{stats.total.toLocaleString()}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã thanh toán</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              }}
            >
              <CreditCardOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.completed}</h2>
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
              <WalletOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.pending}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã hoàn tiền</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
              }}
            >
              <DollarOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.refunded}</h2>
        </div>
      </div>

      {/* Payments Table */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Danh sách giao dịch ({payments.length})
        </h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.id}</strong>
                  </td>
                  <td>{payment.orderId}</td>
                  <td>{payment.customer}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>
                      ₫{payment.amount}
                    </strong>
                  </td>
                  <td>{payment.method}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        payment.status
                      )}`}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td>{payment.createdAt}</td>
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

      <style jsx>{`
        .admin-payments {
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

        .status-pending {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-refunded {
          background: rgba(0, 0, 0, 0.1);
          color: #666;
        }

        .status-failed {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }
      `}</style>
    </div>
  );
};

export default AdminPaymentsPage;
