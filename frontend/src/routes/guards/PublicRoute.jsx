import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../components/context/auth.context";
import { PUBLIC_ROUTES } from "../../constants/routes";

/**
 * Component bảo vệ các route công khai (login, register, etc.)
 * Chuyển hướng user đã đăng nhập về trang chủ
 *
 * Logic đơn giản:
 * - Nếu user đã đăng nhập (auth.isAuthenticated === true) → Redirect về home
 * - Nếu chưa đăng nhập → Cho phép truy cập
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con (login/register page)
 * @param {string} props.redirectTo - Đường dẫn redirect khi đã đăng nhập (default: "/")
 */
const PublicRoute = ({ children, redirectTo = PUBLIC_ROUTES.HOME }) => {
  const { auth } = useContext(AuthContext);

  // Nếu user đã đăng nhập, redirect về trang chủ
  if (auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu chưa đăng nhập, cho phép truy cập trang
  return <>{children}</>;
};

export default PublicRoute;
