import { useState, useEffect } from "react";
import {
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  LoadingOutlined,
  HomeOutlined,
  GlobalOutlined,
  EditOutlined,
  DownOutlined,
  UpOutlined,
  InfoCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { notification, Select, Tooltip, Alert } from "antd";
import {
  createSellerProfileApi,
  getMySellerProfileApi,
  updateSellerProfileApi,
} from "../../util/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import "./ProfileSellerInfo.css";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Option } = Select;

// Map verification status to Vietnamese
const STATUS_MAP = {
  CREATED: {
    label: "Đã tạo",
    icon: <SyncOutlined />,
    color: "created",
  },
  PENDING: {
    label: "Chờ duyệt",
    icon: <ClockCircleOutlined />,
    color: "pending",
  },
  VERIFIED: {
    label: "Đã xác thực",
    icon: <CheckCircleOutlined />,
    color: "verified",
  },
  REJECTED: {
    label: "Từ chối",
    icon: <CloseCircleOutlined />,
    color: "rejected",
  },
};

const ProfileSellerInfo = () => {
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    contactEmail: "",
    contactPhone: "",
    shopAddress: "",
    wardId: null,
    provinceId: null,
  });

  // Fetch seller profile on mount
  useEffect(() => {
    fetchSellerProfile();
    fetchProvinces();
  }, []);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);
      const res = await getMySellerProfileApi();

      if (res && res.code === 1000) {
        setSellerData(res.result);
      }
    } catch (error) {
      // If no seller profile found (404), it's ok - user hasn't registered yet
      if (error?.response?.status !== 404) {
        console.error("Error fetching seller profile:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      // TODO: Replace with actual API call to get provinces
      // For now, using mock data
      setProvinces([
        { id: 27, name: "Hưng Yên", fullName: "Tỉnh Hưng Yên" },
        { id: 1, name: "Hà Nội", fullName: "Thành phố Hà Nội" },
        { id: 79, name: "Hồ Chí Minh", fullName: "Thành phố Hồ Chí Minh" },
      ]);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchWards = async (provinceId) => {
    try {
      // TODO: Replace with actual API call to get wards by province
      // For now, using mock data
      if (provinceId === 27) {
        setWards([
          { id: 14107, name: "Tây Thụy Anh", nameWithType: "Xã Tây Thụy Anh" },
          { id: 14108, name: "Bắc Thụy Anh", nameWithType: "Xã Bắc Thụy Anh" },
        ]);
      } else {
        setWards([]);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceChange = (provinceId) => {
    setFormData((prev) => ({
      ...prev,
      provinceId,
      wardId: null,
    }));
    setWards([]);
    fetchWards(provinceId);
  };

  const handleWardChange = (wardId) => {
    setFormData((prev) => ({
      ...prev,
      wardId,
    }));
  };

  const validateForm = () => {
    const {
      storeName,
      contactEmail,
      contactPhone,
      shopAddress,
      wardId,
      provinceId,
    } = formData;

    if (
      !storeName ||
      !contactEmail ||
      !contactPhone ||
      !shopAddress ||
      !wardId ||
      !provinceId
    ) {
      notification.error({
        message: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ các trường bắt buộc (*)",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      notification.error({
        message: "Email không hợp lệ",
        description: "Vui lòng nhập đúng định dạng email",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contactPhone)) {
      notification.error({
        message: "Số điện thoại không hợp lệ",
        description: "Số điện thoại phải có 10 chữ số",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      let res;

      // If editing existing profile
      if (isEditing && sellerData) {
        res = await updateSellerProfileApi(sellerData.id, formData);

        if (res && res.code === 1000) {
          notification.success({
            message: "Cập nhật thành công",
            description: "Hồ sơ người bán của bạn đã được cập nhật.",
            placement: "topRight",
            duration: 3,
          });
        }
      } else {
        // Creating new profile
        res = await createSellerProfileApi(formData);

        if (res && res.code === 1000) {
          notification.success({
            message: "Đăng ký thành công",
            description:
              "Hồ sơ người bán của bạn đã được tạo và đang chờ xét duyệt.",
            placement: "topRight",
            duration: 3,
          });
        }
      }

      if (res && res.code === 1000) {
        // Refresh seller data
        await fetchSellerProfile();
        setIsRegistering(false);
        setIsEditing(false);

        // Reset form
        setFormData({
          storeName: "",
          storeDescription: "",
          contactEmail: "",
          contactPhone: "",
          shopAddress: "",
          wardId: null,
          provinceId: null,
        });
      } else {
        notification.error({
          message: isEditing ? "Cập nhật thất bại" : "Đăng ký thất bại",
          description: res.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error submitting seller profile:", error);
      notification.error({
        message: isEditing ? "Cập nhật thất bại" : "Đăng ký thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra, vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsRegistering(false);
    setIsEditing(false);
    setFormData({
      storeName: "",
      storeDescription: "",
      contactEmail: "",
      contactPhone: "",
      shopAddress: "",
      wardId: null,
      provinceId: null,
    });
    setWards([]);
  };

  const handleEdit = () => {
    // Check if editing is allowed
    if (sellerData.verificationStatus !== "CREATED") {
      notification.warning({
        message: "Không thể chỉnh sửa",
        description: `Hồ sơ ở trạng thái "${
          STATUS_MAP[sellerData.verificationStatus]?.label
        }" không thể chỉnh sửa. Chỉ có thể chỉnh sửa hồ sơ ở trạng thái "Đã tạo".`,
        placement: "topRight",
        duration: 4,
        icon: <LockOutlined style={{ color: "#faad14" }} />,
      });
      return;
    }

    // Populate form with existing data
    setFormData({
      storeName: sellerData.storeName || "",
      storeDescription: sellerData.storeDescription || "",
      contactEmail: sellerData.contactEmail || "",
      contactPhone: sellerData.contactPhone || "",
      shopAddress: sellerData.shopAddress || "",
      wardId: sellerData.ward?.id || null,
      provinceId: sellerData.ward?.province?.id || null,
    });

    // Load wards if province is set
    if (sellerData.ward?.province?.id) {
      fetchWards(sellerData.ward.province.id);
    }

    setIsEditing(true);
  };

  const handleRegisterNew = () => {
    setFormData({
      storeName: "",
      storeDescription: "",
      contactEmail: "",
      contactPhone: "",
      shopAddress: "",
      wardId: null,
      provinceId: null,
    });
    setWards([]);
    setIsRegistering(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="seller-loading">
        <LoadingOutlined />
        <p>Đang tải thông tin hồ sơ người bán...</p>
      </div>
    );
  }

  // If user has seller profile
  if (sellerData && !isEditing) {
    const status =
      STATUS_MAP[sellerData.verificationStatus] || STATUS_MAP.CREATED;
    const canEdit = sellerData.verificationStatus === "CREATED";
    const canRegisterNew = sellerData.verificationStatus === "REJECTED";

    return (
      <div className="seller-profile-container">
        {/* Compact View */}
        <div
          className="seller-profile-compact"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="compact-left">
            <div className="compact-logo">
              {sellerData.logoUrl ? (
                <img src={sellerData.logoUrl} alt="Logo" />
              ) : (
                <ShopOutlined />
              )}
            </div>
            <div className="compact-info">
              <h3 className="compact-store-name">{sellerData.storeName}</h3>
              <div className={`seller-status-badge ${status.color} compact`}>
                {status.icon}
                {status.label}
              </div>
            </div>
          </div>

          <div className="compact-right">
            <div className="compact-meta">
              <span className="compact-date">
                <ClockCircleOutlined />{" "}
                {dayjs(sellerData.createdAt).format("DD/MM/YYYY")}
              </span>
            </div>
            <button className="expand-button" type="button">
              {isExpanded ? <UpOutlined /> : <DownOutlined />}
              {isExpanded ? "Thu gọn" : "Xem chi tiết"}
            </button>
          </div>
        </div>

        {/* Alert for non-editable profiles */}
        {isExpanded && !canEdit && !canRegisterNew && (
          <Alert
            message="Thông báo"
            description={
              sellerData.verificationStatus === "PENDING"
                ? "Hồ sơ của bạn đang được xem xét. Vui lòng chờ kết quả phê duyệt."
                : "Hồ sơ đã được xác thực không thể chỉnh sửa. Vui lòng liên hệ quản trị viên nếu cần thay đổi thông tin."
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginTop: "16px", marginBottom: "16px" }}
          />
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="seller-profile-expanded">
            <div className="shop-info-section">
              <div className="shop-info-header">
                <div className="shop-logo-wrapper">
                  {sellerData.logoUrl ? (
                    <img
                      src={sellerData.logoUrl}
                      alt="Shop Logo"
                      className="shop-logo"
                    />
                  ) : (
                    <div className="shop-logo-placeholder">
                      <ShopOutlined />
                    </div>
                  )}
                </div>

                <div className="shop-basic-info">
                  <h2 className="shop-name">{sellerData.storeName}</h2>

                  <div className={`seller-status-badge ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>

                  {sellerData.storeDescription && (
                    <div className="shop-description">
                      <FileTextOutlined style={{ marginRight: "8px" }} />
                      {sellerData.storeDescription}
                    </div>
                  )}

                  <div className="shop-contact-info">
                    <div className="shop-contact-item">
                      <MailOutlined />
                      <span>{sellerData.contactEmail}</span>
                    </div>
                    <div className="shop-contact-item">
                      <PhoneOutlined />
                      <span>{sellerData.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div className="shop-address-section">
                <div className="shop-address-title">
                  <EnvironmentOutlined />
                  Địa chỉ cửa hàng
                </div>
                <div className="shop-address-text">
                  {sellerData.shopAddress}
                  {sellerData.ward && (
                    <>
                      , {sellerData.ward.nameWithType},{" "}
                      {sellerData.ward.province.fullName}
                    </>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {sellerData.verificationStatus === "REJECTED" &&
                sellerData.rejectionReason && (
                  <div className="rejection-reason-section">
                    <div className="rejection-reason-title">
                      <CloseCircleOutlined />
                      Lý do từ chối
                    </div>
                    <div className="rejection-reason-text">
                      {sellerData.rejectionReason}
                    </div>
                  </div>
                )}

              {/* Timestamps */}
              <div className="timestamps-section">
                <div className="timestamp-item">
                  <div className="timestamp-label">Ngày tạo</div>
                  <div className="timestamp-value">
                    <ClockCircleOutlined />
                    {dayjs(sellerData.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>

                {sellerData.approvedAt && (
                  <div className="timestamp-item">
                    <div className="timestamp-label">Ngày duyệt</div>
                    <div className="timestamp-value">
                      <CheckCircleOutlined />
                      {dayjs(sellerData.approvedAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                )}

                {sellerData.rejectedAt && (
                  <div className="timestamp-item">
                    <div className="timestamp-label">Ngày từ chối</div>
                    <div className="timestamp-value">
                      <CloseCircleOutlined />
                      {dayjs(sellerData.rejectedAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                )}

                <div className="timestamp-item">
                  <div className="timestamp-label">Cập nhật lần cuối</div>
                  <div className="timestamp-value">
                    <SyncOutlined />
                    {dayjs(sellerData.updatedAt).fromNow()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons based on status */}
            <div className="profile-form-actions" style={{ marginTop: "24px" }}>
              {canEdit && (
                <Tooltip title="Chỉnh sửa thông tin hồ sơ người bán">
                  <button
                    className="profile-btn profile-btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                  >
                    <EditOutlined />
                    Chỉnh sửa hồ sơ
                  </button>
                </Tooltip>
              )}

              {canRegisterNew && (
                <Tooltip title="Tạo hồ sơ mới sau khi bị từ chối">
                  <button
                    className="profile-btn profile-btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegisterNew();
                    }}
                  >
                    <SyncOutlined />
                    Đăng ký lại
                  </button>
                </Tooltip>
              )}

              {!canEdit && !canRegisterNew && (
                <Tooltip
                  title={
                    sellerData.verificationStatus === "PENDING"
                      ? "Hồ sơ đang được xem xét, không thể chỉnh sửa"
                      : "Hồ sơ đã được xác thực, không thể chỉnh sửa"
                  }
                >
                  <button
                    className="profile-btn profile-btn-secondary"
                    disabled
                    style={{ cursor: "not-allowed", opacity: 0.6 }}
                  >
                    <LockOutlined />
                    Không thể chỉnh sửa
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // If editing existing profile
  if (isEditing) {
    return (
      <div className="seller-registration-form">
        <div className="form-section-title">
          <FileTextOutlined />
          Chỉnh sửa hồ sơ người bán
        </div>

        <div className="profile-form-row">
          <div className="profile-form-group">
            <label className="profile-form-label">
              <ShopOutlined />
              Tên cửa hàng <span className="required">*</span>
            </label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="VD: Cửa hàng điện tử ABC"
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">
              <PhoneOutlined />
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className="profile-form-input"
              placeholder="0123456789"
              maxLength={10}
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
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleInputChange}
            className="profile-form-textarea"
            placeholder="Giới thiệu về cửa hàng của bạn, sản phẩm/dịch vụ cung cấp..."
            rows={4}
          />
        </div>

        <div className="form-section-title">
          <EnvironmentOutlined />
          Địa chỉ cửa hàng
        </div>

        <div className="location-selects">
          <div className="location-select-group">
            <label className="location-select-label">
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
            >
              {provinces.map((province) => (
                <Option key={province.id} value={province.id}>
                  {province.fullName}
                </Option>
              ))}
            </Select>
          </div>

          <div className="location-select-group">
            <label className="location-select-label">
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
            >
              {wards.map((ward) => (
                <Option key={ward.id} value={ward.id}>
                  {ward.nameWithType}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="profile-form-group full-width">
          <label className="profile-form-label">
            <EnvironmentOutlined />
            Địa chỉ cụ thể <span className="required">*</span>
          </label>
          <input
            type="text"
            name="shopAddress"
            value={formData.shopAddress}
            onChange={handleInputChange}
            className="profile-form-input"
            placeholder="Số nhà, tên đường/thôn/xóm..."
          />
        </div>

        <div className="profile-form-actions">
          <button
            className="profile-btn profile-btn-secondary"
            onClick={handleCancel}
            disabled={submitting}
          >
            <CloseOutlined />
            Hủy
          </button>
          <button
            className="profile-btn profile-btn-primary"
            onClick={handleSubmit}
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
                Cập nhật
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // If user hasn't registered as seller yet OR not in edit/register mode
  if (!isRegistering && !isEditing) {
    return (
      <div className="seller-empty-state">
        <ShopOutlined />
        <h3>Hồ sơ người bán</h3>
        <p>
          Bạn chưa đăng ký làm người bán. Đăng ký ngay để bắt đầu bán hàng trên
          nền tảng HUSTBuy và tiếp cận hàng triệu khách hàng tiềm năng.
        </p>
        <button
          className="profile-btn profile-btn-primary"
          onClick={handleRegisterNew}
        >
          <ShopOutlined />
          Đăng ký làm người bán
        </button>
      </div>
    );
  }

  // Registration form
  return (
    <div className="seller-registration-form">
      <div className="form-section-title">
        <ShopOutlined />
        Thông tin cửa hàng
      </div>

      <div className="profile-form-row">
        <div className="profile-form-group">
          <label className="profile-form-label">
            <ShopOutlined />
            Tên cửa hàng <span className="required">*</span>
          </label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleInputChange}
            className="profile-form-input"
            placeholder="VD: Cửa hàng điện tử ABC"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <PhoneOutlined />
            Số điện thoại <span className="required">*</span>
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            className="profile-form-input"
            placeholder="0123456789"
            maxLength={10}
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
          name="storeDescription"
          value={formData.storeDescription}
          onChange={handleInputChange}
          className="profile-form-textarea"
          placeholder="Giới thiệu về cửa hàng của bạn, sản phẩm/dịch vụ cung cấp..."
          rows={4}
        />
      </div>

      <div className="form-section-title">
        <EnvironmentOutlined />
        Địa chỉ cửa hàng
      </div>

      <div className="location-selects">
        <div className="location-select-group">
          <label className="location-select-label">
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
          >
            {provinces.map((province) => (
              <Option key={province.id} value={province.id}>
                {province.fullName}
              </Option>
            ))}
          </Select>
        </div>

        <div className="location-select-group">
          <label className="location-select-label">
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
          >
            {wards.map((ward) => (
              <Option key={ward.id} value={ward.id}>
                {ward.nameWithType}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="profile-form-group full-width">
        <label className="profile-form-label">
          <EnvironmentOutlined />
          Địa chỉ cụ thể <span className="required">*</span>
        </label>
        <input
          type="text"
          name="shopAddress"
          value={formData.shopAddress}
          onChange={handleInputChange}
          className="profile-form-input"
          placeholder="Số nhà, tên đường/thôn/xóm..."
        />
      </div>

      <div className="profile-form-actions">
        <button
          className="profile-btn profile-btn-secondary"
          onClick={handleCancel}
          disabled={submitting}
        >
          <CloseOutlined />
          Hủy
        </button>
        <button
          className="profile-btn profile-btn-primary"
          onClick={handleSubmit}
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
              Đăng ký
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileSellerInfo;
