import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./pages/register.jsx";
import UserPage from "./pages/user.jsx";
import ProfilePage from "./pages/profile.jsx";
import HomePage from "./pages/home.jsx";
import LoginPage from "./pages/login.jsx";
import VerifyEmailPage from "./pages/verify-email.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "user",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
            <UserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      // Ví dụ: Trang chỉ dành cho ADMIN
      // {
      //   path: "admin",
      //   element: (
      //     <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      //       <AdminPage />
      //     </ProtectedRoute>
      //   ),
      // },
    ],
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>
);
