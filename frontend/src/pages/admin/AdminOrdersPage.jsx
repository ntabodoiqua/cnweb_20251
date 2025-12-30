import { useState, useEffect, useCallback } from "react";
import {
  ShoppingOutlined,
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  GiftOutlined,
  RollbackOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import {
  Input,
  Select,
  DatePicker,
  InputNumber,
  Modal,
  Descriptions,
  Spin,
  Empty,
  message,
  Pagination,
  Tag,
  Image,
} from "antd";
import dayjs from "dayjs";
import { getAdminOrdersApi } from "../../util/api";
import styles from "./AdminOrdersPage.module.css";
import NoImages from "../../assets/NoImages.webp";

const { RangePicker } = DatePicker;

/**
 * AdminOrdersPage - Trang quản lý đơn hàng
 */
const AdminOrdersPage = () => {
  // State cho danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 10,
    total: 0,
  });

  // State cho filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    minAmount: null,
    maxAmount: null,
  });

  // State cho modal chi tiết
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Stats - OrderStatus: PENDING, PAID, CONFIRMED, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
    totalRevenue: 0,
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        page: pagination.current,
        size: pagination.pageSize,
      };

      const response = await getAdminOrdersApi(params);
      // Axios customize unwraps data, so response is already the data object
      if (response && response.code === 200) {
        const data = response.result;
        setOrders(data.content || []);
        setPagination((prev) => ({
          ...prev,
          total: data.totalElements || 0,
        }));

        // Calculate stats from current page - OrderStatus: PENDING, PAID, CONFIRMED, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED
        const orderList = data.content || [];
        setStats({
          total: data.totalElements || 0,
          pending: orderList.filter((o) => o.status === "PENDING").length,
          paid: orderList.filter((o) => o.status === "PAID").length,
          confirmed: orderList.filter((o) => o.status === "CONFIRMED").length,
          shipping: orderList.filter((o) => o.status === "SHIPPING").length,
          delivered: orderList.filter((o) => o.status === "DELIVERED").length,
          completed: orderList.filter((o) => o.status === "COMPLETED").length,
          cancelled: orderList.filter((o) => o.status === "CANCELLED").length,
          returned: orderList.filter((o) => o.status === "RETURNED").length,
          totalRevenue: orderList.reduce(
            (sum, o) => sum + (o.totalAmount || 0),
            0
          ),
        });
      } else if (response && response.result) {
        // Alternative response structure
        const data = response.result;
        setOrders(data.content || []);
        setPagination((prev) => ({
          ...prev,
          total: data.totalElements || 0,
        }));
        const orderList = data.content || [];
        setStats({
          total: data.totalElements || 0,
          pending: orderList.filter((o) => o.status === "PENDING").length,
          paid: orderList.filter((o) => o.status === "PAID").length,
          confirmed: orderList.filter((o) => o.status === "CONFIRMED").length,
          shipping: orderList.filter((o) => o.status === "SHIPPING").length,
          delivered: orderList.filter((o) => o.status === "DELIVERED").length,
          completed: orderList.filter((o) => o.status === "COMPLETED").length,
          cancelled: orderList.filter((o) => o.status === "CANCELLED").length,
          returned: orderList.filter((o) => o.status === "RETURNED").length,
          totalRevenue: orderList.reduce(
            (sum, o) => sum + (o.totalAmount || 0),
            0
          ),
        });
      } else {
        message.error(response?.message || "Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Log more details for debugging
      if (error.response) {
        console.error("Response error:", error.response.data);
        message.error(error.response.data?.message || "Lỗi từ server");
      } else if (error.request) {
        console.error("Request error:", error.request);
        message.error("Không thể kết nối đến server");
      } else {
        message.error("Có lỗi xảy ra khi tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, current: 0 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DDTHH:mm:ss"),
        endDate: dates[1].format("YYYY-MM-DDTHH:mm:ss"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    }
    setPagination((prev) => ({ ...prev, current: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
      minAmount: null,
      maxAmount: null,
    });
    setPagination((prev) => ({ ...prev, current: 0 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page - 1,
      pageSize,
    }));
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  // Status helpers - OrderStatus: PENDING, PAID, CONFIRMED, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "statusPending";
      case "PAID":
        return "statusPaid";
      case "CONFIRMED":
        return "statusConfirmed";
      case "SHIPPING":
        return "statusShipping";
      case "DELIVERED":
        return "statusDelivered";
      case "COMPLETED":
        return "statusCompleted";
      case "CANCELLED":
        return "statusCancelled";
      case "RETURNED":
        return "statusReturned";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PAID":
        return "Đã thanh toán";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "SHIPPING":
        return "Đang giao";
      case "DELIVERED":
        return "Đã giao";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "RETURNED":
        return "Đã trả hàng";
      default:
        return status;
    }
  };

  // PaymentStatus: UNPAID, PENDING, PAID, FAILED, REFUNDED
  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case "UNPAID":
        return "paymentUnpaid";
      case "PENDING":
        return "paymentPending";
      case "PAID":
        return "paymentPaid";
      case "FAILED":
        return "paymentFailed";
      case "REFUNDED":
        return "paymentRefunded";
      default:
        return "";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "UNPAID":
        return "Chưa thanh toán";
      case "PENDING":
        return "Đang xử lý";
      case "PAID":
        return "Đã thanh toán";
      case "FAILED":
        return "Thất bại";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "ZALO_PAY":
        return "ZaloPay";
      case "BANK_TRANSFER":
        return "Chuyển khoản";
      default:
        return method;
    }
  };

  // Format helpers
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return amount.toLocaleString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  return (
    <div className={styles.adminOrders}>
      {/* Stats */}
      <div
        className="admin-stats-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
      >
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tổng đơn</span>
            <div className="admin-stat-icon">
              <ShoppingOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.total}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Doanh thu</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
              }}
            >
              <DollarOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value" style={{ fontSize: "14px" }}>
            ₫{formatCurrency(stats.totalRevenue)}
          </h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Chờ xác nhận</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              }}
            >
              <ClockCircleOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.pending}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã thanh toán</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              }}
            >
              <CreditCardOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.paid}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã xác nhận</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              }}
            >
              <CheckCircleOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.confirmed}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đang giao</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              }}
            >
              <CarOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.shipping}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã giao</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)",
              }}
            >
              <GiftOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.delivered}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã hủy</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
              }}
            >
              <CloseCircleOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.cancelled}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Đã trả hàng</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)",
              }}
            >
              <RollbackOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.returned}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.adminSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filtersRow}>
            <Input
              placeholder="Tìm kiếm mã đơn, khách hàng, cửa hàng..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Select
              placeholder="Trạng thái đơn"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="PENDING">Chờ xác nhận</Select.Option>
              <Select.Option value="PAID">Đã thanh toán</Select.Option>
              <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
              <Select.Option value="SHIPPING">Đang giao</Select.Option>
              <Select.Option value="DELIVERED">Đã giao</Select.Option>
              <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy</Select.Option>
              <Select.Option value="RETURNED">Đã trả hàng</Select.Option>
            </Select>
            <Select
              placeholder="Thanh toán"
              value={filters.paymentStatus || undefined}
              onChange={(value) => handleFilterChange("paymentStatus", value)}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="UNPAID">Chưa thanh toán</Select.Option>
              <Select.Option value="PENDING">Đang xử lý</Select.Option>
              <Select.Option value="PAID">Đã thanh toán</Select.Option>
              <Select.Option value="FAILED">Thất bại</Select.Option>
              <Select.Option value="REFUNDED">Đã hoàn tiền</Select.Option>
            </Select>
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder={["Từ ngày", "Đến ngày"]}
              onChange={handleDateRangeChange}
              value={
                filters.startDate && filters.endDate
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                  : null
              }
            />
          </div>
          <div className={styles.filtersRow}>
            <InputNumber
              placeholder="Số tiền tối thiểu"
              value={filters.minAmount}
              onChange={(value) => handleFilterChange("minAmount", value)}
              style={{ width: 150 }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
            <InputNumber
              placeholder="Số tiền tối đa"
              value={filters.maxAmount}
              onChange={(value) => handleFilterChange("maxAmount", value)}
              style={{ width: 150 }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ReloadOutlined /> Reset
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={fetchOrders}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FilterOutlined /> Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách đơn hàng ({pagination.total})
        </h2>
        <Spin spinning={loading}>
          {orders.length > 0 ? (
            <>
              <div className={styles.adminTableContainer}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Sản phẩm</th>
                      <th>Cửa hàng</th>
                      <th>Tổng tiền</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                      <th className={styles.stickyCol}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className={styles.orderInfo}>
                            <strong>{order.orderNumber}</strong>
                            <small style={{ color: "#999", display: "block" }}>
                              {formatDateTime(order.createdAt).split(" ")[0]}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className={styles.customerInfo}>
                            <span className={styles.customerName}>
                              {order.receiverName}
                            </span>
                            <small style={{ color: "#999", display: "block" }}>
                              @{order.username}
                            </small>
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
                            <span style={{ color: "#999" }}>-</span>
                          )}
                        </td>
                        <td>
                          <span className={styles.storeName}>
                            {order.storeName}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#ee4d2d" }}>
                            ₫{formatCurrency(order.totalAmount)}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={
                              styles[
                                getPaymentStatusBadgeClass(order.paymentStatus)
                              ]
                            }
                          >
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[getStatusBadgeClass(order.status)]
                            }`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          {order.returnReason &&
                            order.refundStatus === "PENDING" && (
                              <Tag
                                color="orange"
                                style={{ marginLeft: 4, fontSize: 11 }}
                              >
                                Chờ trả hàng
                              </Tag>
                            )}
                        </td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td className={styles.stickyCol}>
                          <div className={styles.adminActionButtons}>
                            <button
                              className={`${styles.adminActionBtn} ${styles.view}`}
                              title="Xem chi tiết"
                              onClick={() => handleViewDetail(order)}
                            >
                              <EyeOutlined />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Pagination
                  current={pagination.current + 1}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} đơn hàng`
                  }
                />
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy đơn hàng nào"
            />
          )}
        </Spin>
      </div>

      {/* Order Detail Modal */}
      <Modal
        title={
          <span>
            Chi tiết đơn hàng: <strong>{selectedOrder?.orderNumber}</strong>
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng">
                <strong>{selectedOrder.orderNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span
                  className={`${styles.statusBadge} ${
                    styles[getStatusBadgeClass(selectedOrder.status)]
                  }`}
                >
                  {getStatusText(selectedOrder.status)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Cửa hàng">
                {selectedOrder.storeName}
              </Descriptions.Item>
              <Descriptions.Item label="Username">
                {selectedOrder.username}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận" span={2}>
                <div>
                  <strong>{selectedOrder.receiverName}</strong>
                </div>
                <div>{selectedOrder.receiverPhone}</div>
                <div>{selectedOrder.receiverEmail}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Tạm tính">
                ₫{formatCurrency(selectedOrder.subtotal)}
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                -₫{formatCurrency(selectedOrder.discountAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <strong style={{ color: "#ee4d2d", fontSize: "16px" }}>
                  ₫{formatCurrency(selectedOrder.totalAmount)}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Mã giảm giá">
                {selectedOrder.couponCode || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức TT">
                <Tag color="blue">
                  {getPaymentMethodText(selectedOrder.paymentMethod)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <span
                  className={
                    styles[
                      getPaymentStatusBadgeClass(selectedOrder.paymentStatus)
                    ]
                  }
                >
                  {getPaymentStatusText(selectedOrder.paymentStatus)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Mã giao dịch">
                {selectedOrder.paymentTransactionId || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thanh toán">
                {formatDateTime(selectedOrder.paidAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDateTime(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật">
                {formatDateTime(selectedOrder.updatedAt)}
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedOrder.note}
                </Descriptions.Item>
              )}
              {selectedOrder.cancelReason && (
                <Descriptions.Item label="Lý do hủy" span={2}>
                  <span style={{ color: "#ff4d4f" }}>
                    {selectedOrder.cancelReason}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Order Items */}
            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 12 }}>
                Sản phẩm ({selectedOrder.items?.length || 0})
              </h4>
              <ul className={styles.orderItemsList}>
                {selectedOrder.items?.map((item) => (
                  <li key={item.id} className={styles.orderItemRow}>
                    <Image
                      src={item.productImage || "/placeholder-product.png"}
                      alt={item.productName}
                      className={styles.orderItemImage}
                      width={60}
                      height={60}
                      preview={false}
                      fallback="/placeholder-product.png"
                    />
                    <div className={styles.orderItemInfo}>
                      <div className={styles.orderItemName}>
                        {item.productName}
                      </div>
                      <div className={styles.orderItemVariant}>
                        {item.variantName && (
                          <span>Phân loại: {item.variantName}</span>
                        )}
                        {item.sku && <span> | SKU: {item.sku}</span>}
                      </div>
                      <div style={{ color: "#999", fontSize: 12 }}>
                        x{item.quantity}
                      </div>
                    </div>
                    <div className={styles.orderItemPrice}>
                      <div className={styles.orderItemUnitPrice}>
                        ₫{formatCurrency(item.price)}
                      </div>
                      <div className={styles.orderItemTotalPrice}>
                        ₫{formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
