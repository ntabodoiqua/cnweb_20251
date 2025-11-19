import { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileImageOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import {
  getCategoriesAdminApi,
  createCategoryAdminApi,
  updateCategoryAdminApi,
  deleteCategoryAdminApi,
  toggleCategoryStatusApi,
  uploadCategoryImageAdminApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminCategoriesPage.module.css";

/**
 * AdminCategoriesPage - Trang quản lý danh mục sàn
 * Hiển thị danh sách danh mục và các thao tác quản lý
 */
const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    level: "",
    active: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDetail, setShowCategoryDetail] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null,
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesAdminApi();

      if (response && response.code === 1000) {
        setCategories(response.result || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Lỗi khi tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = filterCategories(categories);
    console.log("Filtered categories:", filtered);
  };

  const filterCategories = (categoriesList) => {
    let result = [...categoriesList];

    if (filters.name) {
      result = result.filter((cat) =>
        cat.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.level !== "") {
      const levelFilter = parseInt(filters.level);
      result = result.filter((cat) => cat.level === levelFilter);
    }

    if (filters.active !== "") {
      const activeFilter = filters.active === "true";
      result = result.filter((cat) => cat.active === activeFilter);
    }

    return result;
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      level: "",
      active: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryDetail(true);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryName}"?`)) {
      try {
        const response = await deleteCategoryAdminApi(categoryId);
        if (response && response.code === 1000) {
          alert("Xóa danh mục thành công!");
          fetchCategories();
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.message || "Lỗi khi xóa danh mục!");
      }
    }
  };

  const handleToggleStatus = async (
    categoryId,
    categoryName,
    currentStatus
  ) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn ${
          currentStatus ? "vô hiệu hóa" : "kích hoạt"
        } danh mục "${categoryName}"?`
      )
    ) {
      try {
        const response = await toggleCategoryStatusApi(categoryId);
        if (response && response.code === 1000) {
          alert(
            `${
              currentStatus ? "Vô hiệu hóa" : "Kích hoạt"
            } danh mục thành công!`
          );
          fetchCategories();
        }
      } catch (error) {
        console.error("Error toggling category status:", error);
        alert(
          error.response?.data?.message ||
            "Lỗi khi thay đổi trạng thái danh mục!"
        );
      }
    }
  };

  const handleOpenCreateForm = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      description: "",
      parentId: null,
      imageFile: null,
    });
    setImagePreview(null);
    setShowCategoryForm(true);
  };

  const handleOpenEditForm = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || null,
      imageFile: null,
    });
    setImagePreview(category.imageUrl);
    setShowCategoryForm(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parentId: formData.parentId || null,
      };

      let response;
      if (isEditMode) {
        response = await updateCategoryAdminApi(
          selectedCategory.id,
          categoryData
        );
      } else {
        response = await createCategoryAdminApi(categoryData);
      }

      if (response && response.code === 1000) {
        const categoryId = isEditMode
          ? selectedCategory.id
          : response.result.id;

        // Upload image if selected
        if (formData.imageFile) {
          try {
            await uploadCategoryImageAdminApi(categoryId, formData.imageFile);
          } catch (imageError) {
            console.error("Error uploading image:", imageError);
            alert("Danh mục đã được lưu nhưng có lỗi khi tải ảnh lên!");
          }
        }

        alert(`${isEditMode ? "Cập nhật" : "Tạo"} danh mục thành công!`);
        setShowCategoryForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert(
        error.response?.data?.message ||
          `Lỗi khi ${isEditMode ? "cập nhật" : "tạo"} danh mục!`
      );
    }
  };

  const renderCategoryTree = (categoryList, level = 0) => {
    const filtered = filterCategories(categoryList);
    const rows = [];

    filtered.forEach((category) => {
      rows.push(
        <tr key={category.id}>
          <td>
            <div
              className={styles.categoryInfo}
              style={{ paddingLeft: `${level * 30}px` }}
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className={styles.categoryImage}
                />
              ) : (
                <div className={styles.categoryImagePlaceholder}>
                  <AppstoreOutlined />
                </div>
              )}
              <div>
                <strong>{category.name}</strong>
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <div className={styles.subCategoryBadge}>
                      <FolderOutlined /> {category.subCategories.length} danh
                      mục con
                    </div>
                  )}
              </div>
            </div>
          </td>
          <td>
            <span className={styles.levelBadge}>Cấp {category.level}</span>
          </td>
          <td>{category.parentName || "—"}</td>
          <td>
            <div className={styles.descriptionCell}>
              {category.description || "—"}
            </div>
          </td>
          <td className={styles.centerAlign}>{category.productCount || 0}</td>
          <td className={styles.centerAlign}>
            <span
              className={`${styles.statusBadge} ${
                category.active ? styles.statusActive : styles.statusInactive
              }`}
              title={category.active ? "Hoạt động" : "Vô hiệu hóa"}
            >
              {category.active ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )}
            </span>
          </td>
          <td>{formatDate(category.createdAt)}</td>
          <td>{category.createdBy || "—"}</td>
          <td className={styles.stickyColumn}>
            <div className={styles.adminActionButtons}>
              <button
                className={`${styles.adminActionBtn} ${styles.view}`}
                title="Xem chi tiết"
                onClick={() => handleViewCategory(category)}
              >
                <EyeOutlined />
              </button>
              <button
                className={`${styles.adminActionBtn} ${styles.edit}`}
                title="Chỉnh sửa"
                onClick={() => handleOpenEditForm(category)}
              >
                <EditOutlined />
              </button>
              <button
                className={`${styles.adminActionBtn} ${
                  category.active ? styles.lock : styles.unlock
                }`}
                title={category.active ? "Vô hiệu hóa" : "Kích hoạt"}
                onClick={() =>
                  handleToggleStatus(
                    category.id,
                    category.name,
                    category.active
                  )
                }
              >
                {category.active ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )}
              </button>
              <button
                className={`${styles.adminActionBtn} ${styles.delete}`}
                title="Xóa"
                onClick={() => handleDeleteCategory(category.id, category.name)}
              >
                <DeleteOutlined />
              </button>
            </div>
          </td>
        </tr>
      );

      // Add sub-categories recursively
      if (category.subCategories && category.subCategories.length > 0) {
        rows.push(...renderCategoryTree(category.subCategories, level + 1));
      }
    });

    return rows;
  };

  // Get all parent categories for dropdown
  const getParentCategories = (categoriesList, excludeId = null) => {
    const result = [];
    categoriesList.forEach((cat) => {
      if (cat.id !== excludeId) {
        result.push(cat);
        if (cat.subCategories && cat.subCategories.length > 0) {
          result.push(...getParentCategories(cat.subCategories, excludeId));
        }
      }
    });
    return result;
  };

  const totalCategories = categories.reduce((total, cat) => {
    let count = 1;
    if (cat.subCategories) {
      count += cat.subCategories.length;
    }
    return total + count;
  }, 0);

  return (
    <div className={styles.adminCategories}>
      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên danh mục..."
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
              className={styles.adminSearchInput}
            />
          </div>
          <div className={styles.toolbarActions}>
            <button
              className="admin-btn admin-btn-success"
              onClick={handleOpenCreateForm}
            >
              <PlusOutlined />
              Thêm danh mục
            </button>
            <button
              className={`admin-btn ${
                showFilters ? "admin-btn-primary" : "admin-btn-secondary"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterOutlined />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
            >
              <ReloadOutlined />
              Đặt lại
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSearch}
            >
              <SearchOutlined />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.adminFilters}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Cấp độ</label>
                <select
                  value={filters.level}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, level: e.target.value }))
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="0">Cấp 0 (Cha)</option>
                  <option value="1">Cấp 1 (Con)</option>
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Trạng thái</label>
                <select
                  value={filters.active}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, active: e.target.value }))
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Vô hiệu hóa</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách danh mục ({totalCategories})
        </h2>
        <div className={styles.adminTableContainer}>
          {loading ? (
            <LoadingSpinner
              tip="Đang tải danh sách danh mục..."
              fullScreen={false}
            />
          ) : (
            <table className={`admin-table ${styles.adminTable}`}>
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Cấp độ</th>
                  <th>Danh mục cha</th>
                  <th>Mô tả</th>
                  <th>Số sản phẩm</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Người tạo</th>
                  <th className={styles.stickyColumn}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  renderCategoryTree(categories)
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className={styles.adminEmptyState}>
                        <AppstoreOutlined
                          style={{ fontSize: "64px", color: "#ddd" }}
                        />
                        <p>Không tìm thấy danh mục nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Category Detail Modal */}
      {showCategoryDetail && selectedCategory && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCategoryDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết danh mục</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCategoryDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.categoryDetail}>
                <div className={styles.categoryDetailImage}>
                  {selectedCategory.imageUrl ? (
                    <img
                      src={selectedCategory.imageUrl}
                      alt={selectedCategory.name}
                    />
                  ) : (
                    <div className={styles.imagePlaceholderLarge}>
                      <AppstoreOutlined />
                    </div>
                  )}
                </div>
                <div className={styles.categoryDetailInfo}>
                  <div className={styles.infoRow}>
                    <label>ID:</label>
                    <span className={styles.idText}>{selectedCategory.id}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Tên danh mục:</label>
                    <span>{selectedCategory.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Mô tả:</label>
                    <span>{selectedCategory.description || "—"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Loại danh mục:</label>
                    <span className={styles.typeBadge}>
                      {selectedCategory.categoryType}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Cấp độ:</label>
                    <span>Cấp {selectedCategory.level}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Danh mục cha:</label>
                    <span>{selectedCategory.parentName || "—"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Số sản phẩm:</label>
                    <span>{selectedCategory.productCount || 0}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Số danh mục con:</label>
                    <span>
                      {selectedCategory.subCategories
                        ? selectedCategory.subCategories.length
                        : 0}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Trạng thái:</label>
                    <span>
                      {selectedCategory.active ? "Hoạt động" : "Vô hiệu hóa"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Người tạo:</label>
                    <span>{selectedCategory.createdBy || "—"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedCategory.createdAt)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Cập nhật lần cuối:</label>
                    <span>{formatDate(selectedCategory.updatedAt)}</span>
                  </div>

                  {selectedCategory.subCategories &&
                    selectedCategory.subCategories.length > 0 && (
                      <div className={styles.infoRow}>
                        <label>Danh mục con:</label>
                        <div className={styles.subCategoriesList}>
                          {selectedCategory.subCategories.map((subCat) => (
                            <div
                              key={subCat.id}
                              className={styles.subCategoryItem}
                            >
                              <strong>{subCat.name}</strong>
                              <span className={styles.productCount}>
                                {subCat.productCount || 0} sản phẩm
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCategoryForm(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>{isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCategoryForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitForm} className={styles.categoryForm}>
                <div className={styles.formGroup}>
                  <label>
                    Tên danh mục <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Nhập tên danh mục..."
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Nhập mô tả danh mục..."
                    rows={4}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Danh mục cha</label>
                  <select
                    value={formData.parentId || ""}
                    onChange={(e) =>
                      handleFormChange("parentId", e.target.value || null)
                    }
                  >
                    <option value="">-- Không có (Danh mục gốc) --</option>
                    {getParentCategories(
                      categories,
                      isEditMode ? selectedCategory.id : null
                    )
                      .filter((cat) => cat.level === 0)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Hình ảnh</label>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="categoryImage"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="categoryImage"
                      className={styles.uploadLabel}
                    >
                      <FileImageOutlined />
                      Chọn hình ảnh
                    </label>
                    {imagePreview && (
                      <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowCategoryForm(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {isEditMode ? "Cập nhật" : "Tạo mới"}
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

export default AdminCategoriesPage;
