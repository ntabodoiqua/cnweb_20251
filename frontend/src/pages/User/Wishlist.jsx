import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const Wishlist = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title="Danh sách yêu thích"
        subTitle="Trang này đang được phát triển."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            Quay về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default Wishlist;
