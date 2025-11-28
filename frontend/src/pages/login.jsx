import React, { useState, useContext } from "react";
import { Button, Form, Input, notification } from "antd";
import {
  loginApi,
  resendOtpApi,
  loginWithGoogleApi,
  getMyInfoApi,
  mergeCartApi,
} from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { useCart } from "../contexts/CartContext";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { getTokenInfo } from "../util/jwt";
import { GoogleLogin } from "@react-oauth/google";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "./Login.module.css";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const { loadCartCount } = useCart();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Sử dụng hook để tự động scroll lên đầu trang
  useScrollToTop();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;

      // Lưu guest session ID trước khi đăng nhập (nếu có)
      const guestSessionId = localStorage.getItem("cart_session_id");

      const res = await loginApi(username, password);

      if (res && res.code === 1000) {
        // Đăng nhập thành công
        const { token, authenticated } = res.result;

        if (authenticated && token) {
          // Lưu token vào localStorage
          localStorage.setItem("access_token", token);

          // Decode token để lấy thông tin user
          const tokenInfo = getTokenInfo(token);

          // Gọi API để lấy đầy đủ thông tin user
          try {
            const userInfoRes = await getMyInfoApi();
            if (userInfoRes && userInfoRes.code === 1000) {
              const userInfo = userInfoRes.result;

              notification.success({
                message: "Đăng nhập thành công!",
                description: `Chào mừng ${
                  userInfo.firstName || userInfo.username || username
                } quay trở lại.`,
                placement: "topRight",
                duration: 3,
              });

              // Cập nhật auth context với đầy đủ thông tin
              setAuth({
                isAuthenticated: true,
                user: {
                  username:
                    userInfo.username || tokenInfo?.username || username,
                  role: tokenInfo?.role || "",
                  firstName: userInfo.firstName || "",
                  lastName: userInfo.lastName || "",
                  avatarUrl: userInfo.avatarUrl || userInfo.avatarName || "",
                  email: userInfo.email || "",
                },
              });
            } else {
              // Nếu không lấy được thông tin chi tiết, dùng thông tin từ token
              notification.success({
                message: "Đăng nhập thành công!",
                description: `Chào mừng ${
                  tokenInfo?.username || username
                } quay trở lại.`,
                placement: "topRight",
                duration: 3,
              });

              setAuth({
                isAuthenticated: true,
                user: {
                  username: tokenInfo?.username || username,
                  role: tokenInfo?.role || "",
                  firstName: "",
                  lastName: "",
                  avatarUrl: "",
                  email: "",
                },
              });
            }
          } catch (userInfoError) {
            console.error("Error fetching user info:", userInfoError);
            // Nếu có lỗi, vẫn đăng nhập với thông tin từ token
            notification.success({
              message: "Đăng nhập thành công!",
              description: `Chào mừng ${
                tokenInfo?.username || username
              } quay trở lại.`,
              placement: "topRight",
              duration: 3,
            });

            setAuth({
              isAuthenticated: true,
              user: {
                username: tokenInfo?.username || username,
                role: tokenInfo?.role || "",
                firstName: "",
                lastName: "",
                avatarUrl: "",
                email: "",
              },
            });
          }

          // Merge giỏ hàng guest vào giỏ hàng user (nếu có)
          if (guestSessionId && guestSessionId.startsWith("session_")) {
            try {
              await mergeCartApi(guestSessionId);
              console.log("Cart merged successfully from guest to user");
            } catch (mergeError) {
              console.error("Error merging cart:", mergeError);
              // Không thông báo lỗi để không làm gián đoạn trải nghiệm đăng nhập
            }
          }

          // Xóa session ID cũ để dùng user cart
          localStorage.removeItem("cart_session_id");

          // Cập nhật số lượng giỏ hàng sau khi đăng nhập
          await loadCartCount();

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

      // Lưu guest session ID trước khi đăng nhập (nếu có)
      const guestSessionId = localStorage.getItem("cart_session_id");

      // Gửi token lên backend để xác thực
      const res = await loginWithGoogleApi(credential);

      if (res && res.code === 1000) {
        const { token, authenticated } = res.result;

        if (authenticated && token) {
          // Lưu token vào localStorage
          localStorage.setItem("access_token", token);

          // Decode token để lấy thông tin user
          const tokenInfo = getTokenInfo(token);

          // Gọi API để lấy đầy đủ thông tin user
          try {
            const userInfoRes = await getMyInfoApi();
            if (userInfoRes && userInfoRes.code === 1000) {
              const userInfo = userInfoRes.result;

              notification.success({
                message: "Đăng nhập thành công!",
                description: `Chào mừng ${
                  userInfo.firstName || userInfo.username || "bạn"
                } quay trở lại.`,
                placement: "topRight",
                duration: 3,
              });

              // Cập nhật auth context
              setAuth({
                isAuthenticated: true,
                user: {
                  username: userInfo.username || tokenInfo?.username || "",
                  role: tokenInfo?.role || "",
                  firstName: userInfo.firstName || "",
                  lastName: userInfo.lastName || "",
                  avatarUrl: userInfo.avatarUrl || userInfo.avatarName || "",
                  email: userInfo.email || "",
                },
              });
            } else {
              notification.success({
                message: "Đăng nhập thành công!",
                description: `Chào mừng ${
                  tokenInfo?.username || "bạn"
                } quay trở lại.`,
                placement: "topRight",
                duration: 3,
              });

              setAuth({
                isAuthenticated: true,
                user: {
                  username: tokenInfo?.username || "",
                  role: tokenInfo?.role || "",
                  firstName: "",
                  lastName: "",
                  avatarUrl: "",
                  email: "",
                },
              });
            }
          } catch (userInfoError) {
            console.error("Error fetching user info:", userInfoError);
            notification.success({
              message: "Đăng nhập thành công!",
              description: `Chào mừng ${
                tokenInfo?.username || "bạn"
              } quay trở lại.`,
              placement: "topRight",
              duration: 3,
            });

            setAuth({
              isAuthenticated: true,
              user: {
                username: tokenInfo?.username || "",
                role: tokenInfo?.role || "",
                firstName: "",
                lastName: "",
                avatarUrl: "",
                email: "",
              },
            });
          }

          // Merge giỏ hàng guest vào giỏ hàng user (nếu có)
          if (guestSessionId && guestSessionId.startsWith("session_")) {
            try {
              await mergeCartApi(guestSessionId);
              console.log("Cart merged successfully from guest to user");
            } catch (mergeError) {
              console.error("Error merging cart:", mergeError);
              // Không thông báo lỗi để không làm gián đoạn trải nghiệm đăng nhập
            }
          }

          // Xóa session ID cũ để dùng user cart
          localStorage.removeItem("cart_session_id");

          // Cập nhật số lượng giỏ hàng sau khi đăng nhập
          await loadCartCount();

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
    <div className={styles.loginContainer}>
      <div className={styles.loginLeft}>
        <div className={styles.loginLeftContent}>
          <img src={logo} alt="Logo" className={styles.loginLogo} />
          <h1 className={styles.loginWelcome}>Chào mừng trở lại!</h1>
          <p className={styles.loginDescription}>
            Đăng nhập để tiếp tục trải nghiệm mua sắm tuyệt vời với hàng triệu
            sản phẩm chất lượng và nhiều ưu đãi hấp dẫn.
          </p>
          <div className={styles.loginFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <div className={styles.featureText}>Theo dõi đơn hàng</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <div className={styles.featureText}>Quản lý tài khoản</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <div className={styles.featureText}>Ưu đãi độc quyền</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.loginRight}>
        <div className={styles.loginFormContainer}>
          <h2 className={styles.loginTitle}>Đăng nhập</h2>
          <p className={styles.loginSubtitle}>
            Đăng nhập để truy cập vào tài khoản của bạn
          </p>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className={styles.loginForm}
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
                  <Link
                    to="/forgot-password"
                    className={styles.forgotPasswordLink}
                  >
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
                className={styles.loginButton}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.loginDivider}>
            <span>hoặc</span>
          </div>

          <div className={styles.googleLoginWrapper}>
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

          <div className={styles.loginFooter}>
            <span>Chưa có tài khoản? </span>
            <Link to="/register" className={styles.registerLink}>
              Đăng ký ngay
            </Link>
          </div>

          <div className={styles.loginHomeLink}>
            <Link to="/">← Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
