import React, { useState } from "react";
import "./ShippingPage.css";

export default function ShippingPage() {
    const [selectedRegion, setSelectedRegion] = useState("inner-city");

    const shippingMethods = [
        {
            id: "express",
            name: "Giao hàng hỏa tốc",
            icon: "⚡",
            time: "2-4 giờ",
            fee: "30.000đ - 50.000đ",
            description: "Giao hàng trong ngày, áp dụng nội thành",
            features: ["Giao trong 2-4 giờ", "Theo dõi realtime", "Ưu tiên cao nhất"]
        },
        {
            id: "fast",
            name: "Giao hàng nhanh",
            icon: "🚀",
            time: "1-2 ngày",
            fee: "20.000đ - 35.000đ",
            description: "Giao hàng nhanh trong 1-2 ngày làm việc",
            features: ["Giao trong 1-2 ngày", "Miễn phí đơn >300K", "Hỗ trợ COD"]
        },
        {
            id: "standard",
            name: "Giao hàng tiêu chuẩn",
            icon: "📦",
            time: "3-5 ngày",
            fee: "15.000đ - 25.000đ",
            description: "Giao hàng tiêu chuẩn toàn quốc",
            features: ["Giao trong 3-5 ngày", "Miễn phí đơn >500K", "Đóng gói cẩn thận"]
        },
        {
            id: "economy",
            name: "Giao hàng tiết kiệm",
            icon: "💰",
            time: "5-7 ngày",
            fee: "10.000đ - 20.000đ",
            description: "Tiết kiệm chi phí, thời gian linh động",
            features: ["Giao trong 5-7 ngày", "Phí thấp nhất", "Phù hợp hàng khối lượng lớn"]
        }
    ];

    const regionFees = [
        {
            id: "inner-city",
            name: "Nội thành Hà Nội, TP.HCM",
            standardFee: "15.000đ",
            fastFee: "25.000đ",
            time: "1-2 ngày",
            freeThreshold: "300.000đ"
        },
        {
            id: "nearby",
            name: "Các tỉnh lân cận",
            standardFee: "20.000đ",
            fastFee: "35.000đ",
            time: "2-3 ngày",
            freeThreshold: "500.000đ"
        },
        {
            id: "regional",
            name: "Miền Bắc, Miền Trung",
            standardFee: "25.000đ",
            fastFee: "40.000đ",
            time: "3-4 ngày",
            freeThreshold: "700.000đ"
        },
        {
            id: "southern",
            name: "Miền Nam, Tây Nguyên",
            standardFee: "30.000đ",
            fastFee: "45.000đ",
            time: "4-5 ngày",
            freeThreshold: "800.000đ"
        },
        {
            id: "remote",
            name: "Vùng xa, hải đảo",
            standardFee: "40.000đ",
            fastFee: "60.000đ",
            time: "5-7 ngày",
            freeThreshold: "1.000.000đ"
        }
    ];

    const trackingSteps = [
        { icon: "📦", title: "Đóng gói", desc: "Sản phẩm được đóng gói cẩn thận" },
        { icon: "✓", title: "Xác nhận", desc: "Đơn hàng được xác nhận và xuất kho" },
        { icon: "🚚", title: "Vận chuyển", desc: "Hàng đang trên đường giao đến bạn" },
        { icon: "📍", title: "Giao hàng", desc: "Shipper đang giao hàng đến địa chỉ" },
        { icon: "✅", title: "Hoàn thành", desc: "Giao hàng thành công" }
    ];

    const shippingNotes = [
        {
            icon: "🏠",
            title: "Giao hàng tận nơi",
            description: "Giao hàng tận địa chỉ đã cung cấp, miễn phí lên lầu"
        },
        {
            icon: "📞",
            title: "Liên hệ trước khi giao",
            description: "Shipper sẽ gọi điện trước 15-30 phút"
        },
        {
            icon: "📦",
            title: "Kiểm tra hàng",
            description: "Được kiểm tra sản phẩm trước khi thanh toán"
        },
        {
            icon: "🔄",
            title: "Giao lại miễn phí",
            description: "Nếu lần đầu không gặp, sẽ giao lại 1 lần miễn phí"
        }
    ];

    const faqs = [
        {
            question: "Làm thế nào để theo dõi đơn hàng?",
            answer: "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập tài khoản và vào mục 'Đơn hàng của tôi' hoặc sử dụng mã vận đơn trên trang tra cứu."
        },
        {
            question: "Tôi có thể thay đổi địa chỉ giao hàng không?",
            answer: "Bạn có thể thay đổi địa chỉ trong vòng 1 giờ sau khi đặt hàng bằng cách liên hệ hotline."
        },
        {
            question: "Phí ship được tính như thế nào?",
            answer: "Phí ship được tính dựa trên khoảng cách, khối lượng và phương thức giao hàng bạn chọn."
        },
        {
            question: "Nếu không có nhà khi ship giao hàng?",
            answer: "Shipper sẽ liên hệ và hẹn lại thời gian giao hàng thuận tiện cho bạn (1 lần miễn phí)."
        },
        {
            question: "Giao hàng có đúng giờ không?",
            answer: "Chúng tôi cam kết giao hàng đúng khung giờ đã hẹn. Nếu trễ quá 2 giờ, bạn được miễn phí ship."
        }
    ];

    return (
        <div className="shipping-page">
            <div className="shipping-hero">
                <h1>Chính sách giao hàng</h1>
                <p>Giao hàng nhanh chóng, an toàn và miễn phí cho đơn hàng từ 300K</p>
            </div>

            <div className="shipping-content">
                <div className="shipping-methods-section">
                    <h2>Phương thức giao hàng</h2>
                    <div className="methods-grid">
                        {shippingMethods.map(method => (
                            <div key={method.id} className="method-card">
                                <div className="method-header">
                                    <span className="method-icon">{method.icon}</span>
                                    <div>
                                        <h3>{method.name}</h3>
                                        <p className="method-time">⏱️ {method.time}</p>
                                    </div>
                                </div>
                                <p className="method-description">{method.description}</p>
                                <div className="method-fee">
                                    <span>Phí vận chuyển:</span>
                                    <strong>{method.fee}</strong>
                                </div>
                                <ul className="method-features">
                                    {method.features.map((feature, idx) => (
                                        <li key={idx}>✓ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shipping-fees-section">
                    <h2>Phí vận chuyển theo khu vực</h2>
                    <div className="region-tabs">
                        {regionFees.map(region => (
                            <button
                                key={region.id}
                                className={`region-tab ${selectedRegion === region.id ? "active" : ""}`}
                                onClick={() => setSelectedRegion(region.id)}
                            >
                                {region.name}
                            </button>
                        ))}
                    </div>
                    <div className="region-details">
                        {regionFees
                            .filter(r => r.id === selectedRegion)
                            .map(region => (
                                <div key={region.id} className="region-info">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Phí tiêu chuẩn:</span>
                                            <span className="info-value">{region.standardFee}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Phí nhanh:</span>
                                            <span className="info-value">{region.fastFee}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Thời gian:</span>
                                            <span className="info-value">{region.time}</span>
                                        </div>
                                        <div className="info-item highlight">
                                            <span className="info-label">Miễn phí từ:</span>
                                            <span className="info-value">{region.freeThreshold}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="tracking-section">
                    <h2>Quy trình vận chuyển</h2>
                    <div className="tracking-timeline">
                        {trackingSteps.map((step, index) => (
                            <div key={index} className="tracking-step">
                                <div className="step-icon">{step.icon}</div>
                                <div className="step-info">
                                    <h4>{step.title}</h4>
                                    <p>{step.desc}</p>
                                </div>
                                {index < trackingSteps.length - 1 && (
                                    <div className="step-line"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shipping-notes-section">
                    <h2>Lưu ý khi nhận hàng</h2>
                    <div className="notes-grid">
                        {shippingNotes.map((note, index) => (
                            <div key={index} className="note-card">
                                <span className="note-icon">{note.icon}</span>
                                <h3>{note.title}</h3>
                                <p>{note.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shipping-faq">
                    <h2>Câu hỏi thường gặp</h2>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <details key={index} className="faq-item">
                                <summary>{faq.question}</summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>

                <div className="shipping-guarantee">
                    <h2>🚚 Cam kết vận chuyển</h2>
                    <div className="guarantee-grid">
                        <div className="guarantee-item">
                            <strong>Giao hàng đúng hẹn</strong>
                            <p>Hoàn phí ship nếu giao trễ quá 2 giờ</p>
                        </div>
                        <div className="guarantee-item">
                            <strong>Đóng gói cẩn thận</strong>
                            <p>Bảo vệ hàng hóa tối đa trong quá trình vận chuyển</p>
                        </div>
                        <div className="guarantee-item">
                            <strong>Hỗ trợ 24/7</strong>
                            <p>Hotline: 1900 1234 luôn sẵn sàng hỗ trợ</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
