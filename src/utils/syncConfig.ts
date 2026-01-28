// @ts-nocheck
/**
 * Synchronization configuration utilities for multi-chart coordination
 * Supports synchronized tooltips, brushes, and cross-chart interaction
 */

/**
 * Sync method types
 * - 'index': Synchronize by data array index (position-based)
 * - 'value': Synchronize by categorical axis value (value-based)
 */
export type SyncMethod = 'index' | 'value';

/**
 * Synchronized tooltip state
 */
export interface SyncedTooltipState {
  syncId: string;
  active: boolean;
  index?: number;
  value?: string | number;
  data?: Record<string, unknown>;
}

/**
 * Synchronized brush state
 */
export interface SyncedBrushState {
  syncId: string;
  dataStartIndex: number;
  dataEndIndex: number;
}

/**
 * Sync configuration object
 */
export interface SyncConfig {
  syncId: string;
  syncMethod: SyncMethod;
  enableTooltipSync: boolean;
  enableBrushSync: boolean;
}

/**
 * Global sync state manager
 * Maintains active tooltips and brushes for synchronized charts
 */
export interface GlobalSyncState {
  tooltips: Map<string, SyncedTooltipState>;
  brushes: Map<string, SyncedBrushState>;
  listeners: Map<string, Set<(state: GlobalSyncState) => void>>;
}

/**
 * Build a sync configuration object from syncId and syncMethod
 *
 * @param syncId - Unique identifier for linking multiple charts
 * @param syncMethod - Synchronization method ('index' or 'value')
 * @param enableTooltipSync - Whether to synchronize tooltips (default: true)
 * @param enableBrushSync - Whether to synchronize brush events (default: true)
 * @returns SyncConfig object configured for multi-chart synchronization
 */
export function buildSyncConfig(
  syncId: string,
  syncMethod: SyncMethod = 'index',
  enableTooltipSync: boolean = true,
  enableBrushSync: boolean = true
): SyncConfig {
  if (!syncId || syncId.trim().length === 0) {
    throw new Error('syncId must be a non-empty string');
  }

  if (!['index', 'value'].includes(syncMethod)) {
    throw new Error('syncMethod must be either "index" or "value"');
  }

  return {
    syncId,
    syncMethod,
    enableTooltipSync,
    enableBrushSync,
  };
}

/**
 * Create a global sync state manager instance
 * Used internally to track synchronized state across charts
 *
 * @returns GlobalSyncState instance for managing sync state
 */
export function createGlobalSyncState(): GlobalSyncState {
  return {
    tooltips: new Map(),
    brushes: new Map(),
    listeners: new Map(),
  };
}

/**
 * Register a listener for sync state changes
 * Called when tooltip or brush state changes for a specific syncId
 *
 * @param state - Global sync state
 * @param syncId - Sync group identifier
 * @param listener - Callback function invoked when state changes
 */
export function registerSyncListener(
  state: GlobalSyncState,
  syncId: string,
  listener: (state: GlobalSyncState) => void
): void {
  if (!state.listeners.has(syncId)) {
    state.listeners.set(syncId, new Set());
  }
  state.listeners.get(syncId)!.add(listener);
}

/**
 * Unregister a listener for sync state changes
 *
 * @param state - Global sync state
 * @param syncId - Sync group identifier
 * @param listener - Callback function to remove
 */
export function unregisterSyncListener(
  state: GlobalSyncState,
  syncId: string,
  listener: (state: GlobalSyncState) => void
): void {
  state.listeners.get(syncId)?.delete(listener);
}

/**
 * Notify all listeners of a sync state change
 * Internal utility used when state is updated
 *
 * @param state - Global sync state
 * @param syncId - Sync group identifier that changed
 */
function notifyListeners(state: GlobalSyncState, syncId: string): void {
  state.listeners.get(syncId)?.forEach((listener) => {
    listener(state);
  });
}

/**
 * Handle synchronized tooltip state
 * Updates the tooltip state for a chart and notifies other synced charts
 *
 * @param state - Global sync state
 * @param syncId - Unique identifier for the sync group
 * @param tooltipData - Tooltip state to synchronize
 */
