import { useMemo, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import { message } from "antd";
import "react-quill-new/dist/quill.snow.css";
import { uploadMediaApi } from "../../util/api";
import styles from "./RichTextEditor.module.css";

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  minHeight = 200,
  maxLength = 10000,
  readOnly = false,
}) => {
  const quillRef = useRef(null);

  // Image upload handler
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
          }
          message.success({
            content: "Tải ảnh lên thành công!",
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

  // Video handler - prompt for URL (YouTube, Vimeo, etc.)
  const videoHandler = useCallback(() => {
    const url = prompt("Nhập URL video (YouTube, Vimeo, ...):");
    if (url) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "video", url);
        quill.setSelection(range.index + 1);
      }
    }
  }, []);

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
          💡 Nhấn vào icon ảnh để upload, icon video để chèn YouTube/Vimeo
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
    </div>
  );
};

export default RichTextEditor;
