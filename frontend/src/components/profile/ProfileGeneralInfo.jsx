import { useState } from "react";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CameraOutlined,
  SaveOutlined,
  CloseOutlined,
  ManOutlined,
  WomanOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const ProfileGeneralInfo = ({ userData }) => {
  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phone: userData.phone || "",
    dob: userData.dob || "",
    gender: userData.gender || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Call API to save profile
    setIsEditing(false);
    // Show success notification
  };

  const handleCancel = () => {
    // Reset form data to original
    setFormData({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      dob: userData.dob || "",
      gender: userData.gender || "",
    });
    setIsEditing(false);
  };

  // Get user's initials for avatar placeholder
  const getInitials = () => {
    const firstName = formData.firstName || userData.username;
    const lastName = formData.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Get avatar URL with priority: avatarUrl > avatarName > placeholder
  const getAvatarUrl = () => {
    if (userData.avatarUrl) {
      return userData.avatarUrl;
    }
    if (userData.avatarName) {
      return userData.avatarName;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="profile-general-info">
      {/* Avatar and Basic Info */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">{getInitials()}</div>
          )}
          <button className="profile-avatar-upload">
            <CameraOutlined />
          </button>
        </div>

        <div className="profile-avatar-info">
          <h2 className="profile-username">
            {formData.firstName && formData.lastName
              ? `${formData.firstName} ${formData.lastName}`
              : userData.username}
          </h2>

          <div className="profile-role-badge">
            <CrownOutlined />
            {userData.roles[0]?.name || "USER"}
          </div>

          <div className="profile-meta-info">
            <div className="profile-meta-item">
              <MailOutlined />
              <span>{userData.email}</span>
            </div>
            <div className="profile-meta-item">
              <PhoneOutlined />
              <span>{userData.phone}</span>
            </div>
            {userData.isVerified && (
              <div className="profile-verified-badge">
                <CheckCircleOutlined />
                Đã xác thực
              </div>
            )}
          </div>

          <div className="profile-meta-info" style={{ marginTop: "8px" }}>
            <div className="profile-meta-item">
              <CalendarOutlined />
              <span>
                Tham gia:{" "}
                {new Date(userData.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info Form */}
      <div className="profile-info-form">
        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <UserOutlined />
              Họ <span className="required">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="profile-form-input"
              placeholder="Nhập họ của bạn"
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              <UserOutlined />
              Tên <span className="required">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="profile-form-input"
              placeholder="Nhập tên của bạn"
            />
          </div>
        </div>

        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <MailOutlined />
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={true} // Email không cho phép thay đổi
              className="profile-form-input"
              placeholder="email@example.com"
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              <PhoneOutlined />
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="profile-form-input"
              placeholder="0123456789"
            />
          </div>
        </div>

        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <CalendarOutlined />
              Ngày sinh
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="profile-form-input"
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              {formData.gender === "MALE" ? <ManOutlined /> : <WomanOutlined />}
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="profile-form-select"
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        <div className="profile-form-actions">
          {isEditing ? (
            <>
              <button
                className="profile-btn profile-btn-secondary"
                onClick={handleCancel}
              >
                <CloseOutlined />
                Hủy
              </button>
              <button
                className="profile-btn profile-btn-primary"
                onClick={handleSave}
              >
                <SaveOutlined />
                Lưu thay đổi
              </button>
            </>
          ) : (
            <button
              className="profile-btn profile-btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <UserOutlined />
              Chỉnh sửa thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileGeneralInfo.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    dob: PropTypes.string,
    gender: PropTypes.string,
    avatarUrl: PropTypes.string,
    avatarName: PropTypes.string,
    isVerified: PropTypes.bool,
    createdAt: PropTypes.string,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default ProfileGeneralInfo;
