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
import { Modal, Tooltip, notification } from "antd";
import {
  getMyStoresApi,
  updateStoreApi,
  activateStoreApi,
  deactivateStoreApi,
  getWardInfoApi,
  uploadStoreLogoApi,
  uploadStoreBannerApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./SellerSettingsPage.module.css";

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
      <div className={styles.sellerSettings}>
        <LoadingSpinner
          tip="Đang tải danh sách cửa hàng..."
          fullScreen={false}
        />
      </div>
    );
  }

  // Empty state
  if (stores.length === 0) {
    return (
      <div className={styles.sellerSettings}>
        <div className={styles.emptyState}>
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
    <div className={styles.sellerSettings}>
      {/* Info Banner */}
      <div className={styles.settingsInfoBanner}>
        <InfoCircleOutlined />
        <div className={styles.settingsInfoContent}>
          <div className={styles.settingsInfoTitle}>Quản lý cửa hàng</div>
          <div className={styles.settingsInfoText}>
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
            className={styles.storeContainer}
          >
            {/* Compact View */}
            <div
              className={styles.storeCompact}
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
              <div className={styles.compactLeft}>
                <div className={styles.compactLogo}>
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt="Logo" />
                  ) : (
                    <ShopOutlined />
                  )}
                </div>
                <div className={styles.compactInfo}>
                  <h3 className={styles.compactStoreName}>{store.storeName}</h3>
                  <div
                    className={`${styles.compactStatus} ${
                      store.isActive ? styles.active : styles.inactive
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

              <div className={styles.compactRight}>
                <div className={styles.compactMeta}>
                  <span className={styles.compactDate}>
                    <ClockCircleOutlined />
                    {dayjs(store.createdAt).format("DD/MM/YYYY")}
                  </span>
                </div>
                <button className={styles.expandButton} type="button">
                  {isExpanded ? <UpOutlined /> : <DownOutlined />}
                  {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                </button>
              </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
              <div className={styles.storeExpanded}>
                {editingStoreId === store.id ? (
                  // Edit Mode
                  <form onSubmit={handleSubmit} className={styles.storeForm}>
                    <div className={styles.formSectionTitle}>
                      <EditOutlined />
                      Chỉnh sửa thông tin cửa hàng
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="storeName" className={styles.formLabel}>
                        Tên cửa hàng <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="storeName"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label
                        htmlFor="storeDescription"
                        className={styles.formLabel}
                      >
                        Mô tả cửa hàng
                      </label>
                      <textarea
                        id="storeDescription"
                        name="storeDescription"
                        value={formData.storeDescription}
                        onChange={handleInputChange}
                        className={styles.formTextarea}
                        rows="4"
                      />
                    </div>

                    {/* Read-only fields */}
                    <div className={styles.formInfoSection}>
                      <div className={styles.formInfoTitle}>
                        <InfoCircleOutlined />
                        Thông tin liên hệ (không thể chỉnh sửa)
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Email</label>
                          <input
                            type="email"
                            value={store.contactEmail}
                            className={`${styles.formInput} ${styles.formInputReadonly}`}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={store.contactPhone}
                            className={`${styles.formInput} ${styles.formInputReadonly}`}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Địa chỉ cửa hàng
                        </label>
                        <input
                          type="text"
                          value={store.shopAddress}
                          className={`${styles.formInput} ${styles.formInputReadonly}`}
                          readOnly
                          disabled
                        />
                      </div>

                      {store.wardId && wardInfo[store.wardId] && (
                        <div className={styles.formLocationInfo}>
                          <div className={styles.locationInfoItem}>
                            <span className={styles.locationInfoLabel}>
                              Xã/Phường:
                            </span>
                            <span className={styles.locationInfoValue}>
                              {wardInfo[store.wardId].nameWithType}
                            </span>
                          </div>
                          <div className={styles.locationInfoItem}>
                            <span className={styles.locationInfoLabel}>
                              Tỉnh/Thành phố:
                            </span>
                            <span className={styles.locationInfoValue}>
                              {wardInfo[store.wardId].province?.fullName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`${styles.profileBtn} ${styles.profileBtnSecondary}`}
                      >
                        <CloseOutlined />
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
                      >
                        <SaveOutlined />
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className={styles.storeInfoSection}>
                      {/* Banner Section */}
                      <div className={styles.storeBannerSection}>
                        <div className={styles.storeBannerWrapper}>
                          {store.bannerUrl ? (
                            <img
                              src={store.bannerUrl}
                              alt="Store Banner"
                              className={styles.storeBannerImage}
                            />
                          ) : (
                            <div className={styles.storeBannerPlaceholder}>
                              <PictureOutlined />
                              <span>Chưa có banner</span>
                            </div>
                          )}
                          <button
                            type="button"
                            className={styles.storeBannerUpload}
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

                      <div className={styles.storeInfoHeader}>
                        <div className={styles.storeLogoWrapper}>
                          {store.logoUrl ? (
                            <img
                              src={store.logoUrl}
                              alt="Store Logo"
                              className={styles.storeLogo}
                            />
                          ) : (
                            <div className={styles.storeLogoPlaceholder}>
                              <ShopOutlined />
                            </div>
                          )}
                          <button
                            type="button"
                            className={styles.storeLogoUpload}
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

                        <div className={styles.storeBasicInfo}>
                          <h2 className={styles.storeName}>
                            {store.storeName}
                          </h2>

                          <div
                            className={`${styles.storeStatusBadge} ${
                              store.isActive ? styles.active : styles.inactive
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
                            <div className={styles.storeDescription}>
                              <ShopOutlined style={{ marginRight: "8px" }} />
                              {store.storeDescription}
                            </div>
                          )}

                          <div className={styles.storeContactInfo}>
                            <div className={styles.storeContactItem}>
                              <MailOutlined />
                              <span>{store.contactEmail}</span>
                            </div>
                            <div className={styles.storeContactItem}>
                              <PhoneOutlined />
                              <span>{store.contactPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Info */}
                      <div className={styles.storeAddressSection}>
                        <div className={styles.storeAddressTitle}>
                          <EnvironmentOutlined />
                          Địa chỉ cửa hàng
                        </div>
                        <div className={styles.storeAddressText}>
                          {store.shopAddress}
                        </div>
                        {store.wardId && wardInfo[store.wardId] && (
                          <div className={styles.storeLocationDetails}>
                            <div className={styles.locationDetailItem}>
                              <span className={styles.locationLabel}>
                                Xã/Phường:
                              </span>
                              <span className={styles.locationValue}>
                                {wardInfo[store.wardId].nameWithType}
                              </span>
                            </div>
                            <div className={styles.locationDetailItem}>
                              <span className={styles.locationLabel}>
                                Tỉnh/Thành phố:
                              </span>
                              <span className={styles.locationValue}>
                                {wardInfo[store.wardId].province?.fullName}
                              </span>
                            </div>
                          </div>
                        )}
                        {store.wardId && loadingWards[store.wardId] && (
                          <div className={styles.locationLoading}>
                            <LoadingOutlined /> Đang tải thông tin địa chỉ...
                          </div>
                        )}
                      </div>

                      {/* Timestamps */}
                      <div className={styles.timestampsSection}>
                        <div className={styles.timestampItem}>
                          <div className={styles.timestampLabel}>Ngày tạo</div>
                          <div className={styles.timestampValue}>
                            <ClockCircleOutlined />
                            {dayjs(store.createdAt).format("DD/MM/YYYY HH:mm")}
                          </div>
                        </div>

                        <div className={styles.timestampItem}>
                          <div className={styles.timestampLabel}>
                            Cập nhật lần cuối
                          </div>
                          <div className={styles.timestampValue}>
                            <SyncOutlined />
                            {dayjs(store.updatedAt).fromNow()}
                          </div>
                        </div>

                        <div className={styles.timestampItem}>
                          <div className={styles.timestampLabel}>
                            Người dùng
                          </div>
                          <div className={styles.timestampValue}>
                            @{store.userName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.storeActions}>
                      {!store.isActive ? (
                        <Tooltip title="Kích hoạt cửa hàng để sử dụng">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateStore(store.id);
                            }}
                            className={`${styles.profileBtn} ${styles.profileBtnActivate}`}
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
                            className={`${styles.profileBtn} ${styles.profileBtnDanger}`}
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
                          className={`${styles.profileBtn} ${styles.profileBtnSecondary}`}
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
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={styles.paginationBtn}
          >
            <LeftOutlined /> Trước
          </button>
          <span className={styles.paginationInfo}>
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={styles.paginationBtn}
          >
            Sau <RightOutlined />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerSettingsPage;
