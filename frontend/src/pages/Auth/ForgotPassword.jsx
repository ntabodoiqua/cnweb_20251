import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title="Quên mật khẩu"
        subTitle="Tính năng này đang được phát triển."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.LOGIN)}>
            Quay lại đăng nhập
          </Button>
        }
      />
    </div>
  );
};

export default ForgotPassword;
