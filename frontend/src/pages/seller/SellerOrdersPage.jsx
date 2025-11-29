import { useState, useEffect, useCallback } from "react";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
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
  SendOutlined,
  RollbackOutlined,
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  notification,
  Modal,
  Pagination,
  DatePicker,
  InputNumber,
  Tag,
  Input,
  Button,
  Popconfirm,
  Space,
  Tooltip,
} from "antd";
import {
  getStoreOrdersApi,
  confirmOrderApi,
  shipOrderApi,
  cancelOrderApi,
  processReturnApi,
  getPendingReturnOrdersApi,
  getMyStoresApi,
} from "../../util/api";
import NoImages from "../../assets/NoImages.webp";
import LoadingSpinner from "../../components/LoadingSpinner";
import useDebounce from "../../hooks/useDebounce";
import styles from "./SellerOrdersPage.module.css";

const { RangePicker } = DatePicker;

/**
 * SellerOrdersPage - Trang quản lý đơn hàng của người bán
 */
const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState({});
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnRejectionReason, setReturnRejectionReason] = useState("");
  const [orderToProcessReturn, setOrderToProcessReturn] = useState(null);

  // Store states
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

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

  // Order status mapping - Theo enum OrderStatus của backend
  const statusMapping = {
    all: "",
    pending: "PENDING",
    paid: "PAID",
    confirmed: "CONFIRMED",
    shipping: "SHIPPING",
    delivered: "DELIVERED",
    pendingReturn: "DELIVERED", // Đơn đã giao đang chờ xử lý trả hàng
    cancelled: "CANCELLED",
    returned: "RETURNED",
  };

  // Refund status mapping for pendingReturn tab
  const refundStatusMapping = {
    pendingReturn: "PENDING", // Filter by refundStatus = PENDING
  };

  const orderTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "paid", label: "Đã thanh toán" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "shipping", label: "Đang giao" },
    { key: "delivered", label: "Đã giao" },
    { key: "pendingReturn", label: "Chờ trả hàng" },
    { key: "cancelled", label: "Đã hủy" },
    { key: "returned", label: "Đã trả hàng" },
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: "", label: "Tất cả" },
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "PENDING", label: "Đang xử lý" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "FAILED", label: "Thất bại" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
  ];

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    try {
      setLoadingStores(true);
      const response = await getMyStoresApi(0, 100);

      if (response?.code === 1000) {
        const { content } = response.result;
        const activeStores = content?.filter((store) => store.isActive) || [];
        setStores(activeStores);

        // Auto-select first active store
        if (activeStores.length > 0 && !selectedStoreId) {
          setSelectedStoreId(activeStores[0].id);
        }
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách cửa hàng",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách cửa hàng",
        placement: "topRight",
      });
    } finally {
      setLoadingStores(false);
    }
  }, [selectedStoreId]);

  // Fetch orders from API
  const fetchOrders = useCallback(
    async (overrideParams = {}) => {
      if (!selectedStoreId) {
        setOrders([]);
        setLoading(false);
        return;
      }

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
          refundStatus: refundStatusMapping[activeTab] || "", // Add refundStatus for pendingReturn tab
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

        const response = await getStoreOrdersApi(selectedStoreId, params);

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
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách đơn hàng",
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      selectedStoreId,
      activeTab,
      debouncedSearchTerm,
      debouncedFilters,
      pagination.current,
      pagination.pageSize,
    ]
  );

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Fetch orders when selectedStoreId changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchOrders();
    }
  }, [selectedStoreId, fetchOrders]);

  // Hiển thị badge trạng thái đơn hàng, có xét cả yêu cầu trả hàng
  const getStatusBadge = (status, order = null) => {
    const statusConfig = {
      PENDING: {
        icon: <ClockCircleOutlined />,
        label: "Chờ xác nhận",
        className: styles.statusPending,
      },
      PAID: {
        icon: <CreditCardOutlined />,
        label: "Đã thanh toán",
        className: styles.statusPaid,
      },
      CONFIRMED: {
        icon: <CheckCircleOutlined />,
        label: "Đã xác nhận",
        className: styles.statusConfirmed,
      },
      SHIPPING: {
        icon: <CarOutlined />,
        label: "Đang giao",
        className: styles.statusShipping,
      },
      DELIVERED: {
        icon: <GiftOutlined />,
        label: "Đã giao",
        className: styles.statusDelivered,
      },
      COMPLETED: {
        icon: <CheckCircleOutlined />,
        label: "Hoàn thành",
        className: styles.statusCompleted,
      },
      CANCELLED: {
        icon: <CloseCircleOutlined />,
        label: "Đã hủy",
        className: styles.statusCancelled,
      },
      RETURNED: {
        icon: <RollbackOutlined />,
        label: "Đã trả hàng",
        className: styles.statusReturned,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    // Kiểm tra nếu đơn hàng đang chờ xử lý trả hàng
    const isPendingReturn = order && canProcessReturn(order);

    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        {config.label}
        {isPendingReturn && (
          <Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>
            Chờ trả hàng
          </Tag>
        )}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      UNPAID: { label: "Chưa TT", color: "default" },
      PENDING: { label: "Đang xử lý", color: "gold" },
      PAID: { label: "Đã TT", color: "green" },
      FAILED: { label: "Thất bại", color: "red" },
      REFUNDED: { label: "Đã hoàn", color: "purple" },
    };

    const config = statusConfig[paymentStatus] || statusConfig.PENDING;
    return <Tag color={config.color}>{config.label}</Tag>;
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Stats calculation
  const getStatusCount = (status) => {
    if (status === "all") return pagination.total;
    // Tính từ orders đã load - cho pendingReturn, đếm các đơn có canProcessReturn = true
    if (status === "pendingReturn") {
      return orders.filter((o) => canProcessReturn(o)).length;
    }
    return orders.filter((o) => o.status === statusMapping[status]).length;
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

  // ============================================
  // Order Status Actions
  // ============================================

  // Xác nhận đơn hàng (PAID -> CONFIRMED)
  const handleConfirmOrder = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: "confirm" }));
    try {
      const response = await confirmOrderApi(orderId);
      if (response?.code === 200) {
        notification.success({
          message: "Thành công",
          description: "Đã xác nhận đơn hàng",
          placement: "topRight",
        });
        fetchOrders();
        // Cập nhật selectedOrder nếu đang mở modal
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(response.result);
        }
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể xác nhận đơn hàng",
        placement: "topRight",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // Giao hàng (CONFIRMED -> SHIPPING)
  const handleShipOrder = async (orderId) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: "ship" }));
    try {
      const response = await shipOrderApi(orderId);
      if (response?.code === 200) {
        notification.success({
          message: "Thành công",
          description: "Đơn hàng đang được giao",
          placement: "topRight",
        });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(response.result);
        }
      }
    } catch (error) {
      console.error("Error shipping order:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message ||
          "Không thể chuyển trạng thái giao hàng",
        placement: "topRight",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // Mở modal hủy đơn
  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason("");
    setCancelModalVisible(true);
  };

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      notification.warning({
        message: "Thông báo",
        description: "Vui lòng nhập lý do hủy đơn",
        placement: "topRight",
      });
      return;
    }

    setActionLoading((prev) => ({ ...prev, [orderToCancel.id]: "cancel" }));
    try {
      const response = await cancelOrderApi(orderToCancel.id, cancelReason);
      if (response?.code === 200) {
        notification.success({
          message: "Thành công",
          description: "Đã hủy đơn hàng",
          placement: "topRight",
        });
        setCancelModalVisible(false);
        fetchOrders();
        if (selectedOrder?.id === orderToCancel.id) {
          setSelectedOrder(response.result);
        }
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || "Không thể hủy đơn hàng",
        placement: "topRight",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderToCancel?.id]: null }));
    }
  };

  // Mở modal xử lý trả hàng
  const openReturnModal = (order) => {
    setOrderToProcessReturn(order);
    setReturnRejectionReason("");
    setReturnModalVisible(true);
  };

  // Xử lý yêu cầu trả hàng (Approve/Reject)
  const handleProcessReturn = async (approved) => {
    if (!approved && !returnRejectionReason.trim()) {
      notification.warning({
        message: "Thông báo",
        description: "Vui lòng nhập lý do từ chối",
        placement: "topRight",
      });
      return;
    }

    setActionLoading((prev) => ({
      ...prev,
      [orderToProcessReturn.id]: "return",
    }));
    try {
      const response = await processReturnApi(orderToProcessReturn.id, {
        approved,
        rejectionReason: approved ? null : returnRejectionReason,
      });
      if (response?.code === 200) {
        notification.success({
          message: "Thành công",
          description: approved
            ? "Đã chấp nhận yêu cầu trả hàng và hoàn tiền"
            : "Đã từ chối yêu cầu trả hàng",
          placement: "topRight",
        });
        setReturnModalVisible(false);
        fetchOrders();
        if (selectedOrder?.id === orderToProcessReturn.id) {
          setSelectedOrder(response.result);
        }
      }
    } catch (error) {
      console.error("Error processing return:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể xử lý yêu cầu trả hàng",
        placement: "topRight",
      });
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [orderToProcessReturn?.id]: null,
      }));
    }
  };

  // Kiểm tra xem đơn hàng có thể thực hiện action nào
  const canConfirm = (order) => order.status === "PAID";
  const canShip = (order) => order.status === "CONFIRMED";
  const canCancel = (order) =>
    ["PENDING", "PAID", "CONFIRMED"].includes(order.status);
  // Sử dụng canProcessReturn từ backend hoặc kiểm tra returnReason != null và returnProcessedAt == null
  const canProcessReturn = (order) =>
    order.canProcessReturn === true ||
    (order.status === "DELIVERED" &&
      order.returnReason &&
      !order.returnProcessedAt);

  // Render action buttons cho mỗi order
  const renderOrderActions = (order) => {
    const isLoading = actionLoading[order.id];

    return (
      <div className={styles.actionButtons}>
        <Tooltip title="Xem chi tiết">
          <button
            className={`${styles.actionBtn} ${styles.viewBtn}`}
            onClick={() => showOrderDetail(order)}
          >
            <EyeOutlined />
          </button>
        </Tooltip>

        {canConfirm(order) && (
          <Tooltip title="Xác nhận đơn">
            <Popconfirm
              title="Xác nhận đơn hàng"
              description="Bạn có chắc chắn muốn xác nhận đơn hàng này?"
              onConfirm={() => handleConfirmOrder(order.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <button
                className={`${styles.actionBtn} ${styles.confirmBtn}`}
                disabled={isLoading}
              >
                {isLoading === "confirm" ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <CheckOutlined />
                )}
              </button>
            </Popconfirm>
          </Tooltip>
        )}

        {canShip(order) && (
          <Tooltip title="Giao hàng">
            <Popconfirm
              title="Giao hàng"
              description="Xác nhận đơn hàng đang được giao?"
              onConfirm={() => handleShipOrder(order.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <button
                className={`${styles.actionBtn} ${styles.shipBtn}`}
                disabled={isLoading}
              >
                {isLoading === "ship" ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <SendOutlined />
                )}
              </button>
            </Popconfirm>
          </Tooltip>
        )}

        {canProcessReturn(order) && (
          <Tooltip title="Xử lý trả hàng">
            <button
              className={`${styles.actionBtn} ${styles.returnBtn}`}
              onClick={() => openReturnModal(order)}
              disabled={isLoading}
            >
              {isLoading === "return" ? (
                <LoadingSpinner size="small" />
              ) : (
                <RollbackOutlined />
              )}
            </button>
          </Tooltip>
        )}

        {canCancel(order) && (
          <Tooltip title="Hủy đơn">
            <button
              className={`${styles.actionBtn} ${styles.cancelBtn}`}
              onClick={() => openCancelModal(order)}
              disabled={isLoading}
            >
              {isLoading === "cancel" ? (
                <LoadingSpinner size="small" />
              ) : (
                <StopOutlined />
              )}
            </button>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className={styles.sellerOrders}>
      {/* Store Selector - Show if user has multiple stores */}
      {stores.length > 1 && (
        <div className={styles.storeSelector}>
          <label className={styles.storeSelectorLabel}>
            <ShopOutlined /> Chọn cửa hàng:
          </label>
          <select
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className={styles.storeSelect}
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading stores */}
      {loadingStores && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner text="Đang tải danh sách cửa hàng..." />
        </div>
      )}

      {/* No stores */}
      {!loadingStores && stores.length === 0 && (
        <div className={styles.emptyState}>
          <ShopOutlined style={{ fontSize: 48, color: "#ccc" }} />
          <p>Bạn chưa có cửa hàng nào.</p>
          <p>Vui lòng tạo cửa hàng trước khi quản lý đơn hàng.</p>
        </div>
      )}

      {/* Main content - only show if store is selected */}
      {!loadingStores && stores.length > 0 && selectedStoreId && (
        <>
          {/* Status Summary Cards */}
          <div className={styles.statsGrid}>
            {orderTabs.slice(1).map((tab) => (
              <div
                key={tab.key}
                className={`${styles.statCard} ${
                  activeTab === tab.key ? styles.active : ""
                }`}
                onClick={() => handleTabChange(tab.key)}
              >
                <div className={styles.statCount}>
                  {getStatusCount(tab.key)}
                </div>
                <div className={styles.statLabel}>{tab.label}</div>
              </div>
            ))}
          </div>

          {/* Header Actions */}
          <div className={styles.sellerOrdersHeader}>
            <div className={styles.sellerSearchBox}>
              <SearchOutlined className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className={styles.filterSelect}
              >
                {orderTabs.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filtersGrid}>
                {/* Payment Status Filter */}
                <div className={styles.filterItem}>
                  <label className={styles.filterLabel}>
                    <CreditCardOutlined /> Trạng thái thanh toán
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentStatus: e.target.value })
                    }
                    className={styles.filterSelect}
                  >
                    {paymentStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className={styles.filterItem}>
                  <label className={styles.filterLabel}>
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
                <div className={styles.filterItem}>
                  <label className={styles.filterLabel}>
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
                <div className={styles.filterItem}>
                  <label className={styles.filterLabel}>
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

          {/* Order Tabs */}
          <div className={styles.tabsContainer}>
            {orderTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`${styles.tabBtn} ${
                  activeTab === tab.key ? styles.active : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingOverlay}>
                <LoadingSpinner tip="Đang tải đơn hàng..." fullScreen={false} />
              </div>
            ) : (
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Ngày đặt</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className={styles.orderInfo}>
                            <span className={styles.orderNumber}>
                              {order.orderNumber}
                            </span>
                            <span className={styles.orderDate}>
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.customerInfo}>
                            <span className={styles.customerName}>
                              {order.receiverName}
                            </span>
                            <span className={styles.customerPhone}>
                              {order.receiverPhone}
                            </span>
                          </div>
                        </td>
                        <td>
                          {order.items && order.items.length > 0 ? (
                            <div className={styles.productInfo}>
                              <img
                                src={order.items[0].productImage || NoImages}
                                alt={order.items[0].productName}
                                className={styles.productImage}
                              />
                              <div className={styles.productDetails}>
                                <span className={styles.productName}>
                                  {order.items[0].productName}
                                </span>
                                {order.items[0].variantName && (
                                  <span className={styles.productVariant}>
                                    {order.items[0].variantName}
                                  </span>
                                )}
                                {order.items.length > 1 && (
                                  <span className={styles.moreItems}>
                                    +{order.items.length - 1} sản phẩm khác
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <span className={styles.priceText}>
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td>{getStatusBadge(order.status, order)}</td>
                        <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>{renderOrderActions(order)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className={styles.noData}>
                        <ClockCircleOutlined className={styles.noDataIcon} />
                        <p>Không tìm thấy đơn hàng nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && orders.length > 0 && (
            <div className={styles.pagination}>
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
          )}

          {/* Summary Stats */}
          <div className={styles.ordersSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tổng đơn hàng:</span>
              <span className={styles.summaryValue}>{pagination.total}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Chờ xác nhận:</span>
              <span className={styles.summaryValue}>
                {orders.filter((o) => o.status === "PENDING").length}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Đã thanh toán:</span>
              <span className={styles.summaryValue}>
                {orders.filter((o) => o.paymentStatus === "PAID").length}
              </span>
            </div>
          </div>

          {/* Order Detail Modal */}
          <Modal
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <ShopOutlined style={{ color: "#ee4d2d", fontSize: "18px" }} />
                <span>Chi tiết đơn hàng #{selectedOrder?.orderNumber}</span>
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
                    alignItems: "center",
                    marginBottom: "20px",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {getStatusBadge(selectedOrder.status, selectedOrder)}
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>

                {/* Shipping Info */}
                <div className={styles.orderDetailSection}>
                  <h4 className={styles.orderDetailTitle}>
                    <CarOutlined style={{ color: "#ee4d2d" }} />
                    Thông tin giao hàng
                  </h4>
                  <div className={styles.orderDetailGrid}>
                    <div className={styles.orderDetailItem}>
                      <UserOutlined style={{ color: "#666" }} />
                      <span>
                        <strong>Người nhận:</strong>{" "}
                        {selectedOrder.receiverName}
                      </span>
                    </div>
                    <div className={styles.orderDetailItem}>
                      <PhoneOutlined style={{ color: "#666" }} />
                      <span>
                        <strong>SĐT:</strong> {selectedOrder.receiverPhone}
                      </span>
                    </div>
                    <div
                      className={styles.orderDetailItem}
                      style={{ gridColumn: "span 2" }}
                    >
                      <EnvironmentOutlined style={{ color: "#666" }} />
                      <span>
                        <strong>Địa chỉ:</strong>{" "}
                        {selectedOrder.shippingAddress}
                      </span>
                    </div>
                    {selectedOrder.note && (
                      <div
                        className={styles.orderDetailItem}
                        style={{ gridColumn: "span 2" }}
                      >
                        <ExclamationCircleOutlined
                          style={{ color: "#faad14" }}
                        />
                        <span>
                          <strong>Ghi chú:</strong> {selectedOrder.note}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      margin: "0 0 12px",
                      color: "#333",
                      fontWeight: 600,
                    }}
                  >
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
                        flexWrap: "wrap",
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
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: "4px",
                            wordBreak: "break-word",
                          }}
                        >
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
                      fontWeight: 600,
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
                        <GiftOutlined /> Giảm giá{" "}
                        {selectedOrder.couponCode &&
                          `(${selectedOrder.couponCode})`}
                        :
                      </span>
                      <span>
                        -{formatCurrency(selectedOrder.discountAmount)}
                      </span>
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
                <div>
                  <h4
                    style={{
                      margin: "0 0 12px",
                      color: "#333",
                      fontWeight: 600,
                    }}
                  >
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
                        <CloseCircleOutlined
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
                      Cập nhật lần cuối:{" "}
                      {formatDateTime(selectedOrder.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Cancel Order Modal */}
          <Modal
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <StopOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
                <span>Hủy đơn hàng #{orderToCancel?.orderNumber}</span>
              </div>
            }
            open={cancelModalVisible}
            onCancel={() => setCancelModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setCancelModalVisible(false)}>
                Đóng
              </Button>,
              <Button
                key="submit"
                type="primary"
                danger
                loading={actionLoading[orderToCancel?.id] === "cancel"}
                onClick={handleCancelOrder}
              >
                Xác nhận hủy
              </Button>,
            ]}
          >
            <div style={{ marginBottom: "16px" }}>
              <p style={{ marginBottom: "8px", color: "#666" }}>
                Vui lòng nhập lý do hủy đơn hàng:
              </p>
              <Input.TextArea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn (bắt buộc)..."
                maxLength={500}
                showCount
              />
            </div>
            <div
              style={{
                padding: "12px",
                background: "#fff2e8",
                borderRadius: "8px",
                border: "1px solid #ffbb96",
              }}
            >
              <ExclamationCircleOutlined
                style={{ color: "#fa8c16", marginRight: "8px" }}
              />
              <span style={{ color: "#ad4e00" }}>
                Lưu ý: Đơn hàng sau khi hủy sẽ không thể khôi phục. Nếu đơn hàng
                đã thanh toán, hệ thống sẽ tự động hoàn tiền cho khách hàng.
              </span>
            </div>
          </Modal>

          {/* Process Return Modal */}
          <Modal
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <RollbackOutlined
                  style={{ color: "#722ed1", fontSize: "18px" }}
                />
                <span>
                  Xử lý yêu cầu trả hàng #{orderToProcessReturn?.orderNumber}
                </span>
              </div>
            }
            open={returnModalVisible}
            onCancel={() => setReturnModalVisible(false)}
            footer={null}
            width={600}
          >
            {orderToProcessReturn && (
              <div>
                {/* Return Info */}
                <div
                  style={{
                    padding: "16px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px", fontWeight: 600 }}>
                    Thông tin yêu cầu trả hàng
                  </h4>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Lý do:</strong>{" "}
                    <Tag color="orange">
                      {orderToProcessReturn.returnReason}
                    </Tag>
                  </div>
                  {orderToProcessReturn.returnDescription && (
                    <div style={{ marginBottom: "8px" }}>
                      <strong>Mô tả chi tiết:</strong>
                      <p style={{ margin: "4px 0 0", color: "#666" }}>
                        {orderToProcessReturn.returnDescription}
                      </p>
                    </div>
                  )}
                  {orderToProcessReturn.returnImages?.length > 0 && (
                    <div>
                      <strong>Hình ảnh:</strong>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {orderToProcessReturn.returnImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Return ${idx + 1}`}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #d9d9d9",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: "8px" }}>
                    <strong>Số tiền hoàn trả:</strong>{" "}
                    <span style={{ color: "#52c41a", fontWeight: 600 }}>
                      {formatCurrency(orderToProcessReturn.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ marginBottom: "8px", color: "#666" }}>
                    Nếu từ chối, vui lòng nhập lý do:
                  </p>
                  <Input.TextArea
                    rows={3}
                    value={returnRejectionReason}
                    onChange={(e) => setReturnRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối (bắt buộc nếu từ chối)..."
                    maxLength={1000}
                    showCount
                  />
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button onClick={() => setReturnModalVisible(false)}>
                    Đóng
                  </Button>
                  <Button
                    danger
                    loading={
                      actionLoading[orderToProcessReturn?.id] === "return"
                    }
                    onClick={() => handleProcessReturn(false)}
                  >
                    <StopOutlined /> Từ chối
                  </Button>
                  <Popconfirm
                    title="Xác nhận chấp nhận trả hàng"
                    description="Bạn có chắc chắn muốn chấp nhận yêu cầu trả hàng và hoàn tiền cho khách?"
                    onConfirm={() => handleProcessReturn(true)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                  >
                    <Button
                      type="primary"
                      style={{ background: "#52c41a", borderColor: "#52c41a" }}
                      loading={
                        actionLoading[orderToProcessReturn?.id] === "return"
                      }
                    >
                      <CheckOutlined /> Chấp nhận & Hoàn tiền
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default SellerOrdersPage;
