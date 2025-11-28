import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/auth.context";
import { notification } from "antd";

/**
 * Component bảo vệ route dựa trên authentication và role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần bảo vệ
 * @param {string[]} props.allowedRoles - Danh sách các role được phép truy cập (optional)
 * @param {string} props.redirectTo - Đường dẫn redirect khi không có quyền (default: "/login")
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}) => {
  const { auth } = useContext(AuthContext);

  // Kiểm tra xem user đã đăng nhập chưa
  if (!auth.isAuthenticated) {
    notification.warning({
      message: "Yêu cầu đăng nhập",
      description: "Vui lòng đăng nhập để truy cập trang này.",
      placement: "topRight",
      duration: 3,
    });
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu có yêu cầu về role
  if (allowedRoles.length > 0) {
    const userRole = auth.user?.role;

    // Kiểm tra xem user có role phù hợp không
    if (!userRole || !allowedRoles.includes(userRole)) {
      notification.error({
        message: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang này.",
        placement: "topRight",
        duration: 3,
      });
      return <Navigate to="/" replace />;
    }
  }

  // Nếu pass tất cả các kiểm tra, render component con
  return <>{children}</>;
};

export default ProtectedRoute;
