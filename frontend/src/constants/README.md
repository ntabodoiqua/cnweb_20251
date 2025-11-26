# Product Specifications Translations

Tệp này chứa các bản dịch và cấu hình cho tính năng hiển thị thông số chi tiết sản phẩm.

## Mục đích

Tách riêng các translations và configurations ra khỏi component chính để:

- ✅ **Dễ bảo trì**: Cập nhật translations ở một nơi duy nhất
- ✅ **Có thể mở rộng**: Dễ dàng thêm ngôn ngữ khác trong tương lai
- ✅ **Clean code**: Component không bị cluttered với data
- ✅ **Reusable**: Có thể sử dụng lại ở nhiều nơi

## Cấu trúc

### 1. `SPEC_KEY_TRANSLATIONS`

Object chứa mapping từ key tiếng Anh sang tiếng Việt.

```javascript
export const SPEC_KEY_TRANSLATIONS = {
  overview: "Tổng quan",
  brand: "Thương hiệu",
  // ... các key khác
};
```

### 2. `SPEC_SECTION_CONFIG`

Array định nghĩa thứ tự và label cho các sections.

```javascript
export const SPEC_SECTION_CONFIG = [
  { key: "overview", label: "Thông tin tổng quan" },
  { key: "display", label: "Màn hình" },
  // ... các section khác
];
```

### 3. `getTranslatedKey(key)`

Hàm helper để lấy bản dịch của một key.

```javascript
const label = getTranslatedKey("brand"); // => "Thương hiệu"
```

### 4. `getSpecSectionConfig(productSpecs)`

Hàm helper để tạo danh sách sections dựa trên data có sẵn.

```javascript
const sections = getSpecSectionConfig(productSpecs);
// => [{ key, label, data }, ...]
```

## Sử dụng

### Import

```javascript
import {
  getTranslatedKey,
  getSpecSectionConfig,
} from "../constants/productSpecsTranslations";
```

### Trong Component

```javascript
// Lấy translation
const label = getTranslatedKey(key);

// Lấy sections config
const sections = getSpecSectionConfig(productSpecs);
```

## Mở rộng

### Thêm ngôn ngữ mới

Trong tương lai, có thể mở rộng thành:

```javascript
// productSpecsTranslations.js
export const SPEC_KEY_TRANSLATIONS = {
  vi: { overview: "Tổng quan", ... },
  en: { overview: "Overview", ... },
  // ... các ngôn ngữ khác
};

export const getTranslatedKey = (key, lang = "vi") => {
  return SPEC_KEY_TRANSLATIONS[lang][key] || key;
};
```

### Sử dụng i18n library

Có thể tích hợp với i18n library như `react-i18next`:

```javascript
import { useTranslation } from "react-i18next";

const { t } = useTranslation("productSpecs");
const label = t(`keys.${key}`);
```

## Best Practices

1. **Giữ translations ngắn gọn**: Label nên rõ ràng nhưng không quá dài
2. **Consistency**: Sử dụng cùng format cho tất cả translations
3. **Comments**: Thêm comments để group các related keys
4. **Order**: Giữ thứ tự logical trong SPEC_SECTION_CONFIG
5. **Fallback**: Luôn có fallback cho unknown keys

## Changelog

- **v1.0**: Initial release with Vietnamese translations
- **v1.1**: Removed icons for cleaner professional look
- **v1.2**: Extracted to separate constants file for better maintainability
