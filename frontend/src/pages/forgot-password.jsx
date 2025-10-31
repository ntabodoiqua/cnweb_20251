import React, { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import { forgotPasswordApi } from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "./forgot-password.css";
import logo from "../assets/logo.png";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username } = values;

      const res = await forgotPasswordApi(username);

      if (res && res.code === 1000) {
        notification.success({
          message: "Gửi OTP thành công!",
          description: res.result || "Mã OTP đã được gửi đến email của bạn.",
          placement: "topRight",
          duration: 3,
        });
        // Chuyển đến trang reset password với username
        navigate("/reset-password", { state: { username } });
      } else if (res && res.code === 1201) {
        notification.error({
          message: "Không tìm thấy người dùng",
          description: "Tên đăng nhập không tồn tại trong hệ thống.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Gửi OTP thất bại",
          description: res?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: "Gửi OTP thất bại",
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

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left">
        <div className="forgot-password-left-content">
          <img src={logo} alt="Logo" className="forgot-password-logo" />
          <h1 className="forgot-password-welcome">Quên mật khẩu?</h1>
          <p className="forgot-password-description">
            Đừng lo lắng! Nhập tên đăng nhập của bạn và chúng tôi sẽ gửi mã OTP
            để đặt lại mật khẩu đến email của bạn.
          </p>
          <div className="forgot-password-features">
            <div className="feature-item">
              <div className="feature-icon">1</div>
              <div className="feature-text">Nhập tên đăng nhập</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">2</div>
              <div className="feature-text">Nhận mã OTP qua email</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">3</div>
              <div className="feature-text">Đặt lại mật khẩu mới</div>
            </div>
          </div>
        </div>
      </div>

      <div className="forgot-password-right">
        <div className="forgot-password-form-container">
          <h2 className="forgot-password-title">Quên mật khẩu</h2>
          <p className="forgot-password-subtitle">
            Nhập tên đăng nhập để nhận mã xác thực
          </p>

          <Form
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="forgot-password-form"
            requiredMark={false}
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên đăng nhập"
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
                className="forgot-password-button"
              >
                Gửi mã OTP
              </Button>
            </Form.Item>
          </Form>

          <div className="forgot-password-footer">
            <Link to="/login" className="back-to-login">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>

          <div className="forgot-password-home-link">
            <Link to="/">← Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
