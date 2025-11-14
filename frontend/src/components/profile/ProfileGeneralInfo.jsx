import { useState, useRef, useContext } from "react";
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
  LoadingOutlined,
} from "@ant-design/icons";
import { notification } from "antd";
import PropTypes from "prop-types";
import { updateMyInfoApi, updateAvatarApi } from "../../util/api";
import { AuthContext } from "../context/auth.context";

const ProfileGeneralInfo = ({ userData, onDataUpdated }) => {
  const fileInputRef = useRef(null);
  const { auth, setAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phone: userData.phone || "",
    dob: userData.dob || "",
    gender: userData.gender || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(
    userData.avatarUrl || userData.avatarName
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Prepare data for API (only send fields that API expects)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob || null,
        phone: formData.phone || null,
        gender: formData.gender || null,
      };

      const response = await updateMyInfoApi(updateData);

      if (response && response.code === 1000) {
        notification.success({
          message: "Cập nhật thành công!",
          description: "Thông tin cá nhân của bạn đã được cập nhật.",
          placement: "topRight",
          duration: 3,
        });
        setIsEditing(false);
        // Refresh user data
        if (onDataUpdated) {
          await onDataUpdated();
        }
        // Cập nhật AuthContext với thông tin mới
        setAuth({
          ...auth,
          user: {
            ...auth.user,
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        });
      } else {
        notification.error({
          message: "Cập nhật thất bại!",
          description:
            response.message || "Đã xảy ra lỗi khi cập nhật thông tin.",
          placement: "topRight",
          duration: 4,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notification.error({
        message: "Lỗi hệ thống!",
        description:
          "Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      notification.warning({
        message: "File quá lớn!",
        description: "Kích thước file không được vượt quá 10MB.",
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      notification.warning({
        message: "Định dạng file không hợp lệ!",
        description: "Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF.",
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const response = await updateAvatarApi(file);

      if (response && response.code === 1000) {
        notification.success({
          message: "Cập nhật ảnh đại diện thành công!",
          description: "Ảnh đại diện của bạn đã được cập nhật.",
          placement: "topRight",
          duration: 3,
        });
        setCurrentAvatar(response.result);
        // Refresh user data
        if (onDataUpdated) {
          await onDataUpdated();
        }
        // Cập nhật AuthContext với avatar mới
        setAuth({
          ...auth,
          user: {
            ...auth.user,
            avatarUrl: response.result,
          },
        });
      } else {
        notification.error({
          message: "Cập nhật ảnh đại diện thất bại!",
          description: response.message || "Đã xảy ra lỗi khi tải ảnh lên.",
          placement: "topRight",
          duration: 4,
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      notification.error({
        message: "Cập nhật ảnh đại diện thất bại!",
        description: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input để có thể upload lại cùng file
      event.target.value = "";
    }
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

  // Get avatar URL with priority: currentAvatar > avatarUrl > avatarName > placeholder
  const getAvatarUrl = () => {
    if (currentAvatar) {
      return currentAvatar;
    }
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
          <button
            className="profile-avatar-upload"
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            title="Cập nhật ảnh đại diện"
          >
            {isUploadingAvatar ? <LoadingOutlined /> : <CameraOutlined />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-avatar-info">
          <h2 className="profile-username">
            {formData.firstName && formData.lastName
              ? `${formData.firstName} ${formData.lastName}`
              : userData.username}
          </h2>

          <div className="profile-roles-container">
            {userData.roles && userData.roles.length > 0 ? (
              userData.roles.map((role, index) => (
                <div key={index} className="profile-role-badge">
                  <CrownOutlined />
                  {role.name}
                </div>
              ))
            ) : (
              <div className="profile-role-badge">
                <CrownOutlined />
                USER
              </div>
            )}
          </div>

          <div className="profile-meta-info">
            {/**/}
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
                disabled={isSaving}
              >
                <CloseOutlined />
                Hủy
              </button>
              <button
                className="profile-btn profile-btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <LoadingOutlined /> : <SaveOutlined />}
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
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
  onDataUpdated: PropTypes.func,
};

export default ProfileGeneralInfo;
