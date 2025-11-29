import React from "react";
import PropTypes from "prop-types";
import { Carousel } from "antd";

/**
 * Hero Banner Component
 * Displays main carousel banner at the top of homepage
 * Backend returns: id, imageName, imageUrl, displayOrder, storeId
 * Users can swipe to navigate between slides
 */
const HeroBanner = ({ slides }) => {
  return (
    <section className="hero-banner">
      <Carousel
        autoplay
        autoplaySpeed={5000}
        effect="fade"
        arrows={false}
        dots={true}
        swipe={true}
        draggable={true}
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
