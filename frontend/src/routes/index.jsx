import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorFallback from "../components/ErrorFallback";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  ERROR_ROUTES,
} from "../constants/routes";
import { ROLES } from "../constants/roles";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";

// ============================================
// LAZY LOADING COMPONENTS
// ============================================

// Public Pages
const HomePage = lazy(() => import("../pages/home"));
const LoginPage = lazy(() => import("../pages/login"));
const RegisterPage = lazy(() => import("../pages/register"));
const VerifyEmailPage = lazy(() => import("../pages/verify-email"));
const ForgotPasswordPage = lazy(() => import("../pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("../pages/reset-password"));
const AboutUsPage = lazy(() => import("../pages/about-us"));
const CareersPage = lazy(() => import("../pages/careers"));
const TermsPage = lazy(() => import("../pages/terms"));
const PrivacyPage = lazy(() => import("../pages/privacy"));

const HelpPage = lazy(() => import("../pages/HelpPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
const ReturnsPage = lazy(() => import("../pages/ReturnsPage"));
const ShippingPage = lazy(() => import("../pages/ShippingPage"));
const WarrantyPage = lazy(() => import("../pages/WarrantyPage"));
// Protected Pages
const UserPage = lazy(() => import("../pages/user"));
const ProfilePage = lazy(() => import("../pages/profile"));

// Admin Pages
const AdminDashboardPage = lazy(() => import("../pages/admin-dashboard"));

// Error Pages
const NotFoundPage = lazy(() => import("../pages/not-found"));

// ============================================
// LOADING FALLBACK COMPONENT
// ============================================

const PageLoader = () => (
  <LoadingSpinner tip="Đang tải trang..." fullScreen={false} />
);

// ============================================
// SUSPENSE WRAPPER
// ============================================

/**
 * Wrapper component để bọc lazy-loaded components với Suspense
 */
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// ============================================
// ROUTE CONFIGURATION
// ============================================

/**
 * Main router configuration với lazy loading và route guards
 */
const router = createBrowserRouter([
  {
    path: PUBLIC_ROUTES.HOME,
    element: <App />,
    errorElement: <ErrorFallback />, // Bắt lỗi cho toàn bộ app
    children: [
      // ==================== PUBLIC ROUTES ====================
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },

      // ==================== AUTH ROUTES (PUBLIC) ====================
      {
        path: PUBLIC_ROUTES.LOGIN,
        element: (
          <SuspenseWrapper>
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.REGISTER,
        element: (
          <SuspenseWrapper>
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.VERIFY_EMAIL,
        element: (
          <SuspenseWrapper>
            <PublicRoute>
              <VerifyEmailPage />
            </PublicRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.FORGOT_PASSWORD,
        element: (
          <SuspenseWrapper>
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.RESET_PASSWORD,
        element: (
          <SuspenseWrapper>
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.ABOUT_US,
        element: (
          <SuspenseWrapper>
            <AboutUsPage />
          </SuspenseWrapper>
        ),
      },
        {
            path: PUBLIC_ROUTES.HELP,
            element: (
                <SuspenseWrapper>
                    <HelpPage />
                </SuspenseWrapper>
            ),
        },
        {
            path: PUBLIC_ROUTES.ORDERS,
            element: (
                <SuspenseWrapper>
                    <OrdersPage />
                </SuspenseWrapper>
            ),
        },
        {
            path: PUBLIC_ROUTES.PAYMENT,
            element: (
                <SuspenseWrapper>
                    <PaymentPage />
                </SuspenseWrapper>
            ),
        },
        {
            path: PUBLIC_ROUTES.RETURNS,
            element: (
                <SuspenseWrapper>
                    <ReturnsPage />
                </SuspenseWrapper>
            ),
        },
        {
            path: PUBLIC_ROUTES.SHIPPING,
            element: (
                <SuspenseWrapper>
                    <ShippingPage />
                </SuspenseWrapper>
            ),
        },
        {
            path: PUBLIC_ROUTES.WARRANTY,
            element: (
                <SuspenseWrapper>
                    <WarrantyPage />
                </SuspenseWrapper>
            ),
        },
      {
        path: PUBLIC_ROUTES.CAREERS,
        element: (
          <SuspenseWrapper>
            <CareersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.TERMS,
        element: (
          <SuspenseWrapper>
            <TermsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.PRIVACY,
        element: (
          <SuspenseWrapper>
            <PrivacyPage />
          </SuspenseWrapper>
        ),
      },

      // ==================== PROTECTED ROUTES (USER + ADMIN) ====================
      {
        path: PROTECTED_ROUTES.USER,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}>
              <UserPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PROTECTED_ROUTES.PROFILE,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}>
              <ProfilePage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // ==================== ADMIN ONLY ROUTES ====================
      {
        path: PROTECTED_ROUTES.ADMIN_DASHBOARD,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // ==================== ERROR ROUTES ====================
      {
        path: ERROR_ROUTES.NOT_FOUND,
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

export default router;
