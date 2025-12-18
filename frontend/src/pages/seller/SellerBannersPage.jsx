import { useState, useEffect, useMemo } from "react";
import { notification, Modal, Select } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  UploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShopOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import {
  getMyStoreBannersApi,
  createStoreBannerApi,
  updateStoreBannerApi,
  deleteStoreBannerApi,
  updateStoreBannerDisplayOrderApi,
  getMyStoresApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./SellerBannersPage.module.css";

/**
 * SellerBannersPage - Trang quản lý Banner cho Seller
 * Hiển thị danh sách banner của store và các thao tác quản lý
 */
const SellerBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showBannerDetail, setShowBannerDetail] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data for creating/editing banner
  const [formData, setFormData] = useState({
    displayOrder: 1,
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  // Get selected store name
  const selectedStoreName = useMemo(() => {
    const store = stores.find((s) => s.id === selectedStoreId);
    return store?.storeName || "";
  }, [stores, selectedStoreId]);

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Fetch banners when store is selected
  useEffect(() => {
    if (selectedStoreId) {
      fetchBanners();
    }
  }, [selectedStoreId]);

  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const response = await getMyStoresApi(0, 100);
      if (response && response.code === 1000) {
        const activeStores = (response.result?.content || []).filter(
          (store) => store.isActive
        );
        setStores(activeStores);
        // Auto-select first store if available
        if (activeStores.length > 0) {
          setSelectedStoreId(activeStores[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách cửa hàng",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchBanners = async () => {
    if (!selectedStoreId) return;

    try {
      setLoading(true);
      const response = await getMyStoreBannersApi(selectedStoreId);

      if (response && response.code === 1000) {
        // Sort by displayOrder
        const sortedBanners = (response.result || []).sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        setBanners(sortedBanners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách banner",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewBanner = (banner) => {
    setSelectedBanner(banner);
    setShowBannerDetail(true);
  };

  const handleAddBanner = () => {
    // Calculate next display order
    const maxOrder = banners.reduce(
      (max, b) => Math.max(max, b.displayOrder || 0),
      0
    );
    setFormData({
      displayOrder: maxOrder + 1,
      file: null,
    });
    setPreviewUrl(null);
    setSelectedBanner(null);
    setShowBannerForm(true);
  };

  const handleEditBanner = (banner) => {
    setFormData({
      displayOrder: banner.displayOrder,
      file: null,
    });
    setPreviewUrl(banner.imageUrl);
    setSelectedBanner(banner);
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa banner này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteStoreBannerApi(selectedStoreId, bannerId);
          notification.success({
            message: "Thành công",
            description: "Xóa banner thành công!",
            placement: "topRight",
            duration: 3,
          });
          fetchBanners();
        } catch (error) {
          console.error("Error deleting banner:", error);
          notification.error({
            message: "Lỗi xóa banner",
            description:
              error.response?.data?.message || "Không thể xóa banner",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;

    const newBanners = [...banners];
    const currentBanner = newBanners[index];
    const prevBanner = newBanners[index - 1];

    // Swap display orders
    const tempOrder = currentBanner.displayOrder;
    currentBanner.displayOrder = prevBanner.displayOrder;
    prevBanner.displayOrder = tempOrder;

    // Swap positions in array
    [newBanners[index], newBanners[index - 1]] = [
      newBanners[index - 1],
      newBanners[index],
    ];

    setBanners(newBanners);
    await updateDisplayOrder(newBanners);
  };

  const handleMoveDown = async (index) => {
    if (index === banners.length - 1) return;

    const newBanners = [...banners];
    const currentBanner = newBanners[index];
    const nextBanner = newBanners[index + 1];

    // Swap display orders
    const tempOrder = currentBanner.displayOrder;
    currentBanner.displayOrder = nextBanner.displayOrder;
    nextBanner.displayOrder = tempOrder;

    // Swap positions in array
    [newBanners[index], newBanners[index + 1]] = [
      newBanners[index + 1],
      newBanners[index],
    ];

    setBanners(newBanners);
    await updateDisplayOrder(newBanners);
  };

  const updateDisplayOrder = async (updatedBanners) => {
    try {
      const bannerOrders = updatedBanners.map((b, idx) => ({
        bannerId: b.id,
        displayOrder: idx + 1,
      }));
      await updateStoreBannerDisplayOrderApi(selectedStoreId, bannerOrders);
      notification.success({
        message: "Thành công",
        description: "Cập nhật thứ tự hiển thị thành công!",
        placement: "topRight",
        duration: 2,
      });
    } catch (error) {
      console.error("Error updating display order:", error);
      notification.error({
        message: "Lỗi cập nhật thứ tự",
        description:
          error.response?.data?.message || "Không thể cập nhật thứ tự hiển thị",
        placement: "topRight",
        duration: 3,
      });
      fetchBanners(); // Reload to get correct order
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validate file for new banner
    if (!selectedBanner && !formData.file) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn ảnh banner",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (selectedBanner) {
        // Update existing banner
        await updateStoreBannerApi(
          selectedStoreId,
          selectedBanner.id,
          formData.displayOrder,
          formData.file
        );
        notification.success({
          message: "Thành công",
          description: "Cập nhật banner thành công!",
          placement: "topRight",
          duration: 3,
        });
      } else {
        // Create new banner
        await createStoreBannerApi(
          selectedStoreId,
          formData.file,
          formData.displayOrder
        );
        notification.success({
          message: "Thành công",
          description: "Tạo banner thành công!",
          placement: "topRight",
          duration: 3,
        });
      }

      setShowBannerForm(false);
      fetchBanners();
    } catch (error) {
      console.error("Error submitting banner:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi lưu banner";
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading khi đang fetch stores
  if (storesLoading) {
    return (
      <div className={styles.sellerBanners}>
        <LoadingSpinner tip="Đang tải cửa hàng..." fullScreen={false} />
      </div>
    );
  }

  // Chưa có cửa hàng nào
  if (stores.length === 0) {
    return (
      <div className={styles.sellerBanners}>
        <div className={styles.emptyState}>
          <ShopOutlined className={styles.emptyIcon} />
          <h3>Bạn chưa có cửa hàng nào được kích hoạt</h3>
          <p>Vui lòng tạo và kích hoạt cửa hàng trước khi quản lý banner</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sellerBanners}>
      {/* Header Section */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            {selectedStoreName && (
              <>
                <PictureOutlined className={styles.titleIcon} />
                Banner - {selectedStoreName}
              </>
            )}
            {!selectedStoreName && (
              <>
                <PictureOutlined className={styles.titleIcon} />
                Quản lý Banner
              </>
            )}
          </h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.storeSelector}>
            <label>Cửa hàng:</label>
            <Select
              value={selectedStoreId}
              onChange={(value) => setSelectedStoreId(value)}
              style={{ width: 220 }}
              placeholder="Chọn cửa hàng"
              optionLabelProp="label"
            >
              {stores.map((store) => (
                <Select.Option
                  key={store.id}
                  value={store.id}
                  label={store.storeName}
                >
                  {store.storeName}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.resultCount}>
            Tổng cộng <strong>{banners.length}</strong> banner
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <button
            className={`${styles.sellerBtn} ${styles.sellerBtnSecondary}`}
            onClick={fetchBanners}
            disabled={!selectedStoreId}
          >
            <ReloadOutlined />
            Làm mới
          </button>
          <button
            className={`${styles.sellerBtn} ${styles.sellerBtnPrimary}`}
            onClick={handleAddBanner}
            disabled={!selectedStoreId}
          >
            <PlusOutlined />
            Thêm banner
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className={styles.bannersSection}>
        {loading ? (
          <LoadingSpinner
            tip="Đang tải danh sách banner..."
            fullScreen={false}
          />
        ) : banners.length > 0 ? (
          <div className={styles.bannersGrid}>
            {banners.map((banner, index) => (
              <div key={banner.id} className={styles.bannerCard}>
                <div className={styles.bannerImage}>
                  <img src={banner.imageUrl} alt={`Banner ${index + 1}`} />
                  <div className={styles.bannerOrder}>
                    {banner.displayOrder}
                  </div>
                </div>
                <div className={styles.bannerInfo}>
                  <div className={styles.bannerMeta}>
                    <span className={styles.bannerMetaItem}>
                      Thứ tự: <strong>{banner.displayOrder}</strong>
                    </span>
                    {banner.imageName && (
                      <span className={styles.bannerMetaItem}>
                        Tên: {banner.imageName}
                      </span>
                    )}
                  </div>
                  <div className={styles.bannerActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.moveUp}`}
                      title="Di chuyển lên"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.moveDown}`}
                      title="Di chuyển xuống"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === banners.length - 1}
                    >
                      <ArrowDownOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.view}`}
                      title="Xem chi tiết"
                      onClick={() => handleViewBanner(banner)}
                    >
                      <EyeOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.edit}`}
                      title="Chỉnh sửa"
                      onClick={() => handleEditBanner(banner)}
                    >
                      <EditOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.delete}`}
                      title="Xóa"
                      onClick={() => handleDeleteBanner(banner.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PictureOutlined className={styles.emptyIcon} />
            <h3>Chưa có banner nào</h3>
            <p>Thêm banner để quảng cáo sản phẩm của cửa hàng</p>
            <button
              className={`${styles.sellerBtn} ${styles.sellerBtnPrimary}`}
              onClick={handleAddBanner}
            >
              <PlusOutlined />
              Thêm banner đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Banner Detail Modal */}
      {showBannerDetail && selectedBanner && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowBannerDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết Banner</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowBannerDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.bannerDetailImage}>
                <img src={selectedBanner.imageUrl} alt="Banner preview" />
              </div>
              <div className={styles.bannerDetailInfo}>
                <div className={styles.infoRow}>
                  <label>ID:</label>
                  <span>{selectedBanner.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Tên ảnh:</label>
                  <span>{selectedBanner.imageName || "N/A"}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Thứ tự hiển thị:</label>
                  <span>{selectedBanner.displayOrder}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Cửa hàng:</label>
                  <span>{selectedStoreName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Form Modal */}
      {showBannerForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowBannerForm(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>{selectedBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowBannerForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitForm} className={styles.bannerForm}>
                <div className={styles.formGroup}>
                  <label>Ảnh Banner *</label>
                  <div className={styles.uploadArea}>
                    {previewUrl ? (
                      <div className={styles.previewContainer}>
                        <img src={previewUrl} alt="Preview" />
                        <button
                          type="button"
                          className={styles.changeImageBtn}
                          onClick={() => {
                            setPreviewUrl(null);
                            setFormData({ ...formData, file: null });
                          }}
                        >
                          Thay đổi ảnh
                        </button>
                      </div>
                    ) : (
                      <label className={styles.uploadLabel}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={styles.fileInput}
                        />
                        <div className={styles.uploadPlaceholder}>
                          <UploadOutlined />
                          <span>Chọn ảnh banner</span>
                          <small>Khuyến nghị kích thước: 1200x400px</small>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Nhập thứ tự hiển thị"
                  />
                  <small className={styles.formHint}>
                    Banner có thứ tự nhỏ hơn sẽ hiển thị trước
                  </small>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={`${styles.sellerBtn} ${styles.sellerBtnSecondary}`}
                    onClick={() => setShowBannerForm(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`${styles.sellerBtn} ${styles.sellerBtnPrimary}`}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Đang xử lý..."
                      : selectedBanner
                      ? "Cập nhật"
                      : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerBannersPage;
