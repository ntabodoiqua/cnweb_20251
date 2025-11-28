import { TeamOutlined, UserAddOutlined } from "@ant-design/icons";

/**
 * SellerCustomersPage - Trang quản lý khách hàng của người bán
 */
const SellerCustomersPage = () => {
  return (
    <div className="seller-customers">
      <div className="page-placeholder">
        <TeamOutlined style={{ fontSize: "80px", color: "#ee4d2d" }} />
        <h2>Quản lý Khách hàng</h2>
        <p>Tính năng đang được phát triển</p>
        <button className="seller-btn seller-btn-primary">
          <UserAddOutlined />
          Thêm khách hàng
        </button>
      </div>

      <style jsx>{`
        .seller-customers {
          animation: fadeIn 0.5s ease-out;
        }

        .page-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          gap: 20px;
        }

        .page-placeholder h2 {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .page-placeholder p {
          font-size: 16px;
          color: #888;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default SellerCustomersPage;
