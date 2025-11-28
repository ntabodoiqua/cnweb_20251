import React from "react";
import { Button } from "antd";
import {
  HomeOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import "./ErrorBoundary.css";

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
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-wrapper">
              <WarningOutlined className="error-boundary-icon" />
            </div>

            <div className="error-boundary-code">500</div>

            <h2 className="error-boundary-title">Oops! Đã có lỗi xảy ra</h2>

            <p className="error-boundary-description">
              Xin lỗi, đã có lỗi không mong muốn xảy ra. Đừng lo lắng, đây không
              phải lỗi của bạn. Vui lòng thử tải lại trang hoặc quay về trang
              chủ.
            </p>

            <div className="error-boundary-buttons">
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={this.handleReset}
                className="error-boundary-button-primary"
              >
                Về trang chủ
              </Button>

              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                className="error-boundary-button-secondary"
              >
                Tải lại trang
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="error-boundary-details">
                <details>
                  <summary>
                    <strong>Chi tiết lỗi (Development Mode)</strong>
                  </summary>
                  <div className="error-boundary-details-content">
                    <p>
                      <strong>Error:</strong> {this.state.error?.toString()}
                    </p>
                    <p>
                      <strong>Stack Trace:</strong>
                    </p>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Không có lỗi, render children bình thường
    return this.props.children;
  }
}

export default ErrorBoundary;
