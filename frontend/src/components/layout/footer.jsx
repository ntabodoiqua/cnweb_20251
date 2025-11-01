import React from "react";
import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import "./footer.css";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="custom-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Company Info */}
          <div className="footer-column">
            <div className="footer-logo">
              <img src={logo} alt="HUSTBuy Logo" className="footer-logo-img" />
              <h3 className="footer-logo-text">HUSTBuy</h3>
            </div>
            <p className="footer-description">
              Nền tảng thương mại điện tử hàng đầu, cung cấp hàng triệu sản phẩm
              chất lượng với giá tốt nhất và dịch vụ giao hàng nhanh chóng.
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/ntabodoiqua2004"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link facebook"
                aria-label="Facebook"
              >
                <FacebookOutlined />
              </a>
              <a
                href="https://x.com/RockstarGames"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link twitter"
                aria-label="Twitter"
              >
                <TwitterOutlined />
              </a>
              <a
                href="https://www.instagram.com/nta_bodoiqua/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link instagram"
                aria-label="Instagram"
              >
                <InstagramOutlined />
              </a>
              <a
                href="https://www.youtube.com/@tructiepgame-official"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link youtube"
                aria-label="Youtube"
              >
                <YoutubeOutlined />
              </a>
            </div>
          </div>

          {/* Customer Support */}
          <div className="footer-column">
            <h4 className="footer-title">Hỗ trợ khách hàng</h4>
            <ul className="footer-links">
              <li>
                <Link to="/help">Trung tâm trợ giúp</Link>
              </li>
              <li>
                <Link to="/orders">Tra cứu đơn hàng</Link>
              </li>
              <li>
                <Link to="/shipping">Chính sách giao hàng</Link>
              </li>
              <li>
                <Link to="/returns">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link to="/payment">Hướng dẫn thanh toán</Link>
              </li>
              <li>
                <Link to="/warranty">Chính sách bảo hành</Link>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div className="footer-column">
            <h4 className="footer-title">Về chúng tôi</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about">Giới thiệu HUSTBuy</Link>
              </li>
              <li>
                <Link to="/careers">Tuyển dụng</Link>
              </li>
              <li>
                <Link to="/terms">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/sellers">Bán hàng cùng chúng tôi</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h4 className="footer-title">Liên hệ</h4>
            <ul className="footer-contact">
              <li>
                <EnvironmentOutlined />
                <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </li>
              <li>
                <PhoneOutlined />
                <span> 0966 277 109 (8:00 - 21:00)</span>
              </li>
              <li>
                <MailOutlined />
                <span>anhnta2004@gmail.com</span>
              </li>
            </ul>
            <div className="footer-app-download">
              <h5>Tải ứng dụng</h5>
              <div className="footer-app-buttons">
                <a href="#" className="footer-app-btn">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play"
                  />
                </a>
                <a href="#" className="footer-app-btn">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="App Store"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="footer-features">
        <div className="footer-container">
          <div className="footer-features-grid">
            <div className="footer-feature-item">
              <ShoppingOutlined className="footer-feature-icon" />
              <div className="footer-feature-text">
                <h5>Sản phẩm chính hãng</h5>
                <p>100% hàng chính hãng chất lượng cao</p>
              </div>
            </div>
            <div className="footer-feature-item">
              <CustomerServiceOutlined className="footer-feature-icon" />
              <div className="footer-feature-text">
                <h5>Hỗ trợ 24/7</h5>
                <p>Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <div className="footer-feature-item">
              <SafetyOutlined className="footer-feature-icon" />
              <div className="footer-feature-text">
                <h5>Mua hàng an toàn</h5>
                <p>Bảo vệ người tiêu dùng</p>
              </div>
            </div>
            <div className="footer-feature-item">
              <CreditCardOutlined className="footer-feature-icon" />
              <div className="footer-feature-text">
                <h5>Thanh toán an toàn</h5>
                <p>Nhiều hình thức thanh toán với cổng ZaloPay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} HUSTBuy. All rights reserved. Designed with ❤️ by
              Group 1 CNWeb.
            </p>
            <div className="footer-payment-methods">
              <span>Phương thức thanh toán:</span>
              <div className="footer-payment-icons">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                  alt="Visa"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/vi/7/77/ZaloPay_Logo.png?20200515043603"
                  alt="ZaloPay"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fd/Napas_logo.png?20220726111242"
                  alt="Napas"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
