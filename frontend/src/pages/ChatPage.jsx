import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Avatar,
  Badge,
  Empty,
  Spin,
  Typography,
  Space,
  Upload,
  Tooltip,
  message,
  Divider,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  PictureOutlined,
  SmileOutlined,
  ShopOutlined,
  SearchOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  WifiOutlined,
  DisconnectOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useChat } from "../contexts/ChatContext";
import { AuthContext } from "../components/context/auth.context";
import { ConnectionState, ContentType } from "../util/chatWebSocket";
import { uploadPublicImageApi } from "../util/api";
import styles from "./ChatPage.module.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text, Title } = Typography;

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth } = useContext(AuthContext);
  const {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    userPresence,
    connectionState,
    isLoading,
    connectChat,
    disconnectChat,
    fetchConversations,
    selectConversation,
    sendTextMessage,
    sendImageMessage,
    sendTyping,
    markAsRead,
    createOrGetConversation,
    setActiveConversation,
    getCurrentUserId,
    isUserOnline,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login", { state: { from: "/chat" } });
    }
  }, [auth.isAuthenticated, navigate]);

  // Kết nối chat
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.username) {
      connectChat(auth.user.username);
      fetchConversations();
    }
  }, [auth.isAuthenticated, auth.user?.username]);

  // Mở conversation từ URL param
  useEffect(() => {
    const shopId = searchParams.get("shopId");
    if (shopId && auth.isAuthenticated) {
      openConversationWithShop(shopId);
    }
  }, [searchParams, auth.isAuthenticated]);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && activeConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversation]);

  // Focus input
  useEffect(() => {
    if (activeConversation && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConversation]);

  const openConversationWithShop = async (shopId) => {
    try {
      const conversation = await createOrGetConversation(shopId);
      if (conversation) {
        await selectConversation(conversation.id);
      }
    } catch (error) {
      console.error("Error opening conversation:", error);
      message.error("Không thể mở cuộc trò chuyện");
    }
  };

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(activeConversation.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(activeConversation.id, false);
    }, 2000);
  }, [activeConversation, isTyping, sendTyping]);

  // Gửi tin nhắn
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !activeConversation) return;

    const text = inputValue.trim();
    setInputValue("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    sendTyping(activeConversation.id, false);

    const success = await sendTextMessage(activeConversation.id, text);
    if (!success) {
      message.error("Không thể gửi tin nhắn");
      setInputValue(text);
    }
  }, [inputValue, activeConversation, sendTextMessage, sendTyping]);

  // Upload ảnh
  const handleImageUpload = useCallback(
    async (file) => {
      if (!activeConversation) return false;

      setUploading(true);
      try {
        const response = await uploadPublicImageApi(file);
        if (response?.result || response?.url) {
          const imageUrl = response.result || response.url;
          await sendImageMessage(activeConversation.id, {
            url: imageUrl,
            thumbnailUrl: imageUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Không thể tải ảnh lên");
      } finally {
        setUploading(false);
      }
      return false;
    },
    [activeConversation, sendImageMessage]
  );

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    const now = dayjs();

    if (now.diff(date, "day") === 0) {
      return date.format("HH:mm");
    } else if (now.diff(date, "day") === 1) {
      return "Hôm qua";
    } else if (now.diff(date, "week") < 1) {
      return date.format("dddd");
    } else {
      return date.format("DD/MM/YYYY");
    }
  };

  // Lấy thông tin người khác trong conversation
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    const currentUser = getCurrentUserId() || auth.user?.username;
    return conversation.participants.find((p) => p.userId !== currentUser);
  };

  // Kiểm tra shop có online không
  const isShopOnline = (conversation) => {
    const other = getOtherParticipant(conversation);
    if (!other) return false;
    // Shop participant có shopId, cần check owner username online
    return (
      isUserOnline(other.userId) || (other.shopId && isUserOnline(other.shopId))
    );
  };

  // Lọc conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchKeyword) return true;
    const other = getOtherParticipant(conv);
    const name = other?.shopName || other?.displayName || "";
    return name.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  // Render connection status
  const renderConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return (
          <Tooltip title="Đã kết nối">
            <WifiOutlined className={styles.connectedIcon} />
          </Tooltip>
        );
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return (
          <Tooltip title="Đang kết nối...">
            <LoadingOutlined className={styles.connectingIcon} />
          </Tooltip>
        );
      default:
        return (
          <Tooltip title="Mất kết nối">
            <DisconnectOutlined className={styles.disconnectedIcon} />
          </Tooltip>
        );
    }
  };

  // Render tin nhắn
  const renderMessage = (msg) => {
    const currentUser = getCurrentUserId() || auth.user?.username;
    const isOwn = msg.senderId === currentUser;
    const content = msg.contents?.[0];

    return (
      <div
        key={msg.id}
        className={`${styles.messageWrapper} ${isOwn ? styles.own : ""}`}
      >
        {!isOwn && (
          <Avatar
            size={36}
            src={msg.senderAvatar}
            className={styles.messageAvatar}
          >
            {msg.senderName?.[0]}
          </Avatar>
        )}
        <div className={styles.messageBubble}>
          {/* Reply to */}
          {msg.replyTo && (
            <div className={styles.replyTo}>
              <span className={styles.replyToName}>
                {msg.replyTo.senderName}
              </span>
              <span className={styles.replyToText}>{msg.replyTo.preview}</span>
            </div>
          )}

          {/* Content */}
          {content?.contentType === ContentType.TEXT && (
            <div className={styles.messageText}>{content.text}</div>
          )}

          {content?.contentType === ContentType.IMAGE && (
            <div className={styles.messageImage}>
              <img
                src={content.image?.url || content.image?.thumbnailUrl}
                alt="Image"
                onClick={() => window.open(content.image?.url, "_blank")}
              />
              {content.image?.caption && (
                <div className={styles.imageCaption}>
                  {content.image.caption}
                </div>
              )}
            </div>
          )}

          {content?.contentType === ContentType.PRODUCT && (
            <div
              className={styles.messageProduct}
              onClick={() => navigate(`/product/${content.product?.productId}`)}
            >
              <div className={styles.productCard}>
                {content.product?.imageUrl && (
                  <img
                    src={content.product.imageUrl}
                    alt={content.product.productName}
                    className={styles.productImage}
                  />
                )}
                <div className={styles.productInfo}>
                  <div className={styles.productName}>
                    {content.product?.productName}
                  </div>
                  <div className={styles.productPrice}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(content.product?.price || 0)}
                  </div>
                </div>
              </div>
              {content.product?.note && (
                <div className={styles.productNote}>{content.product.note}</div>
              )}
            </div>
          )}

          {content?.contentType === ContentType.ORDER && (
            <div
              className={styles.messageOrder}
              onClick={() => navigate(`/profile/orders`)}
            >
              <div className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderCode}>
                    {content.order?.orderCode}
                  </span>
                  <span
                    className={`${styles.orderStatus} ${
                      styles[content.order?.status?.toLowerCase()]
                    }`}
                  >
                    {content.order?.status}
                  </span>
                </div>
                <div className={styles.orderAmount}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(content.order?.totalAmount || 0)}
                </div>
              </div>
              {content.order?.note && (
                <div className={styles.orderNote}>{content.order.note}</div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={styles.messageFooter}>
            <span className={styles.messageTime}>
              {dayjs(msg.sentAt).format("HH:mm")}
            </span>
            {isOwn && (
              <span className={styles.messageStatus}>
                {msg.status === "READ" || msg.readBy?.length > 1 ? (
                  <CheckCircleOutlined className={styles.readIcon} />
                ) : msg.status === "SENT" || msg.status === "DELIVERED" ? (
                  <CheckOutlined />
                ) : (
                  <LoadingOutlined />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  const showConversationList = !isMobileView || !activeConversation;
  const showMessages = !isMobileView || activeConversation;

  return (
    <>
      <Helmet>
        <title>Tin nhắn - HUSTBuy</title>
        <meta
          name="description"
          content="Quản lý tin nhắn và chat với các shop"
        />
      </Helmet>

      <div className={styles.chatPage}>
        <div className={styles.chatContainer}>
          {/* Sidebar - Conversation List */}
          {showConversationList && (
            <div className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <Title level={4} style={{ margin: 0 }}>
                  <MessageOutlined /> Tin nhắn
                </Title>
                {renderConnectionStatus()}
              </div>

              <div className={styles.searchBox}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  allowClear
                />
              </div>

              <div className={styles.conversationList}>
                {isLoading ? (
                  <div className={styles.loadingContainer}>
                    <Spin tip="Đang tải..." />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      searchKeyword
                        ? "Không tìm thấy cuộc trò chuyện"
                        : "Chưa có cuộc trò chuyện nào"
                    }
                  />
                ) : (
                  filteredConversations.map((conv) => {
                    const otherParticipant = getOtherParticipant(conv);
                    const currentUser =
                      getCurrentUserId() || auth.user?.username;
                    const unreadCount = conv.unreadCount?.[currentUser] || 0;

                    return (
                      <div
                        key={conv.id}
                        className={`${styles.conversationItem} ${
                          activeConversation?.id === conv.id
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => selectConversation(conv.id)}
                      >
                        <Badge
                          count={unreadCount}
                          size="small"
                          offset={[-5, 5]}
                        >
                          <Avatar
                            size={50}
                            src={otherParticipant?.avatarUrl}
                            icon={<ShopOutlined />}
                          />
                        </Badge>
                        <div className={styles.conversationInfo}>
                          <div className={styles.conversationHeader}>
                            <span className={styles.participantName}>
                              {otherParticipant?.shopName ||
                                otherParticipant?.displayName ||
                                "Shop"}
                            </span>
                            <span className={styles.conversationTime}>
                              {formatTime(
                                conv.lastMessage?.sentAt || conv.updatedAt
                              )}
                            </span>
                          </div>
                          <div
                            className={`${styles.lastMessage} ${
                              unreadCount > 0 ? styles.unread : ""
                            }`}
                          >
                            {conv.lastMessage?.preview ||
                              "Bắt đầu cuộc trò chuyện"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Main - Messages */}
          {showMessages && (
            <div className={styles.mainContent}>
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className={styles.chatHeader}>
                    {isMobileView && (
                      <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => setActiveConversation(null)}
                        className={styles.backButton}
                      />
                    )}
                    <Avatar
                      size={40}
                      src={getOtherParticipant(activeConversation)?.avatarUrl}
                      icon={<ShopOutlined />}
                    />
                    <div className={styles.headerInfo}>
                      <span className={styles.headerName}>
                        {getOtherParticipant(activeConversation)?.shopName ||
                          getOtherParticipant(activeConversation)
                            ?.displayName ||
                          "Shop"}
                      </span>
                      <span className={styles.headerStatus}>
                        {isShopOnline(activeConversation)
                          ? "Đang hoạt động"
                          : "Ngoại tuyến"}
                      </span>
                    </div>
                    <Button
                      type="text"
                      icon={<ShopOutlined />}
                      onClick={() =>
                        navigate(`/store/${activeConversation.shopId}`)
                      }
                    >
                      Xem shop
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className={styles.messagesContainer}>
                    {(messages[activeConversation.id] || []).length === 0 ? (
                      <div className={styles.emptyMessages}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Bắt đầu cuộc trò chuyện"
                        />
                      </div>
                    ) : (
                      (messages[activeConversation.id] || []).map(renderMessage)
                    )}

                    {/* Typing indicator */}
                    {(typingUsers[activeConversation.id] || []).length > 0 && (
                      <div className={styles.messageWrapper}>
                        <div className={styles.typingIndicator}>
                          <span className={styles.typingDot}></span>
                          <span className={styles.typingDot}></span>
                          <span className={styles.typingDot}></span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className={styles.inputContainer}>
                    <div className={styles.inputActions}>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handleImageUpload}
                        disabled={uploading}
                      >
                        <Button
                          type="text"
                          icon={
                            uploading ? (
                              <LoadingOutlined />
                            ) : (
                              <PictureOutlined />
                            )
                          }
                          disabled={uploading}
                        />
                      </Upload>
                      <Button type="text" icon={<SmileOutlined />} />
                    </div>

                    <Input.TextArea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        handleTyping();
                      }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Nhập tin nhắn..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      className={styles.messageInput}
                    />

                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className={styles.sendButton}
                    />
                  </div>
                </>
              ) : (
                <div className={styles.noConversation}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chọn một cuộc trò chuyện để bắt đầu"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
