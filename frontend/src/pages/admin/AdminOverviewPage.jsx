import { useState, useEffect, useCallback } from "react";
import { notification, Spin, Empty, Tooltip, Progress } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  TrophyOutlined,
  EyeOutlined,
  StarOutlined,
  ReloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import {
  getAdminOrderStatisticsApi,
  getAdminProductStatisticsApi,
  getUserStatisticsApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./AdminOverviewPage.css";

/**
 * AdminOverviewPage - Trang tổng quan dashboard
 * Hiển thị các thống kê quan trọng và biểu đồ
 */
const AdminOverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State cho các thống kê
  const [orderStats, setOrderStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // Fetch tất cả dữ liệu thống kê
  const fetchAllStatistics = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const [orderRes, productRes, userRes] = await Promise.all([
        getAdminOrderStatisticsApi(10),
        getAdminProductStatisticsApi(10, 10),
        getUserStatisticsApi(),
      ]);

      // Note: axios interceptor đã unwrap response.data, nên orderRes đã là data
      if (orderRes?.code === 1000) {
        setOrderStats(orderRes.result);
      }
      if (productRes?.code === 1000) {
        setProductStats(productRes.result);
      }
      if (userRes?.code === 1000) {
        setUserStats(userRes.result);
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
    fetchAllStatistics();
  }, [fetchAllStatistics]);

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

  // Tính toán các thống kê tổng hợp
  const totalUsers = userStats?.totalUsers || 0;
  const totalOrders = orderStats?.totalOrders || 0;
  const totalRevenue = orderStats?.totalRevenue || 0;
  const totalProducts = productStats?.totalProducts || 0;
  const totalStores = productStats?.totalStores || 0;
  const totalCategories = productStats?.totalCategories || 0;
  const totalBrands = productStats?.totalBrands || 0;

  // Stats cards data
  const statsCards = [
    {
      id: 1,
      title: "Tổng người dùng",
      value: formatNumber(totalUsers),
      icon: <UserOutlined />,
      trend: userStats?.enabledUsers
        ? { type: "info", value: `${userStats.enabledUsers} active` }
        : null,
      color: "#1890ff",
    },
    {
      id: 2,
      title: "Tổng đơn hàng",
      value: formatNumber(totalOrders),
      icon: <ShoppingOutlined />,
      trend:
        orderStats?.orderGrowthPercent !== undefined
          ? {
              type: orderStats.orderGrowthPercent >= 0 ? "up" : "down",
              value: `${orderStats.orderGrowthPercent >= 0 ? "+" : ""}${
                orderStats.orderGrowthPercent
              }%`,
            }
          : null,
      color: "#52c41a",
    },
    {
      id: 3,
      title: "Doanh thu",
      value: formatCurrency(totalRevenue),
      icon: <DollarOutlined />,
      trend:
        orderStats?.revenueGrowthPercent !== undefined
          ? {
              type: orderStats.revenueGrowthPercent >= 0 ? "up" : "down",
              value: `${orderStats.revenueGrowthPercent >= 0 ? "+" : ""}${
                orderStats.revenueGrowthPercent
              }%`,
            }
          : null,
      color: "#ee4d2d",
    },
    {
      id: 4,
      title: "Sản phẩm",
      value: formatNumber(totalProducts),
      icon: <AppstoreOutlined />,
      trend: productStats?.activeProducts
        ? { type: "info", value: `${productStats.activeProducts} active` }
        : null,
      color: "#722ed1",
    },
    {
      id: 5,
      title: "Cửa hàng",
      value: formatNumber(totalStores),
      icon: <ShopOutlined />,
      trend: productStats?.activeStores
        ? { type: "info", value: `${productStats.activeStores} active` }
        : null,
      color: "#13c2c2",
    },
    {
      id: 6,
      title: "Danh mục",
      value: formatNumber(totalCategories),
      icon: <TagsOutlined />,
      trend: null,
      color: "#fa8c16",
    },
  ];

  return (
    <div className="admin-overview">
      {/* Header với nút refresh */}
      <div className="overview-header">
        <h1>Tổng quan hệ thống</h1>
        <button
          className="refresh-btn"
          onClick={() => fetchAllStatistics(false)}
          disabled={refreshing}
        >
          <ReloadOutlined spin={refreshing} />
          {refreshing ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statsCards.map((stat) => (
          <div key={stat.id} className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">{stat.title}</span>
              <div
                className="admin-stat-icon"
                style={{
                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                }}
              >
                {stat.icon}
              </div>
            </div>
            <h2 className="admin-stat-value">{stat.value}</h2>
            {stat.trend && (
              <div className="admin-stat-label">
                <span className={`admin-stat-trend ${stat.trend.type}`}>
                  {stat.trend.type === "up" && <ArrowUpOutlined />}
                  {stat.trend.type === "down" && <ArrowDownOutlined />}
                  {stat.trend.value}
                </span>
                {stat.trend.type !== "info" && <span>So với tháng trước</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Overview */}
      {orderStats?.revenueByMonth && (
        <div className="admin-section">
          <h2 className="admin-section-title">
            <LineChartOutlined /> Doanh thu theo tháng
          </h2>
          <div className="revenue-chart-container">
            <div className="revenue-bars">
              {Object.entries(orderStats.revenueByMonth).map(
                ([month, revenue]) => {
                  const maxRevenue = Math.max(
                    ...Object.values(orderStats.revenueByMonth)
                  );
                  const percentage =
                    maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={month} className="revenue-bar-item">
                      <Tooltip title={formatCurrency(revenue)}>
                        <div className="revenue-bar-wrapper">
                          <div
                            className="revenue-bar"
                            style={{ height: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                      </Tooltip>
                      <span className="revenue-bar-label">
                        {month.slice(5)}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
          <div className="revenue-summary">
            <div className="revenue-summary-item">
              <span>Hôm nay:</span>
              <strong>{formatCurrency(orderStats.todayRevenue)}</strong>
            </div>
            <div className="revenue-summary-item">
              <span>Tháng này:</span>
              <strong>{formatCurrency(orderStats.thisMonthRevenue)}</strong>
            </div>
            <div className="revenue-summary-item">
              <span>Trung bình/đơn:</span>
              <strong>{formatCurrency(orderStats.avgOrderValue)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Distribution */}
      {orderStats?.ordersByStatus && (
        <div className="admin-section">
          <h2 className="admin-section-title">
            <BarChartOutlined /> Phân bố trạng thái đơn hàng
          </h2>
          <div className="order-status-grid">
            {Object.entries(orderStats.ordersByStatus).map(
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

      <div className="admin-two-columns">
        {/* Top Sellers */}
        {orderStats?.topSellers && orderStats.topSellers.length > 0 && (
          <div className="admin-section">
            <h2 className="admin-section-title">
              <TrophyOutlined /> Top Sellers doanh thu cao nhất
            </h2>
            <div className="top-list">
              {orderStats.topSellers.slice(0, 5).map((seller, index) => (
                <div key={seller.storeId} className="top-list-item">
                  <div className="top-rank" data-rank={index + 1}>
                    {index + 1}
                  </div>
                  <div className="top-info">
                    <div className="top-name">{seller.storeName}</div>
                    <div className="top-meta">
                      {formatNumber(seller.deliveredOrders)} đơn hoàn thành
                    </div>
                  </div>
                  <div className="top-value">
                    {formatCurrency(seller.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products */}
        {productStats?.topSellingProducts &&
          productStats.topSellingProducts.length > 0 && (
            <div className="admin-section">
              <h2 className="admin-section-title">
                <RiseOutlined /> Top sản phẩm bán chạy
              </h2>
              <div className="top-list">
                {productStats.topSellingProducts
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.productId} className="top-list-item">
                      <div className="top-rank" data-rank={index + 1}>
                        {index + 1}
                      </div>
                      <div className="top-info">
                        <div className="top-name">{product.productName}</div>
                        <div className="top-meta">
                          <span>
                            <ShopOutlined /> {product.storeName}
                          </span>
                          {product.averageRating && (
                            <span>
                              <StarOutlined />{" "}
                              {product.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="top-value">
                        <div className="sold-count">
                          {formatNumber(product.soldCount)} đã bán
                        </div>
                        <div className="view-count">
                          <EyeOutlined /> {formatNumber(product.viewCount)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>

      <div className="admin-two-columns">
        {/* Stats by Category */}
        {productStats?.productsByCategory &&
          productStats.productsByCategory.length > 0 && (
            <div className="admin-section">
              <h2 className="admin-section-title">
                <TagsOutlined /> Thống kê theo danh mục
              </h2>
              <div className="category-stats-list">
                {productStats.productsByCategory.slice(0, 8).map((cat) => (
                  <div key={cat.categoryId} className="category-stat-item">
                    <div className="category-info">
                      <span className="category-name">{cat.categoryName}</span>
                      {cat.parentCategoryName && (
                        <span className="category-parent">
                          ({cat.parentCategoryName})
                        </span>
                      )}
                    </div>
                    <div className="category-metrics">
                      <span className="metric">
                        <AppstoreOutlined /> {formatNumber(cat.productCount)} SP
                      </span>
                      <span className="metric">
                        <ShoppingOutlined /> {formatNumber(cat.totalSoldCount)}{" "}
                        đã bán
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Stats by Brand */}
        {productStats?.productsByBrand &&
          productStats.productsByBrand.length > 0 && (
            <div className="admin-section">
              <h2 className="admin-section-title">
                <TagsOutlined /> Thống kê theo nhãn hàng
              </h2>
              <div className="brand-stats-list">
                {productStats.productsByBrand.slice(0, 8).map((brand) => (
                  <div key={brand.brandId} className="brand-stat-item">
                    <div className="brand-info">
                      {brand.logoUrl && (
                        <img
                          src={brand.logoUrl}
                          alt={brand.brandName}
                          className="brand-logo"
                        />
                      )}
                      <span className="brand-name">{brand.brandName}</span>
                    </div>
                    <div className="brand-metrics">
                      <span className="metric">
                        <AppstoreOutlined /> {formatNumber(brand.productCount)}{" "}
                        SP
                      </span>
                      <span className="metric">
                        <ShoppingOutlined />{" "}
                        {formatNumber(brand.totalSoldCount)} đã bán
                      </span>
                      {brand.avgRating && (
                        <span className="metric">
                          <StarOutlined /> {brand.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Recent Orders Table */}
      {orderStats?.recentOrders && orderStats.recentOrders.length > 0 && (
        <div className="admin-section">
          <h2 className="admin-section-title">
            <ShoppingOutlined /> Đơn hàng gần đây
          </h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Cửa hàng</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {orderStats.recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>{order.customerUsername}</td>
                    <td>{order.storeName}</td>
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
                    <td>{order.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverviewPage;
