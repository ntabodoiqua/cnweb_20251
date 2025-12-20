import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import "./styles/antd-custom.css";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { ChatProvider } from "./contexts/ChatContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import router from "./routes/index.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Main entry point của ứng dụng
 * - HelmetProvider: Quản lý SEO meta tags
 * - AuthWrapper: Quản lý authentication state
 * - CartProvider: Quản lý giỏ hàng state
 * - NotificationProvider: Quản lý push notification state
 * - ErrorBoundary: Bắt lỗi runtime để tránh app crash
 * - RouterProvider: Cung cấp router configuration cho toàn bộ app
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ErrorBoundary>
          <AuthWrapper>
            <CartProvider>
              <NotificationProvider>
                <ChatProvider>
                  <RouterProvider router={router} />
                </ChatProvider>
              </NotificationProvider>
            </CartProvider>
          </AuthWrapper>
        </ErrorBoundary>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
