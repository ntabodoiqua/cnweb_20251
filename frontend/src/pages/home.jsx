import { CrownOutlined, DownOutlined } from "@ant-design/icons";
import { Result, Button, Dropdown, Space } from "antd";

const HomePage = () => {
  // Demo dropdown items
  const demoMenuItems = [
    {
      key: "1",
      label: "Sản phẩm điện tử",
    },
    {
      key: "2",
      label: "Thời trang",
    },
    {
      key: "3",
      label: "Đồ gia dụng",
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: "Xem tất cả danh mục",
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="JSON Web Token (React/Node.JS) - createdBy @hoidanit"
      />

      {/* Demo Dropdown để test giao diện */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <Dropdown menu={{ items: demoMenuItems }} trigger={["click"]}>
          <Button type="primary" size="large">
            Danh mục sản phẩm <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown menu={{ items: demoMenuItems }}>
          <Button size="large">
            Hover để xem <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          color: "#999",
          fontSize: "14px",
        }}
      >
        <p>
          💡 Tip: Thử click vào menu user ở header để xem dropdown với giao diện
          mới!
        </p>
      </div>
    </div>
  );
};

export default HomePage;
