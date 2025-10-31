import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider locale={viVN}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
