import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Input,
  Select,
  DatePicker,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Badge,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ShopOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  FileOutlined,
  CalendarOutlined,
  DownloadOutlined,
  LinkOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useScrollToTop from "../../hooks/useScrollToTop";
import {
  getAllSellerProfilesApi,
  approveSellerProfileApi,
  rejectSellerProfileApi,
  getSellerDocumentApi,
} from "../../util/api";
import "./seller-management.css";
import "./admin-dashboard.css";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SellerManagement = () => {
  useScrollToTop();

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch sellers from API
  useEffect(() => {
    fetchSellers();
  }, [filterStatus, pagination.current, pagination.pageSize]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      // Map frontend status to backend verificationStatus
      let apiStatus = null;
      if (filterStatus === "pending") {
        apiStatus = "CREATED";
      } else if (filterStatus === "approved") {
        apiStatus = "VERIFIED";
      } else if (filterStatus === "rejected") {
        apiStatus = "REJECTED";
      }
      
      const response = await getAllSellerProfilesApi(
        apiStatus,
        pagination.current - 1,
        pagination.pageSize
      );

      console.log("✅ API Response:", response);
      console.log("✅ Response data:", response.data);
      console.log("✅ Response result:", response.data?.result);

      if (response && response.result) {
        const { content, totalElements } = response.result;
        
        // Transform API data to match component structure
        const transformedData = content.map((item) => {
          // Map verificationStatus to our status field
          let status = 'pending';
          if (item.verificationStatus === 'VERIFIED') {
            status = 'approved';
          } else if (item.verificationStatus === 'REJECTED') {
            status = 'rejected';
          } else if (item.verificationStatus === 'CREATED') {
            status = 'pending';
          }

          // Format address from ward information
          let fullAddress = item.shopAddress || "";
          if (item.ward) {
            const addressParts = [
              item.shopAddress,
              item.ward.pathWithType || 
              [item.ward.name, item.ward.district?.name, item.ward.province?.name]
                .filter(Boolean)
                .join(", ")
            ].filter(Boolean);
            fullAddress = addressParts.join(", ");
          }

          return {
            id: item.id,
            fullName: item.userId || "N/A", // API doesn't return user full name
            email: item.contactEmail,
            phone: item.contactPhone,
            shopName: item.storeName,
            productCategory: "Chưa xác định", // API doesn't have business type
            note: item.storeDescription || "",
            status: status,
            submittedDate: item.createdAt?.split("T")[0] || "",
            reviewedDate: item.approvedAt?.split("T")[0] || item.rejectedAt?.split("T")[0] || null,
            reviewedBy: null, // API doesn't provide this field
            // Additional detailed fields
            shopAddress: fullAddress,
            ward: item.ward,
            documentName: item.documentName,
            documentUploadedAt: item.documentUploadedAt?.split("T")[0] || null,
            isActive: item.isActive,
            logoUrl: item.logoUrl,
            bannerUrl: item.bannerUrl,
            rawData: item, // Keep raw data for reference
          };
        });

        console.log("✅ Transformed data:", transformedData);
        console.log("✅ Total elements:", totalElements);

        setSellers(transformedData);
        setPagination((prev) => ({
          ...prev,
          total: totalElements,
        }));
      } else {
        console.error("❌ No result in response.data");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      message.error("Không thể tải danh sách người bán. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const statistics = {
    total: sellers.length,
    pending: sellers.filter((s) => s.status === "pending").length,
    approved: sellers.filter((s) => s.status === "approved").length,
    rejected: sellers.filter((s) => s.status === "rejected").length,
  };

  // View seller details
  const handleViewDetails = (seller) => {
    setSelectedSeller(seller);
    setIsModalVisible(true);
  };

  const handleDownloadDocument = async (profileId, documentName) => {
    try {
      message.loading('Đang tải tài liệu...', 0);
      const response = await getSellerDocumentApi(profileId);
      message.destroy();
      
      console.log('📄 Document response:', response);
      
      if (response && response.result) {
        const documentUrl = response.result;
        
        // Open in new tab
        window.open(documentUrl, '_blank');
        message.success('Đã mở tài liệu!');
      } else {
        message.warning('Không tìm thấy tài liệu!');
      }
    } catch (error) {
      message.destroy();
      console.error('Error downloading document:', error);
      message.error(error.response?.data?.message || 'Không thể tải tài liệu. Vui lòng thử lại!');
    }
  };

  const handleOpenStore = (seller) => {
    // Assuming store URL is based on seller ID or store slug
    // You can modify this URL pattern based on your routing
    const storeUrl = `/store/${seller.id}`; // or `/store/${seller.shopSlug}` if you have slug
    window.open(storeUrl, '_blank');
    message.info(`Đang mở cửa hàng: ${seller.shopName}`);
  };

  // Approve seller
  const handleApprove = async (id) => {
    try {
      await approveSellerProfileApi(id);
      message.success("Đã phê duyệt người bán thành công!");
      setIsModalVisible(false);
      fetchSellers(); // Refresh list
    } catch (error) {
      console.error("Error approving seller:", error);
      message.error("Không thể phê duyệt người bán. Vui lòng thử lại!");
    }
  };

  // Reject seller
  const handleReject = async (id) => {
    try {
      await rejectSellerProfileApi(id, "Không đủ điều kiện");
      message.warning("Đã từ chối người bán!");
      setIsModalVisible(false);
      fetchSellers(); // Refresh list
    } catch (error) {
      console.error("Error rejecting seller:", error);
      message.error("Không thể từ chối người bán. Vui lòng thử lại!");
    }
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "gold", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
      approved: { color: "success", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      rejected: { color: "error", icon: <CloseCircleOutlined />, text: "Từ chối" },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Filter sellers
  const filteredSellers = sellers.filter((seller) => {
    const matchStatus = filterStatus === "all" || seller.status === filterStatus;
    const matchSearch =
      searchText === "" ||
      seller.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      seller.shopName.toLowerCase().includes(searchText.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchText.toLowerCase()) ||
      seller.phone.includes(searchText);
    return matchStatus && matchSearch;
  });

  const handleResetFilters = () => {
    setFilterStatus("all");
    setSearchText("");
  };

  const handleSearch = () => {
    fetchSellers();
  };

  // Table columns
  const columns = [
    {
      title: "Tên cửa hàng",
      dataIndex: "shopName",
      key: "shopName",
      ellipsis: true,
      render: (text) => (
        <Space>
          <ShopOutlined style={{ color: "#1890ff" }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (text) => (
        <Space>
          <MailOutlined style={{ color: "#999" }} />
          {text}
        </Space>
      ),
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (text) => (
        <Space>
          <PhoneOutlined style={{ color: "#999" }} />
          {text}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 90,
      render: (_, record) => (
        <button
          className="adminActionBtn view"
          title="Xem chi tiết"
          onClick={() => handleViewDetails(record)}
        >
          <EyeOutlined />
        </button>
      ),
    },
  ];

  return (
    <div className="seller-management-container">
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {/* Statistics */}
        <Row gutter={16} className="statistics-row">
        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Tổng số đăng ký</span>
              <div className="admin-stat-icon">
                <ShoppingOutlined />
              </div>
            </div>
            <h2 className="admin-stat-value">{statistics.total}</h2>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Chờ duyệt</span>
              <div className="admin-stat-icon">
                <ClockCircleOutlined />
              </div>
            </div>
            <h2 className="admin-stat-value" style={{ color: "#faad14" }}>{statistics.pending}</h2>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Đã duyệt</span>
              <div className="admin-stat-icon">
                <CheckCircleOutlined />
              </div>
            </div>
            <h2 className="admin-stat-value" style={{ color: "#52c41a" }}>{statistics.approved}</h2>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">Từ chối</span>
              <div className="admin-stat-icon">
                <CloseCircleOutlined />
              </div>
            </div>
            <h2 className="admin-stat-value" style={{ color: "#ff4d4f" }}>{statistics.rejected}</h2>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card">
        <div className="adminToolbar">
          <div className="adminSearchBox">
            <SearchOutlined className="searchIcon" />
            <input
              type="text"
              placeholder="Tìm theo tên, shop, email, SĐT..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="adminSearchInput"
            />
          </div>
          <div className="toolbarActions">
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
          <div className="adminFilters">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <div className="filterItem">
                  <label>Trạng thái</label>
                  <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="pending">
                      <Badge status="processing" text="Chờ duyệt" />
                    </Option>
                    <Option value="approved">
                      <Badge status="success" text="Đã duyệt" />
                    </Option>
                    <Option value="rejected">
                      <Badge status="error" text="Từ chối" />
                    </Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSellers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người bán`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize,
              }));
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <ShopOutlined style={{ color: "#ee4d2d", fontSize: "20px" }} />
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              Chi tiết hồ sơ người bán
            </span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          selectedSeller?.status === "pending" ? (
            <div className="modalFooter">
              <button 
                key="cancel" 
                className="adminActionBtn close"
                onClick={() => setIsModalVisible(false)}
              >
                Đóng
              </button>
              <Popconfirm
                key="reject"
                title="Từ chối người bán"
                description="Bạn có chắc muốn từ chối người bán này?"
                onConfirm={() => handleReject(selectedSeller.id)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <button 
                  className="adminActionBtn reject"
                >
                  <CloseCircleOutlined />
                  Từ chối
                </button>
              </Popconfirm>
              <Popconfirm
                key="approve"
                title="Phê duyệt người bán"
                description="Bạn có chắc muốn phê duyệt người bán này?"
                onConfirm={() => handleApprove(selectedSeller.id)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <button
                  className="adminActionBtn approve"
                >
                  <CheckCircleOutlined />
                  Phê duyệt
                </button>
              </Popconfirm>
            </div>
          ) : (
            <div className="modalFooter">
              <button
                key="close"
                className="adminActionBtn close"
                onClick={() => setIsModalVisible(false)}
              >
                Đóng
              </button>
              <button
                key="store"
                className="adminActionBtn link"
                onClick={() => handleOpenStore(selectedSeller)}
                disabled={selectedSeller?.status !== 'approved'}
              >
                <LinkOutlined />
                Mở cửa hàng
              </button>
            </div>
          )
        }
        width={800}
      >
        {selectedSeller && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: "#1890ff" }} />
                {selectedSeller.email}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined style={{ color: "#52c41a" }} />
                {selectedSeller.phone}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Tên cửa hàng">
              <Space>
                <ShopOutlined style={{ color: "#ee4d2d" }} />
                <strong>{selectedSeller.shopName}</strong>
              </Space>
            </Descriptions.Item>
            {selectedSeller.shopAddress && (
              <Descriptions.Item label="Địa chỉ cửa hàng">
                <Space>
                  <EnvironmentOutlined style={{ color: "#ff7a45" }} />
                  {selectedSeller.shopAddress}
                </Space>
              </Descriptions.Item>
            )}
            {selectedSeller.logoUrl && (
              <Descriptions.Item label="Logo cửa hàng">
                <img 
                  src={selectedSeller.logoUrl} 
                  alt="Logo" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '100px', 
                    objectFit: 'contain',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '4px'
                  }}
                />
              </Descriptions.Item>
            )}
            {selectedSeller.bannerUrl && (
              <Descriptions.Item label="Banner cửa hàng">
                <img 
                  src={selectedSeller.bannerUrl} 
                  alt="Banner" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '150px', 
                    objectFit: 'cover',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                  }}
                />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Danh mục sản phẩm">
              <Tag color="blue" style={{ fontSize: "14px" }}>
                {selectedSeller.productCategory}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả cửa hàng">
              {selectedSeller.note || "Không có"}
            </Descriptions.Item>
            {selectedSeller.documentName && (
              <Descriptions.Item label="Tên giấy tờ">
                <Space>
                  <FileOutlined style={{ color: "#faad14" }} />
                  {selectedSeller.documentName}
                  <Button 
                    type="link" 
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadDocument(selectedSeller.id, selectedSeller.documentName)}
                  >
                    Tải xuống
                  </Button>
                </Space>
              </Descriptions.Item>
            )}
            {selectedSeller.documentUploadedAt && (
              <Descriptions.Item label="Ngày tải giấy tờ">
                <Space>
                  <CalendarOutlined style={{ color: "#722ed1" }} />
                  {selectedSeller.documentUploadedAt}
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Trạng thái hoạt động">
              {selectedSeller.isActive ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>Đang hoạt động</Tag>
              ) : (
                <Tag color="default">Chưa kích hoạt</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái duyệt">
              {getStatusTag(selectedSeller.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký">
              {selectedSeller.submittedDate}
            </Descriptions.Item>
            {selectedSeller.reviewedDate && (
              <>
                <Descriptions.Item label="Ngày xét duyệt">
                  {selectedSeller.reviewedDate}
                </Descriptions.Item>
                <Descriptions.Item label="Người xét duyệt">
                  {selectedSeller.reviewedBy}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
      </Spin>
    </div>
  );
};

export default SellerManagement;
