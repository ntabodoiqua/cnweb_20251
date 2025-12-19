import React, { useState } from "react";
import "../../../styles/ShippingPage.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  RocketOutlined,
  CarOutlined,
  InboxOutlined,
  DollarOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const ShippingPage = () => {
  useScrollToTop();
  const [selectedRegion, setSelectedRegion] = useState("inner-city");

  const shippingMethods = [
    {
      id: "express",
      name: "Giao hàng hỏa tốc",
      icon: <ThunderboltOutlined />,
      time: "2-4 giờ",
      fee: "30.000đ - 50.000đ",
      description: "Giao hàng trong ngày, áp dụng nội thành",
      features: ["Giao trong 2-4 giờ", "Theo dõi realtime", "Ưu tiên cao nhất"]
    },
    {
      id: "fast",
      name: "Giao hàng nhanh",
      icon: <RocketOutlined />,
      time: "1-2 ngày",
      fee: "20.000đ - 35.000đ",
      description: "Giao hàng nhanh trong 1-2 ngày làm việc",
      features: ["Giao trong 1-2 ngày", "Miễn phí đơn >300K", "Hỗ trợ COD"]
    },
    {
      id: "standard",
      name: "Giao hàng tiêu chuẩn",
      icon: <InboxOutlined />,
      time: "3-5 ngày",
      fee: "15.000đ - 25.000đ",
      description: "Giao hàng tiêu chuẩn toàn quốc",
      features: ["Giao trong 3-5 ngày", "Miễn phí đơn >500K", "Đóng gói cẩn thận"]
    },
    {
      id: "economy",
      name: "Giao hàng tiết kiệm",
      icon: <DollarOutlined />,
      time: "5-7 ngày",
      fee: "10.000đ - 20.000đ",
      description: "Tiết kiệm chi phí, thời gian linh động",
      features: ["Giao trong 5-7 ngày", "Phí thấp nhất", "Phù hợp hàng khối lượng lớn"]
    }
  ];

  const regionFees = [
    {
      id: "inner-city",
      name: "Nội thành Hà Nội, TP.HCM",
      standardFee: "15.000đ",
      fastFee: "25.000đ",
      time: "1-2 ngày",
      freeThreshold: "300.000đ"
    },
    {
      id: "nearby",
      name: "Các tỉnh lân cận",
      standardFee: "20.000đ",
      fastFee: "35.000đ",
      time: "2-3 ngày",
      freeThreshold: "500.000đ"
    },
    {
      id: "regional",
      name: "Miền Bắc, Miền Trung",
      standardFee: "25.000đ",
      fastFee: "40.000đ",
      time: "3-4 ngày",
      freeThreshold: "700.000đ"
    },
    {
      id: "southern",
      name: "Miền Nam, Tây Nguyên",
      standardFee: "30.000đ",
      fastFee: "45.000đ",
      time: "4-5 ngày",
      freeThreshold: "800.000đ"
    },
    {
      id: "remote",
      name: "Vùng xa, hải đảo",
      standardFee: "40.000đ",
      fastFee: "60.000đ",
      time: "5-7 ngày",
      freeThreshold: "1.000.000đ"
    }
  ];

  const trackingSteps = [
    {
      step: 1,
      title: "Đóng gói",
      description: "Sản phẩm được đóng gói cẩn thận"
    },
    {
      step: 2,
      title: "Xác nhận",
      description: "Đơn hàng được xác nhận và xuất kho"
    },
    {
      step: 3,
      title: "Vận chuyển",
      description: "Hàng đang trên đường giao đến bạn"
    },
    {
      step: 4,
      title: "Giao hàng",
      description: "Shipper đang giao hàng đến địa chỉ"
    },
    {
      step: 5,
      title: "Hoàn thành",
      description: "Giao hàng thành công"
    }
  ];

  const shippingNotes = [
    {
      icon: <HomeOutlined />,
      title: "Giao hàng tận nơi",
      description: "Giao hàng tận địa chỉ đã cung cấp, miễn phí lên lầu"
    },
    {
      icon: <PhoneOutlined />,
      title: "Liên hệ trước khi giao",
      description: "Shipper sẽ gọi điện trước 15-30 phút"
    },
    {
      icon: <InboxOutlined />,
      title: "Kiểm tra hàng",
      description: "Được kiểm tra sản phẩm trước khi thanh toán"
    },
    {
      icon: <SyncOutlined />,
      title: "Giao lại miễn phí",
      description: "Nếu lần đầu không gặp, sẽ giao lại 1 lần miễn phí"
    }
  ];

  const faqs = [
    {
      question: "Làm thế nào để theo dõi đơn hàng?",
      answer: "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập tài khoản và vào mục 'Đơn hàng của tôi' hoặc sử dụng mã vận đơn trên trang tra cứu."
    },
    {
      question: "Tôi có thể thay đổi địa chỉ giao hàng không?",
      answer: "Bạn có thể thay đổi địa chỉ trong vòng 1 giờ sau khi đặt hàng bằng cách liên hệ hotline."
    },
    {
      question: "Phí ship được tính như thế nào?",
      answer: "Phí ship được tính dựa trên khoảng cách, khối lượng và phương thức giao hàng bạn chọn."
    },
    {
      question: "Nếu không có nhà khi ship giao hàng?",
      answer: "Shipper sẽ liên hệ và hẹn lại thời gian giao hàng thuận tiện cho bạn (1 lần miễn phí)."
    },
    {
      question: "Giao hàng có đúng giờ không?",
      answer: "Chúng tôi cam kết giao hàng đúng khung giờ đã hẹn. Nếu trễ quá 2 giờ, bạn được miễn phí ship."
    }
  ];

  const selectedRegionInfo = regionFees.find(r => r.id === selectedRegion);

  return (
    <div className="shipping-page-container">
      {/* Hero Section */}
      <div className="shipping-page-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Chính Sách Giao Hàng</h1>
          <div className="hero-subtitle">
            Giao hàng nhanh chóng, an toàn và miễn phí cho đơn hàng từ 300K
          </div>
        </div>
      </div>

      {/* Shipping Methods Section */}
      <div className="shipping-methods-section">
        <div className="section-header">
          <h2>Phương thức giao hàng</h2>
          <p>Chọn phương thức giao hàng phù hợp với nhu cầu của bạn</p>
        </div>

        <div className="shipping-methods-grid">
          {shippingMethods.map(method => (
            <div key={method.id} className="shipping-method-card">
              <div className="method-icon">{method.icon}</div>
              <h3>{method.name}</h3>
              <p className="method-desc">{method.description}</p>
              <div className="method-info">
                <div className="info-item">
                  <span className="label">Thời gian:</span>
                  <span className="value">{method.time}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phí:</span>
                  <span className="value">{method.fee}</span>
                </div>
              </div>
              <ul className="method-features">
                {method.features.map((feature, idx) => (
                  <li key={idx}>
                    <CheckCircleOutlined className="feature-check" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Region Fees Section */}
      <div className="region-fees-section">
        <h2>
          <EnvironmentOutlined style={{ marginRight: "10px" }} />
          Phí vận chuyển theo khu vực
        </h2>
        <div className="region-tabs">
          {regionFees.map(region => (
            <button
              key={region.id}
              className={`region-tab ${selectedRegion === region.id ? "active" : ""}`}
              onClick={() => setSelectedRegion(region.id)}
            >
              {region.name}
            </button>
          ))}
        </div>
        {selectedRegionInfo && (
          <div className="region-details-card">
            <div className="region-info-grid">
              <div className="region-info-item">
                <span className="info-label">Phí tiêu chuẩn</span>
                <span className="info-value">{selectedRegionInfo.standardFee}</span>
              </div>
              <div className="region-info-item">
                <span className="info-label">Phí nhanh</span>
                <span className="info-value">{selectedRegionInfo.fastFee}</span>
              </div>
              <div className="region-info-item">
                <span className="info-label">Thời gian giao</span>
                <span className="info-value">{selectedRegionInfo.time}</span>
              </div>
              <div className="region-info-item highlight">
                <span className="info-label">Miễn phí từ</span>
                <span className="info-value">{selectedRegionInfo.freeThreshold}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Process */}
      <div className="tracking-process-section">
        <h2>Quy trình vận chuyển</h2>
        <div className="guide-timeline">
          {trackingSteps.map((step) => (
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

      {/* Shipping Notes */}
      <div className="shipping-notes-section">
        <h2>Lưu ý khi nhận hàng</h2>
        <div className="notes-grid">
          {shippingNotes.map((note, index) => (
            <div key={index} className="note-card">
              <div className="note-icon">{note.icon}</div>
              <h3>{note.title}</h3>
              <p>{note.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="shipping-faq-section">
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

      {/* Guarantee Section */}
      <div className="guarantee-section">
        <div className="guarantee-card">
          <h2>
            <SafetyOutlined style={{ marginRight: "10px" }} />
            Cam kết vận chuyển
          </h2>
          <div className="guarantee-grid">
            <div className="guarantee-item">
              <ClockCircleOutlined className="guarantee-icon" />
              <strong>Giao hàng đúng hẹn</strong>
              <p>Hoàn phí ship nếu giao trễ quá 2 giờ</p>
            </div>
            <div className="guarantee-item">
              <InboxOutlined className="guarantee-icon" />
              <strong>Đóng gói cẩn thận</strong>
              <p>Bảo vệ hàng hóa tối đa trong quá trình vận chuyển</p>
            </div>
            <div className="guarantee-item">
              <PhoneOutlined className="guarantee-icon" />
              <strong>Hỗ trợ 24/7</strong>
              <p>Luôn sẵn sàng hỗ trợ bạn mọi lúc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="shipping-contact-section">
        <div className="contact-card">
          <CarOutlined className="contact-icon" />
          <h2>Cần hỗ trợ về giao hàng?</h2>
          <p>
            Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
          <div className="contact-methods">
            <div className="contact-method">
              <PhoneOutlined style={{ fontSize: "24px", marginBottom: "10px" }} />
              <strong>Hotline</strong>
              <span>0966 277 109</span>
              <span className="time">(8:00 - 21:00)</span>
            </div>
            <div className="contact-method">
              <MailOutlined style={{ fontSize: "24px", marginBottom: "10px" }} />
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

export default ShippingPage;