import { SettingOutlined, SaveOutlined, ShopOutlined } from "@ant-design/icons";
import { useState } from "react";

/**
 * SellerSettingsPage - Trang cài đặt cửa hàng
 */
const SellerSettingsPage = () => {
  const [formData, setFormData] = useState({
    shopName: "Tech Store HUST",
    shopDescription: "Chuyên cung cấp các sản phẩm công nghệ chính hãng",
    email: "techstore@hustbuy.com",
    phone: "0901234567",
    address: "123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    bankName: "Vietcombank",
    bankAccount: "1234567890",
    bankAccountName: "NGUYEN VAN A",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="seller-settings">
      <form onSubmit={handleSubmit} className="settings-form">
        {/* Shop Information Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <ShopOutlined />
            Thông tin cửa hàng
          </h2>
          <div className="settings-section-content">
            <div className="form-group">
              <label htmlFor="shopName" className="form-label">
                Tên cửa hàng <span className="required">*</span>
              </label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shopDescription" className="form-label">
                Mô tả cửa hàng
              </label>
              <textarea
                id="shopDescription"
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Địa chỉ cửa hàng <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">
            <SettingOutlined />
            Thông tin thanh toán
          </h2>
          <div className="settings-section-content">
            <div className="form-group">
              <label htmlFor="bankName" className="form-label">
                Ngân hàng <span className="required">*</span>
              </label>
              <select
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Chọn ngân hàng</option>
                <option value="Vietcombank">Vietcombank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="VietinBank">VietinBank</option>
                <option value="BIDV">BIDV</option>
                <option value="MB Bank">MB Bank</option>
                <option value="ACB">ACB</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bankAccount" className="form-label">
                  Số tài khoản <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bankAccountName" className="form-label">
                  Tên chủ tài khoản <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="bankAccountName"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="seller-btn seller-btn-primary">
            <SaveOutlined />
            Lưu thay đổi
          </button>
          <button type="button" className="seller-btn seller-btn-secondary">
            Hủy bỏ
          </button>
        </div>
      </form>

      <style jsx>{`
        .seller-settings {
          animation: fadeIn 0.5s ease-out;
        }

        .settings-form {
          max-width: 900px;
        }

        .settings-section {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .settings-section:hover {
          border-color: #ee4d2d;
          box-shadow: 0 4px 12px rgba(238, 77, 45, 0.1);
        }

        .settings-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .settings-section-title .anticon {
          color: #ee4d2d;
          font-size: 24px;
        }

        .settings-section-content {
          margin-top: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .required {
          color: #ff4d4f;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #ee4d2d;
          box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-select {
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          padding-top: 24px;
        }

        @media (max-width: 768px) {
          .settings-section {
            padding: 24px 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions .seller-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerSettingsPage;
