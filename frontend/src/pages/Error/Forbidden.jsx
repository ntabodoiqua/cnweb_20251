import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            Quay về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default Forbidden;
