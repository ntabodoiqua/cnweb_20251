import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Tag,
  Popconfirm,
  notification,
  Tooltip,
  Divider,
  Empty,
  Spin,
  ColorPicker,
  Badge,
  Collapse,
  List,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  BgColorsOutlined,
  LinkOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getSelectionGroupsApi,
  createSelectionGroupApi,
  updateSelectionGroupApi,
  deleteSelectionGroupApi,
  getSelectionGroupDetailApi,
} from "../../util/api";
import VariantLinkModal from "./VariantLinkModal";
import styles from "./ProductSelectionGroupsSection.module.css";

const ProductSelectionGroupsSection = ({ productId }) => {
  const [loading, setLoading] = useState(false);
  const [selectionGroups, setSelectionGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form] = Form.useForm();

  // Variant Link Modal state
  const [variantLinkModal, setVariantLinkModal] = useState({
    visible: false,
    groupId: null,
    option: null,
    linkedVariantIds: [],
    allOptionsInGroup: [],
  });

  // Expanded groups for showing options
  const [expandedGroups, setExpandedGroups] = useState([]);

  const fetchSelectionGroups = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const response = await getSelectionGroupsApi(productId);
      if (response.code === 1000) {
        setSelectionGroups(response.result || []);
      }
    } catch (error) {
      console.error("Error fetching selection groups:", error);
      // Don't show error if 404 - means no groups yet
      if (error.response?.status !== 404) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách nhóm lựa chọn",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch group detail with linked variants
  const fetchGroupDetail = useCallback(
    async (groupId) => {
      try {
        const response = await getSelectionGroupDetailApi(productId, groupId);
        if (response.code === 1000) {
          // Update the selection group in state with detailed info
          setSelectionGroups((prev) =>
            prev.map((g) =>
              (g.groupId || g.id) === groupId
                ? { ...g, ...response.result, detailLoaded: true }
                : g
            )
          );
        }
      } catch (error) {
        console.error("Error fetching group detail:", error);
      }
    },
    [productId]
  );

  useEffect(() => {
    fetchSelectionGroups();
  }, [fetchSelectionGroups]);

  // Handle expand row - fetch detail if needed
  const handleExpandRow = useCallback(
    (expanded, record) => {
      const groupId = record.groupId || record.id;
      if (expanded) {
        setExpandedGroups((prev) => [...prev, groupId]);
        // Fetch detail if not loaded yet
        if (!record.detailLoaded) {
          fetchGroupDetail(groupId);
        }
      } else {
        setExpandedGroups((prev) => prev.filter((id) => id !== groupId));
      }
    },
    [fetchGroupDetail]
  );

  // Open variant link modal
  const handleOpenVariantLinkModal = useCallback(
    (groupId, option, allOptions) => {
      setVariantLinkModal({
        visible: true,
        groupId,
        option,
        linkedVariantIds: option.linkedVariantIds || [],
        allOptionsInGroup: allOptions || [],
      });
    },
    []
  );

  // Close variant link modal
  const handleCloseVariantLinkModal = useCallback(() => {
    setVariantLinkModal({
      visible: false,
      groupId: null,
      option: null,
      linkedVariantIds: [],
      allOptionsInGroup: [],
    });
  }, []);

  // On variant link success
  const handleVariantLinkSuccess = useCallback(() => {
    // Refresh the group detail
    if (variantLinkModal.groupId) {
      fetchGroupDetail(variantLinkModal.groupId);
    }
  }, [variantLinkModal.groupId, fetchGroupDetail]);

  const handleOpenModal = async (group = null) => {
    if (group) {
      // Fetch full detail when editing
      setLoadingDetail(true);
      setModalVisible(true);
      try {
        const response = await getSelectionGroupDetailApi(
          productId,
          group.id || group.groupId
        );
        if (response.code === 1000) {
          const groupDetail = response.result;
          setEditingGroup(groupDetail);
          form.setFieldsValue({
            name: groupDetail.name,
            description: groupDetail.description,
            displayOrder: groupDetail.displayOrder,
            isRequired: groupDetail.required ?? true,
            allowMultiple: groupDetail.allowMultiple ?? false,
            affectsVariant: groupDetail.affectsVariant ?? true,
            options:
              groupDetail.options?.map((opt) => ({
                id: opt.id,
                value: opt.value,
                label: opt.label,
                colorCode: opt.colorCode,
                imageUrl: opt.imageUrl,
                displayOrder: opt.displayOrder,
              })) || [],
          });
        }
      } catch (error) {
        console.error("Error fetching group detail:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải chi tiết nhóm lựa chọn",
        });
        setModalVisible(false);
      } finally {
        setLoadingDetail(false);
      }
    } else {
      setEditingGroup(null);
      form.resetFields();
      form.setFieldsValue({
        displayOrder: selectionGroups.length + 1,
        isRequired: true,
        allowMultiple: false,
        affectsVariant: true,
        options: [{ value: "", label: "", displayOrder: 1 }],
      });
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingGroup(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        displayOrder: values.displayOrder,
        isRequired: values.isRequired,
        allowMultiple: values.allowMultiple,
        affectsVariant: values.affectsVariant,
        options:
          values.options?.map((opt, index) => ({
            value: opt.value,
            label: opt.label || opt.value,
            colorCode:
              typeof opt.colorCode === "string"
                ? opt.colorCode
                : opt.colorCode?.toHexString?.() || null,
            imageUrl: opt.imageUrl || null,
            displayOrder: opt.displayOrder || index + 1,
          })) || [],
      };

      if (editingGroup) {
        await updateSelectionGroupApi(
          productId,
          editingGroup.groupId || editingGroup.id,
          payload
        );
        notification.success({
          message: "Thành công",
          description: "Cập nhật nhóm lựa chọn thành công!",
        });
      } else {
        await createSelectionGroupApi(productId, payload);
        notification.success({
          message: "Thành công",
          description: "Tạo nhóm lựa chọn thành công!",
        });
      }

      handleCloseModal();
      fetchSelectionGroups();
    } catch (error) {
      console.error("Error saving selection group:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể lưu nhóm lựa chọn",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (groupId) => {
    try {
      await deleteSelectionGroupApi(productId, groupId);
      notification.success({
        message: "Thành công",
        description: "Xóa nhóm lựa chọn thành công!",
      });
      fetchSelectionGroups();
    } catch (error) {
      console.error("Error deleting selection group:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể xóa nhóm lựa chọn",
      });
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 70,
      align: "center",
    },
    {
      title: "Tên nhóm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <strong>{text || record.groupName}</strong>
          {record.description && (
            <div style={{ fontSize: 12, color: "#888" }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tùy chọn",
      dataIndex: "options",
      key: "options",
      render: (options) => (
        <Space wrap size="small">
          {options?.slice(0, 5).map((opt, index) => (
            <Tag
              key={index}
              color={opt.colorCode ? undefined : "blue"}
              style={
                opt.colorCode
                  ? {
                      backgroundColor: opt.colorCode,
                      color: getContrastColor(opt.colorCode),
                    }
                  : undefined
              }
            >
              {opt.colorCode && (
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: opt.colorCode,
                    marginRight: 4,
                    border: "1px solid #d9d9d9",
                  }}
                />
              )}
              {opt.label || opt.value}
            </Tag>
          ))}
          {options?.length > 5 && <Tag>+{options.length - 5} khác</Tag>}
        </Space>
      ),
    },
    {
      title: "Bắt buộc",
      dataIndex: "required",
      key: "required",
      width: 100,
      align: "center",
      render: (value, record) =>
        value ?? record.isRequired ? (
          <Tag color="red" icon={<CheckCircleOutlined />}>
            Có
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />}>Không</Tag>
        ),
    },
    {
      title: "Ảnh hưởng Variant",
      dataIndex: "affectsVariant",
      key: "affectsVariant",
      width: 140,
      align: "center",
      render: (value) =>
        value ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Có
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />}>Không</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Liên kết Variants">
            <Button
              type="text"
              icon={<LinkOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleExpandRow(true, record);
              }}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa nhóm lựa chọn?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.groupId || record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Render expanded row content - Options list with variant linking
  const renderExpandedRow = (record) => {
    const options = record.options || [];
    const groupId = record.groupId || record.id;

    if (!record.detailLoaded) {
      return (
        <div className={styles.expandedLoading}>
          <Spin tip="Đang tải thông tin chi tiết..." />
        </div>
      );
    }

    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedHeader}>
          <Space>
            <AppstoreOutlined />
            <span>Quản lý tùy chọn và liên kết Variants</span>
            <Tag color="purple">{options.length} tùy chọn</Tag>
          </Space>
        </div>

        {options.length === 0 ? (
          <Empty
            description="Chưa có tùy chọn nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className={styles.optionsGrid}>
            {options.map((option) => {
              const linkedCount = option.linkedVariantIds?.length || 0;
              const hasLinks = linkedCount > 0;

              return (
                <div
                  key={option.id}
                  className={`${styles.optionCard} ${
                    hasLinks ? styles.optionCardLinked : ""
                  }`}
                >
                  <div className={styles.optionHeader}>
                    <div className={styles.optionInfo}>
                      {option.colorCode && (
                        <span
                          className={styles.colorDot}
                          style={{ backgroundColor: option.colorCode }}
                        />
                      )}
                      <span className={styles.optionLabel}>
                        {option.label || option.value}
                      </span>
                      {option.value !== option.label && option.label && (
                        <span className={styles.optionValue}>
                          ({option.value})
                        </span>
                      )}
                    </div>
                    <Badge
                      count={linkedCount}
                      showZero
                      style={{
                        backgroundColor: hasLinks ? "#52c41a" : "#d9d9d9",
                        marginRight: 8,
                      }}
                    />
                  </div>

                  <div className={styles.optionBody}>
                    {hasLinks ? (
                      <div className={styles.linkedInfo}>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <span>{linkedCount} biến thể được liên kết</span>
                      </div>
                    ) : (
                      <div className={styles.noLinkInfo}>
                        <CloseCircleOutlined style={{ color: "#faad14" }} />
                        <span>Chưa liên kết biến thể</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.optionActions}>
                    <Button
                      type={hasLinks ? "default" : "primary"}
                      icon={<LinkOutlined />}
                      size="small"
                      onClick={() =>
                        handleOpenVariantLinkModal(groupId, option, options)
                      }
                    >
                      {hasLinks ? "Quản lý liên kết" : "Liên kết Variants"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get contrast color for text
  const getContrastColor = (hexColor) => {
    if (!hexColor) return "#000";
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000" : "#fff";
  };

  return (
    <Card
      className={styles.selectionGroupsCard}
      title={
        <Space>
          <SettingOutlined />
          <span>Nhóm lựa chọn (Selection Groups)</span>
          <Tag color="blue">{selectionGroups.length} nhóm</Tag>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Thêm nhóm
        </Button>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin tip="Đang tải..." />
        </div>
      ) : selectionGroups.length === 0 ? (
        <Empty
          description="Chưa có nhóm lựa chọn nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Tạo nhóm lựa chọn đầu tiên
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={selectionGroups}
          rowKey={(record) => record.groupId || record.id}
          pagination={false}
          size="middle"
          expandable={{
            expandedRowRender: renderExpandedRow,
            expandedRowKeys: expandedGroups,
            onExpand: handleExpandRow,
            expandRowByClick: false,
          }}
        />
      )}

      {/* Variant Link Modal */}
      <VariantLinkModal
        visible={variantLinkModal.visible}
        onClose={handleCloseVariantLinkModal}
        productId={productId}
        groupId={variantLinkModal.groupId}
        option={variantLinkModal.option}
        linkedVariantIds={variantLinkModal.linkedVariantIds}
        allOptionsInGroup={variantLinkModal.allOptionsInGroup}
        onSuccess={handleVariantLinkSuccess}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingGroup ? "Chỉnh sửa nhóm lựa chọn" : "Tạo nhóm lựa chọn mới"
        }
        open={modalVisible}
        onCancel={handleCloseModal}
        width={700}
        footer={null}
        destroyOnClose
      >
        {loadingDetail ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin tip="Đang tải chi tiết nhóm lựa chọn..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isRequired: true,
              allowMultiple: false,
              affectsVariant: true,
              displayOrder: 1,
              options: [{ value: "", label: "", displayOrder: 1 }],
            }}
          >
            <Form.Item
              label="Tên nhóm"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
            >
              <Input placeholder="VD: Màu sắc, Kích thước, Mẫu điện thoại..." />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={2}
                placeholder="Mô tả cho nhóm lựa chọn này (tùy chọn)"
              />
            </Form.Item>

            <Space size="large" style={{ width: "100%", marginBottom: 16 }}>
              <Form.Item
                label="Thứ tự hiển thị"
                name="displayOrder"
                rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber min={1} style={{ width: 100 }} />
              </Form.Item>

              <Form.Item
                label="Bắt buộc chọn"
                name="isRequired"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>

              <Form.Item
                label="Cho phép chọn nhiều"
                name="allowMultiple"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>

              <Form.Item
                label="Ảnh hưởng Variant"
                name="affectsVariant"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Space>

            <Divider>Các tùy chọn</Divider>

            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} className={styles.optionRow}>
                      <Space align="start" style={{ width: "100%" }} wrap>
                        <Form.Item
                          {...restField}
                          name={[name, "value"]}
                          rules={[{ required: true, message: "Nhập giá trị" }]}
                          style={{ marginBottom: 8, flex: 1, minWidth: 150 }}
                        >
                          <Input placeholder="Giá trị (VD: Đỏ)" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "label"]}
                          style={{ marginBottom: 8, flex: 1, minWidth: 150 }}
                        >
                          <Input placeholder="Nhãn hiển thị (VD: Red)" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "colorCode"]}
                          style={{ marginBottom: 8 }}
                        >
                          <ColorPicker
                            format="hex"
                            showText
                            allowClear
                            presets={[
                              {
                                label: "Màu phổ biến",
                                colors: [
                                  "#000000",
                                  "#FFFFFF",
                                  "#FF0000",
                                  "#00FF00",
                                  "#0000FF",
                                  "#FFFF00",
                                  "#FF00FF",
                                  "#00FFFF",
                                  "#FFA500",
                                  "#800080",
                                  "#B2A696",
                                  "#3C4452",
                                  "#1E1E1E",
                                  "#F5F5DC",
                                  "#C0C0C0",
                                ],
                              },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "displayOrder"]}
                          style={{ marginBottom: 8, width: 80 }}
                        >
                          <InputNumber
                            min={1}
                            placeholder="STT"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>

                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </Space>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          value: "",
                          label: "",
                          displayOrder: fields.length + 1,
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm tùy chọn
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Divider />

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCloseModal}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingGroup ? "Cập nhật" : "Tạo nhóm"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default ProductSelectionGroupsSection;
