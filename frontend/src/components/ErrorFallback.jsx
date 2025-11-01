import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { Button, Result } from "antd";

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        background: "#f0f2f5",
      }}
    >
      <Result
        status="error"
        title="Oops! Đã có lỗi xảy ra"
        subTitle={
          error?.message ||
          "Xin lỗi, đã có lỗi không mong muốn xảy ra khi tải trang này."
        }
        extra={[
          <Button type="primary" key="home" onClick={handleGoHome}>
            Về trang chủ
          </Button>,
          <Button key="reload" onClick={handleReload}>
            Tải lại trang
          </Button>,
        ]}
      >
        {process.env.NODE_ENV === "development" && error && (
          <div
            style={{
              textAlign: "left",
              background: "#fff",
              padding: "16px",
              borderRadius: "8px",
              marginTop: "16px",
              border: "1px solid #d9d9d9",
            }}
          >
            <details style={{ whiteSpace: "pre-wrap" }}>
              <summary
                style={{
                  cursor: "pointer",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#cf1322",
                }}
              >
                Chi tiết lỗi (Development Mode)
              </summary>
              <div style={{ fontSize: "12px", color: "#666" }}>
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
                {error.stack && (
                  <>
                    <p>
                      <strong>Stack Trace:</strong>
                    </p>
                    <pre
                      style={{
                        fontSize: "11px",
                        overflow: "auto",
                        background: "#f5f5f5",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      {error.stack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          </div>
        )}
      </Result>
    </div>
  );
};

export default ErrorFallback;
