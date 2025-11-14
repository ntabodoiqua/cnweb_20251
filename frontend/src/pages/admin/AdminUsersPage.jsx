import { useState } from "react";
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

/**
 * AdminUsersPage - Trang quản lý người dùng
 * Hiển thị danh sách người dùng và các thao tác quản lý
 */
const AdminUsersPage = () => {
  // Mock data - sẽ thay thế bằng API sau
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "nguyenvana",
      email: "nguyenvana@example.com",
      fullName: "Nguyễn Văn A",
      role: "USER",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2024-11-14 09:30",
    },
    {
      id: 2,
      username: "tranthib",
      email: "tranthib@example.com",
      fullName: "Trần Thị B",
      role: "SELLER",
      status: "active",
      createdAt: "2024-02-20",
      lastLogin: "2024-11-14 08:15",
    },
    {
      id: 3,
      username: "levanc",
      email: "levanc@example.com",
      fullName: "Lê Văn C",
      role: "USER",
      status: "inactive",
      createdAt: "2024-03-10",
      lastLogin: "2024-11-10 15:20",
    },
    {
      id: 4,
      username: "phamthid",
      email: "phamthid@example.com",
      fullName: "Phạm Thị D",
      role: "SELLER",
      status: "active",
      createdAt: "2024-04-05",
      lastLogin: "2024-11-14 10:45",
    },
    {
      id: 5,
      username: "hoangvane",
      email: "hoangvane@example.com",
      fullName: "Hoàng Văn E",
      role: "USER",
      status: "active",
      createdAt: "2024-05-12",
      lastLogin: "2024-11-13 16:30",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "role-admin";
      case "SELLER":
        return "role-seller";
      case "USER":
        return "role-user";
      default:
        return "";
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === "active" ? "status-active" : "status-inactive";
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      // TODO: Call API to delete user
      console.log("Delete user:", userId);
    }
  };

  const handleToggleStatus = (userId) => {
    // TODO: Call API to toggle user status
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    );
  };

  return (
    <div className="admin-users">
      {/* Search and Filter */}
      <div className="admin-section">
        <div className="admin-toolbar">
          <div className="admin-search-box">
            <SearchOutlined className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <button className="admin-btn admin-btn-primary">
            <UserOutlined />
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          Danh sách người dùng ({filteredUsers.length})
        </h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Đăng nhập lần cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>#{user.id}</strong>
                    </td>
                    <td>{user.username}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`role-badge ${getRoleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          user.status
                        )}`}
                      >
                        {user.status === "active"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </td>
                    <td>{user.createdAt}</td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-action-btn edit"
                          title="Chỉnh sửa"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          className="admin-action-btn lock"
                          title={
                            user.status === "active"
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === "active" ? (
                            <LockOutlined />
                          ) : (
                            <UnlockOutlined />
                          )}
                        </button>
                        <button
                          className="admin-action-btn delete"
                          title="Xóa"
                          onClick={() => handleDeleteUser(user.id)}
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
                    colSpan="9"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div className="admin-empty-state">
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
        </div>
      </div>

      <style jsx>{`
        .admin-users {
          animation: fadeIn 0.5s ease-out;
        }

        .admin-section {
          margin-bottom: 24px;
        }

        .admin-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-section-title::before {
          content: "";
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
          border-radius: 2px;
        }

        .admin-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .admin-search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 16px;
        }

        .admin-search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }

        .admin-search-input:focus {
          border-color: #ee4d2d;
          box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .role-badge,
        .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          text-transform: uppercase;
        }

        .role-admin {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .role-seller {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .role-user {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .status-active {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-inactive {
          background: rgba(0, 0, 0, 0.1);
          color: #666;
        }

        .admin-action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .admin-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .admin-action-btn.edit {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .admin-action-btn.edit:hover {
          background: #1890ff;
          color: white;
          transform: scale(1.1);
        }

        .admin-action-btn.lock {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .admin-action-btn.lock:hover {
          background: #faad14;
          color: white;
          transform: scale(1.1);
        }

        .admin-action-btn.delete {
          background: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }

        .admin-action-btn.delete:hover {
          background: #ff4d4f;
          color: white;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .admin-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-search-box {
            max-width: 100%;
          }

          .admin-toolbar .admin-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsersPage;
