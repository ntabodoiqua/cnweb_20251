import {
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShopOutlined,
} from "@ant-design/icons";

/**
 * SellerOverviewPage - Trang tổng quan dashboard người bán
 * Hiển thị các thống kê quan trọng về cửa hàng
 */
const SellerOverviewPage = () => {
  // Mock data - sẽ thay thế bằng API sau
  const stats = [
    {
      id: 1,
      title: "Đơn hàng hôm nay",
      value: "45",
      icon: <ShoppingOutlined />,
      trend: { type: "up", value: "+15.2%" },
      label: "So với hôm qua",
    },
    {
      id: 2,
      title: "Doanh thu hôm nay",
      value: "₫12,450,000",
      icon: <DollarOutlined />,
      trend: { type: "up", value: "+22.5%" },
      label: "So với hôm qua",
    },
    {
      id: 3,
      title: "Sản phẩm",
      value: "156",
      icon: <ShopOutlined />,
      trend: { type: "up", value: "+5" },
      label: "Sản phẩm mới",
    },
    {
      id: 4,
      title: "Lượt xem cửa hàng",
      value: "2,543",
      icon: <EyeOutlined />,
      trend: { type: "down", value: "-3.2%" },
      label: "So với hôm qua",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-2024-156",
      customer: "Nguyễn Văn A",
      product: "Laptop Dell XPS 13",
      quantity: 1,
      amount: "₫25,000,000",
      status: "Chờ xác nhận",
      date: "2024-11-14 10:30",
    },
    {
      id: "ORD-2024-157",
      customer: "Trần Thị B",
      product: "iPhone 15 Pro Max",
      quantity: 1,
      amount: "₫35,000,000",
      status: "Đang chuẩn bị",
      date: "2024-11-14 09:15",
    },
    {
      id: "ORD-2024-158",
      customer: "Lê Văn C",
      product: "Samsung Galaxy S24",
      quantity: 2,
      amount: "₫44,000,000",
      status: "Đang giao",
      date: "2024-11-14 08:45",
    },
    {
      id: "ORD-2024-159",
      customer: "Phạm Thị D",
      product: "MacBook Pro M3",
      quantity: 1,
      amount: "₫45,000,000",
      status: "Hoàn thành",
      date: "2024-11-13 16:20",
    },
    {
      id: "ORD-2024-160",
      customer: "Hoàng Văn E",
      product: "AirPods Pro 2",
      quantity: 3,
      amount: "₫19,500,000",
      status: "Hoàn thành",
      date: "2024-11-13 14:10",
    },
  ];

  const topProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      sold: 45,
      revenue: "₫1,575,000,000",
      stock: 23,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      sold: 38,
      revenue: "₫1,140,000,000",
      stock: 15,
    },
    {
      id: 3,
      name: "MacBook Pro M3 14 inch",
      sold: 27,
      revenue: "₫1,215,000,000",
      stock: 8,
    },
    {
      id: 4,
      name: "Dell XPS 13 Plus",
      sold: 22,
      revenue: "₫550,000,000",
      stock: 12,
    },
    {
      id: 5,
      name: "AirPods Pro 2nd Gen",
      sold: 156,
      revenue: "₫1,014,000,000",
      stock: 45,
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "status-completed";
      case "Chờ xác nhận":
        return "status-pending";
      case "Đang chuẩn bị":
        return "status-preparing";
      case "Đang giao":
        return "status-shipping";
      case "Đã hủy":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="seller-overview">
      {/* Stats Cards */}
      <div className="seller-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="seller-stat-card">
            <div className="seller-stat-header">
              <span className="seller-stat-title">{stat.title}</span>
              <div className="seller-stat-icon">{stat.icon}</div>
            </div>
            <h2 className="seller-stat-value">{stat.value}</h2>
            <div className="seller-stat-label">
              <span className={`seller-stat-trend ${stat.trend.type}`}>
                {stat.trend.type === "up" ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}
                {stat.trend.value}
              </span>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout for orders and products */}
      <div className="seller-content-grid">
        {/* Recent Orders */}
        <div className="seller-section">
          <h2 className="seller-section-title">Đơn hàng gần đây</h2>
          <div className="seller-table-container">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>{order.customer}</td>
                    <td className="product-cell">{order.product}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <strong style={{ color: "#ee4d2d" }}>
                        {order.amount}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button className="seller-btn seller-btn-secondary seller-btn-small">
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="seller-section">
          <h2 className="seller-section-title">Sản phẩm bán chạy</h2>
          <div className="seller-table-container">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="product-cell">
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.sold}</td>
                    <td>
                      <strong style={{ color: "#ee4d2d" }}>
                        {product.revenue}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`stock-badge ${
                          product.stock < 10 ? "low-stock" : ""
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="seller-section">
        <h2 className="seller-section-title">Thao tác nhanh</h2>
        <div className="seller-quick-actions">
          <button className="seller-btn seller-btn-primary">
            <ShopOutlined />
            Thêm sản phẩm mới
          </button>
          <button className="seller-btn seller-btn-primary">
            <ShoppingOutlined />
            Xem tất cả đơn hàng
          </button>
          <button className="seller-btn seller-btn-secondary">
            <DollarOutlined />
            Xem báo cáo doanh thu
          </button>
          <button className="seller-btn seller-btn-secondary">
            <RiseOutlined />
            Chạy khuyến mãi
          </button>
        </div>
      </div>

      <style jsx>{`
        .seller-overview {
          animation: fadeIn 0.5s ease-out;
        }

        .seller-content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .seller-section {
          margin-bottom: 32px;
        }

        .seller-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .seller-section-title::before {
          content: "";
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          border-radius: 2px;
        }

        .product-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          white-space: nowrap;
        }

        .status-completed {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-pending {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-preparing {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .status-shipping {
          background: rgba(114, 46, 209, 0.1);
          color: #722ed1;
        }

        .status-cancelled {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .stock-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .stock-badge.low-stock {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .seller-quick-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .seller-btn-small {
          padding: 6px 12px;
          font-size: 13px;
        }

        @media (max-width: 1200px) {
          .seller-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .seller-quick-actions {
            flex-direction: column;
          }

          .seller-quick-actions .seller-btn {
            width: 100%;
            justify-content: center;
          }

          .product-cell {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerOverviewPage;
