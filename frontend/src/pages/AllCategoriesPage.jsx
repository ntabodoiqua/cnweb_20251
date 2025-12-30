import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Empty,
  Breadcrumb,
  Input,
  Typography,
  Tag,
} from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  SearchOutlined,
  RightOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { getPublicPlatformCategoriesApi } from "../util/api";
import LoadingSpinner from "../components/LoadingSpinner";
import NoImage from "../assets/NoImages.webp";
import styles from "./AllCategoriesPage.module.css";

const { Title, Text } = Typography;
const { Search } = Input;

const AllCategoriesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await getPublicPlatformCategoriesApi();
        if (response.code === 1000) {
          setCategories(response.result || []);
          setFilteredCategories(response.result || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = categories.filter((category) => {
      // Check if parent category matches
      if (category.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      // Check if any subcategory matches
      if (category.subCategories && category.subCategories.length > 0) {
        return category.subCategories.some((sub) =>
          sub.name.toLowerCase().includes(searchLower)
        );
      }
      return false;
    });
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const getTotalProducts = (category) => {
    let total = category.productCount || 0;
    if (category.subCategories && category.subCategories.length > 0) {
      total += category.subCategories.reduce(
        (sum, sub) => sum + (sub.productCount || 0),
        0
      );
    }
    return total;
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải danh mục..." fullScreen={true} />;
  }

  return (
    <>
      <Helmet>
        <title>Tất cả danh mục - HUSTBuy</title>
        <meta
          name="description"
          content="Khám phá tất cả danh mục sản phẩm tại HUSTBuy"
        />
      </Helmet>

      <div className={styles.allCategoriesPage}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/">
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: (
                  <>
                    <AppstoreOutlined /> Tất cả danh mục
                  </>
                ),
              },
            ]}
          />
        </div>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
              <Title level={2} className={styles.pageTitle}>
                <AppstoreOutlined /> Tất cả danh mục
              </Title>
              <Text className={styles.pageDescription}>
                Khám phá {categories.length} danh mục sản phẩm đa dạng
              </Text>
            </div>
            <div className={styles.searchWrapper}>
              <Search
                placeholder="Tìm kiếm danh mục..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className={styles.categoriesContainer}>
          {filteredCategories.length === 0 ? (
            <Empty
              description={
                searchTerm
                  ? "Không tìm thấy danh mục phù hợp"
                  : "Chưa có danh mục nào"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredCategories.map((category) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={category.id}>
                  <Card
                    className={styles.categoryCard}
                    hoverable
                    cover={
                      <div
                        className={styles.categoryImageWrapper}
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <img
                          src={category.imageUrl || NoImage}
                          alt={category.name}
                          className={styles.categoryImage}
                          onError={(e) => {
                            e.target.src = NoImage;
                          }}
                        />
                        <div className={styles.categoryOverlay}>
                          <span>Xem sản phẩm</span>
                          <RightOutlined />
                        </div>
                      </div>
                    }
                  >
                    <div
                      className={styles.categoryContent}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <Title level={4} className={styles.categoryName}>
                        {category.name}
                      </Title>
                      <div className={styles.categoryStats}>
                        <Tag color="blue">
                          {getTotalProducts(category)} sản phẩm
                        </Tag>
                        {category.subCategories &&
                          category.subCategories.length > 0 && (
                            <Tag color="green">
                              {category.subCategories.length} danh mục con
                            </Tag>
                          )}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {category.subCategories &&
                      category.subCategories.length > 0 && (
                        <div className={styles.subCategoriesSection}>
                          <div className={styles.subCategoriesHeader}>
                            <FolderOutlined /> Danh mục con
                          </div>
                          <div className={styles.subCategoriesList}>
                            {category.subCategories
                              .slice(0, 5)
                              .map((subCat) => (
                                <div
                                  key={subCat.id}
                                  className={styles.subCategoryItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(subCat.id);
                                  }}
                                >
                                  <span>{subCat.name}</span>
                                  <span className={styles.subCategoryCount}>
                                    {subCat.productCount || 0}
                                  </span>
                                </div>
                              ))}
                            {category.subCategories.length > 5 && (
                              <div
                                className={styles.viewMoreSubCategories}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryClick(category.id);
                                }}
                              >
                                +{category.subCategories.length - 5} danh mục
                                khác
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </>
  );
};

export default AllCategoriesPage;
