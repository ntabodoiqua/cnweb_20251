import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title="Đặt lại mật khẩu"
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

export default ResetPassword;
