import { useState, useEffect, useRef } from "react";
import {
  ShopOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  getSellerProfilesAdminApi,
  approveSellerProfileApi,
  rejectSellerProfileApi,
  getUserByIdAdminApi,
  getSellerDocumentAdminApi,
} from "../../util/api";
import { notification, Modal } from "antd";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminSellerProfilesPage.module.css";

/**
 * AdminSellerProfilesPage - Trang quản lý hồ sơ người bán
 * Hiển thị danh sách hồ sơ người bán và các thao tác phê duyệt/từ chối
 */
const AdminSellerProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    verificationStatus: "",
    page: 0,
    size: 10,
    sort: "createdAt,desc", // Mặc định sắp xếp theo ngày tạo mới nhất
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [profileToReject, setProfileToReject] = useState(null);

  // Ref để theo dõi khi cần scroll lên đầu
  const shouldScrollToTop = useRef(false);

  // Fetch profiles from API
  useEffect(() => {
    fetchProfiles();
  }, [filters.page, filters.size, filters.verificationStatus, filters.sort]);

  // Scroll lên đầu sau khi loading hoàn tất
  useEffect(() => {
    if (!loading && shouldScrollToTop.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      shouldScrollToTop.current = false;
    }
  }, [loading]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getSellerProfilesAdminApi(params);

      if (response && response.code === 1000) {
        setProfiles(response.result.content || []);
        setTotalElements(response.result.totalElements || 0);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching seller profiles:", error);
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
    fetchProfiles();
  };

  const handleResetFilters = () => {
    setFilters({
      verificationStatus: "",
      page: 0,
      size: 10,
      sort: "createdAt,desc",
    });
    setTimeout(() => fetchProfiles(), 0);
  };

  const handlePageChange = (newPage) => {
    shouldScrollToTop.current = true;
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      CREATED: {
        icon: <ClockCircleOutlined />,
        label: "Mới tạo",
        className: styles.statusCreated,
      },
      PENDING: {
        icon: <ClockCircleOutlined />,
        label: "Đang chờ duyệt",
        className: styles.statusPending,
      },
      VERIFIED: {
        icon: <CheckCircleOutlined />,
        label: "Đã duyệt",
        className: styles.statusVerified,
      },
      REJECTED: {
        icon: <CloseCircleOutlined />,
        label: "Đã từ chối",
        className: styles.statusRejected,
      },
    };

    const config = statusConfig[status] || statusConfig.CREATED;
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const handleViewProfile = async (profile) => {
    setSelectedProfile(profile);
    setSelectedUserInfo(null);
    setDocumentInfo(null);
    setShowProfileDetail(true);

    // Fetch user info by userId
    if (profile.userId) {
      try {
        setUserInfoLoading(true);
        const response = await getUserByIdAdminApi(profile.userId);
        if (response && response.code === 1000) {
          setSelectedUserInfo(response.result);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setUserInfoLoading(false);
      }
    }

    // Fetch document info if profile has document
    if (profile.documentName) {
      try {
        setDocumentLoading(true);
        const response = await getSellerDocumentAdminApi(profile.id);
        if (response && response.code === 1000) {
          setDocumentInfo(response.result);
        }
      } catch (error) {
        console.error("Error fetching document info:", error);
      } finally {
        setDocumentLoading(false);
      }
    }
  };

  const handleViewDocument = () => {
    if (documentInfo?.fileUrl) {
      window.open(documentInfo.fileUrl, "_blank");
    }
  };

  const handleApprove = async (profileId) => {
    Modal.confirm({
      title: "Xác nhận phê duyệt",
      content: "Bạn có chắc chắn muốn phê duyệt hồ sơ này?",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      okType: "primary",
      onOk: async () => {
        try {
          setActionLoading(true);
          const response = await approveSellerProfileApi(profileId);
          if (response && response.code === 1000) {
            notification.success({
              message: "Thành công",
              description: "Phê duyệt hồ sơ thành công!",
              placement: "topRight",
            });
            fetchProfiles();
            setShowProfileDetail(false);
          }
        } catch (error) {
          console.error("Error approving profile:", error);
          notification.error({
            message: "Lỗi",
            description: "Có lỗi xảy ra khi phê duyệt hồ sơ!",
            placement: "topRight",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const openRejectModal = (profile) => {
    setProfileToReject(profile);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng nhập lý do từ chối!",
        placement: "topRight",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await rejectSellerProfileApi(
        profileToReject.id,
        rejectionReason
      );
      if (response && response.code === 1000) {
        notification.success({
          message: "Thành công",
          description: "Từ chối hồ sơ thành công!",
          placement: "topRight",
        });
        fetchProfiles();
        setShowRejectModal(false);
        setShowProfileDetail(false);
        setProfileToReject(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Error rejecting profile:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi từ chối hồ sơ!",
        placement: "topRight",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const canApprove = (status) => {
    return status === "PENDING";
  };

  const canReject = (status) => {
    return status === "PENDING";
  };

  return (
    <div className={styles.adminSellerProfiles}>
      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <select
              value={filters.verificationStatus}
              onChange={(e) =>
                handleFilterChange("verificationStatus", e.target.value)
              }
              className={styles.adminSearchSelect}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CREATED">Mới tạo</option>
              <option value="PENDING">Đang chờ duyệt</option>
              <option value="VERIFIED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
          <div className={styles.adminSearchBox}>
            <CalendarOutlined className={styles.searchIcon} />
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className={styles.adminSearchSelect}
            >
              <option value="createdAt,desc">Ngày tạo: Mới nhất</option>
              <option value="createdAt,asc">Ngày tạo: Cũ nhất</option>
              <option value="updatedAt,desc">Cập nhật: Mới nhất</option>
              <option value="updatedAt,asc">Cập nhật: Cũ nhất</option>
            </select>
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

      {/* Profiles Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách hồ sơ người bán ({totalElements})
        </h2>
        <div className={styles.adminTableContainer}>
          {loading ? (
            <LoadingSpinner
              tip="Đang tải danh sách hồ sơ..."
              fullScreen={false}
            />
          ) : (
            <table className={`admin-table ${styles.adminTable}`}>
              <thead>
                <tr>
                  <th>Tên cửa hàng</th>
                  <th>Email liên hệ</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Tài liệu</th>
                  <th>Ngày tạo</th>
                  <th className={styles.stickyColumn}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td>
                        <div className={styles.storeInfo}>
                          {profile.logoUrl ? (
                            <img
                              src={profile.logoUrl}
                              alt={profile.storeName}
                              className={styles.storeLogo}
                            />
                          ) : (
                            <div className={styles.storeLogoPlaceholder}>
                              <ShopOutlined />
                            </div>
                          )}
                          <div>
                            <strong>{profile.storeName}</strong>
                            <div className={styles.storeDescription}>
                              {profile.storeDescription?.substring(0, 50)}
                              {profile.storeDescription?.length > 50
                                ? "..."
                                : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{profile.contactEmail}</td>
                      <td>{profile.contactPhone}</td>
                      <td>
                        <div className={styles.addressInfo}>
                          <span>{profile.shopAddress}</span>
                          {profile.ward && (
                            <span className={styles.wardInfo}>
                              {profile.ward.pathWithType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{getStatusBadge(profile.verificationStatus)}</td>
                      <td>
                        {profile.documentName ? (
                          <span
                            className={styles.documentBadge}
                            title={profile.documentName}
                          >
                            <FileTextOutlined />
                            <span>Có tài liệu</span>
                          </span>
                        ) : (
                          <span className={styles.noDocument}>
                            Chưa có tài liệu
                          </span>
                        )}
                      </td>
                      <td>{formatDate(profile.createdAt)}</td>
                      <td className={styles.stickyColumn}>
                        <div className={styles.adminActionButtons}>
                          <button
                            className={`${styles.adminActionBtn} ${styles.view}`}
                            title="Xem chi tiết"
                            onClick={() => handleViewProfile(profile)}
                          >
                            <EyeOutlined />
                          </button>
                          {canApprove(profile.verificationStatus) && (
                            <button
                              className={`${styles.adminActionBtn} ${styles.approve}`}
                              title="Phê duyệt"
                              onClick={() => handleApprove(profile.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircleOutlined />
                            </button>
                          )}
                          {canReject(profile.verificationStatus) && (
                            <button
                              className={`${styles.adminActionBtn} ${styles.reject}`}
                              title="Từ chối"
                              onClick={() => openRejectModal(profile)}
                              disabled={actionLoading}
                            >
                              <CloseCircleOutlined />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className={styles.adminEmptyState}>
                        <ShopOutlined
                          style={{ fontSize: "64px", color: "#ddd" }}
                        />
                        <p>Không tìm thấy hồ sơ người bán nào</p>
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

      {/* Profile Detail Modal */}
      {showProfileDetail && selectedProfile && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowProfileDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết hồ sơ người bán</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowProfileDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.profileDetail}>
                {/* Store Header */}
                <div className={styles.profileHeader}>
                  <div className={styles.profileAvatar}>
                    {selectedProfile.logoUrl ? (
                      <img
                        src={selectedProfile.logoUrl}
                        alt={selectedProfile.storeName}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholderLarge}>
                        <ShopOutlined />
                      </div>
                    )}
                  </div>
                  <div className={styles.profileHeaderInfo}>
                    <h4>{selectedProfile.storeName}</h4>
                    {getStatusBadge(selectedProfile.verificationStatus)}
                  </div>
                </div>

                {/* Profile Info */}
                <div className={styles.profileInfo}>
                  {/* User Info Section */}
                  <div className={styles.userInfoSection}>
                    <h5 className={styles.sectionTitle}>
                      <UserOutlined /> Thông tin người dùng
                    </h5>
                    {userInfoLoading ? (
                      <div className={styles.userInfoLoading}>
                        Đang tải thông tin người dùng...
                      </div>
                    ) : selectedUserInfo ? (
                      <div className={styles.userInfoContent}>
                        <div className={styles.userInfoRow}>
                          <div className={styles.userAvatar}>
                            {selectedUserInfo.avatarUrl ? (
                              <img
                                src={selectedUserInfo.avatarUrl}
                                alt={selectedUserInfo.username}
                              />
                            ) : (
                              <div className={styles.userAvatarPlaceholder}>
                                <UserOutlined />
                              </div>
                            )}
                          </div>
                          <div className={styles.userDetails}>
                            <div className={styles.userName}>
                              {selectedUserInfo.firstName}{" "}
                              {selectedUserInfo.lastName}
                            </div>
                            <div className={styles.userUsername}>
                              @{selectedUserInfo.username}
                            </div>
                            <div className={styles.userEmail}>
                              {selectedUserInfo.email}
                            </div>
                            {selectedUserInfo.phone && (
                              <div className={styles.userPhone}>
                                {selectedUserInfo.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.userInfoError}>
                        Không thể tải thông tin người dùng
                      </div>
                    )}
                  </div>

                  <div className={styles.infoRow}>
                    <label>
                      <ShopOutlined /> Mô tả cửa hàng:
                    </label>
                    <span>
                      {selectedProfile.storeDescription || "Chưa có mô tả"}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <label>
                      <MailOutlined /> Email liên hệ:
                    </label>
                    <span>{selectedProfile.contactEmail}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <label>
                      <PhoneOutlined /> Số điện thoại:
                    </label>
                    <span>{selectedProfile.contactPhone}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <label>
                      <EnvironmentOutlined /> Địa chỉ:
                    </label>
                    <span>
                      {selectedProfile.shopAddress}
                      {selectedProfile.ward && (
                        <div className={styles.wardDetailInfo}>
                          {selectedProfile.ward.pathWithType}
                        </div>
                      )}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <label>
                      <CalendarOutlined /> Ngày tạo:
                    </label>
                    <span>{formatDate(selectedProfile.createdAt)}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <label>
                      <CalendarOutlined /> Cập nhật lần cuối:
                    </label>
                    <span>{formatDate(selectedProfile.updatedAt)}</span>
                  </div>

                  {selectedProfile.documentName && (
                    <div className={styles.infoRow}>
                      <label>
                        <FileTextOutlined /> Tài liệu:
                      </label>
                      <span className={styles.documentInfo}>
                        <div className={styles.documentNameText}>
                          {selectedProfile.documentName}
                        </div>
                        <div className={styles.documentUploadTime}>
                          Tải lên:{" "}
                          {formatDate(selectedProfile.documentUploadedAt)}
                        </div>
                        {documentLoading ? (
                          <div className={styles.documentLoadingText}>
                            Đang tải link tài liệu...
                          </div>
                        ) : documentInfo?.fileUrl ? (
                          <button
                            className={styles.viewDocumentBtn}
                            onClick={handleViewDocument}
                          >
                            <EyeOutlined />
                            Xem tài liệu
                          </button>
                        ) : null}
                      </span>
                    </div>
                  )}

                  {selectedProfile.verificationStatus === "VERIFIED" && (
                    <div className={styles.infoRow}>
                      <label>
                        <CheckCircleOutlined /> Ngày phê duyệt:
                      </label>
                      <span className={styles.approvedInfo}>
                        {formatDate(selectedProfile.approvedAt)}
                      </span>
                    </div>
                  )}

                  {selectedProfile.verificationStatus === "REJECTED" && (
                    <>
                      <div className={styles.infoRow}>
                        <label>
                          <CloseCircleOutlined /> Ngày từ chối:
                        </label>
                        <span className={styles.rejectedInfo}>
                          {formatDate(selectedProfile.rejectedAt)}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <label>
                          <ExclamationCircleOutlined /> Lý do từ chối:
                        </label>
                        <span className={styles.rejectionReason}>
                          {selectedProfile.rejectionReason}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {(canApprove(selectedProfile.verificationStatus) ||
                  canReject(selectedProfile.verificationStatus)) && (
                  <div className={styles.profileActions}>
                    {canApprove(selectedProfile.verificationStatus) && (
                      <button
                        className={`admin-btn admin-btn-success ${styles.actionBtnLarge}`}
                        onClick={() => handleApprove(selectedProfile.id)}
                        disabled={actionLoading}
                      >
                        <CheckCircleOutlined />
                        Phê duyệt hồ sơ
                      </button>
                    )}
                    {canReject(selectedProfile.verificationStatus) && (
                      <button
                        className={`admin-btn admin-btn-danger ${styles.actionBtnLarge}`}
                        onClick={() => openRejectModal(selectedProfile)}
                        disabled={actionLoading}
                      >
                        <CloseCircleOutlined />
                        Từ chối hồ sơ
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && profileToReject && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className={styles.modalContentSmall}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Từ chối hồ sơ</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.rejectForm}>
                <p className={styles.rejectWarning}>
                  <ExclamationCircleOutlined />
                  Bạn đang từ chối hồ sơ của cửa hàng:{" "}
                  <strong>{profileToReject.storeName}</strong>
                </p>
                <div className={styles.formGroup}>
                  <label>Lý do từ chối *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối hồ sơ..."
                    rows={4}
                    className={styles.rejectTextarea}
                  />
                </div>
                <div className={styles.rejectActions}>
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowRejectModal(false)}
                    disabled={actionLoading}
                  >
                    Hủy
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason.trim()}
                  >
                    {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerProfilesPage;
