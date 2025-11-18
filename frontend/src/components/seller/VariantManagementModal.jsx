import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Table,
  Select,
  Tag,
  notification,
  Popconfirm,
  Space,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
  addAttributeToVariantApi,
  removeAttributeFromVariantApi,
  getProductAttributesByCategoryApi,
  getProductAttributeByIdApi,
} from "../../util/api";
import styles from "./VariantManagementModal.module.css";

const { Option } = Select;
const { Panel } = Collapse;

const VariantManagementModal = ({
  visible,
  onClose,
  productId,
  categoryId,
  variants: initialVariants = [],
}) => {
  const [form] = Form.useForm();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeDetails, setAttributeDetails] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    if (visible && productId) {
      // Use variants from props instead of fetching
      setVariants(initialVariants);
      if (categoryId) {
        fetchAttributes();
      }
    }
  }, [visible, productId, categoryId, initialVariants]);

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

  const handleAddVariant = () => {
    setShowForm(true);
    setEditingVariant(null);
    form.resetFields();
    setSelectedAttributes({});
  };

  const handleEditVariant = (variant) => {
    setShowForm(true);
    setEditingVariant(variant);
    form.setFieldsValue({
      variantName: variant.variantName,
      sku: variant.sku,
      price: variant.price,
      originalPrice: variant.originalPrice,
      stockQuantity: variant.stockQuantity,
    });

    // Load variant attributes from attributeValues
    const variantAttrs = {};
    variant.attributeValues?.forEach((attr) => {
      variantAttrs[attr.attributeId] = attr.value;
    });
    setSelectedAttributes(variantAttrs);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVariant(null);
    form.resetFields();
    setSelectedAttributes({});
  };

  const handleSubmitForm = async (values) => {
    try {
      const variantData = {
        variantName: values.variantName,
        sku: values.sku,
        price: values.price,
        originalPrice: values.originalPrice || values.price,
        stockQuantity: values.stockQuantity || 0,
      };

      if (editingVariant) {
        // Update variant
        await updateVariantApi(productId, editingVariant.id, variantData);

        // Update attributes
        const currentAttrIds =
          editingVariant.attributeValues?.map((a) => a.attributeId) || [];
        const newAttrIds = Object.keys(selectedAttributes);

        // Remove old attributes
        for (const attrId of currentAttrIds) {
          if (!newAttrIds.includes(attrId)) {
            await removeAttributeFromVariantApi(
              productId,
              editingVariant.id,
              attrId
            );
          }
        }

        // Add/update new attributes
        for (const [attrId, value] of Object.entries(selectedAttributes)) {
          if (value) {
            await addAttributeToVariantApi(productId, editingVariant.id, {
              attributeId: attrId,
              value: value,
            });
          }
        }

        notification.success({
          message: "Thành công",
          description: "Cập nhật biến thể thành công",
          placement: "topRight",
        });
      } else {
        // Create variant
        const response = await createVariantApi(productId, variantData);

        if (response?.code === 1000 && response.result?.id) {
          const variantId = response.result.id;

          // Add attributes to new variant
          for (const [attrId, value] of Object.entries(selectedAttributes)) {
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
      }

      handleCancelForm();
      // Notify parent to reload product data
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving variant:", error);
      notification.error({
        message: "Lỗi",
        description: editingVariant
          ? "Không thể cập nhật biến thể"
          : "Không thể tạo biến thể",
        placement: "topRight",
      });
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await deleteVariantApi(productId, variantId);
      notification.success({
        message: "Thành công",
        description: "Xóa biến thể thành công",
        placement: "topRight",
      });
      // Notify parent to reload product data
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa biến thể",
        placement: "topRight",
      });
    }
  };

  const handleAttributeChange = async (attributeId, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]: value,
    }));

    // Fetch attribute details if not loaded
    if (!attributeDetails[attributeId]) {
      await fetchAttributeDetail(attributeId);
    }
  };

  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 120,
    },
    {
      title: "Tên biến thể",
      dataIndex: "variantName",
      key: "variantName",
      width: 200,
    },
    {
      title: "Thuộc tính",
      key: "attributeValues",
      render: (_, record) => (
        <>
          {record.attributeValues && record.attributeValues.length > 0 ? (
            record.attributeValues.map((attr) => (
              <Tag key={attr.id} color="blue" style={{ marginBottom: "4px" }}>
                {attr.attributeName}: {attr.value}
              </Tag>
            ))
          ) : (
            <span style={{ color: "#999" }}>-</span>
          )}
        </>
      ),
      width: 250,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span style={{ color: "#ee4d2d", fontWeight: "bold" }}>
          ₫{price?.toLocaleString("vi-VN")}
        </span>
      ),
      width: 120,
    },
    {
      title: "Giá gốc",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (price) => <span>₫{price?.toLocaleString("vi-VN")}</span>,
      width: 120,
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (stock) => (
        <span
          style={{
            color: stock < 10 ? "#ff4d4f" : "#52c41a",
            fontWeight: "bold",
          }}
        >
          {stock}
        </span>
      ),
      width: 80,
    },
    {
      title: "Đã bán",
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      width: 80,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditVariant(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa biến thể?"
            description="Bạn có chắc chắn muốn xóa biến thể này?"
            onConfirm={() => handleDeleteVariant(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className={styles.modalHeader}>
          <TagsOutlined />
          <span>Quản lý biến thể sản phẩm</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      className={styles.variantModal}
    >
      <div className={styles.modalContent}>
        {!showForm && (
          <div className={styles.tableHeader}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariant}
              className={styles.addBtn}
            >
              Thêm biến thể
            </Button>
          </div>
        )}

        {showForm ? (
          <div className={styles.formContainer}>
            <h3 className={styles.formTitle}>
              {editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"}
            </h3>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitForm}
              className={styles.variantForm}
            >
              <Form.Item
                label="Tên biến thể"
                name="variantName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên biến thể" },
                  { min: 3, max: 255, message: "Tên từ 3-255 ký tự" },
                ]}
              >
                <Input placeholder="Ví dụ: iPhone 15 Pro Max - Xanh - 256GB" />
              </Form.Item>

              <Form.Item
                label="Mã SKU"
                name="sku"
                rules={[
                  { required: true, message: "Vui lòng nhập mã SKU" },
                  { min: 3, max: 50, message: "SKU từ 3-50 ký tự" },
                ]}
              >
                <Input placeholder="Ví dụ: IP15PM-BL-256" />
              </Form.Item>

              <div className={styles.formRow}>
                <Form.Item
                  label="Giá bán"
                  name="price"
                  rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                    placeholder="Nhập giá bán"
                  />
                </Form.Item>

                <Form.Item
                  label="Giá gốc"
                  name="originalPrice"
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                    placeholder="Nhập giá gốc"
                  />
                </Form.Item>

                <Form.Item
                  label="Số lượng tồn kho"
                  name="stockQuantity"
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Nhập số lượng"
                  />
                </Form.Item>
              </div>

              {/* Attributes Section */}
              {attributes.length > 0 && (
                <div className={styles.attributesSection}>
                  <h4 className={styles.attributesTitle}>
                    <TagsOutlined /> Thuộc tính biến thể
                  </h4>
                  <Collapse
                    defaultActiveKey={["1"]}
                    className={styles.attributesCollapse}
                  >
                    <Panel header="Chọn thuộc tính" key="1">
                      <div className={styles.attributesGrid}>
                        {attributes.map((attr) => (
                          <Form.Item
                            key={attr.id}
                            label={attr.name}
                            className={styles.attributeItem}
                          >
                            <Select
                              placeholder={`Chọn ${attr.name}`}
                              value={selectedAttributes[attr.id] || undefined}
                              onChange={(value) =>
                                handleAttributeChange(attr.id, value)
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
                          </Form.Item>
                        ))}
                      </div>
                    </Panel>
                  </Collapse>
                </div>
              )}

              <Form.Item className={styles.formActions}>
                <Space>
                  <Button onClick={handleCancelForm} icon={<CloseOutlined />}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                  >
                    {editingVariant ? "Cập nhật" : "Tạo biến thể"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={variants}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} biến thể`,
            }}
            locale={{
              emptyText: "Chưa có biến thể nào",
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default VariantManagementModal;
