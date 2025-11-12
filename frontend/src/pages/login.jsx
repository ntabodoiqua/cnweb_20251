import React, { useState, useContext } from "react";
import { Button, Form, Input, notification } from "antd";
import { loginApi, resendOtpApi, loginWithGoogleApi } from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { getTokenInfo } from "../util/jwt";
import { GoogleLogin } from "@react-oauth/google";
import useScrollToTop from "../hooks/useScrollToTop";
import "./login.css";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Sử dụng hook để tự động scroll lên đầu trang
  useScrollToTop();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;

      const res = await loginApi(username, password);

      if (res && res.code === 1000) {
        // Đăng nhập thành công
        const { token, authenticated } = res.result;

        if (authenticated && token) {
          // Lưu token vào localStorage
          localStorage.setItem("access_token", token);

          // Decode token để lấy thông tin user
          const tokenInfo = getTokenInfo(token);

          notification.success({
            message: "Đăng nhập thành công!",
            description: `Chào mừng ${
              tokenInfo?.username || username
            } quay trở lại.`,
            placement: "topRight",
            duration: 3,
          });

          // Cập nhật auth context với đầy đủ thông tin
          setAuth({
            isAuthenticated: true,
            user: {
              username: tokenInfo?.username || username,
              role: tokenInfo?.role || "",
            },
          });

          // Chuyển hướng đến trang profile
          navigate("/profile");
        }
      } else if (res && res.code === 1214) {
        // Email chưa được xác thực
        notification.warning({
          message: "Email chưa được xác thực",
          description:
            res.message || "Vui lòng kiểm tra email để xác thực tài khoản.",
          placement: "topRight",
          duration: 5,
        });

        // Tự động gửi OTP
        try {
          const otpRes = await resendOtpApi(username);
          if (otpRes && otpRes.code === 1000) {
            notification.success({
              message: "Đã gửi mã OTP",
              description: "Mã OTP đã được gửi đến email của bạn.",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch (otpError) {
          console.error("Error sending OTP:", otpError);
        }

        // Chuyển hướng đến trang xác minh email
        navigate("/verify-email", { state: { username } });
      } else if (res && res.code === 1102) {
        // Sai mật khẩu
        notification.error({
          message: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không chính xác.",
          placement: "topRight",
          duration: 3,
        });
      } else if (res && res.code === 1201) {
        // Người dùng không tồn tại
        notification.error({
          message: "Đăng nhập thất bại",
          description:
            "Không tìm thấy người dùng. Vui lòng kiểm tra lại tên đăng nhập.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        // Lỗi khác
        notification.error({
          message: "Đăng nhập thất bại",
          description: res?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      notification.error({
        message: "Đăng nhập thất bại",
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

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth login
    notification.info({
      message: "Tính năng đang phát triển",
      description:
        "Đăng nhập bằng Google sẽ được triển khai trong phiên bản tiếp theo.",
      placement: "topRight",
      duration: 3,
    });
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { credential } = credentialResponse;

      // Gửi token lên backend để xác thực
      const res = await loginWithGoogleApi(credential);

      if (res && res.code === 1000) {
        const { token, authenticated } = res.result;

        if (authenticated && token) {
          // Lưu token vào localStorage
          localStorage.setItem("access_token", token);

          // Decode token để lấy thông tin user
          const tokenInfo = getTokenInfo(token);

          notification.success({
            message: "Đăng nhập thành công!",
            description: `Chào mừng ${
              tokenInfo?.username || "bạn"
            } quay trở lại.`,
            placement: "topRight",
            duration: 3,
          });

          // Cập nhật auth context
          setAuth({
            isAuthenticated: true,
            user: {
              username: tokenInfo?.username || "",
              role: tokenInfo?.role || "",
            },
          });

          // Chuyển hướng đến trang profile
          navigate("/profile");
        }
      } else {
        notification.error({
          message: "Đăng nhập thất bại",
          description:
            res?.message ||
            "Không thể đăng nhập bằng Google, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      notification.error({
        message: "Đăng nhập thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể đăng nhập bằng Google, vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    notification.error({
      message: "Đăng nhập thất bại",
      description: "Đăng nhập bằng Google thất bại, vui lòng thử lại.",
      placement: "topRight",
      duration: 3,
    });
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <img src={logo} alt="Logo" className="login-logo" />
          <h1 className="login-welcome">Chào mừng trở lại!</h1>
          <p className="login-description">
            Đăng nhập để tiếp tục trải nghiệm mua sắm tuyệt vời với hàng triệu
            sản phẩm chất lượng và nhiều ưu đãi hấp dẫn.
          </p>
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Theo dõi đơn hàng</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Quản lý tài khoản</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Ưu đãi độc quyền</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-subtitle">
            Đăng nhập để truy cập vào tài khoản của bạn
          </p>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="login-form"
            requiredMark={false}
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>Mật khẩu</span>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Quên mật khẩu?
                  </Link>
                </div>
              }
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
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
                className="login-button"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="login-divider">
            <span>hoặc</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap={false}
              auto_select={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              logo_alignment="left"
              width="400"
              locale="vi"
            />
          </div>

          <div className="login-footer">
            <span>Chưa có tài khoản? </span>
            <Link to="/register" className="register-link">
              Đăng ký ngay
            </Link>
          </div>

          <div className="login-home-link">
            <Link to="/">← Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
