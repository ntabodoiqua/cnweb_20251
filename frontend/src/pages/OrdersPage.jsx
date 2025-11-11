import React, { useState } from "react";
import "./OrdersPage.css";

export default function OrdersPage() {
    const [orderCode, setOrderCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [orderInfo, setOrderInfo] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        setError("");

        if (!orderCode.trim()) {
            setError("Vui lòng nhập mã đơn hàng");
            return;
        }

        setIsSearching(true);

        // Simulate API call
        setTimeout(() => {
            setOrderInfo({
                code: orderCode,
                status: "delivering",
                date: "15/03/2024",
                estimatedDelivery: "20/03/2024",
                items: [
                    { name: "Sản phẩm A", quantity: 2, price: 500000 },
                    { name: "Sản phẩm B", quantity: 1, price: 300000 }
                ],
                total: 1300000,
                shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
                timeline: [
                    { status: "Đã đặt hàng", time: "15/03/2024 10:30", completed: true },
                    { status: "Đã xác nhận", time: "15/03/2024 14:00", completed: true },
                    { status: "Đang giao hàng", time: "18/03/2024 08:00", completed: true },
                    { status: "Đã giao hàng", time: "", completed: false }
                ]
            });
            setIsSearching(false);
        }, 1000);
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { text: "Chờ xác nhận", color: "#ff9800", icon: "⏳" },
            confirmed: { text: "Đã xác nhận", color: "#2196f3", icon: "✓" },
            delivering: { text: "Đang giao hàng", color: "#9c27b0", icon: "🚚" },
            delivered: { text: "Đã giao hàng", color: "#4caf50", icon: "✓" },
            cancelled: { text: "Đã hủy", color: "#f44336", icon: "✕" }
        };
        return statusMap[status] || statusMap.pending;
    };

    return (
        <div className="orders-page">
            <div className="orders-hero">
                <h1>Tra cứu đơn hàng</h1>
                <p>Nhập thông tin để kiểm tra trạng thái đơn hàng của bạn</p>
            </div>

            <div className="orders-content">
                <div className="search-section">
                    <form onSubmit={handleSearch} className="order-search-form">
                        <div className="form-group">
                            <label htmlFor="orderCode">Mã đơn hàng *</label>
                            <input
                                id="orderCode"
                                type="text"
                                placeholder="Ví dụ: DH123456789"
                                value={orderCode}
                                onChange={(e) => setOrderCode(e.target.value)}
                                className={error ? "error" : ""}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Số điện thoại (không bắt buộc)</label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="search-btn" disabled={isSearching}>
                            {isSearching ? "Đang tìm kiếm..." : "🔍 Tra cứu đơn hàng"}
                        </button>
                    </form>

                    <div className="help-info">
                        <h3>📞 Cần hỗ trợ?</h3>
                        <p>Liên hệ hotline: <strong>1900 1234</strong></p>
                        <p>Thời gian: 8:00 - 22:00 hàng ngày</p>
                    </div>
                </div>

                {orderInfo && (
                    <div className="order-result">
                        <div className="order-header">
                            <div className="order-status-badge" style={{ backgroundColor: getStatusInfo(orderInfo.status).color }}>
                                <span>{getStatusInfo(orderInfo.status).icon}</span>
                                <span>{getStatusInfo(orderInfo.status).text}</span>
                            </div>
                            <div className="order-basic-info">
                                <h2>Đơn hàng #{orderInfo.code}</h2>
                                <p>Ngày đặt: {orderInfo.date}</p>
                                <p>Dự kiến giao: {orderInfo.estimatedDelivery}</p>
                            </div>
                        </div>

                        <div className="order-timeline">
                            <h3>Trạng thái đơn hàng</h3>
                            <div className="timeline">
                                {orderInfo.timeline.map((item, index) => (
                                    <div key={index} className={`timeline-item ${item.completed ? "completed" : ""}`}>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4>{item.status}</h4>
                                            {item.time && <p>{item.time}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-details">
                            <div className="detail-section">
                                <h3>Sản phẩm</h3>
                                <div className="products-list">
                                    {orderInfo.items.map((item, index) => (
                                        <div key={index} className="product-item">
                                            <span className="product-name">{item.name}</span>
                                            <span className="product-quantity">x{item.quantity}</span>
                                            <span className="product-price">{item.price.toLocaleString()}đ</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-total">
                                    <strong>Tổng cộng:</strong>
                                    <strong>{orderInfo.total.toLocaleString()}đ</strong>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Địa chỉ giao hàng</h3>
                                <p>📍 {orderInfo.shippingAddress}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
