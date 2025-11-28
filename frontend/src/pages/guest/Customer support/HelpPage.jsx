import React, { useState } from "react";
import styles from "../../../styles/HelpPage.module.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  QuestionCircleOutlined,
  ShoppingOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  CreditCardOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const HelpPage = () => {
  useScrollToTop();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSectionClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const faqCategories = [
    {
      icon: <ShoppingOutlined />,
      title: "Đặt hàng",
      questions: [
        {
          q: "Làm thế nào để đặt hàng trên HUSTBuy?",
          a: "Chọn sản phẩm → Thêm vào giỏ hàng → Tiến hành thanh toán → Nhập thông tin giao hàng → Xác nhận đơn hàng.",
        },
        {
          q: "Tôi có thể hủy đơn hàng không?",
          a: "Bạn có thể hủy đơn hàng trước khi người bán xác nhận. Sau khi đã xác nhận, vui lòng liên hệ bộ phận chăm sóc khách hàng.",
        },
      ],
    },
    {
      icon: <CreditCardOutlined />,
      title: "Thanh toán",
      questions: [
        {
          q: "HUSTBuy hỗ trợ những phương thức thanh toán nào?",
          a: "Chúng tôi hỗ trợ thanh toán qua ZaloPay, thẻ ATM nội địa, thẻ Visa/MasterCard và thanh toán khi nhận hàng (COD).",
        },
        {
          q: "Thanh toán có an toàn không?",
          a: "Tất cả giao dịch được mã hóa SSL 256-bit và tuân thủ chuẩn bảo mật PCI DSS. Thông tin thanh toán của bạn được bảo vệ tuyệt đối.",
        },
      ],
    },
    {
      icon: <SyncOutlined />,
      title: "Giao hàng & Trả hàng",
      questions: [
        {
          q: "Thời gian giao hàng là bao lâu?",
          a: "Thời gian giao hàng dao động từ 2-5 ngày làm việc tùy theo khu vực. Nội thành Hà Nội và TP.HCM thường nhận hàng trong 1-2 ngày.",
        },
        {
          q: "Chính sách đổi trả như thế nào?",
          a: "Bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm lỗi hoặc không đúng mô tả. Sản phẩm phải còn nguyên tem, chưa qua sử dụng.",
        },
      ],
    },
    {
      icon: <SafetyOutlined />,
      title: "Bảo mật & An toàn",
      questions: [
        {
          q: "Thông tin cá nhân của tôi có được bảo mật không?",
          a: "Chúng tôi tuân thủ nghiêm ngặt chính sách bảo mật thông tin khách hàng. Thông tin của bạn chỉ được sử dụng cho mục đích xử lý đơn hàng.",
        },
        {
          q: "Làm sao để nhận biết sản phẩm chính hãng?",
          a: "Tất cả sản phẩm trên HUSTBuy đều có tem chống hàng giả và được xác thực bởi đội ngũ kiểm định chất lượng của chúng tôi.",
        },
      ],
    },
  ];

  return (
    <div className={styles.helpPageContainer}>
      {/* Hero Section */}
      <div className={styles.helpPageHero}>
        <div className={styles.heroBackground}>
          <div className={`${styles.heroCircle} ${styles.heroCircle1}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle2}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle3}`}></div>
        </div>
        <div className={styles.heroContent}>
          <img src={logo} alt="HUSTBuy Logo" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>Trung Tâm Trợ Giúp</h1>
          <div className={styles.heroSubtitle}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className={styles.helpSearchSection}>
        <div className={styles.searchContainer}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi thường gặp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.helpPageHeader}>
        <h1>Câu Hỏi Thường Gặp</h1>
        <p>
          Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến về dịch vụ của
          chúng tôi. Nếu bạn cần thêm hỗ trợ, đừng ngần ngại liên hệ với đội ngũ
          chăm sóc khách hàng của chúng tôi.
        </p>
      </div>

      <div className={styles.helpPageContent}>
        {faqCategories.map((category, index) => (
          <div key={index} className={styles.helpCategorySection}>
            <div className={styles.categoryHeader} onClick={handleSectionClick}>
              <div className={styles.sectionIcon}>{category.icon}</div>
              <h2>{category.title}</h2>
            </div>
            <div className={styles.faqList}>
              {category.questions.map((faq, faqIndex) => (
                <div key={faqIndex} className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>
                    <QuestionCircleOutlined style={{ marginRight: "8px" }} />
                    {faq.q}
                  </h3>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className={styles.helpContactSection}>
        <div className={styles.contactCard}>
          <CustomerServiceOutlined className={styles.contactIcon} />
          <h2>Vẫn cần hỗ trợ?</h2>
          <p>
            Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <strong>Hotline:</strong> 0966 277 109 (8:00 - 21:00)
            </div>
            <div className={styles.contactMethod}>
              <strong>Email:</strong> anhnta2004@gmail.com
            </div>
            <div className={styles.contactMethod}>
              <strong>Live Chat:</strong> Có mặt 24/7 trên website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
