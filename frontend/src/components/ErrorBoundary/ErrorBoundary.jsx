import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px 0" }}>
          <Result
            status="500"
            title="500"
            subTitle="Xin lỗi, đã xảy ra lỗi không mong muốn."
            extra={
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = ROUTES.HOME;
                }}
              >
                Quay về trang chủ
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
