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
} from "@ant-design/icons";
import {
  notification,
  Modal,
  Pagination,
  DatePicker,
  InputNumber,
  Tag,
} from "antd";
import { getStoreOrdersApi } from "../../util/api";
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

  // Store ID - Có thể lấy từ context hoặc state management
  const [selectedStoreId] = useState("61127fcd-8c22-4e3e-9419-93c7c05d9f83");

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
    cancelled: "CANCELLED",
    returned: "RETURNED",
  };

  const orderTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "paid", label: "Đã thanh toán" },
    { key: "confirmed", label: "Đã xác nhận" },
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
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
        icon: <CarOutlined />,
        label: "Đã trả hàng",
        className: styles.statusReturned,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        {config.label}
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
    // Tính từ orders đã load
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

  return (
    <div className={styles.sellerOrders}>
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
            <div className={styles.statCount}>{getStatusCount(tab.key)}</div>
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
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionBtn} ${styles.viewBtn}`}
                          title="Xem chi tiết"
                          onClick={() => showOrderDetail(order)}
                        >
                          <EyeOutlined />
                        </button>
                      </div>
                    </td>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              {getStatusBadge(selectedOrder.status)}
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
                    <strong>Người nhận:</strong> {selectedOrder.receiverName}
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
                    <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}
                  </span>
                </div>
                {selectedOrder.note && (
                  <div
                    className={styles.orderDetailItem}
                    style={{ gridColumn: "span 2" }}
                  >
                    <ExclamationCircleOutlined style={{ color: "#faad14" }} />
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
                style={{ margin: "0 0 12px", color: "#333", fontWeight: 600 }}
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
            <div>
              <h4
                style={{ margin: "0 0 12px", color: "#333", fontWeight: 600 }}
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
                  Cập nhật lần cuối: {formatDateTime(selectedOrder.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellerOrdersPage;
