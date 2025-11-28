import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  notification,
  Divider,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  TagsOutlined,
  GoldOutlined,
} from "@ant-design/icons";
import {
  createProductApi,
  getPlatformCategoriesApi,
  getPlatformCategoryDetailApi,
  getBrandsApi,
  getStoreCategoriesApi,
} from "../../util/api";
import styles from "./AddProductModal.module.css";

const { TextArea } = Input;
const { Option } = Select;

/**
 * AddProductModal - Modal thêm sản phẩm mới cho seller
 */
const AddProductModal = ({ visible, onClose, onSuccess, storeId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]); // Danh mục cấp 0
  const [subCategories, setSubCategories] = useState([]); // Danh mục cấp 1
  const [storeCategories, setStoreCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible, storeId]);

  const fetchData = async () => {
    try {
      const [categoriesRes, brandsRes, storeCategoriesRes] = await Promise.all([
        getPlatformCategoriesApi(),
        getBrandsApi(),
        storeId
          ? getStoreCategoriesApi(storeId)
          : Promise.resolve({ result: [] }),
      ]);

      // Response trả về trực tiếp {code, result}
      const platformCategories = categoriesRes?.result || [];

      // Lấy danh mục cấp 0 (level = 0)
      const level0Categories = platformCategories.filter(
        (cat) => cat.level === 0 && cat.active
      );

      // Brands API trả về pagination format
      const brandsData = brandsRes?.result?.content || [];
      // Lọc chỉ lấy brands đang active
      const activeBrands = brandsData.filter((brand) => brand.isActive);

      setParentCategories(level0Categories);
      setBrands(activeBrands);
      setStoreCategories(storeCategoriesRes?.result || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu danh mục và thương hiệu",
        placement: "topRight",
      });
    }
  };

  // Load danh mục cấp 1 khi chọn danh mục cấp 0
  const handleParentCategoryChange = async (parentCategoryId) => {
    try {
      // Reset danh mục cấp 1
      form.setFieldsValue({ categoryId: undefined });
      setSubCategories([]);

      if (!parentCategoryId) return;

      // Gọi API lấy chi tiết danh mục cấp 0 để lấy subCategories
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const productData = {
        name: values.name,
        description: values.description,
        shortDescription: values.shortDescription || "",
        categoryId: values.categoryId,
        storeCategoryIds: values.storeCategoryIds || [],
        storeId: storeId,
        brandId: values.brandId || null,
        variants: values.variants || [],
      };

      const response = await createProductApi(productData);

      // Kiểm tra response code thành công
      if (response?.code === 1000 || response?.code === 200) {
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        // Response không thành công
        throw new Error(response?.message || "Không thể tạo sản phẩm");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo sản phẩm";
      notification.error({
        message: "Lỗi",
        description: errorMsg,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className={styles.modalHeader}>
          <ShoppingOutlined className={styles.modalHeaderIcon} />
          <span>Thêm sản phẩm mới</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      className={styles.addProductModal}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          variants: [
            {
              sku: "",
              variantName: "",
              price: 0,
              originalPrice: 0,
              stockQuantity: 0,
            },
          ],
        }}
      >
        {/* Thông tin cơ bản */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <FileTextOutlined className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
          </div>

          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              { min: 3, max: 255, message: "Tên sản phẩm từ 3-255 ký tự" },
            ]}
          >
            <Input
              placeholder="Nhập tên sản phẩm"
              prefix={<ShoppingOutlined className={styles.inputIcon} />}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả ngắn"
            name="shortDescription"
            rules={[{ max: 500, message: "Mô tả ngắn không quá 500 ký tự" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Nhập mô tả ngắn về sản phẩm (tùy chọn)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả chi tiết"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả chi tiết" },
              { min: 10, max: 5000, message: "Mô tả từ 10-5000 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết về sản phẩm"
              showCount
              maxLength={5000}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Phân loại sản phẩm */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <AppstoreOutlined className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Phân loại sản phẩm</h3>
          </div>

          <Form.Item
            label="Danh mục sàn (Cấp 0)"
            name="parentCategoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục sàn" }]}
          >
            <Select
              placeholder="Chọn danh mục sàn (VD: Thời trang, Điện tử...)"
              showSearch
              suffixIcon={<AppstoreOutlined />}
              onChange={handleParentCategoryChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
              { required: true, message: "Vui lòng chọn danh mục chi tiết" },
            ]}
          >
            <Select
              placeholder="Chọn danh mục chi tiết (VD: Thời trang nam, Thời trang nữ...)"
              showSearch
              suffixIcon={<AppstoreOutlined />}
              disabled={subCategories.length === 0}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                placeholder="Chọn danh mục cửa hàng (không bắt buộc)"
                suffixIcon={<TagsOutlined />}
                allowClear
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
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
              placeholder="Chọn thương hiệu (không bắt buộc)"
              suffixIcon={<GoldOutlined />}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {brands.map((brand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Divider />

        {/* Danh sách variants */}
        <div className={styles.formSection}>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                <div className={styles.variantsHeader}>
                  <div className={styles.sectionHeader}>
                    <TagsOutlined className={styles.sectionIcon} />
                    <h3 className={styles.sectionTitle}>Biến thể sản phẩm</h3>
                  </div>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className={styles.addVariantBtn}
                  >
                    Thêm biến thể
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className={styles.variantItem}>
                    <div className={styles.variantGrid}>
                      <Form.Item
                        {...restField}
                        label="SKU"
                        name={[name, "sku"]}
                        rules={[{ required: true, message: "Nhập SKU" }]}
                      >
                        <Input placeholder="VD: PROD-001" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Tên biến thể"
                        name={[name, "variantName"]}
                        rules={[
                          { required: true, message: "Nhập tên biến thể" },
                        ]}
                      >
                        <Input placeholder="VD: Đỏ - Size L" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Giá bán (₫)"
                        name={[name, "price"]}
                        rules={[{ required: true, message: "Nhập giá bán" }]}
                      >
                        <InputNumber
                          placeholder="299000"
                          min={0}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Giá gốc (₫)"
                        name={[name, "originalPrice"]}
                        rules={[{ required: true, message: "Nhập giá gốc" }]}
                      >
                        <InputNumber
                          placeholder="349000"
                          min={0}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Số lượng"
                        name={[name, "stockQuantity"]}
                        rules={[{ required: true, message: "Nhập số lượng" }]}
                      >
                        <InputNumber
                          placeholder="100"
                          min={0}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        className={styles.removeVariantBtn}
                      >
                        Xóa biến thể
                      </Button>
                    )}
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </div>

        {/* Action buttons */}
        <div className={styles.formActions}>
          <Button onClick={handleCancel} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<ShoppingOutlined />}
          >
            Tạo sản phẩm
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
