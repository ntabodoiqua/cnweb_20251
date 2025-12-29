import { useState, useEffect, useCallback } from "react";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShopOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { getSellerOrderStatisticsApi } from "../../util/api";
import { PROTECTED_ROUTES } from "../../constants/routes";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./seller-overview.module.css";

/**
 * SellerOverviewPage - Trang tổng quan dashboard người bán
 * Hiển thị các thống kê quan trọng về cửa hàng
 */
const SellerOverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Fetch dữ liệu thống kê
  const fetchStatistics = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await getSellerOrderStatisticsApi(null, 5);

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

  const getStatusClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return styles.statusCompleted;
      case "PENDING":
        return styles.statusPending;
      case "PAID":
      case "CONFIRMED":
        return styles.statusPreparing;
      case "SHIPPING":
        return styles.statusShipping;
      case "CANCELLED":
        return styles.statusCancelled;
      case "RETURNED":
        return styles.statusReturned;
      default:
        return "";
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải thống kê..." fullScreen={false} />;
  }

  // Build stats array từ API data
  const stats = [
    {
      id: 1,
      title: "Đơn hàng hôm nay",
      value: formatNumber(statistics?.todayOrders || 0),
      icon: <ShoppingOutlined />,
      trend: {
        type: statistics?.orderGrowthPercent >= 0 ? "up" : "down",
        value: `${statistics?.orderGrowthPercent >= 0 ? "+" : ""}${(
          statistics?.orderGrowthPercent || 0
        ).toFixed(1)}%`,
      },
      label: "So với tháng trước",
    },
    {
      id: 2,
      title: "Doanh thu hôm nay",
      value: formatCurrency(statistics?.todayRevenue || 0),
      icon: <DollarOutlined />,
      trend: {
        type: statistics?.revenueGrowthPercent >= 0 ? "up" : "down",
        value: `${statistics?.revenueGrowthPercent >= 0 ? "+" : ""}${(
          statistics?.revenueGrowthPercent || 0
        ).toFixed(1)}%`,
      },
      label: "So với tháng trước",
    },
    {
      id: 3,
      title: "Tổng đơn hàng",
      value: formatNumber(statistics?.totalOrders || 0),
      icon: <ShopOutlined />,
      trend: {
        type: "up",
        value: `+${statistics?.thisMonthOrders || 0}`,
      },
      label: "Đơn tháng này",
    },
    {
      id: 4,
      title: "Khách hàng",
      value: formatNumber(statistics?.totalCustomers || 0),
      icon: <UserOutlined />,
      trend: {
        type: statistics?.newCustomersThisMonth > 0 ? "up" : "down",
        value: `+${statistics?.newCustomersThisMonth || 0}`,
      },
      label: "Khách mới tháng này",
    },
  ];

  // Recent orders từ API
  const recentOrders = statistics?.recentOrders?.slice(0, 5) || [];

  // Top products từ API
  const topProducts = statistics?.topProducts || [];

  return (
    <div className={styles.sellerOverview}>
      {/* Header với nút refresh */}
      <div className={styles.overviewHeader}>
        <div>
          <h1>Tổng quan</h1>
          {statistics?.storeName && (
            <p className={styles.storeName}>{statistics.storeName}</p>
          )}
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

      {/* Stats Cards */}
      <div className="seller-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="seller-stat-card">
            <div className="seller-stat-header">
              <span className="seller-stat-title">{stat.title}</span>
              <div className="seller-stat-icon">{stat.icon}</div>
            </div>
            <h2 className="seller-stat-value">{stat.value}</h2>
            <div className="seller-stat-label">
              <span className={`seller-stat-trend ${stat.trend.type}`}>
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

      {/* Two column layout for orders and products */}
      <div className={styles.contentGrid}>
        {/* Recent Orders */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Đơn hàng gần đây</h2>
          <div className="seller-table-container">
            {recentOrders.length > 0 ? (
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>SL</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                      </td>
                      <td>
                        {order.customerFullName || order.customerUsername}
                      </td>
                      <td>{order.itemCount}</td>
                      <td>
                        <strong className={styles.priceHighlight}>
                          {formatCurrency(order.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`seller-btn seller-btn-secondary ${styles.btnSmall}`}
                          onClick={() =>
                            navigate(
                              `${PROTECTED_ROUTES.SELLER_ORDERS}?orderId=${order.orderId}`
                            )
                          }
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <ShoppingOutlined style={{ fontSize: 48, color: "#ccc" }} />
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <TrophyOutlined style={{ color: "#faad14" }} />
            Sản phẩm bán chạy
          </h2>
          <div className="seller-table-container">
            {topProducts.length > 0 ? (
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.productId}>
                      <td className={styles.productCell}>
                        <div className={styles.productInfo}>
                          {product.productImage && (
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              className={styles.productThumb}
                            />
                          )}
                          <div>
                            <strong>{product.productName}</strong>
                            {index < 3 && (
                              <span
                                className={`${styles.rankBadge} ${
                                  styles[`rank${index + 1}`]
                                }`}
                              >
                                #{index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatNumber(product.soldCount)}</td>
                      <td>
                        <strong className={styles.priceHighlight}>
                          {formatCurrency(product.totalRevenue)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <TrophyOutlined style={{ fontSize: 48, color: "#ccc" }} />
                <p>Chưa có dữ liệu sản phẩm</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
        <div className={styles.quickActions}>
          <button
            className="seller-btn seller-btn-primary"
            onClick={() => navigate(PROTECTED_ROUTES.SELLER_PRODUCTS)}
          >
            <ShopOutlined />
            Quản lý sản phẩm
          </button>
          <button
            className="seller-btn seller-btn-primary"
            onClick={() => navigate(PROTECTED_ROUTES.SELLER_ORDERS)}
          >
            <ShoppingOutlined />
            Xem tất cả đơn hàng
          </button>
          <button
            className="seller-btn seller-btn-secondary"
            onClick={() => navigate(PROTECTED_ROUTES.SELLER_STATISTICS)}
          >
            <DollarOutlined />
            Xem báo cáo chi tiết
          </button>
          <button
            className="seller-btn seller-btn-secondary"
            onClick={() => navigate(PROTECTED_ROUTES.SELLER_PROMOTIONS)}
          >
            <RiseOutlined />
            Chạy khuyến mãi
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerOverviewPage;
