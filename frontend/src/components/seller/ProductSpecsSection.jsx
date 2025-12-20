import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Tag,
  Empty,
  notification,
  Collapse,
  Tooltip,
  Popconfirm,
  Dropdown,
  Alert,
} from "antd";
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  DownOutlined,
  ImportOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { getProductSpecsApi, updateProductSpecsApi } from "../../util/api";
import styles from "./ProductSpecsSection.module.css";

const { Option } = Select;
const { TextArea } = Input;

// Data types
const DATA_TYPES = [
  { value: "string", label: "Văn bản" },
  { value: "number", label: "Số" },
  { value: "boolean", label: "Có/Không" },
];

const ProductSpecsSection = ({ productId }) => {
  const [specs, setSpecs] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [form] = Form.useForm();

  // Import JSON modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");

  // Lấy tất cả các nhóm từ specs hiện có
  const allGroups = useMemo(() => {
    const groupsMap = new Map();

    Object.values(specs).forEach((spec) => {
      if (spec.group && !groupsMap.has(spec.group)) {
        groupsMap.set(spec.group, {
          key: spec.group,
          labelVi: spec.groupLabelVi || spec.group,
          labelEn: spec.groupLabelEn || spec.group,
        });
      }
    });

    return Array.from(groupsMap.values());
  }, [specs]);

  useEffect(() => {
    if (productId) {
      fetchSpecs();
    }
  }, [productId]);

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      const response = await getProductSpecsApi(productId);
      if (response && response.result) {
        setSpecs(response.result.specs || {});
      }
    } catch (error) {
      console.error("Error fetching specs:", error);
      // Don't show error for 404 - product may not have specs yet
      if (error.response?.status !== 404) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải thông số sản phẩm",
          placement: "topRight",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpecs = async (updatedSpecs) => {
    try {
      setSaving(true);
      await updateProductSpecsApi(productId, { specs: updatedSpecs });
      setSpecs(updatedSpecs);
      notification.success({
        message: "Thành công",
        description: "Đã cập nhật thông số sản phẩm",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error saving specs:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu thông số sản phẩm",
        placement: "topRight",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (specKey = null) => {
    if (specKey && specs[specKey]) {
      // Edit existing spec
      const spec = specs[specKey];
      setEditingSpec(specKey);
      form.setFieldsValue({
        key: specKey,
        value: spec.value,
        labelEn: spec.labelEn,
        labelVi: spec.labelVi,
        dataType: spec.dataType || "string",
        unit: spec.unit || "",
        displayOrder: spec.displayOrder || 1,
        showInList: spec.showInList !== false,
        group: spec.groupLabelVi || spec.group || "Khác",
      });
    } else {
      // Add new spec
      setEditingSpec(null);
      form.resetFields();
      form.setFieldsValue({
        dataType: "string",
        displayOrder: Object.keys(specs).length + 1,
        showInList: false,
        group: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSpec(null);
    form.resetFields();
  };

  const handleSubmitSpec = async (values) => {
    // Tạo key từ tên nhóm
    const groupKey = values.group
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    const specData = {
      key: values.key,
      value:
        values.dataType === "number"
          ? Number(values.value)
          : values.dataType === "boolean"
          ? Boolean(values.value)
          : values.value,
      labelEn: values.labelEn,
      labelVi: values.labelVi,
      dataType: values.dataType,
      unit: values.unit || undefined,
      displayOrder: values.displayOrder,
      showInList: values.showInList,
      group: groupKey,
      groupLabelEn: values.group,
      groupLabelVi: values.group,
    };

    const updatedSpecs = { ...specs };

    // If editing and key changed, remove old key
    if (editingSpec && editingSpec !== values.key) {
      delete updatedSpecs[editingSpec];
    }

    updatedSpecs[values.key] = specData;

    await handleSaveSpecs(updatedSpecs);
    handleCloseModal();
  };

  const handleDeleteSpec = async (specKey) => {
    const updatedSpecs = { ...specs };
    delete updatedSpecs[specKey];
    await handleSaveSpecs(updatedSpecs);
  };

  // ===== Import JSON Functions =====
  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportJson("");
    setImportError("");
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportJson("");
    setImportError("");
  };

  const validateAndParseJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate structure
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("JSON phải là một object với các key là tên thông số");
      }

      const validatedSpecs = {};
      let order = Object.keys(specs).length + 1;

      for (const [key, value] of Object.entries(parsed)) {
        // Validate key format
        if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(key)) {
          throw new Error(
            `Key "${key}" không hợp lệ. Key phải bắt đầu bằng chữ và chỉ chứa chữ/số`
          );
        }

        // Handle simple value format: { "key": "value" }
        if (typeof value !== "object" || value === null) {
          const groupKey = "other";
          validatedSpecs[key] = {
            key,
            value: value,
            labelVi: key,
            labelEn: key,
            dataType:
              typeof value === "number"
                ? "number"
                : typeof value === "boolean"
                ? "boolean"
                : "string",
            displayOrder: order++,
            showInList: false,
            group: groupKey,
            groupLabelVi: "Khác",
            groupLabelEn: "Other",
          };
        } else {
          // Handle full spec format
          const spec = value;
          const groupName = spec.group || spec.groupLabelVi || "Khác";
          const groupKey =
            groupName
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/[^a-z0-9]/g, "_")
              .replace(/_+/g, "_")
              .replace(/^_|_$/g, "") || "other";

          validatedSpecs[key] = {
            key,
            value: spec.value !== undefined ? spec.value : "",
            labelVi: spec.labelVi || key,
            labelEn: spec.labelEn || key,
            dataType: spec.dataType || "string",
            unit: spec.unit || undefined,
            displayOrder: spec.displayOrder || order++,
            showInList: spec.showInList || false,
            group: groupKey,
            groupLabelVi: groupName,
            groupLabelEn: spec.groupLabelEn || groupName,
          };
        }
      }

      return validatedSpecs;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.");
      }
      throw error;
    }
  };

  const handleImportJson = async () => {
    try {
      setImportError("");
      const parsedSpecs = validateAndParseJson(importJson);

      // Merge with existing specs
      const updatedSpecs = { ...specs, ...parsedSpecs };

      await handleSaveSpecs(updatedSpecs);
      handleCloseImportModal();

      notification.success({
        message: "Import thành công",
        description: `Đã import ${Object.keys(parsedSpecs).length} thông số`,
        placement: "topRight",
      });
    } catch (error) {
      setImportError(error.message);
    }
  };

  const getExampleJson = () => {
    return JSON.stringify(
      {
        screenSize: {
          value: "6.7",
          labelVi: "Kích thước màn hình",
          labelEn: "Screen Size",
          dataType: "number",
          unit: "inch",
          group: "Màn hình",
          displayOrder: 1,
          showInList: true,
        },
        resolution: {
          value: "2796 x 1290",
          labelVi: "Độ phân giải",
          labelEn: "Resolution",
          dataType: "string",
          group: "Màn hình",
          displayOrder: 2,
        },
        batteryCapacity: {
          value: 4422,
          labelVi: "Dung lượng pin",
          labelEn: "Battery Capacity",
          dataType: "number",
          unit: "mAh",
          group: "Pin & Sạc",
          displayOrder: 1,
        },
      },
      null,
      2
    );
  };

  // Group specs by their group
  const groupedSpecs = Object.entries(specs).reduce((acc, [key, spec]) => {
    const groupKey = spec.group || "other";
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push({ key, ...spec });
    return acc;
  }, {});

  // Sort specs within each group by displayOrder
  Object.keys(groupedSpecs).forEach((groupKey) => {
    groupedSpecs[groupKey].sort(
      (a, b) => (a.displayOrder || 999) - (b.displayOrder || 999)
    );
  });

  const renderSpecValue = (spec) => {
    if (spec.dataType === "boolean") {
      return spec.value ? (
        <Tag color="success">Có</Tag>
      ) : (
        <Tag color="default">Không</Tag>
      );
    }
    if (spec.dataType === "number") {
      return (
        <span>
          {spec.value?.toLocaleString("vi-VN")}
          {spec.unit && <span className={styles.unit}> {spec.unit}</span>}
        </span>
      );
    }
    // Check if value contains newlines
    const hasNewlines =
      typeof spec.value === "string" && spec.value.includes("\n");
    return (
      <span className={hasNewlines ? styles.multilineValue : undefined}>
        {spec.value}
        {spec.unit && <span className={styles.unit}> {spec.unit}</span>}
      </span>
    );
  };

  const collapseItems = allGroups
    .filter((group) => groupedSpecs[group.key]?.length > 0)
    .map((group) => ({
      key: group.key,
      label: (
        <div className={styles.groupHeader}>
          <span className={styles.groupTitle}>
            {group.labelVi}
            {group.isCustom && (
              <Tag color="purple" className={styles.customTag}>
                Tùy chỉnh
              </Tag>
            )}
          </span>
          <Tag color="blue">{groupedSpecs[group.key]?.length || 0}</Tag>
        </div>
      ),
      children: (
        <div className={styles.specsList}>
          {groupedSpecs[group.key]?.map((spec) => (
            <div key={spec.key} className={styles.specItem}>
              <div className={styles.specInfo}>
                <div className={styles.specLabel}>
                  {spec.labelVi}
                  {spec.showInList && (
                    <Tooltip title="Hiển thị trong danh sách">
                      <Tag color="green" className={styles.showTag}>
                        Hiển thị
                      </Tag>
                    </Tooltip>
                  )}
                </div>
                <div className={styles.specValue}>{renderSpecValue(spec)}</div>
              </div>
              <div className={styles.specActions}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(spec.key)}
                  className={styles.editBtn}
                />
                <Popconfirm
                  title="Xóa thông số này?"
                  description="Thao tác này không thể hoàn tác"
                  onConfirm={() => handleDeleteSpec(spec.key)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    className={styles.deleteBtn}
                  />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      ),
    }));

  // Dropdown menu items for add button
  const addMenuItems = [
    {
      key: "add",
      icon: <PlusOutlined />,
      label: "Thêm thông số",
      onClick: () => handleOpenModal(),
    },
    {
      key: "import",
      icon: <ImportOutlined />,
      label: "Import từ JSON",
      onClick: handleOpenImportModal,
    },
  ];

  return (
    <div className={styles.specsSection}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <SettingOutlined className={styles.icon} />
          <h3 className={styles.title}>Thông số kỹ thuật</h3>
        </div>
        <Space>
          <Dropdown menu={{ items: addMenuItems }} placement="bottomRight">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className={styles.addBtn}
            >
              Thêm thông số{" "}
              <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div className={styles.content}>
        {Object.keys(specs).length === 0 ? (
          <Empty
            description="Chưa có thông số kỹ thuật"
            className={styles.empty}
          >
            <Button type="primary" onClick={() => handleOpenModal()}>
              Thêm thông số đầu tiên
            </Button>
          </Empty>
        ) : (
          <Collapse
            accordion
            expandIcon={({ isActive }) => (
              <DownOutlined
                rotate={isActive ? 180 : 0}
                style={{ fontSize: 12, color: "#ee4d2d" }}
              />
            )}
            className={styles.specsCollapse}
            items={collapseItems}
            defaultActiveKey={collapseItems[0]?.key}
          />
        )}
      </div>

      {/* Add/Edit Spec Modal */}
      <Modal
        title={editingSpec ? "Chỉnh sửa thông số" : "Thêm thông số mới"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        className={styles.specModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitSpec}
          className={styles.specForm}
        >
          <Form.Item
            label="Khóa (key)"
            name="key"
            rules={[
              { required: true, message: "Vui lòng nhập khóa" },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
                message: "Khóa phải bắt đầu bằng chữ, chỉ chứa chữ và số",
              },
            ]}
            tooltip="Khóa duy nhất để định danh thông số (VD: screenSize, batteryCapacity)"
          >
            <Input
              placeholder="VD: screenSize, batteryCapacity"
              disabled={!!editingSpec}
            />
          </Form.Item>

          <div className={styles.formRow}>
            <Form.Item
              label="Nhãn tiếng Việt"
              name="labelVi"
              rules={[
                { required: true, message: "Vui lòng nhập nhãn tiếng Việt" },
              ]}
              className={styles.formCol}
            >
              <Input placeholder="VD: Kích thước màn hình" />
            </Form.Item>

            <Form.Item
              label="Nhãn tiếng Anh"
              name="labelEn"
              rules={[
                { required: true, message: "Vui lòng nhập nhãn tiếng Anh" },
              ]}
              className={styles.formCol}
            >
              <Input placeholder="VD: Screen Size" />
            </Form.Item>
          </div>

          <div className={styles.formRow}>
            <Form.Item
              label="Loại dữ liệu"
              name="dataType"
              rules={[{ required: true }]}
              className={styles.formCol}
            >
              <Select>
                {DATA_TYPES.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Đơn vị"
              name="unit"
              className={styles.formCol}
              tooltip="Đơn vị đo (VD: inch, mAh, g)"
            >
              <Input placeholder="VD: inch, mAh, g" />
            </Form.Item>
          </div>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.dataType !== currentValues.dataType
            }
          >
            {({ getFieldValue }) => {
              const dataType = getFieldValue("dataType");
              if (dataType === "boolean") {
                return (
                  <Form.Item
                    label="Giá trị"
                    name="value"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  </Form.Item>
                );
              }
              if (dataType === "number") {
                return (
                  <Form.Item
                    label="Giá trị"
                    name="value"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá trị" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập giá trị số"
                    />
                  </Form.Item>
                );
              }
              return (
                <Form.Item
                  label="Giá trị"
                  name="value"
                  rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
                  tooltip="Nhấn Enter để xuống dòng"
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập giá trị (nhấn Enter để xuống dòng)"
                    autoSize={{ minRows: 2, maxRows: 8 }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <div className={styles.formRow}>
            <Form.Item
              label="Nhóm"
              name="group"
              rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
              className={styles.formCol}
              tooltip="Nhập tên nhóm để phân loại thông số (VD: Màn hình, Camera, Pin & Sạc, Hiệu năng, Thiết kế, Kết nối...)"
            >
              <Input placeholder="VD: Màn hình, Camera, Pin & Sạc, Hiệu năng..." />
            </Form.Item>

            <Form.Item
              label="Thứ tự hiển thị"
              name="displayOrder"
              rules={[{ required: true }]}
              className={styles.formCol}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            label="Hiển thị trong danh sách sản phẩm"
            name="showInList"
            valuePropName="checked"
            tooltip="Khi bật, thông số này sẽ hiển thị trong danh sách sản phẩm"
          >
            <Switch />
          </Form.Item>

          <div className={styles.formActions}>
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {editingSpec ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Import JSON Modal */}
      <Modal
        title={
          <Space>
            <ImportOutlined />
            <span>Import thông số từ JSON</span>
          </Space>
        }
        open={isImportModalOpen}
        onCancel={handleCloseImportModal}
        width={700}
        className={styles.importModal}
        footer={[
          <Button key="cancel" onClick={handleCloseImportModal}>
            Hủy
          </Button>,
          <Button
            key="import"
            type="primary"
            icon={<ImportOutlined />}
            onClick={handleImportJson}
            loading={saving}
            disabled={!importJson.trim()}
          >
            Import
          </Button>,
        ]}
      >
        <div className={styles.importContent}>
          <Alert
            message="Hướng dẫn Import JSON"
            description={
              <div>
                <p>
                  Dán JSON theo định dạng sau để import nhiều thông số cùng lúc:
                </p>
                <ul style={{ marginBottom: 8, paddingLeft: 20 }}>
                  <li>Key phải bắt đầu bằng chữ, chỉ chứa chữ và số</li>
                  <li>
                    Mỗi thông số cần có: value, labelVi, labelEn, dataType,
                    group
                  </li>
                  <li>dataType: "string", "number", hoặc "boolean"</li>
                  <li>Các thông số trùng key sẽ được ghi đè</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {importError && (
            <Alert
              message="Lỗi"
              description={importError}
              type="error"
              showIcon
              closable
              onClose={() => setImportError("")}
              style={{ marginBottom: 16 }}
            />
          )}

          <div className={styles.importTextareaWrapper}>
            <div className={styles.importTextareaHeader}>
              <span>JSON Input</span>
              <Button
                type="link"
                size="small"
                icon={<CodeOutlined />}
                onClick={() => setImportJson(getExampleJson())}
              >
                Xem ví dụ
              </Button>
            </div>
            <TextArea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={`Dán JSON vào đây...\n\nVí dụ:\n${getExampleJson()}`}
              rows={15}
              className={styles.importTextarea}
              style={{ fontFamily: "monospace", fontSize: 13 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductSpecsSection;
