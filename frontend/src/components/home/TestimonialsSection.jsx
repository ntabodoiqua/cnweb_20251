import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Carousel, Rate, Avatar } from "antd";
import {
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

// Default avatar placeholder
const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=1";

/**
 * Testimonials Section Component
 * Displays customer testimonials/reviews in carousel
 */
const TestimonialsSection = ({
  testimonials,
  title = "Khách Hàng Nói Gì Về Chúng Tôi",
}) => {
  const carouselRef = useRef(null);

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle testimonial data (support both mock data and API data)
  const getTestimonialData = (testimonial) => {
    // If from API (has userFullName field)
    if (testimonial.userFullName !== undefined) {
      return {
        id: testimonial.id,
        name: testimonial.userFullName || testimonial.username || "Khách hàng",
        avatar: testimonial.userAvatarUrl || DEFAULT_AVATAR,
        rating: testimonial.rating,
        comment: testimonial.comment || "",
        product: testimonial.productName || "Sản phẩm",
        date: formatDate(testimonial.createdAt),
        isVerified: testimonial.isVerifiedPurchase,
      };
    }
    // If mock data (has name field directly)
    return {
      id: testimonial.id,
      name: testimonial.name,
      avatar: testimonial.avatar || DEFAULT_AVATAR,
      rating: testimonial.rating,
      comment: testimonial.comment,
      product: testimonial.product,
      date: testimonial.date ? formatDate(testimonial.date) : "",
      isVerified: false,
    };
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">
            <HeartOutlined />
          </span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="testimonials-carousel">
        <Carousel
          ref={carouselRef}
          autoplay
          autoplaySpeed={4000}
          dots={true}
          arrows={false}
        >
          {testimonials.map((testimonial) => {
            const data = getTestimonialData(testimonial);
            return (
              <div key={data.id}>
                <div className="testimonial-card">
                  <Avatar
                    src={data.avatar}
                    icon={<UserOutlined />}
                    alt={data.name}
                    className="testimonial-avatar"
                    size={80}
                    onError={() => true}
                  />
                  <div className="testimonial-rating">
                    <Rate disabled defaultValue={data.rating} />
                  </div>
                  <p className="testimonial-comment">"{data.comment}"</p>
                  <div className="testimonial-name">
                    {data.name}
                    {data.isVerified && (
                      <CheckCircleFilled
                        style={{
                          marginLeft: 8,
                          color: "#52c41a",
                          fontSize: 14,
                        }}
                        title="Đã xác thực mua hàng"
                      />
                    )}
                  </div>
                  <div className="testimonial-product">
                    Đã mua: {data.product}
                  </div>
                  {data.date && (
                    <div
                      className="testimonial-date"
                      style={{
                        fontSize: 12,
                        color: "#999",
                        marginTop: 4,
                      }}
                    >
                      {data.date}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Carousel>

        {/* Custom Navigation Arrows */}
        <button
          className="carousel-arrow carousel-arrow-left testimonial-arrow-left"
          onClick={handlePrev}
          aria-label="Previous testimonial"
        >
          <LeftOutlined />
        </button>
        <button
          className="carousel-arrow carousel-arrow-right testimonial-arrow-right"
          onClick={handleNext}
          aria-label="Next testimonial"
        >
          <RightOutlined />
        </button>
      </div>
    </section>
  );
};

TestimonialsSection.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.oneOfType([
      // API data shape
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string,
        userFullName: PropTypes.string,
        userAvatarUrl: PropTypes.string,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string,
        productName: PropTypes.string,
        isVerifiedPurchase: PropTypes.bool,
        createdAt: PropTypes.string,
      }),
      // Mock data shape
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired,
        product: PropTypes.string.isRequired,
      }),
    ])
  ).isRequired,
  title: PropTypes.string,
};

export default TestimonialsSection;
