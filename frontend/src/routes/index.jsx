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
const AboutUsPage = lazy(() => import("../pages/guest/About_Us/about-us"));
const CareersPage = lazy(() => import("../pages/guest/About_Us/careers"));
const TermsPage = lazy(() => import("../pages/guest/About_Us/terms"));
const PrivacyPage = lazy(() => import("../pages/guest/About_Us/privacy"));
const SellersPage = lazy(() => import("../pages/guest/About_Us/sellers"));
const ContactPage = lazy(() => import("../pages/guest/About_Us/contact"));

const HelpPage = lazy(() => import("../pages/guest/Customer support/HelpPage"));
const OrdersPage = lazy(() =>
  import("../pages/guest/Customer support/OrdersPage")
);
const PaymentPage = lazy(() =>
  import("../pages/guest/Customer support/PaymentPage")
);
const ReturnsPage = lazy(() =>
  import("../pages/guest/Customer support/ReturnsPage")
);
const ShippingPage = lazy(() =>
  import("../pages/guest/Customer support/ShippingPage")
);
const WarrantyPage = lazy(() =>
  import("../pages/guest/Customer support/WarrantyPage")
);
// Protected Pages
const ProfileLayout = lazy(() => import("../pages/ProfileLayout"));

// Profile sub-pages
const ProfileGeneralPage = lazy(() =>
  import("../pages/profile/ProfileGeneralPage")
);
const ProfileSellerPage = lazy(() =>
  import("../pages/profile/ProfileSellerPage")
);
const ProfileOrdersPage = lazy(() =>
  import("../pages/profile/ProfileOrdersPage")
);
const ProfileAddressesPage = lazy(() =>
  import("../pages/profile/ProfileAddressesPage")
);
const ProfileHistoryPage = lazy(() =>
  import("../pages/profile/ProfileHistoryPage")
);
const ProfileSecurityPage = lazy(() =>
  import("../pages/profile/ProfileSecurityPage")
);

// Admin Pages
const AdminDashboardLayout = lazy(() =>
  import("../pages/admin/AdminDashboardLayout")
);
const AdminOverviewPage = lazy(() =>
  import("../pages/admin/AdminOverviewPage")
);
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminProductsPage = lazy(() =>
  import("../pages/admin/AdminProductsPage")
);
const AdminOrdersPage = lazy(() => import("../pages/admin/AdminOrdersPage"));
const AdminPaymentsPage = lazy(() =>
  import("../pages/admin/AdminPaymentsPage")
);
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReportsPage"));
const AdminSettingsPage = lazy(() =>
  import("../pages/admin/AdminSettingsPage")
);

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
      {
        path: PUBLIC_ROUTES.SELLERS,
        element: (
          <SuspenseWrapper>
            <SellersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.CONTACT,
        element: (
          <SuspenseWrapper>
            <ContactPage />
          </SuspenseWrapper>
        ),
      },

      // ==================== PROTECTED ROUTES (USER + ADMIN) ====================
      // Profile routes with nested pages
      {
        path: PROTECTED_ROUTES.PROFILE,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute
              allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.SELLER]}
            >
              <ProfileLayout />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <ProfileGeneralPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.PROFILE_SELLER,
            element: (
              <SuspenseWrapper>
                <ProfileSellerPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.PROFILE_ORDERS,
            element: (
              <SuspenseWrapper>
                <ProfileOrdersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.PROFILE_ADDRESSES,
            element: (
              <SuspenseWrapper>
                <ProfileAddressesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.PROFILE_HISTORY,
            element: (
              <SuspenseWrapper>
                <ProfileHistoryPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.PROFILE_SECURITY,
            element: (
              <SuspenseWrapper>
                <ProfileSecurityPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // ==================== ADMIN ONLY ROUTES ====================
      {
        path: PROTECTED_ROUTES.ADMIN_DASHBOARD,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <AdminOverviewPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_USERS,
            element: (
              <SuspenseWrapper>
                <AdminUsersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_PRODUCTS,
            element: (
              <SuspenseWrapper>
                <AdminProductsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_ORDERS,
            element: (
              <SuspenseWrapper>
                <AdminOrdersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_PAYMENTS,
            element: (
              <SuspenseWrapper>
                <AdminPaymentsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_REPORTS,
            element: (
              <SuspenseWrapper>
                <AdminReportsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_SETTINGS,
            element: (
              <SuspenseWrapper>
                <AdminSettingsPage />
              </SuspenseWrapper>
            ),
          },
        ],
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
