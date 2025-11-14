import { useState } from "react";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import styles from "../../pages/Profile.module.css";

const ProfileOrders = ({ orders }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter orders by status
  const filterOrders = () => {
    let filtered = orders;

    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.products.some((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  };

  const filteredOrders = filterOrders();

  // Get order counts by status
  const getOrderCount = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  const orderTabs = [
    { key: "all", label: "Tất cả", count: getOrderCount("all") },
    { key: "pending", label: "Chờ xác nhận", count: getOrderCount("pending") },
    {
      key: "confirmed",
      label: "Đã xác nhận",
      count: getOrderCount("confirmed"),
    },
    { key: "shipping", label: "Đang giao", count: getOrderCount("shipping") },
    {
      key: "completed",
      label: "Hoàn thành",
      count: getOrderCount("completed"),
    },
    { key: "cancelled", label: "Đã hủy", count: getOrderCount("cancelled") },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <ClockCircleOutlined />,
        label: "Chờ xác nhận",
        color: "#faad14",
      },
      confirmed: {
        icon: <CheckCircleOutlined />,
        label: "Đã xác nhận",
        color: "#1890ff",
      },
      shipping: {
        icon: <TruckOutlined />,
        label: "Đang giao",
        color: "#13c2c2",
      },
      completed: {
        icon: <CheckCircleOutlined />,
        label: "Hoàn thành",
        color: "#52c41a",
      },
      cancelled: {
        icon: <CloseOutlined />,
        label: "Đã hủy",
        color: "#ff4d4f",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: 600,
          color: config.color,
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (orders.length === 0) {
    return (
      <>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Chờ xác nhận</span>
              <div className={styles.statIcon}>
                <ClockCircleOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0</p>
            <p className={styles.statLabel}>đơn hàng</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Đang giao</span>
              <div className={styles.statIcon}>
                <TruckOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0</p>
            <p className={styles.statLabel}>đơn hàng</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Hoàn thành</span>
              <div className={styles.statIcon}>
                <CheckCircleOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0</p>
            <p className={styles.statLabel}>đơn hàng</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Đã hủy</span>
              <div className={styles.statIcon}>
                <CloseOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0</p>
            <p className={styles.statLabel}>đơn hàng</p>
          </div>
        </div>

        <div className={styles.emptyState}>
          <ShoppingOutlined />
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ marginTop: "20px" }}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Chờ xác nhận</span>
            <div className={styles.statIcon}>
              <ClockCircleOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{getOrderCount("pending")}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Đang giao</span>
            <div className={styles.statIcon}>
              <TruckOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{getOrderCount("shipping")}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Hoàn thành</span>
            <div className={styles.statIcon}>
              <CheckCircleOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{getOrderCount("completed")}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Đã hủy</span>
            <div className={styles.statIcon}>
              <CloseOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{getOrderCount("cancelled")}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ marginTop: "32px", marginBottom: "24px" }}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <SearchOutlined />
            Tìm kiếm đơn hàng
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.formInput}
            placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
          />
        </div>
      </div>

      {/* Order Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {orderTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border:
                activeTab === tab.key
                  ? "2px solid #ee4d2d"
                  : "2px solid #e8e8e8",
              background:
                activeTab === tab.key ? "rgba(238, 77, 45, 0.08)" : "white",
              color: activeTab === tab.key ? "#ee4d2d" : "#666",
              fontWeight: activeTab === tab.key ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <FilterOutlined />
          <h3>Không tìm thấy đơn hàng</h3>
          <p>Không có đơn hàng nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "white",
                border: "2px solid #f0f0f0",
                borderRadius: "12px",
                padding: "20px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ee4d2d";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(238, 77, 45, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0f0f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f0f0f0",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#888",
                      marginBottom: "4px",
                    }}
                  >
                    Mã đơn hàng:{" "}
                    <strong style={{ color: "#333" }}>{order.id}</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#999" }}>
                    Ngày đặt:{" "}
                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Order Products */}
              <div style={{ marginBottom: "16px" }}>
                {order.products.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "12px 0",
                      borderBottom:
                        index < order.products.length - 1
                          ? "1px solid #f5f5f5"
                          : "none",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #f0f0f0",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#333",
                          margin: "0 0 6px",
                        }}
                      >
                        {product.name}
                      </h4>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#888",
                          marginBottom: "8px",
                        }}
                      >
                        Số lượng: {product.quantity}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#ee4d2d",
                        }}
                      >
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "16px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}
                >
                  Tổng tiền:{" "}
                  <span style={{ fontSize: "18px", color: "#ee4d2d" }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <button className={`${styles.btn} ${styles.btnPrimary}`}>
                  <EyeOutlined />
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ProfileOrders.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      orderDate: PropTypes.string.isRequired,
      status: PropTypes.oneOf([
        "pending",
        "confirmed",
        "shipping",
        "completed",
        "cancelled",
      ]).isRequired,
      totalAmount: PropTypes.number.isRequired,
      products: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          image: PropTypes.string.isRequired,
          quantity: PropTypes.number.isRequired,
          price: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default ProfileOrders;
