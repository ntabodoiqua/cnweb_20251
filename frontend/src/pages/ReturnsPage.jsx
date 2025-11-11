import React, { useState } from "react";
import "./ReturnsPage.css";

export default function ReturnsPage() {
    const [activeTab, setActiveTab] = useState("policy");

    const returnConditions = [
        {
            icon: "📦",
            title: "Sản phẩm còn nguyên vẹn",
            description: "Hàng hóa chưa qua sử dụng, còn nguyên tem mác, nhãn hiệu"
        },
        {
            icon: "📝",
            title: "Có hóa đơn mua hàng",
            description: "Cung cấp hóa đơn hoặc mã đơn hàng khi yêu cầu đổi trả"
        },
        {
            icon: "⏰",
            title: "Trong thời gian quy định",
            description: "Yêu cầu đổi trả trong vòng 7-30 ngày tùy sản phẩm"
        },
        {
            icon: "✓",
            title: "Đầy đủ phụ kiện",
            description: "Sản phẩm kèm theo đầy đủ phụ kiện, quà tặng (nếu có)"
        }
    ];

    const returnReasons = [
        {
            reason: "Lỗi từ nhà sản xuất",
            time: "30 ngày",
            refund: "100%",
            fee: "Miễn phí"
        },
        {
            reason: "Giao sai sản phẩm",
            time: "7 ngày",
            refund: "100%",
            fee: "Miễn phí"
        },
        {
            reason: "Không đúng mô tả",
            time: "7 ngày",
            refund: "100%",
            fee: "Miễn phí"
        },
        {
            reason: "Đổi ý không muốn mua",
            time: "3 ngày",
            refund: "85-95%",
            fee: "Khách trả phí ship"
        }
    ];

    const returnSteps = [
        {
            step: 1,
            title: "Liên hệ bộ phận CSKH",
            description: "Gọi hotline hoặc chat trực tuyến để thông báo yêu cầu đổi trả",
            icon: "📞"
        },
        {
            step: 2,
            title: "Cung cấp thông tin",
            description: "Cung cấp mã đơn hàng, lý do đổi trả và hình ảnh sản phẩm",
            icon: "📋"
        },
        {
            step: 3,
            title: "Chờ xác nhận",
            description: "Đội ngũ CSKH sẽ xác nhận và hướng dẫn trong 2-4 giờ",
            icon: "⏳"
        },
        {
            step: 4,
            title: "Gửi hàng hoặc đổi mới",
            description: "Gửi hàng về hoặc nhận hàng đổi mới tại nhà",
            icon: "🚚"
        },
        {
            step: 5,
            title: "Hoàn tiền/Nhận hàng mới",
            description: "Nhận tiền hoàn hoặc sản phẩm mới trong 3-7 ngày",
            icon: "✅"
        }
    ];

    const faqs = [
        {
            question: "Tôi có thể đổi trả sản phẩm đã mua online tại cửa hàng không?",
            answer: "Có, bạn có thể mang sản phẩm và hóa đơn đến bất kỳ cửa hàng nào của chúng tôi để đổi trả."
        },
        {
            question: "Làm thế nào để biết sản phẩm của tôi có được đổi trả không?",
            answer: "Bạn có thể kiểm tra chính sách đổi trả của từng sản phẩm trên trang chi tiết sản phẩm hoặc liên hệ CSKH."
        },
        {
            question: "Phí đổi trả được tính như thế nào?",
            answer: "Nếu lỗi từ nhà bán, chúng tôi chịu toàn bộ phí vận chuyển. Nếu do đổi ý, khách hàng chịu phí ship về."
        },
        {
            question: "Tôi có thể đổi sang sản phẩm khác không?",
            answer: "Có, bạn có thể đổi sang sản phẩm khác có giá trị tương đương hoặc thanh toán/hoàn tiền chênh lệch."
        },
        {
            question: "Bao lâu để nhận được tiền hoàn?",
            answer: "Sau khi xác nhận sản phẩm đổi trả hợp lệ, tiền sẽ được hoàn về tài khoản trong 3-7 ngày làm việc."
        }
    ];

    const nonReturnableItems = [
        "Sản phẩm vệ sinh cá nhân (mỹ phẩm, nước hoa đã mở seal)",
        "Đồ lót, quần áo bơi",
        "Sản phẩm sale off trên 50%",
        "Sản phẩm theo yêu cầu đặc biệt",
        "Thực phẩm, đồ uống"
    ];

    return (
        <div className="returns-page">
            <div className="returns-hero">
                <h1>Chính sách đổi trả</h1>
                <p>Cam kết đổi trả dễ dàng, minh bạch và nhanh chóng</p>
            </div>

            <div className="returns-content">
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === "policy" ? "active" : ""}`}
                        onClick={() => setActiveTab("policy")}
                    >
                        📜 Chính sách
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "process" ? "active" : ""}`}
                        onClick={() => setActiveTab("process")}
                    >
                        🔄 Quy trình
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "faq" ? "active" : ""}`}
                        onClick={() => setActiveTab("faq")}
                    >
                        ❓ Câu hỏi
                    </button>
                </div>

                {activeTab === "policy" && (
                    <>
                        <div className="conditions-section">
                            <h2>Điều kiện đổi trả</h2>
                            <div className="conditions-grid">
                                {returnConditions.map((condition, index) => (
                                    <div key={index} className="condition-card">
                                        <span className="condition-icon">{condition.icon}</span>
                                        <h3>{condition.title}</h3>
                                        <p>{condition.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="reasons-section">
                            <h2>Thời gian và mức hoàn tiền theo lý do</h2>
                            <div className="reasons-table">
                                <div className="table-header">
                                    <div>Lý do đổi trả</div>
                                    <div>Thời gian</div>
                                    <div>Hoàn tiền</div>
                                    <div>Phí vận chuyển</div>
                                </div>
                                {returnReasons.map((item, index) => (
                                    <div key={index} className="table-row">
                                        <div>{item.reason}</div>
                                        <div>{item.time}</div>
                                        <div className="refund-amount">{item.refund}</div>
                                        <div>{item.fee}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="non-returnable-section">
                            <h2>⚠️ Sản phẩm không áp dụng đổi trả</h2>
                            <ul className="non-returnable-list">
                                {nonReturnableItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {activeTab === "process" && (
                    <div className="process-section">
                        <h2>Quy trình đổi trả 5 bước</h2>
                        <div className="steps-container">
                            {returnSteps.map((item) => (
                                <div key={item.step} className="step-card">
                                    <div className="step-icon">{item.icon}</div>
                                    <div className="step-number">Bước {item.step}</div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="contact-box">
                            <h3>📞 Liên hệ để được hỗ trợ đổi trả</h3>
                            <div className="contact-methods">
                                <div className="contact-item">
                                    <strong>Hotline:</strong>
                                    <a href="tel:19001234">1900 1234</a>
                                </div>
                                <div className="contact-item">
                                    <strong>Email:</strong>
                                    <a href="mailto:returns@example.com">returns@example.com</a>
                                </div>
                                <div className="contact-item">
                                    <strong>Chat:</strong>
                                    <span>8:00 - 22:00 hàng ngày</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "faq" && (
                    <div className="faq-section">
                        <h2>Câu hỏi thường gặp về đổi trả</h2>
                        <div className="faq-list">
                            {faqs.map((faq, index) => (
                                <details key={index} className="faq-item">
                                    <summary>{faq.question}</summary>
                                    <p>{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                )}

                <div className="guarantee-banner">
                    <h2>🛡️ Cam kết của chúng tôi</h2>
                    <div className="guarantee-items">
                        <div className="guarantee-item">
                            <strong>Đổi trả miễn phí</strong>
                            <p>Với lỗi từ nhà sản xuất</p>
                        </div>
                        <div className="guarantee-item">
                            <strong>Xử lý nhanh chóng</strong>
                            <p>Phản hồi trong 2-4 giờ</p>
                        </div>
                        <div className="guarantee-item">
                            <strong>Hoàn tiền đúng hạn</strong>
                            <p>Trong 3-7 ngày làm việc</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
