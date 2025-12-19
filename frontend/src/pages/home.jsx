import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { FireOutlined, StarOutlined } from "@ant-design/icons";
import { bannerSlides, testimonials, homePageMeta } from "../data/mockdata";
import LoadingSpinner from "../components/LoadingSpinner";
import NoImage from "../assets/NoImages.webp";
import {
  getPublicProductsApi,
  getPublicPlatformCategoriesApi,
  getBrandsApi,
  getPlatformBannersApi,
  getLatestRatingsApi,
} from "../util/api";
import {
  HeroBanner,
  CategoriesSection,
  FlashSaleSection,
  ProductsSection,
  BrandsSection,
  TestimonialsSection,
  VideoReviewsSection,
  TrustBadges,
} from "../components/home";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import "../styles/home.css";

// Helper functions moved outside component to avoid recreating
const getCategoryIcon = (name) => {
  const iconMap = {
    "điện tử": "💻",
    "điện thoại": "📱",
    "thời trang": "👕",
    "đồ gia dụng": "🏠",
    sách: "📚",
    "thể thao": "⚽",
    "làm đẹp": "💄",
    "đồ chơi": "🎮",
    "thực phẩm": "🍎",
    "xe cộ": "🚗",
    "máy tính": "🖥️",
    "phụ kiện": "🎧",
    gaming: "🎮",
    "văn phòng": "🖨️",
    giày: "👟",
  };
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(key)) return icon;
  }
  return "📦";
};

const getTotalProductCount = (category) => {
  let total = category.productCount || 0;
  if (category.subCategories && category.subCategories.length > 0) {
    total += category.subCategories.reduce(
      (sum, sub) => sum + (sub.productCount || 0),
      0
    );
  }
  return total;
};

