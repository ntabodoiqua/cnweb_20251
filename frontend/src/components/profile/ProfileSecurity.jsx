import { useState, useEffect } from "react";
import {
  LockOutlined,
  SafetyOutlined,
  HistoryOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { notification, Table, Tag, Tooltip, Empty, Pagination } from "antd";
import { changePasswordApi, getLoginHistoryApi } from "../../util/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const ProfileSecurity = () => {
  // State cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    score: 0,
    color: "",
  });

  // State cho lịch sử đăng nhập
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load lịch sử đăng nhập khi component mount
  useEffect(() => {
    fetchLoginHistory();
  }, []);

  // Fetch login history
  const fetchLoginHistory = async (page = 1, pageSize = 10) => {
    try {
      setLoadingHistory(true);
      const res = await getLoginHistoryApi();

      if (res && res.code === 1000) {
        setLoginHistory(res.result.content || []);
        setPagination({
          current: res.result.number + 1,
          pageSize: res.result.size,
          total: res.result.totalElements,
        });
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
      notification.error({
        message: "Lỗi tải lịch sử đăng nhập",
        description: "Không thể tải lịch sử đăng nhập, vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Tính độ mạnh mật khẩu
  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { strength: "", score: 0, color: "" };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    if (checks.length) score += 20;
    if (password.length >= 12) score += 10;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 15;
    if (checks.special) score += 15;

    let strength = "";
    let color = "";

    if (score < 40) {
      strength = "Yếu";
      color = "#ff4d4f";
    } else if (score < 60) {
      strength = "Trung bình";
      color = "#faad14";
    } else if (score < 80) {
      strength = "Khá mạnh";
      color = "#52c41a";
    } else {
      strength = "Rất mạnh";
      color = "#389e0d";
    }

    return { strength, score, color };
  };

  // Validate mật khẩu
  const validatePassword = (password) => {
    const errors = [];

    if (!password) {
      errors.push("Vui lòng nhập mật khẩu");
      return errors;
    }

    if (password.length < 8) {
      errors.push("Mật khẩu phải có ít nhất 8 ký tự");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 số");
    }

    if (!/(?=.*[@$!%*?&#])/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)");
    }

    return errors;
  };

  // Handle input change
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate password strength for new password
    if (name === "newPassword") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = passwordData;

    // Validation
    if (!oldPassword) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập mật khẩu hiện tại!",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      notification.error({
        message: "Mật khẩu không hợp lệ",
        description: passwordErrors[0],
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      notification.error({
        message: "Lỗi",
        description: "Mật khẩu xác nhận không khớp!",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (oldPassword === newPassword) {
      notification.error({
        message: "Lỗi",
        description: "Mật khẩu mới phải khác mật khẩu hiện tại!",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await changePasswordApi(oldPassword, newPassword);

      if (res && res.code === 1000) {
        notification.success({
          message: "Thành công",
          description: "Đổi mật khẩu thành công!",
          placement: "topRight",
          duration: 3,
        });

        // Reset form
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength({ strength: "", score: 0, color: "" });
      } else {
        notification.error({
          message: "Đổi mật khẩu thất bại",
          description: res.message || "Vui lòng thử lại sau.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      notification.error({
        message: "Đổi mật khẩu thất bại",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra, vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Detect device type from user agent
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <DesktopOutlined />;

    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <MobileOutlined />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <TabletOutlined />;
    }
    return <DesktopOutlined />;
  };

  // Get browser name from user agent
  const getBrowserName = (userAgent) => {
    if (!userAgent) return "Unknown";

    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari")) return "Safari";
    if (ua.includes("edge")) return "Edge";
    if (ua.includes("opera")) return "Opera";
    return "Unknown Browser";
  };

  // Get OS name from user agent
  const getOSName = (userAgent) => {
    if (!userAgent) return "Unknown";

    const ua = userAgent.toLowerCase();
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("mac")) return "macOS";
    if (ua.includes("linux")) return "Linux";
    if (ua.includes("android")) return "Android";
    if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
    return "Unknown OS";
  };

  // Columns for login history table
  const columns = [
    {
      title: "Thời gian",
      dataIndex: "loginTime",
      key: "loginTime",
      width: "20%",
      render: (time) => (
        <div className="login-time-cell">
          <div className="login-time-primary">
            {dayjs(time).format("DD/MM/YYYY HH:mm:ss")}
          </div>
          <div className="login-time-relative">
            <ClockCircleOutlined /> {dayjs(time).fromNow()}
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.loginTime).unix() - dayjs(b.loginTime).unix(),
    },
    {
      title: "Thiết bị & Trình duyệt",
      key: "device",
      width: "25%",
      render: (_, record) => (
        <div className="device-info-cell">
          <div className="device-icon-wrapper">
            {getDeviceIcon(record.userAgent)}
          </div>
          <div className="device-details">
            <div className="device-browser">
              {getBrowserName(record.userAgent)}
            </div>
            <div className="device-os">{getOSName(record.userAgent)}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: "20%",
      render: (ip) => (
        <div className="ip-address-cell">
          <EnvironmentOutlined /> {ip ? ip.split(",")[0] : "N/A"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag
          icon={
            status === "SUCCESS" ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={status === "SUCCESS" ? "success" : "error"}
          className="status-tag"
        >
          {status === "SUCCESS" ? "Thành công" : "Thất bại"}
        </Tag>
      ),
      filters: [
        { text: "Thành công", value: "SUCCESS" },
        { text: "Thất bại", value: "FAILED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <div className="profile-security">
      {/* Section 1: Đổi mật khẩu */}
      <div className="security-section change-password-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <LockOutlined className="section-icon" />
            <div>
              <h3 className="section-title">Đổi mật khẩu</h3>
              <p className="section-subtitle">
                Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="password-form">
          {/* Mật khẩu hiện tại */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <LockOutlined />
              Mật khẩu hiện tại
              <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordInputChange}
                className="profile-form-input password-input"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <SafetyOutlined />
              Mật khẩu mới
              <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                className="profile-form-input password-input"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength.strength && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  ></div>
                </div>
                <div className="password-strength-text">
                  <span>Độ mạnh mật khẩu: </span>
                  <span
                    style={{ color: passwordStrength.color, fontWeight: 600 }}
                  >
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className="password-requirements">
                  <div
                    className={`requirement-item ${
                      passwordData.newPassword?.length >= 8 ? "valid" : ""
                    }`}
                  >
                    {passwordData.newPassword?.length >= 8 ? "✓" : "○"} Tối
                    thiểu 8 ký tự
                  </div>
                  <div
                    className={`requirement-item ${
                      /[a-z]/.test(passwordData.newPassword || "")
                        ? "valid"
                        : ""
                    }`}
                  >
                    {/[a-z]/.test(passwordData.newPassword || "") ? "✓" : "○"}{" "}
                    Chữ thường
                  </div>
                  <div
                    className={`requirement-item ${
                      /[A-Z]/.test(passwordData.newPassword || "")
                        ? "valid"
                        : ""
                    }`}
                  >
                    {/[A-Z]/.test(passwordData.newPassword || "") ? "✓" : "○"}{" "}
                    Chữ hoa
                  </div>
                  <div
                    className={`requirement-item ${
                      /\d/.test(passwordData.newPassword || "") ? "valid" : ""
                    }`}
                  >
                    {/\d/.test(passwordData.newPassword || "") ? "✓" : "○"} Số
                  </div>
                  <div
                    className={`requirement-item ${
                      /[@$!%*?&#]/.test(passwordData.newPassword || "")
                        ? "valid"
                        : ""
                    }`}
                  >
                    {/[@$!%*?&#]/.test(passwordData.newPassword || "")
                      ? "✓"
                      : "○"}{" "}
                    Ký tự đặc biệt
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="profile-form-group">
            <label className="profile-form-label">
              <SafetyOutlined />
              Xác nhận mật khẩu mới
              <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                className="profile-form-input password-input"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOutlined />
                ) : (
                  <EyeInvisibleOutlined />
                )}
              </button>
            </div>
            {passwordData.confirmPassword &&
              passwordData.newPassword !== passwordData.confirmPassword && (
                <div className="password-mismatch-error">
                  <CloseCircleOutlined /> Mật khẩu xác nhận không khớp
                </div>
              )}
            {passwordData.confirmPassword &&
              passwordData.newPassword === passwordData.confirmPassword && (
                <div className="password-match-success">
                  <CheckCircleOutlined /> Mật khẩu khớp
                </div>
              )}
          </div>

          {/* Action buttons */}
          <div className="profile-form-actions">
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <span className="spinner"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <SafetyOutlined />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Lịch sử đăng nhập */}
      <div className="security-section login-history-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <HistoryOutlined className="section-icon" />
            <div>
              <h3 className="section-title">Lịch sử đăng nhập</h3>
              <p className="section-subtitle">
                Theo dõi các hoạt động đăng nhập gần đây của tài khoản
              </p>
            </div>
          </div>
        </div>

        <div className="login-history-content">
          <Table
            columns={columns}
            dataSource={loginHistory}
            loading={loadingHistory}
            rowKey="id"
            pagination={false}
            className="login-history-table"
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có lịch sử đăng nhập"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            scroll={{ x: 800 }}
          />

          {/* Custom Pagination */}
          {loginHistory.length > 0 && (
            <div className="table-pagination">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={(page, pageSize) => fetchLoginHistory(page, pageSize)}
                showSizeChanger
                showTotal={(total) => `Tổng ${total} lần đăng nhập`}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurity;
