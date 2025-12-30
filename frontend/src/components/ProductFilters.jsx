import React from "react";
import {
  Card,
  Slider,
  InputNumber,
  Select,
  Checkbox,
  Space,
  Button,
  Divider,
  Typography,
  Row,
  Col,
  Collapse,
} from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import "./ProductFilters.css";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ProductFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories = [],
  brands = [],
  stores = [],
  loading = false,
}) => {
  const handlePriceChange = (value) => {
    onFilterChange({
      priceFrom: value[0],
      priceTo: value[1],
    });
  };

  const handleRatingChange = (value) => {
    onFilterChange({
      ratingFrom: value[0],
      ratingTo: value[1],
    });
  };

  return (
    <Card
      className="product-filters"
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ lọc sản phẩm</span>
        </Space>
      }
      extra={
        <Button
          type="link"
          icon={<ClearOutlined />}
          onClick={onResetFilters}
          disabled={loading}
        >
          Xóa bộ lọc
        </Button>
      }
    >
      <Collapse defaultActiveKey={["1", "2", "3"]} ghost>
        {/* Category Filter - Only show child categories (level === 1) */}
        <Panel header="Danh mục" key="1">
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn danh mục"
            allowClear
            showSearch
            optionFilterProp="children"
            value={filters.categoryId}
            onChange={(value) => onFilterChange({ categoryId: value })}
            disabled={loading}
          >
            {categories
              .filter((cat) => cat.level === 1)
              .map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
          </Select>
        </Panel>

        {/* Brand Filter */}
        <Panel header="Thương hiệu" key="2">
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn thương hiệu"
            allowClear
            showSearch
            optionFilterProp="children"
            value={filters.brandId}
            onChange={(value) => onFilterChange({ brandId: value })}
            disabled={loading}
          >
            {brands.map((brand) => (
              <Select.Option key={brand.id} value={brand.id}>
                {brand.name}
              </Select.Option>
            ))}
          </Select>
        </Panel>

        {/* Store Filter */}
        <Panel header="Cửa hàng" key="3">
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn cửa hàng"
            allowClear
            showSearch
            optionFilterProp="children"
            value={filters.storeId}
            onChange={(value) => onFilterChange({ storeId: value })}
            disabled={loading}
          >
            {stores.map((store) => (
              <Select.Option key={store.id} value={store.id}>
                {store.storeName}
              </Select.Option>
            ))}
          </Select>
        </Panel>

        {/* Price Range Filter */}
        <Panel header="Khoảng giá" key="4">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Slider
              range
              min={0}
              max={50000000}
              step={100000}
              value={[filters.priceFrom || 0, filters.priceTo || 50000000]}
              onChange={handlePriceChange}
              disabled={loading}
              tooltip={{
                formatter: (value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value),
              }}
            />
            <Row gutter={8}>
              <Col span={12}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={50000000}
                  step={100000}
                  value={filters.priceFrom}
                  onChange={(value) => onFilterChange({ priceFrom: value })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Từ"
                  disabled={loading}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={50000000}
                  step={100000}
                  value={filters.priceTo}
                  onChange={(value) => onFilterChange({ priceTo: value })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Đến"
                  disabled={loading}
                />
              </Col>
            </Row>
          </Space>
        </Panel>

        {/* Stock Filter */}
        <Panel header="Tồn kho" key="5">
          <Checkbox
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            disabled={loading}
          >
            Chỉ hiện sản phẩm còn hàng
          </Checkbox>
        </Panel>

        {/* Rating Filter */}
        <Panel header="Đánh giá" key="6">
          <Slider
            range
            min={0}
            max={5}
            step={0.5}
            value={[filters.ratingFrom || 0, filters.ratingTo || 5]}
            onChange={handleRatingChange}
            disabled={loading}
            marks={{
              0: "0",
              1: "1",
              2: "2",
              3: "3",
              4: "4",
              5: "5",
            }}
          />
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ProductFilters;
