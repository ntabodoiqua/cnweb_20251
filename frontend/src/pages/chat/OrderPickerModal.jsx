import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Input,
  List,
  Spin,
  Empty,
  Button,
  Tag,
  Select,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { getMyOrdersApi, getStoreOrdersApi } from "../../util/api";
import styles from "./PickerModal.module.css";
import dayjs from "dayjs";

const ORDER_STATUS_MAP = {
  PENDING: { text: "Chờ xác nhận", color: "warning" },
  CONFIRMED: { text: "Đã xác nhận", color: "processing" },
  SHIPPING: { text: "Đang giao", color: "processing" },
  DELIVERED: { text: "Đã giao", color: "success" },
  CANCELLED: { text: "Đã hủy", color: "error" },
  RETURNED: { text: "Đã hoàn", color: "default" },
};

const OrderPickerModal = ({
  visible,
  onClose,
  onSelect,
  storeId,
  isSeller = false,
  title = "Chọn đơn hàng để gửi",
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders
  const fetchOrders = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const currentPage = reset ? 0 : page;

        let response;
        if (isSeller && storeId) {
          // Seller: lấy đơn hàng của shop
          response = await getStoreOrdersApi(storeId, {
            search: searchKeyword,
            status: statusFilter,
            page: currentPage,
            size: 10,
          });
        } else {
          // Buyer: lấy đơn hàng của mình (có thể filter theo shop)
          response = await getMyOrdersApi({
            search: searchKeyword,
            status: statusFilter,
            page: currentPage,
            size: 10,
          });
        }

        if (response?.result) {
          const result = response.result;
          const orderList = result.content || result || [];

          // Filter theo storeId nếu là buyer
          const filteredOrders =
            !isSeller && storeId
              ? orderList.filter((order) => order.storeId === storeId)
              : orderList;

          if (reset) {
            setOrders(filteredOrders);
            setPage(0);
          } else {
            setOrders((prev) => [...prev, ...filteredOrders]);
          }

          setHasMore(orderList.length === 10);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    },
    [storeId, searchKeyword, statusFilter, page, isSeller]
  );

  // Load orders when modal opens
  useEffect(() => {
    if (visible) {
      setOrders([]);
      setPage(0);
      setSelectedOrder(null);
      fetchOrders(true);
    }
  }, [visible]);

  // Search/filter with debounce
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      fetchOrders(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword, statusFilter]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchOrders(false);
  };

  const handleSelect = () => {
    if (selectedOrder) {
      onSelect(selectedOrder);
      onClose();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const getStatusInfo = (status) => {
    return ORDER_STATUS_MAP[status] || { text: status, color: "default" };
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <ShoppingCartOutlined /> {title}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="select"
          type="primary"
          onClick={handleSelect}
          disabled={!selectedOrder}
        >
          Gửi đơn hàng
        </Button>,
      ]}
      width={700}
      className={styles.pickerModal}
    >
      <div className={styles.filterRow}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo mã đơn hàng..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: 150 }}
        >
          <Select.Option value="">Tất cả</Select.Option>
          <Select.Option value="PENDING">Chờ xác nhận</Select.Option>
          <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
          <Select.Option value="SHIPPING">Đang giao</Select.Option>
          <Select.Option value="DELIVERED">Đã giao</Select.Option>
          <Select.Option value="CANCELLED">Đã hủy</Select.Option>
        </Select>
      </div>

      <div className={styles.listContainer}>
        {loading && orders.length === 0 ? (
          <div className={styles.loadingContainer}>
            <Spin tip="Đang tải..." />
          </div>
        ) : orders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy đơn hàng"
          />
        ) : (
          <List
            dataSource={orders}
            renderItem={(order) => {
              const statusInfo = getStatusInfo(order.status);
              const orderItems = order.items || order.orderItems || [];
              const totalItems = orderItems.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              );
              return (
                <List.Item
                  className={`${styles.listItem} ${
                    selectedOrder?.id === order.id ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className={styles.orderItem}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderCodeWrapper}>
                        <span className={styles.orderCode}>
                          <ShoppingCartOutlined />{" "}
                          {order.orderCode || order.id?.substring(0, 8)}
                        </span>
                        <span className={styles.orderItemCount}>
                          ({totalItems} sản phẩm)
                        </span>
                      </div>
                      <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                    </div>

                    {/* Thông tin người mua/shop */}
                    <div className={styles.orderPartyInfo}>
                      {isSeller ? (
                        <span className={styles.partyName}>
                          <UserOutlined />{" "}
                          {order.customerName ||
                            order.buyerName ||
                            "Khách hàng"}
                        </span>
                      ) : (
                        <span className={styles.partyName}>
                          <ShopOutlined />{" "}
                          {order.storeName || order.shopName || "Shop"}
                        </span>
                      )}
                    </div>

                    <div className={styles.orderProducts}>
                      {orderItems.slice(0, 3).map((item, index) => (
                        <div key={index} className={styles.orderProductItem}>
                          <Avatar
                            shape="square"
                            size={48}
                            src={
                              item.imageUrl ||
                              item.productImage ||
                              item.thumbnailImage
                            }
                            icon={<ShoppingCartOutlined />}
                            className={styles.orderProductAvatar}
                          />
                          <div className={styles.orderProductInfo}>
                            <span className={styles.orderProductName}>
                              {item.productName}
                            </span>
                            <div className={styles.orderProductDetails}>
                              <span className={styles.orderProductPrice}>
                                {formatPrice(item.price || item.unitPrice)}
                              </span>
                              <span className={styles.orderProductQty}>
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orderItems.length > 3 && (
                        <div className={styles.moreProducts}>
                          +{orderItems.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>

                    <div className={styles.orderFooter}>
                      <div className={styles.orderDateInfo}>
                        <span className={styles.orderDate}>
                          {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                        {order.paymentMethod && (
                          <Tag size="small">{order.paymentMethod}</Tag>
                        )}
                      </div>
                      <div className={styles.orderTotalWrapper}>
                        <span className={styles.orderTotalLabel}>Tổng:</span>
                        <span className={styles.orderTotal}>
                          {formatPrice(order.totalAmount || order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
            loadMore={
              hasMore && !loading ? (
                <div className={styles.loadMore}>
                  <Button onClick={handleLoadMore}>Xem thêm</Button>
                </div>
              ) : null
            }
          />
        )}
        {loading && orders.length > 0 && (
          <div className={styles.loadingMore}>
            <Spin size="small" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderPickerModal;
