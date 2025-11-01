import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin, notification } from "antd";
import { getTokenInfo, isTokenExpired } from "./util/jwt";

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      setAppLoading(true);

      try {
        // Lấy token từ localStorage
        const token = localStorage.getItem("access_token");

        if (token) {
          // Kiểm tra token có hết hạn không
          if (isTokenExpired(token)) {
            // Token đã hết hạn
            localStorage.removeItem("access_token");
            notification.warning({
              message: "Phiên đăng nhập đã hết hạn",
              description: "Vui lòng đăng nhập lại để tiếp tục.",
              placement: "topRight",
              duration: 3,
            });
            setAuth({
              isAuthenticated: false,
              user: {
                username: "",
                email: "",
                name: "",
                role: "",
              },
            });
          } else {
            // Token còn hiệu lực, decode để lấy thông tin
            const tokenInfo = getTokenInfo(token);

            if (tokenInfo) {
              setAuth({
                isAuthenticated: true,
                user: {
                  username: tokenInfo.username,
                  role: tokenInfo.role,
                },
              });
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
                },
              });
            }
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
          },
        });
      } finally {
        setAppLoading(false);
      }
    };

    initializeAuth();
  }, [setAuth, setAppLoading, navigate]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {appLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <Header />
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
