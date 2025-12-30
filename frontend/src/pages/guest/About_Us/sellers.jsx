import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/sellers.module.css";
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
import { Button } from "antd";
import logo from "../../../assets/logo.png";

const Sellers = () => {
  useScrollToTop();
  const navigate = useNavigate();

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

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={`${styles.heroCircle} ${styles.heroCircle1}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle2}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle3}`}></div>
        </div>
        <div className={styles.heroContent}>
          <img src={logo} alt="HUSTBuy Logo" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>Bán Hàng Cùng HUSTBuy</h1>
          <div className={styles.heroSubtitle}>
            Mở rộng kinh doanh, tiếp cận hàng triệu khách hàng trên toàn quốc
          </div>
          <div className={styles.heroButtons}>
            <Button
              size="large"
              icon={<RocketOutlined />}
              className={styles.heroCtaPrimary}
              onClick={() => navigate("/login")}
            >
              Đăng ký ngay
            </Button>
            <Button
              size="large"
              className={styles.heroCtaSecondary}
              onClick={() => {
                document
                  .querySelector(".${styles.benefitsSection}")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>Lợi Ích Khi Bán Hàng Trên HUSTBuy</h2>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{ color: benefit.color }}>
                {benefit.icon}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <div className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>Bắt Đầu Bán Hàng Chỉ Với 4 Bước</h2>
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Tại Sao Chọn HUSTBuy?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureContent}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className={styles.supportSection}>
        <h3>Cần hỗ trợ?</h3>
        <p>
          Liên hệ với chúng tôi qua hotline: <strong>0966 277 109</strong>
        </p>
        <p>
          Email: <strong>anhnta2004@gmail.com</strong>
        </p>
      </div>
    </div>
  );
};

export default Sellers;