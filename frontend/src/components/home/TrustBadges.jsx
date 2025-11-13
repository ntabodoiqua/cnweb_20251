import React from "react";
import {
  SafetyOutlined,
  TruckOutlined,
  SyncOutlined,
  CustomerServiceOutlined,
  CreditCardOutlined,
  ShieldCheckOutlined,
} from "@ant-design/icons";

/**
 * Trust Badges Section Component
 * Displays trust indicators and service features
 */
const TrustBadges = () => {
  const badges = [
    {
      id: 1,
      icon: <SafetyOutlined />,
      title: "Hàng Chính Hãng",
      description: "100% chính hãng",
      color: "#52c41a",
    },
    {
      id: 2,
      icon: <TruckOutlined />,
      title: "Miễn Phí Vận Chuyển",
      description: "Cho đơn từ 500K",
      color: "#1890ff",
    },
    {
      id: 3,
      icon: <SyncOutlined />,
      title: "Đổi Trả Dễ Dàng",
      description: "Trong vòng 7 ngày",
      color: "#fa8c16",
    },
    {
      id: 4,
      icon: <CustomerServiceOutlined />,
      title: "Hỗ Trợ 24/7",
      description: "Tư vấn nhiệt tình",
      color: "#eb2f96",
    },
    {
      id: 5,
      icon: <CreditCardOutlined />,
      title: "Thanh Toán An Toàn",
      description: "Nhiều phương thức",
      color: "#722ed1",
    },
    {
      id: 6,
      icon: <ShieldCheckOutlined />,
      title: "Bảo Hành Chính Hãng",
      description: "Lên đến 24 tháng",
      color: "#13c2c2",
    },
  ];

  return (
    <section className="trust-badges-section">
      <div className="trust-badges-container">
        {badges.map((badge) => (
          <div key={badge.id} className="trust-badge-card">
            <div className="trust-badge-icon" style={{ color: badge.color }}>
              {badge.icon}
            </div>
            <div className="trust-badge-info">
              <h3 className="trust-badge-title">{badge.title}</h3>
              <p className="trust-badge-description">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBadges;
