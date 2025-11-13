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

// Danh mục sản phẩm chính
export const categories = [
  {
    id: 1,
    name: "Điện Tử",
    slug: "electronics",
    icon: "💻",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop",
    productCount: 1234,
    color: "#1890ff",
  },
  {
    id: 2,
    name: "Điện Thoại",
    slug: "mobile",
    icon: "📱",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    productCount: 856,
    color: "#722ed1",
  },
  {
    id: 3,
    name: "Thời Trang",
    slug: "fashion",
    icon: "👕",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop",
    productCount: 2145,
    color: "#eb2f96",
  },
  {
    id: 4,
    name: "Đồ Gia Dụng",
    slug: "home",
    icon: "🏠",
    image:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=300&fit=crop",
    productCount: 967,
    color: "#fa8c16",
  },
  {
    id: 5,
    name: "Sách",
    slug: "books",
    icon: "📚",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=300&fit=crop",
    productCount: 1523,
    color: "#52c41a",
  },
  {
    id: 6,
    name: "Thể Thao",
    slug: "sports",
    icon: "⚽",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop",
    productCount: 789,
    color: "#13c2c2",
  },
  {
    id: 7,
    name: "Làm Đẹp",
    slug: "beauty",
    icon: "💄",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop",
    productCount: 1098,
    color: "#f759ab",
  },
  {
    id: 8,
    name: "Đồ Chơi",
    slug: "toys",
    icon: "🧸",
    image:
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=300&fit=crop",
    productCount: 654,
    color: "#fadb14",
  },
];

// Flash Sale - Sản phẩm khuyến mãi trong thời gian giới hạn
export const flashSaleProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
    image:
      "https://images.unsplash.com/photo-1709178295038-acbeec786fcf?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    originalPrice: 29990000,
    salePrice: 24990000,
    discount: 17,
    sold: 234,
    stock: 50,
    rating: 4.8,
    reviews: 1250,
  },
  {
    id: 2,
    name: "MacBook Air M3 2024",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    originalPrice: 28990000,
    salePrice: 25990000,
    discount: 10,
    sold: 156,
    stock: 30,
    rating: 4.9,
    reviews: 892,
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    originalPrice: 27990000,
    salePrice: 22990000,
    discount: 18,
    sold: 189,
    stock: 40,
    rating: 4.7,
    reviews: 756,
  },
  {
    id: 4,
    name: "Sony WH-1000XM5 Headphones",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
    originalPrice: 8990000,
    salePrice: 6490000,
    discount: 28,
    sold: 423,
    stock: 80,
    rating: 4.9,
    reviews: 2134,
  },
  {
    id: 5,
    name: "iPad Pro 12.9 inch M2",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    originalPrice: 25990000,
    salePrice: 22990000,
    discount: 12,
    sold: 178,
    stock: 35,
    rating: 4.8,
    reviews: 645,
  },
  {
    id: 6,
    name: "Apple Watch Series 9",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
    originalPrice: 10990000,
    salePrice: 8990000,
    discount: 18,
    sold: 312,
    stock: 60,
    rating: 4.7,
    reviews: 1089,
  },
];

