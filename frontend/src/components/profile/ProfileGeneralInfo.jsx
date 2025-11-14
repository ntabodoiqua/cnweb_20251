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
import styles from "../../pages/Profile.module.css";

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
    <div className={styles.generalInfo}>
      {/* Avatar and Basic Info */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials()}</div>
          )}
          <button
            className={styles.avatarUpload}
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

        <div className={styles.avatarInfo}>
          <h2 className={styles.username}>
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

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <MailOutlined />
              <span>{userData.email}</span>
            </div>
            <div className={styles.metaItem}>
              <PhoneOutlined />
              <span>{userData.phone}</span>
            </div>
            {userData.isVerified && (
              <div className={styles.verifiedBadge}>
                <CheckCircleOutlined />
                Đã xác thực
              </div>
            )}
          </div>

          <div className={styles.metaInfo} style={{ marginTop: "8px" }}>
            <div className={styles.metaItem}>
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
      <div className={styles.infoForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <UserOutlined />
              Họ <span className="required">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.formInput}
              placeholder="Nhập họ của bạn"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <UserOutlined />
              Tên <span className="required">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.formInput}
              placeholder="Nhập tên của bạn"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <MailOutlined />
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={true} // Email không cho phép thay đổi
              className={styles.formInput}
              placeholder="email@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <PhoneOutlined />
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.formInput}
              placeholder="0123456789"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <CalendarOutlined />
              Ngày sinh
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {formData.gender === "MALE" ? <ManOutlined /> : <WomanOutlined />}
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.formSelect}
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          {isEditing ? (
            <>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleCancel}
                disabled={isSaving}
              >
                <CloseOutlined />
                Hủy
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <LoadingOutlined /> : <SaveOutlined />}
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </>
          ) : (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
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
