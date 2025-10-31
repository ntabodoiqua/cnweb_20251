import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            Quay về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
