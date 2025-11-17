import React, { useState, useEffect, useCallback, memo } from "react";
import { PlusOutlined, TagsOutlined } from "@ant-design/icons";
import { notification, Input, InputNumber, Select, Button } from "antd";
import {
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
  addAttributeToVariantApi,
  removeAttributeFromVariantApi,
  getProductAttributesByCategoryApi,
  getProductAttributeByIdApi,
} from "../../util/api";
import VariantCard from "./VariantCard";
import styles from "./VariantsManager.module.css";

const { Option } = Select;

const VariantsManager = memo(
  ({ variants, productId, categoryId, onUpdate }) => {
    const [expandedRows, setExpandedRows] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createFormData, setCreateFormData] = useState({});
    const [attributes, setAttributes] = useState([]);
    const [attributeDetails, setAttributeDetails] = useState({});
    const [editingAttributes, setEditingAttributes] = useState({});
    const [addingAttribute, setAddingAttribute] = useState({});

    useEffect(() => {
      if (categoryId) {
        fetchAttributes();
      }
    }, [categoryId]);

    const fetchAttributes = async () => {
      try {
        const response = await getProductAttributesByCategoryApi(categoryId);
        if (response?.code === 1000) {
          const attrs = response.result || [];
          setAttributes(attrs);

          // Fetch details for all attributes immediately
          const detailsPromises = attrs.map((attr) =>
            fetchAttributeDetail(attr.id)
          );
          await Promise.all(detailsPromises);
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };

    const fetchAttributeDetail = async (attributeId) => {
      if (attributeDetails[attributeId]) {
        return attributeDetails[attributeId];
      }

      try {
        const response = await getProductAttributeByIdApi(attributeId);
        if (response?.code === 1000) {
          setAttributeDetails((prev) => ({
            ...prev,
            [attributeId]: response.result,
          }));
          return response.result;
        }
      } catch (error) {
        console.error("Error fetching attribute detail:", error);
      }
      return null;
    };

    const toggleExpand = useCallback((variantId) => {
      setExpandedRows((prev) =>
        prev.includes(variantId)
          ? prev.filter((id) => id !== variantId)
          : [...prev, variantId]
      );
    }, []);

    const handleEdit = useCallback((variant) => {
      setEditingRow(variant.id);
      setEditingData({
        variantName: variant.variantName,
        price: variant.price,
        originalPrice: variant.originalPrice,
        stockQuantity: variant.stockQuantity,
      });
      setAddingAttribute({});
    }, []);

    const handleCancelEdit = useCallback(() => {
      setEditingRow(null);
      setEditingData({});
      setEditingAttributes({});
      setAddingAttribute({});
    }, []);

    const handleSaveEdit = useCallback(
      async (variantId) => {
        try {
          const variantData = {
            variantName: editingData.variantName,
            price: editingData.price,
            originalPrice: editingData.originalPrice,
            stockQuantity: editingData.stockQuantity,
          };

          await updateVariantApi(productId, variantId, variantData);

          notification.success({
            message: "Thành công",
            description: "Cập nhật biến thể thành công",
            placement: "topRight",
          });

          setEditingRow(null);
          setEditingData({});
          onUpdate?.();
        } catch (error) {
          console.error("Error updating variant:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể cập nhật biến thể",
            placement: "topRight",
          });
        }
      },
      [editingData, productId, onUpdate]
    );

    const handleDelete = useCallback(
      async (variantId) => {
        try {
          await deleteVariantApi(productId, variantId);
          notification.success({
            message: "Thành công",
            description: "Xóa biến thể thành công",
            placement: "topRight",
          });
          onUpdate?.();
        } catch (error) {
          console.error("Error deleting variant:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể xóa biến thể",
            placement: "topRight",
          });
        }
      },
      [productId, onUpdate]
    );

    const handleAddAttribute = useCallback(
      async (variantId, attributeId, value) => {
        try {
          await addAttributeToVariantApi(productId, variantId, {
            attributeId,
            value,
          });
          notification.success({
            message: "Thành công",
            description: "Thêm thuộc tính thành công",
            placement: "topRight",
          });
          onUpdate?.();
        } catch (error) {
          console.error("Error adding attribute:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể thêm thuộc tính",
            placement: "topRight",
          });
        }
      },
      [productId, onUpdate]
    );

    const handleRemoveAttribute = useCallback(
      async (variantId, attributeId, value) => {
        try {
          await removeAttributeFromVariantApi(
            productId,
            variantId,
            attributeId,
            value
          );
          notification.success({
            message: "Thành công",
            description: "Xóa thuộc tính thành công",
            placement: "topRight",
          });
          onUpdate?.();
        } catch (error) {
          console.error("Error removing attribute:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể xóa thuộc tính",
            placement: "topRight",
          });
        }
      },
      [productId, onUpdate]
    );

    const handleCreateVariant = useCallback(async () => {
      try {
        const variantData = {
          variantName: createFormData.variantName,
          sku: createFormData.sku,
          price: createFormData.price,
          originalPrice: createFormData.originalPrice || createFormData.price,
          stockQuantity: createFormData.stockQuantity || 0,
        };

        const response = await createVariantApi(productId, variantData);

        if (response?.code === 1000 && response.result?.id) {
          const variantId = response.result.id;

          // Add attributes if any
          for (const [attrId, value] of Object.entries(editingAttributes)) {
            if (value) {
              await addAttributeToVariantApi(productId, variantId, {
                attributeId: attrId,
                value: value,
              });
            }
          }
        }

        notification.success({
          message: "Thành công",
          description: "Tạo biến thể thành công",
          placement: "topRight",
        });

        setShowCreateForm(false);
        setCreateFormData({});
        setEditingAttributes({});
        onUpdate?.();
      } catch (error) {
        console.error("Error creating variant:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tạo biến thể",
          placement: "topRight",
        });
      }
    }, [createFormData, editingAttributes, productId, onUpdate]);

    return (
      <div className={styles.variantsManager}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <TagsOutlined /> Biến thể sản phẩm ({variants?.length || 0})
          </h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={styles.addBtn}
          >
            {showCreateForm ? "Hủy" : "Thêm biến thể"}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className={styles.createForm}>
            <h4 className={styles.formTitle}>Tạo biến thể mới</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Tên biến thể *</label>
                <Input
                  placeholder="VD: Áo trắng - Size M"
                  value={createFormData.variantName}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      variantName: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>SKU *</label>
                <Input
                  placeholder="VD: SHIRT-WHITE-M"
                  value={createFormData.sku}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      sku: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Giá bán *</label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Nhập giá"
                  value={createFormData.price}
                  onChange={(value) =>
                    setCreateFormData({ ...createFormData, price: value })
                  }
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Giá gốc</label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Nhập giá"
                  value={createFormData.originalPrice}
                  onChange={(value) =>
                    setCreateFormData({
                      ...createFormData,
                      originalPrice: value,
                    })
                  }
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tồn kho</label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Số lượng"
                  value={createFormData.stockQuantity}
                  onChange={(value) =>
                    setCreateFormData({
                      ...createFormData,
                      stockQuantity: value,
                    })
                  }
                />
              </div>
            </div>

            {/* Attributes Selection */}
            {attributes.length > 0 && (
              <div className={styles.attributesSection}>
                <h5>Thuộc tính biến thể</h5>
                <div className={styles.attributesGrid}>
                  {attributes.map((attr) => (
                    <div key={attr.id} className={styles.formGroup}>
                      <label>{attr.name}</label>
                      <Select
                        placeholder={`Chọn ${attr.name}`}
                        value={editingAttributes[attr.id]}
                        onChange={(value) =>
                          setEditingAttributes({
                            ...editingAttributes,
                            [attr.id]: value,
                          })
                        }
                        allowClear
                      >
                        {(attributeDetails[attr.id]?.values || []).map(
                          (valueObj) => (
                            <Option
                              key={valueObj.id}
                              value={valueObj.value}
                              disabled={!valueObj.isActive}
                            >
                              {valueObj.value}
                              {!valueObj.isActive && " (Không hoạt động)"}
                            </Option>
                          )
                        )}
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <Button onClick={() => setShowCreateForm(false)}>Hủy</Button>
              <Button
                type="primary"
                onClick={handleCreateVariant}
                disabled={
                  !createFormData.variantName ||
                  !createFormData.sku ||
                  !createFormData.price
                }
              >
                <SaveOutlined /> Tạo biến thể
              </Button>
            </div>
          </div>
        )}

        {/* Variants List */}
        {variants && variants.length > 0 ? (
          <div className={styles.variantsList}>
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                isExpanded={expandedRows.includes(variant.id)}
                isEditing={editingRow === variant.id}
                editingData={editingData}
                addingAttribute={addingAttribute}
                attributes={attributes}
                attributeDetails={attributeDetails}
                onToggleExpand={toggleExpand}
                onEdit={handleEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDelete}
                onEditingDataChange={setEditingData}
                onAddAttribute={handleAddAttribute}
                onRemoveAttribute={handleRemoveAttribute}
                onAddingAttributeChange={setAddingAttribute}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <TagsOutlined style={{ fontSize: 48, color: "#ccc" }} />
            <p>Chưa có biến thể nào</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateForm(true)}
            >
              Tạo biến thể đầu tiên
            </Button>
          </div>
        )}
      </div>
    );
  }
);

VariantsManager.displayName = "VariantsManager";

export default VariantsManager;
