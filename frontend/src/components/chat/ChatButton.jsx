import React, { useContext, useState } from "react";
import { Button, Tooltip, message } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../contexts/ChatContext";
import { AuthContext } from "../context/auth.context";

/**
 * ChatButton - Nút chat với shop
 *
 * @param {Object} props
 * @param {string} props.shopId - ID của shop
 * @param {string} props.shopName - Tên shop (optional, để hiển thị)
 * @param {string} props.type - Loại button: "primary", "default", "text", "link"
 * @param {string} props.size - Kích thước: "small", "middle", "large"
 * @param {boolean} props.block - Full width
 * @param {string} props.className - Custom class
 * @param {React.ReactNode} props.children - Custom content
 * @param {Object} props.style - Custom style
 */
const ChatButton = ({
  shopId,
  shopName,
  type = "default",
  size = "middle",
  block = false,
  className,
  children,
  style,
  onClick,
  ...rest
}) => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { openChatWithShop } = useChat();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Kiểm tra đăng nhập
    if (!auth.isAuthenticated) {
      message.info("Vui lòng đăng nhập để chat với shop");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    // Kiểm tra shopId
    if (!shopId) {
      message.error("Không tìm thấy thông tin shop");
      return;
    }

    // Mở chat với shop
    setLoading(true);
    try {
      await openChatWithShop(shopId, shopName);
    } catch (error) {
      console.error("Error opening chat:", error);
      if (error?.message?.includes("own shop")) {
        message.warning("Bạn không thể chat với shop của chính mình");
      } else {
        message.error("Không thể mở cuộc trò chuyện");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={shopName ? `Chat với ${shopName}` : "Chat với shop"}>
      <Button
        type={type}
        size={size}
        block={block}
        icon={<MessageOutlined />}
        onClick={handleClick}
        loading={loading}
        className={className}
        style={style}
        {...rest}
      >
        {children || "Chat ngay"}
      </Button>
    </Tooltip>
  );
};

export default ChatButton;
