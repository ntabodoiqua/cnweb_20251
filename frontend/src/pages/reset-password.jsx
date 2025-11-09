import React, { useState, useEffect } from "react";
import { Button, Form, Input, notification } from "antd";
import { resetPasswordApi, forgotPasswordApi } from "../util/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LockOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import "./reset-password.css";
import logo from "../assets/logo.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [username, setUsername] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    score: 0,
    color: "",
  });

  useEffect(() => {
    // Lấy username từ state của navigation
    const usernameFromState = location.state?.username;
    if (!usernameFromState) {
      notification.warning({
        message: "Thông báo",
        description: "Vui lòng nhập tên đăng nhập để nhận mã OTP.",
        placement: "topRight",
        duration: 3,
      });
      navigate("/forgot-password");
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

  // Hàm tính độ mạnh mật khẩu
  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { strength: "", score: 0, color: "" };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    if (checks.length) score += 20;
    if (password.length >= 12) score += 10;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 15;
    if (checks.special) score += 15;

    let strength = "";
    let color = "";

    if (score < 40) {
      strength = "Yếu";
      color = "#ff4d4f";
    } else if (score < 60) {
      strength = "Trung bình";
      color = "#faad14";
    } else if (score < 80) {
      strength = "Khá mạnh";
      color = "#52c41a";
    } else {
      strength = "Rất mạnh";
      color = "#389e0d";
    }

    return { strength, score, color };
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập mật khẩu mới!"));
    }
    if (value.length < 8) {
      return Promise.reject(new Error("Mật khẩu phải có ít nhất 8 ký tự!"));
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return Promise.reject(
        new Error("Mật khẩu phải chứa ít nhất 1 chữ thường!")
      );
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return Promise.reject(new Error("Mật khẩu phải chứa ít nhất 1 chữ hoa!"));
    }
    if (!/(?=.*\d)/.test(value)) {
      return Promise.reject(new Error("Mật khẩu phải chứa ít nhất 1 số!"));
    }
    if (!/(?=.*[@$!%*?&#])/.test(value)) {
      return Promise.reject(
        new Error("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)!")
      );
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { otpCode, newPassword } = values;

      const res = await resetPasswordApi(username, otpCode, newPassword);

      if (res && res.code === 1000) {
        notification.success({
          message: "Đặt lại mật khẩu thành công!",
          description:
            "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.",
          placement: "topRight",
          duration: 3,
        });
        navigate("/login");
      } else if (res && res.code === 1302) {
        notification.error({
          message: "Mã OTP không đúng",
          description: "Vui lòng kiểm tra lại mã OTP hoặc yêu cầu gửi lại.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Đặt lại mật khẩu thất bại",
          description: res?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: "Đặt lại mật khẩu thất bại",
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
      const res = await forgotPasswordApi(username);

      if (res && res.code === 1000) {
        notification.success({
          message: "Gửi lại OTP thành công!",
          description: "Mã OTP mới đã được gửi đến email của bạn.",
          placement: "topRight",
          duration: 3,
        });
        setCountdown(60);
      } else {
        notification.error({
          message: "Gửi lại OTP thất bại",
          description: res?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
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
    <div className="reset-password-container">
      <div className="reset-password-left">
        <div className="reset-password-left-content">
          <img src={logo} alt="Logo" className="reset-password-logo" />
          <h1 className="reset-password-welcome">Đặt lại mật khẩu</h1>
          <p className="reset-password-description">
            Nhập mã OTP đã được gửi đến email của bạn và tạo mật khẩu mới để bảo
            mật tài khoản.
          </p>
          <div className="reset-password-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Mã OTP từ email</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Mật khẩu mạnh (8+ ký tự)</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Bảo mật tối đa</div>
            </div>
          </div>
        </div>
      </div>

      <div className="reset-password-right">
        <div className="reset-password-form-container">
          <h2 className="reset-password-title">Đặt lại mật khẩu</h2>
          <p className="reset-password-subtitle">
            Nhập mã OTP và mật khẩu mới của bạn
          </p>

          {username && (
            <div className="reset-password-username">
              <span>Tài khoản: </span>
              <strong>{username}</strong>
            </div>
          )}

          <Form
            form={form}
            name="reset-password"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="reset-password-form"
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

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[{ validator: validatePassword }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                size="large"
                onChange={(e) => {
                  const strength = calculatePasswordStrength(e.target.value);
                  setPasswordStrength(strength);
                }}
              />
            </Form.Item>

            {passwordStrength.strength && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  ></div>
                </div>
                <div className="password-strength-text">
                  <span>Độ mạnh mật khẩu: </span>
                  <span
                    style={{ color: passwordStrength.color, fontWeight: 600 }}
                  >
                    {passwordStrength.strength}
                  </span>
                </div>
              </div>
            )}

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu mới!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="reset-password-button"
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div className="reset-password-footer">
            <div className="resend-otp-section">
              <span>Không nhận được mã? </span>
              <Button
                type="link"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                loading={resendLoading}
                className="resend-link"
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã OTP"}
              </Button>
            </div>
          </div>

          <div className="reset-password-back-link">
            <Link to="/login" className="back-to-login">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>

          <div className="reset-password-home-link">
            <Link to="/">← Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
