import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Carousel, Button } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

/**
 * Hero Banner Component
 * Displays main carousel banner at the top of homepage
 */
const HeroBanner = ({ slides }) => {
  const navigate = useNavigate();
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
            >
              <div className="banner-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Button
                  type="primary"
                  size="large"
                  className="banner-btn"
                  onClick={() => navigate(slide.link)}
                  style={{
                    background: slide.bgColor,
                    borderColor: slide.bgColor,
                  }}
                >
                  {slide.buttonText}
                  <RightOutlined />
                </Button>
              </div>
            </div>
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
      id: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      buttonText: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      bgColor: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default HeroBanner;
