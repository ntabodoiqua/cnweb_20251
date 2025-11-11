import React, { useState } from "react";
import "./HelpPage.css";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = [
        { id: "all", name: "Tất cả", icon: "📚" },
        { id: "account", name: "Tài khoản", icon: "👤" },
        { id: "order", name: "Đơn hàng", icon: "📦" },
        { id: "payment", name: "Thanh toán", icon: "💳" },
        { id: "shipping", name: "Vận chuyển", icon: "🚚" },
    ];

    const faqs = [
        {
            category: "account",
            question: "Làm thế nào để tạo tài khoản?",
            answer: "Bạn có thể tạo tài khoản bằng cách nhấp vào nút 'Đăng ký' ở góc trên cùng bên phải và điền thông tin của bạn."
        },
        {
            category: "order",
            question: "Làm thế nào để theo dõi đơn hàng?",
            answer: "Bạn có thể theo dõi đơn hàng trong phần 'Đơn hàng của tôi' sau khi đăng nhập."
        },
        {
            category: "payment",
            question: "Những phương thức thanh toán nào được hỗ trợ?",
            answer: "Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, thẻ ghi nợ, ví điện tử và COD."
        },
        {
            category: "shipping",
            question: "Thời gian giao hàng là bao lâu?",
            answer: "Thời gian giao hàng tiêu chuẩn là 3-5 ngày làm việc kể từ khi đơn hàng được xác nhận."
        },
    ];

    const supportCards = [
        {
            title: "Email hỗ trợ",
            description: "support@example.com",
            icon: "📧",
            link: "mailto:support@example.com"
        },
        {
            title: "Hotline",
            description: "1900 1234",
            icon: "📞",
            link: "tel:19001234"
        },
        {
            title: "Chat trực tuyến",
            description: "8:00 - 22:00 hàng ngày",
            icon: "💬",
            link: "#chat"
        },
    ];

    const filteredFaqs = faqs.filter(faq =>
        (activeCategory === "all" || faq.category === activeCategory) &&
        (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="help-page">
            <div className="help-hero">
                <h1>Trung tâm trợ giúp</h1>
                <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button>🔍</button>
                </div>
            </div>

            <div className="help-content">
                <div className="support-cards">
                    {supportCards.map((card, index) => (
                        <a key={index} href={card.link} className="support-card">
                            <span className="card-icon">{card.icon}</span>
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </a>
                    ))}
                </div>

                <div className="faq-section">
                    <h2>Câu hỏi thường gặp</h2>
                    <div className="category-tabs">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="faq-list">
                        {filteredFaqs.map((faq, index) => (
                            <details key={index} className="faq-item">
                                <summary>{faq.question}</summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
