import React, { useState, useContext } from "react";
import { Button, Form, Input, notification, DatePicker, Checkbox } from "antd";
import { createUserApi, loginWithGoogleApi, getMyInfoApi } from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { getTokenInfo } from "../util/jwt";
import { GoogleLogin } from "@react-oauth/google";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "./Register.module.css";
import logo from "../assets/logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    score: 0,
    color: "",
  });

  // Sử dụng hook để tự động scroll lên đầu trang
  useScrollToTop();

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

    // Tính điểm
    if (checks.length) score += 20;
    if (password.length >= 12) score += 10;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 15;
    if (checks.special) score += 15;

    // Xác định độ mạnh
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

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password, firstName, lastName, dob, email, phone } =
        values;

      const userData = {
        username,
        password,
        firstName,
        lastName,
        dob: dob.format("YYYY-MM-DD"),
        email,
        phone,
      };

      const res = await createUserApi(userData);

      if (res && res.code === 1000) {
        notification.success({
          message: "Đăng ký thành công!",
          description: "Vui lòng kiểm tra email để nhận mã xác minh OTP.",
          placement: "topRight",
          duration: 3,
        });
        // Chuyển hướng đến trang xác minh email và truyền username
        navigate("/verify-email", { state: { username } });
      } else {
        notification.error({
          message: "Đăng ký thất bại",
          description: res.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập mật khẩu!"));
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

  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập số điện thoại!"));
    }
    if (!/^[0-9]{10}$/.test(value)) {
      return Promise.reject(new Error("Số điện thoại phải có 10 chữ số!"));
    }
    return Promise.resolve();
  };

  const validateDateOfBirth = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày sinh!"));
    }

    const today = new Date();
    const birthDate = value.toDate();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Điều chỉnh tuổi nếu chưa đến sinh nhật trong năm nay
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 16) {
      return Promise.reject(
        new Error("Bạn phải từ 16 tuổi trở lên để đăng ký!")
      );
    }

    if (age > 120) {
      return Promise.reject(new Error("Ngày sinh không hợp lệ!"));
    }

    return Promise.resolve();
  };

  const handleGoogleRegister = () => {
    // TODO: Implement Google OAuth registration
    notification.info({
      message: "Tính năng đang phát triển",
      description:
        "Đăng ký bằng Google sẽ được triển khai trong phiên bản tiếp theo.",
      placement: "topRight",
      duration: 3,
    });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { credential } = credentialResponse;

      // Gửi token lên backend để xác thực (sử dụng cùng API với login)
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
                message: "Đăng ký thành công!",
                description: `Chào mừng ${
                  userInfo.firstName || userInfo.username || "bạn"
                } đã tham gia HUSTBuy!`,
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
                message: "Đăng ký thành công!",
                description: `Chào mừng ${
                  tokenInfo?.username || "bạn"
                } đã tham gia HUSTBuy!`,
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
              message: "Đăng ký thành công!",
              description: `Chào mừng ${
                tokenInfo?.username || "bạn"
              } đã tham gia HUSTBuy!`,
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

          // Chuyển hướng về trang chủ
          navigate("/");
        }
      } else {
        notification.error({
          message: "Đăng ký thất bại",
          description:
            res?.message || "Không thể đăng ký bằng Google, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Google register error:", error);
      notification.error({
        message: "Đăng ký thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể đăng ký bằng Google, vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    notification.error({
      message: "Đăng ký thất bại",
      description: "Đăng ký bằng Google thất bại, vui lòng thử lại.",
      placement: "topRight",
      duration: 3,
    });
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerLeft}>
        <div className={styles.registerLeftContent}>
          <img src={logo} alt="Logo" className={styles.registerLogo} />
          <h1 className={styles.registerWelcome}>Chào mừng đến với HUSTBuy</h1>
          <p className={styles.registerDescription}>
            Đăng ký ngay để trải nghiệm mua sắm trực tuyến tuyệt vời với hàng
            triệu sản phẩm chất lượng, giá tốt nhất thị trường.
          </p>
          <div className={styles.registerFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <div className={styles.featureText}>Miễn phí vận chuyển</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <div className={styles.featureText}>Thanh toán an toàn</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <div className={styles.featureText}>Hoàn tiền 100%</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.registerRight}>
        <div className={styles.registerFormContainer}>
          <h2 className={styles.registerTitle}>Đăng ký tài khoản</h2>
          <p className={styles.registerSubtitle}>
            Tạo tài khoản mới để bắt đầu mua sắm
          </p>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className={styles.registerForm}
            requiredMark={false}
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới!",
                },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
                size="large"
              />
            </Form.Item>

            <div className={styles.formRow}>
              <Form.Item
                label="Họ và tên đệm"
                name="firstName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên đệm!" },
                ]}
                validateTrigger={["onChange", "onBlur"]}
                className={styles.formItemHalf}
              >
                <Input placeholder="Nhập họ và tên đệm" size="large" />
              </Form.Item>

              <Form.Item
                label="Tên"
                name="lastName"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                validateTrigger={["onChange", "onBlur"]}
                className={styles.formItemHalf}
              >
                <Input placeholder="Nhập tên" size="large" />
              </Form.Item>
            </div>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                size="large"
              />
            </Form.Item>

            <div className={styles.formRow}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ validator: validatePhone }]}
                validateTrigger={["onChange", "onBlur"]}
                className={styles.formItemHalf}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[{ validator: validateDateOfBirth }]}
                validateTrigger={["onChange", "onBlur"]}
                className={styles.formItemHalf}
              >
                <DatePicker
                  placeholder="Chọn ngày sinh"
                  size="large"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  suffixIcon={<CalendarOutlined />}
                  disabledDate={(current) => {
                    // Không cho chọn ngày trong tương lai
                    return current && current > new Date();
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ validator: validatePassword }]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                size="large"
                onChange={(e) => {
                  const strength = calculatePasswordStrength(e.target.value);
                  setPasswordStrength(strength);
                }}
              />
            </Form.Item>

            {passwordStrength.strength && (
              <div className={styles.passwordStrengthContainer}>
                <div className={styles.passwordStrengthBar}>
                  <div
                    className={styles.passwordStrengthFill}
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  ></div>
                </div>
                <div className={styles.passwordStrengthText}>
                  <span>Độ mạnh mật khẩu: </span>
                  <span
                    style={{ color: passwordStrength.color, fontWeight: 600 }}
                  >
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className={styles.passwordRequirements}>
                  <div className={styles.requirementItem}>
                    {form.getFieldValue("password")?.length >= 8 ? "✓" : "○"}{" "}
                    Tối thiểu 8 ký tự
                  </div>
                  <div className={styles.requirementItem}>
                    {/[a-z]/.test(form.getFieldValue("password") || "")
                      ? "✓"
                      : "○"}{" "}
                    Chữ thường
                  </div>
                  <div className={styles.requirementItem}>
                    {/[A-Z]/.test(form.getFieldValue("password") || "")
                      ? "✓"
                      : "○"}{" "}
                    Chữ hoa
                  </div>
                  <div className={styles.requirementItem}>
                    {/\d/.test(form.getFieldValue("password") || "")
                      ? "✓"
                      : "○"}{" "}
                    Số
                  </div>
                  <div className={styles.requirementItem}>
                    {/[@$!%*?&#]/.test(form.getFieldValue("password") || "")
                      ? "✓"
                      : "○"}{" "}
                    Ký tự đặc biệt
                  </div>
                </div>
              </div>
            )}

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
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
                placeholder="Nhập lại mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="agreeTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật!"
                          )
                        ),
                },
              ]}
            >
              <Checkbox className={styles.termsCheckbox}>
                Tôi đồng ý với{" "}
                <Link to="/terms" target="_blank" className={styles.termsLink}>
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  className={styles.termsLink}
                >
                  Chính sách bảo mật
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className={styles.registerButton}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.registerDivider}>
            <span>hoặc</span>
          </div>

          <div className={styles.googleRegisterWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              auto_select={false}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              logo_alignment="left"
              width="400"
              locale="vi"
            />
          </div>

          <div className={styles.registerFooter}>
            <span>Đã có tài khoản? </span>
            <Link to="/login" className={styles.loginLink}>
              Đăng nhập ngay
            </Link>
          </div>

          <div className={styles.registerHomeLink}>
            <Link to="/">← Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
