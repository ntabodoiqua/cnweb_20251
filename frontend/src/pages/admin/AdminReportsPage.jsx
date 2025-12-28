import { useState, useEffect, useCallback } from "react";
import { notification } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getUserStatisticsApi,
  getAdminOrderStatisticsApi,
  getAdminProductStatisticsApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminReportsPage.module.css";

/**
 * AdminReportsPage - Trang báo cáo và thống kê
 */
const AdminReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [productStats, setProductStats] = useState(null);

  const fetchStatistics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const [userRes, orderRes, productRes] = await Promise.all([
        getUserStatisticsApi(),
        getAdminOrderStatisticsApi(10),
        getAdminProductStatisticsApi(10, 10),
      ]);

      if (userRes?.code === 1000) {
        setStatistics(userRes.result);
      }
      if (orderRes?.code === 1000) {
        setOrderStats(orderRes.result);
      }
      if (productRes?.code === 1000) {
        setProductStats(productRes.result);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải thống kê",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "#722ed1", // Tím cho Quản trị viên
      SELLER: "#ee4d2d", // Cam-đỏ cho Người bán (màu chủ đạo)
      USER: "#52c41a", // Xanh lá cho Người dùng
    };
    return colors[role] || "#999";
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: "Quản trị viên",
      SELLER: "Người bán",
      USER: "Người dùng",
    };
    return labels[role] || role;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₫0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
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

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: "#faad14",
      PAID: "#1890ff",
      CONFIRMED: "#722ed1",
      SHIPPING: "#13c2c2",
      DELIVERED: "#52c41a",
      CANCELLED: "#ff4d4f",
      RETURNED: "#fa8c16",
    };
    return colorMap[status] || "#999";
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải thống kê..." fullScreen={false} />;
  }

  if (!statistics && !orderStats && !productStats) {
    return (
      <div className={styles.adminReports}>
        <div className={styles.emptyState}>
          <BarChartOutlined style={{ fontSize: "64px", color: "#ddd" }} />
          <p>Không có dữ liệu thống kê</p>
        </div>
      </div>
    );
  }

  // Prepare user data for charts
  const roleData = statistics
    ? Object.entries(statistics.usersByRole || {}).map(([role, count]) => ({
        role,
        count,
        color: getRoleColor(role),
        label: getRoleLabel(role),
      }))
    : [];

  const monthData = statistics
    ? Object.entries(statistics.usersByMonth || {}).map(([month, count]) => ({
        month,
        count,
      }))
    : [];

  const maxRoleCount = Math.max(...roleData.map((d) => d.count), 1);
  const maxMonthCount = Math.max(...monthData.map((d) => d.count), 1);

  // Prepare order status data
  const orderStatusData = orderStats?.ordersByStatus
    ? Object.entries(orderStats.ordersByStatus).map(([status, count]) => ({
        status,
        count,
        color: getStatusColor(status),
        label: getStatusLabel(status),
      }))
    : [];

  const maxOrderStatusCount = Math.max(
    ...orderStatusData.map((d) => d.count),
    1
  );

  // Prepare revenue by month data
  const revenueByMonthData = orderStats?.revenueByMonth
    ? Object.entries(orderStats.revenueByMonth)
        .slice(-6) // Last 6 months
        .map(([month, revenue]) => ({
          month,
          revenue: Number(revenue),
        }))
    : [];

  const maxRevenue = Math.max(...revenueByMonthData.map((d) => d.revenue), 1);

  // Prepare top sellers data
  const topSellers = orderStats?.topSellers?.slice(0, 5) || [];

  // Prepare product stats
  const categoryData = productStats?.productsByCategory?.slice(0, 5) || [];
  const topProducts = productStats?.topSellingProducts?.slice(0, 5) || [];

  return (
    <div className={styles.adminReports}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>
            <BarChartOutlined /> Báo cáo & Thống kê
          </h1>
          <p>Tổng quan dữ liệu hệ thống</p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={() => fetchStatistics(false)}
          disabled={refreshing}
        >
          <ReloadOutlined spin={refreshing} />
          {refreshing ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Order Statistics Section */}
      {orderStats && (
        <div className={styles.statisticsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <ShoppingOutlined /> Thống kê đơn hàng & Doanh thu
            </h2>
            <p className={styles.sectionDescription}>
              Tổng quan về đơn hàng và doanh thu trên hệ thống
            </p>
          </div>

          {/* Order Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#52c41a" }}
              >
                <ShoppingOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng đơn hàng</div>
                <div className={styles.statValue}>
                  {formatNumber(orderStats.totalOrders)}
                </div>
                {orderStats.orderGrowthPercent !== undefined && (
                  <div
                    className={`${styles.statTrend} ${
                      orderStats.orderGrowthPercent >= 0
                        ? styles.trendUp
                        : styles.trendDown
                    }`}
                  >
                    {orderStats.orderGrowthPercent >= 0 ? (
                      <RiseOutlined />
                    ) : (
                      <FallOutlined />
                    )}
                    {orderStats.orderGrowthPercent >= 0 ? "+" : ""}
                    {orderStats.orderGrowthPercent}% so với tháng trước
                  </div>
                )}
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#ee4d2d" }}
              >
                <DollarOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng doanh thu</div>
                <div className={styles.statValue}>
                  {formatCurrency(orderStats.totalRevenue)}
                </div>
                {orderStats.revenueGrowthPercent !== undefined && (
                  <div
                    className={`${styles.statTrend} ${
                      orderStats.revenueGrowthPercent >= 0
                        ? styles.trendUp
                        : styles.trendDown
                    }`}
                  >
                    {orderStats.revenueGrowthPercent >= 0 ? (
                      <RiseOutlined />
                    ) : (
                      <FallOutlined />
                    )}
                    {orderStats.revenueGrowthPercent >= 0 ? "+" : ""}
                    {orderStats.revenueGrowthPercent}% so với tháng trước
                  </div>
                )}
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#1890ff" }}
              >
                <CalendarOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Doanh thu tháng này</div>
                <div className={styles.statValue}>
                  {formatCurrency(orderStats.thisMonthRevenue)}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#722ed1" }}
              >
                <DollarOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Giá trị TB/đơn</div>
                <div className={styles.statValue}>
                  {formatCurrency(orderStats.avgOrderValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Charts */}
          <div className={styles.chartsContainer}>
            {/* Orders by Status */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>
                  <ShoppingOutlined /> Đơn hàng theo trạng thái
                </h3>
              </div>
              <div className={styles.chartBody}>
                <div className={styles.barChart}>
                  {orderStatusData.map((item) => (
                    <div key={item.status} className={styles.barItem}>
                      <div className={styles.barLabel}>{item.label}</div>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${
                              (item.count / maxOrderStatusCount) * 100
                            }%`,
                            backgroundColor: item.color,
                          }}
                        >
                          <span className={styles.barValue}>{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue by Month */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>
                  <DollarOutlined /> Doanh thu theo tháng
                </h3>
              </div>
              <div className={styles.chartBody}>
                <div className={styles.barChart}>
                  {revenueByMonthData.map((item) => (
                    <div key={item.month} className={styles.barItem}>
                      <div className={styles.barLabel}>{item.month}</div>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(item.revenue / maxRevenue) * 100}%`,
                            backgroundColor: "#ee4d2d",
                          }}
                        >
                          <span className={styles.barValue}>
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Sellers */}
          {topSellers.length > 0 && (
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>
                  <TrophyOutlined /> Top cửa hàng doanh thu cao nhất
                </h3>
              </div>
              <div className={styles.chartBody}>
                <div className={styles.topSellersList}>
                  {topSellers.map((seller, index) => (
                    <div key={seller.storeId} className={styles.topSellerItem}>
                      <div
                        className={styles.topSellerRank}
                        style={{
                          background:
                            index === 0
                              ? "#ffd700"
                              : index === 1
                              ? "#c0c0c0"
                              : index === 2
                              ? "#cd7f32"
                              : "#e0e0e0",
                          color: index < 3 ? "#fff" : "#666",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className={styles.topSellerInfo}>
                        <div className={styles.topSellerName}>
                          {seller.storeName}
                        </div>
                        <div className={styles.topSellerMeta}>
                          {seller.deliveredOrders} đơn hoàn thành
                        </div>
                      </div>
                      <div className={styles.topSellerRevenue}>
                        {formatCurrency(seller.totalRevenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Statistics Section */}
      {productStats && (
        <div className={styles.statisticsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <AppstoreOutlined /> Thống kê sản phẩm
            </h2>
            <p className={styles.sectionDescription}>
              Tổng quan về sản phẩm và cửa hàng trên hệ thống
            </p>
          </div>

          {/* Product Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#722ed1" }}
              >
                <AppstoreOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng sản phẩm</div>
                <div className={styles.statValue}>
                  {formatNumber(productStats.totalProducts)}
                </div>
                <div className={styles.statSubLabel}>
                  {productStats.activeProducts} đang bán
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#13c2c2" }}
              >
                <ShopOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng cửa hàng</div>
                <div className={styles.statValue}>
                  {formatNumber(productStats.totalStores)}
                </div>
                <div className={styles.statSubLabel}>
                  {productStats.activeStores} đang hoạt động
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#fa8c16" }}
              >
                <BarChartOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng danh mục</div>
                <div className={styles.statValue}>
                  {formatNumber(productStats.totalCategories)}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#eb2f96" }}
              >
                <BarChartOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng nhãn hàng</div>
                <div className={styles.statValue}>
                  {formatNumber(productStats.totalBrands)}
                </div>
              </div>
            </div>
          </div>

          {/* Product Charts */}
          <div className={styles.chartsContainer}>
            {/* Products by Category */}
            {categoryData.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>
                    <AppstoreOutlined /> Top danh mục sản phẩm
                  </h3>
                </div>
                <div className={styles.chartBody}>
                  <div className={styles.barChart}>
                    {categoryData.map((item) => (
                      <div key={item.categoryId} className={styles.barItem}>
                        <div className={styles.barLabel}>
                          {item.categoryName}
                        </div>
                        <div className={styles.barWrapper}>
                          <div
                            className={styles.bar}
                            style={{
                              width: `${
                                (item.productCount /
                                  Math.max(
                                    ...categoryData.map((c) => c.productCount),
                                    1
                                  )) *
                                100
                              }%`,
                              backgroundColor: "#722ed1",
                            }}
                          >
                            <span className={styles.barValue}>
                              {item.productCount} SP
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Products */}
            {topProducts.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>
                    <TrophyOutlined /> Sản phẩm bán chạy nhất
                  </h3>
                </div>
                <div className={styles.chartBody}>
                  <div className={styles.topProductsList}>
                    {topProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        className={styles.topProductItem}
                      >
                        <div
                          className={styles.topProductRank}
                          style={{
                            background:
                              index === 0
                                ? "#ffd700"
                                : index === 1
                                ? "#c0c0c0"
                                : index === 2
                                ? "#cd7f32"
                                : "#e0e0e0",
                            color: index < 3 ? "#fff" : "#666",
                          }}
                        >
                          {index + 1}
                        </div>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className={styles.topProductImage}
                          />
                        )}
                        <div className={styles.topProductInfo}>
                          <div className={styles.topProductName}>
                            {product.productName}
                          </div>
                          <div className={styles.topProductMeta}>
                            {product.storeName} • Đã bán: {product.soldCount}
                          </div>
                        </div>
                        <div className={styles.topProductPrice}>
                          {formatCurrency(product.minPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Statistics Section */}
      {statistics && (
        <div className={styles.statisticsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <UserOutlined /> Thống kê người dùng
            </h2>
            <p className={styles.sectionDescription}>
              Tổng quan về người dùng trên hệ thống
            </p>
          </div>

          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#ee4d2d" }}
              >
                <UserOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tổng người dùng</div>
                <div className={styles.statValue}>{statistics.totalUsers}</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#52c41a" }}
              >
                <CheckCircleOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Đang hoạt động</div>
                <div className={styles.statValue}>
                  {statistics.enabledUsers}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#ff4d4f" }}
              >
                <CloseCircleOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Bị vô hiệu hóa</div>
                <div className={styles.statValue}>
                  {statistics.disabledUsers}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#faad14" }}
              >
                <TeamOutlined />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Tỷ lệ hoạt động</div>
                <div className={styles.statValue}>
                  {statistics.totalUsers > 0
                    ? (
                        (statistics.enabledUsers / statistics.totalUsers) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsContainer}>
            {/* Users by Role Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>
                  <TeamOutlined /> Người dùng theo vai trò
                </h3>
              </div>
              <div className={styles.chartBody}>
                <div className={styles.barChart}>
                  {roleData.map((item, index) => (
                    <div key={item.role} className={styles.barItem}>
                      <div className={styles.barLabel}>{item.label}</div>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(item.count / maxRoleCount) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        >
                          <span className={styles.barValue}>{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Users by Month Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>
                  <CalendarOutlined /> Người dùng theo tháng
                </h3>
              </div>
              <div className={styles.chartBody}>
                <div className={styles.barChart}>
                  {monthData.map((item, index) => (
                    <div key={item.month} className={styles.barItem}>
                      <div className={styles.barLabel}>{item.month}</div>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${(item.count / maxMonthCount) * 100}%`,
                            backgroundColor: "#ee4d2d",
                          }}
                        >
                          <span className={styles.barValue}>{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Role Distribution Pie Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>
                <BarChartOutlined /> Phân bố vai trò người dùng
              </h3>
            </div>
            <div className={styles.chartBody}>
              <div className={styles.pieChartContainer}>
                <svg className={styles.pieChart} viewBox="0 0 200 200">
                  {(() => {
                    let currentAngle = 0;
                    const total = statistics.totalUsers;
                    return roleData.map((item, index) => {
                      const percentage = (item.count / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;

                      // Calculate path for pie slice
                      const startRad = (startAngle - 90) * (Math.PI / 180);
                      const endRad = (endAngle - 90) * (Math.PI / 180);
                      const radius = 80;
                      const centerX = 100;
                      const centerY = 100;

                      const x1 = centerX + radius * Math.cos(startRad);
                      const y1 = centerY + radius * Math.sin(startRad);
                      const x2 = centerX + radius * Math.cos(endRad);
                      const y2 = centerY + radius * Math.sin(endRad);

                      const largeArc = angle > 180 ? 1 : 0;
                      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                      currentAngle = endAngle;

                      return (
                        <path
                          key={item.role}
                          d={path}
                          fill={item.color}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className={styles.pieLegend}>
                  {roleData.map((item) => (
                    <div key={item.role} className={styles.legendItem}>
                      <div
                        className={styles.legendColor}
                        style={{ backgroundColor: item.color }}
                      />
                      <div className={styles.legendText}>
                        <span className={styles.legendLabel}>{item.label}</span>
                        <span className={styles.legendValue}>
                          {item.count} (
                          {((item.count / statistics.totalUsers) * 100).toFixed(
                            1
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className={styles.summaryCard}>
            <div className={styles.chartHeader}>
              <h3>
                <BarChartOutlined /> Tổng quan thống kê người dùng
              </h3>
            </div>
            <div className={styles.summaryTable}>
              <div className={styles.summaryRow}>
                <div className={styles.summaryLabel}>Tổng số người dùng:</div>
                <div className={styles.summaryValue}>
                  {statistics.totalUsers}
                </div>
              </div>
              <div className={styles.summaryRow}>
                <div className={styles.summaryLabel}>Người dùng hoạt động:</div>
                <div
                  className={styles.summaryValue}
                  style={{ color: "#52c41a" }}
                >
                  {statistics.enabledUsers}
                </div>
              </div>
              <div className={styles.summaryRow}>
                <div className={styles.summaryLabel}>Người dùng bị khóa:</div>
                <div
                  className={styles.summaryValue}
                  style={{ color: "#ff4d4f" }}
                >
                  {statistics.disabledUsers}
                </div>
              </div>
              <div className={styles.summaryDivider} />
              {roleData.map((item) => (
                <div key={item.role} className={styles.summaryRow}>
                  <div className={styles.summaryLabel}>{item.label}:</div>
                  <div
                    className={styles.summaryValue}
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
