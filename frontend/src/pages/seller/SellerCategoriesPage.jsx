import { TagsOutlined, PlusOutlined } from "@ant-design/icons";

/**
 * SellerCategoriesPage - Trang quản lý danh mục sản phẩm của người bán
 */
const SellerCategoriesPage = () => {
  return (
    <div className="seller-categories">
      <div className="page-placeholder">
        <TagsOutlined style={{ fontSize: "80px", color: "#ee4d2d" }} />
        <h2>Quản lý Danh mục Sản phẩm</h2>
        <p>Tính năng đang được phát triển</p>
        <button className="seller-btn seller-btn-primary">
          <PlusOutlined />
          Thêm danh mục mới
        </button>
      </div>

      <style jsx>{`
        .seller-categories {
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

export default SellerCategoriesPage;
