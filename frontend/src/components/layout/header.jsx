import React, { useContext, useState } from "react";
import {
  UserOutlined,
  HomeOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
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
} from "@ant-design/icons";
import { Dropdown, Space, Drawer, Menu, Input, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { useCart } from "../../contexts/CartContext";
import { getRoleName, ROLES, getHighestRole } from "../../constants/roles";
import styles from "./header.module.css";
import logo from "../../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useContext(AuthContext);
  const { cartCount, resetCart } = useCart();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // State cho số lượng thông báo

  const handleLogout = async () => {
    // Ngăn chặn click nhiều lần
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    // Hiển thị thông báo đang đăng xuất
    const hideLoading = message.loading("Đang đăng xuất...", 0);

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
      // Đóng loading
      hideLoading();

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
      message.success(
        "Đăng xuất thành công! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Hẹn gặp lại! 👋",
        2
      );

      // Chuyển về trang chủ ngay lập tức
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

  // Categories dropdown menu
  const categoryMenuItems = [
    {
      key: "electronics",
      label: (
        <Link
          to="/category/electronics"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <LaptopOutlined />
          <span>Điện tử</span>
        </Link>
      ),
    },
    {
      key: "mobile",
      label: (
        <Link
          to="/category/mobile"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <MobileOutlined />
          <span>Điện thoại & Phụ kiện</span>
        </Link>
      ),
    },
    {
      key: "fashion",
      label: (
        <Link
          to="/category/fashion"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <SkinOutlined />
          <span>Thời trang</span>
        </Link>
      ),
    },
    {
      key: "home",
      label: (
        <Link
          to="/category/home"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <HomeIconOutlined />
          <span>Nhà cửa & Đời sống</span>
        </Link>
      ),
    },
    {
      key: "books",
      label: (
        <Link
          to="/category/books"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <BookOutlined />
          <span>Sách & Văn phòng phẩm</span>
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "all",
      label: (
        <Link
          to="/category/all"
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
      key: "settings",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SettingOutlined />
          <span>Cài đặt</span>
        </div>
      ),
    },
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
          {
            key: "register",
            icon: <UserAddOutlined />,
            label: <Link to="/register">Đăng ký</Link>,
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
            <Input.Search
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              enterButton={
                <button className={styles.searchButton}>
                  <SearchOutlined />
                  Tìm kiếm
                </button>
              }
              className={styles.searchInput}
            />
          </div>

          {/* Actions */}
          <div className={styles.headerActions}>
            {/* Cart Icon with Badge */}
            <div className={styles.cartIcon} onClick={() => navigate("/cart")}>
              <ShoppingCartOutlined />
              <span className={styles.cartBadge}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </div>

            {/* Notification Icon with Badge */}
            {auth.isAuthenticated && (
              <div
                className={styles.notificationIcon}
                onClick={() =>
                  message.info("Tính năng thông báo đang phát triển")
                }
              >
                <BellOutlined />
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </div>
            )}

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
                  <span className={styles.headerUserName}>
                    {getDisplayName()}
                  </span>
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
              <Space size="small">
                <button
                  className={styles.headerLoginBtn}
                  onClick={() => navigate("/login")}
                >
                  <LoginOutlined />
                  Đăng nhập
                </button>
                <button
                  className={styles.headerRegisterBtn}
                  onClick={() => navigate("/register")}
                >
                  <UserAddOutlined />
                  Đăng ký
                </button>
              </Space>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={styles.headerBottom}>
        <div className={styles.headerContainer}>
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
                <span>Danh mục sản phẩm</span>
                <DownOutlined style={{ fontSize: "10px", marginLeft: "4px" }} />
              </div>
            </Dropdown>

            {auth.isAuthenticated && (
              <>
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
