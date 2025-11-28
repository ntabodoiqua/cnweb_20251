import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ThunderboltOutlined, ClockCircleOutlined } from "@ant-design/icons";
import ProductCard from "./ProductCard";

/**
 * Flash Sale Section Component
 * Displays flash sale products with countdown timer
 */
const FlashSaleSection = ({
  products,
  onProductClick,
  formatPrice,
  initialTime,
}) => {
  const [timeLeft, setTimeLeft] = useState(
    initialTime || {
      hours: 5,
      minutes: 23,
      seconds: 45,
    }
  );

  // Countdown timer for flash sale
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section">
      <div className="flash-sale-header">
        <div className="flash-sale-title">
          <ThunderboltOutlined className="animate-pulse" />
          FLASH SALE
        </div>
        <div className="flash-sale-timer">
          <ClockCircleOutlined />
          Kết thúc trong:
          <div className="timer-box">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          :
          <div className="timer-box">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          :
          <div className="timer-box">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
        </div>
      </div>
      <div className="flash-sale-content">
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              formatPrice={formatPrice}
              showProgress={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

FlashSaleSection.propTypes = {
  products: PropTypes.array.isRequired,
  onProductClick: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired,
  initialTime: PropTypes.shape({
    hours: PropTypes.number,
    minutes: PropTypes.number,
    seconds: PropTypes.number,
  }),
};

export default FlashSaleSection;
