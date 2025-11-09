-- Migration Script: Hệ thống danh mục 2 cấp
-- Platform Categories (Admin) + Store Categories (Seller)

-- 1. Thêm cột mới vào bảng categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS category_type VARCHAR(20) NOT NULL DEFAULT 'PLATFORM',
ADD COLUMN IF NOT EXISTS store_id VARCHAR(36),
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Tạo index cho performance
CREATE INDEX IF NOT EXISTS idx_category_type ON categories(category_type);
CREATE INDEX IF NOT EXISTS idx_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_category_type_store ON categories(category_type, store_id);

-- 3. Thêm foreign key constraint cho store_id
ALTER TABLE categories
ADD CONSTRAINT fk_category_store
FOREIGN KEY (store_id) REFERENCES stores(id)
ON DELETE CASCADE;

-- 4. Drop unique constraint cũ trên name
ALTER TABLE categories DROP CONSTRAINT IF EXISTS uk_category_name;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- 5. Tạo unique constraint mới (name + category_type + store_id)
ALTER TABLE categories
ADD CONSTRAINT uk_category_name_type_store 
UNIQUE (name, category_type, store_id);

-- 6. Update dữ liệu hiện có (nếu có) - tất cả category cũ sẽ là PLATFORM
UPDATE categories
SET category_type = 'PLATFORM',
    level = CASE 
        WHEN parent_id IS NULL THEN 0
        ELSE 1
    END
WHERE category_type IS NULL;

-- 7. Thêm check constraint
ALTER TABLE categories
ADD CONSTRAINT chk_category_type 
CHECK (category_type IN ('PLATFORM', 'STORE'));

ALTER TABLE categories
ADD CONSTRAINT chk_store_category_no_parent
CHECK (
    (category_type = 'STORE' AND parent_id IS NULL) OR
    category_type = 'PLATFORM'
);

ALTER TABLE categories
ADD CONSTRAINT chk_platform_max_2_levels
CHECK (
    (category_type = 'PLATFORM' AND level <= 1) OR
    category_type = 'STORE'
);

-- 8. Comment cho các cột
COMMENT ON COLUMN categories.category_type IS 'PLATFORM: danh mục toàn hệ thống (Admin), STORE: danh mục riêng (Seller)';
COMMENT ON COLUMN categories.store_id IS 'ID của store (chỉ cho STORE category)';
COMMENT ON COLUMN categories.level IS 'Cấp độ: 0=root, 1=level 1 (chỉ PLATFORM có thể có level 1)';
COMMENT ON COLUMN categories.parent_id IS 'Parent category (chỉ PLATFORM category có thể có parent)';

-- 9. View để query dễ dàng hơn
CREATE OR REPLACE VIEW v_platform_categories AS
SELECT 
    c.*,
    pc.name as parent_name,
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT sc.id) as subcategory_count
FROM categories c
LEFT JOIN categories pc ON c.parent_id = pc.id
LEFT JOIN products p ON p.category_id = c.id
LEFT JOIN categories sc ON sc.parent_id = c.id
WHERE c.category_type = 'PLATFORM'
GROUP BY c.id, pc.name;

CREATE OR REPLACE VIEW v_store_categories AS
SELECT 
    c.*,
    s.store_name,
    s.user_id as seller_id,
    COUNT(DISTINCT p.id) as product_count
FROM categories c
INNER JOIN stores s ON c.store_id = s.id
LEFT JOIN products p ON p.category_id = c.id
WHERE c.category_type = 'STORE'
GROUP BY c.id, s.store_name, s.user_id;
