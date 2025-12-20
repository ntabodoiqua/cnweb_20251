import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { PlayCircleOutlined } from "@ant-design/icons";

// Local storage key for video reviews (same as admin page)
const VIDEO_REVIEWS_STORAGE_KEY = "hustbuy_video_reviews";

// Default YouTube Shorts video IDs
const DEFAULT_VIDEOS = [
  {
    id: "1",
    videoId: "um1LBitMFWQ",
    title: "Review sản phẩm #1",
  },
  {
    id: "2",
    videoId: "njOLBAHRTck",
    title: "Review sản phẩm #2",
  },
  {
    id: "3",
    videoId: "czylbc82AuE",
    title: "Review sản phẩm #3",
  },
  {
    id: "4",
    videoId: "zRYauQkAv6E",
    title: "Review sản phẩm #4",
  },
];

/**
 * Get videos from localStorage or return defaults
 */
const getVideoReviews = () => {
  try {
    const stored = localStorage.getItem(VIDEO_REVIEWS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading video reviews from localStorage:", error);
  }
  return DEFAULT_VIDEOS;
};

/**
 * Video Reviews Section Component
 * Displays embedded YouTube Shorts review videos
 */
const VideoReviewsSection = ({ title = "Video Review Từ Khách Hàng" }) => {
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);

  useEffect(() => {
    const loadedVideos = getVideoReviews();
    setVideos(loadedVideos);
  }, []);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className="section video-reviews-section">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">
            <PlayCircleOutlined />
          </span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="video-reviews-grid">
        {videos.slice(0, 4).map((video) => (
          <div key={video.id} className="video-review-item">
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {video.title && <p className="video-title">{video.title}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

VideoReviewsSection.propTypes = {
  title: PropTypes.string,
};

export default VideoReviewsSection;
