import { useState, useEffect } from "react";
import { notification, Modal, Input, Form } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import styles from "./AdminVideoReviewsPage.module.css";

// Local storage key for video reviews
const VIDEO_REVIEWS_STORAGE_KEY = "hustbuy_video_reviews";

// Default videos
const DEFAULT_VIDEOS = [
  {
    id: "1",
    videoId: "um1LBitMFWQ",
    title: "Review sản phẩm #1",
  },
  {
    id: "2",
    videoId: "njOLBAHRTck",
    title: "Review sản phẩm #2",
  },
  {
    id: "3",
    videoId: "czylbc82AuE",
    title: "Review sản phẩm #3",
  },
  {
    id: "4",
    videoId: "zRYauQkAv6E",
    title: "Review sản phẩm #4",
  },
];

/**
 * Get videos from localStorage or return defaults
 */
export const getVideoReviews = () => {
  try {
    const stored = localStorage.getItem(VIDEO_REVIEWS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading video reviews from localStorage:", error);
  }
  return DEFAULT_VIDEOS;
};

/**
 * Save videos to localStorage
 */
const saveVideoReviews = (videos) => {
  try {
    localStorage.setItem(VIDEO_REVIEWS_STORAGE_KEY, JSON.stringify(videos));
    return true;
  } catch (error) {
    console.error("Error saving video reviews to localStorage:", error);
    return false;
  }
};

/**
 * Extract YouTube video ID from URL or return as-is if already an ID
 */
const extractVideoId = (input) => {
  if (!input) return "";

  // If it's already just an ID (no slashes or dots)
  if (!input.includes("/") && !input.includes(".")) {
    return input.trim();
  }

  // Try to extract from YouTube Shorts URL
  const shortsMatch = input.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];

  // Try to extract from regular YouTube URL
  const regularMatch = input.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (regularMatch) return regularMatch[1];

  // Return trimmed input as fallback
  return input.trim();
};

/**
 * AdminVideoReviewsPage - Trang quản lý Video Reviews trên trang chủ
 */
const AdminVideoReviewsPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [form] = Form.useForm();

  // Load videos on mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    setLoading(true);
    const loadedVideos = getVideoReviews();
    setVideos(loadedVideos);
    setLoading(false);
  };

  const handleSaveAll = () => {
    const success = saveVideoReviews(videos);
    if (success) {
      notification.success({
        message: "Thành công",
        description: "Đã lưu danh sách video!",
        placement: "topRight",
        duration: 3,
      });
    } else {
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu danh sách video",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    form.resetFields();
    setShowVideoForm(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    form.setFieldsValue({
      videoId: video.videoId,
      title: video.title,
    });
    setShowVideoForm(true);
  };

  const handleDeleteVideo = (videoId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa video này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: () => {
        const newVideos = videos.filter((v) => v.id !== videoId);
        setVideos(newVideos);
        saveVideoReviews(newVideos);
        notification.success({
          message: "Thành công",
          description: "Đã xóa video!",
          placement: "topRight",
          duration: 3,
        });
      },
    });
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newVideos = [...videos];
    [newVideos[index], newVideos[index - 1]] = [
      newVideos[index - 1],
      newVideos[index],
    ];
    setVideos(newVideos);
    saveVideoReviews(newVideos);
  };

  const handleMoveDown = (index) => {
    if (index === videos.length - 1) return;
    const newVideos = [...videos];
    [newVideos[index], newVideos[index + 1]] = [
      newVideos[index + 1],
      newVideos[index],
    ];
    setVideos(newVideos);
    saveVideoReviews(newVideos);
  };

  const handleFormSubmit = (values) => {
    const videoId = extractVideoId(values.videoId);

    if (!videoId) {
      notification.error({
        message: "Lỗi",
        description: "Video ID không hợp lệ",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    let newVideos;
    if (editingVideo) {
      // Update existing video
      newVideos = videos.map((v) =>
        v.id === editingVideo.id
          ? { ...v, videoId, title: values.title || `Review sản phẩm #${v.id}` }
          : v
      );
    } else {
      // Add new video
      const newId = String(Date.now());
      newVideos = [
        ...videos,
        {
          id: newId,
          videoId,
          title: values.title || `Review sản phẩm #${videos.length + 1}`,
        },
      ];
    }

    setVideos(newVideos);
    saveVideoReviews(newVideos);
    setShowVideoForm(false);
    form.resetFields();

    notification.success({
      message: "Thành công",
      description: editingVideo ? "Đã cập nhật video!" : "Đã thêm video mới!",
      placement: "topRight",
      duration: 3,
    });
  };

  const handleResetToDefault = () => {
    Modal.confirm({
      title: "Khôi phục mặc định",
      content: "Bạn có chắc chắn muốn khôi phục danh sách video về mặc định?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: () => {
        setVideos(DEFAULT_VIDEOS);
        saveVideoReviews(DEFAULT_VIDEOS);
        notification.success({
          message: "Thành công",
          description: "Đã khôi phục danh sách video mặc định!",
          placement: "topRight",
          duration: 3,
        });
      },
    });
  };

  return (
    <div className={styles.adminVideoReviews}>
      {/* Toolbar */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <h2 className={styles.pageTitle}>
            <PlayCircleOutlined /> Quản lý Video Reviews
          </h2>
          <div className={styles.toolbarActions}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleAddVideo}
            >
              <PlusOutlined />
              Thêm video
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetToDefault}
            >
              <ReloadOutlined />
              Khôi phục mặc định
            </button>
          </div>
        </div>
        <p className={styles.pageDescription}>
          Quản lý các video YouTube Shorts hiển thị trên trang chủ. Các video sẽ
          hiển thị theo thứ tự từ trên xuống.
        </p>
      </div>

      {/* Videos List */}
      <div className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>
          Danh sách video ({videos.length})
        </h3>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : videos.length > 0 ? (
          <div className={styles.videosGrid}>
            {videos.map((video, index) => (
              <div key={video.id} className={styles.videoCard}>
                <div className={styles.videoPreview}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}?rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className={styles.videoInfo}>
                  <h4 className={styles.videoTitle}>{video.title}</h4>
                  <p className={styles.videoId}>ID: {video.videoId}</p>
                  <div className={styles.videoActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.moveUp}`}
                      title="Di chuyển lên"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.moveDown}`}
                      title="Di chuyển xuống"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === videos.length - 1}
                    >
                      <ArrowDownOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.edit}`}
                      title="Chỉnh sửa"
                      onClick={() => handleEditVideo(video)}
                    >
                      <EditOutlined />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.delete}`}
                      title="Xóa"
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PlayCircleOutlined style={{ fontSize: 48, color: "#ccc" }} />
            <p>Chưa có video nào</p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleAddVideo}
            >
              <PlusOutlined />
              Thêm video đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Video Form Modal */}
      <Modal
        title={editingVideo ? "Chỉnh sửa Video" : "Thêm Video Mới"}
        open={showVideoForm}
        onCancel={() => {
          setShowVideoForm(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          className={styles.videoForm}
        >
          <Form.Item
            name="videoId"
            label="YouTube Video ID hoặc URL"
            rules={[
              { required: true, message: "Vui lòng nhập Video ID hoặc URL" },
            ]}
            extra="Ví dụ: um1LBitMFWQ hoặc https://youtube.com/shorts/um1LBitMFWQ"
          >
            <Input placeholder="Nhập Video ID hoặc dán link YouTube Shorts" />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề video"
            extra="Tiêu đề hiển thị dưới video"
          >
            <Input placeholder="Nhập tiêu đề (tùy chọn)" />
          </Form.Item>

          <div className={styles.formActions}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setShowVideoForm(false);
                form.resetFields();
              }}
            >
              Hủy
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <SaveOutlined />
              {editingVideo ? "Cập nhật" : "Thêm video"}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVideoReviewsPage;
