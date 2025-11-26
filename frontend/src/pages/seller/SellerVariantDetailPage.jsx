import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  TagOutlined,
  PictureOutlined,
  UploadOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  notification,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  Tag,
  Switch,
  Modal,
  Collapse,
  Tooltip,
  Popconfirm,
  Empty,
} from "antd";
import {
  getProductDetailApi,
  updateVariantApi,
  getVariantMetadataApi,
  updateVariantMetadataApi,
  uploadVariantImageApi,
  getProductAttributesByCategoryApi,
  getProductAttributeByIdApi,
  addAttributeToVariantApi,
  removeAttributeFromVariantApi,
  updateVariantStatusApi,
} from "../../util/api";
import NoImages from "../../assets/NoImages.webp";
import styles from "./SellerVariantDetailPage.module.css";

const { Option } = Select;
const { TextArea } = Input;

// Data types
const DATA_TYPES = [
  { value: "string", label: "Văn bản" },
  { value: "number", label: "Số" },
  { value: "boolean", label: "Có/Không" },
];

const SellerVariantDetailPage = () => {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [metadataForm] = Form.useForm();

  // Product & Variant State
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Metadata state
  const [metadata, setMetadata] = useState({});
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState(null);

  // Attributes state
  const [attributes, setAttributes] = useState([]);
  const [attributeDetails, setAttributeDetails] = useState({});
  const [addingAttribute, setAddingAttribute] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    if (productId && variantId) {
      fetchData();
    }
  }, [productId, variantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProductAndVariant(), fetchVariantMetadata()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductAndVariant = async () => {
    try {
      const response = await getProductDetailApi(productId);
      if (response && response.result) {
        setProduct(response.result);

        // Find the variant
        const foundVariant = response.result.variants?.find(
          (v) => v.id === variantId
        );
        if (foundVariant) {
          setVariant(foundVariant);
          // Set form values
          form.setFieldsValue({
            variantName: foundVariant.variantName,
            sku: foundVariant.sku,
            price: foundVariant.price,
            originalPrice: foundVariant.originalPrice,
            weight: foundVariant.weight,
          });

          // Fetch attributes for the category
          if (response.result.category?.parentId) {
            fetchAttributes(response.result.category.parentId);
          }
        } else {
          notification.error({
            message: "Lỗi",
            description: "Không tìm thấy biến thể",
            placement: "topRight",
          });
          navigate(`/seller/products/${productId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải thông tin sản phẩm",
        placement: "topRight",
      });
    }
  };

  const fetchVariantMetadata = async () => {
    try {
      setLoadingMetadata(true);
      const response = await getVariantMetadataApi(productId, variantId);
      if (response && response.result) {
        setMetadata(response.result.metadata || {});
      }
    } catch (error) {
      console.error("Error fetching variant metadata:", error);
      // Don't show error for 404 - variant may not have metadata yet
      if (error.response?.status !== 404) {
        console.log("Variant may not have metadata yet");
      }
    } finally {
      setLoadingMetadata(false);
    }
  };

  const fetchAttributes = async (categoryId) => {
    try {
      const response = await getProductAttributesByCategoryApi(categoryId);
      if (response?.code === 1000) {
        const attrs = response.result || [];
        setAttributes(attrs);

        // Fetch details for all attributes
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
    try {
      const response = await getProductAttributeByIdApi(attributeId);
      if (response?.code === 1000) {
        setAttributeDetails((prev) => ({
          ...prev,
          [attributeId]: response.result,
        }));
      }
    } catch (error) {
      console.error("Error fetching attribute detail:", error);
    }
  };

  const handleBack = () => {
    navigate(`/seller/products/${productId}`, { replace: true });
    window.scrollTo(0, 0);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    form.setFieldsValue({
      variantName: variant.variantName,
      sku: variant.sku,
      price: variant.price,
      originalPrice: variant.originalPrice,
      weight: variant.weight,
    });
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const variantData = {
        variantName: values.variantName,
        price: values.price,
        originalPrice: values.originalPrice || values.price,
        weight: values.weight || null,
      };

      await updateVariantApi(productId, variantId, variantData);
      notification.success({
        message: "Thành công",
        description: "Cập nhật biến thể thành công!",
        placement: "topRight",
      });
      setIsEditing(false);
      fetchProductAndVariant();
    } catch (error) {
      console.error("Error updating variant:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật biến thể",
        placement: "topRight",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      notification.error({
        message: "Lỗi",
        description: "Chỉ được tải lên file ảnh!",
        placement: "topRight",
      });
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notification.error({
        message: "Lỗi",
        description: "Ảnh phải nhỏ hơn 5MB!",
        placement: "topRight",
      });
      return false;
    }

    try {
      setUploadingImage(true);
      await uploadVariantImageApi(productId, variantId, file);
      notification.success({
        message: "Thành công",
        description: "Tải ảnh lên thành công!",
        placement: "topRight",
      });
      fetchProductAndVariant();
    } catch (error) {
      console.error("Error uploading image:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải ảnh lên",
        placement: "topRight",
      });
    } finally {
      setUploadingImage(false);
    }

    return false;
  };

  const handleToggleStatus = async (isActive) => {
    try {
      await updateVariantStatusApi(productId, variantId, isActive);
      notification.success({
        message: "Thành công",
        description: `${
          isActive ? "Kích hoạt" : "Vô hiệu hóa"
        } biến thể thành công`,
        placement: "topRight",
      });
      fetchProductAndVariant();
    } catch (error) {
      console.error("Error updating variant status:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật trạng thái biến thể",
        placement: "topRight",
      });
    }
  };

  // Attribute management
  const handleAddAttribute = async () => {
    if (!selectedAttr || !selectedValue) return;

    try {
      await addAttributeToVariantApi(productId, variantId, {
        attributeId: selectedAttr,
        value: selectedValue,
      });
      notification.success({
        message: "Thành công",
        description: "Thêm thuộc tính thành công",
        placement: "topRight",
      });
      setAddingAttribute(false);
      setSelectedAttr(null);
      setSelectedValue(null);
      fetchProductAndVariant();
    } catch (error) {
      console.error("Error adding attribute:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể thêm thuộc tính",
        placement: "topRight",
      });
    }
  };

  const handleRemoveAttribute = async (attributeId, value) => {
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
      fetchProductAndVariant();
    } catch (error) {
      console.error("Error removing attribute:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa thuộc tính",
        placement: "topRight",
      });
    }
  };

  // Metadata management
  const handleOpenMetadataModal = (metaKey = null) => {
    if (metaKey && metadata[metaKey]) {
      // Edit existing metadata
      const meta = metadata[metaKey];
      setEditingMetadata(metaKey);
      metadataForm.setFieldsValue({
        key: metaKey,
        value: meta.value,
        labelEn: meta.labelEn,
        labelVi: meta.labelVi,
        dataType: meta.dataType || "string",
        unit: meta.unit || "",
        displayOrder: meta.displayOrder || 1,
        showInList: meta.showInList !== false,
        group: meta.groupLabelVi || meta.group || "Khác",
      });
    } else {
      // Add new metadata
      setEditingMetadata(null);
      metadataForm.resetFields();
      metadataForm.setFieldsValue({
        dataType: "string",
        displayOrder: Object.keys(metadata).length + 1,
        showInList: false,
        group: "",
      });
    }
    setIsMetadataModalOpen(true);
  };

  const handleCloseMetadataModal = () => {
    setIsMetadataModalOpen(false);
    setEditingMetadata(null);
    metadataForm.resetFields();
  };

  const handleSubmitMetadata = async (values) => {
    // Tạo key từ tên nhóm
    const groupKey = values.group
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    const metaData = {
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

    const updatedMetadata = { ...metadata };

    // If editing and key changed, remove old key
    if (editingMetadata && editingMetadata !== values.key) {
      delete updatedMetadata[editingMetadata];
    }

    updatedMetadata[values.key] = metaData;

    await handleSaveMetadata(updatedMetadata);
    handleCloseMetadataModal();
  };

  const handleSaveMetadata = async (updatedMetadata) => {
    try {
      setSavingMetadata(true);
      await updateVariantMetadataApi(productId, variantId, {
        metadata: updatedMetadata,
      });
      setMetadata(updatedMetadata);
      notification.success({
        message: "Thành công",
        description: "Đã cập nhật metadata biến thể",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error saving metadata:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu metadata biến thể",
        placement: "topRight",
      });
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleDeleteMetadata = async (metaKey) => {
    const updatedMetadata = { ...metadata };
    delete updatedMetadata[metaKey];
    await handleSaveMetadata(updatedMetadata);
  };

  // Group metadata by their group
  const groupedMetadata = Object.entries(metadata).reduce(
    (acc, [key, meta]) => {
      const groupKey = meta.group || "other";
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push({ key, ...meta });
      return acc;
    },
    {}
  );

  // Sort metadata within each group by displayOrder
  Object.keys(groupedMetadata).forEach((groupKey) => {
    groupedMetadata[groupKey].sort(
      (a, b) => (a.displayOrder || 999) - (b.displayOrder || 999)
    );
  });

  // Lấy tất cả các nhóm từ metadata hiện có
  const allMetadataGroups = Object.entries(metadata).reduce(
    (acc, [key, meta]) => {
      const groupKey = meta.group || "other";
      if (!acc.find((g) => g.key === groupKey)) {
        acc.push({
          key: groupKey,
          labelVi: meta.groupLabelVi || groupKey,
          labelEn: meta.groupLabelEn || groupKey,
        });
      }
      return acc;
    },
    []
  );

  const renderMetaValue = (meta) => {
    if (meta.dataType === "boolean") {
      return meta.value ? (
        <Tag color="success">Có</Tag>
      ) : (
        <Tag color="default">Không</Tag>
      );
    }
    if (meta.dataType === "number") {
      return (
        <span>
          {meta.value?.toLocaleString("vi-VN")}
          {meta.unit && <span className={styles.unit}> {meta.unit}</span>}
        </span>
      );
    }
    return (
      <span>
        {meta.value}
        {meta.unit && <span className={styles.unit}> {meta.unit}</span>}
      </span>
    );
  };

  const metadataCollapseItems = allMetadataGroups
    .filter((group) => groupedMetadata[group.key]?.length > 0)
    .map((group) => ({
      key: group.key,
      label: (
        <div className={styles.groupHeader}>
          <span className={styles.groupTitle}>{group.labelVi}</span>
          <Tag color="blue">{groupedMetadata[group.key]?.length || 0}</Tag>
        </div>
      ),
      children: (
        <div className={styles.metadataList}>
          {groupedMetadata[group.key]?.map((meta) => (
            <div key={meta.key} className={styles.metadataItem}>
              <div className={styles.metadataInfo}>
                <div className={styles.metadataLabel}>
                  {meta.labelVi}
                  {meta.showInList && (
                    <Tooltip title="Hiển thị trong danh sách">
                      <Tag color="green" className={styles.showTag}>
                        Hiển thị
                      </Tag>
                    </Tooltip>
                  )}
                </div>
                <div className={styles.metadataValue}>
                  {renderMetaValue(meta)}
                </div>
              </div>
              <div className={styles.metadataActions}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenMetadataModal(meta.key)}
                  className={styles.editBtn}
                />
                <Popconfirm
                  title="Xóa metadata này?"
                  description="Thao tác này không thể hoàn tác"
                  onConfirm={() => handleDeleteMetadata(meta.key)}
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

  if (loading) {
    return (
      <LoadingSpinner tip="Đang tải thông tin biến thể..." fullScreen={false} />
    );
  }

  if (!variant) {
    return (
      <div className={styles.loadingContainer}>
        <p>Không tìm thấy biến thể</p>
      </div>
    );
  }

  return (
    <div className={styles.variantDetail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeftOutlined />
          <span>Quay lại</span>
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Chi tiết biến thể</h1>
          <span className={styles.productName}>{product?.name}</span>
        </div>
        <div className={styles.headerActions}>
          {!isEditing ? (
            <button className={styles.editBtn} onClick={handleEdit}>
              <EditOutlined />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <>
              <button
                className={styles.cancelBtn}
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <CloseOutlined />
                <span>Hủy</span>
              </button>
              <button
                className={styles.saveBtn}
                onClick={() => form.submit()}
                disabled={saving}
              >
                <SaveOutlined />
                <span>{saving ? "Đang lưu..." : "Lưu"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrapper}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <img
              src={variant.imageUrl || NoImages}
              alt={variant.variantName}
              className={styles.variantImage}
            />
            {!variant.imageUrl && (
              <div className={styles.noImageOverlay}>
                <PictureOutlined />
                <span>Chưa có ảnh</span>
              </div>
            )}
          </div>

          <Upload
            beforeUpload={handleUploadImage}
            showUploadList={false}
            accept="image/*"
          >
            <Button
              icon={uploadingImage ? <SaveOutlined spin /> : <UploadOutlined />}
              className={styles.uploadBtn}
              disabled={uploadingImage}
              block
            >
              {uploadingImage ? "Đang tải..." : "Tải ảnh biến thể"}
            </Button>
          </Upload>

          {/* Status Switch */}
          <div className={styles.statusSection}>
            <span className={styles.statusLabel}>Trạng thái:</span>
            <Switch
              checked={variant.active}
              onChange={handleToggleStatus}
              checkedChildren="Đang bán"
              unCheckedChildren="Ngừng bán"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          {!isEditing ? (
            // View Mode
            <>
              {/* Variant Header */}
              <div className={styles.variantHeader}>
                <h2 className={styles.variantName}>{variant.variantName}</h2>
                <span
                  className={`${styles.statusBadge} ${
                    variant.active ? styles.statusActive : styles.statusInactive
                  }`}
                >
                  {variant.active ? (
                    <>
                      <CheckCircleOutlined /> Đang bán
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined /> Ngừng bán
                    </>
                  )}
                </span>
              </div>

              {/* Price Section */}
              <div className={styles.priceSection}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Giá bán:</span>
                  <span className={styles.priceValue}>
                    ₫{variant.price?.toLocaleString("vi-VN")}
                  </span>
                </div>
                {variant.originalPrice > variant.price && (
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Giá gốc:</span>
                    <span className={styles.originalPrice}>
                      ₫{variant.originalPrice?.toLocaleString("vi-VN")}
                    </span>
                    <Tag color="red" className={styles.discountTag}>
                      -
                      {Math.round(
                        (1 - variant.price / variant.originalPrice) * 100
                      )}
                      %
                    </Tag>
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>SKU</span>
                  <span className={styles.infoValue}>{variant.sku || "-"}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tồn kho</span>
                  <span
                    className={`${styles.infoValue} ${
                      variant.availableStock < 10
                        ? styles.lowStock
                        : styles.inStock
                    }`}
                  >
                    {variant.availableStock || 0}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Đã đặt</span>
                  <span className={styles.infoValue}>
                    {variant.reservedStock || 0}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Đã bán</span>
                  <span className={styles.infoValue}>
                    {variant.soldQuantity || 0}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Trọng lượng</span>
                  <span className={styles.infoValue}>
                    {variant.weight ? `${variant.weight}g` : "-"}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày tạo</span>
                  <span className={styles.infoValue}>
                    {new Date(variant.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Attributes Section */}
              <div className={styles.attributesSection}>
                <div className={styles.sectionHeader}>
                  <TagOutlined className={styles.sectionIcon} />
                  <h3>Thuộc tính biến thể</h3>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setAddingAttribute(true)}
                  >
                    Thêm
                  </Button>
                </div>

                {variant.attributeValues &&
                variant.attributeValues.length > 0 ? (
                  <div className={styles.attributesList}>
                    {variant.attributeValues.map((attr) => (
                      <div key={attr.id} className={styles.attributeItem}>
                        <Tag color="blue" className={styles.attributeTag}>
                          {attr.attributeName}: {attr.value}
                        </Tag>
                        <Popconfirm
                          title="Xóa thuộc tính này?"
                          onConfirm={() =>
                            handleRemoveAttribute(attr.attributeId, attr.value)
                          }
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyAttributes}>
                    Chưa có thuộc tính nào
                  </div>
                )}

                {/* Add Attribute Form */}
                {addingAttribute && (
                  <div className={styles.addAttributeForm}>
                    <Select
                      placeholder="Chọn thuộc tính"
                      style={{ width: 200 }}
                      value={selectedAttr}
                      onChange={(value) => {
                        setSelectedAttr(value);
                        setSelectedValue(null);
                      }}
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

                    {selectedAttr && (
                      <Select
                        placeholder="Chọn giá trị"
                        style={{ width: 200 }}
                        value={selectedValue}
                        onChange={setSelectedValue}
                      >
                        {(attributeDetails[selectedAttr]?.values || []).map(
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
                    )}

                    <Button
                      type="primary"
                      onClick={handleAddAttribute}
                      disabled={!selectedAttr || !selectedValue}
                    >
                      Thêm
                    </Button>
                    <Button onClick={() => setAddingAttribute(false)}>
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Edit Mode
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              className={styles.editForm}
            >
              <Form.Item
                label="Tên biến thể"
                name="variantName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên biến thể" },
                ]}
              >
                <Input placeholder="Nhập tên biến thể" />
              </Form.Item>

              <Form.Item label="SKU" name="sku">
                <Input placeholder="SKU" disabled />
              </Form.Item>

              <div className={styles.formRow}>
                <Form.Item
                  label="Giá bán"
                  name="price"
                  rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                  className={styles.formCol}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Nhập giá bán"
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                  />
                </Form.Item>

                <Form.Item
                  label="Giá gốc"
                  name="originalPrice"
                  className={styles.formCol}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Nhập giá gốc"
                    formatter={(value) =>
                      `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </div>

              <Form.Item label="Trọng lượng (g)" name="weight">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Nhập trọng lượng (gram)"
                />
              </Form.Item>
            </Form>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className={styles.metadataSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWrapper}>
            <SettingOutlined className={styles.icon} />
            <h3 className={styles.sectionTitle}>
              Thông số kỹ thuật (Metadata)
            </h3>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenMetadataModal()}
            className={styles.addMetaBtn}
          >
            Thêm thông số
          </Button>
        </div>

        <div className={styles.metadataContent}>
          {Object.keys(metadata).length === 0 ? (
            <Empty
              description="Chưa có thông số kỹ thuật"
              className={styles.empty}
            >
              <Button type="primary" onClick={() => handleOpenMetadataModal()}>
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
              className={styles.metadataCollapse}
              items={metadataCollapseItems}
              defaultActiveKey={metadataCollapseItems[0]?.key}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Metadata Modal */}
      <Modal
        title={editingMetadata ? "Chỉnh sửa thông số" : "Thêm thông số mới"}
        open={isMetadataModalOpen}
        onCancel={handleCloseMetadataModal}
        footer={null}
        width={600}
        className={styles.metadataModal}
      >
        <Form
          form={metadataForm}
          layout="vertical"
          onFinish={handleSubmitMetadata}
          className={styles.metadataFormModal}
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
              disabled={!!editingMetadata}
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
            label="Hiển thị trong danh sách"
            name="showInList"
            valuePropName="checked"
            tooltip="Khi bật, thông số này sẽ hiển thị trong danh sách sản phẩm"
          >
            <Switch />
          </Form.Item>

          <div className={styles.formActions}>
            <Button onClick={handleCloseMetadataModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={savingMetadata}>
              {editingMetadata ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SellerVariantDetailPage;
