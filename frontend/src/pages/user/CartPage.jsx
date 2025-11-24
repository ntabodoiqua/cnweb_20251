import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification, Modal } from "antd";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  DeleteOutlined,
  ShoppingOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  TagOutlined,
  GiftOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../components/context/auth.context";
import { useCart } from "../../contexts/CartContext";
import {
  getCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  mergeCartApi,
  getDetailedCartValidationApi,
} from "../../util/api";
import styles from "./CartPage.module.css";

/**
 * Cart Page Component
 * Hiển thị giỏ hàng với danh sách sản phẩm, tính toán tổng tiền và thanh toán
 * Hỗ trợ chọn sản phẩm để thanh toán và tích hợp ZaloPay
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { loadCartCount } = useCart();

  // State cho giỏ hàng từ API
  const [cartData, setCartData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Voucher state
  const [platformVoucher, setPlatformVoucher] = useState(null);
  const [shopVouchers, setShopVouchers] = useState({});
  const [voucherInput, setVoucherInput] = useState("");
  const [shopVoucherInputs, setShopVoucherInputs] = useState({});

  // Filter state
  const [selectedShopFilter, setSelectedShopFilter] = useState("all");

  // Load giỏ hàng khi component mount
  useEffect(() => {
    loadCart();
  }, []);

  // Load cart data from API
  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await getCartApi();

      if (response && response.code === 200) {
        setCartData(response.result);

        // Transform API data to component state
        const items = response.result.items.map((item) => {
          // API response không có available và stock, tạm thời set default
          const stock = item.stock || 999; // Default stock nếu API không trả về
          const available =
            item.available !== undefined ? item.available : true; // Default available = true

          return {
            id: `${item.productId}_${item.variantId || "default"}`,
            productId: item.productId,
            variantId: item.variantId,
            name: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            image: item.imageUrl,
            seller: item.storeName,
            storeId: item.storeId,
            storeLogo: item.storeLogo,
            subtotal: item.subtotal,
            inStock: available && item.quantity <= stock,
            stock: stock,
            selected: false,
          };
        });

        setCartItems(items);
      } else {
        throw new Error(response?.message || "Không thể tải giỏ hàng");
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      notification.error({
        message: "Lỗi tải giỏ hàng",
        description: "Không thể tải giỏ hàng. Vui lòng thử lại!",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Tính số lượng sản phẩm đã chọn (số items)
  const getSelectedItemsCount = () => {
    return cartItems.filter((item) => item.selected && item.inStock).length;
  };

  // Tính tổng quantity của các sản phẩm đã chọn
  const getSelectedTotalQuantity = () => {
    return cartItems
      .filter((item) => item.selected && item.inStock)
      .reduce((total, item) => total + item.quantity, 0);
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
  const handleIncreaseQuantity = async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    // Kiểm tra tồn kho
    if (item.quantity >= item.stock) {
      notification.warning({
        message: "Tồn kho không đủ",
        description: "Đã đạt số lượng tối đa trong kho!",
        placement: "topRight",
      });
      return;
    }

    try {
      const response = await updateCartItemApi(
        item.productId,
        item.variantId,
        item.quantity + 1
      );

      if (response && response.code === 200) {
        setCartItems((prevItems) =>
          prevItems.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
        loadCartCount(); // Update global cart count
        notification.success({
          message: "Thành công",
          description: "Đã tăng số lượng sản phẩm",
          placement: "topRight",
          duration: 2,
        });
      } else {
        throw new Error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      notification.error({
        message: "Lỗi cập nhật",
        description: "Không thể cập nhật giỏ hàng!",
        placement: "topRight",
      });
    }
  };

  // Xử lý giảm số lượng
  const handleDecreaseQuantity = async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item || item.quantity <= 1) return;

    try {
      const response = await updateCartItemApi(
        item.productId,
        item.variantId,
        item.quantity - 1
      );

      if (response && response.code === 200) {
        setCartItems((prevItems) =>
          prevItems.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
          )
        );
        loadCartCount(); // Update global cart count
        notification.success({
          message: "Thành công",
          description: "Đã giảm số lượng sản phẩm",
          placement: "topRight",
          duration: 2,
        });
      } else {
        throw new Error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      notification.error({
        message: "Lỗi cập nhật",
        description: "Không thể cập nhật giỏ hàng!",
        placement: "topRight",
      });
    }
  };

  // Xử lý xóa sản phẩm
  const handleRemoveItem = async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const response = await removeCartItemApi(item.productId, item.variantId);

      if (response && response.code === 200) {
        setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
        loadCartCount(); // Update global cart count
        notification.success({
          message: "Thành công",
          description: "Đã xóa sản phẩm khỏi giỏ hàng",
          placement: "topRight",
          duration: 2,
        });
      } else {
        throw new Error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      notification.error({
        message: "Lỗi xóa sản phẩm",
        description: "Không thể xóa sản phẩm!",
        placement: "topRight",
      });
    }
  };

  // Xử lý áp dụng voucher sàn
  const handleApplyPlatformVoucher = (code) => {
    const voucher = availablePlatformVouchers.find((v) => v.code === code);
    if (!voucher) {
      notification.error({
        message: "Voucher không hợp lệ",
        description: "Mã voucher không hợp lệ!",
        placement: "topRight",
      });
      return;
    }

    const subtotal = calculateSelectedTotal();
    if (subtotal < voucher.minOrder) {
      notification.warning({
        message: "Đơn hàng chưa đủ điều kiện",
        description: `Đơn hàng tối thiểu ${formatCurrency(
          voucher.minOrder
        )} để áp dụng mã này!`,
        placement: "topRight",
      });
      return;
    }

    setPlatformVoucher(voucher);
    setVoucherInput("");
    notification.success({
      message: "Thành công",
      description: "Áp dụng mã giảm giá sàn thành công!",
      placement: "topRight",
      duration: 2,
    });
  };

  // Xử lý xóa voucher sàn
  const handleRemovePlatformVoucher = () => {
    setPlatformVoucher(null);
    notification.info({
      message: "Thông báo",
      description: "Đã hủy mã giảm giá sàn",
      placement: "topRight",
      duration: 2,
    });
  };

  // Xử lý áp dụng voucher shop
  const handleApplyShopVoucher = (seller, code) => {
    const shopVoucherList = availableShopVouchers[seller];
    if (!shopVoucherList) {
      notification.error({
        message: "Không có voucher",
        description: "Shop không có voucher!",
        placement: "topRight",
      });
      return;
    }

    const voucher = shopVoucherList.find((v) => v.code === code);
    if (!voucher) {
      notification.error({
        message: "Voucher không hợp lệ",
        description: "Mã voucher shop không hợp lệ!",
        placement: "topRight",
      });
      return;
    }

    // Tính tổng tiền sản phẩm của shop đã chọn
    const shopTotal = cartItems
      .filter((item) => item.seller === seller && item.selected && item.inStock)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (shopTotal < voucher.minOrder) {
      notification.warning({
        message: "Đơn hàng chưa đủ điều kiện",
        description: `Đơn hàng shop tối thiểu ${formatCurrency(
          voucher.minOrder
        )} để áp dụng mã này!`,
        placement: "topRight",
      });
      return;
    }

    setShopVouchers((prev) => ({ ...prev, [seller]: voucher }));
    setShopVoucherInputs((prev) => ({ ...prev, [seller]: "" }));
    notification.success({
      message: "Thành công",
      description: `Áp dụng mã giảm giá ${seller} thành công!`,
      placement: "topRight",
      duration: 2,
    });
  };

  // Xử lý xóa voucher shop
  const handleRemoveShopVoucher = (seller) => {
    setShopVouchers((prev) => {
      const newVouchers = { ...prev };
      delete newVouchers[seller];
      return newVouchers;
    });
    notification.info({
      message: "Thông báo",
      description: `Đã hủy mã giảm giá ${seller}`,
      placement: "topRight",
      duration: 2,
    });
  };

  // Lấy danh sách shop có sản phẩm được chọn
  const getSelectedSellers = () => {
    const sellers = new Set();
    cartItems
      .filter((item) => item.selected && item.inStock)
      .forEach((item) => sellers.add(item.seller));
    return Array.from(sellers);
  };

  // Lấy danh sách tất cả các shop trong giỏ hàng
  const getAllShops = () => {
    const shops = new Map();
    cartItems.forEach((item) => {
      if (!shops.has(item.seller)) {
        shops.set(item.seller, {
          name: item.seller,
          logo: item.storeLogo,
          storeId: item.storeId,
          count: 0,
        });
      }
      const shop = shops.get(item.seller);
      shop.count += 1;
    });
    return Array.from(shops.values());
  };

  // Lọc sản phẩm theo shop được chọn
  const getFilteredItems = () => {
    if (selectedShopFilter === "all") {
      return cartItems;
    }
    return cartItems.filter((item) => item.seller === selectedShopFilter);
  };

  // Gom nhóm sản phẩm theo shop
  const groupItemsByShop = () => {
    const filtered = getFilteredItems();
    const grouped = new Map();

    filtered.forEach((item) => {
      if (!grouped.has(item.seller)) {
        grouped.set(item.seller, {
          shopName: item.seller,
          shopLogo: item.storeLogo,
          storeId: item.storeId,
          items: [],
        });
      }
      grouped.get(item.seller).items.push(item);
    });

    return Array.from(grouped.values());
  };

  // Xử lý chọn tất cả sản phẩm của một shop
  const handleSelectAllShopItems = (shopName) => {
    const shopItems = cartItems.filter(
      (item) => item.seller === shopName && item.inStock
    );
    const allSelected = shopItems.every((item) => item.selected);

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.seller === shopName && item.inStock
          ? { ...item, selected: !allSelected }
          : item
      )
    );
  };

  // Xử lý đặt hàng
  const handleCheckout = () => {
    // Kiểm tra đăng nhập
    if (!auth.isAuthenticated) {
      Modal.confirm({
        title: "Yêu cầu đăng nhập",
        content:
          "Bạn cần đăng nhập để đặt hàng. Bạn có muốn đăng nhập ngay không?",
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
      notification.warning({
        message: "Chưa chọn sản phẩm",
        description: "Vui lòng chọn ít nhất một sản phẩm để đặt hàng!",
        placement: "topRight",
      });
      return;
    }

    const hasOutOfStock = selectedItems.some((item) => !item.inStock);
    if (hasOutOfStock) {
      notification.warning({
        message: "Có sản phẩm hết hàng",
        description:
          "Vui lòng bỏ chọn các sản phẩm hết hàng trước khi đặt hàng!",
        placement: "topRight",
      });
      return;
    }

    // Chuyển sang trang checkout với thông tin đơn hàng
    navigate("/checkout", {
      state: {
        selectedItems: selectedItems,
        subtotal: calculateSelectedTotal(),
        shopDiscounts: calculateShopDiscounts(),
        platformDiscount: calculatePlatformDiscount(),
        finalTotal: calculateFinalTotal(),
      },
    });
  };

  // Hiển thị loading spinner
  if (loading) {
    return <LoadingSpinner tip="Đang tải giỏ hàng..." fullScreen={false} />;
  }

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

              {/* Shop Filter */}
              {getAllShops().length > 1 && (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: "500", color: "#333" }}>
                    <ShopOutlined /> Lọc theo cửa hàng:
                  </span>
                  <button
                    onClick={() => setSelectedShopFilter("all")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      border:
                        selectedShopFilter === "all"
                          ? "2px solid #1890ff"
                          : "1px solid #d9d9d9",
                      backgroundColor:
                        selectedShopFilter === "all" ? "#e6f7ff" : "white",
                      color: selectedShopFilter === "all" ? "#1890ff" : "#666",
                      cursor: "pointer",
                      fontWeight:
                        selectedShopFilter === "all" ? "600" : "normal",
                      transition: "all 0.3s",
                    }}
                  >
                    Tất cả ({cartItems.length})
                  </button>
                  {getAllShops().map((shop) => (
                    <button
                      key={shop.storeId}
                      onClick={() => setSelectedShopFilter(shop.name)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        border:
                          selectedShopFilter === shop.name
                            ? "2px solid #1890ff"
                            : "1px solid #d9d9d9",
                        backgroundColor:
                          selectedShopFilter === shop.name
                            ? "#e6f7ff"
                            : "white",
                        color:
                          selectedShopFilter === shop.name ? "#1890ff" : "#666",
                        cursor: "pointer",
                        fontWeight:
                          selectedShopFilter === shop.name ? "600" : "normal",
                        transition: "all 0.3s",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {shop.logo && (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {shop.name} ({shop.count})
                    </button>
                  ))}
                </div>
              )}

              {groupItemsByShop().map((shop) => (
                <div key={shop.storeId} style={{ marginBottom: "24px" }}>
                  {/* Shop Header */}
                  <div
                    style={{
                      backgroundColor: "#fafafa",
                      padding: "12px 16px",
                      borderRadius: "8px 8px 0 0",
                      border: "1px solid #f0f0f0",
                      borderBottom: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <button
                        className={styles.checkboxButton}
                        onClick={() => handleSelectAllShopItems(shop.shopName)}
                        style={{ marginRight: "8px" }}
                      >
                        {shop.items
                          .filter((item) => item.inStock)
                          .every((item) => item.selected) &&
                        shop.items.some((item) => item.inStock) ? (
                          <CheckSquareOutlined />
                        ) : (
                          <BorderOutlined />
                        )}
                      </button>
                      {shop.shopLogo && (
                        <img
                          src={shop.shopLogo}
                          alt={shop.shopName}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #fff",
                          }}
                        />
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "15px",
                            color: "#262626",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <ShoppingOutlined style={{ color: "#1890ff" }} />
                          {shop.shopName}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#8c8c8c",
                            marginTop: "2px",
                          }}
                        >
                          {shop.items.length} sản phẩm
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shop Items */}
                  <div
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: "0 0 8px 8px",
                      overflow: "hidden",
                    }}
                  >
                    {shop.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`${styles.cartItem} ${
                          !item.inStock ? styles.outOfStock : ""
                        } ${item.selected ? styles.selected : ""}`}
                        style={{
                          borderTop: index > 0 ? "1px solid #f0f0f0" : "none",
                          borderRadius: "0",
                        }}
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
                            <div className={styles.outOfStockBadge}>
                              Hết hàng
                            </div>
                          )}
                        </div>

                        <div className={styles.itemInfo}>
                          <h3 className={styles.itemName}>
                            {item.name}
                            {item.variantName && (
                              <span
                                style={{
                                  fontSize: "0.85em",
                                  color: "#666",
                                  fontWeight: "normal",
                                  marginLeft: "8px",
                                }}
                              >
                                ({item.variantName})
                              </span>
                            )}
                          </h3>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginTop: "4px",
                            }}
                          >
                            {item.storeLogo ? (
                              <img
                                src={item.storeLogo}
                                alt={item.seller}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : null}
                            <p
                              className={styles.itemSeller}
                              style={{ margin: 0 }}
                            >
                              Bán bởi: {item.seller}
                            </p>
                          </div>
                          {item.sku && (
                            <p
                              style={{
                                fontSize: "0.8em",
                                color: "#999",
                                marginTop: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              SKU: {item.sku}
                            </p>
                          )}
                          <div className={styles.itemPrice}>
                            {item.originalPrice &&
                            item.originalPrice > item.price ? (
                              <>
                                <span
                                  style={{
                                    color: "#ff4d4f",
                                    fontWeight: "bold",
                                    fontSize: "1.1em",
                                  }}
                                >
                                  {formatCurrency(item.price)}
                                </span>
                                <span
                                  style={{
                                    textDecoration: "line-through",
                                    color: "#999",
                                    fontSize: "0.9em",
                                    marginLeft: "8px",
                                  }}
                                >
                                  {formatCurrency(item.originalPrice)}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: "#ff4d4f",
                                    color: "white",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.75em",
                                    marginLeft: "8px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  -
                                  {Math.round(
                                    (1 - item.price / item.originalPrice) * 100
                                  )}
                                  %
                                </span>
                              </>
                            ) : (
                              <span>{formatCurrency(item.price)}</span>
                            )}
                          </div>
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
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>

              {getSelectedItemsCount() > 0 && (
                <div className={styles.selectedInfo}>
                  <p>
                    Đã chọn <strong>{getSelectedTotalQuantity()}</strong> sản
                    phẩm ({getSelectedItemsCount()} loại)
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
                    ? getSelectedTotalQuantity()
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
              >
                <ShoppingOutlined />
                <span>
                  Đặt hàng
                  {getSelectedItemsCount() > 0 &&
                    ` (${getSelectedTotalQuantity()} sản phẩm)`}
                </span>
              </button>

              <button
                className={styles.continueShoppingButton}
                onClick={() => navigate("/")}
              >
                <ShoppingOutlined />
                <span>Tiếp tục mua sắm</span>
              </button>

              <div className={styles.securePayment}>
                <p>🔒 Thông tin đơn hàng được bảo mật</p>
                {!auth.isAuthenticated && (
                  <p className={styles.loginHint}>
                    💡 Vui lòng đăng nhập để đặt hàng
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
