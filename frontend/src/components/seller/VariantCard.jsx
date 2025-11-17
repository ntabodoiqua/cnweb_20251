import { memo, useCallback } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  DownOutlined,
  RightOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Input, InputNumber, Popconfirm, Select, Button, Tag } from "antd";
import styles from "./VariantsManager.module.css";

const { Option } = Select;

const VariantCard = memo(
  ({
    variant,
    isExpanded,
    isEditing,
    editingData,
    addingAttribute,
    attributes,
    attributeDetails,
    onToggleExpand,
    onEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    onEditingDataChange,
    onAddAttribute,
    onRemoveAttribute,
    onAddingAttributeChange,
  }) => {
    const handleToggle = useCallback(() => {
      onToggleExpand(variant.id);
    }, [variant.id, onToggleExpand]);

    const handleEdit = useCallback(() => {
      onEdit(variant);
    }, [variant, onEdit]);

    const handleSave = useCallback(() => {
      onSaveEdit(variant.id);
    }, [variant.id, onSaveEdit]);

    const handleDelete = useCallback(() => {
      onDelete(variant.id);
    }, [variant.id, onDelete]);

    return (
      <div
        className={`${styles.variantCard} ${
          !variant.active ? styles.inactiveVariant : ""
        }`}
      >
        {/* Main Row */}
        <div className={styles.variantRow}>
          <button className={styles.expandBtn} onClick={handleToggle}>
            {isExpanded ? <DownOutlined /> : <RightOutlined />}
          </button>

          <div className={styles.variantInfo}>
            {isEditing ? (
              // Edit Mode - Full Width Form
              <div className={styles.editFormContainer}>
                <div className={styles.editFormGrid}>
                  <div className={styles.editFormGroup}>
                    <label>Tên biến thể *</label>
                    <Input
                      placeholder="Tên biến thể"
                      value={editingData.variantName}
                      onChange={(e) =>
                        onEditingDataChange({
                          ...editingData,
                          variantName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Giá bán *</label>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Giá bán"
                      value={editingData.price}
                      onChange={(value) =>
                        onEditingDataChange({ ...editingData, price: value })
                      }
                      formatter={(value) =>
                        `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Giá gốc</label>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Giá gốc"
                      value={editingData.originalPrice}
                      onChange={(value) =>
                        onEditingDataChange({
                          ...editingData,
                          originalPrice: value,
                        })
                      }
                      formatter={(value) =>
                        `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Tồn kho</label>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Tồn kho"
                      value={editingData.stockQuantity}
                      onChange={(value) =>
                        onEditingDataChange({
                          ...editingData,
                          stockQuantity: value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Attribute Management in Edit Mode */}
                {attributes.length > 0 && (
                  <div className={styles.editAttributesSection}>
                    <h5>Thuộc tính biến thể</h5>
                    <div className={styles.currentAttributes}>
                      {variant.attributeValues &&
                      variant.attributeValues.length > 0 ? (
                        variant.attributeValues.map((attr) => (
                          <div key={attr.id} className={styles.attributeItem}>
                            <Tag color="blue" className={styles.attributeTag}>
                              {attr.attributeName}: {attr.value}
                            </Tag>
                            <Button
                              size="small"
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() =>
                                onRemoveAttribute(
                                  variant.id,
                                  attr.attributeId,
                                  attr.value
                                )
                              }
                            >
                              Xóa
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyAttributes}>
                          Chưa có thuộc tính nào
                        </div>
                      )}
                    </div>

                    {/* Add Attribute in Edit Mode */}
                    <div className={styles.addAttributeForm}>
                      <Select
                        placeholder="Chọn thuộc tính"
                        style={{ width: "200px" }}
                        onChange={(attrId) => {
                          onAddingAttributeChange({
                            ...addingAttribute,
                            [`${variant.id}_selectedAttr`]: attrId,
                            [`${variant.id}_selectedValue`]: undefined,
                          });
                        }}
                        value={addingAttribute[`${variant.id}_selectedAttr`]}
                      >
                        {attributes
                          .filter(
                            (attr) =>
                              !variant.attributeValues?.find(
                                (av) => av.attributeId === attr.id
                              )
                          )
                          .map((attr) => (
                            <Option key={attr.id} value={attr.id}>
                              {attr.name}
                            </Option>
                          ))}
                      </Select>

                      {addingAttribute[`${variant.id}_selectedAttr`] && (
                        <>
                          <Select
                            placeholder="Chọn giá trị"
                            style={{ width: "200px" }}
                            onChange={(value) =>
                              onAddingAttributeChange({
                                ...addingAttribute,
                                [`${variant.id}_selectedValue`]: value,
                              })
                            }
                            value={
                              addingAttribute[`${variant.id}_selectedValue`]
                            }
                          >
                            {(
                              attributeDetails[
                                addingAttribute[`${variant.id}_selectedAttr`]
                              ]?.values || []
                            ).map((valueObj) => (
                              <Option
                                key={valueObj.id}
                                value={valueObj.value}
                                disabled={!valueObj.isActive}
                              >
                                {valueObj.value}
                                {!valueObj.isActive && " (Không hoạt động)"}
                              </Option>
                            ))}
                          </Select>

                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              if (
                                addingAttribute[`${variant.id}_selectedAttr`] &&
                                addingAttribute[`${variant.id}_selectedValue`]
                              ) {
                                onAddAttribute(
                                  variant.id,
                                  addingAttribute[`${variant.id}_selectedAttr`],
                                  addingAttribute[`${variant.id}_selectedValue`]
                                );
                                onAddingAttributeChange({
                                  ...addingAttribute,
                                  [`${variant.id}_selectedAttr`]: undefined,
                                  [`${variant.id}_selectedValue`]: undefined,
                                });
                              }
                            }}
                            disabled={
                              !addingAttribute[`${variant.id}_selectedAttr`] ||
                              !addingAttribute[`${variant.id}_selectedValue`]
                            }
                          >
                            Thêm
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // View Mode
              <>
                <div className={styles.variantName}>
                  {variant.variantName}
                  {!variant.active && (
                    <Tag color="default" style={{ marginLeft: "8px" }}>
                      Ngừng bán
                    </Tag>
                  )}
                </div>
                <div className={styles.variantMeta}>
                  <span className={styles.sku}>{variant.sku}</span>
                  <span className={styles.price}>
                    ₫{variant.price?.toLocaleString("vi-VN")}
                  </span>
                  {variant.originalPrice !== variant.price && (
                    <span className={styles.originalPrice}>
                      ₫{variant.originalPrice?.toLocaleString("vi-VN")}
                    </span>
                  )}
                  <span
                    className={
                      variant.stockQuantity < 10
                        ? styles.lowStock
                        : styles.inStock
                    }
                  >
                    Kho: {variant.stockQuantity}
                  </span>
                  <span className={styles.sold}>
                    Đã bán: {variant.soldQuantity}
                  </span>
                  {variant.active ? (
                    <Tag color="success">Đang bán</Tag>
                  ) : (
                    <Tag color="default">Ngừng bán</Tag>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={styles.actions}>
            {isEditing ? (
              <>
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSave}
                >
                  Lưu
                </Button>
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={onCancelEdit}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xác nhận xóa biến thể?"
                  description="Bạn có chắc chắn muốn xóa biến thể này?"
                  onConfirm={handleDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              </>
            )}
          </div>
        </div>

        {/* Expanded Attributes Section */}
        {isExpanded && !isEditing && (
          <div className={styles.expandedContent}>
            <div className={styles.attributesHeader}>
              <h5>Thuộc tính biến thể</h5>
            </div>

            <div className={styles.attributesList}>
              {variant.attributeValues && variant.attributeValues.length > 0 ? (
                variant.attributeValues.map((attr) => (
                  <div key={attr.id} className={styles.attributeItem}>
                    <Tag color="blue" className={styles.attributeTag}>
                      {attr.attributeName}: {attr.value}
                    </Tag>
                  </div>
                ))
              ) : (
                <div className={styles.emptyAttributes}>
                  Chưa có thuộc tính nào. Bấm "Sửa" để thêm thuộc tính.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

VariantCard.displayName = "VariantCard";

export default VariantCard;
