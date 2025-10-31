import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES, USER_ROLES } from "../constants";
import MainLayout from "../layouts/MainLayout/MainLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "../guards/ProtectedRoute";
import PublicRoute from "../guards/PublicRoute";
import { Loading } from "../components";

// Lazy load pages
const Home = lazy(() => import("../pages/Home/Home"));
const Products = lazy(() => import("../pages/Products/Products"));
const ProductDetail = lazy(() => import("../pages/Products/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Checkout/Checkout"));

// Auth Pages
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));

// User Pages
const Profile = lazy(() => import("../pages/User/Profile"));
const Orders = lazy(() => import("../pages/User/Orders"));
const OrderDetail = lazy(() => import("../pages/User/OrderDetail"));
const Wishlist = lazy(() => import("../pages/User/Wishlist"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
const AdminProducts = lazy(() => import("../pages/Admin/Products"));
const AdminOrders = lazy(() => import("../pages/Admin/Orders"));
const AdminUsers = lazy(() => import("../pages/Admin/Users"));
const AdminCategories = lazy(() => import("../pages/Admin/Categories"));

// Error Pages
const NotFound = lazy(() => import("../pages/Error/NotFound"));
const Forbidden = lazy(() => import("../pages/Error/Forbidden"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading fullscreen />}>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route
          path={ROUTES.HOME}
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.PRODUCT_DETAIL}
          element={
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.CART}
          element={
            <MainLayout>
              <Cart />
            </MainLayout>
          }
        />

        {/* Auth Routes (only for non-authenticated users) */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.RESET_PASSWORD}
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Checkout />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDERS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Orders />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDER_DETAIL}
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrderDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WISHLIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Wishlist />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PRODUCTS}
          element={
            <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ORDERS}
          element={
            <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_USERS}
          element={
            <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CATEGORIES}
          element={
            <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route
          path={ROUTES.FORBIDDEN}
          element={
            <MainLayout>
              <Forbidden />
            </MainLayout>
          }
        />
        <Route
          path={ROUTES.NOT_FOUND}
          element={
            <MainLayout>
              <NotFound />
            </MainLayout>
          }
        />

        {/* Catch all - redirect to 404 */}
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
