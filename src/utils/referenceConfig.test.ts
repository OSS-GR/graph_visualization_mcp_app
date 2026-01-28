import { test, expect, describe } from "bun:test";
import {
  parseReferenceValue,
  extractNumericValues,
  calculateAverage,
  calculateMedian,
  validateReferenceValue,
  createReferenceLine,
  createReferenceArea,
  buildReferenceElements,
  validateReferenceElements,
  createStatisticLines,
} from "./referenceConfig";

// Sample test data
const testData = [
  { month: "Jan", sales: 4000, revenue: 2400 },
  { month: "Feb", sales: 3000, revenue: 1398 },
  { month: "Mar", sales: 2000, revenue: 9800 },
  { month: "Apr", sales: 2780, revenue: 3908 },
  { month: "May", sales: 1890, revenue: 4800 },
  { month: "Jun", sales: 2390, revenue: 3800 },
];

describe("parseReferenceValue", () => {
  test("should parse absolute number", () => {
    const result = parseReferenceValue(5000, testData);
    expect(result).toBe(5000);
  });

  test("should parse percentage values", () => {
    const result = parseReferenceValue("50%", testData, "sales");
    expect(result).toBe(2000); // 50% of max value (4000)
  });

  test("should parse average", () => {
    const result = parseReferenceValue("average", testData, "sales");
    expect(result).toBe(2676.666666666666);
  });

  test("should parse max", () => {
    const result = parseReferenceValue("max", testData, "sales");
    expect(result).toBe(4000);
  });

  test("should parse min", () => {
    const result = parseReferenceValue("min", testData, "sales");
    expect(result).toBe(1890);
  });

  test("should parse median", () => {
    const result = parseReferenceValue("median", testData, "sales");
    expect(result).toBe(2690);
  });

  test("should return undefined for invalid input", () => {
    const result = parseReferenceValue(undefined, testData);
    expect(result).toBeUndefined();
  });
});

describe("extractNumericValues", () => {
  test("should extract values by dataKey", () => {
    const result = extractNumericValues(testData, "sales");
    expect(result).toEqual([4000, 3000, 2000, 2780, 1890, 2390]);
  });

  test("should extract all numeric values when no dataKey provided", () => {
    const result = extractNumericValues(testData);
    expect(result.length).toBeGreaterThan(0);
  });

  test("should return empty array for non-numeric data", () => {
    const emptyData = [{ month: "Jan" }];
    const result = extractNumericValues(emptyData, "sales");
    expect(result).toEqual([]);
  });
});

describe("calculateAverage", () => {
  test("should calculate average correctly", () => {
    const values = [10, 20, 30, 40, 50];
    const result = calculateAverage(values);
    expect(result).toBe(30);
  });

  test("should handle empty array", () => {
    const result = calculateAverage([]);
    expect(result).toBe(0);
  });
});

describe("calculateMedian", () => {
  test("should calculate median for odd-length array", () => {
    const values = [10, 20, 30, 40, 50];
    const result = calculateMedian(values);
    expect(result).toBe(30);
  });

  test("should calculate median for even-length array", () => {
    const values = [10, 20, 30, 40];
    const result = calculateMedian(values);
    expect(result).toBe(25);
  });

  test("should handle empty array", () => {
    const result = calculateMedian([]);
    expect(result).toBe(0);
  });
});

describe("validateReferenceValue", () => {
  test("should validate absolute value", () => {
    const result = validateReferenceValue(5000, testData);
    expect(result.valid).toBe(true);
    expect(result.normalizedValue).toBe(5000);
  });

  test("should reject invalid value", () => {
    const result = validateReferenceValue("invalid", testData);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("should reject undefined value", () => {
    const result = validateReferenceValue(undefined, testData);
    expect(result.valid).toBe(false);
  });
});

describe("createReferenceLine", () => {
  test("should create reference line with defaults", () => {
    const result = createReferenceLine(5000);
    expect(result.type).toBe("line");
    expect(result.value).toBe(5000);
    expect(result.stroke).toBe("#999");
  });

  test("should create reference line with custom style", () => {
    const result = createReferenceLine(5000, "Target", { stroke: "#ff0000" });
    expect(result.type).toBe("line");
    expect(result.value).toBe(5000);
    expect(result.label).toBe("Target");
    expect(result.stroke).toBe("#ff0000");
  });
});

describe("createReferenceArea", () => {
  test("should create reference area with defaults", () => {
    const result = createReferenceArea(3000, 5000);
    expect(result.type).toBe("area");
    expect(result.fill).toBe("#ccc");
    expect(result.fillOpacity).toBe(0.1);
  });

  test("should create reference area with custom style", () => {
    const result = createReferenceArea(3000, 5000, "Target Range", { fill: "#cccccc" });
    expect(result.type).toBe("area");
    expect(result.label).toBe("Target Range");
    expect(result.fill).toBe("#cccccc");
  });
});

describe("buildReferenceElements", () => {
  test("should build reference elements from configurations", () => {
    const elements = [
      { type: "line" as const, value: "average", label: "Average" },
      { type: "line" as const, value: 5000, label: "Target" },
    ];
    const result = buildReferenceElements(elements, testData, "sales");
    expect(result.length).toBe(2);
    expect(result[0].value).toBeDefined();
    expect(result[1].value).toBe(5000);
  });

  test("should handle empty elements", () => {
    const result = buildReferenceElements(undefined, testData);
    expect(result).toEqual([]);
  });

  test("should handle empty array", () => {
    const result = buildReferenceElements([], testData);
    expect(result).toEqual([]);
  });
});

describe("validateReferenceElements", () => {
  test("should validate correct elements", () => {
    const elements = [
      { type: "line" as const, value: 5000, label: "Target" },
    ];
    const result = validateReferenceElements(elements, testData);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test("should reject invalid fillOpacity", () => {
    const elements = [
      { type: "area" as const, value: 5000, label: "Area", fillOpacity: 1.5 },
    ];
    const result = validateReferenceElements(elements, testData);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("should handle empty elements", () => {
    const result = validateReferenceElements(undefined, testData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("should reject invalid type", () => {
    const elements = [
      { type: "invalid" as any, value: 5000 },
    ];
    const result = validateReferenceElements(elements, testData);
    expect(result.valid).toBe(false);
  });
});

describe("createStatisticLines", () => {
  test("should create multiple statistic lines", () => {
    const result = createStatisticLines(testData, "sales", ["average", "max", "min"]);
    expect(result.length).toBe(3);
    expect(result[0].type).toBe("line");
    expect(result[0].label?.includes("Average")).toBe(true);
    expect(result[1].label?.includes("Max")).toBe(true);
    expect(result[2].label?.includes("Min")).toBe(true);
  });

  test("should handle missing numeric values", () => {
    const emptyData = [{ month: "Jan" }];
    const result = createStatisticLines(emptyData, "sales", ["average"]);
    expect(result.length).toBe(0);
  });

  test("should create median line", () => {
    const result = createStatisticLines(testData, "sales", ["median"]);
    expect(result.length).toBe(1);
    expect(result[0].label?.includes("Median")).toBe(true);
  });
});
