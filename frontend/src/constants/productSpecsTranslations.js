/**
 * Vietnamese translations for product specification keys
 * Mapping English keys to Vietnamese labels
 */

export const SPEC_KEY_TRANSLATIONS = {
  // Overview
  overview: "Tổng quan",
  brand: "Thương hiệu",
  productName: "Tên sản phẩm",
  releaseYear: "Năm ra mắt",
  operatingSystem: "Hệ điều hành",

  // Display
  display: "Màn hình",
  size: "Kích thước",
  resolution: "Độ phân giải",
  technology: "Công nghệ màn hình",
  refreshRate: "Tần số quét",
  maxBrightness: "Độ sáng tối đa",
  colorGamut: "Gam màu",
  protection: "Bảo vệ",

  // Performance
  performance: "Hiệu năng",
  chipset: "Chipset",
  cpu: "CPU",
  gpu: "GPU",
  ramOptions: "Tùy chọn RAM",
  ram: "RAM",
  storageOptions: "Tùy chọn bộ nhớ",
  storage: "Bộ nhớ trong",
  expandableStorage: "Hỗ trợ thẻ nhớ",

  // Camera
  camera: "Camera",
  frontCamera: "Camera trước",
  rearCamera: "Camera sau",
  rearCameras: "Camera sau",
  aperture: "Khẩu độ",
  sensor: "Cảm biến",
  type: "Loại",
  fieldOfView: "Góc chụp",
  opticalZoom: "Zoom quang học",
  videoRecording: "Quay video",
  rear: "Camera sau",
  front: "Camera trước",

  // Battery
  batteryCharging: "Pin & Sạc",
  battery: "Pin",
  capacity: "Dung lượng",
  charging: "Sạc",
  wired: "Sạc có dây",
  wireless: "Sạc không dây",
  reverseWireless: "Sạc ngược không dây",

  // Connectivity
  connectivity: "Kết nối",
  wifi: "WiFi",
  bluetooth: "Bluetooth",
  nfc: "NFC",
  sim: "SIM",
  usb: "USB",
  support5G: "Hỗ trợ 5G",
  gpsSystems: "Hệ thống định vị",

  // Audio
  audio: "Âm thanh",
  jack3_5mm: "Jack 3.5mm",
  dolbyAtmos: "Dolby Atmos",
  stereoSpeakers: "Loa stereo",
  speakers: "Loa",

  // Design
  design: "Thiết kế",
  dimensions: "Kích thước",
  weight: "Trọng lượng",
  materials: "Vật liệu",
  colors: "Màu sắc",
  width: "Rộng",
  height: "Cao",
  thickness: "Dày",

  // Durability
  durability: "Độ bền",
  waterResistance: "Kháng nước",
  dustResistance: "Kháng bụi",

  // Sensors
  sensors: "Cảm biến",

  // Special Features
  specialFeatures: "Tính năng đặc biệt",
  aiFeatures: "Tính năng AI",
  faceUnlock: "Mở khóa khuôn mặt",
  sPenSupport: "Hỗ trợ S Pen",
  coolingSystem: "Hệ thống tản nhiệt",
};

/**
 * Section configuration for product specifications
 * Defines the order, keys, and labels for each specification section
 */
export const SPEC_SECTION_CONFIG = [
  { key: "overview", label: "Thông tin tổng quan" },
  { key: "display", label: "Màn hình" },
  { key: "performance", label: "Hiệu năng & Bộ nhớ" },
  { key: "camera", label: "Camera & Quay phim" },
  { key: "batteryCharging", label: "Pin & Sạc" },
  { key: "connectivity", label: "Kết nối" },
  { key: "audio", label: "Âm thanh" },
  { key: "design", label: "Thiết kế & Trọng lượng" },
  { key: "durability", label: "Độ bền" },
  { key: "sensors", label: "Cảm biến" },
  { key: "specialFeatures", label: "Tính năng đặc biệt" },
];

/**
 * Get translated label for a spec key
 * @param {string} key - The specification key
 * @returns {string} Translated label in Vietnamese
 */
export const getTranslatedKey = (key) => {
  return (
    SPEC_KEY_TRANSLATIONS[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
};

/**
 * Get spec sections configuration based on available data
 * @param {Object} productSpecs - Product specifications object
 * @returns {Array} Array of section configurations
 */
export const getSpecSectionConfig = (productSpecs) => {
  const sections = [];

  if (!productSpecs) return sections;

  // Dynamically add sections that exist in productSpecs
  Object.keys(productSpecs).forEach((key) => {
    const config = SPEC_SECTION_CONFIG.find((s) => s.key === key);
    if (config) {
      sections.push({
        ...config,
        data: productSpecs[key],
      });
    } else {
      // Handle unknown keys
      sections.push({
        key,
        label: getTranslatedKey(key),
        data: productSpecs[key],
      });
    }
  });

  return sections;
};
