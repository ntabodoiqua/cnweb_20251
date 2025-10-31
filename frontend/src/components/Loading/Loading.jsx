import { Spin } from "antd";
import "./Loading.css";

const Loading = ({
  fullscreen = false,
  size = "large",
  tip = "Đang tải...",
}) => {
  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <Spin size={size} tip={tip} />
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default Loading;
