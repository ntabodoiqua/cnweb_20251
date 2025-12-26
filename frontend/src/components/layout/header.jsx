import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  UserOutlined,
  HomeOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuOutlined,
  SettingOutlined,
  ProfileOutlined,
  SearchOutlined,
  LaptopOutlined,
  MobileOutlined,
  SkinOutlined,
  HomeOutlined as HomeIconOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  DownOutlined,
  AppstoreOutlined,
  BellOutlined,
  TagOutlined,
  RightOutlined,
  MessageOutlined,
  ShopOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import {
  Dropdown,
  Space,
  Drawer,
  Menu,
  Input,
  notification,
  AutoComplete,
  Spin,
} from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { useCart } from "../../contexts/CartContext";
import {
  getSearchSuggestApi,
  getPublicPlatformCategoriesApi,
  getBrandsApi,
  globalSuggestApi,
} from "../../util/api";
import { useNotification } from "../../contexts/NotificationContext";
import { useChat } from "../../contexts/ChatContext";
import { getRoleName, ROLES, getHighestRole } from "../../constants/roles";
import NotificationDropdown from "../notification/NotificationDropdown";
import styles from "./header.module.css";
import logo from "../../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useContext(AuthContext);
  const { cartCount, resetCart } = useCart();
  const { connectWebSocket, disconnectWebSocket, fetchUnreadCount } =
    useNotification();
  const { unreadTotal: chatUnreadCount } = useChat();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // State cho số lượng thông báo
  const [options, setOptions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Categories and Brands from API
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await getPublicPlatformCategoriesApi();
        if (categoriesResponse?.code === 1000) {
          const apiCategories = categoriesResponse.result || [];
          setCategories(apiCategories.filter((cat) => cat.active));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }

      try {
        // Fetch brands
        const brandsResponse = await getBrandsApi(0, 10);
        if (brandsResponse?.code === 1000) {
          const apiBrands = brandsResponse.result?.content || [];
          setBrands(apiBrands.filter((brand) => brand.isActive));
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchHeaderData();
  }, []);

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      setOptions([]);
      return;
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        // Sử dụng Global Suggest API để lấy cả sản phẩm và cửa hàng
        const response = await globalSuggestApi(value, 5, 3);
        if (response?.result) {
          const { products = [], stores = [] } = response.result;

          const newOptions = [];

          // Thêm sản phẩm vào suggestions
          if (products.length > 0) {
            newOptions.push({
              label: (
                <div
                  style={{
                    fontWeight: 600,
                    color: "#8c8c8c",
                    fontSize: "12px",
                    padding: "4px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <SearchOutlined style={{ marginRight: 8 }} />
                  Sản phẩm
                </div>
              ),
              options: products.map((item) => ({
                value: item,
                label: (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <SearchOutlined style={{ color: "#1890ff" }} />
                    <span>{item}</span>
                  </div>
                ),
                type: "product",
              })),
            });
          }

          // Thêm cửa hàng vào suggestions
          if (stores.length > 0) {
            newOptions.push({
              label: (
                <div
                  style={{
                    fontWeight: 600,
                    color: "#8c8c8c",
                    fontSize: "12px",
                    padding: "4px 0",
                    borderBottom: "1px solid #f0f0f0",
                    marginTop: products.length > 0 ? 8 : 0,
                  }}
                >
                  <ShopOutlined style={{ marginRight: 8 }} />
                  Cửa hàng
                </div>
              ),
              options: stores.map((item) => ({
                value: `store:${item}`,
                label: (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ShopOutlined style={{ color: "#52c41a" }} />
                    <span>{item}</span>
                  </div>
                ),
                type: "store",
                storeName: item,
              })),
            });
          }

          setOptions(newOptions);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        // Fallback to product-only search
        try {
          const fallbackResponse = await getSearchSuggestApi(value);
          if (fallbackResponse && fallbackResponse.data?.result) {
            const newOptions = fallbackResponse.data.result.map((item) => ({
              value: item,
              label: item,
            }));
            setOptions(newOptions);
          }
        } catch (fallbackError) {
          console.error("Fallback search also failed:", fallbackError);
        }
      }
    }, 150);

    setSearchTimeout(timeout);
  };

  // Kết nối WebSocket khi user đăng nhập
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.username) {
      // Sử dụng username làm userId cho WebSocket
      connectWebSocket(auth.user.username);
      fetchUnreadCount();
    } else {
      disconnectWebSocket();
    }
  }, [
    auth.isAuthenticated,
    auth.user?.username,
    connectWebSocket,
    disconnectWebSocket,
    fetchUnreadCount,
  ]);

  const handleLogout = async () => {
    // Ngăn chặn click nhiều lần
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Gọi API logout
        const { logoutApi } = await import("../../util/api");
        await logoutApi(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn thực hiện logout ở frontend ngay cả khi API thất bại
    } finally {
      // Xóa token và reset auth state
      localStorage.removeItem("access_token");
      setAuth({
        isAuthenticated: false,
        user: {
          username: "",
          email: "",
          name: "",
          role: "",
          firstName: "",
          lastName: "",
          avatarUrl: "",
        },
      });

      // Reset giỏ hàng về 0
      resetCart();

      // Hiển thị thông báo cảm ơn
      notification.success({
        message: "Đăng xuất thành công",
        description:
          "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Hẹn gặp lại! 👋",
        placement: "topRight",
        duration: 2,
      });

      // Reset trạng thái và chuyển về trang chủ
      setIsLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  // Xử lý khi chọn một suggestion
  const handleSelectSuggestion = (value, option) => {
    // Kiểm tra xem có phải cửa hàng không
    if (value.startsWith("store:") || option?.type === "store") {
      // Chuyển đến trang tìm kiếm cửa hàng
      const storeName = option?.storeName || value.replace("store:", "");
      navigate(`/search?q=${encodeURIComponent(storeName)}&type=store`);
      setSearchValue(storeName);
    } else {
      // Tìm kiếm sản phẩm bình thường
      setSearchValue(value);
      handleSearch(value);
    }
  };

  // Lấy tên hiển thị của người dùng (firstName hoặc username)
  const getDisplayName = () => {
    if (auth.user?.firstName) {
      const fullName = auth.user.lastName
        ? `${auth.user.firstName} ${auth.user.lastName}`
        : auth.user.firstName;
      // Cắt ngắn nếu tên quá dài (> 20 ký tự)
      return fullName.length > 20
        ? `${fullName.substring(0, 17)}...`
        : fullName;
    }
    // Fallback về username nếu không có firstName
    const username = auth.user?.username || "User";
    return username.length > 20 ? `${username.substring(0, 17)}...` : username;
  };

  // Lấy initials cho avatar placeholder
  const getAvatarInitials = () => {
    if (auth.user?.firstName) {
      const firstInitial = auth.user.firstName.charAt(0).toUpperCase();
      const lastInitial = auth.user.lastName
        ? auth.user.lastName.charAt(0).toUpperCase()
        : "";
      return firstInitial + lastInitial;
    }
    return auth.user?.username?.charAt(0).toUpperCase() || "U";
  };

  // Lấy role cao nhất để hiển thị
  const getDisplayRole = () => {
    if (auth.user?.role) {
      const highestRole = getHighestRole(auth.user.role);
      return getRoleName(highestRole);
    }
    return "";
  };

  // Helper function to get category icon
  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("điện tử") || lowerName.includes("thiết bị điện"))
      return <LaptopOutlined />;
    if (lowerName.includes("điện thoại") || lowerName.includes("mobile"))
      return <MobileOutlined />;
    if (lowerName.includes("thời trang")) return <SkinOutlined />;
    if (lowerName.includes("nhà") || lowerName.includes("gia dụng"))
      return <HomeIconOutlined />;
    if (lowerName.includes("sách") || lowerName.includes("văn phòng"))
      return <BookOutlined />;
    if (lowerName.includes("gaming") || lowerName.includes("game"))
      return <LaptopOutlined />;
    if (lowerName.includes("giày") || lowerName.includes("dép"))
      return <SkinOutlined />;
    if (lowerName.includes("phụ kiện")) return <MobileOutlined />;
    return <AppstoreOutlined />;
  };

  // Build dynamic category menu items from API - memoized to prevent re-renders
  const categoryMenuItems = useMemo(() => {
    if (loadingCategories) {
      return [{ key: "loading", label: <Spin size="small" />, disabled: true }];
    }

    const items = categories.slice(0, 8).map((category) => {
      const hasSubCategories =
        category.subCategories && category.subCategories.length > 0;

      if (hasSubCategories) {
        return {
          key: `cat-${category.id}`,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {getCategoryIcon(category.name)}
              <span>{category.name}</span>
            </div>
          ),
          children: [
            {
              key: `cat-all-${category.id}`,
              label: (
                <Link
                  to={`/category/${category.id}`}
                  style={{ fontWeight: 600, display: "block" }}
                >
                  Xem tất cả {category.name}
                </Link>
              ),
            },
            { type: "divider" },
            ...category.subCategories.map((sub) => ({
              key: `subcat-${sub.id}`,
              label: <Link to={`/category/${sub.id}`}>{sub.name}</Link>,
            })),
          ],
        };
      }

      return {
        key: `cat-${category.id}`,
        label: (
          <Link
            to={`/category/${category.id}`}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            {getCategoryIcon(category.name)}
            <span>{category.name}</span>
          </Link>
        ),
      };
    });

    return [
      ...items,
      { type: "divider", key: "cat-main-divider" },
      {
        key: "all-categories",
        label: (
          <Link
            to="/categories"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: 600,
            }}
          >
            <ShoppingCartOutlined />
            <span>Xem tất cả danh mục</span>
          </Link>
        ),
      },
    ];
  }, [categories, loadingCategories]);

  // Build dynamic brand menu items from API - memoized to prevent re-renders
  const brandMenuItems = useMemo(() => {
    if (loadingBrands) {
      return [{ key: "loading", label: <Spin size="small" />, disabled: true }];
    }

    return [
      ...brands.slice(0, 8).map((brand) => ({
        key: `brand-${brand.id}`,
        label: (
          <Link
            to={`/brand/${brand.id}`}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                style={{
                  width: 20,
                  height: 20,
                  objectFit: "contain",
                  borderRadius: 4,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <TagOutlined />
            )}
            <span>{brand.name}</span>
          </Link>
        ),
      })),
      { type: "divider", key: "brand-main-divider" },
      {
        key: "all-brands",
        label: (
          <Link
            to="/brands"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: 600,
            }}
          >
            <TagOutlined />
            <span>Xem tất cả thương hiệu</span>
          </Link>
        ),
      },
    ];
  }, [brands, loadingBrands]);

  // Dropdown menu cho user đã đăng nhập
  const userMenuItems = [
    {
      key: "profile",
      label: (
        <Link
          to="/profile"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <ProfileOutlined />
          <span>Hồ sơ của tôi</span>
        </Link>
      ),
    },
    {
      key: "following-stores",
      label: (
        <Link
          to="/following-stores"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <HeartOutlined />
          <span>Cửa hàng đang theo dõi</span>
        </Link>
      ),
    },
    // Thêm menu Admin nếu user là ADMIN
    ...(getHighestRole(auth.user.role) === ROLES.ADMIN
      ? [
          {
            key: "admin",
            label: (
              <Link
                to="/admin"
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <SettingOutlined />
                <span>Quản trị Admin</span>
              </Link>
            ),
          },
        ]
      : []),
    // Thêm menu Seller nếu user là SELLER
    ...(getHighestRole(auth.user.role) === ROLES.SELLER
      ? [
          {
            key: "seller",
            label: (
              <Link
                to="/seller"
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <ShoppingOutlined />
                <span>Kênh Người Bán</span>
              </Link>
            ),
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#ff4d4f",
          }}
        >
          <LogoutOutlined />
          <span>Đăng xuất</span>
        </div>
      ),
      onClick: handleLogout,
      disabled: isLoggingOut,
    },
  ];

  // Mobile menu items
  const mobileMenuItems = [
    ...(auth.isAuthenticated
      ? [
          {
            key: "profile",
            icon: <ProfileOutlined />,
            label: <Link to="/profile">Hồ sơ</Link>,
          },
          {
            key: "following-stores",
            icon: <HeartOutlined />,
            label: <Link to="/following-stores">Cửa hàng đang theo dõi</Link>,
          },
          // Thêm link Admin cho ADMIN
          ...(getHighestRole(auth.user.role) === ROLES.ADMIN
            ? [
                {
                  key: "admin",
                  icon: <SettingOutlined />,
                  label: <Link to="/admin">Quản trị Admin</Link>,
                },
              ]
            : []),
          // Thêm link Seller cho SELLER
          ...(getHighestRole(auth.user.role) === ROLES.SELLER
            ? [
                {
                  key: "seller",
                  icon: <ShoppingOutlined />,
                  label: <Link to="/seller">Kênh Người Bán</Link>,
                },
              ]
            : []),
          {
            type: "divider",
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: <span>Đăng xuất</span>,
            onClick: handleLogout,
            danger: true,
            disabled: isLoggingOut,
          },
        ]
      : [
          {
            key: "login",
            icon: <LoginOutlined />,
            label: <Link to="/login">Đăng nhập</Link>,
          },
        ]),
  ];

  return (
    <header className={styles.customHeader}>
      {/* Top Header - Logo, Search, Actions */}
      <div className={styles.headerTop}>
        <div className={styles.headerContainer}>
          {/* Logo */}
          <div className={styles.headerLogo} onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className={styles.headerLogoImage} />
            <h1 className={styles.headerLogoText}>HUSTBuy</h1>
          </div>

          {/* Search Bar */}
          <div className={styles.headerSearch}>
            <AutoComplete
              style={{ width: "100%" }}
              options={options}
              onSelect={handleSelectSuggestion}
              onSearch={handleSearchChange}
              value={searchValue}
              popupClassName={styles.searchDropdown}
              popupMatchSelectWidth={true}
            >
              <Input.Search
                placeholder="Tìm kiếm sản phẩm, cửa hàng..."
                size="large"
                onSearch={handleSearch}
                enterButton={
                  <button className={styles.searchButton}>
                    <SearchOutlined />
                  </button>
                }
                className={styles.searchInput}
              />
            </AutoComplete>
          </div>

          {/* Actions */}
          <div className={styles.headerActions}>
            {/* Chat Icon with Badge */}
            {auth.isAuthenticated && (
              <div
                className={styles.chatIcon}
                onClick={() =>
                  navigate(
                    getHighestRole(auth.user?.role) === ROLES.SELLER
                      ? "/seller/chat"
                      : "/chat"
                  )
                }
              >
                <MessageOutlined />
                {chatUnreadCount > 0 && (
                  <span className={styles.chatBadge}>
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </span>
                )}
              </div>
            )}

            {/* Cart Icon with Badge */}
            <div className={styles.cartIcon} onClick={() => navigate("/cart")}>
              <ShoppingCartOutlined />
              <span className={styles.cartBadge}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </div>

            {/* Notification Dropdown */}
            {auth.isAuthenticated && <NotificationDropdown />}

            {/* Mobile Menu Trigger */}
            <MenuOutlined
              className={styles.headerMobileTrigger}
              onClick={() => setMobileMenuVisible(true)}
            />

            {/* Desktop Actions */}
            {auth.isAuthenticated ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
                overlayClassName={styles.headerDropdownMenu}
              >
                <div className={styles.headerUserInfo}>
                  <div className={styles.headerUserAvatar}>
                    {auth.user?.avatarUrl ? (
                      <img
                        src={auth.user.avatarUrl}
                        alt="Avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      getAvatarInitials()
                    )}
                  </div>
                  {auth.user?.role && (
                    <span
                      className={`${styles.headerUserRole} ${
                        getHighestRole(auth.user.role) === ROLES.ADMIN
                          ? styles.admin
                          : getHighestRole(auth.user.role) === ROLES.SELLER
                          ? styles.seller
                          : styles.user
                      }`}
                    >
                      {getDisplayRole()}
                    </span>
                  )}
                </div>
              </Dropdown>
            ) : (
              <button
                className={styles.headerLoginBtn}
                onClick={() => navigate("/login")}
              >
                <LoginOutlined />
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={styles.headerBottom}>
        <div className={styles.headerContainer}>
          {/* Mobile Search Bar - Shows on mobile only */}
          <div className={styles.mobileSearchWrapper}>
            <AutoComplete
              style={{ width: "100%" }}
              options={options}
              onSelect={handleSelectSuggestion}
              onSearch={handleSearchChange}
              value={searchValue}
              popupClassName={styles.searchDropdown}
              popupMatchSelectWidth={true}
            >
              <Input.Search
                placeholder="Tìm kiếm sản phẩm, cửa hàng..."
                size="middle"
                onSearch={handleSearch}
                enterButton={
                  <button className={styles.searchButton}>
                    <SearchOutlined />
                  </button>
                }
                className={styles.searchInput}
              />
            </AutoComplete>
          </div>

          <nav className={styles.headerNav}>
            <Link
              to="/"
              className={`${styles.navLink} ${
                isActive("/") ? styles.active : ""
              }`}
            >
              <HomeOutlined />
              <span>Trang chủ</span>
            </Link>

            <Dropdown
              menu={{ items: categoryMenuItems }}
              trigger={["hover"]}
              placement="bottomLeft"
              overlayClassName={styles.categoryDropdownMenu}
            >
              <div
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/category") ? styles.active : ""
                }`}
              >
                <AppstoreOutlined />
                <span>Danh mục</span>
                <DownOutlined style={{ fontSize: "10px", marginLeft: "4px" }} />
              </div>
            </Dropdown>

            <Dropdown
              menu={{ items: brandMenuItems }}
              trigger={["hover"]}
              placement="bottomLeft"
              overlayClassName={styles.categoryDropdownMenu}
            >
              <div
                className={`${styles.navLink} ${
                  location.pathname.startsWith("/brand") ? styles.active : ""
                }`}
              >
                <TagOutlined />
                <span>Thương hiệu</span>
                <DownOutlined style={{ fontSize: "10px", marginLeft: "4px" }} />
              </div>
            </Dropdown>

            {auth.isAuthenticated && (
              <>
                <Link
                  to="/following-stores"
                  className={`${styles.navLink} ${
                    isActive("/following-stores") ? styles.active : ""
                  }`}
                >
                  <HeartOutlined />
                  <span>Đang theo dõi</span>
                </Link>
                <Link
                  to="/profile"
                  className={`${styles.navLink} ${
                    isActive("/profile") ? styles.active : ""
                  }`}
                >
                  <ProfileOutlined />
                  <span>Hồ sơ</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <Menu
          mode="inline"
          items={mobileMenuItems}
          onClick={() => setMobileMenuVisible(false)}
        />
      </Drawer>
    </header>
  );
};

export default Header;
