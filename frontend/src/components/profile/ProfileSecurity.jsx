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
import LoadingSpinner from "../LoadingSpinner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./ProfileSecurity.module.css";

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
    pageSize: 5,
    total: 0,
  });

  // Load lịch sử đăng nhập khi component mount
  useEffect(() => {
    fetchLoginHistory();
  }, []);

  // Fetch login history
  const fetchLoginHistory = async (page = 1, pageSize = 5) => {
    try {
      setLoadingHistory(true);
      // API page starts from 0, UI page starts from 1
      const res = await getLoginHistoryApi(page - 1, pageSize);

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
        <div className={styles.loginTimeCell}>
          <div className={styles.loginTimePrimary}>
            {dayjs(time).format("DD/MM/YYYY HH:mm:ss")}
          </div>
          <div className={styles.loginTimeRelative}>
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
        <div className={styles.deviceInfoCell}>
          <div className={styles.deviceIconWrapper}>
            {getDeviceIcon(record.userAgent)}
          </div>
          <div className={styles.deviceDetails}>
            <div className={styles.deviceBrowser}>
              {getBrowserName(record.userAgent)}
            </div>
            <div className={styles.deviceOs}>{getOSName(record.userAgent)}</div>
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
        <div className={styles.ipAddressCell}>
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
          className={styles.statusTag}
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
    <div className={styles.profileSecurity}>
      <div className={styles.securityLayout}>
        {/* Left Column: Đổi mật khẩu */}
        <div className={styles.securityLeftColumn}>
          <div className={styles.securitySection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <LockOutlined className={styles.sectionIcon} />
                <div>
                  <h3 className={styles.sectionTitle}>Đổi mật khẩu</h3>
                  <p className={styles.sectionSubtitle}>
                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className={styles.passwordForm}
            >
              {/* Mật khẩu hiện tại */}
              <div className={styles.profileFormGroup}>
                <label className={styles.profileFormLabel}>
                  <LockOutlined />
                  Mật khẩu hiện tại
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    className={`${styles.profileFormInput} ${styles.passwordInput}`}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeOutlined />
                    ) : (
                      <EyeInvisibleOutlined />
                    )}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div className={styles.profileFormGroup}>
                <label className={styles.profileFormLabel}>
                  <SafetyOutlined />
                  Mật khẩu mới
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={`${styles.profileFormInput} ${styles.passwordInput}`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOutlined />
                    ) : (
                      <EyeInvisibleOutlined />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordStrength.strength && (
                  <div className={styles.passwordStrengthContainer}>
                    <div className={styles.passwordStrengthBar}>
                      <div
                        className={styles.passwordStrengthFill}
                        style={{
                          width: `${passwordStrength.score}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      ></div>
                    </div>
                    <div className={styles.passwordStrengthText}>
                      <span>Độ mạnh: </span>
                      <span
                        style={{
                          color: passwordStrength.color,
                          fontWeight: 600,
                        }}
                      >
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className={styles.passwordRequirements}>
                      <div
                        className={`${styles.requirementItem} ${
                          passwordData.newPassword?.length >= 8
                            ? styles.valid
                            : ""
                        }`}
                      >
                        {passwordData.newPassword?.length >= 8 ? "✓" : "○"} Tối
                        thiểu 8 ký tự
                      </div>
                      <div
                        className={`${styles.requirementItem} ${
                          /[a-z]/.test(passwordData.newPassword || "")
                            ? styles.valid
                            : ""
                        }`}
                      >
                        {/[a-z]/.test(passwordData.newPassword || "")
                          ? "✓"
                          : "○"}{" "}
                        Chữ thường
                      </div>
                      <div
                        className={`${styles.requirementItem} ${
                          /[A-Z]/.test(passwordData.newPassword || "")
                            ? styles.valid
                            : ""
                        }`}
                      >
                        {/[A-Z]/.test(passwordData.newPassword || "")
                          ? "✓"
                          : "○"}{" "}
                        Chữ hoa
                      </div>
                      <div
                        className={`${styles.requirementItem} ${
                          /\d/.test(passwordData.newPassword || "")
                            ? styles.valid
                            : ""
                        }`}
                      >
                        {/\d/.test(passwordData.newPassword || "") ? "✓" : "○"}{" "}
                        Số
                      </div>
                      <div
                        className={`${styles.requirementItem} ${
                          /[@$!%*?&#]/.test(passwordData.newPassword || "")
                            ? styles.valid
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
              <div className={styles.profileFormGroup}>
                <label className={styles.profileFormLabel}>
                  <SafetyOutlined />
                  Xác nhận mật khẩu mới
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={`${styles.profileFormInput} ${styles.passwordInput}`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
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
                    <div className={styles.passwordMismatchError}>
                      <CloseCircleOutlined /> Mật khẩu xác nhận không khớp
                    </div>
                  )}
                {passwordData.confirmPassword &&
                  passwordData.newPassword === passwordData.confirmPassword && (
                    <div className={styles.passwordMatchSuccess}>
                      <CheckCircleOutlined /> Mật khẩu khớp
                    </div>
                  )}
              </div>

              {/* Action buttons */}
              <div className={styles.profileFormActions}>
                <button
                  type="submit"
                  className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className={styles.spinner}></span>
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
        </div>

        {/* Right Column: Lịch sử đăng nhập */}
        <div className={styles.securityRightColumn}>
          <div className={styles.securitySection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <HistoryOutlined className={styles.sectionIcon} />
                <div>
                  <h3 className={styles.sectionTitle}>Lịch sử đăng nhập</h3>
                  <p className={styles.sectionSubtitle}>
                    Theo dõi các hoạt động đăng nhập gần đây của tài khoản
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.loginHistoryContent}>
              {loadingHistory ? (
                <LoadingSpinner
                  tip="Đang tải lịch sử đăng nhập..."
                  fullScreen={false}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={loginHistory}
                  rowKey="id"
                  pagination={false}
                  className={styles.loginHistoryTable}
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
              )}

              {/* Custom Pagination */}
              {loginHistory.length > 0 && (
                <div className={styles.tablePagination}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={(page, pageSize) =>
                      fetchLoginHistory(page, pageSize)
                    }
                    onShowSizeChange={(current, size) =>
                      fetchLoginHistory(1, size)
                    }
                    showSizeChanger
                    showTotal={(total) => `Tổng ${total} lần đăng nhập`}
                    pageSizeOptions={[5, 10, 15, 20]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurity;
