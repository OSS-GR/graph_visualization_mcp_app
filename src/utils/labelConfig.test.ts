import { test, expect, describe } from "bun:test";
import {
  applyLabelFormatting,
  formatCurrency,
  formatPercentage,
  formatDecimal,
  buildLabelConfig,
  createLabelListConfig,
  createPieLabelConfig,
  shouldUseLabelLine,
  isValidLabelPosition,
  isValidFormatter,
  isStandardFormatter,
  getFormatterDisplayName,
  getRecommendedOffset,
} from "./labelConfig";
import type { LabelConfig } from "../types";

describe("applyLabelFormatting", () => {
  test("should format currency correctly", () => {
    const result = applyLabelFormatting(1234.56, "Currency");
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  test("should format percentage correctly", () => {
    const result = applyLabelFormatting(0.5, "Percentage");
    expect(result).toBe("50.0%");
  });

  test("should format decimal correctly", () => {
    const result = applyLabelFormatting(3.14159, "Decimal");
    expect(result).toBe("3.14");
  });

  test("should handle default formatting", () => {
    const result = applyLabelFormatting(42, "default");
    expect(result).toBe("42");
  });

  test("should handle null/undefined values", () => {
    expect(applyLabelFormatting(null as any, "Currency")).toBe("");
    expect(applyLabelFormatting(undefined as any, "Currency")).toBe("");
  });

  test("should handle string numbers", () => {
    const result = applyLabelFormatting("100", "Currency");
    expect(result).toContain("100");
  });

  test("should handle NaN strings", () => {
    const result = applyLabelFormatting("not-a-number", "Currency");
    expect(result).toBe("not-a-number");
  });
});

describe("formatCurrency", () => {
  test("should format positive numbers as currency", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  test("should format negative numbers", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
  });

  test("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatPercentage", () => {
  test("should convert decimal to percentage", () => {
    expect(formatPercentage(0.5)).toBe("50.0%");
    expect(formatPercentage(0.25)).toBe("25.0%");
  });

  test("should handle whole numbers", () => {
    const result = formatPercentage(1);
    expect(result).toBe("100.0%");
  });

  test("should handle small decimals", () => {
    const result = formatPercentage(0.001);
    expect(result).toBe("0.1%");
  });
});

describe("formatDecimal", () => {
  test("should format with default precision", () => {
    expect(formatDecimal(3.14159)).toBe("3.14");
  });

  test("should format with custom precision", () => {
    expect(formatDecimal(3.14159, 4)).toBe("3.1416");
  });

  test("should handle integers", () => {
    expect(formatDecimal(42, 2)).toBe("42.00");
  });
});

describe("buildLabelConfig", () => {
  test("should return empty object if disabled", () => {
    const config: LabelConfig = { enabled: false };
    const result = buildLabelConfig(config);
    expect(Object.keys(result).length).toBe(0);
  });

  test("should return empty object if config is undefined", () => {
    const result = buildLabelConfig(undefined);
    expect(Object.keys(result).length).toBe(0);
  });

  test("should include position when enabled", () => {
    const config: LabelConfig = { enabled: true, position: "top" };
    const result = buildLabelConfig(config);
    expect(result.position).toBe("top");
  });

  test("should include all properties when set", () => {
    const config: LabelConfig = {
      enabled: true,
      position: "inside",
      offset: 5,
      angle: 45,
      color: "#FF0000",
      fontSize: 16,
      fontWeight: "bold",
      zIndex: 10,
      formatter: "Currency",
    };
    const result = buildLabelConfig(config);
    expect(result.position).toBe("inside");
    expect(result.offset).toBe(5);
    expect(result.angle).toBe(45);
    expect(result.fill).toBe("#FF0000");
    expect(result.fontSize).toBe(16);
    expect(result.fontWeight).toBe("bold");
    expect(result.zIndex).toBe(10);
    expect(typeof result.formatter).toBe("function");
  });

  test("should not include angle if zero", () => {
    const config: LabelConfig = { enabled: true, angle: 0 };
    const result = buildLabelConfig(config);
    expect("angle" in result).toBe(false);
  });
});

describe("createLabelListConfig", () => {
  test("should return undefined if disabled", () => {
    const config: LabelConfig = { enabled: false };
    const result = createLabelListConfig(config);
    expect(result).toBeUndefined();
  });

  test("should include default fontSize", () => {
    const config: LabelConfig = { enabled: true };
    const result = createLabelListConfig(config);
    expect(result?.fontSize).toBe(12);
  });

  test("should use provided fontSize", () => {
    const config: LabelConfig = { enabled: true, fontSize: 20 };
    const result = createLabelListConfig(config);
    expect(result?.fontSize).toBe(20);
  });

  test("should use provided color", () => {
    const config: LabelConfig = { enabled: true, color: "#0000FF" };
    const result = createLabelListConfig(config);
    expect(result?.fill).toBe("#0000FF");
  });

  test("should use default color if not provided", () => {
    const config: LabelConfig = { enabled: true };
    const result = createLabelListConfig(config, "#123456");
    expect(result?.fill).toBe("#123456");
  });
});

describe("createPieLabelConfig", () => {
  test("should return undefined if disabled", () => {
    const config: LabelConfig = { enabled: false };
    const result = createPieLabelConfig(config);
    expect(result).toBeUndefined();
  });

  test("should use larger default fontSize for pie", () => {
    const config: LabelConfig = { enabled: true };
    const result = createPieLabelConfig(config);
    expect(result?.fontSize).toBe(14);
  });

  test("should include all provided properties", () => {
    const config: LabelConfig = {
      enabled: true,
      position: "center",
      offset: 10,
      color: "#FF0000",
      fontSize: 18,
      fontWeight: "bold",
    };
    const result = createPieLabelConfig(config);
    expect(result?.position).toBe("center");
    expect(result?.offset).toBe(10);
    expect(result?.fill).toBe("#FF0000");
    expect(result?.fontSize).toBe(18);
    expect(result?.fontWeight).toBe("bold");
  });
});

describe("shouldUseLabelLine", () => {
  test("should return true for top position", () => {
    expect(shouldUseLabelLine("top")).toBe(true);
  });

  test("should return false for center position", () => {
    expect(shouldUseLabelLine("center")).toBe(false);
  });

  test("should return false for inside position", () => {
    expect(shouldUseLabelLine("inside")).toBe(false);
  });

  test("should return true for outside position", () => {
    expect(shouldUseLabelLine("outside")).toBe(true);
  });

  test("should return true for undefined", () => {
    expect(shouldUseLabelLine(undefined)).toBe(true);
  });
});

describe("isValidLabelPosition", () => {
  test("should validate bar chart positions", () => {
    expect(isValidLabelPosition("top", "bar")).toBe(true);
    expect(isValidLabelPosition("bottom", "bar")).toBe(true);
    expect(isValidLabelPosition("left", "bar")).toBe(true);
    expect(isValidLabelPosition("right", "bar")).toBe(true);
    expect(isValidLabelPosition("inside", "bar")).toBe(true);
    expect(isValidLabelPosition("outside", "bar")).toBe(true);
    expect(isValidLabelPosition("center", "bar")).toBe(true);
  });

  test("should validate pie chart positions", () => {
    expect(isValidLabelPosition("center", "pie")).toBe(true);
    expect(isValidLabelPosition("inside", "pie")).toBe(true);
    expect(isValidLabelPosition("outside", "pie")).toBe(true);
    expect(isValidLabelPosition("top", "pie")).toBe(false);
  });

  test("should return true for undefined", () => {
    expect(isValidLabelPosition(undefined, "bar")).toBe(true);
  });
});

describe("isValidFormatter", () => {
  test("should validate standard formatters", () => {
    expect(isValidFormatter("Currency")).toBe(true);
    expect(isValidFormatter("Percentage")).toBe(true);
    expect(isValidFormatter("Decimal")).toBe(true);
    expect(isValidFormatter("default")).toBe(true);
  });

  test("should return true for undefined", () => {
    expect(isValidFormatter(undefined)).toBe(true);
  });

  test("should return false for unknown formatters", () => {
    expect(isValidFormatter("Unknown")).toBe(false);
  });
});

describe("isStandardFormatter", () => {
  test("should identify standard formatters", () => {
    expect(isStandardFormatter("Currency")).toBe(true);
    expect(isStandardFormatter("Percentage")).toBe(true);
    expect(isStandardFormatter("Decimal")).toBe(true);
    expect(isStandardFormatter("default")).toBe(true);
  });

  test("should return true for undefined", () => {
    expect(isStandardFormatter(undefined)).toBe(true);
  });

  test("should return false for custom formatters", () => {
    expect(isStandardFormatter("Custom")).toBe(false);
  });
});

describe("getFormatterDisplayName", () => {
  test("should return display name for Currency", () => {
    expect(getFormatterDisplayName("Currency")).toBe("Currency ($)");
  });

  test("should return display name for Percentage", () => {
    expect(getFormatterDisplayName("Percentage")).toBe("Percentage (%)");
  });

  test("should return display name for Decimal", () => {
    expect(getFormatterDisplayName("Decimal")).toBe("Decimal");
  });

  test("should return default for unknown", () => {
    expect(getFormatterDisplayName("Unknown")).toBe("Default");
  });

  test("should return default for undefined", () => {
    expect(getFormatterDisplayName(undefined)).toBe("Default");
  });
});

describe("getRecommendedOffset", () => {
  test("should return recommended offset for top", () => {
    expect(getRecommendedOffset("top", "bar")).toBe(10);
  });

  test("should return recommended offset for inside", () => {
    expect(getRecommendedOffset("inside", "bar")).toBe(0);
  });

  test("should return recommended offset for center", () => {
    expect(getRecommendedOffset("center", "pie")).toBe(0);
  });

  test("should return 0 for undefined", () => {
    expect(getRecommendedOffset(undefined, "bar")).toBe(0);
  });
});
