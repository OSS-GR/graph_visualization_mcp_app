import { test, expect, describe, beforeEach } from "bun:test";
import {
  buildSyncConfig,
  createGlobalSyncState,
  registerSyncListener,
  unregisterSyncListener,
  handleSyncedTooltip,
  getActiveSyncedTooltip,
  clearSyncedTooltip,
  handleSyncedBrush,
  getActiveSyncedBrush,
  clearSyncedBrush,
  findIndexByValue,
  findValueByIndex,
  transformTooltipIndex,
  transformBrushRange,
  isValidSyncId,
  extractSyncConfig,
  type GlobalSyncState,
} from "./syncConfig";

describe("syncConfig utilities", () => {
  let syncState: GlobalSyncState;

  beforeEach(() => {
    syncState = createGlobalSyncState();
  });

  describe("buildSyncConfig", () => {
    test("should create a valid sync config", () => {
      const config = buildSyncConfig("chart-sync-1", "index");

      expect(config).toEqual({
        syncId: "chart-sync-1",
        syncMethod: "index",
        enableTooltipSync: true,
        enableBrushSync: true,
      });
    });

    test("should accept value-based sync method", () => {
      const config = buildSyncConfig("chart-sync-1", "value", true, false);

      expect(config.syncMethod).toBe("value");
      expect(config.enableBrushSync).toBe(false);
    });

    test("should throw on empty syncId", () => {
      expect(() => buildSyncConfig("", "index")).toThrow();
      expect(() => buildSyncConfig("  ", "index")).toThrow();
    });

    test("should throw on invalid syncMethod", () => {
      expect(() => buildSyncConfig("chart-sync-1", "invalid" as any)).toThrow();
    });

    test("should default to index-based sync", () => {
      const config = buildSyncConfig("chart-sync-1");
      expect(config.syncMethod).toBe("index");
    });
  });

  describe("createGlobalSyncState", () => {
    test("should create an empty sync state", () => {
      const state = createGlobalSyncState();

      expect(state.tooltips.size).toBe(0);
      expect(state.brushes.size).toBe(0);
      expect(state.listeners.size).toBe(0);
    });

    test("should initialize with empty collections", () => {
      const state = createGlobalSyncState();

      expect(state.tooltips).toBeDefined();
      expect(state.brushes).toBeDefined();
      expect(state.listeners).toBeDefined();
    });
  });

  describe("listener management", () => {
    test("should register a listener", () => {
      const listener = () => {};
      registerSyncListener(syncState, "chart-sync-1", listener);

      expect(syncState.listeners.has("chart-sync-1")).toBe(true);
      expect(syncState.listeners.get("chart-sync-1")?.has(listener)).toBe(true);
    });

    test("should unregister a listener", () => {
      const listener = () => {};
      registerSyncListener(syncState, "chart-sync-1", listener);
      unregisterSyncListener(syncState, "chart-sync-1", listener);

      expect(syncState.listeners.get("chart-sync-1")?.has(listener)).toBe(false);
    });

    test("should support multiple listeners for same syncId", () => {
      const listener1 = () => {};
      const listener2 = () => {};

      registerSyncListener(syncState, "chart-sync-1", listener1);
      registerSyncListener(syncState, "chart-sync-1", listener2);

      const listeners = syncState.listeners.get("chart-sync-1");
      expect(listeners?.size).toBe(2);
      expect(listeners?.has(listener1)).toBe(true);
      expect(listeners?.has(listener2)).toBe(true);
    });
  });

  describe("tooltip synchronization", () => {
    test("should handle synced tooltip", () => {
      handleSyncedTooltip(syncState, "chart-sync-1", {
        active: true,
        index: 2,
      });

      const tooltip = syncState.tooltips.get("chart-sync-1");
      expect(tooltip).toBeDefined();
      expect(tooltip?.active).toBe(true);
      expect(tooltip?.index).toBe(2);
      expect(tooltip?.syncId).toBe("chart-sync-1");
    });

    test("should get active synced tooltip", () => {
      handleSyncedTooltip(syncState, "chart-sync-1", {
        active: true,
        index: 1,
      });

      const activeTooltip = getActiveSyncedTooltip(syncState, "chart-sync-1");
      expect(activeTooltip).toBeDefined();
      expect(activeTooltip?.index).toBe(1);
    });

    test("should return undefined for inactive tooltip", () => {
      handleSyncedTooltip(syncState, "chart-sync-1", {
        active: false,
        index: 1,
      });

      const activeTooltip = getActiveSyncedTooltip(syncState, "chart-sync-1");
      expect(activeTooltip).toBeUndefined();
    });

    test("should clear synced tooltip", () => {
      handleSyncedTooltip(syncState, "chart-sync-1", {
        active: true,
        index: 1,
      });

      clearSyncedTooltip(syncState, "chart-sync-1");
      const activeTooltip = getActiveSyncedTooltip(syncState, "chart-sync-1");
      expect(activeTooltip).toBeUndefined();
    });

    test("should merge tooltip state on update", () => {
      handleSyncedTooltip(syncState, "chart-sync-1", {
        active: true,
        index: 1,
      });

      handleSyncedTooltip(syncState, "chart-sync-1", {
        value: "January",
      });

      const tooltip = syncState.tooltips.get("chart-sync-1");
      expect(tooltip?.index).toBe(1);
      expect(tooltip?.value).toBe("January");
      expect(tooltip?.active).toBe(true);
    });
  });

  describe("brush synchronization", () => {
    test("should handle synced brush", () => {
      handleSyncedBrush(syncState, "chart-sync-1", {
        dataStartIndex: 2,
        dataEndIndex: 5,
      });

      const brush = syncState.brushes.get("chart-sync-1");
      expect(brush).toBeDefined();
      expect(brush?.dataStartIndex).toBe(2);
      expect(brush?.dataEndIndex).toBe(5);
    });

    test("should get active synced brush", () => {
      handleSyncedBrush(syncState, "chart-sync-1", {
        dataStartIndex: 1,
        dataEndIndex: 4,
      });

      const activeBrush = getActiveSyncedBrush(syncState, "chart-sync-1");
      expect(activeBrush).toBeDefined();
      expect(activeBrush?.dataStartIndex).toBe(1);
      expect(activeBrush?.dataEndIndex).toBe(4);
    });

    test("should clear synced brush", () => {
      handleSyncedBrush(syncState, "chart-sync-1", {
        dataStartIndex: 1,
        dataEndIndex: 4,
      });

      clearSyncedBrush(syncState, "chart-sync-1");
      const activeBrush = getActiveSyncedBrush(syncState, "chart-sync-1");
      expect(activeBrush).toBeUndefined();
    });

    test("should throw on missing dataStartIndex", () => {
      expect(() => {
        handleSyncedBrush(syncState, "chart-sync-1", {
          dataEndIndex: 5,
        } as any);
      }).toThrow();
    });

    test("should throw on missing dataEndIndex", () => {
      expect(() => {
        handleSyncedBrush(syncState, "chart-sync-1", {
          dataStartIndex: 2,
        } as any);
      }).toThrow();
    });

    test("should update brush state", () => {
      handleSyncedBrush(syncState, "chart-sync-1", {
        dataStartIndex: 1,
        dataEndIndex: 4,
      });

      handleSyncedBrush(syncState, "chart-sync-1", {
        dataStartIndex: 2,
        dataEndIndex: 6,
      });

      const brush = syncState.brushes.get("chart-sync-1");
      expect(brush?.dataStartIndex).toBe(2);
      expect(brush?.dataEndIndex).toBe(6);
    });
  });

  describe("data transformation utilities", () => {
    const testData = [
      { month: "Jan", sales: 100 },
      { month: "Feb", sales: 150 },
      { month: "Mar", sales: 200 },
      { month: "Apr", sales: 250 },
    ];

    describe("findIndexByValue", () => {
      test("should find index by categorical value", () => {
        const index = findIndexByValue(testData, "month", "Mar");
        expect(index).toBe(2);
      });

      test("should find first matching value", () => {
        const index = findIndexByValue(testData, "month", "Jan");
        expect(index).toBe(0);
      });

      test("should return undefined for non-existent value", () => {
        const index = findIndexByValue(testData, "month", "May");
        expect(index).toBeUndefined();
      });
    });

    describe("findValueByIndex", () => {
      test("should find categorical value by index", () => {
        const value = findValueByIndex(testData, "month", 2);
        expect(value).toBe("Mar");
      });

      test("should handle first index", () => {
        const value = findValueByIndex(testData, "month", 0);
        expect(value).toBe("Jan");
      });

      test("should handle last index", () => {
        const value = findValueByIndex(testData, "month", 3);
        expect(value).toBe("Apr");
      });

      test("should return undefined for out-of-bounds index", () => {
        const value = findValueByIndex(testData, "month", 10);
        expect(value).toBeUndefined();
      });

      test("should return undefined for negative index", () => {
        const value = findValueByIndex(testData, "month", -1);
        expect(value).toBeUndefined();
      });
    });

    describe("transformTooltipIndex", () => {
      const targetData = [
        { period: "Jan", revenue: 500 },
        { period: "Feb", revenue: 600 },
        { period: "Mar", revenue: 700 },
      ];

      test("should transform index-based tooltip", () => {
        const targetIndex = transformTooltipIndex(
          testData,
          targetData,
          1,
          "month",
          "period",
          "index"
        );
        expect(targetIndex).toBe(1);
      });

      test("should return undefined for out-of-bounds index sync", () => {
        const targetIndex = transformTooltipIndex(
          testData,
          targetData,
          10,
          "month",
          "period",
          "index"
        );
        expect(targetIndex).toBeUndefined();
      });

      test("should transform value-based tooltip", () => {
        const targetIndex = transformTooltipIndex(
          testData,
          targetData,
          2,
          "month",
          "period",
          "value"
        );
        expect(targetIndex).toBe(2);
      });

      test("should return undefined for non-matching value", () => {
        const targetIndex = transformTooltipIndex(
          testData,
          targetData,
          3, // Apr - not in target data
          "month",
          "period",
          "value"
        );
        expect(targetIndex).toBeUndefined();
      });
    });

    describe("transformBrushRange", () => {
      const targetData = [
        { period: "Jan", revenue: 500 },
        { period: "Feb", revenue: 600 },
        { period: "Mar", revenue: 700 },
      ];

      test("should transform index-based brush range", () => {
        const range = transformBrushRange(
          testData,
          targetData,
          1,
          3,
          "month",
          "period",
          "index"
        );
        expect(range).toEqual({ start: 1, end: 3 });
      });

      test("should clamp index-based brush to target size", () => {
        const range = transformBrushRange(
          testData,
          targetData,
          2,
          10,
          "month",
          "period",
          "index"
        );
        expect(range?.start).toBe(2);
        expect(range?.end).toBeLessThanOrEqual(2);
      });

      test("should transform value-based brush range", () => {
        const range = transformBrushRange(
          testData,
          targetData,
          1,
          2,
          "month",
          "period",
          "value"
        );
        expect(range).toEqual({ start: 1, end: 2 });
      });

      test("should return undefined for non-matching value range", () => {
        const range = transformBrushRange(
          testData,
          targetData,
          2,
          3, // Mar-Apr, but Apr not in target
          "month",
          "period",
          "value"
        );
        expect(range).toBeUndefined();
      });
    });
  });

  describe("validation utilities", () => {
    test("isValidSyncId should accept valid syncIds", () => {
      expect(isValidSyncId("chart-1")).toBe(true);
      expect(isValidSyncId("sync-group-123")).toBe(true);
    });

    test("isValidSyncId should reject invalid syncIds", () => {
      expect(isValidSyncId("")).toBe(false);
      expect(isValidSyncId("  ")).toBe(false);
      expect(isValidSyncId(undefined)).toBe(false);
    });

    test("extractSyncConfig should extract valid config", () => {
      const chartConfig = {
        syncId: "chart-sync-1",
        syncMethod: "value" as const,
      };

      const config = extractSyncConfig(chartConfig);
      expect(config).toBeDefined();
      expect(config?.syncId).toBe("chart-sync-1");
      expect(config?.syncMethod).toBe("value");
    });

    test("extractSyncConfig should return undefined for missing syncId", () => {
      const chartConfig = {
        syncMethod: "value" as const,
      };

      const config = extractSyncConfig(chartConfig);
      expect(config).toBeUndefined();
    });
  });

  describe("listener notifications", () => {
    test("should notify listeners on tooltip change", () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      registerSyncListener(syncState, "chart-sync-1", listener);
      handleSyncedTooltip(syncState, "chart-sync-1", { active: true, index: 1 });

      expect(callCount).toBe(1);
    });

    test("should notify listeners on brush change", () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      registerSyncListener(syncState, "chart-sync-1", listener);
      handleSyncedBrush(syncState, "chart-sync-1", {
        dataStartIndex: 1,
        dataEndIndex: 4,
      });

      expect(callCount).toBe(1);
    });

    test("should notify all registered listeners", () => {
      let count1 = 0;
      let count2 = 0;

      const listener1 = () => {
        count1++;
      };
      const listener2 = () => {
        count2++;
      };

      registerSyncListener(syncState, "chart-sync-1", listener1);
      registerSyncListener(syncState, "chart-sync-1", listener2);
      handleSyncedTooltip(syncState, "chart-sync-1", { active: true, index: 1 });

      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });

    test("should not notify unregistered listeners", () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      registerSyncListener(syncState, "chart-sync-1", listener);
      unregisterSyncListener(syncState, "chart-sync-1", listener);
      handleSyncedTooltip(syncState, "chart-sync-1", { active: true, index: 1 });

      expect(callCount).toBe(0);
    });
  });
});
