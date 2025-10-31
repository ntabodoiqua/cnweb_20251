import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px 0" }}>
      <Result
        status="info"
        title="Quản lý danh mục"
        subTitle="Trang này đang được phát triển."
        extra={
          <Button
            type="primary"
            onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
          >
            Quay lại Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default Categories;
