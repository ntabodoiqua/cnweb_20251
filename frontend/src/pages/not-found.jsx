import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  FrownOutlined,
} from "@ant-design/icons";
import "./not-found.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon-wrapper">
          <FrownOutlined className="not-found-icon" />
        </div>

        <div className="not-found-number">404</div>

        <h2 className="not-found-title">Không tìm thấy trang</h2>

        <p className="not-found-description">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ để tiếp tục
          trải nghiệm mua sắm.
        </p>

        <div className="not-found-buttons">
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            className="not-found-button-primary"
          >
            Về trang chủ
          </Button>

          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="not-found-button-secondary"
          >
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
