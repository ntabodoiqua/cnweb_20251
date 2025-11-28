import React, { useState, useEffect, useRef } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  PictureOutlined,
  UploadOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  FolderOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { notification, Modal, Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  getStoreCategoriesApi,
  createStoreCategoryApi,
  updateStoreCategoryApi,
  deleteStoreCategoryApi,
  uploadCategoryImageApi,
  getMyStoresApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./SellerCategoriesPage.module.css";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const SellerCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [uploadingImage, setUploadingImage] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const imageInputRefs = useRef({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch stores
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await getMyStoresApi(0, 100); // Get all stores

      if (response?.code === 1000) {
        const { content } = response.result;
        const activeStores = content?.filter((store) => store.isActive) || [];
        setStores(activeStores);

        // Auto-select first active store
        if (activeStores.length > 0 && !selectedStoreId) {
          setSelectedStoreId(activeStores[0].id);
        }
      } else {
        notification.error({
          message: "Tải danh sách cửa hàng thất bại",
          description: response?.message || "Không thể tải danh sách cửa hàng",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      notification.error({
        message: "Tải danh sách cửa hàng thất bại",
        description: "Không thể tải danh sách cửa hàng",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoadingStores(false);
    }
  };

  // Fetch categories for selected store
  const fetchCategories = async () => {
    if (!selectedStoreId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getStoreCategoriesApi(selectedStoreId);

      if (response?.code === 1000) {
        setCategories(response.result || []);
      } else {
        notification.error({
          message: "Tải danh mục thất bại",
          description: response?.message || "Không thể tải danh sách danh mục",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      notification.error({
        message: "Tải danh mục thất bại",
        description: "Không thể tải danh sách danh mục",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchCategories();
    }
  }, [selectedStoreId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!selectedStoreId) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn cửa hàng",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    try {
      const response = await createStoreCategoryApi(selectedStoreId, formData);
      if (response?.code === 1000) {
        notification.success({
          message: "Tạo danh mục thành công",
          description: "Danh mục đã được tạo thành công",
          placement: "topRight",
          duration: 3,
        });
        setShowCreateForm(false);
        fetchCategories();
      } else {
        notification.error({
          message: "Tạo danh mục thất bại",
          description: response?.message || "Không thể tạo danh mục",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      notification.error({
        message: "Tạo danh mục thất bại",
        description: "Không thể tạo danh mục",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    // Auto expand when editing
    if (!expandedIds.includes(category.id)) {
      setExpandedIds((prev) => [...prev, category.id]);
    }
    // Scroll to the category container
    setTimeout(() => {
      const element = document.getElementById(`category-${category.id}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategoryId || !selectedStoreId) return;

    try {
      const response = await updateStoreCategoryApi(
        selectedStoreId,
        editingCategoryId,
        formData
      );
      if (response?.code === 1000) {
        notification.success({
          message: "Cập nhật thành công",
          description: "Danh mục đã được cập nhật thành công",
          placement: "topRight",
          duration: 3,
        });
        setEditingCategoryId(null);
        fetchCategories();
      } else {
        notification.error({
          message: "Cập nhật thất bại",
          description: response?.message || "Không thể cập nhật danh mục",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      notification.error({
        message: "Cập nhật thất bại",
        description: "Không thể cập nhật danh mục",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    Modal.confirm({
      title: "Xác nhận xóa danh mục",
      content: `Bạn có chắc chắn muốn xóa danh mục "${categoryName}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!selectedStoreId) return;

        try {
          const response = await deleteStoreCategoryApi(
            selectedStoreId,
            categoryId
          );
          if (response?.code === 1000) {
            notification.success({
              message: "Xóa thành công",
              description: "Danh mục đã được xóa thành công",
              placement: "topRight",
              duration: 3,
            });
            fetchCategories();
          } else {
            notification.error({
              message: "Xóa thất bại",
              description: response?.message || "Không thể xóa danh mục",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          notification.error({
            message: "Xóa thất bại",
            description: "Không thể xóa danh mục",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const handleImageUpload = async (categoryId, file) => {
    if (!file || !selectedStoreId) return;

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
      setUploadingImage((prev) => ({
        ...prev,
        [categoryId]: true,
      }));

      const response = await uploadCategoryImageApi(
        selectedStoreId,
        categoryId,
        file
      );
      if (response?.code === 1000) {
        notification.success({
          message: "Tải ảnh thành công",
          description: "Ảnh danh mục đã được cập nhật",
          placement: "topRight",
          duration: 3,
        });
        fetchCategories();
      } else {
        notification.error({
          message: "Tải ảnh thất bại",
          description: response?.message || "Không thể tải ảnh lên",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      notification.error({
        message: "Tải ảnh thất bại",
        description: "Không thể tải ảnh lên",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setUploadingImage((prev) => ({
        ...prev,
        [categoryId]: false,
      }));
    }
  };

  const toggleExpand = (categoryId) => {
    setExpandedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStoreChange = (e) => {
    setSelectedStoreId(e.target.value);
    setShowCreateForm(false);
    setEditingCategoryId(null);
  };

  // Loading state for stores
  if (loadingStores) {
    return (
      <div className={styles.sellerCategories}>
        <LoadingSpinner tip="Đang tải thông tin..." fullScreen={false} />
      </div>
    );
  }

  // No stores state
  if (stores.length === 0) {
    return (
      <div className={styles.sellerCategories}>
        <div className={styles.emptyState}>
          <FolderOutlined />
          <h3>Chưa có cửa hàng nào</h3>
          <p>
            Bạn cần có ít nhất một cửa hàng đang hoạt động để quản lý danh mục.
          </p>
        </div>
      </div>
    );
  }

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <div className={styles.sellerCategories}>
      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <InfoCircleOutlined />
        <div className={styles.infoContent}>
          <div className={styles.infoTitle}>Quản lý danh mục sản phẩm</div>
          <div className={styles.infoText}>
            Tạo và quản lý danh mục sản phẩm cho cửa hàng của bạn. Danh mục giúp
            khách hàng dễ dàng tìm kiếm sản phẩm.
          </div>
        </div>
      </div>

      {/* Store Selector */}
      <div className={styles.storeSelectorSection}>
        <label htmlFor="store-select" className={styles.storeSelectorLabel}>
          <FolderOutlined /> Chọn cửa hàng:
        </label>
        <select
          id="store-select"
          value={selectedStoreId || ""}
          onChange={handleStoreChange}
          className={styles.storeSelector}
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.storeName}
            </option>
          ))}
        </select>
        {selectedStore && (
          <div className={styles.selectedStoreInfo}>
            <span className={styles.storeBadge}>
              <CheckCircleOutlined /> {selectedStore.storeName}
            </span>
            <span className={styles.categoryCount}>
              {categories.length} danh mục
            </span>
          </div>
        )}
      </div>

      {/* Create Category Button */}
      {!showCreateForm && (
        <div className={styles.createCategorySection}>
          <button
            onClick={handleShowCreateForm}
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
          >
            <PlusOutlined /> Tạo danh mục mới
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className={styles.categoryCreateForm}>
          <form onSubmit={handleCreateCategory} className={styles.categoryForm}>
            <div className={styles.formSectionTitle}>
              <PlusOutlined />
              Tạo danh mục mới
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Tên danh mục <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Nhập tên danh mục..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Mô tả danh mục
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                placeholder="Nhập mô tả danh mục..."
                rows="4"
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleCancelCreate}
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
                Tạo danh mục
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner
          tip="Đang tải danh sách danh mục..."
          fullScreen={false}
        />
      ) : (
        <>
          {/* Categories List */}
          {categories.length === 0 ? (
            <div className={styles.emptyState}>
              <AppstoreOutlined />
              <h3>Chưa có danh mục nào</h3>
              <p>Tạo danh mục đầu tiên để bắt đầu phân loại sản phẩm.</p>
            </div>
          ) : (
            categories.map((category) => {
              const isExpanded = expandedIds.includes(category.id);

              return (
                <div
                  key={category.id}
                  id={`category-${category.id}`}
                  className={styles.categoryContainer}
                >
                  {/* Compact View */}
                  <div
                    className={styles.categoryCompact}
                    onClick={() => toggleExpand(category.id)}
                  >
                    <div className={styles.compactLeft}>
                      <div className={styles.compactImage}>
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} />
                        ) : (
                          <AppstoreOutlined />
                        )}
                      </div>
                      <div className={styles.compactInfo}>
                        <h3 className={styles.compactCategoryName}>
                          {category.name}
                        </h3>
                        <div className={styles.compactMeta}>
                          <span className={styles.compactProductCount}>
                            <FolderOutlined /> {category.productCount} sản phẩm
                          </span>
                          {category.active && (
                            <span
                              className={`${styles.compactStatus} ${styles.active}`}
                            >
                              <CheckCircleOutlined /> Hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.compactRight}>
                      <div className={styles.compactMetaInfo}>
                        <span className={styles.compactDate}>
                          <ClockCircleOutlined />
                          {dayjs(category.createdAt).format("DD/MM/YYYY")}
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
                    <div className={styles.categoryExpanded}>
                      {editingCategoryId === category.id ? (
                        // Edit Mode
                        <form
                          onSubmit={handleUpdateCategory}
                          className={styles.categoryForm}
                        >
                          <div className={styles.formSectionTitle}>
                            <EditOutlined />
                            Chỉnh sửa danh mục
                          </div>

                          <div className={styles.formGroup}>
                            <label
                              htmlFor="edit-name"
                              className={styles.formLabel}
                            >
                              Tên danh mục{" "}
                              <span className={styles.required}>*</span>
                            </label>
                            <input
                              type="text"
                              id="edit-name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className={styles.formInput}
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label
                              htmlFor="edit-description"
                              className={styles.formLabel}
                            >
                              Mô tả danh mục
                            </label>
                            <textarea
                              id="edit-description"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              className={styles.formTextarea}
                              rows="4"
                            />
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
                          <div className={styles.categoryInfoSection}>
                            {/* Image Section */}
                            <div className={styles.categoryImageSection}>
                              <div className={styles.categoryImageWrapper}>
                                {category.imageUrl ? (
                                  <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className={styles.categoryImage}
                                  />
                                ) : (
                                  <div
                                    className={styles.categoryImagePlaceholder}
                                  >
                                    <PictureOutlined />
                                    <span>Chưa có ảnh</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className={styles.categoryImageUpload}
                                  onClick={() =>
                                    imageInputRefs.current[category.id]?.click()
                                  }
                                  disabled={uploadingImage[category.id]}
                                  title="Cập nhật ảnh danh mục"
                                >
                                  {uploadingImage[category.id] ? (
                                    <LoadingOutlined />
                                  ) : (
                                    <UploadOutlined />
                                  )}
                                </button>
                                <input
                                  ref={(el) =>
                                    (imageInputRefs.current[category.id] = el)
                                  }
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleImageUpload(category.id, file);
                                    }
                                    e.target.value = ""; // Reset input
                                  }}
                                  style={{ display: "none" }}
                                />
                              </div>
                            </div>

                            {/* Category Details */}
                            <div className={styles.categoryDetails}>
                              <h2 className={styles.categoryName}>
                                {category.name}
                              </h2>

                              {category.description && (
                                <div className={styles.categoryDescription}>
                                  <AppstoreOutlined
                                    style={{ marginRight: "8px" }}
                                  />
                                  {category.description}
                                </div>
                              )}

                              <div className={styles.categoryMetaGrid}>
                                <div className={styles.metaItem}>
                                  <div className={styles.metaLabel}>
                                    Số sản phẩm
                                  </div>
                                  <div className={styles.metaValue}>
                                    <FolderOutlined />
                                    {category.productCount} sản phẩm
                                  </div>
                                </div>

                                <div className={styles.metaItem}>
                                  <div className={styles.metaLabel}>
                                    Trạng thái
                                  </div>
                                  <div className={styles.metaValue}>
                                    {category.active ? (
                                      <span
                                        className={`${styles.statusBadge} ${styles.active}`}
                                      >
                                        <CheckCircleOutlined /> Hoạt động
                                      </span>
                                    ) : (
                                      <span
                                        className={`${styles.statusBadge} ${styles.inactive}`}
                                      >
                                        <ExclamationCircleOutlined /> Không hoạt
                                        động
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.metaItem}>
                                  <div className={styles.metaLabel}>
                                    Ngày tạo
                                  </div>
                                  <div className={styles.metaValue}>
                                    <ClockCircleOutlined />
                                    {dayjs(category.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  </div>
                                </div>

                                <div className={styles.metaItem}>
                                  <div className={styles.metaLabel}>
                                    Cập nhật lần cuối
                                  </div>
                                  <div className={styles.metaValue}>
                                    <SyncOutlined />
                                    {dayjs(category.updatedAt).fromNow()}
                                  </div>
                                </div>

                                <div className={styles.metaItem}>
                                  <div className={styles.metaLabel}>
                                    Người tạo
                                  </div>
                                  <div className={styles.metaValue}>
                                    @{category.createdBy}
                                  </div>
                                </div>

                                {category.level !== undefined && (
                                  <div className={styles.metaItem}>
                                    <div className={styles.metaLabel}>
                                      Cấp độ
                                    </div>
                                    <div className={styles.metaValue}>
                                      Cấp {category.level}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className={styles.categoryActions}>
                            <Tooltip title="Chỉnh sửa danh mục">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategory(category);
                                }}
                                className={`${styles.profileBtn} ${styles.profileBtnSecondary}`}
                              >
                                <EditOutlined /> Chỉnh sửa
                              </button>
                            </Tooltip>
                            <Tooltip title="Xóa danh mục">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(
                                    category.id,
                                    category.name
                                  );
                                }}
                                className={`${styles.profileBtn} ${styles.profileBtnDanger}`}
                              >
                                <DeleteOutlined /> Xóa
                              </button>
                            </Tooltip>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default SellerCategoriesPage;
