import { useState, useEffect } from "react";
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  GlobalOutlined,
  LoadingOutlined,
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { notification, Modal, Select } from "antd";
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  getProvincesApi,
  getWardsByProvinceApi,
} from "../../util/api";
import styles from "./ProfileSellerInfo.module.css";
import profileStyles from "../../pages/Profile.module.css";

const { Option } = Select;

const ProfileAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    receiverName: "",
    receiverPhone: "",
    provinceId: "",
    wardId: "",
    street: "",
  });
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",
    provinceId: null,
    wardId: null,
    street: "",
    isDefault: false,
  });

  // Fetch addresses khi component mount
  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  const fetchAddresses = async (page = 0) => {
    try {
      setLoading(true);
      const res = await getAddressesApi(page, pagination.pageSize);

      if (res && res.code === 1000) {
        setAddresses(res.result.content);
        setPagination({
          ...pagination,
          current: page + 1,
          total: res.result.totalElements,
        });
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await getProvincesApi();

      if (res && res.code === 1000) {
        setProvinces(res.result);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description:
          "Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const fetchWards = async (provinceId) => {
    try {
      const res = await getWardsByProvinceApi(provinceId);

      if (res && res.code === 1000) {
        setWards(res.result);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách phường/xã. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Real-time validation for phone
    if (name === "receiverPhone") {
      const numericValue = value.replace(/[^0-9]/g, "");

      setFormData((prev) => ({
        ...prev,
        receiverPhone: numericValue,
      }));

      if (numericValue && !validatePhone(numericValue)) {
        if (numericValue.length < 10) {
          setErrors((prev) => ({
            ...prev,
            receiverPhone: "Số điện thoại phải có 10 chữ số",
          }));
        } else if (!numericValue.startsWith("0")) {
          setErrors((prev) => ({
            ...prev,
            receiverPhone: "Số điện thoại phải bắt đầu bằng số 0",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            receiverPhone: "Số điện thoại không hợp lệ",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          receiverPhone: "",
        }));
      }
    }
  };

  const handleProvinceChange = (provinceId) => {
    setFormData((prev) => ({
      ...prev,
      provinceId,
      wardId: null,
    }));
    setWards([]);
    if (provinceId) {
      fetchWards(provinceId);
    }
  };

  const handleWardChange = (wardId) => {
    setFormData((prev) => ({
      ...prev,
      wardId,
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      receiverName: "",
      receiverPhone: "",
      provinceId: null,
      wardId: null,
      street: "",
      isDefault: false,
    });
    setWards([]);
    setErrors({
      receiverName: "",
      receiverPhone: "",
      provinceId: "",
      wardId: "",
      street: "",
    });
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      provinceId: address.ward?.province?.id || null,
      wardId: address.ward?.id || null,
      street: address.street,
      isDefault: address.isDefault,
    });

    // Load wards nếu có provinceId
    if (address.ward?.province?.id) {
      fetchWards(address.ward.province.id);
    }
  };

  const validateForm = () => {
    const newErrors = {
      receiverName: "",
      receiverPhone: "",
      provinceId: "",
      wardId: "",
      street: "",
    };
    let isValid = true;

    if (!formData.receiverName.trim()) {
      newErrors.receiverName = "Vui lòng nhập tên người nhận";
      isValid = false;
    }

    // Validate phone Vietnamese format
    const phoneRegex = /^0[0-9]{9}$/;
    if (!formData.receiverPhone.trim()) {
      newErrors.receiverPhone = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (!phoneRegex.test(formData.receiverPhone)) {
      newErrors.receiverPhone =
        "Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0";
      isValid = false;
    }

    if (!formData.provinceId) {
      newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
      isValid = false;
    }

    if (!formData.wardId) {
      newErrors.wardId = "Vui lòng chọn phường/xã";
      isValid = false;
    }

    if (!formData.street.trim()) {
      newErrors.street = "Vui lòng nhập địa chỉ cụ thể";
      isValid = false;
    } else if (formData.street.trim().length < 5) {
      newErrors.street = "Địa chỉ cụ thể phải có ít nhất 5 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const requestData = {
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        street: formData.street,
        wardId: formData.wardId,
        provinceId: formData.provinceId,
        isDefault: formData.isDefault,
      };

      let res;
      if (editingId) {
        // Update existing address
        res = await updateAddressApi(editingId, requestData);
      } else {
        // Create new address
        res = await createAddressApi(requestData);
      }

      if (res && res.code === 1000) {
        notification.success({
          message: "Thành công",
          description: editingId
            ? "Cập nhật địa chỉ thành công"
            : "Thêm địa chỉ mới thành công",
          placement: "topRight",
          duration: 3,
        });

        // Refresh addresses list
        await fetchAddresses(pagination.current - 1);

        setIsAdding(false);
        setEditingId(null);
        setWards([]);
        setErrors({
          receiverPhone: "",
        });
      } else {
        notification.error({
          message: editingId ? "Cập nhật thất bại" : "Thêm địa chỉ thất bại",
          description: res.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error saving address:", error);
      notification.error({
        message: editingId ? "Cập nhật thất bại" : "Thêm địa chỉ thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu địa chỉ. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setWards([]);
    setFormData({
      receiverName: "",
      receiverPhone: "",
      provinceId: null,
      wardId: null,
      street: "",
      isDefault: false,
    });
    setErrors({
      receiverName: "",
      receiverPhone: "",
      provinceId: "",
      wardId: "",
      street: "",
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          const res = await deleteAddressApi(id);

          if (res && res.code === 1000) {
            notification.success({
              message: "Thành công",
              description: "Xóa địa chỉ thành công",
              placement: "topRight",
              duration: 3,
            });

            // Refresh addresses list
            await fetchAddresses(pagination.current - 1);
          }
        } catch (error) {
          console.error("Error deleting address:", error);
          notification.error({
            message: "Lỗi",
            description:
              error?.response?.data?.message ||
              "Không thể xóa địa chỉ. Vui lòng thử lại sau.",
            placement: "topRight",
            duration: 3,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSetDefault = async (id) => {
    try {
      setLoading(true);

      // Tìm address cần set default
      const address = addresses.find((addr) => addr.id === id);
      if (!address) return;

      // Update với isDefault = true
      const requestData = {
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        street: address.street,
        wardId: address.ward?.id,
        provinceId: address.ward?.province?.id,
        isDefault: true,
      };

      const res = await updateAddressApi(id, requestData);

      if (res && res.code === 1000) {
        notification.success({
          message: "Thành công",
          description: "Đã đặt làm địa chỉ mặc định",
          placement: "topRight",
          duration: 3,
        });

        // Refresh addresses list
        await fetchAddresses(pagination.current - 1);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      notification.error({
        message: "Lỗi",
        description:
          error?.response?.data?.message ||
          "Không thể đặt địa chỉ mặc định. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && addresses.length === 0 && !isAdding && !editingId) {
    return (
      <div className={styles.sellerLoading}>
        <LoadingOutlined />
        <p>Đang tải danh sách địa chỉ...</p>
      </div>
    );
  }

  // Empty state
  if (addresses.length === 0 && !isAdding && !editingId) {
    return (
      <div className={styles.sellerEmptyState}>
        <HomeOutlined />
        <h3>Sổ địa chỉ trống</h3>
        <p>
          Bạn chưa có địa chỉ nào. Thêm địa chỉ để việc mua hàng dễ dàng hơn.
        </p>
        <button
          className={`${profileStyles.btn} ${profileStyles.btnPrimary}`}
          onClick={handleAdd}
        >
          <PlusOutlined />
          Thêm địa chỉ mới
        </button>
      </div>
    );
  }

  // If adding or editing
  if (isAdding || editingId) {
    return (
      <div className={styles.sellerRegistrationForm}>
        <div className={styles.formSectionTitle}>
          <FileTextOutlined />
          {isAdding ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
        </div>

        <div className={profileStyles.formRow}>
          <div className={profileStyles.formGroup}>
            <label className={profileStyles.formLabel}>
              <UserOutlined />
              Họ tên người nhận <span className="required">*</span>
            </label>
            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleInputChange}
              className={`${profileStyles.formInput} ${
                errors.receiverName ? styles.inputError : ""
              }`}
              placeholder="Nhập họ tên người nhận"
            />
            {errors.receiverName && (
              <span className={styles.errorMessage}>{errors.receiverName}</span>
            )}
          </div>

          <div className={profileStyles.formGroup}>
            <label className={profileStyles.formLabel}>
              <PhoneOutlined />
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleInputChange}
              className={`${profileStyles.formInput} ${
                errors.receiverPhone ? styles.inputError : ""
              }`}
              placeholder="0123456789"
              maxLength={10}
            />
            {errors.receiverPhone && (
              <span className={styles.errorMessage}>
                {errors.receiverPhone}
              </span>
            )}
          </div>
        </div>

        <div className={styles.formSectionTitle}>
          <EnvironmentOutlined />
          Địa chỉ giao hàng
        </div>

        <div className={styles.locationSelects}>
          <div className={styles.locationSelectGroup}>
            <label className={styles.locationSelectLabel}>
              <GlobalOutlined />
              Tỉnh/Thành phố <span className="required">*</span>
            </label>
            <Select
              showSearch
              placeholder="Chọn tỉnh/thành phố"
              optionFilterProp="children"
              value={formData.provinceId}
              onChange={handleProvinceChange}
              style={{ width: "100%" }}
              size="large"
              status={errors.provinceId ? "error" : ""}
            >
              {provinces.map((province) => (
                <Option key={province.id} value={province.id}>
                  {province.fullName}
                </Option>
              ))}
            </Select>
            {errors.provinceId && (
              <span className={styles.errorMessage}>{errors.provinceId}</span>
            )}
          </div>

          <div className={styles.locationSelectGroup}>
            <label className={styles.locationSelectLabel}>
              <HomeOutlined />
              Phường/Xã <span className="required">*</span>
            </label>
            <Select
              showSearch
              placeholder="Chọn phường/xã"
              optionFilterProp="children"
              value={formData.wardId}
              onChange={handleWardChange}
              style={{ width: "100%" }}
              size="large"
              disabled={!formData.provinceId}
              status={errors.wardId ? "error" : ""}
            >
              {wards.map((ward) => (
                <Option key={ward.id} value={ward.id}>
                  {ward.nameWithType}
                </Option>
              ))}
            </Select>
            {errors.wardId && (
              <span className={styles.errorMessage}>{errors.wardId}</span>
            )}
          </div>
        </div>

        <div
          className={`${profileStyles.formGroup} ${profileStyles.fullWidth}`}
        >
          <label className={profileStyles.formLabel}>
            <EnvironmentOutlined />
            Địa chỉ cụ thể <span className="required">*</span>
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className={`${profileStyles.formInput} ${
              errors.street ? styles.inputError : ""
            }`}
            placeholder="Số nhà, tên đường..."
          />
          {errors.street && (
            <span className={styles.errorMessage}>{errors.street}</span>
          )}
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

        <div className={profileStyles.formActions}>
          <button
            className={`${profileStyles.btn} ${profileStyles.btnSecondary}`}
            onClick={handleCancel}
            disabled={submitting}
          >
            <CloseOutlined />
            Hủy
          </button>
          <button
            className={`${profileStyles.btn} ${profileStyles.btnPrimary}`}
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoadingOutlined />
                Đang xử lý...
              </>
            ) : (
              <>
                <SaveOutlined />
                {isAdding ? "Thêm địa chỉ" : "Cập nhật"}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // List addresses view
  return (
    <div>
      {/* Add Address Button */}
      <div style={{ marginBottom: "24px" }}>
        <button
          className={`${profileStyles.btn} ${profileStyles.btnPrimary}`}
          onClick={handleAdd}
        >
          <PlusOutlined />
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Addresses List */}
      {loading ? (
        <div className={styles.sellerLoading}>
          <LoadingOutlined />
          <p>Đang tải...</p>
        </div>
      ) : addresses.length > 0 ? (
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
                    {address.receiverName}
                  </h4>
                  <span style={{ color: "#888", fontSize: "14px" }}>|</span>
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    {address.receiverPhone}
                  </span>
                </div>

                <div
                  style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}
                >
                  <div>{address.street}</div>
                  <div>
                    {address.ward?.nameWithType}
                    {address.ward?.province?.fullName &&
                      `, ${address.ward.province.fullName}`}
                  </div>
                </div>
              </div>

              {/* Address Actions */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className={`${profileStyles.btn} ${profileStyles.btnSecondary}`}
                  style={{ minWidth: "auto", padding: "8px 16px" }}
                  onClick={() => handleEdit(address)}
                  disabled={loading}
                >
                  <EditOutlined />
                  Chỉnh sửa
                </button>

                {!address.isDefault && (
                  <>
                    <button
                      className={`${profileStyles.btn} ${profileStyles.btnSecondary}`}
                      style={{ minWidth: "auto", padding: "8px 16px" }}
                      onClick={() => handleSetDefault(address.id)}
                      disabled={loading}
                    >
                      <CheckCircleOutlined />
                      Đặt làm mặc định
                    </button>
                    <button
                      className={`${profileStyles.btn} ${profileStyles.btnSecondary}`}
                      style={{
                        minWidth: "auto",
                        padding: "8px 16px",
                        color: "#ff4d4f",
                        borderColor: "#ff4d4f",
                      }}
                      onClick={() => handleDelete(address.id)}
                      disabled={loading}
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
      ) : null}

      {/* Pagination */}
      {!loading && pagination.total > pagination.pageSize && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            className={`${profileStyles.btn} ${profileStyles.btnSecondary}`}
            disabled={pagination.current === 1 || loading}
            onClick={() => fetchAddresses(pagination.current - 2)}
            style={{ marginRight: "10px" }}
          >
            Trang trước
          </button>
          <span style={{ margin: "0 15px", fontSize: "14px", color: "#666" }}>
            Trang {pagination.current} /{" "}
            {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <button
            className={`${profileStyles.btn} ${profileStyles.btnSecondary}`}
            disabled={
              pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize) || loading
            }
            onClick={() => fetchAddresses(pagination.current)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileAddresses;
