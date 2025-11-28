import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ShopOutlined,
  TagOutlined,
  EyeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  GoldOutlined,
  PlusOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  UploadOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { notification, Form, Input, Select, Button, Upload, Modal } from "antd";
import {
  getProductDetailApi,
  updateProductApi,
  getPlatformCategoriesApi,
  getPlatformCategoryDetailApi,
  getBrandsApi,
  getStoreCategoriesApi,
  uploadProductImageApi,
  deleteProductImageApi,
  updateProductImagesOrderApi,
  setProductImagePrimaryApi,
  getProductVariantsApi,
} from "../../util/api";
import NoImages from "../../assets/NoImages.webp";
import ProductVariantsSection from "../../components/seller/ProductVariantsSection";
import ProductSpecsSection from "../../components/seller/ProductSpecsSection";
import ProductSelectionGroupsSection from "../../components/seller/ProductSelectionGroupsSection";
import RichTextEditor from "../../components/common/RichTextEditor";
import styles from "./SellerProductDetailPage.module.css";

const { TextArea } = Input;
const { Option } = Select;

const SellerProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Form data
  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
      fetchFormData();
      // Scroll to top when navigating to this page
      window.scrollTo(0, 0);
    }
  }, [productId]);

  const fetchVariants = useCallback(async () => {
    try {
      const response = await getProductVariantsApi(productId);
      if (response && response.result) {
        setProduct((prev) => ({
          ...prev,
          variants: response.result,
        }));
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  }, [productId]);

  const fetchProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductDetailApi(productId);

      if (response && response.result) {
        const productData = response.result;
        setProduct(productData);

        // Set primary image
        const primaryImage = productData.images?.find((img) => img.isPrimary);
        setSelectedImage(
          primaryImage?.imageUrl || productData.images?.[0]?.imageUrl || null
        );
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải thông tin sản phẩm",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  }, [productId, form]);

  const fetchFormData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        getPlatformCategoriesApi(),
        getBrandsApi(),
      ]);

      const platformCategories = categoriesRes?.result || [];
      const level0Categories = platformCategories.filter(
        (cat) => cat.level === 0 && cat.active
      );

      const brandsData = brandsRes?.result?.content || [];
      const activeBrands = brandsData.filter((brand) => brand.isActive);

      setParentCategories(level0Categories);
      setBrands(activeBrands);
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };

  const loadStoreCategories = async (storeId) => {
    try {
      const response = await getStoreCategoriesApi(storeId);
      setStoreCategories(response?.result || []);
    } catch (error) {
      console.error("Error loading store categories:", error);
    }
  };

  const handleParentCategoryChange = async (parentCategoryId) => {
    try {
      form.setFieldsValue({ categoryId: undefined });
      setSubCategories([]);

      if (!parentCategoryId) return;

      const response = await getPlatformCategoryDetailApi(parentCategoryId);
      const categoryDetail = response?.result;

      if (categoryDetail?.subCategories) {
        const level1Categories = categoryDetail.subCategories.filter(
          (subCat) => subCat.level === 1 && subCat.active
        );
        setSubCategories(level1Categories);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh mục con",
        placement: "topRight",
      });
    }
  };

  const handleEdit = async () => {
    setIsEditing(true);

    // Set form values when entering edit mode
    // Use setTimeout to ensure form is mounted first
    setTimeout(() => {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        categoryId: product.category?.id,
        brandId: product.brand?.id,
        storeCategoryIds: product.storeCategories?.map((cat) => cat.id) || [],
      });
    }, 0);

    // Load store categories
    if (product?.store?.id) {
      await loadStoreCategories(product.store.id);
    }

    // Load subcategories if category exists
    if (product?.category?.parentId) {
      await handleParentCategoryChange(product.category.parentId);
      setTimeout(() => {
        form.setFieldsValue({ parentCategoryId: product.category.parentId });
      }, 0);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      categoryId: product.category?.id,
      brandId: product.brand?.id,
      storeCategoryIds: product.storeCategories?.map((cat) => cat.id) || [],
    });
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);

      const updateData = {
        name: values.name,
        description: values.description,
        shortDescription: values.shortDescription || "",
        categoryId: values.categoryId,
        storeId: product.store.id,
        brandId: values.brandId || null,
        storeCategoryIds: values.storeCategoryIds || [],
      };

      await updateProductApi(productId, updateData);
      notification.success({
        message: "Thành công",
        description: "Cập nhật sản phẩm thành công!",
        placement: "topRight",
      });
      setIsEditing(false);
      fetchProductDetail(); // Reload data
    } catch (error) {
      console.error("Error updating product:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật sản phẩm",
        placement: "topRight",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUploadImage = async (file) => {
    if (!product.images || product.images.length >= 5) {
      notification.error({
        message: "Lỗi",
        description: "Chỉ được phép tải lên tối đa 5 ảnh",
        placement: "topRight",
      });
      return false;
    }

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
      const displayOrder = (product.images?.length || 0) + 1;
      await uploadProductImageApi(productId, file, displayOrder);
      notification.success({
        message: "Thành công",
        description: "Tải ảnh lên thành công!",
        placement: "topRight",
      });
      fetchProductDetail(); // Reload product data
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

    return false; // Prevent default upload behavior
  };

  const handleDeleteImage = async (imageId) => {
    Modal.confirm({
      title: "Xác nhận xóa ảnh",
      content: "Bạn có chắc chắn muốn xóa ảnh này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // Step 1: Delete the image
          await deleteProductImageApi(productId, imageId);

          // Step 2: Get remaining images and reorder them
          const remainingImages = product.images
            .filter((img) => img.id !== imageId)
            .sort((a, b) => a.displayOrder - b.displayOrder);

          // Step 3: Update display order for remaining images
          if (remainingImages.length > 0) {
            const imagesOrder = remainingImages.map((img, idx) => ({
              imageId: img.id,
              displayOrder: idx + 1,
            }));

            await updateProductImagesOrderApi(productId, imagesOrder);
          }

          notification.success({
            message: "Thành công",
            description: "Xóa ảnh và cập nhật thứ tự thành công!",
            placement: "topRight",
          });
          fetchProductDetail();
        } catch (error) {
          console.error("Error deleting image:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể xóa ảnh",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await setProductImagePrimaryApi(productId, imageId);
      notification.success({
        message: "Thành công",
        description: "Đã đặt làm ảnh chính!",
        placement: "topRight",
      });
      fetchProductDetail();
    } catch (error) {
      console.error("Error setting primary image:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể đặt ảnh chính",
        placement: "topRight",
      });
    }
  };

  const handleDragStart = (e, image, index) => {
    setDraggedImage({ image, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedImage || draggedImage.index === dropIndex) {
      setDraggedImage(null);
      return;
    }

    try {
      // Create new order array
      const images = [...product.images];
      const draggedItem = images[draggedImage.index];

      // Remove dragged item
      images.splice(draggedImage.index, 1);
      // Insert at new position
      images.splice(dropIndex, 0, draggedItem);

      // Create update payload with new displayOrder
      const imagesOrder = images.map((img, idx) => ({
        imageId: img.id,
        displayOrder: idx + 1,
      }));

      // Update local state immediately for better UX
      setProduct({ ...product, images });

      // Call API to update order
      await updateProductImagesOrderApi(productId, imagesOrder);
      notification.success({
        message: "Thành công",
        description: "Đã cập nhật thứ tự ảnh!",
        placement: "topRight",
      });

      // Reload to get fresh data
      fetchProductDetail();
    } catch (error) {
      console.error("Error updating images order:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật thứ tự ảnh",
        placement: "topRight",
      });
      // Reload on error to revert changes
      fetchProductDetail();
    } finally {
      setDraggedImage(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setDragOverIndex(null);
  };

  if (loading) {
    return (
      <LoadingSpinner tip="Đang tải thông tin sản phẩm..." fullScreen={false} />
    );
  }

  if (!product) {
    return (
      <div className={styles.loadingContainer}>
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeftOutlined />
          <span>Quay lại</span>
        </button>
        <h1 className={styles.title}>Chi tiết sản phẩm</h1>
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
        {/* Images Section */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            <img
              src={selectedImage || NoImages}
              alt={product.name}
              className={styles.mainImage}
            />
          </div>
          {product.images && product.images.length > 0 ? (
            <div className={styles.thumbnailList}>
              {product.images.map((image, index) => (
                <div
                  key={image.id}
                  className={`${styles.thumbnail} ${
                    selectedImage === image.imageUrl
                      ? styles.activeThumbnail
                      : ""
                  } ${dragOverIndex === index ? styles.dragOver : ""} ${
                    draggedImage?.index === index ? styles.dragging : ""
                  }`}
                  draggable={isEditing}
                  onDragStart={(e) => handleDragStart(e, image, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <img
                    src={image.imageUrl}
                    alt="Product thumbnail"
                    onClick={() => setSelectedImage(image.imageUrl)}
                    draggable={false}
                  />
                  {image.isPrimary && (
                    <span className={styles.primaryBadge}>Chính</span>
                  )}
                  {isEditing && (
                    <>
                      <div className={styles.dragHandle} title="Kéo để sắp xếp">
                        ⋮⋮
                      </div>
                      <div className={styles.imageActions}>
                        {!image.isPrimary && (
                          <button
                            className={styles.setPrimaryBtn}
                            onClick={() => handleSetPrimaryImage(image.id)}
                            title="Đặt làm ảnh chính"
                          >
                            <StarOutlined />
                          </button>
                        )}
                        <button
                          className={styles.deleteImageBtn}
                          onClick={() => handleDeleteImage(image.id)}
                          title="Xóa ảnh"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              {isEditing && product.images.length < 5 && (
                <Upload
                  beforeUpload={handleUploadImage}
                  showUploadList={false}
                  accept="image/*"
                >
                  <div className={styles.uploadThumbnail}>
                    {uploadingImage ? (
                      <LoadingOutlined />
                    ) : (
                      <>
                        <PlusOutlined />
                        <div className={styles.uploadText}>
                          Tải ảnh
                          <br />
                          <span className={styles.uploadSubtext}>
                            ({product.images.length}/5)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Upload>
              )}
            </div>
          ) : (
            <>
              <div className={styles.noImages}>Chưa có ảnh</div>
              {isEditing && (
                <Upload
                  beforeUpload={handleUploadImage}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    icon={
                      uploadingImage ? <LoadingOutlined /> : <UploadOutlined />
                    }
                    className={styles.uploadBtn}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Đang tải..." : "Tải ảnh lên"}
                  </Button>
                </Upload>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          {!isEditing ? (
            // View Mode
            <>
              {/* Product Header */}
              <div className={styles.productHeader}>
                <h2 className={styles.productName}>{product.name}</h2>
                <span
                  className={`${styles.statusBadge} ${
                    product.active ? styles.statusActive : styles.statusInactive
                  }`}
                >
                  {product.active ? (
                    <>
                      <CheckCircleOutlined /> Đang hoạt động
                    </>
                  ) : (
                    "Ngừng hoạt động"
                  )}
                </span>
              </div>

              {/* Stats Row */}
              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <EyeOutlined className={styles.statIcon} />
                  <span>{product.viewCount} lượt xem</span>
                </div>
                <div className={styles.statItem}>
                  <ShopOutlined className={styles.statIcon} />
                  <span>Đã bán: {product.soldCount}</span>
                </div>
                <div className={styles.statItem}>
                  <span>
                    {product.averageRating ? (
                      <>
                        ⭐ {product.averageRating.toFixed(1)} (
                        {product.ratingCount})
                      </>
                    ) : (
                      "Chưa có đánh giá"
                    )}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className={styles.priceSection}>
                <span className={styles.priceLabel}>Giá bán:</span>
                <span className={styles.priceValue}>
                  ₫{product.minPrice?.toLocaleString("vi-VN")}
                  {product.maxPrice > product.minPrice &&
                    ` - ₫${product.maxPrice?.toLocaleString("vi-VN")}`}
                </span>
              </div>

              {/* Info Block - Short Description */}
              <div className={styles.infoBlock}>
                <h3 className={styles.blockTitle}>Mô tả ngắn</h3>
                <p className={styles.shortDesc}>
                  {product.shortDescription || "Chưa có mô tả"}
                </p>
              </div>

              {/* Info Grid */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Danh mục sàn</span>
                  <span className={styles.infoValue}>
                    {product.category?.name || "-"}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Thương hiệu</span>
                  <span className={styles.infoValue}>
                    {product.brand?.name || "-"}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tồn kho</span>
                  <span className={styles.infoValue}>
                    {product.totalStock || 0}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Danh mục cửa hàng</span>
                  <div>
                    {product.storeCategories &&
                    product.storeCategories.length > 0 ? (
                      product.storeCategories.map((cat) => (
                        <span key={cat.id} className={styles.attributeTag}>
                          {cat.name}
                        </span>
                      ))
                    ) : (
                      <span className={styles.infoValue}>-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Card */}
              <div className={styles.storeCard}>
                <div className={styles.storeHeader}>
                  <ShopOutlined className={styles.storeIcon} />
                  <span className={styles.storeLabel}>Thông tin cửa hàng</span>
                </div>
                <div className={styles.storeBody}>
                  {product.store?.logo && (
                    <img
                      src={product.store.logo}
                      alt={product.store.storeName}
                      className={styles.storeLogo}
                    />
                  )}
                  <div className={styles.storeInfo}>
                    <h4 className={styles.storeName}>
                      {product.store?.storeName || "-"}
                    </h4>
                    {product.store?.storeDescription && (
                      <p className={styles.storeDesc}>
                        {product.store.storeDescription}
                      </p>
                    )}
                    <div className={styles.storeContact}>
                      <span>Người tạo: {product.createdBy}</span>
                      <span>
                        Ngày tạo:{" "}
                        {new Date(product.createdAt).toLocaleString("vi-VN")}
                      </span>
                      <span>
                        Cập nhật:{" "}
                        {new Date(product.updatedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className={styles.descriptionSection}>
                <h3 className={styles.sectionTitle}>Mô tả chi tiết</h3>
                <div className={styles.descriptionContent}>
                  {product.description || "Chưa có mô tả"}
                </div>
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
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                  { min: 3, max: 255, message: "Tên sản phẩm từ 3-255 ký tự" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>

              <Form.Item
                label="Mô tả ngắn"
                name="shortDescription"
                rules={[
                  { max: 500, message: "Mô tả ngắn không quá 500 ký tự" },
                ]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập mô tả ngắn"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                label="Mô tả chi tiết"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả chi tiết" },
                ]}
                tooltip="Hỗ trợ định dạng văn bản: in đậm, in nghiêng, danh sách, chèn ảnh, video..."
              >
                <RichTextEditor
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  minHeight={250}
                  maxLength={10000}
                />
              </Form.Item>

              <Form.Item
                label="Danh mục sàn (Cấp 0)"
                name="parentCategoryId"
                rules={[
                  { required: true, message: "Vui lòng chọn danh mục sàn" },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục sàn"
                  showSearch
                  suffixIcon={<AppstoreOutlined />}
                  onChange={handleParentCategoryChange}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {parentCategories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Danh mục chi tiết (Cấp 1)"
                name="categoryId"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn danh mục chi tiết",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục chi tiết"
                  showSearch
                  suffixIcon={<AppstoreOutlined />}
                  disabled={subCategories.length === 0}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {subCategories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {storeCategories.length > 0 && (
                <Form.Item label="Danh mục cửa hàng" name="storeCategoryIds">
                  <Select
                    mode="multiple"
                    placeholder="Chọn danh mục cửa hàng"
                    suffixIcon={<TagOutlined />}
                    allowClear
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {storeCategories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item label="Thương hiệu" name="brandId">
                <Select
                  placeholder="Chọn thương hiệu"
                  suffixIcon={<GoldOutlined />}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          )}
        </div>
      </div>

      {/* Variants Section */}
      <ProductVariantsSection
        variants={product.variants || []}
        productId={productId}
        categoryId={product?.category?.parentId}
        onUpdate={fetchVariants}
      />

      {/* Selection Groups Section */}
      <ProductSelectionGroupsSection productId={productId} />

      {/* Product Specifications Section */}
      <ProductSpecsSection productId={productId} />
    </div>
  );
};

export default SellerProductDetailPage;
