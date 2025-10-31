import { lazy } from "react";

// Public Pages
export const Home = lazy(() => import("./Home/Home"));
export const Products = lazy(() => import("./Products/Products"));
export const ProductDetail = lazy(() => import("./Products/ProductDetail"));
export const Cart = lazy(() => import("./Cart/Cart"));
export const Checkout = lazy(() => import("./Checkout/Checkout"));

// Auth Pages
export const Login = lazy(() => import("./Auth/Login"));
export const Register = lazy(() => import("./Auth/Register"));
export const ForgotPassword = lazy(() => import("./Auth/ForgotPassword"));
export const ResetPassword = lazy(() => import("./Auth/ResetPassword"));

// User Pages
export const Profile = lazy(() => import("./User/Profile"));
export const Orders = lazy(() => import("./User/Orders"));
export const OrderDetail = lazy(() => import("./User/OrderDetail"));
export const Wishlist = lazy(() => import("./User/Wishlist"));

// Admin Pages
export const AdminDashboard = lazy(() => import("./Admin/Dashboard"));
export const AdminProducts = lazy(() => import("./Admin/Products"));
export const AdminOrders = lazy(() => import("./Admin/Orders"));
export const AdminUsers = lazy(() => import("./Admin/Users"));
export const AdminCategories = lazy(() => import("./Admin/Categories"));

// Error Pages
export const NotFound = lazy(() => import("./Error/NotFound"));
export const Forbidden = lazy(() => import("./Error/Forbidden"));
