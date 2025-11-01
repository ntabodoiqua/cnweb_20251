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
} from "@ant-design/icons";
import { Dropdown, Space, Drawer, Menu } from "antd";
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

  const handleLogout = () => {
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
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

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
          onClick={handleLogout}
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
    },
  ];

  // Mobile menu items
  const mobileMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
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
            label: <span onClick={handleLogout}>Đăng xuất</span>,
            danger: true,
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
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="header-logo-image" />
          <h1 className="header-logo-text">HUSTBuy</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          <Link
            to="/"
            className={`header-nav-item ${isActive("/") ? "active" : ""}`}
          >
            <HomeOutlined />
            Trang chủ
          </Link>
          {auth.isAuthenticated && (
            <>
              <Link
                to="/user"
                className={`header-nav-item ${
                  isActive("/user") ? "active" : ""
                }`}
              >
                <UserOutlined />
                Người dùng
              </Link>
              <Link
                to="/profile"
                className={`header-nav-item ${
                  isActive("/profile") ? "active" : ""
                }`}
              >
                <ProfileOutlined />
                Hồ sơ
              </Link>
            </>
          )}
        </nav>

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
