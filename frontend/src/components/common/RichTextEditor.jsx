import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import {
  message,
  Modal,
  InputNumber,
  Select,
  Radio,
  Button,
  Space,
  Slider,
} from "antd";
import {
  ExpandOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import "react-quill-new/dist/quill.snow.css";
import { uploadMediaApi } from "../../util/api";
import styles from "./RichTextEditor.module.css";

// Import and register BlotFormatter module for image/video resizing
import BlotFormatter from "quill-blot-formatter";
Quill.register("modules/blotFormatter", BlotFormatter);

// Custom Video Blot to support styling
const BlockEmbed = Quill.import("blots/block/embed");
class VideoBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    if (typeof value === "object") {
      node.setAttribute("src", value.url);
      if (value.width) node.setAttribute("width", value.width);
      if (value.height) node.setAttribute("height", value.height);
      if (value.style) node.setAttribute("style", value.style);
    } else {
      node.setAttribute("src", this.sanitize(value));
    }
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", "true");
    return node;
  }

  static sanitize(url) {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
      style: node.getAttribute("style"),
    };
  }
}
VideoBlot.blotName = "video";
VideoBlot.tagName = "iframe";
Quill.register(VideoBlot, true);

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  minHeight = 200,
  maxLength = 10000,
  readOnly = false,
}) => {
  const quillRef = useRef(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaSettings, setMediaSettings] = useState({
    width: 100,
    widthUnit: "%",
    height: "auto",
    align: "center",
    borderRadius: 8,
    shadow: "none",
  });

  // Setup double-click handler for modal
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || readOnly) return;

    const handleDoubleClick = (e) => {
      const target = e.target;
      if (target.tagName === "IMG" || target.tagName === "IFRAME") {
        e.preventDefault();
        setSelectedMedia({
          element: target,
          type: target.tagName === "IMG" ? "image" : "video",
        });

        // Parse current styles
        const currentWidth =
          target.style.width || target.getAttribute("width") || "100%";
        const currentHeight =
          target.style.height || target.getAttribute("height") || "auto";
        const currentAlign =
          target.style.display === "block" &&
          target.style.margin?.includes("auto")
            ? target.style.marginLeft === "0px"
              ? "left"
              : target.style.marginRight === "0px"
              ? "right"
              : "center"
            : target.style.float || "center";

        setMediaSettings({
          width: parseInt(currentWidth) || 100,
          widthUnit: currentWidth.includes("%") ? "%" : "px",
          height:
            currentHeight === "auto"
              ? "auto"
              : parseInt(currentHeight) || "auto",
          align: currentAlign,
          borderRadius: parseInt(target.style.borderRadius) || 8,
          shadow: target.style.boxShadow ? "medium" : "none",
        });

        setMediaModalVisible(true);
      }
    };

    const editor = quill.root;
    editor.addEventListener("dblclick", handleDoubleClick);

    return () => {
      editor.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [readOnly]);

  // Image upload handler with size dialog
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        message.error("Ảnh phải nhỏ hơn 10MB!");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        message.error("Chỉ được upload file ảnh!");
        return;
      }

      try {
        message.loading({ content: "Đang tải ảnh lên...", key: "upload" });

        const response = await uploadMediaApi(file);
        const imageUrl = response.result?.fileUrl;

        if (imageUrl) {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", imageUrl);
            quill.setSelection(range.index + 1);

            // Auto-style the inserted image
            setTimeout(() => {
              const images = quill.root.querySelectorAll("img");
              const lastImage = images[images.length - 1];
              if (lastImage && lastImage.src === imageUrl) {
                lastImage.style.maxWidth = "100%";
                lastImage.style.height = "auto";
                lastImage.style.display = "block";
                lastImage.style.margin = "8px auto";
                lastImage.style.borderRadius = "8px";
                lastImage.style.cursor = "pointer";
              }
            }, 100);
          }
          message.success({
            content:
              "Tải ảnh lên thành công! Click vào ảnh để chỉnh kích thước.",
            key: "upload",
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error({
          content: "Không thể tải ảnh lên. Vui lòng thử lại!",
          key: "upload",
        });
      }
    };
  }, []);

  // Video handler with size options
  const videoHandler = useCallback(() => {
    const url = prompt("Nhập URL video (YouTube, Vimeo, ...):");
    if (url) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "video", url);
        quill.setSelection(range.index + 1);

        // Auto-style the inserted video
        setTimeout(() => {
          const videos = quill.root.querySelectorAll("iframe");
          const lastVideo = videos[videos.length - 1];
          if (lastVideo) {
            lastVideo.style.width = "100%";
            lastVideo.style.maxWidth = "640px";
            lastVideo.style.height = "360px";
            lastVideo.style.display = "block";
            lastVideo.style.margin = "8px auto";
            lastVideo.style.borderRadius = "8px";
            lastVideo.style.cursor = "pointer";
          }
        }, 100);

        message.success("Đã chèn video! Click vào video để chỉnh kích thước.");
      }
    }
  }, []);

  // Apply media settings
  const applyMediaSettings = () => {
    if (!selectedMedia?.element) return;

    const el = selectedMedia.element;
    const { width, widthUnit, height, align, borderRadius, shadow } =
      mediaSettings;

    // Set width
    el.style.width = `${width}${widthUnit}`;
    el.style.maxWidth = "100%";

    // Set height
    if (height === "auto") {
      el.style.height = "auto";
    } else {
      el.style.height = `${height}px`;
    }

    // Set alignment
    el.style.float = "none";
    if (align === "center") {
      el.style.display = "block";
      el.style.margin = "8px auto";
    } else if (align === "left") {
      el.style.display = "block";
      el.style.margin = "8px auto 8px 0";
    } else if (align === "right") {
      el.style.display = "block";
      el.style.margin = "8px 0 8px auto";
    }

    // Set border radius
    el.style.borderRadius = `${borderRadius}px`;

    // Set shadow
    if (shadow === "none") {
      el.style.boxShadow = "none";
    } else if (shadow === "light") {
      el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
    } else if (shadow === "medium") {
      el.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    } else if (shadow === "heavy") {
      el.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
    }

    // Trigger change event
    const quill = quillRef.current?.getEditor();
    if (quill) {
      onChange(quill.root.innerHTML);
    }

    setMediaModalVisible(false);
    message.success("Đã cập nhật style!");
  };

  // Toolbar configuration with custom handlers
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
        },
      },
      blotFormatter: {},
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler, videoHandler]
  );

  // Supported formats - Note: "list" covers both ordered and bullet lists
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  const handleChange = (content, delta, source, editor) => {
    // Get text length without HTML tags
    const textLength = editor.getText().trim().length;

    if (textLength <= maxLength) {
      onChange(content);
    }
  };

  // Get current text length for counter
  const getTextLength = () => {
    if (!value) return 0;
    // Create a temporary element to strip HTML tags
    const div = document.createElement("div");
    div.innerHTML = value;
    return div.textContent?.trim().length || 0;
  };

  const textLength = getTextLength();

  return (
    <div className={styles.editorWrapper}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ minHeight }}
        className={styles.editor}
      />
      <div className={styles.footer}>
        <span className={styles.hint}>
          💡 Click vào ảnh để resize bằng cách kéo góc. Double-click để mở cài
          đặt chi tiết.
        </span>
        <span
          className={`${styles.counter} ${
            textLength > maxLength * 0.9 ? styles.warning : ""
          } ${textLength >= maxLength ? styles.error : ""}`}
        >
          {textLength.toLocaleString("vi-VN")} /{" "}
          {maxLength.toLocaleString("vi-VN")} ký tự
        </span>
      </div>

      {/* Media Style Modal */}
      <Modal
        title={
          <Space>
            <ExpandOutlined />
            <span>
              Chỉnh sửa {selectedMedia?.type === "image" ? "ảnh" : "video"}
            </span>
          </Space>
        }
        open={mediaModalVisible}
        onCancel={() => setMediaModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setMediaModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="apply" type="primary" onClick={applyMediaSettings}>
            Áp dụng
          </Button>,
        ]}
        width={480}
      >
        <div className={styles.mediaSettingsForm}>
          {/* Width */}
          <div className={styles.settingRow}>
            <label>Chiều rộng:</label>
            <Space>
              <Slider
                min={10}
                max={mediaSettings.widthUnit === "%" ? 100 : 1000}
                value={mediaSettings.width}
                onChange={(val) =>
                  setMediaSettings({ ...mediaSettings, width: val })
                }
                style={{ width: 150 }}
              />
              <InputNumber
                min={10}
                max={mediaSettings.widthUnit === "%" ? 100 : 1000}
                value={mediaSettings.width}
                onChange={(val) =>
                  setMediaSettings({ ...mediaSettings, width: val })
                }
                style={{ width: 80 }}
              />
              <Select
                value={mediaSettings.widthUnit}
                onChange={(val) =>
                  setMediaSettings({
                    ...mediaSettings,
                    widthUnit: val,
                    width: val === "%" ? 100 : 400,
                  })
                }
                style={{ width: 70 }}
                options={[
                  { value: "%", label: "%" },
                  { value: "px", label: "px" },
                ]}
              />
            </Space>
          </div>

          {/* Height */}
          <div className={styles.settingRow}>
            <label>Chiều cao:</label>
            <Space>
              <Radio.Group
                value={mediaSettings.height === "auto" ? "auto" : "custom"}
                onChange={(e) =>
                  setMediaSettings({
                    ...mediaSettings,
                    height: e.target.value === "auto" ? "auto" : 300,
                  })
                }
              >
                <Radio value="auto">Tự động</Radio>
                <Radio value="custom">Tùy chỉnh</Radio>
              </Radio.Group>
              {mediaSettings.height !== "auto" && (
                <InputNumber
                  min={50}
                  max={1000}
                  value={mediaSettings.height}
                  onChange={(val) =>
                    setMediaSettings({ ...mediaSettings, height: val })
                  }
                  addonAfter="px"
                  style={{ width: 120 }}
                />
              )}
            </Space>
          </div>

          {/* Alignment */}
          <div className={styles.settingRow}>
            <label>Căn chỉnh:</label>
            <Radio.Group
              value={mediaSettings.align}
              onChange={(e) =>
                setMediaSettings({ ...mediaSettings, align: e.target.value })
              }
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="left">
                <AlignLeftOutlined /> Trái
              </Radio.Button>
              <Radio.Button value="center">
                <AlignCenterOutlined /> Giữa
              </Radio.Button>
              <Radio.Button value="right">
                <AlignRightOutlined /> Phải
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* Border Radius */}
          <div className={styles.settingRow}>
            <label>Bo góc:</label>
            <Space>
              <Slider
                min={0}
                max={50}
                value={mediaSettings.borderRadius}
                onChange={(val) =>
                  setMediaSettings({ ...mediaSettings, borderRadius: val })
                }
                style={{ width: 150 }}
              />
              <InputNumber
                min={0}
                max={50}
                value={mediaSettings.borderRadius}
                onChange={(val) =>
                  setMediaSettings({ ...mediaSettings, borderRadius: val })
                }
                addonAfter="px"
                style={{ width: 100 }}
              />
            </Space>
          </div>

          {/* Shadow */}
          <div className={styles.settingRow}>
            <label>Đổ bóng:</label>
            <Select
              value={mediaSettings.shadow}
              onChange={(val) =>
                setMediaSettings({ ...mediaSettings, shadow: val })
              }
              style={{ width: 150 }}
              options={[
                { value: "none", label: "Không có" },
                { value: "light", label: "Nhẹ" },
                { value: "medium", label: "Trung bình" },
                { value: "heavy", label: "Đậm" },
              ]}
            />
          </div>

          {/* Preview */}
          <div className={styles.previewBox}>
            <label>Xem trước:</label>
            <div
              className={styles.previewContainer}
              style={{
                textAlign: mediaSettings.align,
              }}
            >
              {selectedMedia?.type === "image" ? (
                <img
                  src={selectedMedia?.element?.src}
                  alt="Preview"
                  style={{
                    width: `${Math.min(
                      mediaSettings.width,
                      mediaSettings.widthUnit === "%" ? 100 : 300
                    )}${mediaSettings.widthUnit === "%" ? "%" : "px"}`,
                    maxWidth: "100%",
                    height:
                      mediaSettings.height === "auto"
                        ? "auto"
                        : `${Math.min(mediaSettings.height, 200)}px`,
                    borderRadius: `${mediaSettings.borderRadius}px`,
                    boxShadow:
                      mediaSettings.shadow === "none"
                        ? "none"
                        : mediaSettings.shadow === "light"
                        ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                        : mediaSettings.shadow === "medium"
                        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                        : "0 8px 24px rgba(0, 0, 0, 0.2)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: `${Math.min(
                      mediaSettings.width,
                      mediaSettings.widthUnit === "%" ? 100 : 300
                    )}${mediaSettings.widthUnit === "%" ? "%" : "px"}`,
                    maxWidth: "100%",
                    height:
                      mediaSettings.height === "auto"
                        ? "120px"
                        : `${Math.min(mediaSettings.height, 200)}px`,
                    borderRadius: `${mediaSettings.borderRadius}px`,
                    boxShadow:
                      mediaSettings.shadow === "none"
                        ? "none"
                        : mediaSettings.shadow === "light"
                        ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                        : mediaSettings.shadow === "medium"
                        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                        : "0 8px 24px rgba(0, 0, 0, 0.2)",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    fontSize: 12,
                  }}
                >
                  📹 Video Preview
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RichTextEditor;
