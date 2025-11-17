import React, { useState, useEffect, useContext } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  AppstoreOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { notification, Modal } from "antd";
import {
  getProductAttributesByCategoryApi,
  getProductAttributeByIdApi,
  createProductAttributeApi,
  updateProductAttributeApi,
  deleteProductAttributeApi,
  addValueToAttributeApi,
  deleteValueFromAttributeApi,
  getPlatformCategoriesApi,
} from "../../util/api";
import { AuthContext } from "../../components/context/auth.context";
import { ROLES } from "../../constants/roles";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./SellerProductAttributesPage.module.css";

const SellerProductAttributesPage = () => {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth?.user?.role === ROLES.ADMIN;

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [attributeDetails, setAttributeDetails] = useState({}); // Store detailed attributes with values
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState({}); // Loading state for individual attributes
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAttributeId, setEditingAttributeId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    values: [],
  });

  // Fetch platform categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getPlatformCategoriesApi();

      if (response?.code === 1000) {
        setCategories(response.result || []);
        // Auto-select first category if available
        if (response.result && response.result.length > 0) {
          setSelectedCategoryId(response.result[0].id);
        }
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
      setLoadingCategories(false);
    }
  };

  // Fetch attributes for selected category
  const fetchAttributes = async () => {
    if (!selectedCategoryId) {
      setAttributes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getProductAttributesByCategoryApi(
        selectedCategoryId
      );

      if (response?.code === 1000) {
        setAttributes(response.result || []);
      } else {
        notification.error({
          message: "Tải thuộc tính thất bại",
          description:
            response?.message || "Không thể tải danh sách thuộc tính",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      notification.error({
        message: "Tải thuộc tính thất bại",
        description: "Không thể tải danh sách thuộc tính",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed attribute info including values
  const fetchAttributeDetail = async (attributeId) => {
    // Skip if already loaded
    if (attributeDetails[attributeId]) {
      return;
    }

    try {
      setLoadingDetails((prev) => ({ ...prev, [attributeId]: true }));
      const response = await getProductAttributeByIdApi(attributeId);

      if (response?.code === 1000) {
        setAttributeDetails((prev) => ({
          ...prev,
          [attributeId]: response.result,
        }));
      } else {
        notification.error({
          message: "Tải chi tiết thuộc tính thất bại",
          description: response?.message || "Không thể tải chi tiết thuộc tính",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching attribute detail:", error);
      notification.error({
        message: "Tải chi tiết thuộc tính thất bại",
        description: "Không thể tải chi tiết thuộc tính",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [attributeId]: false }));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchAttributes();
      setAttributeDetails({}); // Clear cached details when changing category
    }
  }, [selectedCategoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddValue = () => {
    if (newValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        values: [...prev.values, newValue.trim()],
      }));
      setNewValue("");
    }
  };

  const handleRemoveValue = (index) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    setFormData({
      name: "",
      description: "",
      values: [],
    });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({
      name: "",
      description: "",
      values: [],
    });
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn danh mục",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    try {
      const requestData = {
        name: formData.name,
        description: formData.description,
        categoryIds: [selectedCategoryId],
        values: formData.values,
      };

      const response = await createProductAttributeApi(requestData);
      if (response?.code === 1000) {
        notification.success({
          message: "Tạo thuộc tính thành công",
          description: "Thuộc tính đã được tạo thành công",
          placement: "topRight",
          duration: 3,
        });
        setShowCreateForm(false);
        fetchAttributes();
      } else {
        notification.error({
          message: "Tạo thuộc tính thất bại",
          description: response?.message || "Không thể tạo thuộc tính",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error creating attribute:", error);
      notification.error({
        message: "Tạo thuộc tính thất bại",
        description: "Không thể tạo thuộc tính",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleEditAttribute = (attribute) => {
    const detail = attributeDetails[attribute.id] || attribute;
    setEditingAttributeId(attribute.id);
    setFormData({
      name: detail.name,
      description: detail.description || "",
      values: (detail.values || []).map((v) =>
        typeof v === "string" ? v : v.value
      ),
    });
    // Auto expand when editing
    if (!expandedIds.includes(attribute.id)) {
      setExpandedIds((prev) => [...prev, attribute.id]);
    }
  };

  const handleCancelEdit = () => {
    setEditingAttributeId(null);
    setFormData({
      name: "",
      description: "",
      values: [],
    });
  };

  const handleUpdateAttribute = async (e) => {
    e.preventDefault();
    if (!editingAttributeId) return;

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
      };

      const response = await updateProductAttributeApi(
        editingAttributeId,
        updateData
      );
      if (response?.code === 1000) {
        notification.success({
          message: "Cập nhật thành công",
          description: "Thuộc tính đã được cập nhật thành công",
          placement: "topRight",
          duration: 3,
        });
        setEditingAttributeId(null);
        fetchAttributes();
      } else {
        notification.error({
          message: "Cập nhật thất bại",
          description: response?.message || "Không thể cập nhật thuộc tính",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error updating attribute:", error);
      notification.error({
        message: "Cập nhật thất bại",
        description: "Không thể cập nhật thuộc tính",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleDeleteAttribute = (attributeId, attributeName) => {
    Modal.confirm({
      title: "Xác nhận xóa thuộc tính",
      content: `Bạn có chắc chắn muốn xóa thuộc tính "${attributeName}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await deleteProductAttributeApi(attributeId);
          if (response?.code === 1000) {
            notification.success({
              message: "Xóa thành công",
              description: "Thuộc tính đã được xóa thành công",
              placement: "topRight",
              duration: 3,
            });
            fetchAttributes();
          } else {
            notification.error({
              message: "Xóa thất bại",
              description: response?.message || "Không thể xóa thuộc tính",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch (error) {
          console.error("Error deleting attribute:", error);
          notification.error({
            message: "Xóa thất bại",
            description: "Không thể xóa thuộc tính",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const handleAddValueToAttribute = async (attributeId, value) => {
    if (!value.trim()) return;

    try {
      const response = await addValueToAttributeApi(attributeId, value.trim());
      if (response?.code === 1000) {
        notification.success({
          message: "Thêm giá trị thành công",
          description: "Giá trị đã được thêm vào thuộc tính",
          placement: "topRight",
          duration: 3,
        });
        // Clear cache to force re-fetch
        setAttributeDetails((prev) => {
          const updated = { ...prev };
          delete updated[attributeId];
          return updated;
        });
        await fetchAttributeDetail(attributeId);
      } else {
        notification.error({
          message: "Thêm giá trị thất bại",
          description: response?.message || "Không thể thêm giá trị",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error adding value:", error);
      notification.error({
        message: "Thêm giá trị thất bại",
        description: "Không thể thêm giá trị",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleDeleteValueFromAttribute = (
    attributeId,
    value,
    attributeName
  ) => {
    Modal.confirm({
      title: "Xác nhận xóa giá trị",
      content: `Bạn có chắc chắn muốn xóa giá trị "${value}" khỏi thuộc tính "${attributeName}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await deleteValueFromAttributeApi(
            attributeId,
            value
          );
          if (response?.code === 1000) {
            notification.success({
              message: "Xóa giá trị thành công",
              description: "Giá trị đã được xóa khỏi thuộc tính",
              placement: "topRight",
              duration: 3,
            });
            // Clear cache to force re-fetch
            setAttributeDetails((prev) => {
              const updated = { ...prev };
              delete updated[attributeId];
              return updated;
            });
            await fetchAttributeDetail(attributeId);
          } else {
            notification.error({
              message: "Xóa giá trị thất bại",
              description: response?.message || "Không thể xóa giá trị",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch (error) {
          console.error("Error deleting value:", error);
          notification.error({
            message: "Xóa giá trị thất bại",
            description: "Không thể xóa giá trị",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const toggleExpand = async (attributeId) => {
    const isExpanding = !expandedIds.includes(attributeId);

    setExpandedIds((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );

    // Fetch details when expanding
    if (isExpanding) {
      await fetchAttributeDetail(attributeId);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
    setShowCreateForm(false);
    setEditingAttributeId(null);
  };

  // Loading state for categories
  if (loadingCategories) {
    return (
      <div className={styles.sellerAttributes}>
        <LoadingSpinner tip="Đang tải thông tin..." fullScreen={false} />
      </div>
    );
  }

  // No categories state
  if (categories.length === 0) {
    return (
      <div className={styles.sellerAttributes}>
        <div className={styles.emptyState}>
          <AppstoreOutlined />
          <h3>Chưa có danh mục nào</h3>
          <p>Cần có danh mục để quản lý thuộc tính sản phẩm.</p>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className={styles.sellerAttributes}>
      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <InfoCircleOutlined />
        <div className={styles.infoContent}>
          <div className={styles.infoTitle}>
            {isAdmin
              ? "Quản lý thuộc tính sản phẩm"
              : "Xem thuộc tính sản phẩm"}
          </div>
          <div className={styles.infoText}>
            {isAdmin
              ? "Tạo và quản lý các thuộc tính sản phẩm như kích cỡ, màu sắc, chất liệu,... cho từng danh mục. Thuộc tính giúp mô tả sản phẩm chi tiết hơn."
              : "Xem các thuộc tính sản phẩm đã được cấu hình cho từng danh mục. Chỉ Quản trị viên mới có thể chỉnh sửa thuộc tính."}
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className={styles.categorySelectorSection}>
        <label htmlFor="category-select" className={styles.selectorLabel}>
          <AppstoreOutlined /> Chọn danh mục:
        </label>
        <select
          id="category-select"
          value={selectedCategoryId || ""}
          onChange={handleCategoryChange}
          className={styles.categorySelector}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {selectedCategory && (
          <div className={styles.selectedCategoryInfo}>
            <span className={styles.categoryBadge}>
              <CheckCircleOutlined /> {selectedCategory.name}
            </span>
            <span className={styles.attributeCount}>
              {attributes.length} thuộc tính
            </span>
          </div>
        )}
      </div>

      {/* Create Attribute Button */}
      {isAdmin && !showCreateForm && (
        <div className={styles.createAttributeSection}>
          <button
            onClick={handleShowCreateForm}
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
          >
            <PlusOutlined /> Tạo thuộc tính mới
          </button>
        </div>
      )}

      {/* Create Form */}
      {isAdmin && showCreateForm && (
        <div className={styles.attributeCreateForm}>
          <form onSubmit={handleCreateAttribute} className={styles.form}>
            <div className={styles.formSectionTitle}>
              <PlusOutlined />
              Tạo thuộc tính mới
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Tên thuộc tính <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Ví dụ: Kích cỡ, Màu sắc, Chất liệu..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Mô tả thuộc tính
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                placeholder="Nhập mô tả thuộc tính..."
                rows="3"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Giá trị thuộc tính</label>
              <div className={styles.valueInputGroup}>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className={styles.formInput}
                  placeholder="Nhập giá trị (Ví dụ: S, M, L, XL)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddValue}
                  className={styles.addValueBtn}
                >
                  <PlusOutlined /> Thêm
                </button>
              </div>
              <div className={styles.valuesList}>
                {formData.values.map((value, index) => (
                  <span key={index} className={styles.valueTag}>
                    {value}
                    <CloseOutlined onClick={() => handleRemoveValue(index)} />
                  </span>
                ))}
              </div>
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
                Tạo thuộc tính
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner
          tip="Đang tải danh sách thuộc tính..."
          fullScreen={false}
        />
      ) : (
        <>
          {/* Attributes List */}
          {attributes.length === 0 ? (
            <div className={styles.emptyState}>
              <TagsOutlined />
              <h3>Chưa có thuộc tính nào</h3>
              <p>Tạo thuộc tính đầu tiên để bắt đầu mô tả sản phẩm chi tiết.</p>
            </div>
          ) : (
            attributes.map((attribute) => {
              const isExpanded = expandedIds.includes(attribute.id);

              return (
                <div
                  key={attribute.id}
                  id={`attribute-${attribute.id}`}
                  className={styles.attributeContainer}
                >
                  {/* Compact View */}
                  <div
                    className={styles.attributeCompact}
                    onClick={() => toggleExpand(attribute.id)}
                  >
                    <div className={styles.compactLeft}>
                      <div className={styles.compactIcon}>
                        <TagsOutlined />
                      </div>
                      <div className={styles.compactInfo}>
                        <h3 className={styles.compactAttributeName}>
                          {attribute.name}
                        </h3>
                        <div className={styles.compactMeta}>
                          {attribute.isActive ? (
                            <span
                              className={`${styles.compactStatus} ${styles.active}`}
                            >
                              <CheckCircleOutlined /> Hoạt động
                            </span>
                          ) : (
                            <span
                              className={`${styles.compactStatus} ${styles.inactive}`}
                            >
                              <ExclamationCircleOutlined /> Không hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.compactRight}>
                      <button className={styles.expandButton} type="button">
                        {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className={styles.attributeExpanded}>
                      {loadingDetails[attribute.id] ? (
                        <div className={styles.loadingDetails}>
                          <LoadingOutlined
                            style={{ fontSize: 32, color: "#ee4d2d" }}
                          />
                          <p>Đang tải chi tiết...</p>
                        </div>
                      ) : editingAttributeId === attribute.id ? (
                        // Edit Mode
                        <form
                          onSubmit={handleUpdateAttribute}
                          className={styles.form}
                        >
                          <div className={styles.formSectionTitle}>
                            <EditOutlined />
                            Chỉnh sửa thuộc tính
                          </div>

                          <div className={styles.formGroup}>
                            <label
                              htmlFor="edit-name"
                              className={styles.formLabel}
                            >
                              Tên thuộc tính{" "}
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
                              Mô tả thuộc tính
                            </label>
                            <textarea
                              id="edit-description"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              className={styles.formTextarea}
                              rows="3"
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
                          <div className={styles.attributeDetails}>
                            <div className={styles.attributeHeader}>
                              <h2 className={styles.attributeName}>
                                {attribute.name}
                              </h2>
                              {attribute.isActive ? (
                                <span
                                  className={`${styles.statusBadge} ${styles.active}`}
                                >
                                  <CheckCircleOutlined /> Hoạt động
                                </span>
                              ) : (
                                <span
                                  className={`${styles.statusBadge} ${styles.inactive}`}
                                >
                                  <ExclamationCircleOutlined /> Không hoạt động
                                </span>
                              )}
                            </div>

                            {attribute.description && (
                              <div className={styles.attributeDescription}>
                                <TagsOutlined style={{ marginRight: "8px" }} />
                                {attribute.description}
                              </div>
                            )}

                            {/* Categories Section */}
                            {attributeDetails[attribute.id]?.categories &&
                              attributeDetails[attribute.id].categories.length >
                                0 && (
                                <div className={styles.categoriesSection}>
                                  <h3 className={styles.categoriesSectionTitle}>
                                    <AppstoreOutlined
                                      style={{ marginRight: "8px" }}
                                    />
                                    Áp dụng cho danh mục
                                  </h3>
                                  <div className={styles.categoriesList}>
                                    {attributeDetails[
                                      attribute.id
                                    ].categories.map((category) => (
                                      <div
                                        key={category.id}
                                        className={styles.categoryItem}
                                      >
                                        {category.imageUrl && (
                                          <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className={styles.categoryImage}
                                          />
                                        )}
                                        <div className={styles.categoryInfo}>
                                          <span className={styles.categoryName}>
                                            {category.name}
                                          </span>
                                          {category.description && (
                                            <span
                                              className={styles.categoryDesc}
                                            >
                                              {category.description}
                                            </span>
                                          )}
                                        </div>
                                        {category.active && (
                                          <CheckCircleOutlined
                                            className={
                                              styles.categoryActiveIcon
                                            }
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            <div className={styles.valuesSection}>
                              <h3 className={styles.valuesSectionTitle}>
                                Giá trị thuộc tính
                              </h3>
                              <div className={styles.valuesList}>
                                {(
                                  attributeDetails[attribute.id]?.values || []
                                ).map((valueObj) => (
                                  <span
                                    key={valueObj.id}
                                    className={`${styles.valueTag} ${
                                      !valueObj.isActive
                                        ? styles.valueInactive
                                        : ""
                                    }`}
                                    title={
                                      valueObj.isActive
                                        ? "Hoạt động"
                                        : "Không hoạt động"
                                    }
                                  >
                                    {valueObj.value}
                                    {!valueObj.isActive && (
                                      <ExclamationCircleOutlined
                                        style={{
                                          marginLeft: "4px",
                                          fontSize: "12px",
                                        }}
                                      />
                                    )}
                                    {isAdmin && (
                                      <CloseOutlined
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteValueFromAttribute(
                                            attribute.id,
                                            valueObj.value,
                                            attribute.name
                                          );
                                        }}
                                      />
                                    )}
                                  </span>
                                ))}
                                {(!attributeDetails[attribute.id]?.values ||
                                  attributeDetails[attribute.id]?.values
                                    .length === 0) && (
                                  <p
                                    style={{ color: "#999", fontSize: "14px" }}
                                  >
                                    Chưa có giá trị nào
                                  </p>
                                )}
                              </div>
                              {isAdmin && (
                                <div className={styles.addValueSection}>
                                  <input
                                    type="text"
                                    placeholder="Thêm giá trị mới..."
                                    className={styles.addValueInput}
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddValueToAttribute(
                                          attribute.id,
                                          e.target.value
                                        );
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className={styles.attributeActions}>
                            {isAdmin ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAttribute(attribute);
                                  }}
                                  className={`${styles.profileBtn} ${styles.profileBtnSecondary}`}
                                >
                                  <EditOutlined /> Chỉnh sửa
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAttribute(
                                      attribute.id,
                                      attribute.name
                                    );
                                  }}
                                  className={`${styles.profileBtn} ${styles.profileBtnDanger}`}
                                >
                                  <DeleteOutlined /> Xóa
                                </button>
                              </>
                            ) : (
                              <div className={styles.viewOnlyNote}>
                                <EyeOutlined /> Chỉ Quản trị viên mới có thể
                                chỉnh sửa
                              </div>
                            )}
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

export default SellerProductAttributesPage;
