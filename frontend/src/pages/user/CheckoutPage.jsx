import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  notification,
  message,
  Modal,
  Spin,
  Radio,
  Input,
  Select,
  Form,
  Button,
} from "antd";
import {
  ShoppingCartOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  TagOutlined,
  HomeOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../components/context/auth.context";
import {
  createZaloPayOrderApi,
  getAddressesApi,
  getProvincesApi,
  getWardsByProvinceApi,
  createOrderApi,
  initiateOrderPaymentApi,
} from "../../util/api";
import { PROTECTED_ROUTES } from "../../constants/routes";
import styles from "./CheckoutPage.module.css";

const { Option } = Select;
const { TextArea } = Input;

/**
 * Checkout Page Component
 * Trang điền thông tin địa chỉ giao hàng và đặt hàng
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useContext(AuthContext);
  const [form] = Form.useForm();

  // Lấy dữ liệu từ CartPage
  const {
    selectedItems,
    subtotal,
    shopDiscounts,
    platformDiscount,
    finalTotal,
  } = location.state || {};

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("zalopay");

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Location data state
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    // Redirect nếu không có sản phẩm
    if (!selectedItems || selectedItems.length === 0) {
      notification.warning({
        message: "Chưa chọn sản phẩm",
        description: "Vui lòng chọn sản phẩm từ giỏ hàng!",
        placement: "topRight",
      });
      navigate(PROTECTED_ROUTES.USER_CART);
      return;
    }

    // Fetch saved addresses and provinces
    fetchSavedAddresses();
    fetchProvinces();
  }, [selectedItems, navigate]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await getAddressesApi(0, 20);

      if (res && res.code === 1000) {
        const addresses = res.result.content;
        setSavedAddresses(addresses);

        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddress = addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          populateFormWithAddress(defaultAddress);
        } else if (addresses.length > 0) {
          // Nếu không có địa chỉ mặc định, chọn địa chỉ đầu tiên
          setSelectedAddressId(addresses[0].id);
          populateFormWithAddress(addresses[0]);
        } else {
          // Không có địa chỉ đã lưu, dùng địa chỉ mới
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setUseNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const res = await getProvincesApi();

      if (res && res.code === 1000) {
        setProvinces(res.result);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách tỉnh/thành phố",
        placement: "topRight",
      });
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchWards = async (provinceId) => {
    try {
      setLoadingWards(true);
      const res = await getWardsByProvinceApi(provinceId);

      if (res && res.code === 1000) {
        setWards(res.result);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách phường/xã",
        placement: "topRight",
      });
    } finally {
      setLoadingWards(false);
    }
  };

  const populateFormWithAddress = (address) => {
    form.setFieldsValue({
      fullName: address.receiverName,
      phoneNumber: address.receiverPhone,
      provinceId: address.ward?.province?.id || null,
      wardId: address.ward?.id || null,
      detailAddress: address.street,
    });

    // Load wards cho province
    if (address.ward?.province?.id) {
      setSelectedProvinceId(address.ward.province.id);
      fetchWards(address.ward.province.id);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      populateFormWithAddress(address);
      setUseNewAddress(false);
    }
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    form.resetFields();
    setWards([]);
    setSelectedProvinceId(null);
  };

  const handleProvinceChange = (provinceId) => {
    setSelectedProvinceId(provinceId);
    form.setFieldValue("wardId", null);
    setWards([]);
    if (provinceId) {
      fetchWards(provinceId);
    }
  };

  // Format currency VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xử lý đặt hàng và thanh toán
  const handlePlaceOrder = async (values) => {
    setIsProcessingPayment(true);
    const hideLoading = message.loading("Đang xử lý đơn hàng...", 0);

    try {
      // Tìm province và ward names
      const selectedProvince = provinces.find(
        (p) => p.id === values.provinceId
      );
      const selectedWard = wards.find((w) => w.id === values.wardId);

      // Chuẩn bị shipping address theo backend format
      const shippingAddressStr = `${values.detailAddress}, ${
        selectedWard?.nameWithType || ""
      }, ${selectedProvince?.fullName || ""}`;

      // Chuẩn bị dữ liệu đơn hàng theo OrderCreationRequest
      const orderData = {
        items: selectedItems.map((item) => ({
          variantId: item.variantId || item.id?.toString(),
          quantity: item.quantity,
        })),
        receiverName: values.fullName,
        receiverPhone: values.phoneNumber,
        receiverEmail: auth.user?.email || "",
        shippingAddress: shippingAddressStr,
        shippingProvince: selectedProvince?.fullName || "",
        shippingWard: selectedWard?.nameWithType || "",
        paymentMethod: paymentMethod === "zalopay" ? "ZALO_PAY" : "COD",
        couponCode: "", // Có thể thêm coupon sau
        note: values.note || "",
      };

      console.log("Creating order with data:", orderData);

      // Gọi API tạo đơn hàng
      const orderResponse = await createOrderApi(orderData);

      console.log("Order creation response:", orderResponse);

      if (orderResponse?.code === 201 && orderResponse?.result) {
        const orders = orderResponse.result;
        const orderIds = orders.map((order) => order.id);

        // Nếu chọn thanh toán ZaloPay
        if (paymentMethod === "zalopay") {
          console.log("Initiating payment for orders:", orderIds);

          // Gọi API khởi tạo thanh toán
          const paymentResponse = await initiateOrderPaymentApi(orderIds);

          hideLoading();

          console.log("Payment initiation response:", paymentResponse);

          if (
            paymentResponse?.code === 200 &&
            paymentResponse?.result?.paymentUrl
          ) {
            message.success(
              "Đơn hàng đã được tạo! Đang chuyển đến cổng thanh toán...",
              1.5
            );

            // Lưu thông tin đơn hàng
            sessionStorage.setItem(
              "pendingOrders",
              JSON.stringify({
                orders: orders,
                orderIds: orderIds,
                appTransId: paymentResponse.result.appTransId,
                timestamp: Date.now(),
              })
            );

            // Chuyển hướng đến trang thanh toán ZaloPay
            window.open(paymentResponse.result.paymentUrl, "_self");
          } else {
            throw new Error(
              paymentResponse?.message ||
                "Không thể khởi tạo thanh toán. Vui lòng thử lại!"
            );
          }
        } else {
          // Thanh toán khi nhận hàng (COD)
          hideLoading();

          const orderCount = orders.length;
          const totalAmount = orders.reduce(
            (sum, order) => sum + parseFloat(order.totalAmount || 0),
            0
          );

          Modal.success({
            title: "Đặt hàng thành công!",
            content: (
              <div>
                <p>
                  {orderCount > 1
                    ? `${orderCount} đơn hàng của bạn đã được tạo thành công.`
                    : "Đơn hàng của bạn đã được ghi nhận."}
                </p>
                <p>Phương thức thanh toán: Thanh toán khi nhận hàng (COD)</p>
                <p>
                  Tổng tiền: <strong>{formatCurrency(totalAmount)}</strong>
                </p>
                {orders.map((order) => (
                  <p key={order.id} style={{ fontSize: "12px", color: "#666" }}>
                    Mã đơn: {order.orderNumber} - {order.storeName}
                  </p>
                ))}
              </div>
            ),
            okText: "Xem đơn hàng",
            onOk: () => {
              navigate(PROTECTED_ROUTES.USER_ORDERS);
            },
          });
        }
      } else {
        throw new Error(
          orderResponse?.message || "Không thể tạo đơn hàng. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      hideLoading();
      console.error("Order processing error:", error);
      notification.error({
        message: "Lỗi xử lý đơn hàng",
        description:
          error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!",
        placement: "topRight",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <button
            className={styles.backButton}
            onClick={() => navigate(PROTECTED_ROUTES.USER_CART)}
          >
            <ArrowLeftOutlined />
            <span>Quay lại giỏ hàng</span>
          </button>
          <div className={styles.headerContent}>
            <ShoppingCartOutlined className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>Đặt hàng</h1>
              <p className={styles.pageSubtitle}>
                Vui lòng điền thông tin giao hàng
              </p>
            </div>
          </div>
        </div>

        <div className={styles.checkoutContent}>
          {/* Shipping Form */}
          <div className={styles.shippingSection}>
            <h2 className={styles.sectionTitle}>
              <EnvironmentOutlined /> Thông tin giao hàng
            </h2>

            {/* Saved Addresses Section */}
            {!loadingAddresses && savedAddresses.length > 0 && (
              <div className={styles.savedAddressesSection}>
                <h3 className={styles.subSectionTitle}>
                  <HomeOutlined /> Chọn địa chỉ giao hàng
                </h3>

                <div className={styles.addressList}>
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`${styles.addressCard} ${
                        selectedAddressId === address.id && !useNewAddress
                          ? styles.addressCardSelected
                          : ""
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>
                          <CheckCircleOutlined /> Mặc định
                        </span>
                      )}
                      <div className={styles.addressCardContent}>
                        <p className={styles.addressName}>
                          <strong>{address.receiverName}</strong> |{" "}
                          {address.receiverPhone}
                        </p>
                        <p className={styles.addressDetail}>{address.street}</p>
                        <p className={styles.addressLocation}>
                          {address.ward?.nameWithType}
                          {address.ward?.province?.fullName &&
                            `, ${address.ward.province.fullName}`}
                        </p>
                      </div>
                      {selectedAddressId === address.id && !useNewAddress && (
                        <CheckCircleOutlined className={styles.selectedIcon} />
                      )}
                    </div>
                  ))}

                  <div
                    className={`${styles.addressCard} ${
                      styles.newAddressCard
                    } ${useNewAddress ? styles.addressCardSelected : ""}`}
                    onClick={handleUseNewAddress}
                  >
                    <div className={styles.addressCardContent}>
                      <p className={styles.addressName}>
                        <strong>➕ Sử dụng địa chỉ mới</strong>
                      </p>
                      <p className={styles.addressDetail}>
                        Nhập địa chỉ giao hàng mới
                      </p>
                    </div>
                    {useNewAddress && (
                      <CheckCircleOutlined className={styles.selectedIcon} />
                    )}
                  </div>
                </div>
              </div>
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handlePlaceOrder}
              initialValues={{
                fullName: auth.user?.fullName || "",
                phoneNumber: auth.user?.phone || "",
              }}
            >
              <Form.Item
                name="fullName"
                label="Họ và tên người nhận"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên!" },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="provinceId"
                label={
                  <>
                    <GlobalOutlined /> Tỉnh/Thành phố
                  </>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn Tỉnh/Thành phố"
                  size="large"
                  loading={loadingProvinces}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={handleProvinceChange}
                >
                  {provinces.map((province) => (
                    <Option key={province.id} value={province.id}>
                      {province.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="wardId"
                label={
                  <>
                    <HomeOutlined /> Phường/Xã
                  </>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn Phường/Xã!" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn Phường/Xã"
                  size="large"
                  loading={loadingWards}
                  disabled={!selectedProvinceId}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {wards.map((ward) => (
                    <Option key={ward.id} value={ward.id}>
                      {ward.nameWithType}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="detailAddress"
                label="Địa chỉ chi tiết"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập địa chỉ chi tiết!",
                  },
                  { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
                ]}
              >
                <Input placeholder="Số nhà, tên đường..." size="large" />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú đơn hàng (không bắt buộc)">
                <TextArea
                  rows={4}
                  placeholder="Nhập ghi chú cho đơn hàng (ví dụ: giao hàng giờ hành chính...)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {/* Payment Method */}
              <div className={styles.paymentMethodSection}>
                <h3 className={styles.subSectionTitle}>
                  <CreditCardOutlined /> Phương thức thanh toán
                </h3>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={styles.paymentMethods}
                >
                  <Radio value="zalopay" className={styles.paymentOption}>
                    <div className={styles.paymentOptionContent}>
                      <div className={styles.paymentIcon}>💳</div>
                      <div>
                        <div className={styles.paymentName}>ZaloPay</div>
                        <div className={styles.paymentDesc}>
                          Thanh toán qua ví điện tử ZaloPay
                        </div>
                      </div>
                    </div>
                  </Radio>
                  <Radio value="cod" className={styles.paymentOption}>
                    <div className={styles.paymentOptionContent}>
                      <div className={styles.paymentIcon}>💵</div>
                      <div>
                        <div className={styles.paymentName}>
                          Thanh toán khi nhận hàng (COD)
                        </div>
                        <div className={styles.paymentDesc}>
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </div>
                      </div>
                    </div>
                  </Radio>
                </Radio.Group>
              </div>

              <Form.Item>
                <button
                  type="submit"
                  className={styles.placeOrderButton}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Spin size="small" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined />
                      <span>Đặt hàng</span>
                    </>
                  )}
                </button>
              </Form.Item>
            </Form>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <h2 className={styles.summaryTitle}>Thông tin đơn hàng</h2>

            {/* Product List */}
            <div className={styles.productList}>
              <h3 className={styles.productListTitle}>
                Sản phẩm ({selectedItems.length})
              </h3>
              {selectedItems.map((item) => (
                <div key={item.id} className={styles.productItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.productImage}
                  />
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{item.name}</p>
                    <p className={styles.productQuantity}>x{item.quantity}</p>
                  </div>
                  <p className={styles.productPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className={styles.summaryDivider}></div>

            {/* Price Summary */}
            <div className={styles.priceSummary}>
              <div className={styles.summaryItem}>
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {shopDiscounts > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.discountLabel}>
                    <TagOutlined /> Giảm giá shop
                  </span>
                  <span className={styles.discountAmount}>
                    -{formatCurrency(shopDiscounts)}
                  </span>
                </div>
              )}

              {platformDiscount > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.discountLabel}>
                    <GiftOutlined /> Giảm giá sàn
                  </span>
                  <span className={styles.discountAmount}>
                    -{formatCurrency(platformDiscount)}
                  </span>
                </div>
              )}

              <div className={styles.summaryItem}>
                <span>Phí vận chuyển</span>
                <span className={styles.freeShipping}>Miễn phí</span>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotal}>
                <span>Tổng cộng</span>
                <span className={styles.totalAmount}>
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              {(shopDiscounts > 0 || platformDiscount > 0) && (
                <div className={styles.savingsBadge}>
                  🎉 Tiết kiệm{" "}
                  {formatCurrency(shopDiscounts + platformDiscount)}
                </div>
              )}
            </div>

            <div className={styles.secureNote}>
              🔒 Thông tin của bạn được bảo mật
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
