import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Rate,
  Image,
  Divider,
  InputNumber,
  notification,
  Breadcrumb,
  Tabs,
  Avatar,
  Empty,
  Modal,
  Descriptions,
  Spin,
  Collapse,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  HomeOutlined,
  ShopOutlined,
  EyeOutlined,
  StarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  getPublicProductDetailApi,
  getPublicProductVariantOptionsApi,
  findVariantByAttributesApi,
  getWardInfoApi,
  addToCartApi,
  getPublicProductSpecsApi,
  getSelectionConfigApi,
  findVariantBySelectionApi,
  getAvailableOptionsApi,
} from "../util/api";
import { getSpecSectionConfig } from "../constants/productSpecsTranslations";
import { useCart } from "../contexts/CartContext";
import LoadingSpinner from "../components/LoadingSpinner";
import styles from "./ProductDetailPage.module.css";

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { incrementCartCount, loadCartCount } = useCart();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [variantOptions, setVariantOptions] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [wardInfo, setWardInfo] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [productSpecs, setProductSpecs] = useState(null);
  const [specsLoading, setSpecsLoading] = useState(false);

  // Selection config states
  const [selectionConfig, setSelectionConfig] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [availableOptionsLoading, setAvailableOptionsLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
      fetchVariantOptions();
      fetchProductSpecs();
      fetchSelectionConfig();
    }
  }, [productId]);

  // Fetch variant when selected options change (for selection config)
  useEffect(() => {
    if (productId && selectionConfig) {
      findVariantBySelection();
      fetchAvailableOptions();
    }
  }, [selectedOptions]);

  // Fetch variant options when selected attributes change (for legacy variant options)
  useEffect(() => {
    if (productId && variantOptions && !selectionConfig) {
      findMatchingVariant();
    }
  }, [selectedAttributes]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await getPublicProductDetailApi(productId);
      if (response.code === 1000) {
        const productData = response.result;
        setProduct(productData);

        // Set default image
        if (productData.images && productData.images.length > 0) {
          const primaryImage =
            productData.images.find((img) => img.isPrimary) ||
            productData.images[0];
          setSelectedImage(primaryImage.imageUrl);
        }

        // Fetch ward information if wardId exists
        if (productData.store?.wardId) {
          fetchWardInfo(productData.store.wardId);
        }
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      notification.error({
        message: "Lỗi tải sản phẩm",
        description: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVariantOptions = async () => {
    try {
      const response = await getPublicProductVariantOptionsApi(productId, []);
      if (response.code === 1000) {
        setVariantOptions(response.result);
      }
    } catch (error) {
      console.error("Error fetching variant options:", error);
    }
  };

  const fetchWardInfo = async (wardId) => {
    try {
      const response = await getWardInfoApi(wardId);
      if (response.code === 1000) {
        setWardInfo(response.result);
      }
    } catch (error) {
      console.error("Error fetching ward info:", error);
    }
  };

  const fetchProductSpecs = async () => {
    setSpecsLoading(true);
    try {
      const response = await getPublicProductSpecsApi(productId);
      if (response.code === 1000) {
        setProductSpecs(response.result?.specs);
      }
    } catch (error) {
      console.error("Error fetching product specs:", error);
      // Don't show error notification as specs might not exist for all products
    } finally {
      setSpecsLoading(false);
    }
  };

  const fetchSelectionConfig = async () => {
    try {
      const response = await getSelectionConfigApi(productId);
      if (response.code === 1000) {
        setSelectionConfig(response.result);
      }
    } catch (error) {
      console.error("Error fetching selection config:", error);
      // Selection config might not exist for all products
    }
  };

  // Fetch available options based on current selections (realtime stock check)
  const fetchAvailableOptions = async () => {
    if (!selectionConfig) return;

    const selectedOptionIds = Object.values(selectedOptions).filter(Boolean);

    // Skip if no selections made yet
    if (selectedOptionIds.length === 0) return;

    setAvailableOptionsLoading(true);
    try {
      const response = await getAvailableOptionsApi(
        productId,
        selectedOptionIds
      );
      if (response.code === 1000) {
        // Update selectionConfig with new available states
        setSelectionConfig(response.result);
      }
    } catch (error) {
      console.error("Error fetching available options:", error);
    } finally {
      setAvailableOptionsLoading(false);
    }
  };

  const findVariantBySelection = async () => {
    if (!selectionConfig) return;

    // Get all selected option IDs
    const selectedOptionIds = Object.values(selectedOptions).filter(Boolean);

    // Check if all required groups are selected
    const requiredGroups =
      selectionConfig.selectionGroups?.filter((g) => g.required) || [];
    const allRequiredSelected = requiredGroups.every(
      (group) => selectedOptions[group.groupId]
    );

    if (!allRequiredSelected || selectedOptionIds.length === 0) {
      setSelectedVariant(null);
      return;
    }

    // Check if combination exists in selectionMatrix
    const combinationKey = selectedOptionIds.sort().join(",");
    const variantId = selectionConfig.selectionMatrix?.[combinationKey];

    if (!variantId) {
      setSelectedVariant(null);
      return;
    }

    setVariantLoading(true);
    try {
      const response = await findVariantBySelectionApi(
        productId,
        selectedOptionIds
      );
      if (response.code === 1000) {
        const variant = response.result;
        setSelectedVariant(variant);

        // Update quantity max if needed
        if (variant && quantity > variant.availableStock) {
          setQuantity(1);
        }
      }
    } catch (error) {
      console.error("Error finding variant by selection:", error);
      setSelectedVariant(null);

      if (error.response?.status === 404) {
        notification.warning({
          message: "Không tìm thấy phiên bản",
          description:
            "Không có phiên bản sản phẩm nào phù hợp với lựa chọn này.",
          placement: "topRight",
        });
      }
    } finally {
      setVariantLoading(false);
    }
  };

  const findMatchingVariant = async () => {
    if (!variantOptions) return;

    // Get selected attribute value IDs
    const selectedValueIds = Object.values(selectedAttributes).filter(Boolean);

    // Only call API if we have selected attributes
    if (selectedValueIds.length === 0) {
      setSelectedVariant(null);
      return;
    }

    setVariantLoading(true);
    try {
      const response = await findVariantByAttributesApi(
        productId,
        selectedValueIds
      );
      if (response.code === 1000) {
        const variant = response.result;
        setSelectedVariant(variant);

        // Update quantity max if needed
        if (variant && quantity > variant.availableStock) {
          setQuantity(1);
        }
      }
    } catch (error) {
      console.error("Error finding variant:", error);
      setSelectedVariant(null);

      // Handle 404 - variant not found
      if (error.response?.status === 404) {
        notification.warning({
          message: "Không tìm thấy phiên bản",
          description:
            "Không có phiên bản sản phẩm nào phù hợp với thuộc tính đã chọn.",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "Lỗi tải phiên bản",
          description:
            "Đã xảy ra lỗi khi tìm phiên bản sản phẩm. Vui lòng thử lại.",
          placement: "topRight",
        });
      }
    } finally {
      setVariantLoading(false);
    }
  };

  const handleAttributeSelect = (attributeId, valueId) => {
    setSelectedAttributes((prev) => {
      // If clicking the same value, deselect it
      if (prev[attributeId] === valueId) {
        const newAttributes = { ...prev };
        delete newAttributes[attributeId];
        return newAttributes;
      }
      // Otherwise, select the new value
      return {
        ...prev,
        [attributeId]: valueId,
      };
    });
  };

  // Handle selection option select (for selection config)
  const handleSelectionOptionSelect = (groupId, optionId) => {
    setSelectedOptions((prev) => {
      // If clicking the same option, deselect it
      if (prev[groupId] === optionId) {
        const newOptions = { ...prev };
        delete newOptions[groupId];
        return newOptions;
      }
      // Otherwise, select the new option
      return {
        ...prev,
        [groupId]: optionId,
      };
    });
  };

  // Check if a selection option is available based on current selections
  // Uses the available status from API response which includes realtime stock check
  const isSelectionOptionAvailable = (groupId, optionId, option) => {
    // The available status is updated by fetchAvailableOptions API
    // which checks realtime stock and valid combinations
    return option.available !== false;
  };

  // Check if an attribute option is available based on current selections
  const isOptionAvailable = (attributeId, valueId) => {
    if (!variantOptions || !variantOptions.variantMatrix) return true;

    // Get current selections excluding this attribute
    const otherSelections = Object.entries(selectedAttributes)
      .filter(([key]) => key !== attributeId)
      .map(([, value]) => value)
      .filter(Boolean);

    // If no other selections, check if this value exists in any variant
    if (otherSelections.length === 0) {
      return Object.keys(variantOptions.variantMatrix).some(
        (key) => key.split(",").includes(valueId) || key === ""
      );
    }

    // Check if combination with other selections exists
    const testCombination = [...otherSelections, valueId].sort().join(",");
    return variantOptions.variantMatrix.hasOwnProperty(testCombination);
  };

  const showVariantDetails = () => {
    if (selectedVariant) {
      setIsVariantModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsVariantModalOpen(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice === currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const handleAddToCart = async () => {
    // Check if selection config exists and all required selections are made
    if (selectionConfig && selectionConfig.selectionGroups?.length > 0) {
      const requiredGroups = selectionConfig.selectionGroups.filter(
        (g) => g.required
      );
      const missingSelections = requiredGroups.filter(
        (group) => !selectedOptions[group.groupId]
      );

      if (missingSelections.length > 0) {
        notification.warning({
          message: "Chưa chọn đủ tùy chọn",
          description: `Vui lòng chọn: ${missingSelections
            .map((g) => g.groupName)
            .join(", ")}`,
          placement: "topRight",
        });
        return;
      }
    }

    if (!selectedVariant) {
      notification.warning({
        message: "Chưa chọn phiên bản",
        description: "Vui lòng chọn đầy đủ thuộc tính sản phẩm.",
        placement: "topRight",
      });
      return;
    }
    if (!selectedVariant.active) {
      notification.error({
        message: "Sản phẩm không khả dụng",
        description: "Sản phẩm này hiện không khả dụng.",
        placement: "topRight",
      });
      return;
    }
    if (selectedVariant.availableStock < quantity) {
      notification.error({
        message: "Vượt quá tồn kho",
        description: "Số lượng vượt quá số sản phẩm có sẵn trong kho.",
        placement: "topRight",
      });
      return;
    }

    try {
      setAddingToCart(true);

      // Tạo cart item data với đầy đủ thông tin
      const cartItemData = {
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.variantName || null,
        imageUrl:
          selectedVariant?.images?.[0] || product.images?.[0]?.imageUrl || null,
        quantity: quantity,
        price: selectedVariant?.price || product.price,
        originalPrice:
          selectedVariant?.originalPrice ||
          product.originalPrice ||
          selectedVariant?.price ||
          product.price,
      };

      const response = await addToCartApi(cartItemData);

      if (response && response.code === 200) {
        // Cập nhật cart count trong context
        incrementCartCount(quantity);

        notification.success({
          message: "Thêm vào giỏ hàng",
          description: `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`,
          placement: "topRight",
          duration: 2,
        });
      } else {
        throw new Error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.message ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!",
        placement: "topRight",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = () => {
    notification.success({
      message: "Thêm vào yêu thích",
      description: "Đã thêm sản phẩm vào danh sách yêu thích!",
      placement: "topRight",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      notification.success({
        message: "Đã sao chép",
        description: "Đã sao chép link sản phẩm vào clipboard!",
        placement: "topRight",
      });
    }
  };

  const handleStoreClick = () => {
    if (product?.store?.id) {
      navigate(`/store/${product.store.id}`);
    }
  };

  // Render detailed product specs sections
  const renderSpecsSection = (title, specs) => {
    if (!specs || typeof specs !== "object") return null;

    // Sort by displayOrder
    const sortedSpecs = Object.entries(specs).sort(
      ([, a], [, b]) => (a.displayOrder || 999) - (b.displayOrder || 999)
    );

    return (
      <div className={styles.specTable}>
        {sortedSpecs.map(([key, specData]) => {
          if (
            !specData ||
            specData.value === null ||
            specData.value === undefined
          )
            return null;

          // Backend provides labelVi for all specs
          const label = specData.labelVi || key;
          const value = specData.value;
          const unit = specData.unit || "";

          return (
            <Row key={key} className={styles.specRow}>
              <Col xs={24} sm={8} className={styles.specLabel}>
                {label}
              </Col>
              <Col xs={24} sm={16} className={styles.specValue}>
                {renderSpecValue(value, unit, specData.dataType)}
              </Col>
            </Row>
          );
        })}
      </div>
    );
  };

  const renderSpecValue = (value, unit = "", dataType = "string") => {
    if (Array.isArray(value)) {
      if (value.length === 0) return <Text type="secondary">-</Text>;

      // Check if array contains objects
      if (typeof value[0] === "object" && value[0] !== null) {
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {value.map((item, index) => (
              <div key={index} className={styles.nestedSpec}>
                {Object.entries(item).map(([k, v]) => (
                  <div key={k} className={styles.nestedSpecItem}>
                    <Text type="secondary" className={styles.nestedSpecLabel}>
                      {k}:
                    </Text>
                    <Text strong className={styles.nestedSpecValue}>
                      {v}
                    </Text>
                  </div>
                ))}
              </div>
            ))}
          </Space>
        );
      }

      // Simple array of strings/numbers
      return (
        <Space wrap size="small">
          {value.map((item, index) => (
            <Tag key={index} color="blue">
              {item}
            </Tag>
          ))}
        </Space>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className={styles.nestedObject}>
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className={styles.nestedObjectItem}>
              <Text type="secondary" className={styles.nestedObjectLabel}>
                {k}:
              </Text>
              <Text strong className={styles.nestedObjectValue}>
                {renderSpecValue(v)}
              </Text>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "boolean" || dataType === "boolean") {
      return value ? (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Có
        </Tag>
      ) : (
        <Tag color="default">Không</Tag>
      );
    }

    if (typeof value === "number" || dataType === "number") {
      const formattedValue =
        typeof value === "number" ? value.toLocaleString("vi-VN") : value;
      return (
        <Text strong>
          {formattedValue}
          {unit ? ` ${unit}` : ""}
        </Text>
      );
    }

    // String value - support multiline
    const hasNewlines = typeof value === "string" && value.includes("\n");
    return (
      <Text style={hasNewlines ? { whiteSpace: "pre-line" } : undefined}>
        {value}
        {unit ? ` ${unit}` : ""}
      </Text>
    );
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải sản phẩm..." fullScreen={false} />;
  }

  if (!product) {
    return (
      <div className={styles.productDetailPage}>
        <Empty description="Không tìm thấy sản phẩm" />
      </div>
    );
  }

  const discount = selectedVariant
    ? calculateDiscount(selectedVariant.originalPrice, selectedVariant.price)
    : calculateDiscount(product.maxPrice, product.minPrice);

  return (
    <>
      <Helmet>
        <title>{product.name} - HUSTBuy</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>

      <div className={styles.productDetailPage}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <Card className={styles.breadcrumbCard}>
            <Breadcrumb
              items={[
                {
                  title: (
                    <>
                      <HomeOutlined />
                      <span>Trang chủ</span>
                    </>
                  ),
                  onClick: () => navigate("/"),
                },
                {
                  title: "Sản phẩm",
                  onClick: () => navigate("/products"),
                },
                {
                  title: product.category?.name || "Danh mục",
                },
                {
                  title: product.name,
                },
              ]}
            />
          </Card>

          {/* Main Content */}
          <Row gutter={[24, 24]}>
            {/* Left Column - Images */}
            <Col xs={24} lg={10}>
              <Card className={styles.imageCard}>
                {/* Main Image */}
                <div className={styles.mainImageWrapper}>
                  <Image
                    src={selectedImage || "https://via.placeholder.com/600"}
                    alt={product.name}
                    className={styles.mainImage}
                    preview={{
                      mask: <EyeOutlined style={{ fontSize: 24 }} />,
                    }}
                  />
                  {discount > 0 && (
                    <div className={styles.discountBadge}>-{discount}%</div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className={styles.thumbnailWrapper}>
                    {product.images.map((image) => (
                      <div
                        key={image.id}
                        className={`${styles.thumbnail} ${
                          selectedImage === image.imageUrl ? styles.active : ""
                        }`}
                        onClick={() => setSelectedImage(image.imageUrl)}
                      >
                        <img src={image.imageUrl} alt={product.name} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Share and Wishlist */}
                <div className={styles.actionButtons}>
                  <Button
                    icon={<HeartOutlined />}
                    size="large"
                    onClick={handleAddToWishlist}
                  >
                    Yêu thích
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    size="large"
                    onClick={handleShare}
                  >
                    Chia sẻ
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Right Column - Product Info */}
            <Col xs={24} lg={14}>
              <Card className={styles.infoCard}>
                {/* Product Name */}
                <Title level={2} className={styles.productName}>
                  {product.name}
                </Title>

                {/* Rating and Stats */}
                <div className={styles.statsRow}>
                  <Space size="large" wrap>
                    <Space>
                      {product.averageRating ? (
                        <>
                          <Rate
                            disabled
                            allowHalf
                            value={product.averageRating}
                            style={{ fontSize: 16 }}
                          />
                          <Text strong>{product.averageRating}</Text>
                          <Text type="secondary">
                            ({product.ratingCount} đánh giá)
                          </Text>
                        </>
                      ) : (
                        <Text type="secondary">
                          <StarOutlined /> Chưa có đánh giá
                        </Text>
                      )}
                    </Space>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      <EyeOutlined /> {product.viewCount} lượt xem
                    </Text>
                    {product.soldCount > 0 && (
                      <>
                        <Divider type="vertical" />
                        <Text type="secondary">
                          <CheckCircleOutlined /> Đã bán {product.soldCount}
                        </Text>
                      </>
                    )}
                  </Space>
                </div>

                <Divider />

                {/* Price */}
                <div className={styles.priceSection}>
                  {selectedVariant ? (
                    <>
                      <div className={styles.currentPrice}>
                        {formatPrice(selectedVariant.price)}
                      </div>
                      {selectedVariant.originalPrice >
                        selectedVariant.price && (
                        <div className={styles.originalPrice}>
                          {formatPrice(selectedVariant.originalPrice)}
                        </div>
                      )}
                    </>
                  ) : selectionConfig?.basePrice ? (
                    <div className={styles.priceRange}>
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        Từ{" "}
                      </Text>
                      {formatPrice(selectionConfig.basePrice)}
                    </div>
                  ) : (
                    <div className={styles.priceRange}>
                      {product.minPrice === product.maxPrice
                        ? formatPrice(product.minPrice)
                        : `${formatPrice(product.minPrice)} - ${formatPrice(
                            product.maxPrice
                          )}`}
                    </div>
                  )}
                </div>

                <Divider />

                {/* Short Description */}
                {product.shortDescription && (
                  <div className={styles.shortDescription}>
                    <Paragraph>{product.shortDescription}</Paragraph>
                  </div>
                )}

                {/* Category and Brand */}
                <div className={styles.metaInfo}>
                  <Space wrap size="middle">
                    <div>
                      <Text type="secondary">Danh mục: </Text>
                      <Tag color="blue">{product.category?.name}</Tag>
                    </div>
                    {product.brand && (
                      <div>
                        <Text type="secondary">Thương hiệu: </Text>
                        <Tag color="purple">{product.brand.name}</Tag>
                      </div>
                    )}
                    {product.storeCategories &&
                      product.storeCategories.length > 0 && (
                        <div>
                          <Text type="secondary">Phân loại: </Text>
                          {product.storeCategories.map((cat) => (
                            <Tag key={cat.id} color="cyan">
                              {cat.name}
                            </Tag>
                          ))}
                        </div>
                      )}
                  </Space>
                </div>

                <Divider />

                {/* Selection Groups (Priority) */}
                {selectionConfig &&
                  selectionConfig.selectionGroups &&
                  selectionConfig.selectionGroups.length > 0 && (
                    <>
                      <div className={styles.variantSection}>
                        {selectionConfig.selectionGroups
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((group) => (
                            <div
                              key={group.groupId}
                              className={styles.attributeGroup}
                            >
                              <Text strong className={styles.attributeLabel}>
                                {group.groupName}:
                                {group.required && (
                                  <span
                                    style={{ color: "#ff4d4f", marginLeft: 4 }}
                                  >
                                    *
                                  </span>
                                )}
                              </Text>
                              {group.description && (
                                <Text
                                  type="secondary"
                                  style={{
                                    display: "block",
                                    marginBottom: 8,
                                    fontSize: 12,
                                  }}
                                >
                                  {group.description}
                                </Text>
                              )}
                              <div className={styles.attributeOptions}>
                                {group.options.map((option) => {
                                  const isAvailable =
                                    isSelectionOptionAvailable(
                                      group.groupId,
                                      option.optionId,
                                      option
                                    );
                                  const isSelected =
                                    selectedOptions[group.groupId] ===
                                    option.optionId;

                                  return (
                                    <Button
                                      key={option.optionId}
                                      type={isSelected ? "primary" : "default"}
                                      className={`${styles.attributeButton} ${
                                        isSelected ? styles.selected : ""
                                      } ${!isAvailable ? styles.disabled : ""}`}
                                      onClick={() =>
                                        handleSelectionOptionSelect(
                                          group.groupId,
                                          option.optionId
                                        )
                                      }
                                      disabled={!isAvailable}
                                      style={
                                        option.colorCode
                                          ? {
                                              borderColor: isSelected
                                                ? option.colorCode
                                                : undefined,
                                              position: "relative",
                                            }
                                          : undefined
                                      }
                                    >
                                      {option.colorCode && (
                                        <span
                                          style={{
                                            display: "inline-block",
                                            width: 14,
                                            height: 14,
                                            borderRadius: "50%",
                                            backgroundColor: option.colorCode,
                                            marginRight: 6,
                                            border: "1px solid #d9d9d9",
                                            verticalAlign: "middle",
                                          }}
                                        />
                                      )}
                                      {option.label || option.value}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        {(variantLoading || availableOptionsLoading) && (
                          <div className={styles.variantInfo}>
                            <Space>
                              <Spin size="small" />
                              <Text type="secondary">
                                {variantLoading
                                  ? "Đang tải thông tin phiên bản..."
                                  : "Đang cập nhật tùy chọn..."}
                              </Text>
                            </Space>
                          </div>
                        )}
                        {!variantLoading &&
                          !availableOptionsLoading &&
                          selectedVariant && (
                            <div className={styles.variantInfo}>
                              <Space split={<Divider type="vertical" />} wrap>
                                <Text type="secondary">
                                  <CheckCircleOutlined
                                    style={{ color: "#52c41a" }}
                                  />{" "}
                                  {selectedVariant.variantName}
                                </Text>
                                <Text type="secondary">
                                  Giá:{" "}
                                  <Text strong style={{ color: "#ee4d2d" }}>
                                    {formatPrice(selectedVariant.price)}
                                  </Text>
                                </Text>
                                <Text type="secondary">
                                  Kho:{" "}
                                  <Text strong>
                                    {selectedVariant.availableStock}
                                  </Text>
                                </Text>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={showVariantDetails}
                                  style={{ padding: 0 }}
                                >
                                  Xem chi tiết →
                                </Button>
                              </Space>
                            </div>
                          )}
                      </div>
                      <Divider />
                    </>
                  )}

                {/* Fallback: Variant Attributes Selection (when no selection config) */}
                {!selectionConfig &&
                  variantOptions &&
                  variantOptions.attributeGroups &&
                  variantOptions.attributeGroups.length > 0 && (
                    <>
                      <div className={styles.variantSection}>
                        {variantOptions.attributeGroups.map((group) => (
                          <div
                            key={group.attributeId}
                            className={styles.attributeGroup}
                          >
                            <Text strong className={styles.attributeLabel}>
                              {group.attributeName}:
                            </Text>
                            <div className={styles.attributeOptions}>
                              {group.options.map((option) => {
                                const isAvailable = isOptionAvailable(
                                  group.attributeId,
                                  option.valueId
                                );
                                return (
                                  <Button
                                    key={option.valueId}
                                    type={
                                      selectedAttributes[group.attributeId] ===
                                      option.valueId
                                        ? "primary"
                                        : "default"
                                    }
                                    className={`${styles.attributeButton} ${
                                      selectedAttributes[group.attributeId] ===
                                      option.valueId
                                        ? styles.selected
                                        : ""
                                    } ${!isAvailable ? styles.disabled : ""}`}
                                    onClick={() =>
                                      handleAttributeSelect(
                                        group.attributeId,
                                        option.valueId
                                      )
                                    }
                                    disabled={!isAvailable}
                                  >
                                    {option.value}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {variantLoading && (
                          <div className={styles.variantInfo}>
                            <Space>
                              <Spin size="small" />
                              <Text type="secondary">
                                Đang tải thông tin phiên bản...
                              </Text>
                            </Space>
                          </div>
                        )}
                        {!variantLoading && selectedVariant && (
                          <div className={styles.variantInfo}>
                            <Space split={<Divider type="vertical" />} wrap>
                              <Text type="secondary">
                                <CheckCircleOutlined
                                  style={{ color: "#52c41a" }}
                                />{" "}
                                {selectedVariant.variantName}
                              </Text>
                              <Text type="secondary">
                                Giá:{" "}
                                <Text strong style={{ color: "#ee4d2d" }}>
                                  {formatPrice(selectedVariant.price)}
                                </Text>
                              </Text>
                              <Text type="secondary">
                                Kho:{" "}
                                <Text strong>
                                  {selectedVariant.availableStock}
                                </Text>
                              </Text>
                              <Button
                                type="link"
                                size="small"
                                onClick={showVariantDetails}
                                style={{ padding: 0 }}
                              >
                                Xem chi tiết →
                              </Button>
                            </Space>
                          </div>
                        )}
                      </div>
                      <Divider />
                    </>
                  )}

                {/* Quantity and Stock */}

                {/* Quantity and Stock */}
                <div className={styles.quantitySection}>
                  <Space size="large" align="center">
                    <div>
                      <Text strong style={{ marginRight: 12 }}>
                        Số lượng:
                      </Text>
                      <InputNumber
                        min={1}
                        max={selectedVariant?.availableStock || 99}
                        value={quantity}
                        onChange={setQuantity}
                        size="large"
                        style={{ width: 120 }}
                      />
                    </div>
                    {selectedVariant && (
                      <Text type="secondary">
                        {selectedVariant.availableStock} sản phẩm có sẵn
                      </Text>
                    )}
                  </Space>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionSection}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    className={styles.addToCartBtn}
                    disabled={!product.active || addingToCart}
                    loading={addingToCart}
                    block
                  >
                    {addingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                  </Button>
                  {!product.active && (
                    <div style={{ marginTop: 12 }}>
                      <Text type="danger">Sản phẩm hiện không khả dụng</Text>
                    </div>
                  )}
                  {!selectedVariant &&
                    selectionConfig?.selectionGroups?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="warning">
                          Vui lòng chọn đầy đủ các tùy chọn để thêm vào giỏ hàng
                        </Text>
                      </div>
                    )}
                  {!selectedVariant &&
                    !selectionConfig &&
                    variantOptions &&
                    variantOptions.attributeGroups?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="warning">
                          Vui lòng chọn đầy đủ thuộc tính sản phẩm
                        </Text>
                      </div>
                    )}
                </div>
              </Card>

              {/* Store Info Card */}
              {product.store && (
                <Card className={styles.storeCard}>
                  <Row gutter={16} align="middle">
                    <Col flex="none">
                      <Avatar
                        size={64}
                        src={product.store.logoUrl}
                        icon={<ShopOutlined />}
                        className={styles.storeAvatar}
                      />
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ marginBottom: 4 }}>
                        {product.store.storeName}
                      </Title>
                      {product.store.storeDescription && (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          type="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          {product.store.storeDescription}
                        </Paragraph>
                      )}
                      <Space wrap size="small">
                        {(product.store.shopAddress || wardInfo) && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined />{" "}
                            {[product.store.shopAddress, wardInfo?.pathWithType]
                              .filter(Boolean)
                              .join(", ")}
                          </Text>
                        )}
                        {product.store.contactPhone && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <PhoneOutlined /> {product.store.contactPhone}
                          </Text>
                        )}
                      </Space>
                    </Col>
                    <Col flex="none">
                      <Button
                        type="primary"
                        icon={<ShopOutlined />}
                        onClick={handleStoreClick}
                      >
                        Xem cửa hàng
                      </Button>
                    </Col>
                  </Row>
                </Card>
              )}
            </Col>
          </Row>

          {/* Product Details Tabs */}
          <Card className={styles.detailsCard}>
            <Tabs
              defaultActiveKey="description"
              size="large"
              items={[
                {
                  key: "description",
                  label: "Mô tả sản phẩm",
                  children: (
                    <div className={styles.tabContent}>
                      {product.description ? (
                        <Paragraph style={{ whiteSpace: "pre-wrap" }}>
                          {product.description}
                        </Paragraph>
                      ) : (
                        <Empty description="Chưa có mô tả chi tiết" />
                      )}
                    </div>
                  ),
                },
                {
                  key: "detailedSpecs",
                  label: "Thông số chi tiết",
                  children: (
                    <div className={styles.tabContent}>
                      {specsLoading ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <Spin
                            size="large"
                            tip="Đang tải thông số chi tiết..."
                          />
                        </div>
                      ) : productSpecs &&
                        Object.keys(productSpecs).length > 0 ? (
                        <Collapse
                          accordion
                          defaultActiveKey={[
                            getSpecSectionConfig(productSpecs)[0]?.key,
                          ]}
                          expandIcon={({ isActive }) => (
                            <DownOutlined
                              rotate={isActive ? 180 : 0}
                              style={{ fontSize: 12, color: "#ee4d2d" }}
                            />
                          )}
                          className={styles.specsCollapse}
                          items={getSpecSectionConfig(productSpecs).map(
                            (section) => ({
                              key: section.key,
                              label: (
                                <div className={styles.collapseHeader}>
                                  <span className={styles.collapseTitle}>
                                    {section.label}
                                  </span>
                                </div>
                              ),
                              children: renderSpecsSection(
                                section.label,
                                section.data
                              ),
                            })
                          )}
                        />
                      ) : (
                        <Empty description="Chưa có thông số chi tiết cho sản phẩm này" />
                      )}
                    </div>
                  ),
                },
                {
                  key: "specifications",
                  label: "Thông số kỹ thuật",
                  children: (
                    <div className={styles.tabContent}>
                      <div className={styles.specTable}>
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Danh mục
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Tag color="blue" style={{ fontSize: 13 }}>
                              {product.category?.name}
                            </Tag>
                          </Col>
                        </Row>
                        {product.brand && (
                          <Row className={styles.specRow}>
                            <Col span={8} className={styles.specLabel}>
                              Thương hiệu
                            </Col>
                            <Col span={16} className={styles.specValue}>
                              <Space align="center">
                                {product.brand.logoUrl && (
                                  <Avatar
                                    src={product.brand.logoUrl}
                                    size={32}
                                    shape="square"
                                  />
                                )}
                                <Text strong>{product.brand.name}</Text>
                              </Space>
                            </Col>
                          </Row>
                        )}
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Cửa hàng
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Space align="center">
                              <Avatar
                                src={product.store?.logoUrl}
                                size={32}
                                icon={<ShopOutlined />}
                              />
                              <Text strong>{product.store?.storeName}</Text>
                            </Space>
                          </Col>
                        </Row>
                        {product.storeCategories &&
                          product.storeCategories.length > 0 && (
                            <Row className={styles.specRow}>
                              <Col span={8} className={styles.specLabel}>
                                Phân loại cửa hàng
                              </Col>
                              <Col span={16} className={styles.specValue}>
                                <Space wrap size="small">
                                  {product.storeCategories.map((cat) => (
                                    <Tag key={cat.id} color="cyan">
                                      {cat.name}
                                    </Tag>
                                  ))}
                                </Space>
                              </Col>
                            </Row>
                          )}
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Khoảng giá
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Text
                              strong
                              style={{ color: "#ee4d2d", fontSize: 16 }}
                            >
                              {product.minPrice === product.maxPrice
                                ? formatPrice(product.minPrice)
                                : `${formatPrice(
                                    product.minPrice
                                  )} - ${formatPrice(product.maxPrice)}`}
                            </Text>
                          </Col>
                        </Row>
                        {variantOptions &&
                          variantOptions.attributeGroups &&
                          variantOptions.attributeGroups.length > 0 && (
                            <>
                              {variantOptions.attributeGroups.map((group) => (
                                <Row
                                  key={group.attributeId}
                                  className={styles.specRow}
                                >
                                  <Col span={8} className={styles.specLabel}>
                                    {group.attributeName}
                                  </Col>
                                  <Col span={16} className={styles.specValue}>
                                    <Space wrap size="small">
                                      {group.options.map((option) => (
                                        <Tag
                                          key={option.valueId}
                                          color="purple"
                                        >
                                          {option.value}
                                        </Tag>
                                      ))}
                                    </Space>
                                  </Col>
                                </Row>
                              ))}
                            </>
                          )}
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Tổng số phiên bản
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Tag color="geekblue">
                              {variantOptions?.totalVariants || 0} phiên bản
                            </Tag>
                          </Col>
                        </Row>
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Lượt xem
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Space>
                              <EyeOutlined style={{ color: "#1890ff" }} />
                              <Text>
                                {product.viewCount.toLocaleString("vi-VN")}
                              </Text>
                            </Space>
                          </Col>
                        </Row>
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Đã bán
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Space>
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                              <Text>
                                {product.soldCount.toLocaleString("vi-VN")} sản
                                phẩm
                              </Text>
                            </Space>
                          </Col>
                        </Row>
                        {product.averageRating && (
                          <Row className={styles.specRow}>
                            <Col span={8} className={styles.specLabel}>
                              Đánh giá trung bình
                            </Col>
                            <Col span={16} className={styles.specValue}>
                              <Space>
                                <Rate
                                  disabled
                                  allowHalf
                                  value={product.averageRating}
                                  style={{ fontSize: 16 }}
                                />
                                <Text strong>{product.averageRating}</Text>
                                <Text type="secondary">
                                  ({product.ratingCount} đánh giá)
                                </Text>
                              </Space>
                            </Col>
                          </Row>
                        )}
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Ngày đăng bán
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            <Text type="secondary">
                              {new Date(product.createdAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </Text>
                          </Col>
                        </Row>
                        <Row className={styles.specRow}>
                          <Col span={8} className={styles.specLabel}>
                            Trạng thái
                          </Col>
                          <Col span={16} className={styles.specValue}>
                            {product.active ? (
                              <Tag
                                color="success"
                                icon={<CheckCircleOutlined />}
                              >
                                Đang kinh doanh
                              </Tag>
                            ) : (
                              <Tag color="error">Ngừng kinh doanh</Tag>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "reviews",
                  label: `Đánh giá (${product.ratingCount || 0})`,
                  children: (
                    <div className={styles.tabContent}>
                      <Empty description="Chưa có đánh giá nào" />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>

        {/* Variant Details Modal */}
        <Modal
          title="Thông tin chi tiết phiên bản"
          open={isVariantModalOpen}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" type="primary" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
          width={700}
          className={styles.variantModal}
        >
          {selectedVariant && (
            <div className={styles.variantModalContent}>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Tên phiên bản">
                  <Text strong>{selectedVariant.variantName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="SKU">
                  <Tag color="blue">{selectedVariant.sku}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Giá bán">
                  <Space>
                    <Text strong style={{ fontSize: 18, color: "#ee4d2d" }}>
                      {formatPrice(selectedVariant.price)}
                    </Text>
                    {selectedVariant.originalPrice > selectedVariant.price && (
                      <>
                        <Text delete type="secondary">
                          {formatPrice(selectedVariant.originalPrice)}
                        </Text>
                        <Tag color="red">
                          -
                          {calculateDiscount(
                            selectedVariant.originalPrice,
                            selectedVariant.price
                          )}
                          %
                        </Tag>
                      </>
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Tồn kho">
                  <Space>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        color:
                          selectedVariant.availableStock > 10
                            ? "#52c41a"
                            : "#faad14",
                      }}
                    >
                      {selectedVariant.availableStock}
                    </Text>
                    <Text type="secondary">sản phẩm có sẵn</Text>
                  </Space>
                </Descriptions.Item>

                {selectedVariant.reservedStock > 0 && (
                  <Descriptions.Item label="Đang giữ chỗ">
                    <Text type="warning">
                      {selectedVariant.reservedStock} sản phẩm
                    </Text>
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Đã bán">
                  <Text>{selectedVariant.soldQuantity || 0} sản phẩm</Text>
                </Descriptions.Item>

                {selectedVariant.weight && (
                  <Descriptions.Item label="Trọng lượng">
                    <Text>{selectedVariant.weight} gram</Text>
                  </Descriptions.Item>
                )}

                {selectedVariant.attributeValues &&
                  selectedVariant.attributeValues.length > 0 && (
                    <Descriptions.Item label="Thuộc tính">
                      <Space wrap>
                        {selectedVariant.attributeValues.map((attr) => (
                          <Tag key={attr.id} color="purple">
                            {attr.attributeName}: {attr.value}
                          </Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}

                <Descriptions.Item label="Trạng thái">
                  {selectedVariant.active ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Đang kinh doanh
                    </Tag>
                  ) : (
                    <Tag color="error">Ngừng kinh doanh</Tag>
                  )}
                </Descriptions.Item>

                {selectedVariant.imageUrl && (
                  <Descriptions.Item label="Hình ảnh">
                    <Image
                      src={selectedVariant.imageUrl}
                      alt={selectedVariant.variantName}
                      width={200}
                      style={{ borderRadius: 8 }}
                    />
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Ngày tạo">
                  <Text type="secondary">
                    {new Date(selectedVariant.createdAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Cập nhật lần cuối">
                  <Text type="secondary">
                    {new Date(selectedVariant.updatedAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default ProductDetailPage;
