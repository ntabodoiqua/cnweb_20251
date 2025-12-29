import { useState, useEffect, useCallback } from "react";
import { notification, Tooltip } from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getSellerOrderStatisticsApi } from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";

/**
 * SellerStatisticsPage - Trang thống kê và báo cáo của người bán
 * Hiển thị các thống kê chi tiết về đơn hàng, doanh thu, sản phẩm bán chạy
 */
const SellerStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Fetch dữ liệu thống kê
  const fetchStatistics = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await getSellerOrderStatisticsApi(null, 10);

      if (response?.code === 1000) {
        setStatistics(response.result);
      } else {
        notification.error({
          message: "Lỗi",
          description: response?.message || "Không thể tải thống kê",
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải thống kê. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Format số tiền VND
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₫0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format số lớn
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Format số tiền ngắn gọn
  const formatShortCurrency = (amount) => {
    if (!amount) return "0";
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + "B";
    }
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + "M";
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + "K";
    }
    return amount.toString();
  };

  // Get status class cho đơn hàng
  const getStatusClass = (status) => {
    const statusMap = {
      PENDING: "status-pending",
      PAID: "status-paid",
      CONFIRMED: "status-confirmed",
      SHIPPING: "status-shipping",
      DELIVERED: "status-completed",
      CANCELLED: "status-cancelled",
      RETURNED: "status-returned",
    };
    return statusMap[status] || "";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labelMap = {
      PENDING: "Chờ xử lý",
      PAID: "Đã thanh toán",
      CONFIRMED: "Đã xác nhận",
      SHIPPING: "Đang giao",
      DELIVERED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      RETURNED: "Đã trả hàng",
    };
    return labelMap[status] || status;
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải thống kê..." fullScreen={false} />;
  }

  // Prepare chart data
  const revenueData = statistics?.revenueByMonth || {};
  const maxRevenue = Math.max(...Object.values(revenueData), 1);

  return (
    <div className="seller-statistics">
      {/* Header với nút refresh */}
      <div className="statistics-header">
        <div>
          <h1>Thống kê & Báo cáo</h1>
          {statistics?.storeName && (
            <p className="store-name">{statistics.storeName}</p>
          )}
        </div>
        <button
          className="refresh-btn"
          onClick={() => fetchStatistics(false)}
          disabled={refreshing}
        >
          <ReloadOutlined spin={refreshing} />
          {refreshing ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Summary Cards - Row 1 */}
      <div className="stats-summary-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <DollarOutlined className="stats-icon revenue" />
            <span className="stats-title">Tổng doanh thu</span>
          </div>
          <div className="stats-value">
            {formatCurrency(statistics?.totalRevenue)}
          </div>
          <div
            className={`stats-trend ${
              statistics?.revenueGrowthPercent >= 0 ? "positive" : "negative"
            }`}
          >
            {statistics?.revenueGrowthPercent >= 0 ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )}
            {statistics?.revenueGrowthPercent >= 0 ? "+" : ""}
            {statistics?.revenueGrowthPercent || 0}% so với tháng trước
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <ShoppingOutlined className="stats-icon orders" />
            <span className="stats-title">Tổng đơn hàng</span>
          </div>
          <div className="stats-value">
            {formatNumber(statistics?.totalOrders)}
          </div>
          <div
            className={`stats-trend ${
              statistics?.orderGrowthPercent >= 0 ? "positive" : "negative"
            }`}
          >
            {statistics?.orderGrowthPercent >= 0 ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )}
            {statistics?.orderGrowthPercent >= 0 ? "+" : ""}
            {statistics?.orderGrowthPercent || 0}% so với tháng trước
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <BarChartOutlined className="stats-icon average" />
            <span className="stats-title">Giá trị TB/đơn</span>
          </div>
          <div className="stats-value">
            {formatCurrency(statistics?.avgOrderValue)}
          </div>
          <div className="stats-trend info">
            <CalendarOutlined /> Dựa trên đơn hoàn thành
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <UserOutlined className="stats-icon customers" />
            <span className="stats-title">Khách hàng</span>
          </div>
          <div className="stats-value">
            {formatNumber(statistics?.totalCustomers)}
          </div>
          <div className="stats-trend info">
            +{formatNumber(statistics?.newCustomersThisMonth)} khách mới tháng
            này
          </div>
        </div>
      </div>

      {/* Revenue Detail Cards */}
      <div className="revenue-detail-grid">
        <div className="revenue-detail-card">
          <div className="revenue-detail-label">Doanh thu hôm nay</div>
          <div className="revenue-detail-value">
            {formatCurrency(statistics?.todayRevenue)}
          </div>
          <div className="revenue-detail-orders">
            {formatNumber(statistics?.todayOrders)} đơn hàng
          </div>
        </div>
        <div className="revenue-detail-card">
          <div className="revenue-detail-label">Doanh thu tuần này</div>
          <div className="revenue-detail-value">
            {formatCurrency(statistics?.thisWeekRevenue)}
          </div>
          <div className="revenue-detail-orders">
            {formatNumber(statistics?.thisWeekOrders)} đơn hàng
          </div>
        </div>
        <div className="revenue-detail-card">
          <div className="revenue-detail-label">Doanh thu tháng này</div>
          <div className="revenue-detail-value">
            {formatCurrency(statistics?.thisMonthRevenue)}
          </div>
          <div className="revenue-detail-orders">
            {formatNumber(statistics?.thisMonthOrders)} đơn hàng
          </div>
        </div>
        <div className="revenue-detail-card">
          <div className="revenue-detail-label">Doanh thu tháng trước</div>
          <div className="revenue-detail-value">
            {formatCurrency(statistics?.lastMonthRevenue)}
          </div>
          <div className="revenue-detail-orders">
            {formatNumber(statistics?.lastMonthOrders)} đơn hàng
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      {statistics?.ordersByStatus && (
        <div className="chart-section">
          <h2 className="section-title">
            <BarChartOutlined />
            Phân bố trạng thái đơn hàng
          </h2>
          <div className="order-status-grid">
            {Object.entries(statistics.ordersByStatus).map(
              ([status, count]) => (
                <div
                  key={status}
                  className={`order-status-card ${getStatusClass(status)}`}
                >
                  <span className="status-count">{formatNumber(count)}</span>
                  <span className="status-label">{getStatusLabel(status)}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {statistics?.revenueByMonth &&
        Object.keys(statistics.revenueByMonth).length > 0 && (
          <div className="chart-section">
            <h2 className="section-title">
              <LineChartOutlined />
              Doanh thu theo tháng (12 tháng gần nhất)
            </h2>
            <div className="revenue-chart">
              {Object.entries(statistics.revenueByMonth).map(
                ([month, revenue]) => {
                  const percentage =
                    maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={month} className="chart-bar-container">
                      <div className="chart-bar-wrapper">
                        <Tooltip title={formatCurrency(revenue)}>
                          <div
                            className="chart-bar"
                            style={{ height: `${Math.max(percentage, 5)}%` }}
                          >
                            <div className="chart-value">
                              {formatShortCurrency(revenue)}
                            </div>
                          </div>
                        </Tooltip>
                      </div>
                      <div className="chart-label">{month.slice(5)}</div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

      <div className="two-columns">
        {/* Top Selling Products */}
        {statistics?.topProducts && statistics.topProducts.length > 0 && (
          <div className="chart-section">
            <h2 className="section-title">
              <TrophyOutlined />
              Sản phẩm bán chạy nhất
            </h2>
            <div className="seller-table-container">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topProducts.map((product, index) => (
                    <tr key={product.productId}>
                      <td>
                        <span className={`rank-badge rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="product-cell">
                          {product.productImage && (
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              className="product-thumbnail"
                            />
                          )}
                          <span className="product-name">
                            {product.productName}
                          </span>
                        </div>
                      </td>
                      <td>{formatNumber(product.soldCount)}</td>
                      <td>
                        <strong style={{ color: "#ee4d2d" }}>
                          {formatCurrency(product.totalRevenue)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {statistics?.recentOrders && statistics.recentOrders.length > 0 && (
          <div className="chart-section">
            <h2 className="section-title">
              <ShoppingOutlined />
              Đơn hàng gần đây
            </h2>
            <div className="seller-table-container">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                      </td>
                      <td>
                        {order.customerFullName || order.customerUsername}
                      </td>
                      <td>
                        <strong style={{ color: "#ee4d2d" }}>
                          {formatCurrency(order.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Stats */}
      <div className="chart-section customer-stats">
        <h2 className="section-title">
          <UserOutlined />
          Thống kê khách hàng
        </h2>
        <div className="customer-stats-grid">
          <div className="customer-stat-card">
            <div className="customer-stat-icon total">
              <UserOutlined />
            </div>
            <div className="customer-stat-info">
              <div className="customer-stat-value">
                {formatNumber(statistics?.totalCustomers)}
              </div>
              <div className="customer-stat-label">Tổng khách hàng</div>
            </div>
          </div>
          <div className="customer-stat-card">
            <div className="customer-stat-icon new">
              <RiseOutlined />
            </div>
            <div className="customer-stat-info">
              <div className="customer-stat-value">
                {formatNumber(statistics?.newCustomersThisMonth)}
              </div>
              <div className="customer-stat-label">Khách mới tháng này</div>
            </div>
          </div>
          <div className="customer-stat-card">
            <div className="customer-stat-icon returning">
              <ReloadOutlined />
            </div>
            <div className="customer-stat-info">
              <div className="customer-stat-value">
                {formatNumber(statistics?.returningCustomers)}
              </div>
              <div className="customer-stat-label">Khách quay lại</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .seller-statistics {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .statistics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .statistics-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .store-name {
          color: #666;
          font-size: 14px;
          margin: 4px 0 0 0;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(238, 77, 45, 0.4);
        }

        .refresh-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .stats-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stats-card {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
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
          margin-bottom: 12px;
        }

        .stats-icon {
          font-size: 28px;
          padding: 10px;
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

        .stats-icon.customers {
          background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
          color: white;
        }

        .stats-title {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .stats-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }

        .stats-trend {
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stats-trend.positive {
          color: #52c41a;
        }

        .stats-trend.negative {
          color: #ff4d4f;
        }

        .stats-trend.info {
          color: #666;
        }

        .revenue-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .revenue-detail-card {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
        }

        .revenue-detail-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }

        .revenue-detail-value {
          font-size: 22px;
          font-weight: 700;
          color: #ee4d2d;
          margin-bottom: 4px;
        }

        .revenue-detail-orders {
          font-size: 12px;
          color: #999;
        }

        .chart-section {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title .anticon {
          color: #ee4d2d;
          font-size: 22px;
        }

        .order-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .order-status-card {
          text-align: center;
          padding: 16px;
          border-radius: 10px;
          background: #f5f5f5;
        }

        .order-status-card.status-pending {
          background: #fff7e6;
        }
        .order-status-card.status-paid {
          background: #e6f7ff;
        }
        .order-status-card.status-confirmed {
          background: #f9f0ff;
        }
        .order-status-card.status-shipping {
          background: #e6fffb;
        }
        .order-status-card.status-completed {
          background: #f6ffed;
        }
        .order-status-card.status-cancelled {
          background: #fff1f0;
        }
        .order-status-card.status-returned {
          background: #f0f0f0;
        }

        .status-count {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .status-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .revenue-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
          height: 280px;
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
          height: 240px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .chart-bar {
          width: 100%;
          max-width: 50px;
          background: linear-gradient(180deg, #ee4d2d 0%, #ff6b35 100%);
          border-radius: 6px 6px 0 0;
          position: relative;
          transition: all 0.3s ease;
          min-height: 20px;
          cursor: pointer;
        }

        .chart-bar:hover {
          background: linear-gradient(180deg, #d73211 0%, #ee5a2d 100%);
          transform: scaleY(1.02);
        }

        .chart-value {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
        }

        .chart-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
        }

        .two-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .seller-table-container {
          overflow-x: auto;
        }

        .seller-table {
          width: 100%;
          border-collapse: collapse;
        }

        .seller-table th,
        .seller-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e8e8e8;
        }

        .seller-table th {
          background: #fafafa;
          font-weight: 600;
          color: #666;
          font-size: 13px;
        }

        .seller-table tbody tr:hover {
          background: #f5f5f5;
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 12px;
        }

        .rank-badge.rank-1 {
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #333;
        }
        .rank-badge.rank-2 {
          background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
          color: #333;
        }
        .rank-badge.rank-3 {
          background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .product-thumbnail {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e8e8e8;
        }

        .product-name {
          font-weight: 500;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.status-pending {
          background: #fff7e6;
          color: #fa8c16;
        }
        .status-badge.status-paid {
          background: #e6f7ff;
          color: #1890ff;
        }
        .status-badge.status-confirmed {
          background: #f9f0ff;
          color: #722ed1;
        }
        .status-badge.status-shipping {
          background: #e6fffb;
          color: #13c2c2;
        }
        .status-badge.status-completed {
          background: #f6ffed;
          color: #52c41a;
        }
        .status-badge.status-cancelled {
          background: #fff1f0;
          color: #ff4d4f;
        }
        .status-badge.status-returned {
          background: #f0f0f0;
          color: #595959;
        }

        .customer-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .customer-stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fafafa;
          border-radius: 10px;
        }

        .customer-stat-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 24px;
          color: white;
        }

        .customer-stat-icon.total {
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        }
        .customer-stat-icon.new {
          background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
        }
        .customer-stat-icon.returning {
          background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
        }

        .customer-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .customer-stat-label {
          font-size: 13px;
          color: #666;
        }

        @media (max-width: 768px) {
          .statistics-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .stats-summary-grid {
            grid-template-columns: 1fr;
          }

          .two-columns {
            grid-template-columns: 1fr;
          }

          .revenue-chart {
            height: 220px;
            gap: 4px;
          }

          .chart-bar-wrapper {
            height: 180px;
          }

          .chart-bar {
            max-width: 30px;
          }

          .chart-value {
            font-size: 9px;
          }

          .chart-label {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerStatisticsPage;
