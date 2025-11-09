import React from "react";
import "./LoadingSpinner.css";
import logo from "../assets/logo.png";

const LoadingSpinner = ({ tip = "Đang tải...", fullScreen = true }) => {
  return (
    <div
      className="loading-spinner-container"
      style={!fullScreen ? { minHeight: "400px" } : {}}
    >
      <div className="loading-spinner-content">
        <div className="loading-logo-wrapper">
          <img src={logo} alt="Logo" className="loading-logo" />
          <div className="loading-logo-ring"></div>
        </div>
        <div className="loading-spinner-rings">
          <div className="spinner-ring ring-1"></div>
          <div className="spinner-ring ring-2"></div>
          <div className="spinner-ring ring-3"></div>
        </div>
        {tip && (
          <div className="loading-text">
            <span>{tip}</span>
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
