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
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const BrandPage = lazy(() => import("../pages/BrandPage"));
const StorePage = lazy(() => import("../pages/StorePage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
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

// User Pages
const CartPage = lazy(() => import("../pages/user/CartPage"));
const CheckoutPage = lazy(() => import("../pages/user/CheckoutPage"));
const PaymentResultPage = lazy(() => import("../pages/user/PaymentResultPage"));
const FollowingStoresPage = lazy(() =>
  import("../pages/user/FollowingStoresPage")
);

// Notification Pages
const NotificationsPage = lazy(() =>
  import("../pages/notifications/NotificationsPage")
);

// Chat Pages
const ChatPage = lazy(() => import("../pages/chat"));

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
const ProfileOrderDetailPage = lazy(() =>
  import("../pages/profile/ProfileOrderDetailPage")
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
const AdminBrandsPage = lazy(() => import("../pages/admin/AdminBrandsPage"));
const AdminBannersPage = lazy(() => import("../pages/admin/AdminBannersPage"));
const AdminStoresPage = lazy(() => import("../pages/admin/AdminStoresPage"));
const AdminSellerProfilesPage = lazy(() =>
  import("../pages/admin/AdminSellerProfilesPage")
);
const AdminCategoriesPage = lazy(() =>
  import("../pages/admin/AdminCategoriesPage")
);
const AdminProductAttributesPage = lazy(() =>
  import("../pages/admin/AdminProductAttributesPage")
);
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
const AdminVideoReviewsPage = lazy(() =>
  import("../pages/admin/AdminVideoReviewsPage")
);

// Seller Pages
const SellerDashboardLayout = lazy(() =>
  import("../pages/seller/SellerDashboardLayout")
);
const SellerOverviewPage = lazy(() =>
  import("../pages/seller/SellerOverviewPage")
);
const SellerProductsPage = lazy(() =>
  import("../pages/seller/SellerProductsPage")
);
const SellerProductDetailPage = lazy(() =>
  import("../pages/seller/SellerProductDetailPage")
);
const SellerVariantDetailPage = lazy(() =>
  import("../pages/seller/SellerVariantDetailPage")
);
const SellerOrdersPage = lazy(() => import("../pages/seller/SellerOrdersPage"));
const SellerCategoriesPage = lazy(() =>
  import("../pages/seller/SellerCategoriesPage")
);
const SellerBannersPage = lazy(() =>
  import("../pages/seller/SellerBannersPage")
);
const SellerProductAttributesPage = lazy(() =>
  import("../pages/seller/SellerProductAttributesPage")
);
const SellerCustomersPage = lazy(() =>
  import("../pages/seller/SellerCustomersPage")
);
const SellerStatisticsPage = lazy(() =>
  import("../pages/seller/SellerStatisticsPage")
);
const SellerSettingsPage = lazy(() =>
  import("../pages/seller/SellerSettingsPage")
);
const SellerChatPage = lazy(() => import("../pages/seller/SellerChatPage"));

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
      {
        path: PUBLIC_ROUTES.PRODUCTS,
        element: (
          <SuspenseWrapper>
            <ProductsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.PRODUCT_DETAIL,
        element: (
          <SuspenseWrapper>
            <ProductDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.CATEGORY,
        element: (
          <SuspenseWrapper>
            <CategoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.BRAND,
        element: (
          <SuspenseWrapper>
            <BrandPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.STORE,
        element: (
          <SuspenseWrapper>
            <StorePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PUBLIC_ROUTES.SEARCH,
        element: (
          <SuspenseWrapper>
            <SearchPage />
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

      // ==================== USER ROUTES ====================
      {
        path: PROTECTED_ROUTES.USER_CART,
        element: (
          <SuspenseWrapper>
            <CartPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PROTECTED_ROUTES.USER_CHECKOUT,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}>
              <CheckoutPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },
      {
        path: PROTECTED_ROUTES.PAYMENT_RESULT,
        element: (
          <SuspenseWrapper>
            <PaymentResultPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: PROTECTED_ROUTES.USER_FOLLOWING_STORES,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute
              allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.SELLER]}
            >
              <FollowingStoresPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // ==================== NOTIFICATIONS ====================
      {
        path: PROTECTED_ROUTES.NOTIFICATIONS,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute
              allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.SELLER]}
            >
              <NotificationsPage />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
      },

      // ==================== CHAT ====================
      {
        path: PROTECTED_ROUTES.CHAT,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute
              allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.SELLER]}
            >
              <ChatPage />
            </ProtectedRoute>
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
            path: PROTECTED_ROUTES.PROFILE_ORDER_DETAIL,
            element: (
              <SuspenseWrapper>
                <ProfileOrderDetailPage />
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
            path: PROTECTED_ROUTES.ADMIN_BRANDS,
            element: (
              <SuspenseWrapper>
                <AdminBrandsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_BANNERS,
            element: (
              <SuspenseWrapper>
                <AdminBannersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_STORES,
            element: (
              <SuspenseWrapper>
                <AdminStoresPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_SELLER_PROFILES,
            element: (
              <SuspenseWrapper>
                <AdminSellerProfilesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_CATEGORIES,
            element: (
              <SuspenseWrapper>
                <AdminCategoriesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.ADMIN_PRODUCT_ATTRIBUTES,
            element: (
              <SuspenseWrapper>
                <AdminProductAttributesPage />
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
          {
            path: PROTECTED_ROUTES.ADMIN_VIDEO_REVIEWS,
            element: (
              <SuspenseWrapper>
                <AdminVideoReviewsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // ==================== SELLER ONLY ROUTES ====================
      {
        path: PROTECTED_ROUTES.SELLER_DASHBOARD,
        element: (
          <SuspenseWrapper>
            <ProtectedRoute allowedRoles={[ROLES.SELLER]}>
              <SellerDashboardLayout />
            </ProtectedRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <SellerOverviewPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_PRODUCTS,
            element: (
              <SuspenseWrapper>
                <SellerProductsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: `${PROTECTED_ROUTES.SELLER_PRODUCTS}/:productId`,
            element: (
              <SuspenseWrapper>
                <SellerProductDetailPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: `${PROTECTED_ROUTES.SELLER_PRODUCTS}/:productId/variants/:variantId`,
            element: (
              <SuspenseWrapper>
                <SellerVariantDetailPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_ORDERS,
            element: (
              <SuspenseWrapper>
                <SellerOrdersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_ORDER_DETAIL,
            element: (
              <SuspenseWrapper>
                <SellerOrdersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_ORDER_RETURNS,
            element: (
              <SuspenseWrapper>
                <SellerOrdersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_CATEGORIES,
            element: (
              <SuspenseWrapper>
                <SellerCategoriesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_BANNERS,
            element: (
              <SuspenseWrapper>
                <SellerBannersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_PRODUCT_ATTRIBUTES,
            element: (
              <SuspenseWrapper>
                <SellerProductAttributesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_CUSTOMERS,
            element: (
              <SuspenseWrapper>
                <SellerCustomersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_CHAT,
            element: (
              <SuspenseWrapper>
                <SellerChatPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_STATISTICS,
            element: (
              <SuspenseWrapper>
                <SellerStatisticsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: PROTECTED_ROUTES.SELLER_SETTINGS,
            element: (
              <SuspenseWrapper>
                <SellerSettingsPage />
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
