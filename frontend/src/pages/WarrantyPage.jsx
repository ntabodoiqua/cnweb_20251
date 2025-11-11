import React, { useState } from "react";
import "./WarrantyPage.css";

export default function WarrantyPage() {
    const [selectedProduct, setSelectedProduct] = useState("electronics");

    const warrantyPeriods = [
        {
            id: "electronics",
            name: "Điện tử, điện máy",
            icon: "📱",
            period: "12-24 tháng",
            description: "Bảo hành chính hãng từ nhà sản xuất",
            coverage: ["Lỗi kỹ thuật", "Hư hỏng linh kiện", "Lỗi phần mềm"]
        },
        {
            id: "fashion",
            name: "Thời trang",
            icon: "👕",
            period: "30 ngày",
            description: "Đổi size, màu sắc trong 30 ngày",
            coverage: ["Lỗi may", "Phai màu", "Đổi size"]
        },
        {
            id: "furniture",
            name: "Nội thất, gia dụng",
            icon: "🪑",
            period: "6-12 tháng",
            description: "Bảo hành vật liệu và lắp đặt",
            coverage: ["Lỗi nguyên liệu", "Vấn đề kết cấu", "Hỗ trợ lắp đặt"]
        },
        {
            id: "cosmetics",
            name: "Mỹ phẩm, làm đẹp",
            icon: "💄",
            period: "7 ngày",
            description: "Đổi trả nếu dị ứng hoặc không phù hợp",
            coverage: ["Dị ứng da", "Không đúng mô tả", "Hết hạn"]
        }
    ];

    const warrantySteps = [
        {
            step: 1,
            title: "Liên hệ bảo hành",
            description: "Gọi hotline hoặc mang sản phẩm đến trung tâm bảo hành",
            icon: "📞"
        },
        {
            step: 2,
            title: "Kiểm tra điều kiện",
            description: "Nhân viên kiểm tra sản phẩm và phiếu bảo hành",
            icon: "🔍"
        },
        {
            step: 3,
            title: "Tiếp nhận sửa chữa",
            description: "Sản phẩm được tiếp nhận và báo thời gian sửa",
            icon: "🔧"
        },
        {
            step: 4,
            title: "Sửa chữa/Đổi mới",
            description: "Sửa chữa hoặc đổi mới sản phẩm nếu không sửa được",
            icon: "✨"
        },
        {
            step: 5,
            title: "Trả hàng",
            description: "Nhận lại sản phẩm đã được bảo hành",
            icon: "✅"
        }
    ];

    const warrantyConditions = [
        {
            icon: "✓",
            title: "Trong thời hạn bảo hành",
            description: "Sản phẩm còn trong thời gian bảo hành ghi trên phiếu"
        },
        {
            icon: "✓",
            title: "Có phiếu bảo hành",
            description: "Xuất trình phiếu bảo hành hoặc hóa đơn mua hàng"
        },
        {
            icon: "✓",
            title: "Tem bảo hành nguyên vẹn",
            description: "Tem bảo hành chưa bị rách, tẩy xóa hoặc thay đổi"
        },
        {
            icon: "✓",
            title: "Lỗi từ nhà sản xuất",
            description: "Sản phẩm bị lỗi do quá trình sản xuất, không do người dùng"
        }
    ];

    const notCovered = [
        "Sản phẩm bị rơi, va đập, ngấm nước do người dùng",
        "Tự ý tháo, sửa chữa hoặc thay đổi cấu trúc sản phẩm",
        "Sử dụng sai cách, không đúng hướng dẫn",
        "Thiên tai, hỏa hoạn, sự cố điện áp",
        "Hết thời hạn bảo hành hoặc không có phiếu bảo hành"
    ];

    const warrantyLocations = [
        {
            city: "Hà Nội",
            address: "123 Trần Duy Hưng, Cầu Giấy",
            phone: "024.1234.5678",
            hours: "8:00 - 18:00 (T2-T7)"
        },
        {
            city: "TP. Hồ Chí Minh",
            address: "456 Nguyễn Văn Linh, Quận 7",
            phone: "028.1234.5678",
            hours: "8:00 - 18:00 (T2-T7)"
        },
        {
            city: "Đà Nẵng",
            address: "789 Lê Duẩn, Hải Châu",
            phone: "0236.123.456",
            hours: "8:00 - 17:00 (T2-T6)"
        }
    ];

    const faqs = [
        {
            question: "Bảo hành có mất phí không?",
            answer: "Bảo hành hoàn toàn miễn phí nếu sản phẩm còn trong thời hạn và đáp ứng điều kiện bảo hành."
        },
        {
            question: "Mất phiếu bảo hành thì có được bảo hành không?",
            answer: "Có thể bảo hành nếu có hóa đơn mua hàng hoặc kiểm tra serial number của sản phẩm."
        },
        {
            question: "Thời gian bảo hành mất bao lâu?",
            answer: "Thông thường từ 3-7 ngày làm việc. Trường hợp phức tạp có thể lên đến 15 ngày."
        },
        {
            question: "Có được đổi sản phẩm mới không?",
            answer: "Nếu sản phẩm lỗi 3 lần trong thời gian bảo hành hoặc không sửa được, sẽ được đổi sản phẩm mới."
        },
        {
            question: "Bảo hành có được gia hạn không?",
            answer: "Một số sản phẩm có gói bảo hành mở rộng có phí. Liên hệ để biết thêm chi tiết."
        }
    ];

    const selectedProductInfo = warrantyPeriods.find(p => p.id === selectedProduct);

    return (
        <div className="warranty-page">
            <div className="warranty-hero">
                <h1>Chính sách bảo hành</h1>
                <p>Bảo hành chính hãng, uy tín và nhanh chóng</p>
            </div>

            <div className="warranty-content">
                <div className="warranty-types-section">
                    <h2>Thời gian bảo hành theo loại sản phẩm</h2>
                    <div className="product-types-grid">
                        {warrantyPeriods.map(product => (
                            <div
                                key={product.id}
                                className={`product-type-card ${selectedProduct === product.id ? "active" : ""}`}
                                onClick={() => setSelectedProduct(product.id)}
                            >
                                <span className="product-icon">{product.icon}</span>
                                <h3>{product.name}</h3>
                                <div className="warranty-period">{product.period}</div>
                                <p>{product.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedProductInfo && (
                    <div className="coverage-section">
                        <h2>Phạm vi bảo hành - {selectedProductInfo.name}</h2>
                        <div className="coverage-list">
                            {selectedProductInfo.coverage.map((item, index) => (
                                <div key={index} className="coverage-item">
                                    <span className="check-icon">✓</span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="warranty-process-section">
                    <h2>Quy trình bảo hành</h2>
                    <div className="process-steps">
                        {warrantySteps.map((item) => (
                            <div key={item.step} className="process-step">
                                <div className="step-icon">{item.icon}</div>
                                <div className="step-number">Bước {item.step}</div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="warranty-conditions-section">
                    <h2>Điều kiện bảo hành</h2>
                    <div className="conditions-grid">
                        {warrantyConditions.map((condition, index) => (
                            <div key={index} className="condition-card">
                                <div className="condition-icon">{condition.icon}</div>
                                <h3>{condition.title}</h3>
                                <p>{condition.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="not-covered-section">
                    <h2>⚠️ Trường hợp không được bảo hành</h2>
                    <ul className="not-covered-list">
                        {notCovered.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="warranty-locations-section">
                    <h2>Trung tâm bảo hành</h2>
                    <div className="locations-grid">
                        {warrantyLocations.map((location, index) => (
                            <div key={index} className="location-card">
                                <h3>📍 {location.city}</h3>
                                <p><strong>Địa chỉ:</strong> {location.address}</p>
                                <p><strong>Điện thoại:</strong> <a href={`tel:${location.phone.replace(/\./g, '')}`}>{location.phone}</a></p>
                                <p><strong>Giờ làm việc:</strong> {location.hours}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="warranty-faq">
                    <h2>Câu hỏi thường gặp về bảo hành</h2>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <details key={index} className="faq-item">
                                <summary>{faq.question}</summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>

                <div className="warranty-support">
                    <h2>🛠️ Cần hỗ trợ bảo hành?</h2>
                    <p>Liên hệ ngay với chúng tôi để được tư vấn</p>
                    <div className="support-buttons">
                        <button className="btn-primary">📞 Hotline: 1900 1234</button>
                        <button className="btn-secondary">💬 Chat với CSKH</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
