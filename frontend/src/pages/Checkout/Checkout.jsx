import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const Checkout = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title="Thanh toán"
        subTitle="Trang này đang được phát triển."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.CART)}>
            Quay lại giỏ hàng
          </Button>
        }
      />
    </div>
  );
};

export default Checkout;
