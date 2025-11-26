/**
 * Product Specifications Translation Utilities
 * Backend API now provides all labels (labelVi, groupLabelVi)
 * This file only contains fallback logic if backend doesn't provide labels
 */

/**
 * Fallback: Auto-generate label from camelCase key if backend doesn't provide labelVi
 * @param {string} key - The specification key in camelCase
 * @returns {string} Human-readable label
 */
const autoGenerateLabel = (key) => {
  // Handle special cases
  const specialCases = {
    "5g": "5G",
    "3_5mm": "3.5mm",
    wifi: "WiFi",
    usb: "USB",
    cpu: "CPU",
    gpu: "GPU",
    ram: "RAM",
    nfc: "NFC",
    sim: "SIM",
    ai: "AI",
  };

  // Split camelCase and handle special characters
  let label = key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();

  // Capitalize first letter only
  label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

  // Handle special cases
  Object.entries(specialCases).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, "gi");
    label = label.replace(regex, replacement);
  });

  return label;
};

/**
 * Group specs by 'group' field from backend metadata
 * Backend provides: group, groupLabelVi, displayOrder for each spec
 *
 * @param {Object} productSpecs - Product specifications object with backend metadata
 * @returns {Array} Array of section configurations sorted by displayOrder
 */
export const getSpecSectionConfig = (productSpecs) => {
  if (!productSpecs || typeof productSpecs !== "object") {
    return [];
  }

  // Group specs by 'group' field
  const groupedSpecs = {};
  const groupLabels = {};

  Object.entries(productSpecs).forEach(([key, specData]) => {
    if (!specData || typeof specData !== "object") return;

    const group = specData.group || "other";
    const groupLabel =
      specData.groupLabelVi ||
      specData.groupLabelEn ||
      autoGenerateLabel(group);

    if (!groupedSpecs[group]) {
      groupedSpecs[group] = {};
      groupLabels[group] = groupLabel;
    }

    groupedSpecs[group][key] = specData;
  });

  // Convert to sections array and sort by minimum displayOrder in each group
  const groupEntries = Object.entries(groupedSpecs).map(([groupKey, specs]) => {
    const minDisplayOrder = Math.min(
      ...Object.values(specs).map((s) => s.displayOrder || 999)
    );
    return {
      key: groupKey,
      label: groupLabels[groupKey],
      data: specs,
      minDisplayOrder,
    };
  });

  // Sort groups by their minimum displayOrder
  groupEntries.sort((a, b) => a.minDisplayOrder - b.minDisplayOrder);

  return groupEntries;
};
