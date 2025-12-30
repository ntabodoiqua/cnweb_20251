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
  Input,
  Button,
  Avatar,
  Badge,
  Empty,
  Spin,
  Typography,
  Upload,
  Tooltip,
  message,
  Tag,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  PictureOutlined,
  ShopOutlined,
  UserOutlined,
  SearchOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  WifiOutlined,
  DisconnectOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useChat } from "../../contexts/ChatContext";
import { AuthContext } from "../../components/context/auth.context";
import { ConnectionState, ContentType } from "../../util/chatWebSocket";
import { uploadPublicImageApi, getMyStoresApi } from "../../util/api";
import { getHighestRole, ROLES } from "../../constants/roles";
import styles from "./ChatPage.module.css";
import ProductPickerModal from "./ProductPickerModal";
import OrderPickerModal from "./OrderPickerModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title } = Typography;

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
    fetchConversations,
    selectConversation,
    sendTextMessage,
    sendImageMessage,
    sendProductMessage,
    sendOrderMessage,
    sendTyping,
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
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const [sellerStoreId, setSellerStoreId] = useState(null);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Xác định user là seller hay buyer
  const isSeller = getHighestRole(auth.user?.role) === ROLES.SELLER;

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

  // Mở conversation từ URL param
  useEffect(() => {
    const shopId = searchParams.get("shopId");
    const conversationId = searchParams.get("conversationId");

    if (shopId && auth.isAuthenticated && !isSeller) {
      openConversationWithShop(shopId);
    } else if (conversationId && auth.isAuthenticated) {
      selectConversation(conversationId);
    }
  }, [searchParams, auth.isAuthenticated, isSeller]);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Scroll to bottom when messages change (new message received/sent)
  useEffect(() => {
    if (activeConversation && messages[activeConversation.id]) {
      scrollToBottom(true);
    }
  }, [messages, activeConversation, scrollToBottom]);

  // Scroll to bottom when selecting a new conversation
  useEffect(() => {
    if (activeConversation) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [activeConversation?.id, scrollToBottom]);

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

      // Validate file type
      if (!file.type.startsWith("image/")) {
        message.error("Chỉ hỗ trợ file ảnh");
        return false;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error("Ảnh không được vượt quá 10MB");
        return false;
      }

      setUploading(true);
      try {
        const response = await uploadPublicImageApi(file);
        console.log("Upload response:", response);

        // Response format: { result: { fileUrl, fileName, ... } }
        const imageUrl =
          response?.result?.fileUrl ||
          response?.result?.url ||
          response?.result;

        if (imageUrl) {
          const success = await sendImageMessage(activeConversation.id, {
            url: imageUrl,
            thumbnailUrl: imageUrl,
            fileName: response?.result?.originalFileName || file.name,
            fileSize: response?.result?.fileSize || file.size,
            mimeType: response?.result?.fileType || file.type,
          });

          if (success) {
            message.success("Đã gửi ảnh");
          } else {
            message.error("Không thể gửi tin nhắn ảnh");
          }
        } else {
          console.error("Invalid upload response:", response);
          message.error("Không thể tải ảnh lên");
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

  // Gửi sản phẩm
  const handleSendProduct = useCallback(
    async (product) => {
      if (!activeConversation || !product) return;

      try {
        const success = await sendProductMessage(
          activeConversation.id,
          product.id
        );
        if (success) {
          message.success("Đã gửi sản phẩm");
        } else {
          message.error("Không thể gửi sản phẩm");
        }
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
        const success = await sendOrderMessage(activeConversation.id, order.id);
        if (success) {
          message.success("Đã gửi đơn hàng");
        } else {
          message.error("Không thể gửi đơn hàng");
        }
      } catch (error) {
        console.error("Error sending order:", error);
        message.error("Không thể gửi đơn hàng");
      }
    },
    [activeConversation, sendOrderMessage]
  );

  // Lấy storeId từ conversation
  const getConversationStoreId = useCallback((conversation) => {
    if (!conversation) return null;
    // shopId có thể được lưu trực tiếp trong conversation
    if (conversation.shopId) return conversation.shopId;

    // Hoặc lấy từ participant có type là SHOP
    const shopParticipant = conversation.participants?.find(
      (p) => p.type === "SHOP" || p.shopId
    );
    return shopParticipant?.shopId || shopParticipant?.userId;
  }, []);

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
  // userId trong participant chính là username (từ backend)
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    const currentUsername = getCurrentUserId() || auth.user?.username;
    // userId trong participant là username của người dùng
    return conversation.participants.find((p) => p.userId !== currentUsername);
  };

  // Kiểm tra người khác có online không
  // Sử dụng username để check presence
  const isOtherParticipantOnline = (conversation) => {
    const other = getOtherParticipant(conversation);
    if (!other) return false;
    // userId chính là username, sử dụng trực tiếp để check online status
    return isUserOnline(other.userId);
  };

  // Lấy tên hiển thị của người khác
  const getOtherName = (conversation) => {
    const other = getOtherParticipant(conversation);
    if (!other) return isSeller ? "Khách hàng" : "Shop";
    return (
      other.shopName ||
      other.displayName ||
      other.userId ||
      (isSeller ? "Khách hàng" : "Shop")
    );
  };

  // Lọc conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchKeyword) return true;
    const name = getOtherName(conv);
    return name.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  // Đếm tổng tin nhắn chưa đọc
  // unreadCount sử dụng username làm key
  const totalUnread = conversations.reduce((total, conv) => {
    const currentUsername = getCurrentUserId() || auth.user?.username;
    return total + (conv.unreadCount?.[currentUsername] || 0);
  }, 0);

  // Render connection status
  const renderConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return (
          <Tag color="success" icon={<WifiOutlined />}>
            Đã kết nối
          </Tag>
        );
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return (
          <Tag color="warning" icon={<LoadingOutlined />}>
            Đang kết nối...
          </Tag>
        );
      default:
        return (
          <Tag color="error" icon={<DisconnectOutlined />}>
            Mất kết nối
          </Tag>
        );
    }
  };

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
                  <div className={styles.productMeta}>
                    {content.product?.rating > 0 && (
                      <span className={styles.productRating}>
                        ⭐ {content.product.rating.toFixed(1)}
                        {content.product.ratingCount > 0 && (
                          <span className={styles.productRatingCount}>
                            ({content.product.ratingCount})
                          </span>
                        )}
                      </span>
                    )}
                    {content.product?.soldCount > 0 && (
                      <span className={styles.productSold}>
                        Đã bán {content.product.soldCount}
                      </span>
                    )}
                  </div>
                  {content.product?.shopName && (
                    <div className={styles.productShop}>
                      <ShopOutlined /> {content.product.shopName}
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
            <div
              className={styles.messageOrder}
              onClick={() =>
                navigate(isSeller ? `/seller/orders` : `/profile/orders`)
              }
            >
              <div className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderCodeWrapper}>
                    <span className={styles.orderCode}>
                      <ShoppingOutlined /> {content.order?.orderCode}
                    </span>
                    {content.order?.itemCount > 0 && (
                      <span className={styles.orderItemCount}>
                        ({content.order.itemCount} sản phẩm)
                      </span>
                    )}
                  </div>
                  <Tag
                    color={
                      content.order?.status === "DELIVERED"
                        ? "success"
                        : content.order?.status === "CANCELLED"
                        ? "error"
                        : content.order?.status === "SHIPPING"
                        ? "processing"
                        : "warning"
                    }
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
                  </Tag>
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
                          {item.variantName && (
                            <span className={styles.orderProductVariant}>
                              {item.variantName}
                            </span>
                          )}
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
                  {content.order?.orderedAt && (
                    <span className={styles.orderDate}>
                      {dayjs(content.order.orderedAt).format("DD/MM/YYYY")}
                    </span>
                  )}
                  <div className={styles.orderTotalWrapper}>
                    <span className={styles.orderTotalLabel}>Tổng:</span>
                    <span className={styles.orderAmount}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(content.order?.totalAmount || 0)}
                    </span>
                  </div>
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
        <meta name="description" content="Quản lý tin nhắn và chat" />
      </Helmet>

      <div className={styles.chatPage}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <Title level={4} style={{ margin: 0 }}>
              <MessageOutlined />{" "}
              {isSeller ? "Tin nhắn khách hàng" : "Tin nhắn"}
            </Title>
            {totalUnread > 0 && (
              <Badge count={totalUnread} style={{ marginLeft: 8 }} />
            )}
          </div>
          {renderConnectionStatus()}
        </div>

        <div className={styles.chatContainer}>
          {/* Sidebar - Conversation List */}
          {showConversationList && (
            <div className={styles.sidebar}>
              <div className={styles.searchBox}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder={
                    isSeller
                      ? "Tìm kiếm khách hàng..."
                      : "Tìm kiếm cuộc trò chuyện..."
                  }
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
                    // Sử dụng username để lấy unreadCount
                    const currentUsername =
                      getCurrentUserId() || auth.user?.username;
                    const unreadCount =
                      conv.unreadCount?.[currentUsername] || 0;

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
                            size={48}
                            src={otherParticipant?.avatarUrl}
                            icon={
                              isSeller ? <UserOutlined /> : <ShopOutlined />
                            }
                          />
                        </Badge>
                        <div className={styles.conversationInfo}>
                          <div className={styles.conversationHeader}>
                            <span className={styles.participantName}>
                              {getOtherName(conv)}
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
                      icon={isSeller ? <UserOutlined /> : <ShopOutlined />}
                    />
                    <div className={styles.headerInfo}>
                      <span className={styles.headerName}>
                        {getOtherName(activeConversation)}
                      </span>
                      <span className={styles.headerStatus}>
                        {isOtherParticipantOnline(activeConversation)
                          ? "Đang hoạt động"
                          : "Ngoại tuyến"}
                      </span>
                    </div>
                    {!isSeller && activeConversation.shopId && (
                      <Button
                        type="text"
                        icon={<ShopOutlined />}
                        onClick={() =>
                          navigate(`/store/${activeConversation.shopId}`)
                        }
                      >
                        Xem shop
                      </Button>
                    )}
                  </div>

                  {/* Messages */}
                  <div
                    className={styles.messagesContainer}
                    ref={messagesContainerRef}
                  >
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
                        <Tooltip title="Gửi ảnh">
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
                        </Tooltip>
                      </Upload>

                      {/* Nút gửi sản phẩm - Seller gửi sản phẩm của shop, Buyer gửi sản phẩm của shop đang chat */}
                      <Tooltip title="Gửi sản phẩm">
                        <Button
                          type="text"
                          icon={<AppstoreOutlined />}
                          onClick={() => setShowProductPicker(true)}
                          disabled={
                            !isSeller &&
                            !getConversationStoreId(activeConversation)
                          }
                        />
                      </Tooltip>

                      {/* Nút gửi đơn hàng - Cả buyer và seller đều có thể gửi */}
                      <Tooltip title="Gửi đơn hàng">
                        <Button
                          type="text"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => setShowOrderPicker(true)}
                        />
                      </Tooltip>
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

      {/* Product Picker Modal */}
      <ProductPickerModal
        visible={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={handleSendProduct}
        storeId={
          isSeller ? sellerStoreId : getConversationStoreId(activeConversation)
        }
        title={isSeller ? "Chọn sản phẩm của bạn" : "Chọn sản phẩm"}
      />

      {/* Order Picker Modal */}
      <OrderPickerModal
        visible={showOrderPicker}
        onClose={() => setShowOrderPicker(false)}
        onSelect={handleSendOrder}
        storeId={
          isSeller ? sellerStoreId : getConversationStoreId(activeConversation)
        }
        isSeller={isSeller}
        title={isSeller ? "Chọn đơn hàng của khách" : "Chọn đơn hàng của bạn"}
      />
    </>
  );
};

export default ChatPage;
