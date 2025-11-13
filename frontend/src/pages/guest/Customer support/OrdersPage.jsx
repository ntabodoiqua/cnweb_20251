import React, { useState } from "react";
import "../../../styles/OrdersPage.css";
import useScrollToTop from "../../../hooks/useScrollToTop";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  InboxOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";

const OrdersPage = () => {
  useScrollToTop();
  const [orderCode, setOrderCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!orderCode.trim()) {
      newErrors.orderCode = "Vui lòng nhập mã đơn hàng";
    }
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock data
      setOrderData({
        orderCode: orderCode,
        status: "shipping",
        createdDate: "15/11/2025",
        estimatedDelivery: "18/11/2025",
        totalAmount: "1.250.000đ",
        customerName: "Nguyễn Văn A",
        phone: phoneNumber,
        address: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
        products: [
          { name: "Laptop Dell XPS 13", quantity: 1, price: "1.200.000đ" },
          { name: "Chuột không dây Logitech", quantity: 1, price: "50.000đ" }
        ],
        timeline: [
          { status: "Đơn hàng đã được tạo", date: "15/11/2025 10:30", completed: true },
          { status: "Đã xác nhận đơn hàng", date: "15/11/2025 11:00", completed: true },
          { status: "Đang chuẩn bị hàng", date: "15/11/2025 14:00", completed: true },
          { status: "Đang giao hàng", date: "16/11/2025 08:00", completed: true },
          { status: "Giao hàng thành công", date: "Dự kiến 18/11/2025", completed: false }
        ]
      });
      setIsSearching(false);
    }, 1500);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "#ff9800", icon: <ClockCircleOutlined />, text: "Chờ xác nhận" },
      confirmed: { color: "#2196f3", icon: <CheckCircleOutlined />, text: "Đã xác nhận" },
      shipping: { color: "#00bcd4", icon: <TruckOutlined />, text: "Đang giao hàng" },
      delivered: { color: "#4caf50", icon: <InboxOutlined />, text: "Đã giao hàng" },
      cancelled: { color: "#f44336", icon: <CloseCircleOutlined />, text: "Đã hủy" }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = orderData ? getStatusConfig(orderData.status) : null;

  return (
    <div className="orders-page-container">
      {/* Hero Section */}
      <div className="orders-page-hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="HUSTBuy Logo" className="hero-logo" />
          <h1 className="hero-title">Tra Cứu Đơn Hàng</h1>
          <div className="hero-subtitle">
            Theo dõi đơn hàng của bạn một cách nhanh chóng và dễ dàng
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="orders-search-section">
        <div className="search-card">
          <div className="search-header">
            <SearchOutlined className="search-header-icon" />
            <h2>Nhập thông tin đơn hàng</h2>
          </div>
          
          <form onSubmit={handleSearch} className="order-search-form">
            <div className="form-group">
              <label htmlFor="orderCode">Mã đơn hàng *</label>
              <input
                type="text"
                id="orderCode"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Ví dụ: DH123456"
                className={errors.orderCode ? "error" : ""}
              />
              {errors.orderCode && (
                <span className="error-message">{errors.orderCode}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Số điện thoại *</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại đặt hàng"
                className={errors.phoneNumber ? "error" : ""}
              />
              {errors.phoneNumber && (
                <span className="error-message">{errors.phoneNumber}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="search-btn"
              disabled={isSearching}
            >
              {isSearching ? "Đang tìm kiếm..." : "Tra cứu đơn hàng"}
            </button>
          </form>

          <div className="help-info">
            <h3>Cần trợ giúp?</h3>
            <p>
              Bạn có thể tìm thấy mã đơn hàng trong email xác nhận hoặc tin nhắn SMS
            </p>
            <p>
              Liên hệ: <strong>0966 277 109</strong> để được hỗ trợ
            </p>
          </div>
        </div>
      </div>

      {/* Order Result */}
      {orderData && (
        <div className="orders-result-section">
          <div className="order-result-card">
            {/* Order Header */}
            <div className="order-header">
              <div 
                className="order-status-badge" 
                style={{ background: statusConfig.color }}
              >
                {statusConfig.icon}
                <span>{statusConfig.text}</span>
              </div>
              <div className="order-basic-info">
                <h2>Đơn hàng #{orderData.orderCode}</h2>
                <p>Ngày đặt: {orderData.createdDate}</p>
                <p>Dự kiến giao: {orderData.estimatedDelivery}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="order-timeline-section">
              <h3>
                <TruckOutlined style={{ marginRight: "10px" }} />
                Trạng thái đơn hàng
              </h3>
              <div className="timeline">
                {orderData.timeline.map((item, index) => (
                  <div 
                    key={index} 
                    className={`timeline-item ${item.completed ? "completed" : ""}`}
                  >
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>{item.status}</h4>
                      <p>{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="order-details-section">
              <div className="detail-section">
                <h3>
                  <ShoppingCartOutlined style={{ marginRight: "10px" }} />
                  Sản phẩm
                </h3>
                <div className="products-list">
                  {orderData.products.map((product, index) => (
                    <div key={index} className="product-item">
                      <span className="product-name">{product.name}</span>
                      <span className="product-quantity">x{product.quantity}</span>
                      <span className="product-price">{product.price}</span>
                    </div>
                  ))}
                  <div className="order-total">
                    <strong>Tổng cộng:</strong>
                    <strong style={{ color: "#ee4d2d" }}>
                      {orderData.totalAmount}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>
                  <InboxOutlined style={{ marginRight: "10px" }} />
                  Thông tin giao hàng
                </h3>
                <div className="info-box">
                  <p><strong>Người nhận:</strong> {orderData.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {orderData.phone}</p>
                  <p><strong>Địa chỉ:</strong> {orderData.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="orders-contact-section">
        <div className="contact-card">
          <PhoneOutlined className="contact-icon" />
          <h2>Cần hỗ trợ thêm?</h2>
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

export default OrdersPage;