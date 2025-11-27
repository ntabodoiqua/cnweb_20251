import React, { useState, useEffect, useCallback, memo } from "react";
import { PlusOutlined, TagsOutlined, SaveOutlined } from "@ant-design/icons";
import {
  notification,
  Input,
  InputNumber,
  Select,
  Button,
  Checkbox,
} from "antd";
import {
  createVariantApi,
  addAttributeToVariantApi,
  getProductAttributesByCategoryApi,
  getProductAttributeByIdApi,
  updateVariantStatusApi,
  bulkUpdateVariantStatusApi,
} from "../../util/api";
import VariantCard from "./VariantCard";
import styles from "./VariantsManager.module.css";

const { Option } = Select;

const VariantsManager = memo(
  ({ variants, productId, categoryId, onUpdate }) => {
    const [expandedRows, setExpandedRows] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createFormData, setCreateFormData] = useState({});
    const [attributes, setAttributes] = useState([]);
    const [attributeDetails, setAttributeDetails] = useState({});
    const [editingAttributes, setEditingAttributes] = useState({});
    const [selectedVariants, setSelectedVariants] = useState([]);

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

    const handleToggleVariantStatus = useCallback(
      async (variantId, isActive) => {
        try {
          await updateVariantStatusApi(productId, variantId, isActive);
          notification.success({
            message: "Thành công",
            description: `${
              isActive ? "Kích hoạt" : "Vô hiệu hóa"
            } biến thể thành công`,
            placement: "topRight",
          });
          onUpdate?.();
        } catch (error) {
          console.error("Error updating variant status:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể cập nhật trạng thái biến thể",
            placement: "topRight",
          });
        }
      },
      [productId, onUpdate]
    );

    const handleBulkUpdateStatus = useCallback(
      async (isActive) => {
        if (selectedVariants.length === 0) {
          notification.warning({
            message: "Cảnh báo",
            description: "Vui lòng chọn ít nhất một biến thể",
            placement: "topRight",
          });
          return;
        }

        try {
          await bulkUpdateVariantStatusApi(
            productId,
            selectedVariants,
            isActive
          );
          notification.success({
            message: "Thành công",
            description: `${isActive ? "Kích hoạt" : "Vô hiệu hóa"} ${
              selectedVariants.length
            } biến thể thành công`,
            placement: "topRight",
          });
          setSelectedVariants([]);
          onUpdate?.();
        } catch (error) {
          console.error("Error bulk updating variant status:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể cập nhật trạng thái hàng loạt",
            placement: "topRight",
          });
        }
      },
      [productId, selectedVariants, onUpdate]
    );

    const handleSelectVariant = useCallback((variantId, checked) => {
      setSelectedVariants((prev) =>
        checked ? [...prev, variantId] : prev.filter((id) => id !== variantId)
      );
    }, []);

    const handleSelectAll = useCallback(
      (checked) => {
        setSelectedVariants(checked ? variants.map((v) => v.id) : []);
      },
      [variants]
    );

    return (
      <div className={styles.variantsManager}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <TagsOutlined /> Biến thể sản phẩm ({variants?.length || 0})
          </h3>
          <div className={styles.headerActions}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={styles.addBtn}
            >
              {showCreateForm ? "Hủy" : "Thêm biến thể"}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {variants && variants.length > 0 && (
          <div className={styles.bulkActions}>
            <Checkbox
              checked={selectedVariants.length === variants.length}
              indeterminate={
                selectedVariants.length > 0 &&
                selectedVariants.length < variants.length
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              Chọn tất cả ({selectedVariants.length}/{variants.length})
            </Checkbox>
            {selectedVariants.length > 0 && (
              <div className={styles.bulkActionsButtons}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleBulkUpdateStatus(true)}
                >
                  Kích hoạt ({selectedVariants.length})
                </Button>
                <Button
                  size="small"
                  onClick={() => handleBulkUpdateStatus(false)}
                >
                  Vô hiệu hóa ({selectedVariants.length})
                </Button>
              </div>
            )}
          </div>
        )}

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
                    <div
                      key={attr.id}
                      className={styles.formGroup}
                      style={!attr.isActive ? { opacity: 0.6 } : {}}
                    >
                      <label>
                        {attr.name}
                        {!attr.isActive && (
                          <span
                            style={{
                              color: "#ff4d4f",
                              fontSize: "12px",
                              marginLeft: "8px",
                            }}
                          >
                            (Không hoạt động)
                          </span>
                        )}
                      </label>
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
                        disabled={!attr.isActive}
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
                productId={productId}
                isExpanded={expandedRows.includes(variant.id)}
                isSelected={selectedVariants.includes(variant.id)}
                onToggleExpand={toggleExpand}
                onToggleStatus={handleToggleVariantStatus}
                onSelect={handleSelectVariant}
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
