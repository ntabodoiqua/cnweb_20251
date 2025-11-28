import { SettingOutlined, SaveOutlined } from "@ant-design/icons";
import { useState } from "react";
import { notification } from "antd";

/**
 * AdminSettingsPage - Trang cài đặt hệ thống
 */
const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: "HUSTBuy",
    siteEmail: "admin@hustbuy.com",
    supportEmail: "support@hustbuy.com",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    language: "vi",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    notification.success({
      message: "Thành công",
      description: "Cài đặt đã được lưu!",
      placement: "topRight",
    });
  };

  return (
    <div className="admin-settings">
      <div className="settings-section">
        <h2 className="settings-section-title">Cài đặt chung</h2>
        <div className="settings-grid">
          <div className="settings-field">
            <label className="settings-label">Tên website</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange("siteName", e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Email hệ thống</label>
            <input
              type="email"
              value={settings.siteEmail}
              onChange={(e) => handleChange("siteEmail", e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Email hỗ trợ</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Múi giờ</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="settings-select"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Ngôn ngữ</label>
            <select
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="settings-select"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Đơn vị tiền tệ</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="settings-select"
            >
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Tính năng</h2>
        <div className="settings-toggles">
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <h3>Chế độ bảo trì</h3>
              <p>Tạm thời tắt website để bảo trì</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  handleChange("maintenanceMode", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-info">
              <h3>Cho phép đăng ký</h3>
              <p>Người dùng có thể tạo tài khoản mới</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) =>
                  handleChange("allowRegistration", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-info">
              <h3>Thông báo Email</h3>
              <p>Gửi thông báo qua email cho người dùng</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleChange("emailNotifications", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-toggle-item">
            <div className="toggle-info">
              <h3>Thông báo SMS</h3>
              <p>Gửi thông báo qua SMS cho người dùng</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) =>
                  handleChange("smsNotifications", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="admin-btn admin-btn-secondary">Hủy thay đổi</button>
        <button className="admin-btn admin-btn-primary" onClick={handleSave}>
          <SaveOutlined />
          Lưu cài đặt
        </button>
      </div>

      <style jsx>{`
        .admin-settings {
          animation: fadeIn 0.5s ease-out;
        }

        .settings-section {
          background: white;
          border: 1px solid rgba(238, 77, 45, 0.1);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .settings-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin: 0 0 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .settings-section-title::before {
          content: "";
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          border-radius: 2px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .settings-input,
        .settings-select {
          padding: 12px 16px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }

        .settings-input:focus,
        .settings-select:focus {
          border-color: #ee4d2d;
          box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .settings-toggles {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: linear-gradient(
            135deg,
            rgba(238, 77, 45, 0.03) 0%,
            rgba(255, 107, 53, 0.03) 100%
          );
          border: 1px solid rgba(238, 77, 45, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .settings-toggle-item:hover {
          border-color: rgba(238, 77, 45, 0.2);
          transform: translateX(4px);
        }

        .toggle-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px;
        }

        .toggle-info p {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 54px;
          height: 28px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 28px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .settings-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .settings-section {
            padding: 20px;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          .settings-toggle-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .settings-actions {
            flex-direction: column-reverse;
          }

          .settings-actions .admin-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettingsPage;