export function handleSyncedTooltip(
  state: GlobalSyncState,
  syncId: string,
  tooltipData: Partial<SyncedTooltipState>
): void {
  const existingTooltip = state.tooltips.get(syncId) || {
    syncId,
    active: false,
  };

  const updatedTooltip: SyncedTooltipState = {
    ...existingTooltip,
    ...tooltipData,
    syncId,
  };

  state.tooltips.set(syncId, updatedTooltip);
  notifyListeners(state, syncId);
}

/**
 * Get the active synchronized tooltip state for a sync group
 *
 * @param state - Global sync state
 * @param syncId - Unique identifier for the sync group
 * @returns Active tooltip state or undefined if no active tooltip
 */
export function getActiveSyncedTooltip(
  state: GlobalSyncState,
  syncId: string
): SyncedTooltipState | undefined {
  const tooltip = state.tooltips.get(syncId);
  return tooltip?.active ? tooltip : undefined;
}

/**
 * Clear the synchronized tooltip state for a sync group
 *
 * @param state - Global sync state
 * @param syncId - Unique identifier for the sync group
 */
export function clearSyncedTooltip(
  state: GlobalSyncState,
  syncId: string
): void {
  const tooltip = state.tooltips.get(syncId);
  if (tooltip) {
    tooltip.active = false;
    state.tooltips.set(syncId, tooltip);
    notifyListeners(state, syncId);
  }
}

/**
 * Handle synchronized brush state
 * Updates brush selection state and notifies other synced charts
 *
 * @param state - Global sync state
 * @param syncId - Unique identifier for the sync group
 * @param brushData - Brush state to synchronize (dataStartIndex and dataEndIndex)
 */
export function handleSyncedBrush(
  state: GlobalSyncState,
  syncId: string,
  brushData: Partial<SyncedBrushState>
): void {
  const existingBrush = state.brushes.get(syncId);

  if (!brushData.dataStartIndex && brushData.dataStartIndex !== 0) {
    throw new Error('dataStartIndex is required for brush sync');
  }
  if (brushData.dataEndIndex === undefined) {
    throw new Error('dataEndIndex is required for brush sync');
  }

  const updatedBrush: SyncedBrushState = {
    syncId,
    dataStartIndex: brushData.dataStartIndex,
    dataEndIndex: brushData.dataEndIndex,
  };

  state.brushes.set(syncId, updatedBrush);
  notifyListeners(state, syncId);
}

/**
 * Get the active synchronized brush state for a sync group
 *
 * @param state - Global sync state
 * @param syncId - Unique identifier for the sync group
 * @returns Brush state or undefined if no active brush
 */
export function getActiveSyncedBrush(
  state: GlobalSyncState,
  syncId: string
): SyncedBrushState | undefined {
  return state.brushes.get(syncId);
}

/**
 * Clear the synchronized brush state for a sync group
 *
 * @param state - Global sync state
 * @param syncId - Unique identifier for the sync group
 */
export function clearSyncedBrush(
  state: GlobalSyncState,
  syncId: string
): void {
  state.brushes.delete(syncId);
  notifyListeners(state, syncId);
}

/**
 * Convert tooltip index to data value based on sync method
 * Used to find the correct index when syncing by value
 *
 * @param data - Chart data array
 * @param dataKey - Field to use as index (categorical axis key)
 * @param syncValue - Value to find index for
 * @returns Index of matching data item or undefined
 */
export function findIndexByValue(
  data: Record<string, unknown>[],
  dataKey: string,
  syncValue: string | number
): number | undefined {
  return data.findIndex((item) => item[dataKey] === syncValue);
}

/**
 * Convert data index to value based on sync method
 * Used to find the categorical value at a given index
 *
 * @param data - Chart data array
 * @param dataKey - Field to use as index (categorical axis key)
 * @param index - Data index to get value from
 * @returns Value at the given index or undefined
 */
