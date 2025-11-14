import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

/**
 * AdminReportsPage - Trang báo cáo và thống kê
 */
const AdminReportsPage = () => {
  return (
    <div className="admin-reports">
      {/* Report Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Doanh thu tháng này</span>
            <div className="admin-stat-icon">
              <BarChartOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">₫245,231,890</h2>
          <div className="admin-stat-label">
            <span className="admin-stat-trend up">+23.5%</span>
            <span>So với tháng trước</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đơn hàng tháng này</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              }}
            >
              <LineChartOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">1,234</h2>
          <div className="admin-stat-label">
            <span className="admin-stat-trend up">+15.2%</span>
            <span>So với tháng trước</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Người dùng mới</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              }}
            >
              <PieChartOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">456</h2>
          <div className="admin-stat-label">
            <span className="admin-stat-trend up">+8.7%</span>
            <span>So với tháng trước</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tỷ lệ chuyển đổi</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              }}
            >
              <BarChartOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">3.24%</h2>
          <div className="admin-stat-label">
            <span className="admin-stat-trend down">-1.2%</span>
            <span>So với tháng trước</span>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="admin-section">
        <h2 className="admin-section-title">Top sản phẩm bán chạy</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
                <th>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>1</strong>
                </td>
                <td>iPhone 15 Pro Max</td>
                <td>Smartphone</td>
                <td>120</td>
                <td>
                  <strong style={{ color: "#ee4d2d" }}>₫4,200,000,000</strong>
                </td>
                <td>
                  <span className="trend-badge up">↑ 15%</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>2</strong>
                </td>
                <td>MacBook Pro M3</td>
                <td>Laptop</td>
                <td>85</td>
                <td>
                  <strong style={{ color: "#ee4d2d" }}>₫3,825,000,000</strong>
                </td>
                <td>
                  <span className="trend-badge up">↑ 23%</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>3</strong>
                </td>
                <td>Samsung Galaxy S24</td>
                <td>Smartphone</td>
                <td>67</td>
                <td>
                  <strong style={{ color: "#ee4d2d" }}>₫1,474,000,000</strong>
                </td>
                <td>
                  <span className="trend-badge down">↓ 5%</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>4</strong>
                </td>
                <td>Laptop Dell XPS 13</td>
                <td>Laptop</td>
                <td>45</td>
                <td>
                  <strong style={{ color: "#ee4d2d" }}>₫1,125,000,000</strong>
                </td>
                <td>
                  <span className="trend-badge up">↑ 8%</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>5</strong>
                </td>
                <td>AirPods Pro 2</td>
                <td>Accessory</td>
                <td>200</td>
                <td>
                  <strong style={{ color: "#ee4d2d" }}>₫1,300,000,000</strong>
                </td>
                <td>
                  <span className="trend-badge up">↑ 12%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Biểu đồ doanh thu theo thời gian
        </h2>
        <div className="chart-placeholder">
          <BarChartOutlined style={{ fontSize: "64px", color: "#ddd" }} />
          <p>Biểu đồ sẽ được tích hợp sau khi có API</p>
        </div>
      </div>

      <style jsx>{`
        .admin-reports {
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

        .trend-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .trend-badge.up {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .trend-badge.down {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .chart-placeholder {
          background: linear-gradient(
            135deg,
            rgba(238, 77, 45, 0.03) 0%,
            rgba(255, 107, 53, 0.03) 100%
          );
          border: 2px dashed rgba(238, 77, 45, 0.2);
          border-radius: 12px;
          padding: 80px 20px;
          text-align: center;
          color: #999;
        }

        .chart-placeholder p {
          margin-top: 16px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default AdminReportsPage;