// Sản phẩm nổi bật / Bán chạy
export const featuredProducts = [
  {
    id: 11,
    name: "Áo Thun Nam Basic Premium",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    price: 299000,
    originalPrice: 499000,
    discount: 40,
    sold: 5234,
    rating: 4.6,
    reviews: 3421,
    category: "fashion",
    badge: "Bán chạy",
  },
  {
    id: 12,
    name: "Giày Sneaker Nam Nữ Cao Cấp",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    price: 890000,
    originalPrice: 1290000,
    discount: 31,
    sold: 2156,
    rating: 4.8,
    reviews: 1876,
    category: "fashion",
    badge: "Yêu thích",
  },
  {
    id: 13,
    name: "Balo Laptop Cao Cấp",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    price: 450000,
    originalPrice: 750000,
    discount: 40,
    sold: 3421,
    rating: 4.7,
    reviews: 2345,
    category: "fashion",
    badge: "Giảm sốc",
  },
  {
    id: 14,
    name: "Nồi Chiên Không Dầu 5L",
    image:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    price: 1290000,
    originalPrice: 2490000,
    discount: 48,
    sold: 1876,
    rating: 4.9,
    reviews: 1234,
    category: "home",
    badge: "Hot",
  },
  {
    id: 15,
    name: "Máy Lọc Không Khí Xiaomi",
    image:
      "https://images.unsplash.com/photo-1652352529254-5106f4c8e03c?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2490000,
    originalPrice: 3990000,
    discount: 38,
    sold: 987,
    rating: 4.8,
    reviews: 876,
    category: "home",
    badge: "Mới",
  },
  {
    id: 16,
    name: "Sách: Đắc Nhân Tâm",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    price: 79000,
    originalPrice: 129000,
    discount: 39,
    sold: 8765,
    rating: 4.9,
    reviews: 5432,
    category: "books",
    badge: "Best Seller",
  },
  {
    id: 17,
    name: "Tai Nghe Bluetooth AirPods Pro 2",
    image:
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop",
    price: 5490000,
    originalPrice: 6990000,
    discount: 21,
    sold: 1543,
    rating: 4.8,
    reviews: 1098,
    category: "electronics",
    badge: "Cao cấp",
  },
  {
    id: 18,
    name: "Bộ Mỹ Phẩm Dưỡng Da 5in1",
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop",
    price: 890000,
    originalPrice: 1490000,
    discount: 40,
    sold: 2345,
    rating: 4.7,
    reviews: 1876,
    category: "beauty",
    badge: "Deal hot",
  },
];

// Deal trong ngày
export const dailyDeals = [
  {
    id: 21,
    name: "Chuột Gaming RGB",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    price: 199000,
    originalPrice: 499000,
    discount: 60,
    timeLeft: {
      hours: 5,
      minutes: 23,
      seconds: 45,
    },
    sold: 876,
    stock: 124,
    rating: 4.5,
    reviews: 543,
  },
  {
    id: 22,
    name: "Bàn Phím Cơ Gaming",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
    price: 599000,
    originalPrice: 1299000,
    discount: 54,
    timeLeft: {
      hours: 5,
      minutes: 23,
      seconds: 45,
    },
    sold: 654,
    stock: 86,
    rating: 4.7,
    reviews: 432,
  },
  {
    id: 23,
    name: "Webcam Full HD 1080p",
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop",
    price: 399000,
    originalPrice: 899000,
    discount: 56,
    timeLeft: {
      hours: 5,
      minutes: 23,
      seconds: 45,
    },
    sold: 432,
    stock: 68,
    rating: 4.6,
    reviews: 321,
  },
  {
    id: 24,
    name: "Loa Bluetooth JBL",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    price: 790000,
    originalPrice: 1490000,
    discount: 47,
    timeLeft: {
      hours: 5,
      minutes: 23,
      seconds: 45,
    },
    sold: 987,
    stock: 112,
    rating: 4.8,
    reviews: 765,
  },
];

// Thương hiệu nổi bật
export const topBrands = [
  {
    id: 1,
    name: "Apple",
    logo: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=200&h=100&fit=crop",
    productsCount: 234,
  },
  {
    id: 2,
    name: "Samsung",
    logo: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=200&h=100&fit=crop",
    productsCount: 456,
  },
  {
    id: 3,
    name: "Xiaomi",
    logo: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=100&fit=crop",
    productsCount: 567,
  },
  {
    id: 4,
    name: "Sony",
    logo: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=100&fit=crop",
    productsCount: 345,
  },
  {
    id: 5,
    name: "Dell",
    logo: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=200&h=100&fit=crop",
    productsCount: 289,
  },
  {
    id: 6,
    name: "Nike",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=100&fit=crop",
    productsCount: 678,
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
