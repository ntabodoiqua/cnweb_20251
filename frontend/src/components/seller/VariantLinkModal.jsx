import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Empty,
  Spin,
  notification,
  Tooltip,
  Avatar,
  Checkbox,
  Alert,
  Radio,
} from "antd";
import {
  LinkOutlined,
  DisconnectOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  getProductVariantsApi,
  linkVariantsToOptionApi,
  unlinkVariantsFromOptionApi,
} from "../../util/api";
import styles from "./VariantLinkModal.module.css";

const VariantLinkModal = ({
  visible,
  onClose,
  productId,
  groupId,
  option,
  linkedVariantIds = [],
  allOptionsInGroup = [], // Tất cả options trong group để kiểm tra conflict
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [variants, setVariants] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  const [initialLinkedIds, setInitialLinkedIds] = useState([]);

  // Fetch all variants when modal opens
  useEffect(() => {
    if (visible && productId) {
      fetchVariants();
      setInitialLinkedIds(linkedVariantIds || []);
      setSelectedVariantIds(linkedVariantIds || []);
    }
  }, [visible, productId, linkedVariantIds]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await getProductVariantsApi(productId);
      if (response.code === 1000) {
        setVariants(response.result || []);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách biến thể",
      });
    } finally {
      setLoading(false);
    }
  };

  // Build map: variantId -> which option it's linked to (trong cùng group, không phải option hiện tại)
  const variantToOtherOptionMap = useMemo(() => {
    const map = {};
    allOptionsInGroup.forEach((opt) => {
      if (opt.id !== option?.id && opt.linkedVariantIds) {
        opt.linkedVariantIds.forEach((variantId) => {
          map[variantId] = opt;
        });
      }
    });
    return map;
  }, [allOptionsInGroup, option?.id]);

  // Filter variants based on search
  const filteredVariants = useMemo(() => {
    if (!searchText.trim()) return variants;
    const search = searchText.toLowerCase();
    return variants.filter(
      (v) =>
        v.variantName?.toLowerCase().includes(search) ||
        v.sku?.toLowerCase().includes(search)
    );
  }, [variants, searchText]);

  // Check if a variant is linked to current option
  const isLinked = useCallback(
    (variantId) => selectedVariantIds.includes(variantId),
    [selectedVariantIds]
  );

  // Check if variant is linked to another option in same group
  const getLinkedOtherOption = useCallback(
    (variantId) => variantToOtherOptionMap[variantId],
    [variantToOtherOptionMap]
  );

  // Toggle variant selection - exclusive within group
  const toggleVariant = useCallback((variantId) => {
    setSelectedVariantIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  }, []);

  // Select all visible variants (that are not linked to other options)
  const selectAllVisible = useCallback(() => {
    const visibleIds = filteredVariants
      .filter((v) => !getLinkedOtherOption(v.id)) // Chỉ chọn những variant chưa liên kết với option khác
      .map((v) => v.id);
    setSelectedVariantIds((prev) => {
      const newSet = new Set(prev);
      visibleIds.forEach((id) => newSet.add(id));
      return Array.from(newSet);
    });
  }, [filteredVariants, getLinkedOtherOption]);

  // Deselect all visible variants
  const deselectAllVisible = useCallback(() => {
    const visibleIds = new Set(filteredVariants.map((v) => v.id));
    setSelectedVariantIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  }, [filteredVariants]);

  // Get changes to apply
  const getChanges = useCallback(() => {
    const toLink = selectedVariantIds.filter(
      (id) => !initialLinkedIds.includes(id)
    );
    const toUnlink = initialLinkedIds.filter(
      (id) => !selectedVariantIds.includes(id)
    );
    return { toLink, toUnlink };
  }, [selectedVariantIds, initialLinkedIds]);

  const { toLink, toUnlink } = getChanges();
  const hasChanges = toLink.length > 0 || toUnlink.length > 0;

  // Count variants that will be moved from other options
  const variantsToMove = useMemo(() => {
    return toLink.filter((id) => variantToOtherOptionMap[id]);
  }, [toLink, variantToOtherOptionMap]);

  // Get variants that need to be unlinked from OTHER options (when moving)
  const getVariantsToUnlinkFromOtherOptions = useCallback(() => {
    // Group variants by their current option
    const unlinkMap = {}; // { optionId: [variantIds] }

    variantsToMove.forEach((variantId) => {
      const otherOption = variantToOtherOptionMap[variantId];
      if (otherOption) {
        if (!unlinkMap[otherOption.id]) {
          unlinkMap[otherOption.id] = [];
        }
        unlinkMap[otherOption.id].push(variantId);
      }
    });

    return unlinkMap;
  }, [variantsToMove, variantToOtherOptionMap]);

  // Submit changes
  const handleSubmit = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Unlink variants from OTHER options first (when moving)
      const unlinkFromOtherOptions = getVariantsToUnlinkFromOtherOptions();
      for (const [otherOptionId, variantIds] of Object.entries(
        unlinkFromOtherOptions
      )) {
        await unlinkVariantsFromOptionApi(
          productId,
          groupId,
          otherOptionId,
          variantIds
        );
      }

      // Step 2: Link new variants to current option
      if (toLink.length > 0) {
        await linkVariantsToOptionApi(productId, groupId, option.id, toLink);
      }

      // Step 3: Unlink removed variants from current option
      if (toUnlink.length > 0) {
        await unlinkVariantsFromOptionApi(
          productId,
          groupId,
          option.id,
          toUnlink
        );
      }

      notification.success({
        message: "Thành công",
        description: `Đã cập nhật liên kết biến thể cho tùy chọn "${
          option.label || option.value
        }"`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating variant links:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message ||
          "Không thể cập nhật liên kết biến thể",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "",
      key: "select",
      width: 50,
      render: (_, record) => {
        const otherOption = getLinkedOtherOption(record.id);
        const isCurrentlyLinked = isLinked(record.id);

        return (
          <Checkbox
            checked={isCurrentlyLinked}
            onChange={() => toggleVariant(record.id)}
          />
        );
      },
    },
    {
      title: "Biến thể",
      key: "variant",
      render: (_, record) => (
        <div className={styles.variantInfo}>
          {record.imageUrl && (
            <Avatar
              src={record.imageUrl}
              size={40}
              shape="square"
              className={styles.variantImage}
            />
          )}
          <div className={styles.variantDetails}>
            <div className={styles.variantName}>{record.variantName}</div>
            <div className={styles.variantSku}>SKU: {record.sku}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      key: "price",
      width: 150,
      render: (_, record) => (
        <div className={styles.priceCell}>
          <span className={styles.price}>
            ₫{record.price?.toLocaleString("vi-VN")}
          </span>
          {record.originalPrice && record.originalPrice !== record.price && (
            <span className={styles.originalPrice}>
              ₫{record.originalPrice?.toLocaleString("vi-VN")}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      key: "stock",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tag color={record.availableStock > 10 ? "green" : "orange"}>
          {record.availableStock}
        </Tag>
      ),
    },
    {
      title: "Liên kết hiện tại",
      key: "currentLink",
      width: 180,
      render: (_, record) => {
        const otherOption = getLinkedOtherOption(record.id);
        const isCurrentlyLinked = isLinked(record.id);

        if (isCurrentlyLinked) {
          return (
            <Tag color="blue" icon={<CheckCircleOutlined />}>
              → {option?.label || option?.value}
            </Tag>
          );
        }

        if (otherOption) {
          return (
            <Tooltip
              title={`Đang liên kết với "${
                otherOption.label || otherOption.value
              }". Chọn để chuyển sang option này.`}
            >
              <Tag
                color="orange"
                icon={<WarningOutlined />}
                className={styles.linkedOtherTag}
              >
                → {otherOption.label || otherOption.value}
              </Tag>
            </Tooltip>
          );
        }

        return (
          <Tag color="default" icon={<DisconnectOutlined />}>
            Chưa liên kết
          </Tag>
        );
      },
    },
    {
      title: "Thay đổi",
      key: "change",
      width: 120,
      align: "center",
      render: (_, record) => {
        const wasLinked = initialLinkedIds.includes(record.id);
        const nowLinked = isLinked(record.id);
        const otherOption = getLinkedOtherOption(record.id);

        if (!wasLinked && nowLinked) {
          if (otherOption) {
            return (
              <Tag color="purple" icon={<SwapOutlined />}>
                Chuyển
              </Tag>
            );
          }
          return (
            <Tag color="green" icon={<LinkOutlined />}>
              + Thêm
            </Tag>
          );
        }

        if (wasLinked && !nowLinked) {
          return (
            <Tag color="red" icon={<DisconnectOutlined />}>
              - Bỏ
            </Tag>
          );
        }

        return <span style={{ color: "#999" }}>—</span>;
      },
    },
  ];

  // Stats
  const availableVariants = filteredVariants.filter(
    (v) => !getLinkedOtherOption(v.id)
  );
  const allVisibleSelected =
    availableVariants.length > 0 &&
    availableVariants.every((v) => isLinked(v.id));
  const someVisibleSelected =
    availableVariants.some((v) => isLinked(v.id)) && !allVisibleSelected;

  return (
    <Modal
      title={
        <Space>
          <LinkOutlined />
          <span>Liên kết Biến thể với Tùy chọn</span>
          {option && (
            <Tag
              color={option.colorCode || "blue"}
              style={
                option.colorCode
                  ? {
                      backgroundColor: option.colorCode,
                      color: getContrastColor(option.colorCode),
                      border: "1px solid rgba(0,0,0,0.1)",
                    }
                  : undefined
              }
            >
              {option.label || option.value}
            </Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.footerStats}>
            <Space split={<span className={styles.divider}>|</span>}>
              <span>
                Đã chọn: <strong>{selectedVariantIds.length}</strong> biến thể
              </span>
              {hasChanges && (
                <>
                  {toLink.length > 0 && (
                    <span className={styles.toLink}>+{toLink.length} thêm</span>
                  )}
                  {variantsToMove.length > 0 && (
                    <span className={styles.toMove}>
                      ↔ {variantsToMove.length} chuyển
                    </span>
                  )}
                  {toUnlink.length > 0 && (
                    <span className={styles.toUnlink}>
                      -{toUnlink.length} bỏ
                    </span>
                  )}
                </>
              )}
            </Space>
          </div>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!hasChanges}
            >
              {hasChanges ? "Lưu thay đổi" : "Đóng"}
            </Button>
          </Space>
        </div>
      }
      destroyOnClose
    >
      {/* Info Alert */}
      <Alert
        message="Quy tắc liên kết biến thể"
        description={
          <div>
            <p style={{ margin: 0 }}>
              Mỗi biến thể chỉ được liên kết với{" "}
              <strong>1 tùy chọn duy nhất</strong> trong cùng một nhóm.
            </p>
            <p style={{ margin: "4px 0 0 0", color: "#666" }}>
              Ví dụ: "iPhone 17 ProMax Titanium 256GB" chỉ liên kết với "ProMax"
              (không phải cả "Pro" lẫn "ProMax").
            </p>
            {variantsToMove.length > 0 && (
              <p style={{ margin: "8px 0 0 0", color: "#fa8c16" }}>
                <WarningOutlined /> {variantsToMove.length} biến thể sẽ được{" "}
                <strong>chuyển</strong> từ option khác sang "
                {option?.label || option?.value}".
              </p>
            )}
          </div>
        }
        type={variantsToMove.length > 0 ? "warning" : "info"}
        showIcon
        icon={
          variantsToMove.length > 0 ? (
            <WarningOutlined />
          ) : (
            <InfoCircleOutlined />
          )
        }
        className={styles.infoAlert}
      />

      {/* Search and Actions */}
      <div className={styles.toolbar}>
        <Input
          placeholder="Tìm kiếm biến thể..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className={styles.searchInput}
        />
        <Space>
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onChange={(e) =>
              e.target.checked ? selectAllVisible() : deselectAllVisible()
            }
          >
            Chọn chưa liên kết ({availableVariants.length})
          </Checkbox>
        </Space>
      </div>

      {/* Variants Table */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin tip="Đang tải danh sách biến thể..." />
        </div>
      ) : variants.length === 0 ? (
        <Empty
          description="Sản phẩm chưa có biến thể nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredVariants}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} biến thể`,
          }}
          size="small"
          rowClassName={(record) => {
            const isCurrentlyLinked = isLinked(record.id);
            const otherOption = getLinkedOtherOption(record.id);

            if (isCurrentlyLinked) return styles.linkedRow;
            if (otherOption) return styles.linkedOtherRow;
            return "";
          }}
          onRow={(record) => ({
            onClick: () => toggleVariant(record.id),
            style: { cursor: "pointer" },
          })}
        />
      )}
    </Modal>
  );
};

// Helper function to get contrast color
const getContrastColor = (hexColor) => {
  if (!hexColor) return "#000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000" : "#fff";
};

export default VariantLinkModal;
