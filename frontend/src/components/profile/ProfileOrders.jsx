import { useState, useEffect, useCallback } from "react";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  DownOutlined,
  UpOutlined,
  GiftOutlined,
  ExclamationCircleOutlined,
  PayCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import NoImages from "../../assets/NoImages.webp";
import styles from "../../pages/Profile.module.css";
import { getMyOrdersApi, initiateOrderPaymentApi } from "../../util/api";
import {
  message,
  Pagination,
  DatePicker,
  InputNumber,
  Modal,
  Tag,
  Spin,
} from "antd";
import LoadingSpinner from "../LoadingSpinner";
import useDebounce from "../../hooks/useDebounce";

const { RangePicker } = DatePicker;

const ProfileOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [orderTimers, setOrderTimers] = useState({});

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Advanced filters
  const [filters, setFilters] = useState({
    paymentStatus: "",
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null,
  });

  // Debounce search term and filters
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const debouncedFilters = useDebounce(filters, 800);

  // Order status mapping - Theo enum OrderStatus của backend:
  // PENDING (Chờ xác nhận), PAID (Đã thanh toán), CONFIRMED (Đã xác nhận), CANCELLED (Đã hủy), RETURNED (Đã trả hàng)
  const statusMapping = {
    all: "",
    pending: "PENDING",
    paid: "PAID",
    confirmed: "CONFIRMED",
    cancelled: "CANCELLED",
    returned: "RETURNED",
  };

  // Fetch orders from API
  const fetchOrders = useCallback(
    async (overrideParams = {}) => {
      setLoading(true);
      try {
        const searchToUse =
          overrideParams.search !== undefined
            ? overrideParams.search
            : debouncedSearchTerm;
        const filtersToUse =
          overrideParams.filters !== undefined
            ? overrideParams.filters
            : debouncedFilters;

        const params = {
          search: searchToUse,
          status: statusMapping[activeTab] || "",
          paymentStatus: filtersToUse.paymentStatus,
          startDate: filtersToUse.startDate
            ? filtersToUse.startDate.format("YYYY-MM-DDTHH:mm:ss")
            : "",
          endDate: filtersToUse.endDate
            ? filtersToUse.endDate.format("YYYY-MM-DDTHH:mm:ss")
            : "",
          minAmount: filtersToUse.minAmount || "",
          maxAmount: filtersToUse.maxAmount || "",
          page: pagination.current - 1,
          size: pagination.pageSize,
        };

        const response = await getMyOrdersApi(params);
        console.log("API Response:", response); // Debug log

        // axios.customize.js đã unwrap response.data, nên response ở đây là data
        if (response?.code === 200) {
          const result = response.result;
          setOrders(result?.content || []);
          setPagination((prev) => ({
            ...prev,
            total: result?.totalElements || 0,
          }));
        } else {
          console.error("API returned error:", response);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    },
    [
      activeTab,
      debouncedSearchTerm,
      debouncedFilters,
      pagination.current,
      pagination.pageSize,
    ]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      orders.forEach((order) => {
        // Hiển thị countdown cho tất cả đơn hàng PENDING chưa thanh toán
        if (order.status === "PENDING" && order.paymentStatus !== "PAID") {
          newTimers[order.id] = calculateTimeRemaining(order.createdAt);
        }
      });
      setOrderTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const orderTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "paid", label: "Đã thanh toán" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "cancelled", label: "Đã hủy" },
    { key: "returned", label: "Đã trả hàng" },
  ];

  // Payment status options - Theo enum PaymentStatus của backend:
  // UNPAID (Chưa thanh toán), PENDING (Đang xử lý), PAID (Đã thanh toán), FAILED (Thất bại), REFUNDED (Đã hoàn tiền)
  const paymentStatusOptions = [
    { value: "", label: "Tất cả" },
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "PENDING", label: "Đang xử lý" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "FAILED", label: "Thất bại" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        icon: <ClockCircleOutlined />,
        label: "Chờ xác nhận",
        color: "#faad14",
      },
      PAID: {
        icon: <CreditCardOutlined />,
        label: "Đã thanh toán",
        color: "#52c41a",
      },
      CONFIRMED: {
        icon: <CheckCircleOutlined />,
        label: "Đã xác nhận",
        color: "#1890ff",
      },
      CANCELLED: {
        icon: <CloseOutlined />,
        label: "Đã hủy",
        color: "#ff4d4f",
      },
      RETURNED: {
        icon: <TruckOutlined />,
        label: "Đã trả hàng",
        color: "#722ed1",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

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

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      UNPAID: { label: "Chưa thanh toán", color: "default" },
      PENDING: { label: "Đang xử lý", color: "gold" },
      PAID: { label: "Đã thanh toán", color: "green" },
      FAILED: { label: "Thất bại", color: "red" },
      REFUNDED: { label: "Đã hoàn tiền", color: "purple" },
    };

    const config = statusConfig[paymentStatus] || statusConfig.PENDING;

    return (
      <Tag color={config.color} style={{ marginLeft: "8px" }}>
        {config.label}
      </Tag>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Tính thời gian còn lại của đơn hàng (15 phút từ khi tạo)
  const calculateTimeRemaining = (createdAt) => {
    const ORDER_EXPIRY_MINUTES = 15;
    const createdTime = new Date(createdAt).getTime();
    const expiryTime = createdTime + ORDER_EXPIRY_MINUTES * 60 * 1000;
    const now = Date.now();
    const remaining = expiryTime - now;

    if (remaining <= 0) {
      return { expired: true, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return { expired: false, minutes, seconds, totalSeconds };
  };

  // Kiểm tra đơn hàng có thể thanh toán không
  const canPayOrder = (order) => {
    // Chỉ cho phép thanh toán với đơn hàng PENDING (chờ xác nhận) và chưa thanh toán
    if (order.status !== "PENDING") return false;
    if (order.paymentStatus === "PAID") return false;
    const timeRemaining = calculateTimeRemaining(order.createdAt);
    // Hiển thị nút miễn là chưa hết hạn, validation chi tiết khi click
    return !timeRemaining.expired;
  };

  // Format countdown timer
  const formatCountdown = (minutes, seconds) => {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // Xử lý thanh toán đơn hàng
  const handlePayOrder = async (order) => {
    const timeRemaining = calculateTimeRemaining(order.createdAt);

    if (timeRemaining.expired) {
      Modal.warning({
        title: "Đơn hàng đã hết hạn",
        content:
          "Đơn hàng này đã quá thời gian thanh toán (15 phút). Vui lòng tạo đơn hàng mới.",
        okText: "Đã hiểu",
      });
      return;
    }

    if (timeRemaining.totalSeconds < 300) {
      Modal.warning({
        title: "Thời gian còn lại không đủ",
        content:
          "Đơn hàng còn lại ít hơn 5 phút. Vui lòng tạo đơn hàng mới để có đủ thời gian thanh toán.",
        okText: "Đã hiểu",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận thanh toán",
      content: (
        <div>
          <p>
            Bạn muốn thanh toán đơn hàng <strong>{order.orderNumber}</strong>?
          </p>
          <p>
            Tổng tiền:{" "}
            <strong style={{ color: "#ee4d2d" }}>
              {formatCurrency(order.totalAmount)}
            </strong>
          </p>
          <p style={{ color: "#faad14" }}>
            <ClockCircleOutlined /> Thời gian còn lại:{" "}
            <strong>
              {formatCountdown(timeRemaining.minutes, timeRemaining.seconds)}
            </strong>
          </p>
        </div>
      ),
      okText: "Thanh toán ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setPayingOrderId(order.id);
        try {
          // Truyền thời gian còn lại thực tế (tối thiểu 300 giây theo yêu cầu ZaloPay)
          const expirySeconds = Math.max(timeRemaining.totalSeconds, 300);
          const response = await initiateOrderPaymentApi(
            [order.id],
            expirySeconds
          );

          if (response?.code === 200 && response?.result?.paymentUrl) {
            message.success("Đang chuyển đến cổng thanh toán...", 1.5);

            // Lưu thông tin đơn hàng và thời gian còn lại
            sessionStorage.setItem(
              "pendingOrders",
              JSON.stringify({
                orders: [order],
                orderIds: [order.id],
                appTransId: response.result.appTransId,
                timestamp: Date.now(),
                expirySeconds: timeRemaining.totalSeconds, // Truyền thời gian còn lại
              })
            );

            // Chuyển đến cổng thanh toán
            window.open(response.result.paymentUrl, "_self");
          } else {
            throw new Error(
              response?.message || "Không thể khởi tạo thanh toán"
            );
          }
        } catch (error) {
          console.error("Payment error:", error);

          // Xử lý các error message từ backend
          let errorMessage = "Không thể thanh toán. Vui lòng thử lại!";

          if (error.response?.data?.message) {
            const backendMessage = error.response.data.message;

            // Xử lý message về đơn hàng hết hạn
            if (
              backendMessage.includes("hết hạn") ||
              backendMessage.includes("expired")
            ) {
              errorMessage =
                "Đơn hàng đã hết hạn thanh toán. Vui lòng tạo đơn hàng mới.";
              // Refresh danh sách đơn hàng
              fetchOrders();
            }
            // Xử lý message về đơn hàng đã bị hủy
            else if (
              backendMessage.includes("đã bị hủy") ||
              backendMessage.includes("CANCELLED")
            ) {
              errorMessage = "Đơn hàng đã bị hủy. Không thể thanh toán.";
              // Refresh danh sách đơn hàng
              fetchOrders();
            }
            // Các lỗi khác hiển thị message từ backend
            else {
              errorMessage = backendMessage;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          message.error(errorMessage);
        } finally {
          setPayingOrderId(null);
        }
      },
    });
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders({ search: searchTerm, filters: filters });
  };

  const handleResetFilters = () => {
    setFilters({
      paymentStatus: "",
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
    });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
  };

  const showOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Stats calculation - Theo enum OrderStatus của backend
  const stats = {
    pending: orders.filter((o) => o.status === "PENDING").length,
    paid: orders.filter((o) => o.status === "PAID").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Chờ xác nhận</span>
            <div className={styles.statIcon}>
              <ClockCircleOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{stats.pending}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Đã thanh toán</span>
            <div className={styles.statIcon}>
              <CreditCardOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{stats.paid}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Đã xác nhận</span>
            <div className={styles.statIcon}>
              <CheckCircleOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{stats.confirmed}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Đã hủy</span>
            <div className={styles.statIcon}>
              <CloseOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{stats.cancelled}</p>
          <p className={styles.statLabel}>đơn hàng</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ marginTop: "32px", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className={styles.formInput}
              placeholder="Tìm theo mã đơn hàng, tên sản phẩm..."
              style={{ paddingLeft: "40px" }}
            />
            <SearchOutlined
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <SearchOutlined /> Tìm kiếm
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <FilterOutlined /> Bộ lọc{" "}
            {showFilters ? <UpOutlined /> : <DownOutlined />}
          </button>
          <button
            onClick={handleResetFilters}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <ReloadOutlined /> Đặt lại
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div
            style={{
              background: "#f9f9f9",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {/* Payment Status Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  <CreditCardOutlined /> Trạng thái thanh toán
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentStatus: e.target.value })
                  }
                  className={styles.formInput}
                  style={{ width: "100%" }}
                >
                  {paymentStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  <CalendarOutlined /> Khoảng thời gian
                </label>
                <RangePicker
                  value={[filters.startDate, filters.endDate]}
                  onChange={(dates) =>
                    setFilters({
                      ...filters,
                      startDate: dates?.[0] || null,
                      endDate: dates?.[1] || null,
                    })
                  }
                  style={{ width: "100%" }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
              </div>

              {/* Min Amount Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  <DollarOutlined /> Số tiền tối thiểu
                </label>
                <InputNumber
                  value={filters.minAmount}
                  onChange={(value) =>
                    setFilters({ ...filters, minAmount: value })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                  placeholder="VD: 100000"
                  min={0}
                />
              </div>

              {/* Max Amount Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  <DollarOutlined /> Số tiền tối đa
                </label>
                <InputNumber
                  value={filters.maxAmount}
                  onChange={(value) =>
                    setFilters({ ...filters, maxAmount: value })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                  placeholder="VD: 500000"
                  min={0}
                />
              </div>
            </div>
          </div>
        )}
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
            onClick={() => handleTabChange(tab.key)}
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
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner tip="Đang tải đơn hàng..." fullScreen={false} />
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingOutlined />
          <h3>Không tìm thấy đơn hàng</h3>
          <p>Không có đơn hàng nào phù hợp với bộ lọc.</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ marginTop: "20px" }}
            onClick={() => (window.location.href = "/products")}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              minWidth: 0,
            }}
          >
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "white",
                  border: "2px solid #f0f0f0",
                  borderRadius: "12px",
                  padding: "16px",
                  transition: "all 0.3s ease",
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  overflow: "hidden",
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
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <ShopOutlined style={{ color: "#ee4d2d" }} />
                      <span style={{ fontWeight: 600, color: "#333" }}>
                        {order.storeName}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#888",
                        marginBottom: "4px",
                      }}
                    >
                      Mã đơn hàng:{" "}
                      <strong style={{ color: "#333" }}>
                        {order.orderNumber}
                      </strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "#999" }}>
                      <CalendarOutlined style={{ marginRight: "6px" }} />
                      Ngày đặt: {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {getStatusBadge(order.status)}
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>

                {/* Order Products */}
                <div
                  style={{ marginBottom: "16px", width: "100%", minWidth: 0 }}
                >
                  {order.items?.map((item, index) => (
                    <div
                      key={item.id || index}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "12px 0",
                        borderBottom:
                          index < order.items.length - 1
                            ? "1px solid #f5f5f5"
                            : "none",
                        flexWrap: "wrap",
                      }}
                    >
                      <img
                        src={item.productImage || NoImages}
                        alt={item.productName}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #f0f0f0",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#333",
                            margin: "0 0 6px",
                            wordBreak: "break-word",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.productName}
                        </h4>
                        {item.variantName && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "4px",
                            }}
                          >
                            Phân loại: {item.variantName}
                          </div>
                        )}
                        {item.sku && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              marginBottom: "4px",
                            }}
                          >
                            SKU: {item.sku}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#888",
                            marginBottom: "8px",
                          }}
                        >
                          Số lượng: {item.quantity}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#ee4d2d",
                            wordBreak: "break-word",
                          }}
                        >
                          {formatCurrency(item.price)} × {item.quantity} ={" "}
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div
                  style={{
                    background: "#fafafa",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#666" }}>Tạm tính:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        color: "#52c41a",
                      }}
                    >
                      <span>
                        <GiftOutlined /> Giảm giá{" "}
                        {order.couponCode && `(${order.couponCode})`}:
                      </span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 600,
                      fontSize: "16px",
                      color: "#ee4d2d",
                      borderTop: "1px dashed #e8e8e8",
                      paddingTop: "8px",
                    }}
                  >
                    <span>Tổng tiền:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Order Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "16px",
                    borderTop: "1px solid #f0f0f0",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      wordBreak: "break-all",
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <CreditCardOutlined style={{ marginRight: "6px" }} />
                    {order.paymentMethod === "ZALO_PAY"
                      ? "ZaloPay"
                      : order.paymentMethod}
                    {order.paymentTransactionId && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color: "#999",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Mã GD: {order.paymentTransactionId}
                      </span>
                    )}

                    {/* Countdown Timer cho đơn hàng chưa thanh toán */}
                    {order.status === "PENDING" &&
                      order.paymentStatus !== "PAID" &&
                      orderTimers[order.id] && (
                        <div style={{ marginTop: "8px" }}>
                          {!orderTimers[order.id].expired ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                background:
                                  orderTimers[order.id].totalSeconds < 300
                                    ? "rgba(255, 77, 79, 0.1)"
                                    : "rgba(250, 173, 20, 0.1)",
                                border:
                                  orderTimers[order.id].totalSeconds < 300
                                    ? "1px solid #ff4d4f"
                                    : "1px solid #faad14",
                                borderRadius: "6px",
                                color:
                                  orderTimers[order.id].totalSeconds < 300
                                    ? "#ff4d4f"
                                    : "#faad14",
                                fontWeight: 600,
                                fontSize: "13px",
                              }}
                            >
                              {orderTimers[order.id].totalSeconds < 300 ? (
                                <WarningOutlined />
                              ) : (
                                <ClockCircleOutlined />
                              )}
                              Còn lại:{" "}
                              {formatCountdown(
                                orderTimers[order.id].minutes,
                                orderTimers[order.id].seconds
                              )}
                              {orderTimers[order.id].totalSeconds < 300 && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    marginLeft: "4px",
                                  }}
                                >
                                  (Sắp hết hạn)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                background: "rgba(255, 77, 79, 0.1)",
                                border: "1px solid #ff4d4f",
                                borderRadius: "6px",
                                color: "#ff4d4f",
                                fontWeight: 600,
                                fontSize: "13px",
                              }}
                            >
                              <WarningOutlined />
                              Đã hết hạn thanh toán
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {/* Nút thanh toán cho đơn hàng chưa thanh toán và còn hạn */}
                    {canPayOrder(order) && (
                      <button
                        className={`${styles.btn}`}
                        style={{
                          background: "#52c41a",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onClick={() => handlePayOrder(order)}
                        disabled={payingOrderId === order.id}
                      >
                        {payingOrderId === order.id ? (
                          <>
                            <Spin size="small" />
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <PayCircleOutlined />
                            <span>Thanh toán ngay</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => showOrderDetail(order)}
                    >
                      <EyeOutlined />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              overflowX: "auto",
              padding: "8px 0",
            }}
          >
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `Tổng ${total} đơn hàng`}
              pageSizeOptions={["5", "10", "20", "50"]}
            />
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <ShoppingOutlined style={{ color: "#ee4d2d", fontSize: "18px" }} />
            <span style={{ wordBreak: "break-word" }}>
              Chi tiết đơn hàng #{selectedOrder?.orderNumber}
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: "800px" }}
      >
        {selectedOrder && (
          <div style={{ padding: "12px 0" }}>
            {/* Order Status */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {getStatusBadge(selectedOrder.status)}
              {getPaymentStatusBadge(selectedOrder.paymentStatus)}
            </div>

            {/* Shipping Info */}
            <div
              style={{
                background: "#f9f9f9",
                padding: "12px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                }}
              >
                <TruckOutlined style={{ color: "#ee4d2d" }} />
                Thông tin giao hàng
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <UserOutlined style={{ marginRight: "8px", color: "#666" }} />
                  <strong>Người nhận:</strong> {selectedOrder.receiverName}
                </div>
                <div>
                  <PhoneOutlined
                    style={{ marginRight: "8px", color: "#666" }}
                  />
                  <strong>Số điện thoại:</strong> {selectedOrder.receiverPhone}
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <EnvironmentOutlined
                    style={{ marginRight: "8px", color: "#666" }}
                  />
                  <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}
                </div>
                {selectedOrder.note && (
                  <div style={{ gridColumn: "span 2" }}>
                    <ExclamationCircleOutlined
                      style={{ marginRight: "8px", color: "#faad14" }}
                    />
                    <strong>Ghi chú:</strong> {selectedOrder.note}
                  </div>
                )}
              </div>
            </div>

            {/* Store Info */}
            <div
              style={{
                background: "#fff7e6",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <ShopOutlined style={{ color: "#fa8c16" }} />
                Thông tin cửa hàng
              </h4>
              <div style={{ fontSize: "14px" }}>
                <strong>Tên cửa hàng:</strong> {selectedOrder.storeName}
              </div>
            </div>

            {/* Products */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#333" }}>
                Sản phẩm đã đặt
              </h4>
              {selectedOrder.items?.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "12px",
                    background: "#fafafa",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <img
                    src={item.productImage || NoImages}
                    alt={item.productName}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {item.productName}
                    </div>
                    {item.variantName && (
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        Phân loại: {item.variantName}
                      </div>
                    )}
                    {item.sku && (
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        SKU: {item.sku}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#ee4d2d", fontWeight: 600 }}>
                      {formatCurrency(item.price)}
                    </div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      x{item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div
              style={{
                background: "#fff1f0",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CreditCardOutlined style={{ color: "#ff4d4f" }} />
                Thông tin thanh toán
              </h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Phương thức:</span>
                <span>
                  {selectedOrder.paymentMethod === "ZALO_PAY"
                    ? "ZaloPay"
                    : selectedOrder.paymentMethod}
                </span>
              </div>
              {selectedOrder.paymentTransactionId && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span>Mã giao dịch:</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {selectedOrder.paymentTransactionId}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Tạm tính:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#52c41a",
                  }}
                >
                  <span>
                    Giảm giá{" "}
                    {selectedOrder.couponCode &&
                      `(${selectedOrder.couponCode})`}
                    :
                  </span>
                  <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#ff4d4f",
                  borderTop: "1px dashed #ffccc7",
                  paddingTop: "12px",
                  marginTop: "8px",
                }}
              >
                <span>Tổng thanh toán:</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#333" }}>
                Lịch sử đơn hàng
              </h4>
              <div style={{ fontSize: "13px", color: "#666" }}>
                <div style={{ marginBottom: "8px" }}>
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  Ngày tạo: {formatDateTime(selectedOrder.createdAt)}
                </div>
                {selectedOrder.confirmedAt && (
                  <div style={{ marginBottom: "8px" }}>
                    <CheckCircleOutlined
                      style={{ marginRight: "8px", color: "#52c41a" }}
                    />
                    Đã xác nhận: {formatDateTime(selectedOrder.confirmedAt)}
                  </div>
                )}
                {selectedOrder.cancelledAt && (
                  <div style={{ marginBottom: "8px" }}>
                    <CloseOutlined
                      style={{ marginRight: "8px", color: "#ff4d4f" }}
                    />
                    Đã hủy: {formatDateTime(selectedOrder.cancelledAt)}
                    {selectedOrder.cancelReason && (
                      <div style={{ marginLeft: "20px", color: "#ff4d4f" }}>
                        Lý do: {selectedOrder.cancelReason}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  Cập nhật lần cuối: {formatDateTime(selectedOrder.updatedAt)}
                </div>
              </div>
            </div>

            {/* Payment Action Button */}
            {canPayOrder(selectedOrder) && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "rgba(82, 196, 26, 0.1)",
                  border: "2px solid #52c41a",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  {orderTimers[selectedOrder.id] &&
                    !orderTimers[selectedOrder.id].expired && (
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color:
                            orderTimers[selectedOrder.id].totalSeconds < 300
                              ? "#ff4d4f"
                              : "#faad14",
                          marginBottom: "8px",
                        }}
                      >
                        {orderTimers[selectedOrder.id].totalSeconds < 300 ? (
                          <WarningOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )}{" "}
                        Thời gian còn lại:{" "}
                        <span style={{ fontSize: "20px", color: "#ff4d4f" }}>
                          {formatCountdown(
                            orderTimers[selectedOrder.id].minutes,
                            orderTimers[selectedOrder.id].seconds
                          )}
                        </span>
                        {orderTimers[selectedOrder.id].totalSeconds < 300 && (
                          <span
                            style={{
                              fontSize: "12px",
                              marginLeft: "8px",
                              display: "block",
                              color: "#ff4d4f",
                            }}
                          >
                            ⚠️ Đơn hàng sắp hết hạn. Vui lòng tạo đơn mới nếu
                            cần thêm thời gian.
                          </span>
                        )}
                      </div>
                    )}
                  <p
                    style={{ margin: "8px 0", color: "#666", fontSize: "14px" }}
                  >
                    Vui lòng thanh toán để hoàn tất đơn hàng
                  </p>
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    background: "#52c41a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handlePayOrder(selectedOrder);
                  }}
                  disabled={payingOrderId === selectedOrder.id}
                >
                  {payingOrderId === selectedOrder.id ? (
                    <>
                      <Spin size="small" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <PayCircleOutlined />
                      <span>Thanh toán ngay</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Expired Warning */}
            {selectedOrder.paymentStatus === "UNPAID" &&
              orderTimers[selectedOrder.id]?.expired && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px",
                    background: "rgba(255, 77, 79, 0.1)",
                    border: "2px solid #ff4d4f",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <WarningOutlined
                    style={{
                      fontSize: "32px",
                      color: "#ff4d4f",
                      marginBottom: "8px",
                    }}
                  />
                  <p
                    style={{
                      margin: "8px 0",
                      color: "#ff4d4f",
                      fontWeight: 600,
                    }}
                  >
                    Đơn hàng đã hết hạn thanh toán
                  </p>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                    Thời gian thanh toán đã quá 15 phút. Vui lòng tạo đơn hàng
                    mới.
                  </p>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileOrders;
