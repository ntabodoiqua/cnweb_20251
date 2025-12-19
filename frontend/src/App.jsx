import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import ScrollToTop from "./components/common/ScrollToTop";
import { ChatWidget } from "./components/chat";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import LoadingSpinner from "./components/LoadingSpinner";
import { getTokenInfo, isTokenExpired } from "./util/jwt";
import { getMyInfoApi } from "./util/api";
import useScrollToTop from "./hooks/useScrollToTop";

/**
 * App Component - Main Layout
 * - Kiểm tra và khởi tạo authentication state
 * - Render Header/Footer với Outlet cho nested routes
 */
function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tự động scroll lên đầu trang mỗi khi chuyển route
  useScrollToTop();

  useEffect(() => {
    const initializeAuth = async () => {
      setAppLoading(true);

      try {
        // Lấy token từ localStorage
        const token = localStorage.getItem("access_token");

        if (token) {
          // Token còn hiệu lực, decode để lấy thông tin
          const tokenInfo = getTokenInfo(token);

          if (tokenInfo) {
            // Gọi API để lấy đầy đủ thông tin user
            try {
              const userInfoRes = await getMyInfoApi();
              if (userInfoRes && userInfoRes.code === 1000) {
                const userInfo = userInfoRes.result;
                setAuth({
                  isAuthenticated: true,
                  user: {
                    username: userInfo.username || tokenInfo.username,
                    role: tokenInfo.role,
                    firstName: userInfo.firstName || "",
                    lastName: userInfo.lastName || "",
                    avatarUrl: userInfo.avatarUrl || userInfo.avatarName || "",
                    email: userInfo.email || "",
                  },
                });
              } else {
                // Nếu không lấy được thông tin chi tiết, dùng thông tin từ token
                setAuth({
                  isAuthenticated: true,
                  user: {
                    username: tokenInfo.username,
                    role: tokenInfo.role,
                    firstName: "",
                    lastName: "",
                    avatarUrl: "",
                    email: "",
                  },
                });
              }
            } catch (userInfoError) {
              console.error("Error fetching user info:", userInfoError);
              // Nếu có lỗi, vẫn đăng nhập với thông tin từ token
              setAuth({
                isAuthenticated: true,
                user: {
                  username: tokenInfo.username,
                  role: tokenInfo.role,
                  firstName: "",
                  lastName: "",
                  avatarUrl: "",
                  email: "",
                },
              });
            }
          } else {
            // Token không hợp lệ
            localStorage.removeItem("access_token");
            setAuth({
              isAuthenticated: false,
              user: {
                username: "",
                email: "",
                name: "",
                role: "",
                firstName: "",
                lastName: "",
                avatarUrl: "",
              },
            });
          }
        } else {
          // Không có token
          setAuth({
            isAuthenticated: false,
            user: {
              username: "",
              email: "",
              name: "",
              role: "",
              firstName: "",
              lastName: "",
              avatarUrl: "",
            },
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuth({
          isAuthenticated: false,
          user: {
            username: "",
            email: "",
            name: "",
            role: "",
            firstName: "",
            lastName: "",
            avatarUrl: "",
          },
        });
      } finally {
        setAppLoading(false);
      }
    };

    initializeAuth();
  }, [setAuth, setAppLoading]);

  // Loading state - Hiển thị spinner khi đang khởi tạo auth
  if (appLoading) {
    return <LoadingSpinner tip="Đang khởi tạo..." />;
  }

  // Main layout
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <ChatWidget />
    </div>
  );
}

export default App;
