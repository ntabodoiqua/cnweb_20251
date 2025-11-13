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
  SendOutlined,
  UploadOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { notification, Select, Tooltip, Alert, Modal } from "antd";
import {
  createSellerProfileApi,
  getMySellerProfileApi,
  updateSellerProfileApi,
  getProvincesApi,
  getWardsByProvinceApi,
  sendSellerProfileToReviewApi,
  uploadSellerDocumentApi,
  getSellerDocumentApi,
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
  const [sellerProfiles, setSellerProfiles] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [errors, setErrors] = useState({
    contactEmail: "",
    contactPhone: "",
  });
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [documentInfo, setDocumentInfo] = useState({});

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

  const fetchSellerProfile = async (page = 0) => {
    try {
      setLoading(true);
      const res = await getMySellerProfileApi(page, 20);

      if (res && res.code === 1000) {
        setSellerProfiles(res.result.content || []);
        setPagination({
          current: res.result.number + 1,
          pageSize: res.result.size,
          total: res.result.totalElements,
        });
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

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Vietnamese phone number: starts with 0, followed by 9 digits
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (name === "contactEmail") {
      if (value && !validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          contactEmail: "Email không đúng định dạng (VD: example@domain.com)",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          contactEmail: "",
        }));
      }
    }

    if (name === "contactPhone") {
      // Remove non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, "");

      setFormData((prev) => ({
        ...prev,
        contactPhone: numericValue,
      }));

      if (numericValue && !validatePhone(numericValue)) {
        if (numericValue.length < 10) {
          setErrors((prev) => ({
            ...prev,
            contactPhone: "Số điện thoại phải có 10 chữ số",
          }));
        } else if (!numericValue.startsWith("0")) {
          setErrors((prev) => ({
            ...prev,
            contactPhone: "Số điện thoại phải bắt đầu bằng số 0",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            contactPhone: "Số điện thoại không hợp lệ",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          contactPhone: "",
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

    // Check required fields
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

    // Validate store name length
    if (storeName.trim().length < 3) {
      notification.error({
        message: "Tên cửa hàng không hợp lệ",
        description: "Tên cửa hàng phải có ít nhất 3 ký tự",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    if (storeName.trim().length > 100) {
      notification.error({
        message: "Tên cửa hàng quá dài",
        description: "Tên cửa hàng không được vượt quá 100 ký tự",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    // Validate email
    if (!validateEmail(contactEmail)) {
      notification.error({
        message: "Email không hợp lệ",
        description:
          "Vui lòng nhập đúng định dạng email (VD: example@domain.com)",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    // Validate phone
    if (!validatePhone(contactPhone)) {
      notification.error({
        message: "Số điện thoại không hợp lệ",
        description: "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0",
        placement: "topRight",
        duration: 3,
      });
      return false;
    }

    // Validate shop address
    if (shopAddress.trim().length < 5) {
      notification.error({
        message: "Địa chỉ không hợp lệ",
        description: "Địa chỉ cửa hàng phải có ít nhất 5 ký tự",
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
      if (isEditing && editingProfile) {
        res = await updateSellerProfileApi(editingProfile.id, formData);

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
        setEditingProfile(null);

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
    setEditingProfile(null);
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
    setErrors({
      contactEmail: "",
      contactPhone: "",
    });
  };

  const handleEdit = (profile) => {
    // Check if editing is allowed
    if (profile.verificationStatus !== "CREATED") {
      notification.warning({
        message: "Không thể chỉnh sửa",
        description: `Hồ sơ ở trạng thái "${
          STATUS_MAP[profile.verificationStatus]?.label
        }" không thể chỉnh sửa. Chỉ có thể chỉnh sửa hồ sơ ở trạng thái "Đã tạo".`,
        placement: "topRight",
        duration: 4,
        icon: <LockOutlined style={{ color: "#faad14" }} />,
      });
      return;
    }

    // Populate form with existing data
    setFormData({
      storeName: profile.storeName || "",
      storeDescription: profile.storeDescription || "",
      contactEmail: profile.contactEmail || "",
      contactPhone: profile.contactPhone || "",
      shopAddress: profile.shopAddress || "",
      wardId: profile.ward?.id || null,
      provinceId: profile.ward?.province?.id || null,
    });

    // Load wards if province is set
    if (profile.ward?.province?.id) {
      fetchWards(profile.ward.province.id);
    }

    setEditingProfile(profile);
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

  const handleSendToReview = (profile) => {
    Modal.confirm({
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SendOutlined style={{ color: "#1890ff", fontSize: "20px" }} />
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            Gửi hồ sơ để duyệt
          </span>
        </div>
      ),
      content: (
        <div style={{ padding: "12px 0" }}>
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #91d5ff",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <strong style={{ color: "#1890ff" }}>📋 Hồ sơ:</strong>{" "}
              {profile.storeName}
            </div>
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: "6px" }}
              />
              Email: {profile.contactEmail}
            </div>
            <div style={{ fontSize: "14px", color: "#595959" }}>
              <PhoneOutlined style={{ color: "#52c41a", marginRight: "6px" }} />
              Số điện thoại: {profile.contactPhone}
            </div>
          </div>

          <p
            style={{ fontSize: "15px", marginBottom: "12px", color: "#262626" }}
          >
            Bạn có chắc chắn muốn gửi hồ sơ này để admin xem xét và phê duyệt?
          </p>

          <div
            style={{
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <InfoCircleOutlined
              style={{ color: "#faad14", fontSize: "16px", marginTop: "2px" }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: "500",
                  color: "#d48806",
                  marginBottom: "4px",
                }}
              >
                Lưu ý quan trọng:
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#8c8c8c",
                  lineHeight: "1.6",
                }}
              >
                • Sau khi gửi, hồ sơ sẽ chuyển sang trạng thái "Chờ duyệt"
                <br />
                • Bạn sẽ không thể chỉnh sửa hồ sơ cho đến khi admin phê duyệt
                hoặc từ chối
                <br />• Thời gian xét duyệt thường từ 1-3 ngày làm việc
              </div>
            </div>
          </div>
        </div>
      ),
      okText: (
        <span>
          <SendOutlined /> Xác nhận gửi
        </span>
      ),
      cancelText: (
        <span>
          <CloseOutlined /> Hủy bỏ
        </span>
      ),
      icon: null,
      width: 600,
      centered: true,
      okButtonProps: {
        style: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          height: "40px",
          borderRadius: "6px",
          fontWeight: "500",
        },
      },
      cancelButtonProps: {
        style: {
          height: "40px",
          borderRadius: "6px",
        },
      },
      onOk: async () => {
        try {
          const res = await sendSellerProfileToReviewApi(profile.id);

          if (res && res.code === 1000) {
            notification.success({
              message: "Gửi thành công",
              description:
                "Hồ sơ của bạn đã được gửi đến admin để xem xét. Vui lòng chờ phản hồi.",
              placement: "topRight",
              duration: 4,
            });

            // Refresh seller data
            await fetchSellerProfile();
          } else {
            notification.error({
              message: "Gửi thất bại",
              description:
                res.message || "Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại.",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch (error) {
          console.error("Error sending profile to review:", error);
          notification.error({
            message: "Gửi thất bại",
            description:
              error?.response?.data?.message ||
              error?.message ||
              "Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại.",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const fetchDocumentInfo = async (profileId) => {
    try {
      const res = await getSellerDocumentApi(profileId);
      if (res && res.code === 1000) {
        setDocumentInfo((prev) => ({
          ...prev,
          [profileId]: res.result,
        }));
      }
    } catch (error) {
      // Document not found is ok
      if (error?.response?.status !== 404) {
        console.error("Error fetching document info:", error);
      }
    }
  };

  const handleFileUpload = async (event, profileId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      notification.error({
        message: "File không hợp lệ",
        description:
          "Chỉ chấp nhận file PDF. Vui lòng gộp tất cả tài liệu vào một file PDF.",
        placement: "topRight",
        duration: 4,
      });
      event.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      notification.error({
        message: "File quá lớn",
        description: "Kích thước file không được vượt quá 10MB.",
        placement: "topRight",
        duration: 3,
      });
      event.target.value = "";
      return;
    }

    try {
      setUploadingDoc(profileId);
      const res = await uploadSellerDocumentApi(profileId, file);

      if (res && res.code === 1000) {
        notification.success({
          message: "Tải lên thành công",
          description: `File "${res.result.originalFileName}" đã được tải lên thành công.`,
          placement: "topRight",
          duration: 3,
        });

        // Refresh document info
        await fetchDocumentInfo(profileId);
      } else {
        notification.error({
          message: "Tải lên thất bại",
          description:
            res.message || "Có lỗi xảy ra khi tải file. Vui lòng thử lại.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      notification.error({
        message: "Tải lên thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tải file. Vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setUploadingDoc(null);
      event.target.value = "";
    }
  };

  const handleViewDocument = (documentInfo) => {
    if (documentInfo?.fileUrl) {
      window.open(documentInfo.fileUrl, "_blank");
    }
  };

  // Helper function to extract original filename from UUID-prefixed filename
  const getOriginalFileName = (fileName) => {
    if (!fileName) return "Tài liệu hồ sơ";

    // Remove UUID prefix (format: "uuid_originalname.pdf")
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_
    const uuidPattern =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_/i;
    return fileName.replace(uuidPattern, "");
  };

  // Helper function to toggle expand
  const toggleExpand = (profileId) => {
    setExpandedIds((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );

    // Fetch document info when expanding
    if (!expandedIds.includes(profileId)) {
      fetchDocumentInfo(profileId);
    }
  };

  // Render single profile card
  const renderProfileCard = (profile) => {
    const status = STATUS_MAP[profile.verificationStatus] || STATUS_MAP.CREATED;
    const canEdit = profile.verificationStatus === "CREATED";
    const canRegisterNew = profile.verificationStatus === "REJECTED";
    const isExpanded = expandedIds.includes(profile.id);

    return (
      <div
        key={profile.id}
        className="seller-profile-container"
        style={{ marginBottom: "20px" }}
      >
        {/* Compact View */}
        <div
          className="seller-profile-compact"
          onClick={() => toggleExpand(profile.id)}
        >
          <div className="compact-left">
            <div className="compact-logo">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" />
              ) : (
                <ShopOutlined />
              )}
            </div>
            <div className="compact-info">
              <h3 className="compact-store-name">{profile.storeName}</h3>
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
                {dayjs(profile.createdAt).format("DD/MM/YYYY")}
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
              profile.verificationStatus === "PENDING"
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
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
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
                  <h2 className="shop-name">{profile.storeName}</h2>

                  <div className={`seller-status-badge ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>

                  {profile.storeDescription && (
                    <div className="shop-description">
                      <FileTextOutlined style={{ marginRight: "8px" }} />
                      {profile.storeDescription}
                    </div>
                  )}

                  <div className="shop-contact-info">
                    <div className="shop-contact-item">
                      <MailOutlined />
                      <span>{profile.contactEmail}</span>
                    </div>
                    <div className="shop-contact-item">
                      <PhoneOutlined />
                      <span>{profile.contactPhone}</span>
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
                  {profile.shopAddress}
                  {profile.ward && (
                    <>
                      , {profile.ward.nameWithType},{" "}
                      {profile.ward.province.fullName}
                    </>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {profile.verificationStatus === "REJECTED" &&
                profile.rejectionReason && (
                  <div className="rejection-reason-section">
                    <div className="rejection-reason-title">
                      <CloseCircleOutlined />
                      Lý do từ chối
                    </div>
                    <div className="rejection-reason-text">
                      {profile.rejectionReason}
                    </div>
                  </div>
                )}

              {/* Document Upload Section */}
              <div className="document-upload-section">
                <div className="document-upload-header">
                  <FilePdfOutlined
                    style={{ fontSize: "18px", color: "#1890ff" }}
                  />
                  <h3>Tài liệu hồ sơ</h3>
                </div>

                {documentInfo[profile.id] ? (
                  <div className="document-info">
                    <div className="document-details">
                      <FilePdfOutlined
                        style={{ fontSize: "24px", color: "#ff4d4f" }}
                      />
                      <div className="document-meta">
                        <div className="document-name">
                          {getOriginalFileName(
                            documentInfo[profile.id].fileName
                          )}
                        </div>
                        <div className="document-size-date">
                          {documentInfo[profile.id].fileSize && (
                            <span>
                              {(
                                documentInfo[profile.id].fileSize / 1024
                              ).toFixed(2)}{" "}
                              KB
                            </span>
                          )}
                          {documentInfo[profile.id].uploadedAt && (
                            <>
                              {documentInfo[profile.id].fileSize && (
                                <span className="separator">•</span>
                              )}
                              <span>
                                Tải lên:{" "}
                                {dayjs(
                                  documentInfo[profile.id].uploadedAt
                                ).format("DD/MM/YYYY HH:mm")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="document-actions">
                      <Tooltip title="Xem tài liệu">
                        <button
                          className="document-btn document-btn-view"
                          onClick={() =>
                            handleViewDocument(documentInfo[profile.id])
                          }
                        >
                          <EyeOutlined />
                          Xem
                        </button>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Tải lên tài liệu mới (sẽ thay thế tài liệu hiện tại)">
                          <label className="document-btn document-btn-upload">
                            <UploadOutlined />
                            {uploadingDoc === profile.id
                              ? "Đang tải..."
                              : "Thay thế"}
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(e, profile.id)}
                              disabled={uploadingDoc === profile.id}
                              style={{ display: "none" }}
                            />
                          </label>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="document-empty">
                    {canEdit ? (
                      <>
                        <div className="document-empty-icon">
                          <FilePdfOutlined />
                        </div>
                        <p className="document-empty-text">
                          Chưa có tài liệu hồ sơ. Vui lòng tải lên file PDF chứa
                          các giấy tờ liên quan.
                        </p>
                        <Alert
                          message="Lưu ý"
                          description="Chỉ chấp nhận file PDF. Vui lòng gộp tất cả tài liệu (CMND, giấy phép kinh doanh, v.v.) vào một file PDF duy nhất."
                          type="warning"
                          showIcon
                          style={{ marginBottom: "12px", textAlign: "left" }}
                        />
                        <label className="document-btn document-btn-primary document-btn-upload-large">
                          <UploadOutlined />
                          {uploadingDoc === profile.id ? (
                            <>
                              <LoadingOutlined style={{ marginRight: "8px" }} />
                              Đang tải lên...
                            </>
                          ) : (
                            "Tải lên tài liệu"
                          )}
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(e, profile.id)}
                            disabled={uploadingDoc === profile.id}
                            style={{ display: "none" }}
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <div className="document-empty-icon">
                          <FilePdfOutlined />
                        </div>
                        <p className="document-empty-text">
                          Chưa có tài liệu hồ sơ.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="timestamps-section">
                <div className="timestamp-item">
                  <div className="timestamp-label">Ngày tạo</div>
                  <div className="timestamp-value">
                    <ClockCircleOutlined />
                    {dayjs(profile.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>

                {profile.approvedAt && (
                  <div className="timestamp-item">
                    <div className="timestamp-label">Ngày duyệt</div>
                    <div className="timestamp-value">
                      <CheckCircleOutlined />
                      {dayjs(profile.approvedAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                )}

                {profile.rejectedAt && (
                  <div className="timestamp-item">
                    <div className="timestamp-label">Ngày từ chối</div>
                    <div className="timestamp-value">
                      <CloseCircleOutlined />
                      {dayjs(profile.rejectedAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                )}

                <div className="timestamp-item">
                  <div className="timestamp-label">Cập nhật lần cuối</div>
                  <div className="timestamp-value">
                    <SyncOutlined />
                    {dayjs(profile.updatedAt).fromNow()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons based on status */}
            <div className="profile-form-actions" style={{ marginTop: "24px" }}>
              {canEdit && (
                <>
                  <Tooltip title="Chỉnh sửa thông tin hồ sơ người bán">
                    <button
                      className="profile-btn profile-btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(profile);
                      }}
                    >
                      <EditOutlined />
                      Chỉnh sửa hồ sơ
                    </button>
                  </Tooltip>
                  <Tooltip title="Gửi hồ sơ để admin xem xét và phê duyệt">
                    <button
                      className="profile-btn profile-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendToReview(profile);
                      }}
                    >
                      <SendOutlined />
                      Gửi hồ sơ
                    </button>
                  </Tooltip>
                </>
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
                    profile.verificationStatus === "PENDING"
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

  // If user has seller profiles
  if (sellerProfiles.length > 0 && !isEditing && !isRegistering) {
    return (
      <div>
        {sellerProfiles.map((profile) => renderProfileCard(profile))}

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              className="profile-btn profile-btn-secondary"
              disabled={pagination.current === 1}
              onClick={() => fetchSellerProfile(pagination.current - 2)}
              style={{ marginRight: "10px" }}
            >
              Trang trước
            </button>
            <span style={{ margin: "0 15px" }}>
              Trang {pagination.current} /{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              className="profile-btn profile-btn-secondary"
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => fetchSellerProfile(pagination.current)}
            >
              Trang sau
            </button>
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
              className={`profile-form-input ${
                errors.contactPhone ? "input-error" : ""
              }`}
              placeholder="0123456789"
              maxLength={10}
            />
            {errors.contactPhone && (
              <span className="error-message">{errors.contactPhone}</span>
            )}
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
            className={`profile-form-input ${
              errors.contactEmail ? "input-error" : ""
            }`}
            placeholder="shop@example.com"
          />
          {errors.contactEmail && (
            <span className="error-message">{errors.contactEmail}</span>
          )}
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
            className={`profile-form-input ${
              errors.contactPhone ? "input-error" : ""
            }`}
            placeholder="0123456789"
            maxLength={10}
          />
          {errors.contactPhone && (
            <span className="error-message">{errors.contactPhone}</span>
          )}
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
          className={`profile-form-input ${
            errors.contactEmail ? "input-error" : ""
          }`}
          placeholder="shop@example.com"
        />
        {errors.contactEmail && (
          <span className="error-message">{errors.contactEmail}</span>
        )}
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