// Format price function - stable reference
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Product data from API
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);

  // Categories data from API
  const [categories, setCategories] = useState([]);

  // Brands data from API
  const [brands, setBrands] = useState([]);

  // Banner slides from API
  const [platformBanners, setPlatformBanners] = useState([]);

  // Customer reviews from API
  const [customerReviews, setCustomerReviews] = useState([]);

  // Track which sections have been loaded
  const [loadedSections, setLoadedSections] = useState({
    categories: false,
    flashSale: false,
    featured: false,
    dailyDeals: false,
    brands: false,
    banners: false,
    reviews: false,
  });

  // Single intersection observer for better performance
  const [categoriesRef, categoriesVisible] = useIntersectionObserver({
    rootMargin: "400px 0px",
  });
  const [flashSaleRef, flashSaleVisible] = useIntersectionObserver({
    rootMargin: "400px 0px",
  });
  const [featuredRef, featuredVisible] = useIntersectionObserver({
    rootMargin: "400px 0px",
  });
  const [dailyDealsRef, dailyDealsVisible] = useIntersectionObserver({
    rootMargin: "400px 0px",
  });
  const [brandsRef, brandsVisible] = useIntersectionObserver({
    rootMargin: "400px 0px",
  });
  const [reviewsRef, reviewsVisible] = useIntersectionObserver({
    rootMargin: "400px 0px",
  });

  // Fetch categories when visible
  const fetchCategories = useCallback(async () => {
    if (loadedSections.categories) return;
    try {
      const categoriesResponse = await getPublicPlatformCategoriesApi();
      if (categoriesResponse?.code === 1000) {
        const apiCategories = categoriesResponse.result || [];
        const transformedCategories = apiCategories
          .filter((cat) => cat.active)
          .slice(0, 8)
          .map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: getCategoryIcon(cat.name),
            image: cat.imageUrl || NoImage,
            productCount: getTotalProductCount(cat),
            subCategories: cat.subCategories || [],
          }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadedSections((prev) => ({ ...prev, categories: true }));
    }
  }, [loadedSections.categories]);

  // Fetch flash sale products when visible
  const fetchFlashSale = useCallback(async () => {
    if (loadedSections.flashSale) return;
    try {
      const flashSaleResponse = await getPublicProductsApi({
        isActive: true,
        sortBy: "createdAt",
        sortDirection: "desc",
        page: 0,
        size: 8,
      });
      if (flashSaleResponse.code === 1000) {
        setFlashSaleProducts(flashSaleResponse.result.content || []);
      }
    } catch (error) {
      console.error("Error fetching flash sale:", error);
    } finally {
      setLoadedSections((prev) => ({ ...prev, flashSale: true }));
    }
  }, [loadedSections.flashSale]);

  // Fetch featured products when visible
  const fetchFeatured = useCallback(async () => {
    if (loadedSections.featured) return;
    try {
      const featuredResponse = await getPublicProductsApi({
        isActive: true,
        sortBy: "createdAt",
        sortDirection: "desc",
        page: 0,
        size: 8,
      });
      if (featuredResponse.code === 1000) {
        setFeaturedProducts(featuredResponse.result.content || []);
      }
    } catch (error) {
      console.error("Error fetching featured:", error);
    } finally {
      setLoadedSections((prev) => ({ ...prev, featured: true }));
    }
  }, [loadedSections.featured]);

  // Fetch daily deals when visible
  const fetchDailyDeals = useCallback(async () => {
    if (loadedSections.dailyDeals) return;
    try {
      const dealsResponse = await getPublicProductsApi({
        isActive: true,
        sortBy: "price",
        sortDirection: "asc",
        page: 0,
        size: 8,
      });
      if (dealsResponse.code === 1000) {
        setDailyDeals(dealsResponse.result.content || []);
      }
    } catch (error) {
      console.error("Error fetching daily deals:", error);
    } finally {
      setLoadedSections((prev) => ({ ...prev, dailyDeals: true }));
    }
  }, [loadedSections.dailyDeals]);

  // Fetch brands when visible
  const fetchBrands = useCallback(async () => {
    if (loadedSections.brands) return;
    try {
      const brandsResponse = await getBrandsApi(0, 8);
      if (brandsResponse?.code === 1000) {
        const apiBrands = brandsResponse.result?.content || [];
        const transformedBrands = apiBrands
          .filter((brand) => brand.isActive)
          .map((brand) => ({
            id: brand.id,
            name: brand.name,
            logo: brand.logoUrl || NoImage,
            productsCount: brand.productCount || 0,
          }));
        setBrands(transformedBrands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoadedSections((prev) => ({ ...prev, brands: true }));
    }
  }, [loadedSections.brands]);

  // Fetch customer reviews when visible
  const fetchReviews = useCallback(async () => {
    if (loadedSections.reviews) return;
    try {
      const reviewsResponse = await getLatestRatingsApi({ page: 0, size: 10 });
      if (reviewsResponse?.code === 1000) {
        const apiReviews = reviewsResponse.result?.content || [];
        // Filter reviews that have comments (skip empty reviews)
        const filteredReviews = apiReviews.filter(
          (review) => review.comment && review.comment.trim() !== ""
        );
        setCustomerReviews(filteredReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadedSections((prev) => ({ ...prev, reviews: true }));
    }
  }, [loadedSections.reviews]);

  // Fetch platform banners on mount
  const fetchBanners = useCallback(async () => {
    if (loadedSections.banners) return;
    try {
      const bannersResponse = await getPlatformBannersApi();
      if (bannersResponse?.code === 1000) {
        const apiBanners = bannersResponse.result || [];
        // Transform API response to match HeroBanner props
        // API returns: id, imageName, imageUrl, displayOrder, storeId
        const transformedBanners = apiBanners
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((banner, index) => ({
            id: banner.id || index + 1,
            image: banner.imageUrl,
            imageName: banner.imageName,
          }));
        setPlatformBanners(transformedBanners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      // Fallback to mock data if API fails
      setPlatformBanners(bannerSlides);
    } finally {
      setLoadedSections((prev) => ({ ...prev, banners: true }));
    }
  }, [loadedSections.banners]);

  // Fetch banners immediately on mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Consolidated effect for triggering fetches
  useEffect(() => {
    if (categoriesVisible && !loadedSections.categories) fetchCategories();
    if (flashSaleVisible && !loadedSections.flashSale) fetchFlashSale();
    if (featuredVisible && !loadedSections.featured) fetchFeatured();
    if (dailyDealsVisible && !loadedSections.dailyDeals) fetchDailyDeals();
    if (brandsVisible && !loadedSections.brands) fetchBrands();
    if (reviewsVisible && !loadedSections.reviews) fetchReviews();
  }, [
    categoriesVisible,
    flashSaleVisible,
    featuredVisible,
    dailyDealsVisible,
    brandsVisible,
    reviewsVisible,
    loadedSections,
    fetchCategories,
    fetchFlashSale,
    fetchFeatured,
    fetchDailyDeals,
    fetchBrands,
    fetchReviews,
  ]);

  // Simulate loading and wait for critical images
  useEffect(() => {
    // Set loading false faster
    const loadTimer = setTimeout(() => {
      setLoading(false);
      setImagesLoaded(true);
    }, 300);

    return () => clearTimeout(loadTimer);
  }, []);

  // Memoized handlers to prevent re-renders
  const handleProductClick = useCallback(
    (productId) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleCategoryClick = useCallback(
    (categorySlug) => {
      navigate(`/category/${categorySlug}`);
    },
    [navigate]
  );

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
        <HeroBanner
          slides={platformBanners.length > 0 ? platformBanners : bannerSlides}
        />

        <div className="home-container">
          {/* Trust Badges */}
          <TrustBadges />

          {/* Categories Section - Lazy Loaded */}
          <section ref={categoriesRef} className="lazy-section">
            {loadedSections.categories ? (
              <CategoriesSection
                categories={categories}
                onCategoryClick={handleCategoryClick}
              />
            ) : (
              <div className="section-placeholder" style={{ minHeight: 280 }} />
            )}
          </section>

          {/* Flash Sale Section - Lazy Loaded */}
          <section ref={flashSaleRef} className="lazy-section">
            {loadedSections.flashSale ? (
              <FlashSaleSection
                products={flashSaleProducts}
                onProductClick={handleProductClick}
                formatPrice={formatPrice}
              />
            ) : (
              <div className="section-placeholder" style={{ minHeight: 450 }} />
            )}
          </section>

          {/* Featured Products Section - Lazy Loaded */}
          <section ref={featuredRef} className="lazy-section">
            {loadedSections.featured ? (
              <ProductsSection
                title="Sản Phẩm Nổi Bật"
                icon={<FireOutlined />}
                products={featuredProducts}
                onProductClick={handleProductClick}
                formatPrice={formatPrice}
                showViewAll={true}
                viewAllLink="/products"
                viewAllText="Xem thêm"
              />
            ) : (
              <div className="section-placeholder" style={{ minHeight: 450 }} />
            )}
          </section>

          {/* Daily Deals Section - Lazy Loaded */}
          <section ref={dailyDealsRef} className="lazy-section">
            {loadedSections.dailyDeals ? (
              <ProductsSection
                title="Gợi Ý Hôm Nay"
                icon={<StarOutlined />}
                products={dailyDeals}
                onProductClick={handleProductClick}
                formatPrice={formatPrice}
                showProgress={true}
              />
            ) : (
              <div className="section-placeholder" style={{ minHeight: 450 }} />
            )}
          </section>

          {/* Top Brands Section - Lazy Loaded */}
          <section ref={brandsRef} className="lazy-section">
            {loadedSections.brands && brands.length > 0 && (
              <BrandsSection brands={brands} />
            )}
          </section>

          {/* Testimonials Section - Lazy Loaded with real reviews */}
          <section ref={reviewsRef} className="lazy-section">
            {loadedSections.reviews ? (
              <TestimonialsSection
                testimonials={
                  customerReviews.length > 0 ? customerReviews : testimonials
                }
                title="Đánh Giá Gần Đây"
              />
            ) : (
              <div className="section-placeholder" style={{ minHeight: 300 }} />
            )}
          </section>

          {/* Video Reviews Section */}
          <section className="lazy-section">
            <VideoReviewsSection />
          </section>
        </div>

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