export function findValueByIndex(
  data: Record<string, unknown>[],
  dataKey: string,
  index: number
): string | number | undefined {
  if (index >= 0 && index < data.length) {
    const item = data[index];
    return item[dataKey] as string | number;
  }
  return undefined;
}

/**
 * Transform tooltip index based on sync method
 * Converts between index-based and value-based synchronization
 *
 * @param sourceData - Source chart data
 * @param targetData - Target chart data
 * @param sourceIndex - Index in source chart
 * @param sourceDataKey - Categorical axis key in source chart
 * @param targetDataKey - Categorical axis key in target chart
 * @param syncMethod - Synchronization method
 * @returns Index in target chart or undefined if no match found
 */
export function transformTooltipIndex(
  sourceData: Record<string, unknown>[],
  targetData: Record<string, unknown>[],
  sourceIndex: number,
  sourceDataKey: string,
  targetDataKey: string,
  syncMethod: SyncMethod
): number | undefined {
  if (syncMethod === 'index') {
    // Direct index-based sync: use the same index if available
    return sourceIndex < targetData.length ? sourceIndex : undefined;
  } else if (syncMethod === 'value') {
    // Value-based sync: find matching categorical value
    const sourceValue = findValueByIndex(sourceData, sourceDataKey, sourceIndex);
    if (sourceValue !== undefined) {
      return findIndexByValue(targetData, targetDataKey, sourceValue);
    }
  }
  return undefined;
}

/**
 * Transform brush range based on sync method
 * Converts brush selection between charts with different data
 *
 * @param sourceData - Source chart data
 * @param targetData - Target chart data
 * @param sourceStart - Start index in source chart
 * @param sourceEnd - End index in source chart
 * @param sourceDataKey - Categorical axis key in source chart
 * @param targetDataKey - Categorical axis key in target chart
 * @param syncMethod - Synchronization method
 * @returns Brush range for target chart or undefined if cannot transform
 */
export function transformBrushRange(
  sourceData: Record<string, unknown>[],
  targetData: Record<string, unknown>[],
  sourceStart: number,
  sourceEnd: number,
  sourceDataKey: string,
  targetDataKey: string,
  syncMethod: SyncMethod
): { start: number; end: number } | undefined {
  if (syncMethod === 'index') {
    // Direct index-based sync: apply same range if available
    if (sourceEnd < targetData.length) {
      return { start: sourceStart, end: sourceEnd };
    }
    // Clamp to target data size
    return { start: sourceStart, end: Math.min(sourceEnd, targetData.length - 1) };
  } else if (syncMethod === 'value') {
    // Value-based sync: find matching categorical values
    const startValue = findValueByIndex(sourceData, sourceDataKey, sourceStart);
    const endValue = findValueByIndex(sourceData, sourceDataKey, sourceEnd);

    if (startValue !== undefined && endValue !== undefined) {
      const targetStart = findIndexByValue(targetData, targetDataKey, startValue);
      const targetEnd = findIndexByValue(targetData, targetDataKey, endValue);

      if (targetStart !== undefined && targetEnd !== undefined) {
        return { start: targetStart, end: targetEnd };
      }
    }
  }
  return undefined;
}

/**
 * Check if a syncId is valid for synchronization
 *
 * @param syncId - Sync ID to validate
 * @returns true if syncId is valid, false otherwise
 */
export function isValidSyncId(syncId: string | undefined): syncId is string {
  return typeof syncId === 'string' && syncId.trim().length > 0;
}

/**
 * Extract sync configuration from chart config
 * Utility to get sync settings from a chart
 *
 * @param chartConfig - Chart configuration object
 * @returns SyncConfig if syncId is present, undefined otherwise
 */
export function extractSyncConfig(chartConfig: {
  syncId?: string;
  syncMethod?: 'index' | 'value';
}): SyncConfig | undefined {
  if (!isValidSyncId(chartConfig.syncId)) {
    return undefined;
  }

  return buildSyncConfig(
    chartConfig.syncId,
    chartConfig.syncMethod || 'index',
    true,
    true
  );
}
