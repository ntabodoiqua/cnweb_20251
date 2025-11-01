import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import { RouterProvider } from "react-router-dom";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import router from "./routes/index.jsx";

/**
 * Main entry point của ứng dụng
 * - AuthWrapper: Quản lý authentication state
 * - ErrorBoundary: Bắt lỗi runtime để tránh app crash
 * - RouterProvider: Cung cấp router configuration cho toàn bộ app
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </ErrorBoundary>
  </React.StrictMode>
);
