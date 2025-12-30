import React, { useState } from "react";
import "../../../styles/PaymentPage.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const PaymentPage = () => {
  useScrollToTop();
  const [selectedMethod, setSelectedMethod] = useState("credit-card");

  const paymentMethods = [
    {
      id: "credit-card",
      name: "Thẻ tín dụng/Ghi nợ",
      icon: <CreditCardOutlined />,
      description:
        "Thanh toán nhanh chóng và bảo mật với thẻ Visa, MasterCard, JCB",
      fee: "Miễn phí",
      processingTime: "Tức thì",
      features: [
        "Bảo mật SSL 256-bit",
        "Xác thực 3D Secure",
        "Hoàn tiền trong 24h nếu hủy đơn",
      ],
    },
    {
      id: "bank-transfer",
      name: "Chuyển khoản ngân hàng",
      icon: <BankOutlined />,
      description: "Chuyển khoản qua Internet Banking hoặc tại quầy",
      fee: "Miễn phí",
      processingTime: "30 phút - 2 giờ",
      features: [
        "Hỗ trợ tất cả ngân hàng trong nước",
        "Chuyển khoản 24/7",
        "Tự động xác nhận thanh toán",
      ],
    },
    {
      id: "e-wallet",
      name: "Ví điện tử",
      icon: <WalletOutlined />,
      description: "Thanh toán qua Momo, ZaloPay, VNPay, ShopeePay",
      fee: "Miễn phí",
      processingTime: "Tức thì",
      features: [
        "Quét mã QR nhanh chóng",
        "Tích điểm thưởng",
        "Ưu đãi từ ví điện tử",
      ],
    },
    {
      id: "installment",
      name: "Trả góp 0%",
      icon: <CreditCardOutlined />,
      description: "Mua trước trả sau với lãi suất 0%",
      fee: "Miễn phí",
      processingTime: "1-2 ngày",
      features: [
        "Duyệt nhanh trong 5 phút",
        "Kỳ hạn linh hoạt 3-12 tháng",
        "Hồ sơ đơn giản",
      ],
    },
  ];

  const paymentGuide = [
    {
      step: 1,
      title: "Chọn sản phẩm",
      description: "Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán",
    },
    {
      step: 2,
      title: "Điền thông tin",
      description: "Nhập địa chỉ giao hàng và thông tin liên hệ",
    },
    {
      step: 3,
      title: "Chọn phương thức",
      description: "Lựa chọn phương thức thanh toán phù hợp",
    },
    {
      step: 4,
      title: "Xác nhận thanh toán",
      description: "Hoàn tất giao dịch và nhận mã đơn hàng",
    },
  ];

  const faqs = [
    {
      question: "Có được đổi phương thức thanh toán sau khi đặt hàng không?",
      answer:
        "Bạn có thể liên hệ hotline trong vòng 1 giờ sau khi đặt hàng để thay đổi phương thức thanh toán.",
    },
    {
      question: "Thanh toán có an toàn không?",
      answer:
        "Tất cả giao dịch đều được mã hóa SSL và tuân thủ tiêu chuẩn bảo mật PCI DSS.",
    },
    {
      question: "Khi nào tiền sẽ được hoàn lại nếu hủy đơn?",
      answer:
        "Tiền sẽ được hoàn về tài khoản/ví trong vòng 3-7 ngày làm việc tùy theo phương thức thanh toán.",
    },
    {
      question:
        "Có được sử dụng nhiều phương thức thanh toán cho 1 đơn hàng không?",
      answer: "Hiện tại chỉ hỗ trợ 1 phương thức thanh toán cho mỗi đơn hàng.",
    },
  ];

  const selectedMethodInfo = paymentMethods.find(
    (m) => m.id === selectedMethod
  );

  return (
    <div className="payment-page-container">
      {/* Hero Section */}
      <div className="payment-page-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Hướng Dẫn Thanh Toán</h1>
          <div className="hero-subtitle">
            Chọn phương thức thanh toán phù hợp với bạn
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="payment-methods-section">
        <div className="section-header">
          <h2>Phương thức thanh toán</h2>
          <p>Chọn phương thức thanh toán bạn muốn sử dụng</p>
        </div>

        <div className="payment-methods-grid">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`payment-method-card ${
                selectedMethod === method.id ? "active" : ""
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="method-icon">{method.icon}</div>
              <h3>{method.name}</h3>
              <p className="method-desc">{method.description}</p>
              <div className="method-info">
                <div className="info-item">
                  <span className="label">Phí:</span>
                  <span className="value">{method.fee}</span>
                </div>
                <div className="info-item">
                  <span className="label">Xử lý:</span>
                  <span className="value">{method.processingTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Method Details */}
      {selectedMethodInfo && (
        <div className="method-details-section">
          <div className="method-details-card">
            <h2>
              <CheckCircleOutlined style={{ marginRight: "10px" }} />
              Chi tiết về {selectedMethodInfo.name}
            </h2>
            <div className="features-list">
              {selectedMethodInfo.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <CheckCircleOutlined className="check-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Guide */}
      <div className="payment-guide-section">
        <h2>Quy trình thanh toán</h2>
        <div className="guide-timeline">
          {paymentGuide.map((step) => (
            <div key={step.step} className="guide-step">
              <div className="step-marker">{step.step}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="security-section">
        <h2>
          <SafetyOutlined style={{ marginRight: "10px" }} />
          Bảo mật thanh toán
        </h2>
        <div className="security-grid">
          <div className="security-item">
            <LockOutlined className="security-icon" />
            <h4>SSL 256-bit</h4>
            <p>Mã hóa dữ liệu an toàn tuyệt đối</p>
          </div>
          <div className="security-item">
            <SecurityScanOutlined className="security-icon" />
            <h4>PCI DSS</h4>
            <p>Tuân thủ chuẩn bảo mật quốc tế</p>
          </div>
          <div className="security-item">
            <SafetyOutlined className="security-icon" />
            <h4>3D Secure</h4>
            <p>Xác thực 2 lớp bảo vệ giao dịch</p>
          </div>
          <div className="security-item">
            <BankOutlined className="security-icon" />
            <h4>Ngân hàng</h4>
            <p>Liên kết trực tiếp các ngân hàng lớn</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="payment-faq-section">
        <h2>Câu hỏi thường gặp</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={index} className="faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="payment-contact-section">
        <div className="contact-card">
          <PhoneOutlined className="contact-icon" />
          <h2>Cần hỗ trợ thanh toán?</h2>
          <p>
            Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
          <div className="contact-methods">
            <div className="contact-method">
              <PhoneOutlined
                style={{ fontSize: "24px", marginBottom: "10px" }}
              />
              <strong>Hotline</strong>
              <span>0966 277 109</span>
              <span className="time">(8:00 - 21:00)</span>
            </div>
            <div className="contact-method">
              <MailOutlined
                style={{ fontSize: "24px", marginBottom: "10px" }}
              />
              <strong>Email</strong>
              <span>anhnta2004@gmail.com</span>
              <span className="time">Phản hồi trong 24h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
