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
  TagOutlined,
  SearchOutlined,
  RightOutlined,
  TrophyOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { getBrandsApi } from "../util/api";
import LoadingSpinner from "../components/LoadingSpinner";
import NoImage from "../assets/NoImages.webp";
import styles from "./AllBrandsPage.module.css";

const { Title, Text } = Typography;
const { Search } = Input;

const AllBrandsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const response = await getBrandsApi(0, 200);
        if (response.code === 1000) {
          const brandsList = response.result?.content || response.result || [];
          setBrands(brandsList);
          setFilteredBrands(brandsList);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Filter brands based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(searchLower) ||
        (brand.description &&
          brand.description.toLowerCase().includes(searchLower))
    );
    setFilteredBrands(filtered);
  }, [searchTerm, brands]);

  const handleBrandClick = (brandId) => {
    navigate(`/brand/${brandId}`);
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải thương hiệu..." fullScreen={true} />;
  }

  return (
    <>
      <Helmet>
        <title>Tất cả thương hiệu - HUSTBuy</title>
        <meta
          name="description"
          content="Khám phá tất cả thương hiệu sản phẩm tại HUSTBuy"
        />
      </Helmet>

      <div className={styles.allBrandsPage}>
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
                    <TagOutlined /> Tất cả thương hiệu
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
                <TrophyOutlined /> Tất cả thương hiệu
              </Title>
              <Text className={styles.pageDescription}>
                Khám phá {brands.length} thương hiệu uy tín
              </Text>
            </div>
            <div className={styles.searchWrapper}>
              <Search
                placeholder="Tìm kiếm thương hiệu..."
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

        {/* Brands Grid */}
        <div className={styles.brandsContainer}>
          {filteredBrands.length === 0 ? (
            <Empty
              description={
                searchTerm
                  ? "Không tìm thấy thương hiệu phù hợp"
                  : "Chưa có thương hiệu nào"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredBrands.map((brand) => (
                <Col xs={12} sm={8} md={6} lg={4} xl={3} key={brand.id}>
                  <Card
                    className={styles.brandCard}
                    hoverable
                    onClick={() => handleBrandClick(brand.id)}
                  >
                    <div className={styles.brandLogoWrapper}>
                      <img
                        src={brand.logoUrl || brand.logo || NoImage}
                        alt={brand.name}
                        className={styles.brandLogo}
                        onError={(e) => {
                          e.target.src = NoImage;
                        }}
                      />
                    </div>
                    <div className={styles.brandContent}>
                      <div className={styles.brandName}>{brand.name}</div>
                      {brand.productsCount > 0 && (
                        <div className={styles.brandStats}>
                          <ShopOutlined /> {brand.productsCount} sản phẩm
                        </div>
                      )}
                    </div>
                    <div className={styles.brandOverlay}>
                      <span>Xem sản phẩm</span>
                      <RightOutlined />
                    </div>
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

export default AllBrandsPage;
