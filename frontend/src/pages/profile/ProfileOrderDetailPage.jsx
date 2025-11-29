import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  GiftOutlined,
  ExclamationCircleOutlined,
  PayCircleOutlined,
  WarningOutlined,
  CarOutlined,
  RollbackOutlined,
  StopOutlined,
} from "@ant-design/icons";
import NoImages from "../../assets/NoImages.webp";
import styles from "../Profile.module.css";
import {
  getOrderDetailApi,
  initiateOrderPaymentApi,
  deliverOrderApi,
  cancelOrderApi,
  requestReturnApi,
} from "../../util/api";
import {
  message,
  Modal,
  Tag,
  Spin,
  Button,
  Popconfirm,
  Select,
  Input,
} from "antd";
import LoadingSpinner from "../../components/LoadingSpinner";

const { TextArea } = Input;

const ProfileOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);

  // Action states
  const [actionLoading, setActionLoading] = useState({});
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnData, setReturnData] = useState({
    returnReason: "",
    returnDescription: "",
    returnImages: [],
  });

  // Return reason options
  const returnReasonOptions = [
    { value: "DAMAGED", label: "Sản phẩm bị hư hỏng" },
    { value: "DEFECTIVE", label: "Sản phẩm lỗi" },
    { value: "WRONG_ITEM", label: "Giao sai sản phẩm" },
    { value: "NOT_AS_DESCRIBED", label: "Sản phẩm không đúng mô tả" },
    { value: "CHANGED_MIND", label: "Đổi ý không muốn mua nữa" },
    { value: "SIZE_NOT_FIT", label: "Kích cỡ không phù hợp" },
    { value: "QUALITY_ISSUE", label: "Vấn đề về chất lượng" },
    { value: "OTHER", label: "Lý do khác" },
  ];

  // Fetch order detail from API
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const response = await getOrderDetailApi(orderId);
      if (response?.code === 200) {
        setOrder(response.result);
      } else {
        message.error("Không thể tải thông tin đơn hàng");
        navigate("/profile/orders");
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      message.error("Không thể tải thông tin đơn hàng");
      navigate("/profile/orders");
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Update countdown timer every second
  useEffect(() => {
    if (!order) return;

    const updateTimer = () => {
      if (order.status === "PENDING" && order.paymentStatus !== "PAID") {
        setTimeRemaining(calculateTimeRemaining(order.createdAt));
      } else {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // Calculate time remaining for payment
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

  // Check if order can be paid
  const canPayOrder = () => {
    if (!order) return false;
    if (order.status !== "PENDING") return false;
    if (order.paymentStatus === "PAID") return false;
    return timeRemaining && !timeRemaining.expired;
  };

  // Format countdown timer
  const formatCountdown = (minutes, seconds) => {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

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
      SHIPPING: {
        icon: <CarOutlined />,
        label: "Đang giao",
        color: "#13c2c2",
      },
      DELIVERED: {
        icon: <GiftOutlined />,
        label: "Đã giao",
        color: "#52c41a",
      },
      CANCELLED: {
        icon: <CloseOutlined />,
        label: "Đã hủy",
        color: "#ff4d4f",
      },
      RETURNED: {
        icon: <RollbackOutlined />,
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
          padding: "6px 16px",
          borderRadius: "12px",
          fontSize: "14px",
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

  // Handle payment
  const handlePayOrder = async () => {
    if (!canPayOrder()) return;

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
          {timeRemaining && (
            <p style={{ color: "#faad14" }}>
              <ClockCircleOutlined /> Thời gian còn lại:{" "}
              <strong>
                {formatCountdown(timeRemaining.minutes, timeRemaining.seconds)}
              </strong>
            </p>
          )}
        </div>
      ),
      okText: "Thanh toán ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setPayingOrderId(order.id);
        try {
          const expirySeconds = Math.max(
            timeRemaining?.totalSeconds || 300,
            300
          );
          const response = await initiateOrderPaymentApi(
            [order.id],
            expirySeconds
          );

          if (response?.code === 200 && response?.result?.paymentUrl) {
            message.success("Đang chuyển đến cổng thanh toán...", 1.5);

            sessionStorage.setItem(
              "pendingOrders",
              JSON.stringify({
                orders: [order],
                orderIds: [order.id],
                appTransId: response.result.appTransId,
                timestamp: Date.now(),
                expirySeconds: timeRemaining?.totalSeconds,
              })
            );

            window.open(response.result.paymentUrl, "_self");
          } else {
            throw new Error(
              response?.message || "Không thể khởi tạo thanh toán"
            );
          }
        } catch (error) {
          console.error("Payment error:", error);
          let errorMessage = "Không thể thanh toán. Vui lòng thử lại!";

          if (error.response?.data?.message) {
            const backendMessage = error.response.data.message;
            if (
              backendMessage.includes("hết hạn") ||
              backendMessage.includes("expired")
            ) {
              errorMessage =
                "Đơn hàng đã hết hạn thanh toán. Vui lòng tạo đơn hàng mới.";
              fetchOrderDetail();
            } else if (
              backendMessage.includes("đã bị hủy") ||
              backendMessage.includes("CANCELLED")
            ) {
              errorMessage = "Đơn hàng đã bị hủy. Không thể thanh toán.";
              fetchOrderDetail();
            } else {
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

  // Confirm delivery
  const handleConfirmDelivery = async () => {
    setActionLoading((prev) => ({ ...prev, deliver: true }));
    try {
      const response = await deliverOrderApi(order.id);
      if (response?.code === 200) {
        message.success("Đã xác nhận nhận hàng thành công!");
        fetchOrderDetail();
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      message.error(
        error.response?.data?.message || "Không thể xác nhận nhận hàng"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, deliver: false }));
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn");
      return;
    }

    setActionLoading((prev) => ({ ...prev, cancel: true }));
    try {
      const response = await cancelOrderApi(order.id, cancelReason);
      if (response?.code === 200) {
        message.success("Đã hủy đơn hàng thành công!");
        setCancelModalVisible(false);
        fetchOrderDetail();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setActionLoading((prev) => ({ ...prev, cancel: false }));
    }
  };

  // Request return
  const handleRequestReturn = async () => {
    if (!returnData.returnReason) {
      message.warning("Vui lòng chọn lý do trả hàng");
      return;
    }
    if (!returnData.returnDescription.trim()) {
      message.warning("Vui lòng mô tả chi tiết lý do trả hàng");
      return;
    }

    setActionLoading((prev) => ({ ...prev, return: true }));
    try {
      const response = await requestReturnApi(order.id, {
        returnReason: returnData.returnReason,
        returnDescription: returnData.returnDescription,
        returnImages: returnData.returnImages,
      });
      if (response?.code === 200) {
        message.success("Đã gửi yêu cầu trả hàng thành công!");
        setReturnModalVisible(false);
        fetchOrderDetail();
      }
    } catch (error) {
      console.error("Error requesting return:", error);
      message.error(
        error.response?.data?.message || "Không thể gửi yêu cầu trả hàng"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, return: false }));
    }
  };

  // Check permissions
  const canCancel = () =>
    order?.status === "PENDING" && order?.paymentStatus !== "PAID";
  const canConfirmDelivery = () => order?.status === "SHIPPING";
  const canRequestReturn = () => order?.canBeReturned === true;

  if (loading) {
    return (
      <LoadingSpinner tip="Đang tải thông tin đơn hàng..." fullScreen={false} />
    );
  }

  if (!order) {
    return (
      <div className={styles.emptyState}>
        <ShoppingOutlined />
        <h3>Không tìm thấy đơn hàng</h3>
        <p>Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/profile/orders")}
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
      {/* Back button */}
      <div style={{ marginBottom: "24px" }}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => navigate("/profile/orders")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <ArrowLeftOutlined /> Quay lại danh sách đơn hàng
        </button>
      </div>

      {/* Order Header */}
      <div
        style={{
          background: "white",
          border: "2px solid #f0f0f0",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px", color: "#333", fontSize: "20px" }}>
              <ShoppingOutlined
                style={{ marginRight: "8px", color: "#ee4d2d" }}
              />
              Đơn hàng #{order.orderNumber}
            </h2>
            <div style={{ color: "#888", fontSize: "14px" }}>
              <CalendarOutlined style={{ marginRight: "6px" }} />
              Ngày đặt: {formatDateTime(order.createdAt)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {getStatusBadge(order.status)}
            {getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>

        {/* Countdown Timer */}
        {timeRemaining && (
          <div style={{ marginTop: "16px" }}>
            {!timeRemaining.expired ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background:
                    timeRemaining.totalSeconds < 300
                      ? "rgba(255, 77, 79, 0.1)"
                      : "rgba(250, 173, 20, 0.1)",
                  border: `1px solid ${
                    timeRemaining.totalSeconds < 300 ? "#ff4d4f" : "#faad14"
                  }`,
                  borderRadius: "8px",
                  color:
                    timeRemaining.totalSeconds < 300 ? "#ff4d4f" : "#faad14",
                  fontWeight: 600,
                }}
              >
                {timeRemaining.totalSeconds < 300 ? (
                  <WarningOutlined />
                ) : (
                  <ClockCircleOutlined />
                )}
                Thời gian thanh toán còn lại:{" "}
                <span style={{ fontSize: "18px" }}>
                  {formatCountdown(
                    timeRemaining.minutes,
                    timeRemaining.seconds
                  )}
                </span>
                {timeRemaining.totalSeconds < 300 && (
                  <span style={{ fontSize: "12px" }}>(Sắp hết hạn)</span>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "rgba(255, 77, 79, 0.1)",
                  border: "1px solid #ff4d4f",
                  borderRadius: "8px",
                  color: "#ff4d4f",
                  fontWeight: 600,
                }}
              >
                <WarningOutlined />
                Đã hết hạn thanh toán
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shipping Info */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <TruckOutlined style={{ color: "#ee4d2d" }} />
          Thông tin giao hàng
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <UserOutlined style={{ marginRight: "8px", color: "#666" }} />
            <strong>Người nhận:</strong> {order.receiverName}
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: "8px", color: "#666" }} />
            <strong>Số điện thoại:</strong> {order.receiverPhone}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <EnvironmentOutlined
              style={{ marginRight: "8px", color: "#666" }}
            />
            <strong>Địa chỉ:</strong> {order.shippingAddress}
          </div>
          {order.note && (
            <div style={{ gridColumn: "1 / -1" }}>
              <ExclamationCircleOutlined
                style={{ marginRight: "8px", color: "#faad14" }}
              />
              <strong>Ghi chú:</strong> {order.note}
            </div>
          )}
        </div>
      </div>

      {/* Store Info */}
      <div
        style={{
          background: "#fff7e6",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <h3
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
        </h3>
        <div style={{ fontSize: "15px" }}>
          <strong>Tên cửa hàng:</strong> {order.storeName}
        </div>
      </div>

      {/* Products */}
      <div
        style={{
          background: "white",
          border: "2px solid #f0f0f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#333" }}>Sản phẩm đã đặt</h3>
        {order.items?.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              display: "flex",
              gap: "16px",
              padding: "16px",
              background: "#fafafa",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <img
              src={item.productImage || NoImages}
              alt={item.productName}
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
                  margin: "0 0 8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#333",
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
              <div style={{ fontSize: "13px", color: "#888" }}>
                Số lượng: {item.quantity}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{ color: "#ee4d2d", fontWeight: 600, fontSize: "15px" }}
              >
                {formatCurrency(item.price)}
              </div>
              <div style={{ fontSize: "13px", color: "#666" }}>
                x{item.quantity}
              </div>
              <div style={{ marginTop: "8px", fontWeight: 600, color: "#333" }}>
                = {formatCurrency(item.totalPrice)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div
        style={{
          background: "#fff1f0",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CreditCardOutlined style={{ color: "#ff4d4f" }} />
          Thông tin thanh toán
        </h3>
        <div style={{ fontSize: "15px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span>Phương thức:</span>
            <span>
              {order.paymentMethod === "ZALO_PAY"
                ? "ZaloPay"
                : order.paymentMethod}
            </span>
          </div>
          {order.paymentTransactionId && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span>Mã giao dịch:</span>
              <span style={{ fontFamily: "monospace" }}>
                {order.paymentTransactionId}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span>Tạm tính:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
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
              fontWeight: 700,
              fontSize: "18px",
              color: "#ff4d4f",
              borderTop: "1px dashed #ffccc7",
              paddingTop: "12px",
              marginTop: "8px",
            }}
          >
            <span>Tổng thanh toán:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div
        style={{
          background: "white",
          border: "2px solid #f0f0f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#333" }}>Lịch sử đơn hàng</h3>
        <div style={{ fontSize: "14px", color: "#666" }}>
          <div style={{ marginBottom: "10px" }}>
            <CalendarOutlined style={{ marginRight: "8px" }} />
            Ngày tạo: {formatDateTime(order.createdAt)}
          </div>
          {order.confirmedAt && (
            <div style={{ marginBottom: "10px" }}>
              <CheckCircleOutlined
                style={{ marginRight: "8px", color: "#52c41a" }}
              />
              Đã xác nhận: {formatDateTime(order.confirmedAt)}
            </div>
          )}
          {order.shippedAt && (
            <div style={{ marginBottom: "10px" }}>
              <CarOutlined style={{ marginRight: "8px", color: "#13c2c2" }} />
              Đang giao: {formatDateTime(order.shippedAt)}
            </div>
          )}
          {order.deliveredAt && (
            <div style={{ marginBottom: "10px" }}>
              <GiftOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
              Đã giao: {formatDateTime(order.deliveredAt)}
            </div>
          )}
          {order.cancelledAt && (
            <div style={{ marginBottom: "10px" }}>
              <CloseOutlined style={{ marginRight: "8px", color: "#ff4d4f" }} />
              Đã hủy: {formatDateTime(order.cancelledAt)}
              {order.cancelReason && (
                <div style={{ marginLeft: "20px", color: "#ff4d4f" }}>
                  Lý do: {order.cancelReason}
                </div>
              )}
            </div>
          )}
          <div>
            <CalendarOutlined style={{ marginRight: "8px" }} />
            Cập nhật lần cuối: {formatDateTime(order.updatedAt)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {/* Pay button */}
        {canPayOrder() && (
          <button
            style={{
              background: "#52c41a",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
            }}
            onClick={handlePayOrder}
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

        {/* Confirm delivery button */}
        {canConfirmDelivery() && (
          <Popconfirm
            title="Xác nhận đã nhận hàng"
            description="Bạn đã nhận được hàng và hài lòng với sản phẩm?"
            onConfirm={handleConfirmDelivery}
            okText="Đã nhận hàng"
            cancelText="Hủy"
          >
            <button
              style={{
                background: "#52c41a",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
              }}
              disabled={actionLoading.deliver}
            >
              {actionLoading.deliver ? (
                <Spin size="small" />
              ) : (
                <CheckCircleOutlined />
              )}
              Đã nhận hàng
            </button>
          </Popconfirm>
        )}

        {/* Request return button */}
        {canRequestReturn() && (
          <button
            style={{
              background: "#722ed1",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
            }}
            onClick={() => {
              setReturnData({
                returnReason: "",
                returnDescription: "",
                returnImages: [],
              });
              setReturnModalVisible(true);
            }}
            disabled={actionLoading.return}
          >
            {actionLoading.return ? (
              <Spin size="small" />
            ) : (
              <RollbackOutlined />
            )}
            Yêu cầu trả hàng
          </button>
        )}

        {/* Cancel button */}
        {canCancel() && (
          <button
            style={{
              background: "#ff4d4f",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
            }}
            onClick={() => {
              setCancelReason("");
              setCancelModalVisible(true);
            }}
            disabled={actionLoading.cancel}
          >
            {actionLoading.cancel ? <Spin size="small" /> : <StopOutlined />}
            Hủy đơn
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StopOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
            <span>Hủy đơn hàng #{order.orderNumber}</span>
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
            loading={actionLoading.cancel}
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
          <TextArea
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
            Lưu ý: Đơn hàng sau khi hủy sẽ không thể khôi phục.
          </span>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RollbackOutlined style={{ color: "#722ed1", fontSize: "18px" }} />
            <span>Yêu cầu trả hàng #{order.orderNumber}</span>
          </div>
        }
        open={returnModalVisible}
        onCancel={() => setReturnModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setReturnModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ background: "#722ed1", borderColor: "#722ed1" }}
            loading={actionLoading.return}
            onClick={handleRequestReturn}
          >
            Gửi yêu cầu trả hàng
          </Button>,
        ]}
        width={600}
      >
        <div>
          {/* Order Summary */}
          <div
            style={{
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}
            >
              Thông tin đơn hàng
            </div>
            <div style={{ fontSize: "13px", color: "#666" }}>
              <div>Cửa hàng: {order.storeName}</div>
              <div>
                Tổng tiền:{" "}
                <span style={{ color: "#ee4d2d", fontWeight: 600 }}>
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Lý do trả hàng <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn lý do trả hàng"
              value={returnData.returnReason || undefined}
              onChange={(value) =>
                setReturnData((prev) => ({ ...prev, returnReason: value }))
              }
              options={returnReasonOptions}
            />
          </div>

          {/* Return Description */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Mô tả chi tiết <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết lý do trả hàng..."
              value={returnData.returnDescription}
              onChange={(e) =>
                setReturnData((prev) => ({
                  ...prev,
                  returnDescription: e.target.value,
                }))
              }
              maxLength={1000}
              showCount
            />
          </div>

          <div
            style={{
              padding: "12px",
              background: "#f6ffed",
              borderRadius: "8px",
              border: "1px solid #b7eb8f",
            }}
          >
            <ExclamationCircleOutlined
              style={{ color: "#52c41a", marginRight: "8px" }}
            />
            <span style={{ color: "#389e0d" }}>
              Yêu cầu trả hàng sẽ được người bán xem xét trong vòng 24-48 giờ.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileOrderDetailPage;
