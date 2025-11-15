import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin } from "antd";
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
    setTimeout(() => {
      if (status === "1" || apptransid) {
        setPaymentStatus("success");
        // Xóa pending order sau khi thành công
        sessionStorage.removeItem("pendingOrder");

        // TODO: Gọi API để cập nhật trạng thái đơn hàng
      } else {
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
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.processingCard}>
            <Spin size="large" />
            <h2>Đang xác nhận thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
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
                  <strong>{orderInfo.items.length}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Tổng tiền:</span>
                  <strong className={styles.amount}>
                    {formatCurrency(orderInfo.total)}
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
