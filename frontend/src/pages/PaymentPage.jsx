import React, { useState } from "react";
import "./PaymentPage.css";

export default function PaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState("credit-card");

    const paymentMethods = [
        {
            id: "credit-card",
            name: "Thẻ tín dụng/Ghi nợ",
            icon: "💳",
            description: "Thanh toán nhanh chóng và bảo mật với thẻ Visa, MasterCard, JCB",
            fee: "Miễn phí",
            processingTime: "Tức thì",
            features: [
                "Bảo mật SSL 256-bit",
                "Xác thực 3D Secure",
                "Hoàn tiền trong 24h nếu hủy đơn"
            ]
        },
        {
            id: "bank-transfer",
            name: "Chuyển khoản ngân hàng",
            icon: "🏦",
            description: "Chuyển khoản qua Internet Banking hoặc tại quầy",
            fee: "Miễn phí",
            processingTime: "30 phút - 2 giờ",
            features: [
                "Hỗ trợ tất cả ngân hàng trong nước",
                "Chuyển khoản 24/7",
                "Tự động xác nhận thanh toán"
            ]
        },
        {
            id: "e-wallet",
            name: "Ví điện tử",
            icon: "📱",
            description: "Thanh toán qua Momo, ZaloPay, VNPay, ShopeePay",
            fee: "Miễn phí",
            processingTime: "Tức thì",
            features: [
                "Quét mã QR nhanh chóng",
                "Tích điểm thưởng",
                "Ưu đãi từ ví điện tử"
            ]
        },
        {
            id: "cod",
            name: "Thanh toán khi nhận hàng (COD)",
            icon: "💵",
            description: "Thanh toán tiền mặt khi nhận hàng tại nhà",
            fee: "20.000đ - 30.000đ",
            processingTime: "Khi giao hàng",
            features: [
                "Kiểm tra hàng trước khi thanh toán",
                "Thanh toán bằng tiền mặt",
                "Áp dụng cho đơn hàng dưới 5 triệu"
            ]
        },
        {
            id: "installment",
            name: "Trả góp 0%",
            icon: "📊",
            description: "Mua trước trả sau với lãi suất 0%",
            fee: "Miễn phí",
            processingTime: "1-2 ngày",
            features: [
                "Duyệt nhanh trong 5 phút",
                "Kỳ hạn linh hoạt 3-12 tháng",
                "Hồ sơ đơn giản"
            ]
        }
    ];

    const paymentGuide = [
        {
            step: 1,
            title: "Chọn sản phẩm",
            description: "Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán"
        },
        {
            step: 2,
            title: "Điền thông tin",
            description: "Nhập địa chỉ giao hàng và thông tin liên hệ"
        },
        {
            step: 3,
            title: "Chọn phương thức",
            description: "Lựa chọn phương thức thanh toán phù hợp"
        },
        {
            step: 4,
            title: "Xác nhận thanh toán",
            description: "Hoàn tất giao dịch và nhận mã đơn hàng"
        }
    ];

    const faqs = [
        {
            question: "Có được đổi phương thức thanh toán sau khi đặt hàng không?",
            answer: "Bạn có thể liên hệ hotline trong vòng 1 giờ sau khi đặt hàng để thay đổi phương thức thanh toán."
        },
        {
            question: "Thanh toán có an toàn không?",
            answer: "Tất cả giao dịch đều được mã hóa SSL và tuân thủ tiêu chuẩn bảo mật PCI DSS."
        },
        {
            question: "Khi nào tiền sẽ được hoàn lại nếu hủy đơn?",
            answer: "Tiền sẽ được hoàn về tài khoản/ví trong vòng 3-7 ngày làm việc tùy theo phương thức thanh toán."
        },
        {
            question: "Có được sử dụng nhiều phương thức thanh toán cho 1 đơn hàng không?",
            answer: "Hiện tại chỉ hỗ trợ 1 phương thức thanh toán cho mỗi đơn hàng."
        }
    ];

    const selectedMethodInfo = paymentMethods.find(m => m.id === selectedMethod);

    return (
        <div className="payment-page">
            <div className="payment-hero">
                <h1>Hướng dẫn thanh toán</h1>
                <p>Chọn phương thức thanh toán phù hợp với bạn</p>
            </div>

            <div className="payment-content">
                <div className="payment-methods-grid">
                    {paymentMethods.map(method => (
                        <div
                            key={method.id}
                            className={`payment-method-card ${selectedMethod === method.id ? "active" : ""}`}
                            onClick={() => setSelectedMethod(method.id)}
                        >
                            <div className="method-icon">{method.icon}</div>
                            <h3>{method.name}</h3>
                            <p className="method-desc">{method.description}</p>
                            <div className="method-info">
                                <div className="info-item">
                                    <span className="label">Phí:</span>
                                    <span className="value">{method.fee}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Xử lý:</span>
                                    <span className="value">{method.processingTime}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedMethodInfo && (
                    <div className="method-details">
                        <h2>Chi tiết về {selectedMethodInfo.name}</h2>
                        <div className="features-list">
                            {selectedMethodInfo.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <span className="check-icon">✓</span>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="payment-guide-section">
                    <h2>Quy trình thanh toán</h2>
                    <div className="guide-steps">
                        {paymentGuide.map((step) => (
                            <div key={step.step} className="guide-step">
                                <div className="step-number">{step.step}</div>
                                <div className="step-content">
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="security-badges">
                    <h2>Bảo mật thanh toán</h2>
                    <div className="badges-grid">
                        <div className="badge-item">
                            <span className="badge-icon">🔒</span>
                            <h4>SSL 256-bit</h4>
                            <p>Mã hóa dữ liệu</p>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">🛡️</span>
                            <h4>PCI DSS</h4>
                            <p>Chuẩn bảo mật</p>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">✓</span>
                            <h4>3D Secure</h4>
                            <p>Xác thực 2 lớp</p>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">🏦</span>
                            <h4>Ngân hàng</h4>
                            <p>Liên kết trực tiếp</p>
                        </div>
                    </div>
                </div>

                <div className="payment-faq">
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

                <div className="payment-support">
                    <div className="support-card">
                        <h3>💬 Cần hỗ trợ thanh toán?</h3>
                        <p>Liên hệ ngay với chúng tôi</p>
                        <div className="support-buttons">
                            <button className="btn-primary">📞 Hotline: 1900 1234</button>
                            <button className="btn-secondary">📧 Email hỗ trợ</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
