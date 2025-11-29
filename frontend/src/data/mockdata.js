/**
 * Mock data cho trang chủ HUSTBuy E-Commerce
 * Dữ liệu giả để dựng giao diện trước khi ghép API
 */

// Banner slides cho carousel
export const bannerSlides = [
  {
    id: 1,
    title: "Siêu Sale Công Nghệ",
    subtitle: "Giảm đến 50% cho tất cả sản phẩm điện tử",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    buttonText: "Mua ngay",
    link: "/category/electronics",
    bgColor: "#ee4d2d",
  },
  {
    id: 2,
    title: "Thời Trang Xu Hướng 2025",
    subtitle: "Bộ sưu tập mới nhất - Freeship toàn quốc",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop",
    buttonText: "Khám phá",
    link: "/category/fashion",
    bgColor: "#1890ff",
  },
  {
    id: 3,
    title: "Ưu Đãi Sinh Viên",
    subtitle: "Giảm 30% cho sinh viên HUST với mã HUST2025",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=400&fit=crop",
    buttonText: "Nhận ưu đãi",
    link: "/deals/student",
    bgColor: "#52c41a",
  },
  {
    id: 4,
    title: "Đồ Gia Dụng Thông Minh",
    subtitle: "Nâng cấp không gian sống của bạn",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop",
    buttonText: "Xem thêm",
    link: "/category/home",
    bgColor: "#722ed1",
  },
];

// Banner quảng cáo phụ
export const promotionBanners = [
  {
    id: 1,
    title: "Miễn phí vận chuyển",
    subtitle: "Cho đơn hàng từ 0đ",
    icon: "🚚",
    color: "#1890ff",
  },
  {
    id: 2,
    title: "Hoàn tiền 100%",
    subtitle: "Nếu sản phẩm lỗi",
    icon: "💰",
    color: "#52c41a",
  },
  {
    id: 3,
    title: "Hỗ trợ 24/7",
    subtitle: "Tư vấn mọi lúc",
    icon: "💬",
    color: "#722ed1",
  },
  {
    id: 4,
    title: "Thanh toán linh hoạt",
    subtitle: "Nhiều phương thức",
    icon: "💳",
    color: "#fa8c16",
  },
];

// Testimonials - Đánh giá từ khách hàng
export const testimonials = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    comment:
      "Sản phẩm chất lượng, giao hàng nhanh. Tôi rất hài lòng với dịch vụ của HUSTBuy!",
    product: "iPhone 15 Pro Max",
    date: "2025-11-10",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    comment: "Shop uy tín, giá tốt. Sẽ ủng hộ dài dài!",
    product: "MacBook Air M3",
    date: "2025-11-09",
  },
  {
    id: 3,
    name: "Lê Minh Châu",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 4,
    comment:
      "Đóng gói cẩn thận, sản phẩm đẹp. Chỉ có điều giao hơi chậm 1 ngày.",
    product: "Samsung Galaxy S24",
    date: "2025-11-08",
  },
];

// SEO Meta data
export const homePageMeta = {
  title: "HUSTBuy - Sàn Thương Mại Điện Tử Uy Tín | Mua Sắm Online Giá Tốt",
  description:
    "HUSTBuy - Nền tảng mua sắm trực tuyến hàng đầu với hàng nghìn sản phẩm chính hãng, giá tốt nhất. Miễn phí vận chuyển, thanh toán linh hoạt, bảo hành chính hãng.",
  keywords:
    "mua sắm online, thương mại điện tử, sản phẩm chính hãng, điện tử, thời trang, HUSTBuy, giá rẻ, ưu đãi",
  ogImage:
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=630&fit=crop",
  ogUrl: "https://hustbuy.com",
};
