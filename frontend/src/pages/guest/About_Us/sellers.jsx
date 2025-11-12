import React, { useState } from "react";
import "../../../styles/sellers.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  ShopOutlined,
  RocketOutlined,
  TrophyOutlined,
  DollarOutlined,
  TeamOutlined,
  SafetyOutlined,
  LineChartOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  StarOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, notification } from "antd";
import logo from "../../../assets/logo.png";

const Sellers = () => {
  useScrollToTop();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const benefits = [
    {
      icon: <DollarOutlined />,
      title: "Hoa hồng cạnh tranh",
      description: "Tỷ lệ hoa hồng hấp dẫn, thanh toán nhanh chóng",
      color: "#52c41a",
    },
    {
      icon: <GlobalOutlined />,
      title: "Tiếp cận hàng triệu khách hàng",
      description: "Mở rộng thị trường trên toàn quốc",
      color: "#1890ff",
    },
    {
      icon: <SafetyOutlined />,
      title: "Bảo vệ người bán",
      description: "Chính sách bảo vệ quyền lợi người bán",
      color: "#722ed1",
    },
    {
      icon: <LineChartOutlined />,
      title: "Công cụ quản lý mạnh mẽ",
      description: "Dashboard thống kê chi tiết, dễ sử dụng",
      color: "#fa8c16",
    },
    {
      icon: <CustomerServiceOutlined />,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ hỗ trợ chuyên nghiệp",
      color: "#eb2f96",
    },
    {
      icon: <ThunderboltOutlined />,
      title: "Tiếp thị miễn phí",
      description: "Quảng bá sản phẩm trên nhiều kênh",
      color: "#13c2c2",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Đăng ký tài khoản",
      description: "Tạo tài khoản người bán và hoàn thiện thông tin",
      icon: <ShopOutlined />,
    },
    {
      number: "02",
      title: "Xác thực thông tin",
      description: "Cung cấp giấy tờ cần thiết để xác minh",
      icon: <SafetyOutlined />,
    },
    {
      number: "03",
      title: "Tạo cửa hàng",
      description: "Thiết lập cửa hàng và đăng sản phẩm",
      icon: <ShopOutlined />,
    },
    {
      number: "04",
      title: "Bắt đầu bán hàng",
      description: "Tiếp cận khách hàng và phát triển doanh số",
      icon: <RocketOutlined />,
    },
  ];

  const features = [
    {
      icon: <CheckCircleOutlined />,
      title: "Miễn phí đăng ký",
      description: "Không tốn phí khởi tạo, chỉ trả hoa hồng khi bán được hàng",
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Dễ dàng quản lý",
      description: "Giao diện đơn giản, dễ sử dụng cho người mới bắt đầu",
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Thanh toán đúng hạn",
      description: "Rút tiền linh hoạt, thanh toán nhanh chóng, minh bạch",
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Đào tạo miễn phí",
      description: "Khóa học, tài liệu hướng dẫn bán hàng hiệu quả",
    },
  ];

  const stats = [
    {
      number: "50K+",
      label: "Người bán",
      icon: <TeamOutlined />,
    },
    {
      number: "1M+",
      label: "Sản phẩm",
      icon: <ShopOutlined />,
    },
    {
      number: "5M+",
      label: "Đơn hàng/tháng",
      icon: <TrophyOutlined />,
    },
    {
      number: "99%",
      label: "Hài lòng",
      icon: <StarOutlined />,
    },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // TODO: Implement API call to register seller
      console.log("Seller registration:", values);
      
      notification.success({
        message: "Đăng ký thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn trong vòng 24h. Cảm ơn bạn đã quan tâm!",
        placement: "topRight",
        duration: 5,
      });
      
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sellers-container">
      {/* Hero Section */}
      <div className="sellers-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Bán Hàng Cùng HUSTBuy</h1>
          <div className="hero-subtitle">
            Mở rộng kinh doanh, tiếp cận hàng triệu khách hàng trên toàn quốc
          </div>
          <div className="hero-buttons">
            <Button
              size="large"
              icon={<RocketOutlined />}
              className="hero-cta-primary"
              onClick={() => {
                document
                  .getElementById("register-form")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Đăng ký ngay
            </Button>
            <Button size="large" className="hero-cta-secondary">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2 className="section-title">Lợi Ích Khi Bán Hàng Trên HUSTBuy</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon" style={{ color: benefit.color }}>
                {benefit.icon}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <div className="steps-section">
        <h2 className="section-title">Bắt Đầu Bán Hàng Chỉ Với 4 Bước</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Tại Sao Chọn HUSTBuy?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <div className="registration-section" id="register-form">
        <div className="registration-content">
          <div className="registration-info">
            <h2>Đăng Ký Trở Thành Người Bán</h2>
            <p>
              Điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn trong
              vòng 24 giờ để hỗ trợ quá trình đăng ký.
            </p>
            <div className="info-highlights">
              <div className="highlight-item">
                <CheckCircleOutlined className="highlight-icon" />
                <span>Miễn phí đăng ký</span>
              </div>
              <div className="highlight-item">
                <CheckCircleOutlined className="highlight-icon" />
                <span>Hỗ trợ tận tình</span>
              </div>
              <div className="highlight-item">
                <CheckCircleOutlined className="highlight-icon" />
                <span>Hoa hồng hấp dẫn</span>
              </div>
            </div>
          </div>
          <div className="registration-form">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input size="large" placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input size="large" placeholder="Nhập email" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có 10 chữ số!",
                  },
                ]}
              >
                <Input size="large" placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                label="Tên cửa hàng/doanh nghiệp"
                name="shopName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên cửa hàng/doanh nghiệp!",
                  },
                ]}
              >
                <Input size="large" placeholder="Nhập tên cửa hàng" />
              </Form.Item>

              <Form.Item
                label="Loại sản phẩm kinh doanh"
                name="productCategory"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập loại sản phẩm!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="VD: Thời trang, Điện tử, Mỹ phẩm..."
                />
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea
                  rows={4}
                  placeholder="Thông tin bổ sung (nếu có)"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  className="submit-btn"
                  icon={<RocketOutlined />}
                >
                  Đăng ký ngay
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <h3>Cần hỗ trợ?</h3>
        <p>Liên hệ với chúng tôi qua hotline: <strong>0966 277 109</strong></p>
        <p>Email: <strong>anhnta2004@gmail.com</strong></p>
      </div>
    </div>
  );
};

export default Sellers;
