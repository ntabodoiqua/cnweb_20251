import { useState } from "react";
import { Button, Form } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import RichTextEditor from "../common/RichTextEditor";
import styles from "./ProductDescriptionEditor.module.css";

const ProductDescriptionEditor = ({ description, onSave, saving = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({ description });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    await onSave(values.description);
    setIsEditing(false);
  };

  return (
    <div className={styles.descriptionEditor}>
      <div className={styles.header}>
        <h3 className={styles.title}>Mô tả chi tiết sản phẩm</h3>
        {!isEditing ? (
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Chỉnh sửa mô tả
          </Button>
        ) : (
          <div className={styles.actions}>
            <Button onClick={handleCancel} disabled={saving}>
              <CloseOutlined /> Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={saving}
            >
              Lưu mô tả
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className={styles.descriptionContent}>
          {description ? (
            <div dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <p className={styles.emptyText}>Chưa có mô tả chi tiết</p>
          )}
        </div>
      ) : (
        <Form form={form} onFinish={handleSubmit} className={styles.editForm}>
          <Form.Item
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả chi tiết" },
            ]}
          >
            <RichTextEditor
              placeholder="Nhập mô tả chi tiết sản phẩm... Bạn có thể sử dụng định dạng văn bản, chèn ảnh, video..."
              minHeight={400}
              maxLength={10000}
            />
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default ProductDescriptionEditor;
