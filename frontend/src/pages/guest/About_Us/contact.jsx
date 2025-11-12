import React, { useState } from "react";
import "../../../styles/contact.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, notification, Select } from "antd";
import logo from "../../../assets/logo.png";

const { Option } = Select;

const Contact = () => {
  useScrollToTop();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const contactInfo = [
    {
      icon: <EnvironmentOutlined />,
      title: "Địa chỉ",
      content: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      color: "#ee4d2d",
    },
    {
      icon: <PhoneOutlined />,
      title: "Điện thoại",
      content: "0966 277 109",
      subContent: "Hỗ trợ 24/7",
      color: "#52c41a",
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      content: "anhnta2004@gmail.com",
      subContent: "Phản hồi trong 24h",
      color: "#1890ff",
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Giờ làm việc",
      content: "Thứ 2 - Thứ 7: 8:00 - 21:00",
      subContent: "Chủ nhật: 9:00 - 18:00",
      color: "#722ed1",
    },
  ];

  const faqCategories = [
    {
      icon: <QuestionCircleOutlined />,
      title: "Câu hỏi thường gặp",
      description: "Tìm câu trả lời nhanh chóng",
      link: "/help",
    },
    {
      icon: <CustomerServiceOutlined />,
      title: "Hỗ trợ trực tuyến",
      description: "Chat trực tiếp với nhân viên",
      link: "#",
    },
  ];

  const socialLinks = [
    {
      icon: <FacebookOutlined />,
      name: "Facebook",
      url: "https://www.facebook.com/ntabodoiqua2004",
      color: "#1877f2",
    },
    {
      icon: <TwitterOutlined />,
      name: "Twitter",
      url: "https://x.com/RockstarGames",
      color: "#1da1f2",
    },
    {
      icon: <InstagramOutlined />,
      name: "Instagram",
      url: "https://www.instagram.com/nta_bodoiqua/",
      color: "#e4405f",
    },
    {
      icon: <YoutubeOutlined />,
      name: "Youtube",
      url: "https://www.youtube.com/@tructiepgame-official",
      color: "#ff0000",
    },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // TODO: Implement API call to send contact message
      console.log("Contact form:", values);

      notification.success({
        message: "Gửi thành công!",
        description:
          "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h.",
        placement: "topRight",
        duration: 5,
      });

      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Gửi thất bại",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Liên Hệ Với Chúng Tôi</h1>
          <div className="hero-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className="info-icon" style={{ color: info.color }}>
                {info.icon}
              </div>
              <h3>{info.title}</h3>
              <p className="info-content">{info.content}</p>
              {info.subContent && (
                <p className="info-subcontent">{info.subContent}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="contact-main">
        {/* Contact Form */}
        <div className="contact-form-section">
          <h2 className="section-title">Gửi Tin Nhắn</h2>
          <p className="section-description">
            Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất có thể
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="contact-form"
          >
            <div className="form-row">
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
                className="form-item-half"
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
                className="form-item-half"
              >
                <Input size="large" placeholder="Nhập email" />
              </Form.Item>
            </div>

            <div className="form-row">
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
                className="form-item-half"
              >
                <Input size="large" placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                label="Chủ đề"
                name="subject"
                rules={[{ required: true, message: "Vui lòng chọn chủ đề!" }]}
                className="form-item-half"
              >
                <Select size="large" placeholder="Chọn chủ đề">
                  <Option value="general">Câu hỏi chung</Option>
                  <Option value="order">Vấn đề đơn hàng</Option>
                  <Option value="product">Thông tin sản phẩm</Option>
                  <Option value="payment">Thanh toán</Option>
                  <Option value="shipping">Vận chuyển</Option>
                  <Option value="return">Đổi trả hàng</Option>
                  <Option value="complaint">Khiếu nại</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label="Nội dung"
              name="message"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung!" },
                {
                  min: 10,
                  message: "Nội dung phải có ít nhất 10 ký tự!",
                },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Nhập nội dung tin nhắn của bạn..."
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
                icon={<SendOutlined />}
              >
                Gửi tin nhắn
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Sidebar */}
        <div className="contact-sidebar">
          {/* FAQ Categories */}
          <div className="sidebar-section">
            <h3>Cần trợ giúp nhanh?</h3>
            <div className="faq-categories">
              {faqCategories.map((category, index) => (
                <a
                  key={index}
                  href={category.link}
                  className="faq-category-card"
                >
                  <div className="faq-icon">{category.icon}</div>
                  <div className="faq-content">
                    <h4>{category.title}</h4>
                    <p>{category.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="sidebar-section">
            <h3>Theo dõi chúng tôi</h3>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ backgroundColor: social.color }}
                >
                  {social.icon}
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div className="sidebar-section business-hours">
            <h3>Giờ làm việc</h3>
            <div className="hours-list">
              <div className="hours-item">
                <span className="day">Thứ 2 - Thứ 6</span>
                <span className="time">8:00 - 21:00</span>
              </div>
              <div className="hours-item">
                <span className="day">Thứ 7</span>
                <span className="time">8:00 - 21:00</span>
              </div>
              <div className="hours-item">
                <span className="day">Chủ nhật</span>
                <span className="time">9:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <h2 className="section-title">Vị Trí Của Chúng Tôi</h2>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.4849932765906!2d105.8412459!3d21.0047875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac5%3A0xbd3e934ce076123a!2zxJDhuqFpIGjhu41jIELDoWNoIGtob2EgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: "16px" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="HUSTBuy Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
