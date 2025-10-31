import React, { useContext, useState } from "react";
import {
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu, Tag } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { getRoleName } from "../../constants/roles";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [current, setCurrent] = useState("home");

  console.log(">>> check auth: ", auth);

  // Hiển thị tên và role của user
  const getUserLabel = () => {
    if (auth.isAuthenticated) {
      const username = auth?.user?.username || "";
      const role = auth?.user?.role || "";
      const roleName = getRoleName(role);

      return (
        <span>
          <UserOutlined /> {username}{" "}
          {role && (
            <Tag
              color={role === "ROLE_ADMIN" ? "red" : "blue"}
              style={{ marginLeft: 8 }}
            >
              {roleName}
            </Tag>
          )}
        </span>
      );
    }
    return "Tài khoản";
  };

  const items = [
    {
      label: <Link to={"/"}>Home Page</Link>,
      key: "home",
      icon: <HomeOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to={"/user"}>Users</Link>,
            key: "user",
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to={"/profile"}>Hồ sơ</Link>,
            key: "profile",
            icon: <UserOutlined />,
          },
        ]
      : []),

    {
      label: getUserLabel(),
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: (
                  <span
                    onClick={() => {
                      localStorage.removeItem("access_token");
                      setCurrent("home");
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
                    }}
                  >
                    Đăng xuất
                  </span>
                ),
                key: "logout",
              },
            ]
          : [
              {
                label: <Link to={"/login"}>Đăng nhập</Link>,
                key: "login",
              },
            ]),
      ],
    },
  ];

  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};
export default Header;
