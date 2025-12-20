import React, { useState, useEffect } from "react";
import {
  Modal,
  Rate,
  Input,
  Button,
  Upload,
  message,
  Space,
  Image,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  StarOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import {
  createRatingApi,
  updateRatingApi,
  getMyRatingForProductApi,
  canRateProductApi,
  uploadRatingImageApi,
} from "../util/api";
import styles from "./RatingModal.module.css";

const { TextArea } = Input;

// Base URL cho ảnh từ S3 (DigitalOcean Spaces)
const S3_BASE_URL = "https://hla.sgp1.digitaloceanspaces.com";

// Helper function to get image URL from imageName
const getImageUrl = (imageUrl, imageName) => {
  if (imageUrl) return imageUrl;
  if (imageName) return `${S3_BASE_URL}/${imageName}`;
  return null;
};

const RatingModal = ({
  visible,
  onCancel,
  onSuccess,
  productId,
  productName,
  variantId,
  variantName,
  productImage,
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingRating, setExistingRating] = useState(null);
  const [canRate, setCanRate] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const ratingDescriptions = [
    "Rất tệ",
    "Không hài lòng",
    "Bình thường",
    "Hài lòng",
    "Tuyệt vời",
  ];

  useEffect(() => {
    if (visible && productId) {
      checkExistingRating();
    }
  }, [visible, productId]);

  const checkExistingRating = async () => {
    setCheckingExisting(true);
    try {
      // Check if user can rate
      const canRateResponse = await canRateProductApi(productId);
      setCanRate(canRateResponse?.result === true);

      // Check for existing rating
      const response = await getMyRatingForProductApi(productId);
      if (response?.result) {
        const existing = response.result;
        setExistingRating(existing);
        setRating(existing.rating);
        setComment(existing.comment || "");
        setImages(
          existing.images?.map((img) => ({
            uid: img.id,
            name: img.imageName,
            url: getImageUrl(img.imageUrl, img.imageName),
            status: "done",
          })) || []
        );
      } else {
        setExistingRating(null);
        setRating(5);
        setComment("");
        setImages([]);
      }
    } catch (error) {
      console.error("Error checking existing rating:", error);
      setCanRate(false);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleUpload = async (file) => {
    if (images.length >= 5) {
      message.warning("Tối đa 5 ảnh cho mỗi đánh giá");
      return false;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
      return false;
    }

    setUploading(true);
    try {
      const response = await uploadRatingImageApi(file);

      if (response?.result) {
        const newImage = {
          uid: Date.now().toString(),
          name: response.result.fileName,
          url: response.result.fileUrl,
          status: "done",
        };
        setImages((prev) => [...prev, newImage]);
        message.success("Upload ảnh thành công!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Không thể upload ảnh");
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleRemoveImage = (file) => {
    setImages((prev) => prev.filter((img) => img.uid !== file.uid));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    try {
      const ratingData = {
        productId,
        variantId: variantId || null,
        rating,
        comment: comment.trim() || null,
        imageNames: images.map((img) => img.name),
      };

      let response;
      if (existingRating) {
        response = await updateRatingApi(existingRating.id, {
          rating,
          comment: comment.trim() || null,
          imageNames: images.map((img) => img.name),
        });
      } else {
        response = await createRatingApi(ratingData);
      }

      if (response?.code === 200 || response?.code === 201) {
        message.success(
          existingRating
            ? "Cập nhật đánh giá thành công!"
            : "Gửi đánh giá thành công!"
        );
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể gửi đánh giá";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    setImages([]);
    setExistingRating(null);
    onCancel();
  };

  const uploadButton = (
    <div className={styles.uploadButton}>
      {uploading ? <Spin size="small" /> : <CameraOutlined />}
      <div className={styles.uploadText}>Thêm ảnh</div>
    </div>
  );

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <StarOutlined className={styles.titleIcon} />
          <span>
            {existingRating ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
          </span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      className={styles.ratingModal}
      destroyOnClose
    >
      {checkingExisting ? (
        <div className={styles.loadingContainer}>
          <Spin tip="Đang kiểm tra..." />
        </div>
      ) : !canRate && !existingRating ? (
        <div className={styles.cannotRate}>
          <div className={styles.cannotRateIcon}>❌</div>
          <h3>Không thể đánh giá</h3>
          <p>Bạn cần mua và nhận được sản phẩm này trước khi đánh giá.</p>
          <Button onClick={handleClose}>Đóng</Button>
        </div>
      ) : (
        <>
          {/* Product Info */}
          <div className={styles.productInfo}>
            <img
              src={productImage || "https://via.placeholder.com/80"}
              alt={productName}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <div className={styles.productName}>{productName}</div>
              {variantName && (
                <div className={styles.variantName}>
                  Phân loại: {variantName}
                </div>
              )}
            </div>
          </div>

          {/* Rating Stars */}
          <div className={styles.ratingSection}>
            <div className={styles.ratingLabel}>Chất lượng sản phẩm:</div>
            <div className={styles.ratingStars}>
              <Rate
                value={rating}
                onChange={setRating}
                className={styles.rateInput}
              />
              {rating > 0 && (
                <span className={styles.ratingText}>
                  {ratingDescriptions[rating - 1]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className={styles.commentSection}>
            <div className={styles.commentLabel}>
              Nhận xét của bạn (không bắt buộc):
            </div>
            <TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={4}
              maxLength={500}
              showCount
              className={styles.commentInput}
            />
          </div>

          {/* Image Upload */}
          <div className={styles.imageSection}>
            <div className={styles.imageLabel}>
              Thêm hình ảnh ({images.length}/5):
            </div>
            <div className={styles.imageUploadArea}>
              {images.map((image) => (
                <div key={image.uid} className={styles.imagePreview}>
                  <Image
                    src={image.url}
                    alt="Preview"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveImage(image)}
                    className={styles.deleteImageBtn}
                  />
                </div>
              ))}
              {images.length < 5 && (
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={handleUpload}
                  accept="image/*"
                  disabled={uploading}
                >
                  {uploadButton}
                </Upload>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Button onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={rating === 0}
              className={styles.submitButton}
            >
              {existingRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default RatingModal;
