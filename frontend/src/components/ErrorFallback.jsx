import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { Button } from "antd";
import {
  HomeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "./ErrorFallback.css";

/**
 * ErrorFallback component cho React Router errorElement
 * Bắt lỗi xảy ra trong route rendering
 */
const ErrorFallback = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error("Route Error:", error);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-fallback-container">
      <div className="error-fallback-card">
        <div className="error-fallback-icon-wrapper">
          <ExclamationCircleOutlined className="error-fallback-icon" />
        </div>

        <div className="error-fallback-code">Lỗi</div>

        <h2 className="error-fallback-title">Oops! Đã có lỗi xảy ra</h2>

        <p className="error-fallback-description">
          {error?.message ||
            "Xin lỗi, đã có lỗi không mong muốn xảy ra khi tải trang này. Đừng lo lắng, vui lòng thử tải lại trang hoặc quay về trang chủ."}
        </p>

        <div className="error-fallback-buttons">
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            className="error-fallback-button-primary"
          >
            Về trang chủ
          </Button>

          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={handleReload}
            className="error-fallback-button-secondary"
          >
            Tải lại trang
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <div className="error-fallback-details">
            <details>
              <summary>
                <strong>Chi tiết lỗi (Development Mode)</strong>
              </summary>
              <div className="error-fallback-details-content">
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
                {error.stack && (
                  <>
                    <p>
                      <strong>Stack Trace:</strong>
                    </p>
                    <pre>{error.stack}</pre>
                  </>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
