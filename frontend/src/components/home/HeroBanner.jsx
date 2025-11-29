import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

/**
 * Hero Banner Component
 * Displays main carousel banner at the top of homepage
 * Backend returns: id, imageName, imageUrl, displayOrder, storeId
 */
const HeroBanner = ({ slides }) => {
  const carouselRef = useRef(null);

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };

  return (
    <section className="hero-banner">
      <Carousel
        ref={carouselRef}
        autoplay
        autoplaySpeed={5000}
        effect="fade"
        arrows={false}
      >
        {slides.map((slide) => (
          <div key={slide.id}>
            <div
              className="banner-slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </div>
        ))}
      </Carousel>

      {/* Custom Navigation Arrows */}
      <button
        className="carousel-arrow carousel-arrow-left"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <LeftOutlined />
      </button>
      <button
        className="carousel-arrow carousel-arrow-right"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <RightOutlined />
      </button>
    </section>
  );
};

HeroBanner.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      image: PropTypes.string.isRequired,
      imageName: PropTypes.string,
    })
  ).isRequired,
};

export default HeroBanner;
