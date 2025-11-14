import {
  SettingOutlined,
  SaveOutlined,
  ShopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
  SyncOutlined,
  UploadOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { Modal, Spin, Tooltip, notification } from "antd";
import {
  getMyStoresApi,
  updateStoreApi,
  activateStoreApi,
  deactivateStoreApi,
  getWardInfoApi,
  uploadStoreLogoApi,
  uploadStoreBannerApi,
} from "../../util/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import "./SellerSettingsPage.css";

dayjs.extend(relativeTime);
dayjs.locale("vi");

/**
 * SellerSettingsPage - Trang quản lý cửa hàng (hỗ trợ nhiều cửa hàng)
 */
const SellerSettingsPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(6); // Số cửa hàng mỗi trang
  const [editingStoreId, setEditingStoreId] = useState(null); // ID of store being edited
  const [expandedIds, setExpandedIds] = useState([]); // Track expanded stores
  const [wardInfo, setWardInfo] = useState({}); // Store ward information by wardId
  const [loadingWards, setLoadingWards] = useState({}); // Track loading state for each ward
  const [uploadingMedia, setUploadingMedia] = useState({}); // Track uploading state {storeId: {logo: true/false, banner: true/false}}
  const logoInputRefs = useRef({}); // Refs for logo file inputs
  const bannerInputRefs = useRef({}); // Refs for banner file inputs
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
  });

  // Fetch stores from API
  const fetchStores = async (page = 0) => {
    try {
      setLoading(true);
      const response = await getMyStoresApi(page, pageSize);

      if (response?.code === 1000) {
        const { content, totalPages, totalElements, number } = response.result;
        setStores(content || []);
        setTotalPages(totalPages || 0);
        setTotalElements(totalElements || 0);
        setCurrentPage(number || 0);
      } else {
        notification.error({
          message: "Tải danh sách thất bại",
          description: response?.message || "Không thể tải danh sách cửa hàng",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      notification.error({
        message: "Tải danh sách thất bại",
        description: "Không thể tải danh sách cửa hàng",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch ward information from API
  const fetchWardInfo = async (wardId) => {
    if (!wardId || wardInfo[wardId]) return; // Skip if already loaded

    try {
      setLoadingWards((prev) => ({ ...prev, [wardId]: true }));
      const response = await getWardInfoApi(wardId);

      if (response?.code === 1000 && response?.result) {
        setWardInfo((prev) => ({
          ...prev,
          [wardId]: response.result,
        }));
      }
    } catch (error) {
      console.error("Error fetching ward info:", error);
    } finally {
      setLoadingWards((prev) => ({ ...prev, [wardId]: false }));
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Fetch ward info when stores are loaded
  useEffect(() => {
    stores.forEach((store) => {
      if (store.wardId) {
        fetchWardInfo(store.wardId);
      }
    });
  }, [stores]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditStore = (store) => {
    setEditingStoreId(store.id);
    setFormData({
      storeName: store.storeName,
      storeDescription: store.storeDescription || "",
    });
    // Auto expand when editing
    if (!expandedIds.includes(store.id)) {
      setExpandedIds((prev) => [...prev, store.id]);
    }
    // Scroll to the store container
    setTimeout(() => {
      const element = document.getElementById(`store-${store.id}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingStoreId(null);
    setFormData({
      storeName: "",
      storeDescription: "",
    });
  };

  const handleDeactivateStore = (storeId) => {
    Modal.confirm({
      title: "Xác nhận vô hiệu hóa cửa hàng",
      content:
        "Bạn có chắc chắn muốn vô hiệu hóa cửa hàng này? Bạn có thể kích hoạt lại sau.",
      okText: "Vô hiệu hóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await deactivateStoreApi(storeId);
          if (response?.code === 1000) {
            notification.success({
              message: "Vô hiệu hóa thành công",
              description: "Cửa hàng đã được vô hiệu hóa thành công",
              placement: "topRight",
              duration: 3,
            });
            fetchStores(currentPage);
          } else {
            notification.error({
              message: "Vô hiệu hóa thất bại",
              description:
                response?.message || "Không thể vô hiệu hóa cửa hàng",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch (error) {
          console.error("Error deactivating store:", error);
          notification.error({
            message: "Vô hiệu hóa thất bại",
            description: "Không thể vô hiệu hóa cửa hàng",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const handleActivateStore = async (storeId) => {
    try {
      const response = await activateStoreApi(storeId);
      if (response?.code === 1000) {
        notification.success({
          message: "Kích hoạt thành công",
          description: "Cửa hàng đã được kích hoạt thành công",
          placement: "topRight",
          duration: 3,
        });
        fetchStores(currentPage);
      } else {
        notification.error({
          message: "Kích hoạt thất bại",
          description: response?.message || "Không thể kích hoạt cửa hàng",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error activating store:", error);
      notification.error({
        message: "Kích hoạt thất bại",
        description: "Không thể kích hoạt cửa hàng",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingStoreId) return;

    try {
      const response = await updateStoreApi(editingStoreId, formData);
      if (response?.code === 1000) {
        notification.success({
          message: "Cập nhật thành công",
          description: "Thông tin cửa hàng đã được cập nhật thành công",
          placement: "topRight",
          duration: 3,
        });
        setEditingStoreId(null);
        fetchStores(currentPage);
      } else {
        notification.error({
          message: "Cập nhật thất bại",
          description: response?.message || "Không thể cập nhật cửa hàng",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error updating store:", error);
      notification.error({
        message: "Cập nhật thất bại",
        description: "Không thể cập nhật cửa hàng",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchStores(newPage);
    }
  };

  const handleLogoUpload = async (storeId, file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      notification.error({
        message: "Định dạng không hợp lệ",
        description: "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Kích thước file không được vượt quá 5MB",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    try {
      setUploadingMedia((prev) => ({
        ...prev,
        [storeId]: { ...prev[storeId], logo: true },
      }));

      const response = await uploadStoreLogoApi(storeId, file);
      if (response?.code === 1000) {
        notification.success({
          message: "Tải logo thành công",
          description: "Logo cửa hàng đã được cập nhật",
          placement: "topRight",
          duration: 3,
        });
        fetchStores(currentPage);
      } else {
        notification.error({
          message: "Tải logo thất bại",
          description: response?.message || "Không thể tải logo lên",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      notification.error({
        message: "Tải logo thất bại",
        description: "Không thể tải logo lên",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setUploadingMedia((prev) => ({
        ...prev,
        [storeId]: { ...prev[storeId], logo: false },
      }));
    }
  };

  const handleBannerUpload = async (storeId, file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      notification.error({
        message: "Định dạng không hợp lệ",
        description: "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Kích thước file không được vượt quá 5MB",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    try {
      setUploadingMedia((prev) => ({
        ...prev,
        [storeId]: { ...prev[storeId], banner: true },
      }));

      const response = await uploadStoreBannerApi(storeId, file);
      if (response?.code === 1000) {
        notification.success({
          message: "Tải banner thành công",
          description: "Banner cửa hàng đã được cập nhật",
          placement: "topRight",
          duration: 3,
        });
        fetchStores(currentPage);
      } else {
        notification.error({
          message: "Tải banner thất bại",
          description: response?.message || "Không thể tải banner lên",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      notification.error({
        message: "Tải banner thất bại",
        description: "Không thể tải banner lên",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setUploadingMedia((prev) => ({
        ...prev,
        [storeId]: { ...prev[storeId], banner: false },
      }));
    }
  };

  const toggleExpand = (storeId) => {
    setExpandedIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="seller-settings">
        <div className="loading-container">
          <Spin size="large" />
          <p className="loading-text">Đang tải danh sách cửa hàng...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (stores.length === 0) {
    return (
      <div className="seller-settings">
        <div className="empty-state">
          <ShopOutlined />
          <h3>Chưa có cửa hàng nào</h3>
          <p>
            Cửa hàng của bạn sẽ được tạo tự động sau khi hồ sơ người bán được
            phê duyệt bởi Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-settings">
      {/* Info Banner */}
      <div className="settings-info-banner">
        <InfoCircleOutlined />
        <div className="settings-info-content">
          <div className="settings-info-title">Quản lý cửa hàng</div>
          <div className="settings-info-text">
            Bạn hiện có <strong>{totalElements}</strong> cửa hàng.
            {totalElements === 0
              ? " Cửa hàng sẽ được tạo tự động sau khi hồ sơ được phê duyệt."
              : " Bạn có thể chỉnh sửa thông tin cửa hàng của mình."}
          </div>
        </div>
      </div>

      {/* Store List */}
      {stores.map((store) => {
        const isExpanded = expandedIds.includes(store.id);

        return (
          <div
            key={store.id}
            id={`store-${store.id}`}
            className="store-container"
          >
            {/* Compact View */}
            <div
              className="store-compact"
              onClick={() => toggleExpand(store.id)}
              style={{
                backgroundImage: store.bannerUrl
                  ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('${store.bannerUrl}')`
                  : undefined,
                backgroundSize: store.bannerUrl ? "cover" : undefined,
                backgroundPosition: store.bannerUrl ? "center" : undefined,
                backgroundRepeat: store.bannerUrl ? "no-repeat" : undefined,
              }}
            >
              <div className="compact-left">
                <div className="compact-logo">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt="Logo" />
                  ) : (
                    <ShopOutlined />
                  )}
                </div>
                <div className="compact-info">
                  <h3 className="compact-store-name">{store.storeName}</h3>
                  <div
                    className={`compact-status ${
                      store.isActive ? "active" : "inactive"
                    }`}
                  >
                    {store.isActive ? (
                      <>
                        <CheckCircleOutlined /> Đang hoạt động
                      </>
                    ) : (
                      <>
                        <ClockCircleOutlined /> Chưa kích hoạt
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="compact-right">
                <div className="compact-meta">
                  <span className="compact-date">
                    <ClockCircleOutlined />
                    {dayjs(store.createdAt).format("DD/MM/YYYY")}
                  </span>
                </div>
                <button className="expand-button" type="button">
                  {isExpanded ? <UpOutlined /> : <DownOutlined />}
                  {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                </button>
              </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
              <div className="store-expanded">
                {editingStoreId === store.id ? (
                  // Edit Mode
                  <form onSubmit={handleSubmit} className="store-form">
                    <div className="form-section-title">
                      <EditOutlined />
                      Chỉnh sửa thông tin cửa hàng
                    </div>

                    <div className="form-group">
                      <label htmlFor="storeName" className="form-label">
                        Tên cửa hàng <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="storeName"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="storeDescription" className="form-label">
                        Mô tả cửa hàng
                      </label>
                      <textarea
                        id="storeDescription"
                        name="storeDescription"
                        value={formData.storeDescription}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows="4"
                      />
                    </div>

                    {/* Read-only fields */}
                    <div className="form-info-section">
                      <div className="form-info-title">
                        <InfoCircleOutlined />
                        Thông tin liên hệ (không thể chỉnh sửa)
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            value={store.contactEmail}
                            className="form-input form-input-readonly"
                            readOnly
                            disabled
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Số điện thoại</label>
                          <input
                            type="tel"
                            value={store.contactPhone}
                            className="form-input form-input-readonly"
                            readOnly
                            disabled
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Địa chỉ cửa hàng</label>
                        <input
                          type="text"
                          value={store.shopAddress}
                          className="form-input form-input-readonly"
                          readOnly
                          disabled
                        />
                      </div>

                      {store.wardId && wardInfo[store.wardId] && (
                        <div className="form-location-info">
                          <div className="location-info-item">
                            <span className="location-info-label">
                              Xã/Phường:
                            </span>
                            <span className="location-info-value">
                              {wardInfo[store.wardId].nameWithType}
                            </span>
                          </div>
                          <div className="location-info-item">
                            <span className="location-info-label">
                              Tỉnh/Thành phố:
                            </span>
                            <span className="location-info-value">
                              {wardInfo[store.wardId].province?.fullName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="profile-btn profile-btn-secondary"
                      >
                        <CloseOutlined />
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="profile-btn profile-btn-primary"
                      >
                        <SaveOutlined />
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className="store-info-section">
                      {/* Banner Section */}
                      <div className="store-banner-section">
                        <div className="store-banner-wrapper">
                          {store.bannerUrl ? (
                            <img
                              src={store.bannerUrl}
                              alt="Store Banner"
                              className="store-banner-image"
                            />
                          ) : (
                            <div className="store-banner-placeholder">
                              <PictureOutlined />
                              <span>Chưa có banner</span>
                            </div>
                          )}
                          <button
                            type="button"
                            className="store-banner-upload"
                            onClick={() =>
                              bannerInputRefs.current[store.id]?.click()
                            }
                            disabled={uploadingMedia[store.id]?.banner}
                            title="Cập nhật banner cửa hàng (khuyến nghị 1200x400px)"
                          >
                            {uploadingMedia[store.id]?.banner ? (
                              <LoadingOutlined />
                            ) : (
                              <UploadOutlined />
                            )}
                          </button>
                          <input
                            ref={(el) =>
                              (bannerInputRefs.current[store.id] = el)
                            }
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleBannerUpload(store.id, file);
                              }
                              e.target.value = ""; // Reset input
                            }}
                            style={{ display: "none" }}
                          />
                        </div>
                      </div>

                      <div className="store-info-header">
                        <div className="store-logo-wrapper">
                          {store.logoUrl ? (
                            <img
                              src={store.logoUrl}
                              alt="Store Logo"
                              className="store-logo"
                            />
                          ) : (
                            <div className="store-logo-placeholder">
                              <ShopOutlined />
                            </div>
                          )}
                          <button
                            type="button"
                            className="store-logo-upload"
                            onClick={() =>
                              logoInputRefs.current[store.id]?.click()
                            }
                            disabled={uploadingMedia[store.id]?.logo}
                            title="Cập nhật logo cửa hàng"
                          >
                            {uploadingMedia[store.id]?.logo ? (
                              <LoadingOutlined />
                            ) : (
                              <UploadOutlined />
                            )}
                          </button>
                          <input
                            ref={(el) => (logoInputRefs.current[store.id] = el)}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleLogoUpload(store.id, file);
                              }
                              e.target.value = ""; // Reset input
                            }}
                            style={{ display: "none" }}
                          />
                        </div>

                        <div className="store-basic-info">
                          <h2 className="store-name">{store.storeName}</h2>

                          <div
                            className={`store-status-badge ${
                              store.isActive ? "active" : "inactive"
                            }`}
                          >
                            {store.isActive ? (
                              <>
                                <CheckCircleOutlined /> Đang hoạt động
                              </>
                            ) : (
                              <>
                                <ClockCircleOutlined /> Chưa kích hoạt
                              </>
                            )}
                          </div>

                          {store.storeDescription && (
                            <div className="store-description">
                              <ShopOutlined style={{ marginRight: "8px" }} />
                              {store.storeDescription}
                            </div>
                          )}

                          <div className="store-contact-info">
                            <div className="store-contact-item">
                              <MailOutlined />
                              <span>{store.contactEmail}</span>
                            </div>
                            <div className="store-contact-item">
                              <PhoneOutlined />
                              <span>{store.contactPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Info */}
                      <div className="store-address-section">
                        <div className="store-address-title">
                          <EnvironmentOutlined />
                          Địa chỉ cửa hàng
                        </div>
                        <div className="store-address-text">
                          {store.shopAddress}
                        </div>
                        {store.wardId && wardInfo[store.wardId] && (
                          <div className="store-location-details">
                            <div className="location-detail-item">
                              <span className="location-label">Xã/Phường:</span>
                              <span className="location-value">
                                {wardInfo[store.wardId].nameWithType}
                              </span>
                            </div>
                            <div className="location-detail-item">
                              <span className="location-label">
                                Tỉnh/Thành phố:
                              </span>
                              <span className="location-value">
                                {wardInfo[store.wardId].province?.fullName}
                              </span>
                            </div>
                          </div>
                        )}
                        {store.wardId && loadingWards[store.wardId] && (
                          <div className="location-loading">
                            <LoadingOutlined /> Đang tải thông tin địa chỉ...
                          </div>
                        )}
                      </div>

                      {/* Timestamps */}
                      <div className="timestamps-section">
                        <div className="timestamp-item">
                          <div className="timestamp-label">Ngày tạo</div>
                          <div className="timestamp-value">
                            <ClockCircleOutlined />
                            {dayjs(store.createdAt).format("DD/MM/YYYY HH:mm")}
                          </div>
                        </div>

                        <div className="timestamp-item">
                          <div className="timestamp-label">
                            Cập nhật lần cuối
                          </div>
                          <div className="timestamp-value">
                            <SyncOutlined />
                            {dayjs(store.updatedAt).fromNow()}
                          </div>
                        </div>

                        <div className="timestamp-item">
                          <div className="timestamp-label">Người dùng</div>
                          <div className="timestamp-value">
                            @{store.userName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="store-actions">
                      {!store.isActive ? (
                        <Tooltip title="Kích hoạt cửa hàng để sử dụng">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateStore(store.id);
                            }}
                            className="profile-btn profile-btn-activate"
                          >
                            <CheckCircleOutlined /> Kích hoạt
                          </button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Vô hiệu hóa cửa hàng">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeactivateStore(store.id);
                            }}
                            className="profile-btn profile-btn-danger"
                          >
                            <CloseOutlined /> Vô hiệu hóa
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip title="Chỉnh sửa thông tin cửa hàng">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStore(store);
                          }}
                          className="profile-btn profile-btn-secondary"
                        >
                          <EditOutlined /> Chỉnh sửa
                        </button>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            <LeftOutlined /> Trước
          </button>
          <span className="pagination-info">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="pagination-btn"
          >
            Sau <RightOutlined />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerSettingsPage;
