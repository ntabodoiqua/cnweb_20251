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
} from "@ant-design/icons";
import { Dropdown, Space, Drawer, Menu, Input, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { getRoleName, ROLES } from "../../constants/roles";
import "./header.css";
import logo from "../../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useContext(AuthContext);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        },
      });

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
    ...(auth.user.role === ROLES.ADMIN
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
            key: "user",
            icon: <UserOutlined />,
            label: <Link to="/user">Người dùng</Link>,
          },
          {
            key: "profile",
            icon: <ProfileOutlined />,
            label: <Link to="/profile">Hồ sơ</Link>,
          },
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
    <header className="custom-header">
      {/* Top Header - Logo, Search, Actions */}
      <div className="header-top">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="header-logo-image" />
            <h1 className="header-logo-text">HUSTBuy</h1>
          </div>

          {/* Search Bar */}
          <div className="header-search">
            <Input.Search
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              enterButton={
                <button className="search-button">
                  <SearchOutlined />
                  Tìm kiếm
                </button>
              }
              className="search-input"
            />
          </div>

          {/* Actions */}
          <div className="header-actions">
            {/* Mobile Menu Trigger */}
            <MenuOutlined
              className="header-mobile-trigger"
              onClick={() => setMobileMenuVisible(true)}
            />

            {/* Desktop Actions */}
            {auth.isAuthenticated ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
                overlayClassName="header-dropdown-menu"
              >
                <div className="header-user-info">
                  <div className="header-user-avatar">
                    {auth.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="header-user-name">
                    {auth.user?.username || "User"}
                  </span>
                  {auth.user?.role && (
                    <span
                      className={`header-user-role ${
                        auth.user.role === ROLES.ADMIN ? "admin" : "user"
                      }`}
                    >
                      {getRoleName(auth.user.role)}
                    </span>
                  )}
                </div>
              </Dropdown>
            ) : (
              <Space size="small">
                <button
                  className="header-login-btn"
                  onClick={() => navigate("/login")}
                >
                  <LoginOutlined />
                  Đăng nhập
                </button>
                <button
                  className="header-register-btn"
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
      <div className="header-bottom">
        <div className="header-container">
          <nav className="header-nav">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              <HomeOutlined />
              <span>Trang chủ</span>
            </Link>

            <Dropdown
              menu={{ items: categoryMenuItems }}
              trigger={["hover"]}
              placement="bottomLeft"
              overlayClassName="category-dropdown-menu"
            >
              <div
                className={`nav-link ${
                  location.pathname.startsWith("/category") ? "active" : ""
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
                  to="/user"
                  className={`nav-link ${isActive("/user") ? "active" : ""}`}
                >
                  <UserOutlined />
                  <span>Người dùng</span>
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${isActive("/profile") ? "active" : ""}`}
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
