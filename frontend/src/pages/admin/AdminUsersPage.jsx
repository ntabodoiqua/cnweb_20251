import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  ManOutlined,
  WomanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  getUsersAdminApi,
  softDeleteUserAdminApi,
  enableUserAdminApi,
  disableUserAdminApi,
  recoverUserAdminApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminUsersPage.module.css";

/**
 * AdminUsersPage - Trang quản lý người dùng
 * Hiển thị danh sách người dùng và các thao tác quản lý
 */
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    username: "",
    firstName: "",
    lastName: "",
    enabled: "",
    createdFrom: "",
    createdTo: "",
    role: "",
    gender: "",
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.size, filters.sort]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        enabled:
          filters.enabled === "" ? undefined : filters.enabled === "true",
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getUsersAdminApi(params);

      if (response && response.code === 1000) {
        setUsers(response.result.content || []);
        setTotalElements(response.result.totalElements || 0);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filter changes
    }));
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleResetFilters = () => {
    setFilters({
      username: "",
      firstName: "",
      lastName: "",
      enabled: "",
      createdFrom: "",
      createdTo: "",
      role: "",
      gender: "",
      page: 0,
      size: 10,
      sort: "createdAt,desc",
    });
    setTimeout(() => fetchUsers(), 0);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeClass = (roles) => {
    if (!roles || roles.length === 0) return styles.roleUser;
    const roleNames = roles.map((r) => r.name);
    if (roleNames.includes("ADMIN")) return styles.roleAdmin;
    if (roleNames.includes("SELLER")) return styles.roleSeller;
    return styles.roleUser;
  };

  const getRoleDisplay = (roles) => {
    if (!roles || roles.length === 0) return "USER";
    return roles.map((r) => r.name).join(", ");
  };

  const getStatusBadgeClass = (enabled) => {
    return enabled ? styles.statusActive : styles.statusInactive;
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleDeleteUser = (userId, username) => {
    // Kiểm tra không được xóa admin
    const userToDelete = users.find((u) => u.id === userId);
    const isAdmin = userToDelete?.roles?.some((r) => r.name === "ADMIN");

    if (isAdmin) {
      notification.error({
        message: "Không thể xóa",
        description: "Không thể xóa tài khoản quản trị viên!",
        placement: "topRight",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa tài khoản",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa người dùng <strong>{username}</strong>?
          </p>
          <p style={{ color: "#666", fontSize: "13px" }}>
            Tài khoản sẽ bị đánh dấu xóa và có 30 ngày để khôi phục trước khi bị
            xóa vĩnh viễn.
          </p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await softDeleteUserAdminApi(userId, "Admin action");
          if (response && response.code === 1000) {
            notification.success({
              message: "Thành công",
              description:
                "Đã đánh dấu xóa người dùng. Tài khoản sẽ bị xóa vĩnh viễn sau 30 ngày.",
              placement: "topRight",
            });
            fetchUsers(); // Refresh danh sách
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message || "Không thể xóa người dùng!",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleRecoverUser = (userId, username) => {
    Modal.confirm({
      title: "Xác nhận khôi phục",
      content: `Bạn có chắc chắn muốn khôi phục tài khoản "${username}"?`,
      okText: "Khôi phục",
      cancelText: "Hủy",
      okType: "primary",
      onOk: async () => {
        try {
          const response = await recoverUserAdminApi(userId);
          if (response && response.code === 1000) {
            notification.success({
              message: "Thành công",
              description: "Đã khôi phục tài khoản thành công!",
              placement: "topRight",
            });
            fetchUsers();
          }
        } catch (error) {
          console.error("Error recovering user:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message || "Không thể khôi phục tài khoản!",
            placement: "topRight",
          });
        }
      },
    });
  };

  const handleToggleStatus = (userId, currentStatus, username) => {
    // Kiểm tra không được disable admin
    const userToToggle = users.find((u) => u.id === userId);
    const isAdmin = userToToggle?.roles?.some((r) => r.name === "ADMIN");

    if (isAdmin && currentStatus) {
      notification.error({
        message: "Không thể khóa",
        description: "Không thể khóa tài khoản quản trị viên!",
        placement: "topRight",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có chắc chắn muốn ${
        currentStatus ? "khóa" : "mở khóa"
      } tài khoản "${username}"?`,
      okText: currentStatus ? "Khóa" : "Mở khóa",
      cancelText: "Hủy",
      okType: currentStatus ? "danger" : "primary",
      onOk: async () => {
        try {
          const response = currentStatus
            ? await disableUserAdminApi(userId)
            : await enableUserAdminApi(userId);

          if (response && response.code === 1000) {
            notification.success({
              message: "Thành công",
              description: `${
                currentStatus ? "Khóa" : "Mở khóa"
              } tài khoản thành công!`,
              placement: "topRight",
            });
            fetchUsers(); // Refresh danh sách
          }
        } catch (error) {
          console.error("Error toggling user status:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message ||
              `Không thể ${currentStatus ? "khóa" : "mở khóa"} tài khoản!`,
            placement: "topRight",
          });
        }
      },
    });
  };

  return (
    <div className={styles.adminUsers}>
      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo username..."
              value={filters.username}
              onChange={(e) => handleFilterChange("username", e.target.value)}
              className={styles.adminSearchInput}
            />
          </div>
          <div className={styles.toolbarActions}>
            <button
              className={`admin-btn ${
                showFilters ? "admin-btn-primary" : "admin-btn-secondary"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterOutlined />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
            >
              <ReloadOutlined />
              Đặt lại
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSearch}
            >
              <SearchOutlined />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.adminFilters}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Họ</label>
                <input
                  type="text"
                  placeholder="Nhập họ..."
                  value={filters.firstName}
                  onChange={(e) =>
                    handleFilterChange("firstName", e.target.value)
                  }
                />
              </div>
              <div className={styles.filterItem}>
                <label>Tên</label>
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  value={filters.lastName}
                  onChange={(e) =>
                    handleFilterChange("lastName", e.target.value)
                  }
                />
              </div>
              <div className={styles.filterItem}>
                <label>Trạng thái</label>
                <select
                  value={filters.enabled}
                  onChange={(e) =>
                    handleFilterChange("enabled", e.target.value)
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Khóa</option>
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Vai trò</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SELLER">SELLER</option>
                  <option value="USER">USER</option>
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Giới tính</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Từ ngày</label>
                <input
                  type="datetime-local"
                  value={filters.createdFrom}
                  onChange={(e) =>
                    handleFilterChange("createdFrom", e.target.value)
                  }
                />
              </div>
              <div className={styles.filterItem}>
                <label>Đến ngày</label>
                <input
                  type="datetime-local"
                  value={filters.createdTo}
                  onChange={(e) =>
                    handleFilterChange("createdTo", e.target.value)
                  }
                />
              </div>
              <div className={styles.filterItem}>
                <label>Số kết quả/trang</label>
                <select
                  value={filters.size}
                  onChange={(e) =>
                    handleFilterChange("size", parseInt(e.target.value))
                  }
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách người dùng ({totalElements})
        </h2>
        <div className={styles.adminTableContainer}>
          {loading ? (
            <LoadingSpinner
              tip="Đang tải danh sách người dùng..."
              fullScreen={false}
            />
          ) : (
            <table className={`admin-table ${styles.adminTable}`}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Giới tính</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Xác thực</th>
                  <th>Ngày tạo</th>
                  <th className={styles.stickyColumn}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userInfo}>
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className={styles.userAvatar}
                            />
                          ) : (
                            <div className={styles.userAvatarPlaceholder}>
                              <UserOutlined />
                            </div>
                          )}
                          <strong>{user.username}</strong>
                        </div>
                      </td>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td>
                        <span className={styles.genderBadge}>
                          {user.gender === "MALE" && (
                            <ManOutlined style={{ color: "#1890ff" }} />
                          )}
                          {user.gender === "FEMALE" && (
                            <WomanOutlined style={{ color: "#ff4d4f" }} />
                          )}
                          {user.gender === "MALE"
                            ? " Nam"
                            : user.gender === "FEMALE"
                            ? " Nữ"
                            : " Khác"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rolesContainer}>
                          {user.roles &&
                            user.roles.map((role) => (
                              <span
                                key={role.name}
                                className={`${
                                  styles.roleBadge
                                } ${getRoleBadgeClass([role])}`}
                              >
                                {role.name}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${
                            styles.statusBadge
                          } ${getStatusBadgeClass(user.enabled)}`}
                          title={user.enabled ? "Hoạt động" : "Khóa"}
                        >
                          {user.enabled ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CloseCircleOutlined />
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.verifyBadge} ${
                            user.isVerified
                              ? styles.verified
                              : styles.unverified
                          }`}
                          title={
                            user.isVerified
                              ? "Đã xác thực email"
                              : "Chưa xác thực email"
                          }
                        >
                          {user.isVerified ? (
                            <CheckOutlined />
                          ) : (
                            <CloseOutlined />
                          )}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className={styles.stickyColumn}>
                        <div className={styles.adminActionButtons}>
                          <button
                            className={`${styles.adminActionBtn} ${styles.view}`}
                            title="Xem chi tiết"
                            onClick={() => handleViewUser(user)}
                          >
                            <EyeOutlined />
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.edit}`}
                            title="Chỉnh sửa"
                          >
                            <EditOutlined />
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.lock}`}
                            title={
                              user.enabled
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                user.id,
                                user.enabled,
                                user.username
                              )
                            }
                          >
                            {user.enabled ? (
                              <LockOutlined />
                            ) : (
                              <UnlockOutlined />
                            )}
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.delete}`}
                            title="Xóa"
                            onClick={() =>
                              handleDeleteUser(user.id, user.username)
                            }
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className={styles.adminEmptyState}>
                        <UserOutlined
                          style={{ fontSize: "64px", color: "#ddd" }}
                        />
                        <p>Không tìm thấy người dùng nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className={styles.adminPagination}>
            <button
              className="admin-btn admin-btn-secondary"
              disabled={filters.page === 0}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              ← Trước
            </button>
            <span className={styles.paginationInfo}>
              Trang {filters.page + 1} / {totalPages}
            </span>
            <button
              className="admin-btn admin-btn-secondary"
              disabled={filters.page >= totalPages - 1}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Sau →
            </button>

            <div className={styles.pageSizeSelector}>
              <label>Hiển thị:</label>
              <select
                value={filters.size}
                onChange={(e) =>
                  handleFilterChange("size", parseInt(e.target.value))
                }
                className={styles.pageSizeSelect}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>kết quả/trang</span>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowUserDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết người dùng</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowUserDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userDetail}>
                <div className={styles.userDetailAvatar}>
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.username}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholderLarge}>
                      <UserOutlined />
                    </div>
                  )}
                </div>
                <div className={styles.userDetailInfo}>
                  <div className={styles.infoRow}>
                    <label>Username:</label>
                    <span>{selectedUser.username}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Họ và tên:</label>
                    <span>{`${selectedUser.firstName} ${selectedUser.lastName}`}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Điện thoại:</label>
                    <span>{selectedUser.phone || "N/A"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày sinh:</label>
                    <span>{selectedUser.dob || "N/A"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Giới tính:</label>
                    <span>
                      {selectedUser.gender === "MALE"
                        ? "Nam"
                        : selectedUser.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Vai trò:</label>
                    <span>{getRoleDisplay(selectedUser.roles)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Trạng thái:</label>
                    <span>{selectedUser.enabled ? "Hoạt động" : "Khóa"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Xác thực email:</label>
                    <span>
                      {selectedUser.isVerified
                        ? "Đã xác thực"
                        : "Chưa xác thực"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Cập nhật lần cuối:</label>
                    <span>{formatDate(selectedUser.updatedAt)}</span>
                  </div>

                  {selectedUser.addresses &&
                    selectedUser.addresses.length > 0 && (
                      <div className={styles.infoRow}>
                        <label>Địa chỉ:</label>
                        <div className={styles.addressesList}>
                          {selectedUser.addresses.map((addr) => (
                            <div key={addr.id} className={styles.addressItem}>
                              <div>
                                <strong>{addr.receiverName}</strong> -{" "}
                                {addr.receiverPhone}
                              </div>
                              <div>
                                {addr.street}, {addr.ward.nameWithType}
                              </div>
                              {addr.isDefault && (
                                <span className={styles.defaultBadge}>
                                  Mặc định
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
