import React, { useEffect } from 'react';
import './about-us.css';
import useScrollToTop from '../hooks/useScrollToTop';
// Import ảnh cho team members
import tomImg from '../assets/teams/tom.jpg';
import lightningImg from '../assets/teams/lightning.jpg';
import meatheadImg from '../assets/teams/meathead.jpg';
import butchImg from '../assets/teams/butch.jpg';

const AboutUs = () => {
    // Sử dụng custom hook để cuộn lên đầu trang
    useScrollToTop();
    
    // Xử lý cuộn khi click vào section
    const handleSectionClick = (e) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    return (
        <div className="about-us-container">
            <div className="about-us-header">
                <h1>Về chúng tôi</h1>
                <p>Chào mừng bạn đến với nền tảng thương mại điện tử của chúng tôi - nơi kết nối người mua và người bán, 
                   tạo nên những trải nghiệm mua sắm trực tuyến tuyệt vời.</p>
            </div>

            <div className="about-us-content">
                <div className="about-us-section" onClick={handleSectionClick}>
                    <h2>Tầm nhìn</h2>
                    <p>Chúng tôi hướng tới việc trở thành nền tảng thương mại điện tử ưu đãi hàng đầu, 
                       nơi mọi người có thể tìm thấy những sản phẩm chất lượng với giá cả hợp lý.</p>
                </div>

                <div className="about-us-section" onClick={handleSectionClick}>
                    <h2>Sứ mệnh</h2>
                    <p>Mang đến trải nghiệm mua sắm trực tuyến an toàn, tiện lợi và đáng tin cậy cho người dùng, 
                       đồng thời hỗ trợ các nhà bán lẻ phát triển trong thời đại số.</p>
                </div>

                <div className="about-us-section" onClick={handleSectionClick}>
                    <h2>Giá trị cốt lõi</h2>
                    <p>Chúng tôi đề cao tính minh bạch, chất lượng và sự hài lòng của khách hàng. 
                       Mọi hoạt động của chúng tôi đều hướng đến việc tạo ra giá trị tốt nhất cho cộng đồng.</p>
                </div>
            </div>

            <div className="team-section">
                <h2>Các thành viên nhóm 1</h2>
                <div className="team-grid">
                    <div className="team-member">
                        <img src={tomImg} alt="Nguyễn Thế Anh" />
                        <h3>Nguyễn Thế Anh</h3>
                        <p>Nhóm Trưởng</p>
                    </div>
                    <div className="team-member">
                        <img src={lightningImg} alt="Bùi Khắc Anh" />
                        <h3>Bùi Khắc Anh</h3>
                        <p>BackEnd</p>
                    </div>
                    <div className="team-member">
                        <img src={meatheadImg} alt="Lê Đinh Hùng Anh" />
                        <h3>Lê Đinh Hùng Anh</h3>
                        <p>FrontEnd</p>
                    </div>
                    <div className="team-member">
                        <img src={butchImg} alt="Hồ Lương An" />
                        <h3>Hồ Lương An</h3>
                        <p>FrontEnd</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
