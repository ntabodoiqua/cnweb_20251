import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FireOutlined, StarOutlined } from "@ant-design/icons";
import {
  bannerSlides,
  categories,
  flashSaleProducts,
  featuredProducts,
  dailyDeals,
  topBrands,
  promotionBanners,
  testimonials,
  homePageMeta,
} from "../data/mockdata";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  HeroBanner,
  PromotionBanners,
  CategoriesSection,
  FlashSaleSection,
  ProductsSection,
  BrandsSection,
  TestimonialsSection,
  QuickViewModal,
  TrustBadges,
  RecentlyViewed,
  addToRecentlyViewed,
} from "../components/home";
import "../styles/home.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [quickViewVisible, setQuickViewVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Simulate loading and wait for critical images
  useEffect(() => {
    // Wait for component to mount and data to be ready
    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 500);

    // Preload critical images
    const preloadImages = () => {
      const imageUrls = [
        ...bannerSlides.map((slide) => slide.image),
        ...categories.slice(0, 4).map((cat) => cat.image),
      ];

      let loadedCount = 0;
      const totalImages = imageUrls.length;

      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
      });

      // Fallback: Set images as loaded after 2 seconds regardless
      setTimeout(() => {
        setImagesLoaded(true);
      }, 2000);
    };

    preloadImages();

    return () => clearTimeout(loadTimer);
  }, []);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    message.info("Chi tiết sản phẩm sẽ được thêm sau khi ghép API");
    // Save to recently viewed
    const product = [
      ...flashSaleProducts,
      ...featuredProducts,
      ...dailyDeals,
    ].find((p) => p.id === productId);
    if (product) {
      addToRecentlyViewed(product);
    }
    // navigate(`/product/${productId}`);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setQuickViewVisible(true);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    // TODO: Implement actual cart logic
  };

  // Handle add to wishlist
  const handleAddToWishlist = (product) => {
    message.success(`Đã thêm "${product.name}" vào danh sách yêu thích!`);
    // TODO: Implement actual wishlist logic
  };

  // Handle category click
  const handleCategoryClick = (categorySlug) => {
    navigate(`/category/${categorySlug}`);
  };

  // Show loading until both data is ready and critical images are loaded
  if (loading || !imagesLoaded) {
    return <LoadingSpinner tip="Đang tải trang chủ..." fullScreen={true} />;
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{homePageMeta.title}</title>
        <meta name="description" content={homePageMeta.description} />
        <meta name="keywords" content={homePageMeta.keywords} />
        <meta property="og:title" content={homePageMeta.title} />
        <meta property="og:description" content={homePageMeta.description} />
        <meta property="og:image" content={homePageMeta.ogImage} />
        <meta property="og:url" content={homePageMeta.ogUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={homePageMeta.title} />
        <meta name="twitter:description" content={homePageMeta.description} />
        <meta name="twitter:image" content={homePageMeta.ogImage} />
        <link rel="canonical" href={homePageMeta.ogUrl} />
      </Helmet>

      <main className="home-page">
        {/* Hero Banner Carousel */}
        <HeroBanner slides={bannerSlides} />

        <div className="home-container">
          {/* Trust Badges */}
          <TrustBadges />

          {/* Promotion Banners */}
          <PromotionBanners banners={promotionBanners} />

          {/* Categories Section */}
          <CategoriesSection
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />

          {/* Flash Sale Section */}
          <FlashSaleSection
            products={flashSaleProducts}
            onProductClick={handleProductClick}
            formatPrice={formatPrice}
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />

          {/* Featured Products Section */}
          <ProductsSection
            title="Sản Phẩm Nổi Bật"
            icon={<FireOutlined />}
            products={featuredProducts}
            onProductClick={handleProductClick}
            formatPrice={formatPrice}
            showViewAll={true}
            viewAllLink="/products"
            viewAllText="Xem thêm"
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />

          {/* Daily Deals Section */}
          <ProductsSection
            title="Gợi Ý Hôm Nay"
            icon={<StarOutlined />}
            products={dailyDeals}
            onProductClick={handleProductClick}
            formatPrice={formatPrice}
            showProgress={true}
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />

          {/* Recently Viewed Section */}
          <RecentlyViewed
            formatPrice={formatPrice}
            onProductClick={handleProductClick}
          />

          {/* Top Brands Section */}
          <BrandsSection brands={topBrands} />

          {/* Testimonials Section */}
          <TestimonialsSection testimonials={testimonials} />
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          visible={quickViewVisible}
          onClose={() => setQuickViewVisible(false)}
          product={selectedProduct}
          formatPrice={formatPrice}
        />

        {/* Hidden content for SEO */}
        <div className="visually-hidden">
          <h1>HUSTBuy - Sàn thương mại điện tử uy tín</h1>
          <p>
            Mua sắm trực tuyến tại HUSTBuy với hàng nghìn sản phẩm chính hãng,
            giá tốt nhất. Điện tử, thời trang, đồ gia dụng, sách và nhiều hơn
            nữa. Miễn phí vận chuyển, thanh toán an toàn, bảo hành chính hãng.
          </p>
        </div>
      </main>
    </>
  );
};

export default HomePage;
