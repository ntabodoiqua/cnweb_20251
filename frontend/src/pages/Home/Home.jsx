import { useState, useEffect } from "react";
import { Row, Col, Carousel, Typography, Card, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import { ROUTES } from "../../constants";
import "./Home.css";

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getFeaturedProducts(8);
      setFeaturedProducts(data);
    } catch (error) {
      console.error("Failed to load featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const bannerImages = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-section">
        <Carousel autoplay effect="fade">
          {bannerImages.map((image, index) => (
            <div key={index}>
              <div
                className="carousel-item"
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="carousel-content">
                  <Title level={1}>Chào mừng đến với cửa hàng</Title>
                  <Paragraph>
                    Khám phá các sản phẩm tuyệt vời của chúng tôi
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate(ROUTES.PRODUCTS)}
                  >
                    Mua sắm ngay
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <Title level={2} className="section-title">
            Sản phẩm nổi bật
          </Title>
          <Row gutter={[16, 16]}>
            {featuredProducts.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  loading={loading}
                  cover={<img alt={product.name} src={product.image} />}
                  onClick={() => navigate(`${ROUTES.PRODUCTS}/${product.id}`)}
                >
                  <Card.Meta
                    title={product.name}
                    description={`${product.price.toLocaleString()} đ`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Home;
