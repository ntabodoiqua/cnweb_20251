import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/auth.context";
import { getTokenInfo, isTokenExpired } from "../util/jwt";

/**
 * Component bảo vệ các route công khai (login, register, etc.)
 * Chuyển hướng user đã đăng nhập về trang chủ
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con (login/register page)
 * @param {string} props.redirectTo - Đường dẫn redirect khi đã đăng nhập (default: "/")
 */
const PublicRoute = ({ children, redirectTo = "/" }) => {
  const { auth } = useContext(AuthContext);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Kiểm tra token trực tiếp từ localStorage
    const token = localStorage.getItem("access_token");

    if (token && !isTokenExpired(token)) {
      const tokenInfo = getTokenInfo(token);
      if (tokenInfo) {
        setShouldRedirect(true);
      }
    }

    setIsCheckingAuth(false);
  }, []);

  // Hiển thị trang ngay lập tức, không cần loading
  if (isCheckingAuth) {
    return <>{children}</>;
  }

  // Nếu user đã đăng nhập (kiểm tra cả context và localStorage)
  if (shouldRedirect || auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu chưa đăng nhập, cho phép truy cập trang
  return <>{children}</>;
};

export default PublicRoute;
