import React, { useState, useEffect, useCallback } from "react";
import {
  Rate,
  Progress,
  Button,
  Avatar,
  Tag,
  Space,
  Pagination,
  Empty,
  Spin,
  Image,
  message,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  LikeOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  StarOutlined,
  FilterOutlined,
  LikeFilled,
} from "@ant-design/icons";
import {
  getProductRatingsApi,
  getProductRatingSummaryApi,
  getProductRatingsByStarApi,
  getProductRatingsWithImagesApi,
  getProductVerifiedRatingsApi,
  markRatingHelpfulApi,
} from "../util/api";
import styles from "./ProductRatings.module.css";

// Base URL cho ảnh từ S3 (DigitalOcean Spaces)
const S3_BASE_URL = "https://hla.sgp1.digitaloceanspaces.com";

// Helper function to get image URL from imageName
const getImageUrl = (imageUrl, imageName) => {
  if (imageUrl) return imageUrl;
  if (imageName) return `${S3_BASE_URL}/${imageName}`;
  return null;
};

const ProductRatings = ({ productId }) => {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(5);
  const [activeFilter, setActiveFilter] = useState("all");
  const [helpfulMarked, setHelpfulMarked] = useState(new Set());

  // Fetch rating summary
  const fetchSummary = useCallback(async () => {
    try {
      const response = await getProductRatingSummaryApi(productId);
      if (response.code === 1000) {
        setSummary(response.result);
      }
    } catch (error) {
      console.error("Error fetching rating summary:", error);
    }
  }, [productId]);

  // Fetch ratings based on filter
  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      const params = { page: currentPage, size: pageSize };

      switch (activeFilter) {
        case "5":
        case "4":
        case "3":
        case "2":
        case "1":
          response = await getProductRatingsByStarApi(
            productId,
            parseInt(activeFilter),
            params
          );
          break;
        case "with-images":
          response = await getProductRatingsWithImagesApi(productId, params);
          break;
        case "verified":
          response = await getProductVerifiedRatingsApi(productId, params);
          break;
        default:
          response = await getProductRatingsApi(productId, params);
      }

      if (response.code === 1000) {
        setRatings(response.result.content || []);
        setTotalElements(response.result.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage, pageSize, activeFilter]);

  useEffect(() => {
    if (productId) {
      fetchSummary();
    }
  }, [productId, fetchSummary]);

  useEffect(() => {
    if (productId) {
      fetchRatings();
    }
  }, [productId, currentPage, activeFilter, fetchRatings]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handleMarkHelpful = async (ratingId) => {
    if (helpfulMarked.has(ratingId)) {
      message.info("Bạn đã đánh dấu hữu ích cho đánh giá này");
      return;
    }

    try {
      await markRatingHelpfulApi(ratingId);
      setHelpfulMarked((prev) => new Set([...prev, ratingId]));
      // Update rating helpful count locally
      setRatings((prev) =>
        prev.map((r) =>
          r.id === ratingId
            ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
            : r
        )
      );
      message.success("Cảm ơn bạn đã đánh dấu hữu ích!");
    } catch (error) {
      console.error("Error marking helpful:", error);
      message.error("Không thể đánh dấu hữu ích");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRatingDistribution = () => {
    if (!summary || !summary.ratingDistribution) return [];
    const distribution = [];
    for (let i = 5; i >= 1; i--) {
      const count = summary.ratingDistribution[i] || 0;
      const percentage =
        summary.totalRatings > 0 ? (count / summary.totalRatings) * 100 : 0;
      distribution.push({ star: i, count, percentage });
    }
    return distribution;
  };

  const filterButtons = [
    { key: "all", label: "Tất cả" },
    { key: "5", label: "5 Sao" },
    { key: "4", label: "4 Sao" },
    { key: "3", label: "3 Sao" },
    { key: "2", label: "2 Sao" },
    { key: "1", label: "1 Sao" },
    { key: "with-images", label: "Có hình ảnh", icon: <PictureOutlined /> },
    { key: "verified", label: "Đã mua hàng", icon: <CheckCircleOutlined /> },
  ];

  if (!productId) {
    return <Empty description="Không có thông tin sản phẩm" />;
  }

  return (
    <div className={styles.ratingsContainer}>
      {/* Rating Summary */}
      {summary && summary.totalRatings > 0 && (
        <div className={styles.summarySection}>
          <div className={styles.summaryLeft}>
            <div className={styles.averageRating}>
              {summary.averageRating?.toFixed(1) || "0.0"}
            </div>
            <Rate
              disabled
              allowHalf
              value={summary.averageRating || 0}
              className={styles.summaryStars}
            />
            <div className={styles.totalRatings}>
              {summary.totalRatings} đánh giá
            </div>
          </div>
          <div className={styles.summaryRight}>
            {getRatingDistribution().map((item) => (
              <div key={item.star} className={styles.distributionRow}>
                <span className={styles.starLabel}>{item.star}</span>
                <StarOutlined className={styles.starIcon} />
                <Progress
                  percent={item.percentage}
                  showInfo={false}
                  strokeColor="#fadb14"
                  trailColor="#f0f0f0"
                  className={styles.progressBar}
                />
                <span className={styles.countLabel}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className={styles.filterSection}>
        <FilterOutlined className={styles.filterIcon} />
        <div className={styles.filterButtons}>
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              type={activeFilter === btn.key ? "primary" : "default"}
              size="small"
              icon={btn.icon}
              onClick={() => handleFilterChange(btn.key)}
              className={styles.filterButton}
            >
              {btn.label}
              {btn.key !== "all" &&
                btn.key !== "with-images" &&
                btn.key !== "verified" &&
                summary?.ratingDistribution?.[parseInt(btn.key)] > 0 && (
                  <span className={styles.filterCount}>
                    ({summary.ratingDistribution[parseInt(btn.key)]})
                  </span>
                )}
            </Button>
          ))}
        </div>
      </div>

      {/* Rating List */}
      <div className={styles.ratingsList}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" tip="Đang tải đánh giá..." />
          </div>
        ) : ratings.length === 0 ? (
          <Empty
            description={
              activeFilter === "all"
                ? "Chưa có đánh giá nào cho sản phẩm này"
                : "Không có đánh giá nào phù hợp với bộ lọc"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {ratings.map((rating) => (
              <div key={rating.id} className={styles.ratingItem}>
                <div className={styles.ratingHeader}>
                  <Avatar
                    size={40}
                    icon={<UserOutlined />}
                    className={styles.userAvatar}
                  />
                  <div className={styles.ratingMeta}>
                    <div className={styles.userName}>
                      {rating.userId || "Người dùng ẩn danh"}
                      {rating.isVerifiedPurchase && (
                        <Tag
                          color="green"
                          icon={<CheckCircleOutlined />}
                          className={styles.verifiedTag}
                        >
                          Đã mua hàng
                        </Tag>
                      )}
                    </div>
                    <div className={styles.ratingStars}>
                      <Rate disabled value={rating.rating} size="small" />
                      <span className={styles.ratingDate}>
                        {formatDate(rating.createdAt)}
                      </span>
                    </div>
                    {rating.variantName && (
                      <div className={styles.variantInfo}>
                        Phân loại: {rating.variantName}
                      </div>
                    )}
                  </div>
                </div>

                {rating.comment && (
                  <div className={styles.ratingComment}>{rating.comment}</div>
                )}

                {/* Rating Images */}
                {rating.images && rating.images.length > 0 && (
                  <div className={styles.ratingImages}>
                    <Image.PreviewGroup>
                      {rating.images.map((img, index) => (
                        <Image
                          key={img.id || index}
                          src={getImageUrl(img.imageUrl, img.imageName)}
                          alt={`Review ${index + 1}`}
                          width={80}
                          height={80}
                          className={styles.ratingImage}
                          style={{ objectFit: "cover" }}
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                )}

                {/* Helpful Button */}
                <div className={styles.ratingFooter}>
                  <Tooltip title="Đánh giá này có hữu ích?">
                    <Button
                      type="text"
                      size="small"
                      icon={
                        helpfulMarked.has(rating.id) ? (
                          <LikeFilled style={{ color: "#1890ff" }} />
                        ) : (
                          <LikeOutlined />
                        )
                      }
                      onClick={() => handleMarkHelpful(rating.id)}
                      className={styles.helpfulButton}
                    >
                      Hữu ích ({rating.helpfulCount || 0})
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalElements > pageSize && (
              <div className={styles.paginationContainer}>
                <Pagination
                  current={currentPage + 1}
                  total={totalElements}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} đánh giá`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductRatings;
