import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../components/context/auth.context";
import { notification } from "antd";
import { PUBLIC_ROUTES } from "../../constants/routes";

/**
 * Component bảo vệ route dựa trên authentication và role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần bảo vệ
 * @param {string[]} props.allowedRoles - Danh sách các role được phép truy cập (optional)
 * @param {string} props.redirectTo - Đường dẫn redirect khi không có quyền (default: "/login")
 * @param {boolean} props.showNotification - Hiển thị notification khi không có quyền (default: true)
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = PUBLIC_ROUTES.LOGIN,
  showNotification = true,
}) => {
  const { auth } = useContext(AuthContext);

  // Kiểm tra xem user đã đăng nhập chưa
  if (!auth.isAuthenticated) {
    if (showNotification) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để truy cập trang này.",
        placement: "topRight",
        duration: 3,
      });
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu có yêu cầu về role
  if (allowedRoles.length > 0) {
    const userRole = auth.user?.role;

    // Kiểm tra xem user có role phù hợp không
    if (!userRole || !allowedRoles.includes(userRole)) {
      if (showNotification) {
        notification.error({
          message: "Không có quyền truy cập",
          description: "Bạn không có quyền truy cập trang này.",
          placement: "topRight",
          duration: 3,
        });
      }
      return <Navigate to={PUBLIC_ROUTES.HOME} replace />;
    }
  }

  // Nếu pass tất cả các kiểm tra, render component con
  return <>{children}</>;
};

export default ProtectedRoute;
