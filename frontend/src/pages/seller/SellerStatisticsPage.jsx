import {
  BarChartOutlined,
  LineChartOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

/**
 * SellerStatisticsPage - Trang thống kê và báo cáo của người bán
 */
const SellerStatisticsPage = () => {
  // Mock data
  const revenueByMonth = [
    { month: "T1", revenue: 45000000 },
    { month: "T2", revenue: 52000000 },
    { month: "T3", revenue: 48000000 },
    { month: "T4", revenue: 65000000 },
    { month: "T5", revenue: 71000000 },
    { month: "T6", revenue: 68000000 },
    { month: "T7", revenue: 82000000 },
    { month: "T8", revenue: 89000000 },
    { month: "T9", revenue: 95000000 },
    { month: "T10", revenue: 102000000 },
    { month: "T11", revenue: 118000000 },
  ];

  const topSellingProducts = [
    { name: "iPhone 15 Pro Max", quantity: 156, revenue: "₫5,460,000,000" },
    { name: "Samsung Galaxy S24", quantity: 123, revenue: "₫3,690,000,000" },
    { name: "MacBook Pro M3", quantity: 89, revenue: "₫4,005,000,000" },
    { name: "AirPods Pro 2", quantity: 234, revenue: "₫1,521,000,000" },
    { name: "iPad Air M2", quantity: 67, revenue: "₫1,206,000,000" },
  ];

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue));

  return (
    <div className="seller-statistics">
      {/* Summary Cards */}
      <div className="stats-summary-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <DollarOutlined className="stats-icon revenue" />
            <span className="stats-title">Tổng doanh thu (2024)</span>
          </div>
          <div className="stats-value">₫835,000,000</div>
          <div className="stats-trend positive">+28.5% so với 2023</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <ShoppingOutlined className="stats-icon orders" />
            <span className="stats-title">Tổng đơn hàng</span>
          </div>
          <div className="stats-value">2,456</div>
          <div className="stats-trend positive">+18.3% so với tháng trước</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <BarChartOutlined className="stats-icon average" />
            <span className="stats-title">Đơn hàng trung bình</span>
          </div>
          <div className="stats-value">₫340,000</div>
          <div className="stats-trend positive">+5.2% so với tháng trước</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <h2 className="section-title">
          <LineChartOutlined />
          Doanh thu theo tháng (2024)
        </h2>
        <div className="revenue-chart">
          {revenueByMonth.map((item) => (
            <div key={item.month} className="chart-bar-container">
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                >
                  <div className="chart-value">
                    {(item.revenue / 1000000).toFixed(0)}M
                  </div>
                </div>
              </div>
              <div className="chart-label">{item.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="chart-section">
        <h2 className="section-title">
          <BarChartOutlined />
          Sản phẩm bán chạy nhất
        </h2>
        <div className="seller-table-container">
          <table className="seller-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                    <span className="rank-badge">{index + 1}</span>
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.quantity}</td>
                  <td>
                    <strong style={{ color: "#ee4d2d" }}>
                      {product.revenue}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .seller-statistics {
          animation: fadeIn 0.5s ease-out;
        }

        .stats-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stats-card {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          border-color: #ee4d2d;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(238, 77, 45, 0.15);
        }

        .stats-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .stats-icon {
          font-size: 32px;
          padding: 12px;
          border-radius: 10px;
        }

        .stats-icon.revenue {
          background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
          color: white;
        }

        .stats-icon.orders {
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
          color: white;
        }

        .stats-icon.average {
          background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
          color: white;
        }

        .stats-title {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .stats-value {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .stats-trend {
          font-size: 14px;
          font-weight: 600;
        }

        .stats-trend.positive {
          color: #52c41a;
        }

        .stats-trend.negative {
          color: #ff4d4f;
        }

        .chart-section {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title .anticon {
          color: #ee4d2d;
          font-size: 24px;
        }

        .revenue-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          height: 300px;
          padding: 20px 0;
        }

        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .chart-bar-wrapper {
          width: 100%;
          height: 260px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .chart-bar {
          width: 100%;
          max-width: 60px;
          background: linear-gradient(180deg, #ee4d2d 0%, #ff6b35 100%);
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: all 0.3s ease;
          min-height: 20px;
        }

        .chart-bar:hover {
          background: linear-gradient(180deg, #d73211 0%, #ee5a2d 100%);
          transform: scaleY(1.05);
        }

        .chart-value {
          position: absolute;
          top: -28px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
        }

        .chart-label {
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .stats-summary-grid {
            grid-template-columns: 1fr;
          }

          .revenue-chart {
            height: 250px;
            gap: 8px;
          }

          .chart-bar-wrapper {
            height: 210px;
          }

          .chart-bar {
            max-width: 40px;
          }

          .chart-value {
            font-size: 11px;
          }

          .chart-label {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerStatisticsPage;
