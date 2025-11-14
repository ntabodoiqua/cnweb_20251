# Home Page Components

Components tái sử dụng cho trang chủ HUSTBuy E-Commerce.

## 📁 Cấu Trúc Components

```
components/home/
├── HeroBanner.jsx           # Banner carousel chính
├── PromotionBanners.jsx     # Các thẻ khuyến mãi
├── CategoriesSection.jsx    # Danh mục sản phẩm
├── FlashSaleSection.jsx     # Flash sale với countdown
├── ProductsSection.jsx      # Section sản phẩm có thể tái sử dụng
├── ProductCard.jsx          # Card sản phẩm đơn lẻ
├── BrandsSection.jsx        # Thương hiệu nổi bật
├── TestimonialsSection.jsx  # Đánh giá khách hàng
└── index.js                 # Export tập trung
```

## 🎯 Sử Dụng Components

### 1. HeroBanner

Banner carousel hiển thị ở đầu trang.

```jsx
import { HeroBanner } from "../components/home";

<HeroBanner slides={bannerSlides} />;
```

**Props:**

- `slides` (array): Mảng các slide banner
  - `id` (number): ID duy nhất
  - `image` (string): URL hình ảnh
  - `title` (string): Tiêu đề chính
  - `subtitle` (string): Mô tả phụ
  - `buttonText` (string): Text nút CTA
  - `link` (string): URL điều hướng
  - `bgColor` (string): Màu nền button

---

### 2. PromotionBanners

Hiển thị các thẻ khuyến mãi/ưu đãi.

```jsx
import { PromotionBanners } from "../components/home";

<PromotionBanners banners={promotionBanners} />;
```

**Props:**

- `banners` (array): Mảng các promotion
  - `id` (number): ID duy nhất
  - `icon` (node): Icon React
  - `title` (string): Tiêu đề
  - `subtitle` (string): Mô tả
  - `color` (string): Màu chủ đạo

---

### 3. CategoriesSection

Hiển thị grid danh mục sản phẩm.

```jsx
import { CategoriesSection } from "../components/home";

<CategoriesSection
  categories={categories}
  onCategoryClick={handleCategoryClick}
/>;
```

**Props:**

- `categories` (array): Mảng danh mục
  - `id` (number): ID duy nhất
  - `name` (string): Tên danh mục
  - `slug` (string): URL slug
  - `image` (string): URL hình ảnh
  - `icon` (node): Icon React (optional)
  - `productCount` (number): Số lượng sản phẩm
- `onCategoryClick` (function): Callback khi click danh mục (optional)

---

### 4. FlashSaleSection

Section flash sale với countdown timer.

```jsx
import { FlashSaleSection } from "../components/home";

<FlashSaleSection
  products={flashSaleProducts}
  onProductClick={handleProductClick}
  formatPrice={formatPrice}
  initialTime={{ hours: 5, minutes: 23, seconds: 45 }}
/>;
```

**Props:**

- `products` (array): Mảng sản phẩm flash sale
- `onProductClick` (function): Callback khi click sản phẩm
- `formatPrice` (function): Hàm format giá tiền
- `initialTime` (object): Thời gian countdown ban đầu (optional)
  - `hours` (number)
  - `minutes` (number)
  - `seconds` (number)

---

### 5. ProductsSection

Component tổng quát cho các section sản phẩm (Featured, Daily Deals, etc.)

```jsx
import { ProductsSection } from "../components/home";
import { FireOutlined } from "@ant-design/icons";

<ProductsSection
  title="Sản Phẩm Nổi Bật"
  icon={<FireOutlined />}
  products={featuredProducts}
  onProductClick={handleProductClick}
  formatPrice={formatPrice}
  showViewAll={true}
  viewAllLink="/products"
  viewAllText="Xem thêm"
  showProgress={false}
/>;
```

**Props:**

- `title` (string): Tiêu đề section
- `icon` (node): Icon React cho tiêu đề
- `products` (array): Mảng sản phẩm
- `onProductClick` (function): Callback khi click sản phẩm
- `formatPrice` (function): Hàm format giá tiền
- `showProgress` (bool): Hiển thị progress bar (default: false)
- `showViewAll` (bool): Hiển thị nút "Xem tất cả" (default: false)
- `viewAllLink` (string): Link cho nút "Xem tất cả" (default: "/products")
- `viewAllText` (string): Text cho nút (default: "Xem thêm")

---

### 6. ProductCard

Card sản phẩm đơn lẻ - sử dụng trong ProductsSection và FlashSaleSection.

