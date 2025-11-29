import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Carousel, Rate } from "antd";
import { HeartOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

/**
 * Testimonials Section Component
 * Displays customer testimonials in carousel
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
          {testimonials.map((testimonial) => (
            <div key={testimonial.id}>
              <div className="testimonial-card">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="testimonial-avatar"
                />
                <div className="testimonial-rating">
                  <Rate disabled defaultValue={testimonial.rating} />
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
                <div className="testimonial-name">{testimonial.name}</div>
                <div className="testimonial-product">
                  Đã mua: {testimonial.product}
                </div>
              </div>
            </div>
          ))}
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
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired,
      product: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string,
};

export default TestimonialsSection;