import { useState } from "react";
import {
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  BankOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const ProfileSellerInfo = ({ sellerData }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    businessName: "",
    businessAddress: "",
    taxCode: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // TODO: Call API to register as seller
    console.log("Registering seller with data:", formData);
    // Show success notification
  };

  const handleCancel = () => {
    setIsRegistering(false);
    setFormData({
      shopName: "",
      businessName: "",
      businessAddress: "",
      taxCode: "",
      description: "",
      contactPhone: "",
      contactEmail: "",
      bankName: "",
      bankAccount: "",
      bankAccountName: "",
    });
  };

  // If user has seller profile
  if (sellerData) {
    return (
      <div className="profile-general-info">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {sellerData.shopLogo ? (
              <img
                src={sellerData.shopLogo}
                alt="Shop Logo"
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <ShopOutlined style={{ fontSize: "48px" }} />
              </div>
            )}
          </div>

          <div className="profile-avatar-info">
            <h2 className="profile-username">{sellerData.shopName}</h2>
            <div className="profile-role-badge">
              <CheckCircleOutlined />
              Người bán đã xác thực
            </div>

            <div className="profile-meta-info">
              <div className="profile-meta-item">
                <MailOutlined />
                <span>{sellerData.contactEmail}</span>
              </div>
              <div className="profile-meta-item">
                <PhoneOutlined />
                <span>{sellerData.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Stats */}
        <div className="profile-stats-grid" style={{ marginTop: "24px" }}>
          <div className="profile-stat-card">
            <div className="profile-stat-header">
              <span className="profile-stat-title">Sản phẩm</span>
              <div className="profile-stat-icon">
                <ShopOutlined />
              </div>
            </div>
            <p className="profile-stat-value">{sellerData.totalProducts}</p>
            <p className="profile-stat-label">sản phẩm đang bán</p>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-header">
              <span className="profile-stat-title">Đơn hàng</span>
              <div className="profile-stat-icon">
                <ShopOutlined />
              </div>
            </div>
            <p className="profile-stat-value">{sellerData.totalOrders}</p>
            <p className="profile-stat-label">đơn hàng</p>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-header">
              <span className="profile-stat-title">Đánh giá</span>
              <div className="profile-stat-icon">
                <CheckCircleOutlined />
              </div>
            </div>
            <p className="profile-stat-value">{sellerData.rating}</p>
            <p className="profile-stat-label">⭐ trung bình</p>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-header">
              <span className="profile-stat-title">Doanh thu</span>
              <div className="profile-stat-icon">
                <BankOutlined />
              </div>
            </div>
            <p className="profile-stat-value">
              {(sellerData.totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="profile-stat-label">VNĐ</p>
          </div>
        </div>

        {/* Business Info */}
        <div className="profile-info-form" style={{ marginTop: "32px" }}>
          <h3
            style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 600 }}
          >
            Thông tin doanh nghiệp
          </h3>

          <div className="profile-form-row">
            <div className="profile-form-group">
              <label className="profile-form-label">
                <IdcardOutlined />
                Tên doanh nghiệp
              </label>
              <input
                type="text"
                value={sellerData.businessName}
                disabled
                className="profile-form-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                <FileTextOutlined />
                Mã số thuế
              </label>
              <input
                type="text"
                value={sellerData.taxCode}
                disabled
                className="profile-form-input"
              />
            </div>
          </div>

          <div className="profile-form-group full-width">
            <label className="profile-form-label">
              <EnvironmentOutlined />
              Địa chỉ kinh doanh
            </label>
            <input
              type="text"
              value={sellerData.businessAddress}
              disabled
              className="profile-form-input"
            />
          </div>

          <div className="profile-form-group full-width">
            <label className="profile-form-label">
              <FileTextOutlined />
              Mô tả cửa hàng
            </label>
            <textarea
              value={sellerData.description}
              disabled
              className="profile-form-textarea"
            />
          </div>
        </div>
      </div>
    );
  }

  // If user hasn't registered as seller yet
  if (!isRegistering) {
    return (
      <div className="profile-empty-state">
        <ShopOutlined />
        <h3>Hồ sơ người bán</h3>
        <p>
          Bạn chưa đăng ký làm người bán. Đăng ký ngay để bắt đầu bán hàng trên
          nền tảng.
        </p>
        <button
          className="profile-btn profile-btn-primary"
          style={{ marginTop: "20px" }}
          onClick={() => setIsRegistering(true)}
        >
          Đăng ký làm người bán
        </button>
      </div>
    );
  }

  // Registration form
  return (
    <div className="profile-general-info">
      <h3 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: 700 }}>
        Đăng ký làm người bán
      </h3>

      <div className="profile-info-form">
        <h4 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: 600 }}>
          Thông tin cửa hàng
        </h4>

        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <ShopOutlined />
              Tên cửa hàng <span className="required">*</span>
            </label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="Nhập tên cửa hàng"
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              <PhoneOutlined />
              Số điện thoại liên hệ <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="0123456789"
            />
          </div>
        </div>

        <div className="profile-form-group full-width">
          <label className="profile-form-label">
            <MailOutlined />
            Email liên hệ <span className="required">*</span>
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            className="profile-form-input"
            placeholder="shop@example.com"
          />
        </div>

        <div className="profile-form-group full-width">
          <label className="profile-form-label">
            <FileTextOutlined />
            Mô tả cửa hàng
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="profile-form-textarea"
            placeholder="Giới thiệu về cửa hàng của bạn..."
          />
        </div>

        <h4
          style={{
            marginTop: "32px",
            marginBottom: "16px",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Thông tin doanh nghiệp
        </h4>

        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <IdcardOutlined />
              Tên doanh nghiệp <span className="required">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="Công ty TNHH..."
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              <FileTextOutlined />
              Mã số thuế <span className="required">*</span>
            </label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="0123456789"
            />
          </div>
        </div>

        <div className="profile-form-group full-width">
          <label className="profile-form-label">
            <EnvironmentOutlined />
            Địa chỉ kinh doanh <span className="required">*</span>
          </label>
          <input
            type="text"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleInputChange}
            className="profile-form-input"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          />
        </div>

        <h4
          style={{
            marginTop: "32px",
            marginBottom: "16px",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Thông tin thanh toán
        </h4>

        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <BankOutlined />
              Ngân hàng <span className="required">*</span>
            </label>
            <select
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className="profile-form-select"
            >
              <option value="">Chọn ngân hàng</option>
              <option value="Vietcombank">Vietcombank</option>
              <option value="VietinBank">VietinBank</option>
              <option value="BIDV">BIDV</option>
              <option value="Agribank">Agribank</option>
              <option value="Techcombank">Techcombank</option>
              <option value="MBBank">MBBank</option>
              <option value="ACB">ACB</option>
              <option value="VPBank">VPBank</option>
            </select>
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              <BankOutlined />
              Số tài khoản <span className="required">*</span>
            </label>
            <input
              type="text"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="123456789012"
            />
          </div>
        </div>

        <div className="profile-form-group full-width">
          <label className="profile-form-label">
            <UserOutlined />
            Tên chủ tài khoản <span className="required">*</span>
          </label>
          <input
            type="text"
            name="bankAccountName"
            value={formData.bankAccountName}
            onChange={handleInputChange}
            className="profile-form-input"
            placeholder="NGUYEN VAN A"
          />
        </div>

        <div className="profile-form-actions">
          <button
            className="profile-btn profile-btn-secondary"
            onClick={handleCancel}
          >
            <CloseOutlined />
            Hủy
          </button>
          <button
            className="profile-btn profile-btn-primary"
            onClick={handleSubmit}
          >
            <SaveOutlined />
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

ProfileSellerInfo.propTypes = {
  sellerData: PropTypes.shape({
    shopName: PropTypes.string,
    shopLogo: PropTypes.string,
    businessName: PropTypes.string,
    businessAddress: PropTypes.string,
    taxCode: PropTypes.string,
    description: PropTypes.string,
    contactPhone: PropTypes.string,
    contactEmail: PropTypes.string,
    totalProducts: PropTypes.number,
    totalOrders: PropTypes.number,
    rating: PropTypes.number,
    totalRevenue: PropTypes.number,
  }),
};

export default ProfileSellerInfo;
