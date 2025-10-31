import { Button, Result } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title={`Chi tiết sản phẩm #${id}`}
        subTitle="Trang này đang được phát triển."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Quay lại danh sách
          </Button>
        }
      />
    </div>
  );
};

export default ProductDetail;
