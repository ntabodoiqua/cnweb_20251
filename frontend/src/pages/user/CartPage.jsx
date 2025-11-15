import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal, Spin } from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  TagOutlined,
  GiftOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../components/context/auth.context";
import { createZaloPayOrderApi } from "../../util/api";
import styles from "./CartPage.module.css";

/**
 * Cart Page Component
 * Hiển thị giỏ hàng với danh sách sản phẩm, tính toán tổng tiền và thanh toán
 * Hỗ trợ chọn sản phẩm để thanh toán và tích hợp ZaloPay
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  // Mock data cho giỏ hàng - Sẽ được thay thế bằng state management sau
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Laptop Dell XPS 13",
      price: 2500000,
      quantity: 1,
      image: "https://via.placeholder.com/100",
      seller: "Dell Official Store",
      inStock: true,
      selected: false,
    },
    {
      id: 2,
      name: "iPhone 15 Pro Max 256GB",
      price: 3200000,
      quantity: 2,
      image: "https://via.placeholder.com/100",
      seller: "Apple Store",
      inStock: true,
      selected: false,
    },
    {
      id: 3,
      name: "Samsung Galaxy S24 Ultra",
      price: 2800000,
      quantity: 1,
      image: "https://via.placeholder.com/100",
      seller: "Samsung Official",
      inStock: false,
      selected: false,
    },
  ]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Voucher state
  const [platformVoucher, setPlatformVoucher] = useState(null);
  const [shopVouchers, setShopVouchers] = useState({});
  const [voucherInput, setVoucherInput] = useState("");
  const [shopVoucherInputs, setShopVoucherInputs] = useState({});

  // Mock data voucher sàn
  const availablePlatformVouchers = [
    {
      code: "HUSTBUY100K",
      discount: 100000,
      type: "fixed",
      minOrder: 500000,
      description: "Giảm 100K cho đơn từ 500K",
      expiry: "31/12/2025",
    },
    {
      code: "SALE20",
      discount: 20,
      type: "percent",
      minOrder: 300000,
      maxDiscount: 200000,
      description: "Giảm 20% tối đa 200K cho đơn từ 300K",
      expiry: "31/12/2025",
    },
  ];

  // Mock data voucher shop
  const availableShopVouchers = {
    "Dell Official Store": [
      {
        code: "DELL50K",
        discount: 50000,
        type: "fixed",
        minOrder: 2000000,
        description: "Giảm 50K cho đơn từ 2tr",
        expiry: "31/12/2025",
      },
    ],
    "Apple Store": [
      {
        code: "APPLE10",
        discount: 10,
        type: "percent",
        minOrder: 1000000,
        maxDiscount: 100000,
        description: "Giảm 10% tối đa 100K",
        expiry: "31/12/2025",
      },
    ],
  };

  // Format currency VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Tính tổng tiền cho các sản phẩm đã chọn
  const calculateSelectedTotal = () => {
    return cartItems
      .filter((item) => item.selected && item.inStock)
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Tính tổng giảm giá từ voucher shop
  const calculateShopDiscounts = () => {
    let totalDiscount = 0;
    const selectedItems = getSelectedItems();

    // Nhóm sản phẩm theo shop
    const itemsBySeller = selectedItems.reduce((acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    }, {});

    // Tính giảm giá cho từng shop
    Object.keys(itemsBySeller).forEach((seller) => {
      const voucher = shopVouchers[seller];
      if (voucher) {
        const shopTotal = itemsBySeller[seller].reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        if (shopTotal >= voucher.minOrder) {
          if (voucher.type === "fixed") {
            totalDiscount += voucher.discount;
          } else {
            const percentDiscount = (shopTotal * voucher.discount) / 100;
            totalDiscount += Math.min(
              percentDiscount,
              voucher.maxDiscount || percentDiscount
            );
          }
        }
      }
    });

    return totalDiscount;
  };

  // Tính giảm giá từ voucher sàn
  const calculatePlatformDiscount = () => {
    if (!platformVoucher) return 0;

    const subtotal = calculateSelectedTotal();
    if (subtotal < platformVoucher.minOrder) return 0;

    if (platformVoucher.type === "fixed") {
      return platformVoucher.discount;
    } else {
      const percentDiscount = (subtotal * platformVoucher.discount) / 100;
      return Math.min(
        percentDiscount,
        platformVoucher.maxDiscount || percentDiscount
      );
    }
  };

  // Tính tổng tiền cuối cùng sau giảm giá
  const calculateFinalTotal = () => {
    const subtotal = calculateSelectedTotal();
    const shopDiscount = calculateShopDiscounts();
    const platformDiscount = calculatePlatformDiscount();
    return Math.max(0, subtotal - shopDiscount - platformDiscount);
  };

  // Tính tổng số lượng sản phẩm
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính số lượng sản phẩm đã chọn
  const getSelectedItemsCount = () => {
    return cartItems.filter((item) => item.selected && item.inStock).length;
  };

  // Lấy danh sách sản phẩm đã chọn
  const getSelectedItems = () => {
    return cartItems.filter((item) => item.selected && item.inStock);
  };

  // Xử lý chọn/bỏ chọn sản phẩm
  const handleToggleSelect = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Xử lý chọn tất cả
  const handleSelectAll = () => {
    const allInStockSelected = cartItems
      .filter((item) => item.inStock)
      .every((item) => item.selected);

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.inStock ? { ...item, selected: !allInStockSelected } : item
      )
    );
  };

  // Xử lý tăng số lượng
  const handleIncreaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    message.success("Đã tăng số lượng sản phẩm");
  };

  // Xử lý giảm số lượng
  const handleDecreaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
    message.success("Đã giảm số lượng sản phẩm");
  };

  // Xử lý xóa sản phẩm
  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    message.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  // Xử lý áp dụng voucher sàn
  const handleApplyPlatformVoucher = (code) => {
    const voucher = availablePlatformVouchers.find((v) => v.code === code);
    if (!voucher) {
      message.error("Mã voucher không hợp lệ!");
      return;
    }

    const subtotal = calculateSelectedTotal();
    if (subtotal < voucher.minOrder) {
      message.warning(
        `Đơn hàng tối thiểu ${formatCurrency(
          voucher.minOrder
        )} để áp dụng mã này!`
      );
      return;
    }

    setPlatformVoucher(voucher);
    setVoucherInput("");
    message.success("Áp dụng mã giảm giá sàn thành công!");
  };

  // Xử lý xóa voucher sàn
  const handleRemovePlatformVoucher = () => {
    setPlatformVoucher(null);
    message.info("Đã hủy mã giảm giá sàn");
  };

  // Xử lý áp dụng voucher shop
  const handleApplyShopVoucher = (seller, code) => {
    const shopVoucherList = availableShopVouchers[seller];
    if (!shopVoucherList) {
      message.error("Shop không có voucher!");
      return;
    }

    const voucher = shopVoucherList.find((v) => v.code === code);
    if (!voucher) {
      message.error("Mã voucher shop không hợp lệ!");
      return;
    }

    // Tính tổng tiền sản phẩm của shop đã chọn
    const shopTotal = cartItems
      .filter((item) => item.seller === seller && item.selected && item.inStock)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (shopTotal < voucher.minOrder) {
      message.warning(
        `Đơn hàng shop tối thiểu ${formatCurrency(
          voucher.minOrder
        )} để áp dụng mã này!`
      );
      return;
    }

    setShopVouchers((prev) => ({ ...prev, [seller]: voucher }));
    setShopVoucherInputs((prev) => ({ ...prev, [seller]: "" }));
    message.success(`Áp dụng mã giảm giá ${seller} thành công!`);
  };

  // Xử lý xóa voucher shop
  const handleRemoveShopVoucher = (seller) => {
    setShopVouchers((prev) => {
      const newVouchers = { ...prev };
      delete newVouchers[seller];
      return newVouchers;
    });
    message.info(`Đã hủy mã giảm giá ${seller}`);
  };

  // Lấy danh sách shop có sản phẩm được chọn
  const getSelectedSellers = () => {
    const sellers = new Set();
    cartItems
      .filter((item) => item.selected && item.inStock)
      .forEach((item) => sellers.add(item.seller));
    return Array.from(sellers);
  };

  // Xử lý thanh toán
  const handleCheckout = async () => {
    // Kiểm tra đăng nhập
    if (!auth.isAuthenticated) {
      Modal.confirm({
        title: "Yêu cầu đăng nhập",
        content:
          "Bạn cần đăng nhập để thực hiện thanh toán. Bạn có muốn đăng nhập ngay không?",
        okText: "Đăng nhập",
        cancelText: "Hủy",
        onOk: () => {
          // Lưu URL hiện tại để redirect lại sau khi đăng nhập
          sessionStorage.setItem("redirectAfterLogin", "/cart");
          navigate("/login");
        },
      });
      return;
    }

    const selectedItems = getSelectedItems();

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    const hasOutOfStock = selectedItems.some((item) => !item.inStock);
    if (hasOutOfStock) {
      message.warning(
        "Vui lòng bỏ chọn các sản phẩm hết hàng trước khi thanh toán!"
      );
      return;
    }

    // Xác nhận thanh toán
    Modal.confirm({
      title: "Xác nhận thanh toán",
      content: (
        <div>
          <p>
            Bạn đang thanh toán <strong>{selectedItems.length}</strong> sản phẩm
            với tổng giá trị:{" "}
            <strong style={{ color: "#ee4d2d" }}>
              {formatCurrency(calculateSelectedTotal())}
            </strong>
          </p>
          <p>Phương thức thanh toán: ZaloPay</p>
        </div>
      ),
      okText: "Thanh toán ngay",
      cancelText: "Hủy",
      onOk: async () => {
        await processZaloPayPayment(selectedItems);
      },
    });
  };

  // Xử lý thanh toán qua ZaloPay
  const processZaloPayPayment = async (selectedItems) => {
    setIsProcessingPayment(true);
    const hideLoading = message.loading("Đang xử lý thanh toán...", 0);

    try {
      // Chuẩn bị dữ liệu thanh toán
      const paymentData = {
        appUser: auth.user?.username || "user",
        amount: calculateSelectedTotal(),
        description: `Thanh toán đơn hàng từ ${
          auth.user?.username || "khách hàng"
        }`,
        items: selectedItems.map((item) => ({
          itemid: `P${item.id.toString().padStart(3, "0")}`,
          itemname: item.name,
          itemprice: item.price,
          itemquantity: item.quantity,
        })),
        bankCode: "",
        embedData: {
          redirecturl: `${window.location.origin}/payment-result`,
          merchantinfo: "HUSTBuy - Nền tảng thương mại điện tử",
        },
        title: `Đơn hàng #${Date.now()}`,
        phone: auth.user?.phone || "0987654321",
        email: auth.user?.email || "customer@hustbuy.com",
      };

      // Gọi API ZaloPay
      const response = await createZaloPayOrderApi(paymentData);

      hideLoading();

      console.log("ZaloPay API Full Response:", response);

      // Axios interceptor đã return response.data, nên response chính là data
      // Response format: { appTransId, orderUrl, zpTransToken, qrCode, status, message, errorCode }
      const responseData = response;

      if (responseData?.errorCode === 1 && responseData?.orderUrl) {
        message.success("Đang chuyển đến cổng thanh toán ZaloPay...", 1.5);

        // Lưu thông tin đơn hàng để xử lý sau khi thanh toán
        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            items: selectedItems,
            total: calculateSelectedTotal(),
            timestamp: Date.now(),
            appTransId: responseData.appTransId,
            zpTransToken: responseData.zpTransToken,
          })
        );

        // Chuyển hướng đến trang thanh toán ZaloPay
        window.open(responseData.orderUrl, "_self");
      } else {
        console.error("Payment failed:", responseData);
        throw new Error(
          responseData?.message || "Không thể tạo đơn hàng thanh toán"
        );
      }
    } catch (error) {
      hideLoading();
      console.error("Payment error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại!"
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            <ArrowLeftOutlined />
            <span>Quay lại</span>
          </button>
          <div className={styles.headerContent}>
            <ShoppingCartOutlined className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>Giỏ hàng của bạn</h1>
              <p className={styles.pageSubtitle}>
                {cartItems.length > 0
                  ? `${getTotalItems()} sản phẩm trong giỏ hàng`
                  : "Giỏ hàng trống"}
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className={styles.emptyCart}>
            <ShoppingCartOutlined className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>Giỏ hàng trống</h2>
            <p className={styles.emptyText}>
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <button
              className={styles.shopNowButton}
              onClick={() => navigate("/")}
            >
              <ShoppingOutlined />
              <span>Mua sắm ngay</span>
            </button>
          </div>
        ) : (
          // Cart with Items
          <div className={styles.cartContent}>
            {/* Cart Items List */}
            <div className={styles.cartItems}>
              <div className={styles.cartHeader}>
                <div className={styles.selectAllContainer}>
                  <button
                    className={styles.selectAllButton}
                    onClick={handleSelectAll}
                  >
                    {cartItems
                      .filter((item) => item.inStock)
                      .every((item) => item.selected) ? (
                      <CheckSquareOutlined />
                    ) : (
                      <BorderOutlined />
                    )}
                    <span>
                      Chọn tất cả (
                      {cartItems.filter((item) => item.inStock).length})
                    </span>
                  </button>
                </div>
                <h2 className={styles.sectionTitle}>Danh sách sản phẩm</h2>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.cartItem} ${
                    !item.inStock ? styles.outOfStock : ""
                  } ${item.selected ? styles.selected : ""}`}
                >
                  <div className={styles.itemCheckbox}>
                    <button
                      className={styles.checkboxButton}
                      onClick={() => handleToggleSelect(item.id)}
                      disabled={!item.inStock}
                    >
                      {item.selected ? (
                        <CheckSquareOutlined />
                      ) : (
                        <BorderOutlined />
                      )}
                    </button>
                  </div>

                  <div className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                    {!item.inStock && (
                      <div className={styles.outOfStockBadge}>Hết hàng</div>
                    )}
                  </div>

                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemSeller}>Bán bởi: {item.seller}</p>
                    <p className={styles.itemPrice}>
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityButton}
                        onClick={() => handleDecreaseQuantity(item.id)}
                        disabled={item.quantity <= 1 || !item.inStock}
                      >
                        <MinusOutlined />
                      </button>
                      <span className={styles.quantityDisplay}>
                        {item.quantity}
                      </span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => handleIncreaseQuantity(item.id)}
                        disabled={!item.inStock}
                      >
                        <PlusOutlined />
                      </button>
                    </div>

                    <p className={styles.itemTotal}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>

              {getSelectedItemsCount() > 0 && (
                <div className={styles.selectedInfo}>
                  <p>
                    Đã chọn <strong>{getSelectedItemsCount()}</strong> sản phẩm
                  </p>
                </div>
              )}

              {/* Voucher sàn */}
              <div className={styles.voucherSection}>
                <div className={styles.voucherHeader}>
                  <GiftOutlined className={styles.voucherIcon} />
                  <span className={styles.voucherLabel}>Mã giảm giá sàn</span>
                </div>

                {!platformVoucher ? (
                  <div className={styles.voucherInputWrapper}>
                    <input
                      type="text"
                      className={styles.voucherInput}
                      placeholder="Nhập mã voucher sàn"
                      value={voucherInput}
                      onChange={(e) =>
                        setVoucherInput(e.target.value.toUpperCase())
                      }
                    />
                    <button
                      className={styles.applyButton}
                      onClick={() => handleApplyPlatformVoucher(voucherInput)}
                      disabled={!voucherInput.trim()}
                    >
                      Áp dụng
                    </button>
                  </div>
                ) : (
                  <div className={styles.appliedVoucher}>
                    <div className={styles.voucherInfo}>
                      <TagOutlined className={styles.voucherTag} />
                      <div>
                        <div className={styles.voucherCode}>
                          {platformVoucher.code}
                        </div>
                        <div className={styles.voucherDesc}>
                          {platformVoucher.description}
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.removeVoucherButton}
                      onClick={handleRemovePlatformVoucher}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                )}

                {/* Danh sách voucher sàn có sẵn */}
                {!platformVoucher && (
                  <div className={styles.availableVouchers}>
                    {availablePlatformVouchers.map((voucher) => (
                      <div
                        key={voucher.code}
                        className={styles.voucherCard}
                        onClick={() => handleApplyPlatformVoucher(voucher.code)}
                      >
                        <div className={styles.voucherCardIcon}>
                          <GiftOutlined />
                        </div>
                        <div className={styles.voucherCardContent}>
                          <div className={styles.voucherCardCode}>
                            {voucher.code}
                          </div>
                          <div className={styles.voucherCardDesc}>
                            {voucher.description}
                          </div>
                        </div>
                        <CheckCircleOutlined
                          className={styles.voucherCardCheck}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voucher shop */}
              {getSelectedSellers().length > 0 && (
                <div className={styles.voucherSection}>
                  <div className={styles.voucherHeader}>
                    <TagOutlined className={styles.voucherIcon} />
                    <span className={styles.voucherLabel}>
                      Mã giảm giá shop
                    </span>
                  </div>

                  {getSelectedSellers().map((seller) => {
                    const appliedVoucher = shopVouchers[seller];
                    const shopVoucherList = availableShopVouchers[seller] || [];

                    return (
                      <div key={seller} className={styles.shopVoucherItem}>
                        <div className={styles.shopName}>{seller}</div>

                        {!appliedVoucher ? (
                          <>
                            <div className={styles.voucherInputWrapper}>
                              <input
                                type="text"
                                className={styles.voucherInput}
                                placeholder="Nhập mã voucher shop"
                                value={shopVoucherInputs[seller] || ""}
                                onChange={(e) =>
                                  setShopVoucherInputs((prev) => ({
                                    ...prev,
                                    [seller]: e.target.value.toUpperCase(),
                                  }))
                                }
                              />
                              <button
                                className={styles.applyButton}
                                onClick={() =>
                                  handleApplyShopVoucher(
                                    seller,
                                    shopVoucherInputs[seller]
                                  )
                                }
                                disabled={!shopVoucherInputs[seller]?.trim()}
                              >
                                Áp dụng
                              </button>
                            </div>

                            {/* Danh sách voucher shop có sẵn */}
                            {shopVoucherList.length > 0 && (
                              <div className={styles.availableVouchers}>
                                {shopVoucherList.map((voucher) => (
                                  <div
                                    key={voucher.code}
                                    className={styles.voucherCard}
                                    onClick={() =>
                                      handleApplyShopVoucher(
                                        seller,
                                        voucher.code
                                      )
                                    }
                                  >
                                    <div className={styles.voucherCardIcon}>
                                      <TagOutlined />
                                    </div>
                                    <div className={styles.voucherCardContent}>
                                      <div className={styles.voucherCardCode}>
                                        {voucher.code}
                                      </div>
                                      <div className={styles.voucherCardDesc}>
                                        {voucher.description}
                                      </div>
                                    </div>
                                    <CheckCircleOutlined
                                      className={styles.voucherCardCheck}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={styles.appliedVoucher}>
                            <div className={styles.voucherInfo}>
                              <TagOutlined className={styles.voucherTag} />
                              <div>
                                <div className={styles.voucherCode}>
                                  {appliedVoucher.code}
                                </div>
                                <div className={styles.voucherDesc}>
                                  {appliedVoucher.description}
                                </div>
                              </div>
                            </div>
                            <button
                              className={styles.removeVoucherButton}
                              onClick={() => handleRemoveShopVoucher(seller)}
                            >
                              <CloseOutlined />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className={styles.summaryItem}>
                <span>
                  Tạm tính (
                  {getSelectedItemsCount() > 0
                    ? getSelectedItemsCount()
                    : getTotalItems()}{" "}
                  sản phẩm)
                </span>
                <span>
                  {formatCurrency(
                    getSelectedItemsCount() > 0
                      ? calculateSelectedTotal()
                      : calculateTotal()
                  )}
                </span>
              </div>

              {/* Hiển thị giảm giá từ voucher shop */}
              {calculateShopDiscounts() > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.discountLabel}>
                    <TagOutlined /> Giảm giá shop
                  </span>
                  <span className={styles.discountAmount}>
                    -{formatCurrency(calculateShopDiscounts())}
                  </span>
                </div>
              )}

              {/* Hiển thị giảm giá từ voucher sàn */}
              {calculatePlatformDiscount() > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.discountLabel}>
                    <GiftOutlined /> Giảm giá sàn
                  </span>
                  <span className={styles.discountAmount}>
                    -{formatCurrency(calculatePlatformDiscount())}
                  </span>
                </div>
              )}

              <div className={styles.summaryItem}>
                <span>
                  Tạm tính (
                  {getSelectedItemsCount() > 0
                    ? getSelectedItemsCount()
                    : getTotalItems()}{" "}
                  sản phẩm)
                </span>
                <span>
                  {formatCurrency(
                    getSelectedItemsCount() > 0
                      ? calculateSelectedTotal()
                      : calculateTotal()
                  )}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span>Phí vận chuyển</span>
                <span className={styles.freeShipping}>Miễn phí</span>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotal}>
                <span>Tổng cộng</span>
                <span className={styles.totalAmount}>
                  {formatCurrency(
                    getSelectedItemsCount() > 0
                      ? calculateFinalTotal()
                      : calculateTotal()
                  )}
                </span>
              </div>

              {(calculateShopDiscounts() > 0 ||
                calculatePlatformDiscount() > 0) && (
                <div className={styles.savingsBadge}>
                  🎉 Bạn tiết kiệm được{" "}
                  {formatCurrency(
                    calculateShopDiscounts() + calculatePlatformDiscount()
                  )}
                </div>
              )}

              <button
                className={styles.checkoutButton}
                onClick={handleCheckout}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Spin size="small" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CreditCardOutlined />
                    <span>
                      Thanh toán qua ZaloPay
                      {getSelectedItemsCount() > 0 &&
                        ` (${getSelectedItemsCount()} sản phẩm)`}
                    </span>
                  </>
                )}
              </button>

              <button
                className={styles.continueShoppingButton}
                onClick={() => navigate("/")}
              >
                <ShoppingOutlined />
                <span>Tiếp tục mua sắm</span>
              </button>

              <div className={styles.securePayment}>
                <p>🔒 Thanh toán an toàn qua ZaloPay</p>
                {!auth.isAuthenticated && (
                  <p className={styles.loginHint}>
                    💡 Vui lòng đăng nhập để thanh toán
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
