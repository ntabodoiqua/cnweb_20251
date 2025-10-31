import React, { useState, useEffect } from "react";
import { Button, Form, Input, notification, Space } from "antd";
import { verifyEmailApi, resendOtpApi } from "../util/api";
import { useNavigate, useLocation } from "react-router-dom";
import { MailOutlined, SafetyOutlined } from "@ant-design/icons";
import "./verify-email.css";
import logo from "../assets/logo.png";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Lấy username từ state của navigation
    const usernameFromState = location.state?.username;
    if (!usernameFromState) {
      notification.warning({
        message: "Thông báo",
        description: "Vui lòng đăng ký tài khoản trước.",
        placement: "topRight",
        duration: 3,
      });
      navigate("/register");
      return;
    }
    setUsername(usernameFromState);
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer cho nút gửi lại OTP
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { otpCode } = values;

      const res = await verifyEmailApi(username, otpCode);

      if (res && res.code === 1000) {
        notification.success({
          message: "Xác minh thành công!",
          description:
            "Email của bạn đã được xác minh. Vui lòng đăng nhập để tiếp tục.",
          placement: "topRight",
          duration: 3,
        });
        navigate("/login");
      } else {
        notification.error({
          message: "Xác minh thất bại",
          description: res.message || "Mã OTP không chính xác hoặc đã hết hạn.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: "Xác minh thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Đã có lỗi xảy ra, vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const res = await resendOtpApi(username);

      if (res && res.code === 1000) {
        notification.success({
          message: "Gửi lại OTP thành công!",
          description: "Mã OTP mới đã được gửi đến email của bạn.",
          placement: "topRight",
          duration: 3,
        });
        setCountdown(60); // Đặt thời gian chờ 60 giây trước khi có thể gửi lại
      } else {
        notification.error({
          message: "Gửi lại OTP thất bại",
          description: res.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: "Gửi lại OTP thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Đã có lỗi xảy ra, vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, "");
    form.setFieldsValue({ otpCode: value });
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-left">
        <div className="verify-email-left-content">
          <img src={logo} alt="Logo" className="verify-email-logo" />
          <h1 className="verify-email-welcome">Xác minh email</h1>
          <p className="verify-email-description">
            Chúng tôi đã gửi một mã xác minh gồm 6 chữ số đến email của bạn. Vui
            lòng kiểm tra hộp thư đến hoặc thư spam và nhập mã để hoàn tất việc
            đăng ký.
          </p>
          <div className="verify-email-features">
            <div className="feature-item">
              <div className="feature-icon">1</div>
              <div className="feature-text">Kiểm tra email của bạn</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">2</div>
              <div className="feature-text">Nhập mã OTP gồm 6 chữ số</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">3</div>
              <div className="feature-text">Hoàn tất xác minh và đăng nhập</div>
            </div>
          </div>
        </div>
      </div>

      <div className="verify-email-right">
        <div className="verify-email-form-container">
          <div className="verify-email-icon-wrapper">
            <MailOutlined className="verify-email-icon" />
          </div>

          <h2 className="verify-email-title">Xác minh email</h2>
          <p className="verify-email-subtitle">
            Nhập mã xác minh đã được gửi đến email của bạn
          </p>

          {username && (
            <div className="verify-email-username">
              <span>Tài khoản: </span>
              <strong>{username}</strong>
            </div>
          )}

          <Form
            form={form}
            name="verify-email"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="verify-email-form"
            requiredMark={false}
          >
            <Form.Item
              label="Mã OTP"
              name="otpCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã OTP!" },
                { len: 6, message: "Mã OTP phải có đúng 6 chữ số!" },
                {
                  pattern: /^[0-9]{6}$/,
                  message: "Mã OTP chỉ chứa số!",
                },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="Nhập mã OTP 6 chữ số"
                size="large"
                maxLength={6}
                onChange={handleOtpChange}
                className="otp-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="verify-email-button"
              >
                Xác minh
              </Button>
            </Form.Item>
          </Form>

          <div className="verify-email-footer">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div className="resend-otp-section">
                <span>Không nhận được mã? </span>
                <Button
                  type="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  loading={resendLoading}
                  className="resend-link"
                >
                  {countdown > 0
                    ? `Gửi lại sau ${countdown}s`
                    : "Gửi lại mã OTP"}
                </Button>
              </div>

              <div className="verify-email-note">
                <p>
                  <strong>Lưu ý:</strong> Mã OTP có hiệu lực trong 5 phút. Nếu
                  bạn không nhận được email, vui lòng kiểm tra hộp thư spam.
                </p>
              </div>
            </Space>
          </div>

          <div className="verify-email-back-link">
            <Button
              type="link"
              onClick={() => navigate("/register")}
              className="back-link"
            >
              ← Quay lại đăng ký
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
