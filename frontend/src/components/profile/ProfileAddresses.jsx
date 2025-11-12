import { useState } from "react";
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const ProfileAddresses = ({ addresses }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
    isDefault: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      recipientName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      detailAddress: "",
      isDefault: false,
    });
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detailAddress: address.detailAddress,
      isDefault: address.isDefault,
    });
  };

  const handleSave = () => {
    // TODO: Call API to save address
    console.log("Saving address:", formData);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    // TODO: Call API to delete address
    console.log("Deleting address:", id);
  };

  const handleSetDefault = (id) => {
    // TODO: Call API to set default address
    console.log("Setting default address:", id);
  };

  if (addresses.length === 0 && !isAdding) {
    return (
      <div className="profile-empty-state">
        <HomeOutlined />
        <h3>Sổ địa chỉ trống</h3>
        <p>
          Bạn chưa có địa chỉ nào. Thêm địa chỉ để việc mua hàng dễ dàng hơn.
        </p>
        <button
          className="profile-btn profile-btn-primary"
          style={{ marginTop: "20px" }}
          onClick={handleAdd}
        >
          <PlusOutlined />
          Thêm địa chỉ mới
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Add Address Button */}
      {!isAdding && !editingId && (
        <div style={{ marginBottom: "24px" }}>
          <button
            className="profile-btn profile-btn-primary"
            onClick={handleAdd}
          >
            <PlusOutlined />
            Thêm địa chỉ mới
          </button>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {(isAdding || editingId) && (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(238, 77, 45, 0.03) 0%, rgba(255, 107, 53, 0.03) 100%)",
            border: "2px solid rgba(238, 77, 45, 0.2)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 600 }}
          >
            {isAdding ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
          </h3>

          <div className="profile-info-form">
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label className="profile-form-label">
                  <UserOutlined />
                  Họ tên người nhận <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  className="profile-form-input"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  <PhoneOutlined />
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="profile-form-input"
                  placeholder="0123456789"
                />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label className="profile-form-label">
                  <EnvironmentOutlined />
                  Tỉnh/Thành phố <span className="required">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="profile-form-select"
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  <EnvironmentOutlined />
                  Quận/Huyện <span className="required">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="profile-form-select"
                >
                  <option value="">Chọn Quận/Huyện</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                </select>
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label className="profile-form-label">
                  <EnvironmentOutlined />
                  Phường/Xã <span className="required">*</span>
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className="profile-form-select"
                >
                  <option value="">Chọn Phường/Xã</option>
                  <option value="Phường 1">Phường 1</option>
                  <option value="Phường 2">Phường 2</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">
                  <HomeOutlined />
                  Địa chỉ cụ thể <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleInputChange}
                  className="profile-form-input"
                  placeholder="Số nhà, tên đường..."
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  Đặt làm địa chỉ mặc định
                </span>
              </label>
            </div>

            <div className="profile-form-actions">
              <button
                className="profile-btn profile-btn-secondary"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button
                className="profile-btn profile-btn-primary"
                onClick={handleSave}
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {addresses.map((address) => (
            <div
              key={address.id}
              style={{
                background: "white",
                border: address.isDefault
                  ? "2px solid #ee4d2d"
                  : "2px solid #f0f0f0",
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                transition: "all 0.3s ease",
              }}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    background:
                      "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircleOutlined />
                  Mặc định
                </div>
              )}

              {/* Address Info */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#333",
                      margin: 0,
                    }}
                  >
                    {address.recipientName}
                  </h4>
                  <span style={{ color: "#888", fontSize: "14px" }}>|</span>
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    {address.phone}
                  </span>
                </div>

                <div
                  style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}
                >
                  <div>{address.detailAddress}</div>
                  <div>
                    {address.ward}, {address.district}, {address.province}
                  </div>
                </div>
              </div>

              {/* Address Actions */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className="profile-btn profile-btn-secondary"
                  style={{ minWidth: "auto", padding: "8px 16px" }}
                  onClick={() => handleEdit(address)}
                >
                  <EditOutlined />
                  Chỉnh sửa
                </button>

                {!address.isDefault && (
                  <>
                    <button
                      className="profile-btn profile-btn-secondary"
                      style={{ minWidth: "auto", padding: "8px 16px" }}
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <CheckCircleOutlined />
                      Đặt làm mặc định
                    </button>
                    <button
                      className="profile-btn profile-btn-secondary"
                      style={{
                        minWidth: "auto",
                        padding: "8px 16px",
                        color: "#ff4d4f",
                        borderColor: "#ff4d4f",
                      }}
                      onClick={() => handleDelete(address.id)}
                    >
                      <DeleteOutlined />
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ProfileAddresses.propTypes = {
  addresses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      recipientName: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      province: PropTypes.string.isRequired,
      district: PropTypes.string.isRequired,
      ward: PropTypes.string.isRequired,
      detailAddress: PropTypes.string.isRequired,
      isDefault: PropTypes.bool,
    })
  ).isRequired,
};

export default ProfileAddresses;
