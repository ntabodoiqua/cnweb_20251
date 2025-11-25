import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import {
  removeCartItemApi,
  removeCartItemsApi,
  queryPaymentStatusApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import styles from "./PaymentResultPage.module.css";

/**
 * Payment Result Page
 * Hiển thị kết quả thanh toán từ ZaloPay
 */
const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadCartCount } = useCart();
  const [paymentStatus, setPaymentStatus] = useState("processing"); // processing, success, failed
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    // Lấy thông tin đơn hàng từ sessionStorage (backend flow mới)
    const pendingOrders = sessionStorage.getItem("pendingOrders");
    if (pendingOrders) {
      setOrderInfo(JSON.parse(pendingOrders));
    }

    // Kiểm tra query params từ ZaloPay
    const status = searchParams.get("status");
    const apptransid = searchParams.get("apptransid");
    const amount = searchParams.get("amount");

    console.log("Payment callback params:", { status, apptransid, amount });

    // Xử lý kết quả thanh toán
    const processPaymentResult = async () => {
      // Gọi API query payment status để backend cập nhật đơn hàng ngay lập tức
      if (apptransid) {
        console.log("Querying payment status for:", apptransid);
        try {
          const queryResponse = await queryPaymentStatusApi(apptransid);
          console.log("Payment status query response:", queryResponse);

          // Backend sẽ tự động cập nhật order status dựa trên kết quả query
          // Nếu return_code = 1 (success), backend sẽ publish PaymentSuccessEvent
          // Nếu return_code = 2 (failed), backend sẽ publish PaymentFailedEvent
        } catch (error) {
          console.error("Error querying payment status:", error);
          // Không block UI nếu query failed, vẫn dựa vào status từ URL
        }
      }

      // Thành công khi status = "1"
      if (status === "1") {
        setPaymentStatus("success");

        // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
        if (pendingOrders) {
          const orderData = JSON.parse(pendingOrders);

          // Lấy danh sách items từ orders
          if (orderData.orders && orderData.orders.length > 0) {
            try {
              const allItems = orderData.orders.flatMap(
                (order) => order.items || []
              );

              // Collect all variant IDs to remove
              const variantIdsToRemove = allItems
                .filter((item) => item.variantId)
                .map((item) => item.variantId);

              if (variantIdsToRemove.length > 0) {
                await removeCartItemsApi(variantIdsToRemove);
              }

              // Cập nhật lại số lượng giỏ hàng
              await loadCartCount();
              console.log("Removed purchased items from cart");
            } catch (error) {
              console.error("Error removing items from cart:", error);
            }
          }
        }

        // Xóa pending orders sau khi thành công
        sessionStorage.removeItem("pendingOrders");
      } else {
        // Thất bại khi status != "1" hoặc không có status
        setPaymentStatus("failed");
      }
    };

    // Delay 1.5s để hiển thị loading spinner
    setTimeout(() => {
      processPaymentResult();
    }, 1500);
  }, [searchParams, loadCartCount]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (paymentStatus === "processing") {
    return (
      <LoadingSpinner tip="Đang xác nhận thanh toán..." fullScreen={true} />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {paymentStatus === "success" ? (
          // Success State
          <div className={styles.resultCard}>
            <div className={styles.iconSuccess}>
              <CheckCircleOutlined />
            </div>
            <h1 className={styles.title}>Thanh toán thành công!</h1>
            <p className={styles.subtitle}>
              Cảm ơn bạn đã mua hàng tại HUSTBuy
            </p>

            {orderInfo && orderInfo.orders && (
              <div className={styles.orderDetails}>
                <h3>Thông tin đơn hàng</h3>
                <div className={styles.detailRow}>
                  <span>Số lượng đơn hàng:</span>
                  <strong>{orderInfo.orders.length}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Tổng sản phẩm:</span>
                  <strong>
                    {orderInfo.orders.reduce(
                      (sum, order) =>
                        sum +
                        (order.items?.reduce(
                          (itemSum, item) => itemSum + (item.quantity || 0),
                          0
                        ) || 0),
                      0
                    )}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Tổng tiền:</span>
                  <strong className={styles.amount}>
                    {formatCurrency(
                      orderInfo.orders.reduce(
                        (sum, order) =>
                          sum + parseFloat(order.totalAmount || 0),
                        0
                      )
                    )}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Phương thức thanh toán:</span>
                  <strong>ZaloPay</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Mã giao dịch:</span>
                  <strong style={{ fontSize: "12px", color: "#666" }}>
                    {orderInfo.appTransId ||
                      searchParams.get("apptransid") ||
                      "N/A"}
                  </strong>
                </div>
                {orderInfo.orders.map((order, index) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      📦 Đơn hàng {index + 1}: {order.storeName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      Mã đơn: {order.orderNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("/profile/orders")}
              >
                <ShoppingOutlined />
                <span>Xem đơn hàng</span>
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("/")}
              >
                <HomeOutlined />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        ) : (
          // Failed State
          <div className={styles.resultCard}>
            <div className={styles.iconFailed}>
              <CloseCircleOutlined />
            </div>
            <h1 className={styles.title}>Thanh toán thất bại</h1>
            <p className={styles.subtitle}>
              Đã có lỗi xảy ra trong quá trình thanh toán
            </p>

            <div className={styles.errorDetails}>
              <p>
                Giao dịch của bạn chưa được hoàn tất. Vui lòng thử lại hoặc liên
                hệ với chúng tôi nếu cần hỗ trợ.
              </p>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("/cart")}
              >
                <ShoppingOutlined />
                <span>Quay lại giỏ hàng</span>
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("/")}
              >
                <HomeOutlined />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
