import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { removeCartItemApi } from "../../util/api";
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
    // Lấy thông tin đơn hàng từ sessionStorage
    const pendingOrder = sessionStorage.getItem("pendingOrder");
    if (pendingOrder) {
      setOrderInfo(JSON.parse(pendingOrder));
    }

    // Kiểm tra query params từ ZaloPay
    const status = searchParams.get("status");
    const apptransid = searchParams.get("apptransid");

    // Giả lập xử lý kết quả thanh toán
    setTimeout(async () => {
      // Chễ thành công khi status = "1"
      if (status === "1") {
        setPaymentStatus("success");

        // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          if (orderData.items && orderData.items.length > 0) {
            try {
              // Xóa từng sản phẩm khỏi giỏ hàng
              for (const item of orderData.items) {
                try {
                  await removeCartItemApi(item.productId, item.variantId);
                } catch (error) {
                  console.error(
                    `Error removing item ${item.productId}:`,
                    error
                  );
                }
              }

              // Cập nhật lại số lượng giỏ hàng
              await loadCartCount();
              console.log("Removed purchased items from cart");
            } catch (error) {
              console.error("Error removing items from cart:", error);
            }
          }
        }

        // Xóa pending order sau khi thành công
        sessionStorage.removeItem("pendingOrder");

        // TODO: Gọi API để cập nhật trạng thái đơn hàng
      } else {
        // Thất bại khi status != "1" hoặc không có status
        setPaymentStatus("failed");
      }
    }, 2000);
  }, [searchParams]);

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

            {orderInfo && (
              <div className={styles.orderDetails}>
                <h3>Thông tin đơn hàng</h3>
                <div className={styles.detailRow}>
                  <span>Số lượng sản phẩm:</span>
                  <strong>
                    {orderInfo.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Tổng tiền:</span>
                  <strong className={styles.amount}>
                    {formatCurrency(orderInfo.finalTotal)}
                  </strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Phương thức thanh toán:</span>
                  <strong>ZaloPay</strong>
                </div>
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