```jsx
import { ProductCard } from "../components/home";

<ProductCard
  product={product}
  onProductClick={handleProductClick}
  formatPrice={formatPrice}
  showProgress={true}
/>;
```

**Props:**

- `product` (object): Thông tin sản phẩm
  - `id` (number): ID sản phẩm
  - `name` (string): Tên sản phẩm
  - `image` (string): URL hình ảnh
  - `price` (number): Giá hiện tại
  - `salePrice` (number): Giá sale (optional)
  - `originalPrice` (number): Giá gốc (optional)
  - `rating` (number): Đánh giá (0-5)
  - `reviews` (number): Số lượng đánh giá
  - `discount` (number): % giảm giá (optional)
  - `badge` (string): Badge text (optional)
  - `sold` (number): Số lượng đã bán (optional)
  - `stock` (number): Tồn kho (optional)
- `onProductClick` (function): Callback khi click
- `formatPrice` (function): Hàm format giá
- `showProgress` (bool): Hiển thị thanh progress (default: false)

---

### 7. BrandsSection

Hiển thị grid các thương hiệu nổi bật.

```jsx
import { BrandsSection } from "../components/home";

<BrandsSection brands={topBrands} title="Thương Hiệu Nổi Bật" />;
```

**Props:**

- `brands` (array): Mảng thương hiệu
  - `id` (number): ID duy nhất
  - `name` (string): Tên thương hiệu
  - `logo` (string): URL logo
  - `productsCount` (number): Số sản phẩm
- `title` (string): Tiêu đề section (optional, default: "Thương Hiệu Nổi Bật")

---

### 8. TestimonialsSection

Carousel đánh giá khách hàng.

```jsx
import { TestimonialsSection } from "../components/home";

<TestimonialsSection
  testimonials={testimonials}
  title="Khách Hàng Nói Gì Về Chúng Tôi"
/>;
```

**Props:**

- `testimonials` (array): Mảng testimonials
  - `id` (number): ID duy nhất
  - `name` (string): Tên khách hàng
  - `avatar` (string): URL ảnh đại diện
  - `rating` (number): Đánh giá (0-5)
  - `comment` (string): Nội dung đánh giá
  - `product` (string): Sản phẩm đã mua
- `title` (string): Tiêu đề section (optional)

---

## 💡 Ví Dụ Sử Dụng Tổng Hợp

```jsx
import React from "react";
import { message } from "antd";
import { FireOutlined, StarOutlined } from "@ant-design/icons";
import {
  HeroBanner,
  PromotionBanners,
  CategoriesSection,
  FlashSaleSection,
  ProductsSection,
  BrandsSection,
  TestimonialsSection,
} from "../components/home";

const MyPage = () => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleProductClick = (productId) => {
    message.info(`Clicked product ${productId}`);
  };

  return (
    <div className="my-page">
      <HeroBanner slides={bannerData} />

      <PromotionBanners banners={promoData} />

      <CategoriesSection categories={categoryData} />

      <FlashSaleSection
        products={flashSaleData}
        onProductClick={handleProductClick}
        formatPrice={formatPrice}
      />

      <ProductsSection
        title="Sản Phẩm Nổi Bật"
        icon={<FireOutlined />}
        products={featuredData}
        onProductClick={handleProductClick}
        formatPrice={formatPrice}
        showViewAll={true}
      />

      <BrandsSection brands={brandsData} />

      <TestimonialsSection testimonials={testimonialsData} />
    </div>
  );
};

export default MyPage;
```

## 🎨 Styling

Tất cả components sử dụng CSS classes từ `home.css`. Đảm bảo import CSS:

```jsx
import "../styles/home.css";
```

## 🔧 Tùy Chỉnh

### Thay đổi màu sắc

Components sử dụng màu chủ đạo `#ee4d2d`. Để thay đổi, chỉnh sửa trong `home.css`:

```css
/* Tìm và thay thế */
#ee4d2d -> your-color
rgba(238, 77, 45, x) -> rgba(your-rgb, x)
```

### Thêm animations

Components đã tích hợp sẵn animations từ `home.css`. Để tắt animations:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

## 📱 Responsive

Tất cả components đã được tối ưu responsive:

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## ♿ Accessibility

Components tuân thủ chuẩn WCAG:

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Alt text cho images

## 🚀 Performance

- Lazy loading cho images
- Memoization cho callbacks
- Optimized re-renders
- Code splitting ready

## 📄 License

MIT © HUSTBuy E-Commerce