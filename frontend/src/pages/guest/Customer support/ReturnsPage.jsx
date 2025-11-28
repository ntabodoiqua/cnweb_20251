import React, { useState } from "react";
import "../../../styles/ReturnsPage.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  SyncOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  InboxOutlined,
  FileTextOutlined,
  GiftOutlined,
  DollarOutlined,
  TruckOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const ReturnsPage = () => {
  useScrollToTop();
  const [activeTab, setActiveTab] = useState("policy");

  const returnConditions = [
    {
      icon: <InboxOutlined />,
      title: "Sản phẩm còn nguyên vẹn",
      description: "Hàng hóa chưa qua sử dụng, còn nguyên tem mác, nhãn hiệu"
    },
    {
      icon: <FileTextOutlined />,
      title: "Có hóa đơn mua hàng",
      description: "Cung cấp hóa đơn hoặc mã đơn hàng khi yêu cầu đổi trả"
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Trong thời gian quy định",
      description: "Yêu cầu đổi trả trong vòng 7-30 ngày tùy sản phẩm"
    },
    {
      icon: <GiftOutlined />,
      title: "Đầy đủ phụ kiện",
      description: "Sản phẩm kèm theo đầy đủ phụ kiện, quà tặng (nếu có)"
    }
  ];

  const returnReasons = [
    {
      reason: "Lỗi từ nhà sản xuất",
      time: "30 ngày",
      refund: "100%",
      fee: "Miễn phí"
    },
    {
      reason: "Giao sai sản phẩm",
      time: "7 ngày",
      refund: "100%",
      fee: "Miễn phí"
    },
    {
      reason: "Không đúng mô tả",
      time: "7 ngày",
      refund: "100%",
      fee: "Miễn phí"
    },
    {
      reason: "Đổi ý không muốn mua",
      time: "3 ngày",
      refund: "85-95%",
      fee: "Khách trả phí ship"
    }
  ];

  const returnSteps = [
    {
      step: 1,
      title: "Liên hệ bộ phận CSKH",
      description: "Gọi hotline hoặc chat trực tuyến để thông báo yêu cầu đổi trả"
    },
    {
      step: 2,
      title: "Cung cấp thông tin",
      description: "Cung cấp mã đơn hàng, lý do đổi trả và hình ảnh sản phẩm"
    },
    {
      step: 3,
      title: "Chờ xác nhận",
      description: "Đội ngũ CSKH sẽ xác nhận và hướng dẫn trong 2-4 giờ"
    },
    {
      step: 4,
      title: "Gửi hàng hoặc đổi mới",
      description: "Gửi hàng về hoặc nhận hàng đổi mới tại nhà"
    },
    {
      step: 5,
      title: "Hoàn tiền/Nhận hàng mới",
      description: "Nhận tiền hoàn hoặc sản phẩm mới trong 3-7 ngày"
    }
  ];

  const faqs = [
    {
      question: "Tôi có thể đổi trả sản phẩm đã mua online tại cửa hàng không?",
      answer: "Có, bạn có thể mang sản phẩm và hóa đơn đến bất kỳ cửa hàng nào của chúng tôi để đổi trả."
    },
    {
      question: "Làm thế nào để biết sản phẩm của tôi có được đổi trả không?",
      answer: "Bạn có thể kiểm tra chính sách đổi trả của từng sản phẩm trên trang chi tiết sản phẩm hoặc liên hệ CSKH."
    },
    {
      question: "Phí đổi trả được tính như thế nào?",
      answer: "Nếu lỗi từ nhà bán, chúng tôi chịu toàn bộ phí vận chuyển. Nếu do đổi ý, khách hàng chịu phí ship về."
    },
    {
      question: "Tôi có thể đổi sang sản phẩm khác không?",
      answer: "Có, bạn có thể đổi sang sản phẩm khác có giá trị tương đương hoặc thanh toán/hoàn tiền chênh lệch."
    },
    {
      question: "Bao lâu để nhận được tiền hoàn?",
      answer: "Sau khi xác nhận sản phẩm đổi trả hợp lệ, tiền sẽ được hoàn về tài khoản trong 3-7 ngày làm việc."
    }
  ];

  const nonReturnableItems = [
    "Sản phẩm vệ sinh cá nhân (mỹ phẩm, nước hoa đã mở seal)",
    "Đồ lót, quần áo bơi",
    "Sản phẩm sale off trên 50%",
    "Sản phẩm theo yêu cầu đặc biệt",
    "Thực phẩm, đồ uống"
  ];

  return (
    <div className="returns-page-container">
      {/* Hero Section */}
      <div className="returns-page-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Chính Sách Đổi Trả</h1>
          <div className="hero-subtitle">
            Cam kết đổi trả dễ dàng, minh bạch và nhanh chóng
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="returns-tabs-section">
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
            <SyncOutlined style={{ marginRight: "8px" }} />
            Quy trình
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
          {/* Conditions Section */}
          <div className="conditions-section">
            <h2>Điều kiện đổi trả</h2>
            <div className="conditions-grid">
              {returnConditions.map((condition, index) => (
                <div key={index} className="condition-card">
                  <div className="condition-icon">{condition.icon}</div>
                  <h3>{condition.title}</h3>
                  <p>{condition.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reasons Table Section */}
          <div className="reasons-section">
            <h2>Thời gian và mức hoàn tiền theo lý do</h2>
            <div className="reasons-table-wrapper">
              <div className="reasons-table">
                <div className="table-header">
                  <div>Lý do đổi trả</div>
                  <div>Thời gian</div>
                  <div>Hoàn tiền</div>
                  <div>Phí vận chuyển</div>
                </div>
                {returnReasons.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="reason-col">{item.reason}</div>
                    <div className="time-col">{item.time}</div>
                    <div className="refund-col">{item.refund}</div>
                    <div className="fee-col">{item.fee}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Non-Returnable Section */}
          <div className="non-returnable-section">
            <div className="non-returnable-card">
              <h2>
                <SafetyOutlined style={{ marginRight: "10px" }} />
                Sản phẩm không áp dụng đổi trả
              </h2>
              <ul className="non-returnable-list">
                {nonReturnableItems.map((item, index) => (
                  <li key={index}>
                    <CheckCircleOutlined className="list-icon" />
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
          <h2>Quy trình đổi trả 5 bước</h2>
          <div className="guide-timeline">
            {returnSteps.map((item) => (
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
              Liên hệ để được hỗ trợ đổi trả
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

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="returns-faq-section">
          <h2>Câu hỏi thường gặp về đổi trả</h2>
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

      {/* Guarantee Banner */}
      <div className="guarantee-section">
        <div className="guarantee-card">
          <h2>
            <SafetyOutlined style={{ marginRight: "10px" }} />
            Cam kết của chúng tôi
          </h2>
          <div className="guarantee-grid">
            <div className="guarantee-item">
              <DollarOutlined className="guarantee-icon" />
              <strong>Đổi trả miễn phí</strong>
              <p>Với lỗi từ nhà sản xuất</p>
            </div>
            <div className="guarantee-item">
              <ClockCircleOutlined className="guarantee-icon" />
              <strong>Xử lý nhanh chóng</strong>
              <p>Phản hồi trong 2-4 giờ</p>
            </div>
            <div className="guarantee-item">
              <CheckCircleOutlined className="guarantee-icon" />
              <strong>Hoàn tiền đúng hạn</strong>
              <p>Trong 3-7 ngày làm việc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="returns-contact-section">
        <div className="contact-card">
          <PhoneOutlined className="contact-icon" />
          <h2>Cần hỗ trợ về đổi trả?</h2>
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

export default ReturnsPage;