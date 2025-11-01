import React from "react";
import { Button, Result } from "antd";

/**
 * ErrorBoundary - Component bắt lỗi runtime trong React
 * Ngăn chặn toàn bộ app crash khi 1 component gặp lỗi
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log lỗi ra console để debug
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Có thể gửi error lên error tracking service (Sentry, LogRocket, etc.)
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload trang để reset state
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI khi có lỗi
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "20px",
          }}
        >
          <Result
            status="error"
            title="Oops! Đã có lỗi xảy ra"
            subTitle="Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau."
            extra={[
              <Button type="primary" key="home" onClick={this.handleReset}>
                Về trang chủ
              </Button>,
              <Button key="reload" onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  textAlign: "left",
                  background: "#f5f5f5",
                  padding: "16px",
                  borderRadius: "8px",
                  marginTop: "16px",
                }}
              >
                <details style={{ whiteSpace: "pre-wrap" }}>
                  <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
                    <strong>Chi tiết lỗi (Development)</strong>
                  </summary>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    <p>
                      <strong>Error:</strong> {this.state.error?.toString()}
                    </p>
                    <p>
                      <strong>Stack:</strong>
                    </p>
                    <pre style={{ fontSize: "11px", overflow: "auto" }}>
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    // Không có lỗi, render children bình thường
    return this.props.children;
  }
}

export default ErrorBoundary;
