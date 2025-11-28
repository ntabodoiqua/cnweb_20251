import React, { useState } from "react";
import "../../../styles/WarrantyPage.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  ToolOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  MobileOutlined,
  LaptopOutlined,
  HomeOutlined,
  SkinOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const WarrantyPage = () => {
  useScrollToTop();
  const [selectedProduct, setSelectedProduct] = useState("electronics");
  const [activeTab, setActiveTab] = useState("policy");

  const warrantyPeriods = [
    {
      id: "electronics",
      name: "Điện tử, điện máy",
      icon: <MobileOutlined />,
      period: "12-24 tháng",
      description: "Bảo hành chính hãng từ nhà sản xuất",
      coverage: ["Lỗi kỹ thuật", "Hư hỏng linh kiện", "Lỗi phần mềm"]
    },
    {
      id: "fashion",
      name: "Thời trang",
      icon: <SkinOutlined />,
      period: "30 ngày",
      description: "Đổi size, màu sắc trong 30 ngày",
      coverage: ["Lỗi may", "Phai màu", "Đổi size"]
    },
    {
      id: "furniture",
      name: "Nội thất, gia dụng",
      icon: <HomeOutlined />,
      period: "6-12 tháng",
      description: "Bảo hành vật liệu và lắp đặt",
      coverage: ["Lỗi nguyên liệu", "Vấn đề kết cấu", "Hỗ trợ lắp đặt"]
    },
    {
      id: "cosmetics",
      name: "Mỹ phẩm, làm đẹp",
      icon: <SkinOutlined />,
      period: "7 ngày",
      description: "Đổi trả nếu dị ứng hoặc không phù hợp",
      coverage: ["Dị ứng da", "Không đúng mô tả", "Hết hạn"]
    }
  ];

  const warrantySteps = [
    {
      step: 1,
      title: "Liên hệ bảo hành",
      description: "Gọi hotline hoặc mang sản phẩm đến trung tâm bảo hành"
    },
    {
      step: 2,
      title: "Kiểm tra điều kiện",
      description: "Nhân viên kiểm tra sản phẩm và phiếu bảo hành"
    },
    {
      step: 3,
      title: "Tiếp nhận sửa chữa",
      description: "Sản phẩm được tiếp nhận và báo thời gian sửa"
    },
    {
      step: 4,
      title: "Sửa chữa/Đổi mới",
      description: "Sửa chữa hoặc đổi mới sản phẩm nếu không sửa được"
    },
    {
      step: 5,
      title: "Trả hàng",
      description: "Nhận lại sản phẩm đã được bảo hành"
    }
  ];

  const warrantyConditions = [
    {
      icon: <ClockCircleOutlined />,
      title: "Trong thời hạn bảo hành",
      description: "Sản phẩm còn trong thời gian bảo hành ghi trên phiếu"
    },
    {
      icon: <FileTextOutlined />,
      title: "Có phiếu bảo hành",
      description: "Xuất trình phiếu bảo hành hoặc hóa đơn mua hàng"
    },
    {
      icon: <SafetyOutlined />,
      title: "Tem bảo hành nguyên vẹn",
      description: "Tem bảo hành chưa bị rách, tẩy xóa hoặc thay đổi"
    },
    {
      icon: <ToolOutlined />,
      title: "Lỗi từ nhà sản xuất",
      description: "Sản phẩm bị lỗi do quá trình sản xuất, không do người dùng"
    }
  ];

  const notCovered = [
    "Sản phẩm bị rơi, va đập, ngấm nước do người dùng",
    "Tự ý tháo, sửa chữa hoặc thay đổi cấu trúc sản phẩm",
    "Sử dụng sai cách, không đúng hướng dẫn",
    "Thiên tai, hỏa hoạn, sự cố điện áp",
    "Hết thời hạn bảo hành hoặc không có phiếu bảo hành"
  ];

  const warrantyLocations = [
    {
      city: "Hà Nội",
      address: "123 Trần Duy Hưng, Cầu Giấy",
      phone: "024.1234.5678",
      hours: "8:00 - 18:00 (T2-T7)"
    },
    {
      city: "TP. Hồ Chí Minh",
      address: "456 Nguyễn Văn Linh, Quận 7",
      phone: "028.1234.5678",
      hours: "8:00 - 18:00 (T2-T7)"
    },
    {
      city: "Đà Nẵng",
      address: "789 Lê Duẩn, Hải Châu",
      phone: "0236.123.456",
      hours: "8:00 - 17:00 (T2-T6)"
    }
  ];

  const faqs = [
    {
      question: "Bảo hành có mất phí không?",
      answer: "Bảo hành hoàn toàn miễn phí nếu sản phẩm còn trong thời hạn và đáp ứng điều kiện bảo hành."
    },
    {
      question: "Mất phiếu bảo hành thì có được bảo hành không?",
      answer: "Có thể bảo hành nếu có hóa đơn mua hàng hoặc kiểm tra serial number của sản phẩm."
    },
    {
      question: "Thời gian bảo hành mất bao lâu?",
      answer: "Thông thường từ 3-7 ngày làm việc. Trường hợp phức tạp có thể lên đến 15 ngày."
    },
    {
      question: "Có được đổi sản phẩm mới không?",
      answer: "Nếu sản phẩm lỗi 3 lần trong thời gian bảo hành hoặc không sửa được, sẽ được đổi sản phẩm mới."
    },
    {
      question: "Bảo hành có được gia hạn không?",
      answer: "Một số sản phẩm có gói bảo hành mở rộng có phí. Liên hệ để biết thêm chi tiết."
    }
  ];

  const selectedProductInfo = warrantyPeriods.find(p => p.id === selectedProduct);

  return (
    <div className="warranty-page-container">
      {/* Hero Section */}
      <div className="warranty-page-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Chính Sách Bảo Hành</h1>
          <div className="hero-subtitle">
            Bảo hành chính hãng, uy tín và nhanh chóng
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="warranty-tabs-section">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "policy" ? "active" : ""}`}
            onClick={() => setActiveTab("policy")}
          >
            <FileTextOutlined style={{ marginRight: "8px" }} />
            Chính sách
          </button>
          <button
            className={`tab-btn ${activeTab === "process" ? "active" : ""}`}
            onClick={() => setActiveTab("process")}
          >
            <ToolOutlined style={{ marginRight: "8px" }} />
            Quy trình
          </button>
          <button
            className={`tab-btn ${activeTab === "locations" ? "active" : ""}`}
            onClick={() => setActiveTab("locations")}
          >
            <EnvironmentOutlined style={{ marginRight: "8px" }} />
            Trung tâm
          </button>
          <button
            className={`tab-btn ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            <QuestionCircleOutlined style={{ marginRight: "8px" }} />
            Câu hỏi
          </button>
        </div>
      </div>

      {/* Policy Tab */}
      {activeTab === "policy" && (
        <>
          {/* Warranty Types Section */}
          <div className="warranty-types-section">
            <h2>Thời gian bảo hành theo loại sản phẩm</h2>
            <div className="product-types-grid">
              {warrantyPeriods.map(product => (
                <div
                  key={product.id}
                  className={`product-type-card ${selectedProduct === product.id ? "active" : ""}`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <div className="product-icon">{product.icon}</div>
                  <h3>{product.name}</h3>
                  <div className="warranty-period">{product.period}</div>
                  <p>{product.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage Section */}
          {selectedProductInfo && (
            <div className="coverage-section">
              <h2>
                <CheckCircleOutlined style={{ marginRight: "10px" }} />
                Phạm vi bảo hành - {selectedProductInfo.name}
              </h2>
              <div className="coverage-list">
                {selectedProductInfo.coverage.map((item, index) => (
                  <div key={index} className="coverage-item">
                    <CheckCircleOutlined className="check-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty Conditions */}
          <div className="warranty-conditions-section">
            <h2>Điều kiện bảo hành</h2>
            <div className="conditions-grid">
              {warrantyConditions.map((condition, index) => (
                <div key={index} className="condition-card">
                  <div className="condition-icon">{condition.icon}</div>
                  <h3>{condition.title}</h3>
                  <p>{condition.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Not Covered Section */}
          <div className="not-covered-section">
            <div className="not-covered-card">
              <h2>
                <WarningOutlined style={{ marginRight: "10px" }} />
                Trường hợp không được bảo hành
              </h2>
              <ul className="not-covered-list">
                {notCovered.map((item, index) => (
                  <li key={index}>
                    <WarningOutlined className="warning-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Process Tab */}
      {activeTab === "process" && (
        <div className="process-section">
          <h2>Quy trình bảo hành 5 bước</h2>
          <div className="guide-timeline">
            {warrantySteps.map((item) => (
              <div key={item.step} className="guide-step">
                <div className="step-marker">{item.step}</div>
                <div className="step-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Info Box */}
          <div className="contact-info-box">
            <h3>
              <PhoneOutlined style={{ marginRight: "10px" }} />
              Liên hệ để được hỗ trợ bảo hành
            </h3>
            <div className="contact-info-grid">
              <div className="contact-info-item">
                <PhoneOutlined className="contact-info-icon" />
                <strong>Hotline</strong>
                <a href="tel:0966277109">0966 277 109</a>
              </div>
              <div className="contact-info-item">
                <MailOutlined className="contact-info-icon" />
                <strong>Email</strong>
                <a href="mailto:anhnta2004@gmail.com">anhnta2004@gmail.com</a>
              </div>
              <div className="contact-info-item">
                <ClockCircleOutlined className="contact-info-icon" />
                <strong>Giờ làm việc</strong>
                <span>8:00 - 21:00 hàng ngày</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <div className="warranty-locations-section">
          <h2>
            <EnvironmentOutlined style={{ marginRight: "10px" }} />
            Trung tâm bảo hành
          </h2>
          <div className="locations-grid">
            {warrantyLocations.map((location, index) => (
              <div key={index} className="location-card">
                <div className="location-icon">
                  <EnvironmentOutlined />
                </div>
                <h3>{location.city}</h3>
                <div className="location-info">
                  <p><strong>Địa chỉ:</strong> {location.address}</p>
                  <p><strong>Điện thoại:</strong> <a href={`tel:${location.phone.replace(/\./g, '')}`}>{location.phone}</a></p>
                  <p><strong>Giờ làm việc:</strong> {location.hours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="warranty-faq-section">
          <h2>Câu hỏi thường gặp về bảo hành</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details key={index} className="faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Guarantee Section */}
      <div className="guarantee-section">
        <div className="guarantee-card">
          <h2>
            <SafetyOutlined style={{ marginRight: "10px" }} />
            Cam kết bảo hành
          </h2>
          <div className="guarantee-grid">
            <div className="guarantee-item">
              <ToolOutlined className="guarantee-icon" />
              <strong>Bảo hành miễn phí</strong>
              <p>Với lỗi từ nhà sản xuất</p>
            </div>
            <div className="guarantee-item">
              <ClockCircleOutlined className="guarantee-icon" />
              <strong>Xử lý nhanh chóng</strong>
              <p>Từ 3-7 ngày làm việc</p>
            </div>
            <div className="guarantee-item">
              <CheckCircleOutlined className="guarantee-icon" />
              <strong>Đổi mới nếu không sửa được</strong>
              <p>Cam kết đổi sản phẩm mới tương đương</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="warranty-contact-section">
        <div className="contact-card">
          <ToolOutlined className="contact-icon" />
          <h2>Cần hỗ trợ bảo hành?</h2>
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

export default WarrantyPage;