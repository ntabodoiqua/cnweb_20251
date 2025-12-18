import { useState, useEffect } from "react";
import {
  TagsOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { notification, Modal, Tag, Input, Button, Select, Tooltip } from "antd";
import {
  getProductAttributesByCategoryApi,
  createProductAttributeApi,
  getProductAttributeByIdApi,
  updateProductAttributeApi,
  deleteProductAttributeApi,
  addValueToAttributeApi,
  deleteValueFromAttributeApi,
  addCategoriesToAttributeApi,
  deleteCategoriesFromAttributeApi,
  getCategoriesAdminApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminProductAttributesPage.module.css";

const { Option } = Select;

/**
 * AdminProductAttributesPage - Trang quản lý thuộc tính sản phẩm
 * Cho phép admin thêm, sửa, xóa thuộc tính và giá trị thuộc tính
 */
const AdminProductAttributesPage = () => {
  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    isActive: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [showAttributeDetail, setShowAttributeDetail] = useState(false);
  const [showAttributeForm, setShowAttributeForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryIds: [],
    values: [],
  });

  const [newValue, setNewValue] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch attributes when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      fetchAttributesByCategory(selectedCategoryId);
    } else {
      setAttributes([]);
    }
  }, [selectedCategoryId]);

  const fetchAttributesByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await getProductAttributesByCategoryApi(categoryId);

      if (response && response.code === 1000) {
        setAttributes(response.result || []);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách thuộc tính",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAdminApi();
      if (response && response.code === 1000) {
        setCategories(response.result || []);
        // Flatten categories for dropdown
        const flattened = flattenCategories(response.result || []);
        setFlatCategories(flattened);

        // Auto-select first category if available
        if (flattened.length > 0) {
          setSelectedCategoryId(flattened[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Chỉ lấy danh mục cấp 0 (root categories) vì thuộc tính chỉ được gán cho danh mục gốc
  const flattenCategories = (categoriesList, result = []) => {
    categoriesList.forEach((cat) => {
      // Chỉ thêm danh mục cấp 0
      if (cat.level === 0) {
        result.push({
          id: cat.id,
          name: cat.name,
          level: cat.level,
        });
      }
    });
    return result;
  };

  const handleSearch = () => {
    // Filter is applied in filteredAttributes
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      isActive: "",
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handleRefresh = () => {
    if (selectedCategoryId) {
      fetchAttributesByCategory(selectedCategoryId);
    }
  };

  const filteredAttributes = attributes.filter((attr) => {
    const matchesName =
      !filters.name ||
      attr.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesActive =
      filters.isActive === "" ||
      attr.isActive === (filters.isActive === "true");
    return matchesName && matchesActive;
  });

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

  const handleViewAttribute = async (attribute) => {
    try {
      setModalLoading(true);
      const response = await getProductAttributeByIdApi(attribute.id);
      if (response && response.code === 1000) {
        setSelectedAttribute(response.result);
        setShowAttributeDetail(true);
      }
    } catch (error) {
      console.error("Error fetching attribute detail:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải chi tiết thuộc tính",
        placement: "topRight",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAttribute = async (attributeId, attributeName) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa thuộc tính "${attributeName}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await deleteProductAttributeApi(attributeId);
          if (response && response.code === 1000) {
            notification.success({
              message: "Thành công",
              description: "Xóa thuộc tính thành công!",
              placement: "topRight",
            });
            handleRefresh();
          }
        } catch (error) {
          console.error("Error deleting attribute:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message || "Không thể xóa thuộc tính",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleOpenCreateForm = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      description: "",
      categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
      values: [],
    });
    setNewValue("");
    setShowAttributeForm(true);
  };

  const handleOpenEditForm = async (attribute) => {
    try {
      setModalLoading(true);
      const response = await getProductAttributeByIdApi(attribute.id);
      if (response && response.code === 1000) {
        const attrDetail = response.result;
        setIsEditMode(true);
        setSelectedAttribute(attrDetail);
        setFormData({
          name: attrDetail.name,
          description: attrDetail.description || "",
          categoryIds: attrDetail.categories?.map((cat) => cat.id) || [],
          // values la mang object, can lay truong value
          values: attrDetail.values?.map((v) => v.value) || [],
        });
        setNewValue("");
        setShowAttributeForm(true);
      }
    } catch (error) {
      console.error("Error fetching attribute for edit:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải thông tin thuộc tính",
        placement: "topRight",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddValue = () => {
    if (!newValue.trim()) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng nhập giá trị",
        placement: "topRight",
      });
      return;
    }

    if (formData.values.includes(newValue.trim())) {
      notification.warning({
        message: "Cảnh báo",
        description: "Giá trị này đã tồn tại",
        placement: "topRight",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      values: [...prev.values, newValue.trim()],
    }));
    setNewValue("");
  };

  const handleRemoveValue = (valueToRemove) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((v) => v !== valueToRemove),
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng nhập tên thuộc tính",
        placement: "topRight",
      });
      return;
    }

    try {
      setModalLoading(true);

      if (isEditMode) {
        // Update attribute
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
        };
        await updateProductAttributeApi(selectedAttribute.id, updateData);

        // Handle category changes
        const currentCategoryIds =
          selectedAttribute.categories?.map((cat) => cat.id) || [];
        const newCategoryIds = formData.categoryIds;

        const categoriesToAdd = newCategoryIds.filter(
          (id) => !currentCategoryIds.includes(id)
        );
        const categoriesToRemove = currentCategoryIds.filter(
          (id) => !newCategoryIds.includes(id)
        );

        if (categoriesToAdd.length > 0) {
          await addCategoriesToAttributeApi(
            selectedAttribute.id,
            categoriesToAdd
          );
        }
        if (categoriesToRemove.length > 0) {
          await deleteCategoriesFromAttributeApi(
            selectedAttribute.id,
            categoriesToRemove
          );
        }

        // Handle value changes - selectedAttribute.values la mang object
        const currentValues =
          selectedAttribute.values?.map((v) => v.value) || [];
        const newValues = formData.values;

        const valuesToAdd = newValues.filter((v) => !currentValues.includes(v));
        const valuesToRemove = currentValues.filter(
          (v) => !newValues.includes(v)
        );

        for (const value of valuesToAdd) {
          await addValueToAttributeApi(selectedAttribute.id, value);
        }
        for (const value of valuesToRemove) {
          await deleteValueFromAttributeApi(selectedAttribute.id, value);
        }

        notification.success({
          message: "Thành công",
          description: "Cập nhật thuộc tính thành công!",
          placement: "topRight",
        });
      } else {
        // Create new attribute
        const createData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          categoryIds: formData.categoryIds,
          values: formData.values,
        };
        await createProductAttributeApi(createData);

        notification.success({
          message: "Thành công",
          description: "Tạo thuộc tính thành công!",
          placement: "topRight",
        });
      }

      setShowAttributeForm(false);
      handleRefresh();
    } catch (error) {
      console.error("Error saving attribute:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message ||
          `Không thể ${isEditMode ? "cập nhật" : "tạo"} thuộc tính`,
        placement: "topRight",
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className={styles.adminProductAttributes}>
      {/* Category Selection Section */}
      <div className={styles.adminSection}>
        <div className={styles.categorySelectWrapper}>
          <label className={styles.categoryLabel}>
            <AppstoreOutlined /> Chọn danh mục cấp 0 để xem thuộc tính:
          </label>
          <Select
            placeholder="Chọn danh mục"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            style={{ width: 400 }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {flatCategories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thuộc tính..."
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
              Thêm thuộc tính
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
              onClick={handleRefresh}
              disabled={!selectedCategoryId}
            >
              <ReloadOutlined />
              Làm mới
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.adminFilters}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Trạng thái</label>
                <select
                  value={filters.isActive}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isActive: e.target.value,
                    }))
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Đã tắt</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attributes Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách thuộc tính{" "}
          {selectedCategoryId ? `(${filteredAttributes.length})` : ""}
        </h2>

        {!selectedCategoryId ? (
          <div className={styles.selectCategoryMessage}>
            <AppstoreOutlined style={{ fontSize: "48px", color: "#ddd" }} />
            <p>Vui lòng chọn danh mục để xem danh sách thuộc tính</p>
          </div>
        ) : (
          <div className={styles.adminTableContainer}>
            {loading ? (
              <LoadingSpinner
                tip="Đang tải danh sách thuộc tính..."
                fullScreen={false}
              />
            ) : (
              <table className={`admin-table ${styles.adminTable}`}>
                <thead>
                  <tr>
                    <th>Tên thuộc tính</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Cập nhật</th>
                    <th className={styles.stickyColumn}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttributes.length > 0 ? (
                    filteredAttributes.map((attribute) => (
                      <tr key={attribute.id}>
                        <td>
                          <div className={styles.attributeInfo}>
                            <TagsOutlined className={styles.attributeIcon} />
                            <strong>{attribute.name}</strong>
                          </div>
                        </td>
                        <td>
                          <Tooltip title={attribute.description}>
                            <span className={styles.descriptionText}>
                              {attribute.description || (
                                <span className={styles.noData}>
                                  Chưa có mô tả
                                </span>
                              )}
                            </span>
                          </Tooltip>
                        </td>
                        <td>
                          <Tag
                            color={attribute.isActive ? "green" : "default"}
                            icon={
                              attribute.isActive ? (
                                <CheckCircleOutlined />
                              ) : (
                                <CloseCircleOutlined />
                              )
                            }
                          >
                            {attribute.isActive ? "Hoạt động" : "Đã tắt"}
                          </Tag>
                        </td>
                        <td>{formatDate(attribute.createdAt)}</td>
                        <td>{formatDate(attribute.updatedAt)}</td>
                        <td className={styles.stickyColumn}>
                          <div className={styles.adminActionButtons}>
                            <button
                              className={`${styles.adminActionBtn} ${styles.view}`}
                              title="Xem chi tiết"
                              onClick={() => handleViewAttribute(attribute)}
                            >
                              <EyeOutlined />
                            </button>
                            <button
                              className={`${styles.adminActionBtn} ${styles.edit}`}
                              title="Chỉnh sửa"
                              onClick={() => handleOpenEditForm(attribute)}
                            >
                              <EditOutlined />
                            </button>
                            <button
                              className={`${styles.adminActionBtn} ${styles.delete}`}
                              title="Xóa"
                              onClick={() =>
                                handleDeleteAttribute(
                                  attribute.id,
                                  attribute.name
                                )
                              }
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <div className={styles.adminEmptyState}>
                          <TagsOutlined
                            style={{ fontSize: "64px", color: "#ddd" }}
                          />
                          <p>Không tìm thấy thuộc tính nào</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Attribute Detail Modal */}
      {showAttributeDetail && selectedAttribute && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAttributeDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết thuộc tính</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowAttributeDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.attributeDetail}>
                <div className={styles.attributeDetailInfo}>
                  <div className={styles.infoRow}>
                    <label>ID:</label>
                    <span className={styles.idText}>
                      {selectedAttribute.id}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Tên thuộc tính:</label>
                    <span>{selectedAttribute.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Mô tả:</label>
                    <span>
                      {selectedAttribute.description || "Chưa có mô tả"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Trạng thái:</label>
                    <Tag
                      color={selectedAttribute.isActive ? "green" : "default"}
                      icon={
                        selectedAttribute.isActive ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                    >
                      {selectedAttribute.isActive ? "Đang hoạt động" : "Đã tắt"}
                    </Tag>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Danh mục áp dụng:</label>
                    <div className={styles.tagsList}>
                      {selectedAttribute.categories &&
                      selectedAttribute.categories.length > 0 ? (
                        selectedAttribute.categories.map((cat) => (
                          <Tag key={cat.id} color="orange">
                            {cat.name}
                          </Tag>
                        ))
                      ) : (
                        <span>Chưa gán danh mục</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Các giá trị:</label>
                    <div className={styles.tagsList}>
                      {selectedAttribute.values &&
                      selectedAttribute.values.length > 0 ? (
                        selectedAttribute.values.map((val) => (
                          <Tag
                            key={val.id}
                            color={val.isActive ? "blue" : "default"}
                            icon={
                              !val.isActive ? <CloseCircleOutlined /> : null
                            }
                          >
                            {val.value}
                            {!val.isActive && " (Đã tắt)"}
                          </Tag>
                        ))
                      ) : (
                        <span>Chưa có giá trị</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedAttribute.createdAt)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Cập nhật lần cuối:</label>
                    <span>{formatDate(selectedAttribute.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Form Modal */}
      {showAttributeForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAttributeForm(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {isEditMode ? "Chỉnh sửa thuộc tính" : "Thêm thuộc tính mới"}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowAttributeForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form
                onSubmit={handleSubmitForm}
                className={styles.attributeForm}
              >
                <div className={styles.formGroup}>
                  <label>
                    Tên thuộc tính <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="VD: Màu sắc, Kích thước, Chất liệu..."
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
                    placeholder="VD: Màu sắc sản phẩm: Đỏ, đen, vàng,..."
                    rows={3}
                    className={styles.textareaInput}
                  />
                  <small className={styles.formHint}>
                    Mô tả ngắn gọn về thuộc tính và các giá trị có thể có
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label>Danh mục áp dụng (chỉ danh mục cấp 0)</label>
                  <Select
                    mode="multiple"
                    placeholder="Chọn danh mục cấp 0 (để trống = tất cả danh mục)"
                    value={formData.categoryIds}
                    onChange={(value) => handleFormChange("categoryIds", value)}
                    style={{ width: "100%" }}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {categories
                      .filter((cat) => cat.level === 0)
                      .map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                  </Select>
                  <small className={styles.formHint}>
                    Thuộc tính chỉ có thể được gán cho danh mục sàn cấp 0
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label>Các giá trị</label>
                  <div className={styles.valuesInput}>
                    <Input
                      placeholder="Nhập giá trị (VD: Đỏ, Xanh, L, XL...)"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onPressEnter={(e) => {
                        e.preventDefault();
                        handleAddValue();
                      }}
                    />
                    <Button type="primary" onClick={handleAddValue}>
                      Thêm
                    </Button>
                  </div>
                  <div className={styles.valuesTags}>
                    {formData.values.map((val, idx) => (
                      <Tag
                        key={idx}
                        closable
                        onClose={() => handleRemoveValue(val)}
                        color="blue"
                      >
                        {val}
                      </Tag>
                    ))}
                  </div>
                  {isEditMode && (
                    <small className={styles.formHint}>
                      Lưu ý: Chỉ có thể thêm hoặc xóa giá trị, không thể sửa tên
                      giá trị đã tồn tại
                    </small>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowAttributeForm(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={modalLoading}
                  >
                    {modalLoading
                      ? "Đang xử lý..."
                      : isEditMode
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

export default AdminProductAttributesPage;
