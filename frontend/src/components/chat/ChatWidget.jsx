import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  Badge,
  Button,
  Avatar,
  Input,
  Spin,
  Empty,
  Tooltip,
  Upload,
  message,
  Drawer,
} from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  MinusOutlined,
  SendOutlined,
  PictureOutlined,
  ShopOutlined,
  UserOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  WifiOutlined,
  DisconnectOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useChat } from "../../contexts/ChatContext";
import { AuthContext } from "../context/auth.context";
import { ConnectionState, ContentType } from "../../util/chatWebSocket";
import { uploadPublicImageApi, getMyStoresApi } from "../../util/api";
import { getHighestRole, ROLES } from "../../constants/roles";
import styles from "./ChatWidget.module.css";
import ProductPickerModal from "../../pages/chat/ProductPickerModal";
import OrderPickerModal from "../../pages/chat/OrderPickerModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const ChatWidget = () => {
  const { auth } = useContext(AuthContext);
  const {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    connectionState,
    isLoading,
    unreadTotal,
    isChatOpen,
    isChatMinimized,
    connectChat,
    disconnectChat,
    fetchConversations,
    selectConversation,
    sendTextMessage,
    sendImageMessage,
    sendProductMessage,
    sendOrderMessage,
    sendTyping,
    markAsRead,
    toggleChat,
    closeChat,
    setActiveConversation,
    getCurrentUserId,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const [sellerStoreId, setSellerStoreId] = useState(null);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Xác định user là seller hay buyer
  const isSeller = getHighestRole(auth.user?.role) === ROLES.SELLER;

  // Kết nối chat khi user đăng nhập
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.username) {
      connectChat(auth.user.username);
      fetchConversations();
    } else {
      disconnectChat();
    }

    return () => {
      // Không disconnect ở đây để giữ connection khi navigate
    };
  }, [auth.isAuthenticated, auth.user?.username]);

  // Lấy storeId của seller
  useEffect(() => {
    const fetchSellerStore = async () => {
      if (isSeller && auth.isAuthenticated) {
        try {
          const response = await getMyStoresApi(0, 1);
          if (response?.result?.content?.[0]?.id) {
            setSellerStoreId(response.result.content[0].id);
          }
        } catch (error) {
          console.error("Error fetching seller store:", error);
        }
      }
    };
    fetchSellerStore();
  }, [isSeller, auth.isAuthenticated]);

  // Scroll to bottom function - scroll within the messages container
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    if (activeConversation && messages[activeConversation.id]) {
      scrollToBottom(true);
    }
  }, [messages, activeConversation, scrollToBottom]);

  // Scroll to bottom when selecting a new conversation
  useEffect(() => {
    if (activeConversation) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [activeConversation?.id, scrollToBottom]);

  // Focus input khi mở conversation
  useEffect(() => {
    if (activeConversation && !isChatMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConversation, isChatMinimized]);

  // Xử lý typing indicator
  const handleTyping = useCallback(() => {
    if (!activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(activeConversation.id, true);
    }

    // Clear và set lại timeout
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

    // Dừng typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    sendTyping(activeConversation.id, false);

    // Gửi tin nhắn
    const success = await sendTextMessage(activeConversation.id, text);
    if (!success) {
      message.error("Không thể gửi tin nhắn");
      setInputValue(text);
    }
  }, [inputValue, activeConversation, sendTextMessage, sendTyping]);

  // Xử lý upload ảnh
  const handleImageUpload = useCallback(
    async (file) => {
      if (!activeConversation) return false;

      // Validate file type
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể tải lên file ảnh!");
        return false;
      }

      // Validate file size (10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("Ảnh phải nhỏ hơn 10MB!");
        return false;
      }

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
      return false; // Prevent default upload
    },
    [activeConversation, sendImageMessage]
  );

  // Gửi sản phẩm
  const handleSendProduct = useCallback(
    async (product) => {
      if (!activeConversation || !product) return;

      try {
        await sendProductMessage(activeConversation.id, product);
        setShowProductPicker(false);
      } catch (error) {
        console.error("Error sending product:", error);
        message.error("Không thể gửi sản phẩm");
      }
    },
    [activeConversation, sendProductMessage]
  );

  // Gửi đơn hàng
  const handleSendOrder = useCallback(
    async (order) => {
      if (!activeConversation || !order) return;

      try {
        await sendOrderMessage(activeConversation.id, order);
        setShowOrderPicker(false);
      } catch (error) {
        console.error("Error sending order:", error);
        message.error("Không thể gửi đơn hàng");
      }
    },
    [activeConversation, sendOrderMessage]
  );

  // Helper function to get storeId for current conversation
  const getConversationStoreId = useCallback(() => {
    if (!activeConversation) return null;

    // If user is seller, use their store
    if (isSeller && sellerStoreId) {
      return sellerStoreId;
    }

    // If user is buyer, use store from conversation
    return activeConversation.storeId;
  }, [activeConversation, isSeller, sellerStoreId]);

  // Chọn conversation
  const handleSelectConversation = useCallback(
    async (conversationId) => {
      await selectConversation(conversationId);
      setShowConversationList(false);
    },
    [selectConversation]
  );

  // Quay lại danh sách conversation
  const handleBackToList = useCallback(() => {
    setActiveConversation(null);
    setShowConversationList(true);
  }, [setActiveConversation]);

  // Format thời gian
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

  // Lấy participant info (đối phương trong conversation)
  // userId trong participant chính là username (từ backend)
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    const currentUsername = getCurrentUserId() || auth.user?.username;
    // userId là username của người dùng
    return conversation.participants.find((p) => p.userId !== currentUsername);
  };

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

  // Render danh sách conversation
  const renderConversationList = () => (
    <div className={styles.conversationList}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spin tip="Đang tải..." />
        </div>
      ) : conversations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có cuộc trò chuyện nào"
          className={styles.emptyState}
        />
      ) : (
        conversations.map((conv) => {
          const otherParticipant = getOtherParticipant(conv);
          // Sử dụng username để lấy unreadCount
          const currentUsername = getCurrentUserId() || auth.user?.username;
          const unreadCount = conv.unreadCount?.[currentUsername] || 0;

          return (
            <div
              key={conv.id}
              className={`${styles.conversationItem} ${
                activeConversation?.id === conv.id ? styles.active : ""
              }`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                <Avatar
                  size={48}
                  src={otherParticipant?.avatarUrl}
                  icon={<ShopOutlined />}
                  className={styles.avatar}
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
                    {formatTime(conv.lastMessage?.sentAt || conv.updatedAt)}
                  </span>
                </div>
                <div className={styles.lastMessage}>
                  {conv.lastMessage?.preview || "Bắt đầu cuộc trò chuyện"}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // Render tin nhắn
  // senderId là username của người gửi
  const renderMessage = (msg) => {
    const currentUsername = getCurrentUserId() || auth.user?.username;
    // So sánh senderId (username) với currentUsername
    const isOwn = msg.senderId === currentUsername;
    const content = msg.contents?.[0];

    return (
      <div
        key={msg.id}
        className={`${styles.messageWrapper} ${isOwn ? styles.own : ""}`}
      >
        {!isOwn && (
          <Avatar
            size={32}
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

          {/* Message content */}
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
            <div className={styles.messageProduct}>
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
                  <div className={styles.productPriceRow}>
                    <span className={styles.productPrice}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(content.product?.price || 0)}
                    </span>
                    {content.product?.originalPrice &&
                      content.product.originalPrice > content.product.price && (
                        <span className={styles.productOriginalPrice}>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(content.product.originalPrice)}
                        </span>
                      )}
                  </div>
                  {(content.product?.rating > 0 ||
                    content.product?.soldCount > 0) && (
                    <div className={styles.productMeta}>
                      {content.product?.rating > 0 && (
                        <span className={styles.productRating}>
                          ⭐ {content.product.rating.toFixed(1)}
                        </span>
                      )}
                      {content.product?.soldCount > 0 && (
                        <span className={styles.productSold}>
                          Đã bán {content.product.soldCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {content.product?.note && (
                <div className={styles.productNote}>{content.product.note}</div>
              )}
            </div>
          )}

          {content?.contentType === ContentType.ORDER && (
            <div className={styles.messageOrder}>
              <div className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderCodeWrapper}>
                    <span className={styles.orderCode}>
                      {content.order?.orderCode}
                    </span>
                    {content.order?.itemCount > 0 && (
                      <span className={styles.orderItemCount}>
                        ({content.order.itemCount} sản phẩm)
                      </span>
                    )}
                  </div>
                  <span
                    className={`${styles.orderStatus} ${
                      styles[content.order?.status?.toLowerCase()]
                    }`}
                  >
                    {content.order?.status === "PENDING" && "Chờ xác nhận"}
                    {content.order?.status === "CONFIRMED" && "Đã xác nhận"}
                    {content.order?.status === "SHIPPING" && "Đang giao"}
                    {content.order?.status === "DELIVERED" && "Đã giao"}
                    {content.order?.status === "CANCELLED" && "Đã hủy"}
                    {content.order?.status === "RETURNED" && "Đã hoàn"}
                    {![
                      "PENDING",
                      "CONFIRMED",
                      "SHIPPING",
                      "DELIVERED",
                      "CANCELLED",
                      "RETURNED",
                    ].includes(content.order?.status) && content.order?.status}
                  </span>
                </div>

                {/* Hiển thị danh sách sản phẩm trong đơn hàng */}
                {content.order?.items && content.order.items.length > 0 && (
                  <div className={styles.orderProducts}>
                    {content.order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className={styles.orderProductItem}>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className={styles.orderProductImage}
                          />
                        )}
                        <div className={styles.orderProductInfo}>
                          <span className={styles.orderProductName}>
                            {item.productName}
                          </span>
                          <div className={styles.orderProductDetails}>
                            <span className={styles.orderProductPrice}>
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.unitPrice || 0)}
                            </span>
                            <span className={styles.orderProductQty}>
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {content.order.items.length > 2 && (
                      <div className={styles.orderMoreProducts}>
                        +{content.order.items.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.orderFooter}>
                  <span className={styles.orderAmount}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(content.order?.totalAmount || 0)}
                  </span>
                </div>
              </div>
              {content.order?.note && (
                <div className={styles.orderNote}>{content.order.note}</div>
              )}
            </div>
          )}

          {/* Message footer */}
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

  // Render chat messages
  const renderMessages = () => {
    if (!activeConversation) return null;

    const conversationMessages = messages[activeConversation.id] || [];
    const typingList = typingUsers[activeConversation.id] || [];

    return (
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {conversationMessages.length === 0 ? (
          <div className={styles.emptyMessages}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Bắt đầu cuộc trò chuyện"
            />
          </div>
        ) : (
          conversationMessages.map(renderMessage)
        )}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <div className={`${styles.messageWrapper}`}>
            <div className={styles.typingIndicator}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render input area
  const renderInput = () => (
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
            icon={uploading ? <LoadingOutlined /> : <PictureOutlined />}
            className={styles.inputActionBtn}
            disabled={uploading}
          />
        </Upload>
        <Button
          type="text"
          icon={<SmileOutlined />}
          className={styles.inputActionBtn}
        />
        {/* Product picker button - chỉ hiện cho seller */}
        {isSeller && sellerStoreId && (
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            className={styles.inputActionBtn}
            onClick={() => setShowProductPicker(true)}
            title="Gửi sản phẩm"
          />
        )}
        {/* Order picker button */}
        <Button
          type="text"
          icon={<ShoppingCartOutlined />}
          className={styles.inputActionBtn}
          onClick={() => setShowOrderPicker(true)}
          title="Gửi đơn hàng"
        />
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSend();
        }}
        disabled={!inputValue.trim()}
        className={styles.sendButton}
      />
    </div>
  );

  // Không hiển thị nếu chưa đăng nhập
  if (!auth.isAuthenticated) {
    return null;
  }

  // Desktop: Widget nổi
  return (
    <>
      {/* Floating button */}
      {isChatMinimized && (
        <div className={styles.floatingButton} onClick={toggleChat}>
          <Badge count={unreadTotal} overflowCount={99}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<MessageOutlined />}
              className={styles.chatButton}
            />
          </Badge>
        </div>
      )}

      {/* Chat window */}
      {isChatOpen && !isChatMinimized && (
        <div className={styles.chatWidget}>
          {/* Header */}
          <div className={styles.chatHeader}>
            {activeConversation && !showConversationList ? (
              <>
                <Button
                  type="text"
                  icon={<span>←</span>}
                  onClick={handleBackToList}
                  className={styles.backButton}
                />
                <Avatar
                  size={36}
                  src={getOtherParticipant(activeConversation)?.avatarUrl}
                  icon={<ShopOutlined />}
                />
                <div className={styles.headerInfo}>
                  <span className={styles.headerName}>
                    {getOtherParticipant(activeConversation)?.shopName ||
                      getOtherParticipant(activeConversation)?.displayName ||
                      "Shop"}
                  </span>
                  {renderConnectionStatus()}
                </div>
              </>
            ) : (
              <>
                <MessageOutlined className={styles.headerIcon} />
                <span className={styles.headerTitle}>Tin nhắn</span>
                {renderConnectionStatus()}
              </>
            )}
            <div className={styles.headerActions}>
              <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={toggleChat}
                className={styles.headerBtn}
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={closeChat}
                className={styles.headerBtn}
              />
            </div>
          </div>

          {/* Body */}
          <div className={styles.chatBody}>
            {showConversationList || !activeConversation
              ? renderConversationList()
              : renderMessages()}
          </div>

          {/* Input */}
          {activeConversation && !showConversationList && renderInput()}
        </div>
      )}

      {/* Product Picker Modal - chỉ cho seller */}
      {isSeller && sellerStoreId && (
        <ProductPickerModal
          open={showProductPicker}
          onClose={() => setShowProductPicker(false)}
          onSelect={handleSendProduct}
          storeId={sellerStoreId}
        />
      )}

      {/* Order Picker Modal */}
      <OrderPickerModal
        open={showOrderPicker}
        onClose={() => setShowOrderPicker(false)}
        onSelect={handleSendOrder}
        storeId={getConversationStoreId()}
        isSeller={isSeller}
      />
    </>
  );
};

export default ChatWidget;
