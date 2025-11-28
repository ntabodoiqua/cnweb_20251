import { useNavigate, useLocation } from "react-router-dom";
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  getRouteTitle,
} from "../constants/routes";
import { useEffect } from "react";

/**
 * Custom hook để làm việc với routes
 * Cung cấp các utilities và helpers cho navigation
 */
export const useRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a route with type safety
   */
  const goTo = {
    // Public routes
    home: () => navigate(PUBLIC_ROUTES.HOME),
    login: () => navigate(PUBLIC_ROUTES.LOGIN),
    register: () => navigate(PUBLIC_ROUTES.REGISTER),
    verifyEmail: () => navigate(PUBLIC_ROUTES.VERIFY_EMAIL),
    forgotPassword: () => navigate(PUBLIC_ROUTES.FORGOT_PASSWORD),
    resetPassword: () => navigate(PUBLIC_ROUTES.RESET_PASSWORD),
      help: () => navigate(PUBLIC_ROUTES.HELP),
      orders: () => navigate(PUBLIC_ROUTES.ORDERS),
      payment: () => navigate(PUBLIC_ROUTES.PAYMENT),
      returns: () => navigate(PUBLIC_ROUTES.RETURNS),
      shipping: () => navigate(PUBLIC_ROUTES.SHIPPING),
      warranty: () => navigate(PUBLIC_ROUTES.WARRANTY),
    // Protected routes
    profile: () => navigate(PROTECTED_ROUTES.PROFILE),
    user: () => navigate(PROTECTED_ROUTES.USER),

    // Admin routes
    adminDashboard: () => navigate(PROTECTED_ROUTES.ADMIN_DASHBOARD),

    // Custom navigation
    custom: (path) => navigate(path),
    back: () => navigate(-1),
    forward: () => navigate(1),
  };

  /**
   * Check if current route matches
   */
  const isCurrentRoute = (path) => location.pathname === path;

  /**
   * Check if current route is in a group
   */
  const isInRouteGroup = (paths) => paths.includes(location.pathname);

  /**
   * Get current route info
   */
  const currentRoute = {
    path: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    title: getRouteTitle(location.pathname),
  };

  return {
    goTo,
    navigate,
    location,
    currentRoute,
    isCurrentRoute,
    isInRouteGroup,
  };
};

/**
 * Hook để tự động update document title dựa trên route
 * Sử dụng trong App component hoặc layout
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | CNWEB E-Commerce`;
    } else {
      document.title = "CNWEB E-Commerce";
    }
  }, [title]);
};

/**
 * Hook để update title dựa trên current route
 */
export const useRouteTitle = () => {
  const location = useLocation();
  const title = getRouteTitle(location.pathname);

  useDocumentTitle(title);

  return title;
};
