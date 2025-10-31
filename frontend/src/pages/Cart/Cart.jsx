import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const Cart = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title="Giỏ hàng"
        subTitle="Trang này đang được phát triển."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            Tiếp tục mua sắm
          </Button>
        }
      />
    </div>
  );
};

export default Cart;
