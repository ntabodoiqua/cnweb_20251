import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  UploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  getPlatformBannersApi,
  createPlatformBannerApi,
  updatePlatformBannerApi,
  deletePlatformBannerApi,
  updatePlatformBannerDisplayOrderApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminBannersPage.module.css";

/**
 * AdminBannersPage - Trang quản lý Banner Slides
 * Hiển thị danh sách banner platform và các thao tác quản lý
 */
const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getPlatformBannersApi();

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
          await deletePlatformBannerApi(bannerId);
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
      await updatePlatformBannerDisplayOrderApi(bannerOrders);
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
        await updatePlatformBannerApi(
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
        await createPlatformBannerApi(formData.file, formData.displayOrder);
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

  return (
    <div className={styles.adminBanners}>
      {/* Toolbar */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <h2 className={styles.pageTitle}>Quản lý Banner Slides</h2>
          <div className={styles.toolbarActions}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleAddBanner}
            >
              <PlusOutlined />
              Thêm banner
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={fetchBanners}
            >
              <ReloadOutlined />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách banner ({banners.length})
        </h2>

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
                    <span>Thứ tự: {banner.displayOrder}</span>
                    {banner.imageName && <span>Tên: {banner.imageName}</span>}
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
            <p>Chưa có banner nào</p>
            <button
              className="admin-btn admin-btn-primary"
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
                  <label>Loại:</label>
                  <span>
                    {selectedBanner.storeId
                      ? "Store Banner"
                      : "Platform Banner"}
                  </span>
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
                          <small>Khuyến nghị kích thước: 1920x500px</small>
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
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowBannerForm(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
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

export default AdminBannersPage;
