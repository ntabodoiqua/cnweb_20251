import React from "react";
import styles from "../../../styles/about-us.module.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  EyeOutlined,
  RocketOutlined,
  HeartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
// Import ảnh cho team members
import tomImg from "../../../assets/teams/tom.jpg";
import lightningImg from "../../../assets/teams/lightning.jpg";
import meatheadImg from "../../../assets/teams/meathead.jpg";
import butchImg from "../../../assets/teams/butch.jpg";
// Import logo
import logo from "../../../assets/logo.png";

const AboutUs = () => {
  // Sử dụng custom hook để cuộn lên đầu trang
  useScrollToTop();

  // Xử lý cuộn khi click vào section
  const handleSectionClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.container}>
      {/* Hero Section với Logo */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={`${styles.heroCircle} ${styles.heroCircle1}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle2}`}></div>
          <div className={`${styles.heroCircle} ${styles.heroCircle3}`}></div>
        </div>
        <div className={styles.heroContent}>
          <img src={logo} alt="HUSTBuy Logo" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>HUSTBuy</h1>
          <div className={styles.heroSubtitle}>
            Nền tảng thương mại điện tử hàng đầu
          </div>
        </div>
      </div>

      <div className={styles.header}>
        <h1>Về Chúng Tôi</h1>
        <p>
          Chào mừng bạn đến với HUSTBuy - nền tảng thương mại điện tử hàng đầu,
          nơi kết nối người mua và người bán, tạo nên những trải nghiệm mua sắm
          trực tuyến tuyệt vời với hàng triệu sản phẩm chất lượng và dịch vụ
          hoàn hảo.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.section} onClick={handleSectionClick}>
          <div className={styles.sectionIcon}>
            <EyeOutlined />
          </div>
          <h2>Tầm nhìn</h2>
          <p>
            Chúng tôi hướng tới việc trở thành nền tảng thương mại điện tử ưu
            đãi hàng đầu Việt Nam, nơi mọi người có thể tìm thấy những sản phẩm
            chất lượng với giá cả hợp lý. Chúng tôi cam kết xây dựng một hệ sinh
            thái mua sắm toàn diện, an toàn và tiện lợi cho người tiêu dùng
            Việt.
          </p>
        </div>

        <div className={styles.section} onClick={handleSectionClick}>
          <div className={styles.sectionIcon}>
            <RocketOutlined />
          </div>
          <h2>Sứ mệnh</h2>
          <p>
            Mang đến trải nghiệm mua sắm trực tuyến an toàn, tiện lợi và đáng
            tin cậy cho người dùng, đồng thời hỗ trợ các nhà bán lẻ phát triển
            mạnh mẽ trong thời đại số. Chúng tôi luôn đặt khách hàng làm trung
            tâm và không ngừng cải tiến để mang lại giá trị tốt nhất.
          </p>
        </div>

        <div className={styles.section} onClick={handleSectionClick}>
          <div className={styles.sectionIcon}>
            <HeartOutlined />
          </div>
          <h2>Giá trị cốt lõi</h2>
          <p>
            Chúng tôi đề cao tính minh bạch, chất lượng và sự hài lòng của khách
            hàng. Mọi hoạt động của chúng tôi đều hướng đến việc tạo ra giá trị
            bền vững cho cộng đồng, xây dựng niềm tin và duy trì uy tín thương
            hiệu trong lòng người tiêu dùng.
          </p>
        </div>
      </div>

      <div className={styles.teamSection}>
        <h2>
          <TeamOutlined style={{ marginRight: "12px" }} />
          Đội Ngũ Phát Triển
        </h2>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <img src={tomImg} alt="Nguyễn Thế Anh" />
            <h3>Nguyễn Thế Anh</h3>
            <p>Nhóm Trưởng</p>
          </div>
          <div className={styles.teamMember}>
            <img src={lightningImg} alt="Bùi Khắc Anh" />
            <h3>Bùi Khắc Anh</h3>
            <p>Backend Developer</p>
          </div>
          <div className={styles.teamMember}>
            <img src={meatheadImg} alt="Lê Đinh Hùng Anh" />
            <h3>Lê Đinh Hùng Anh</h3>
            <p>Frontend Developer</p>
          </div>
          <div className={styles.teamMember}>
            <img src={butchImg} alt="Hồ Lương An" />
            <h3>Hồ Lương An</h3>
            <p>Frontend Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;