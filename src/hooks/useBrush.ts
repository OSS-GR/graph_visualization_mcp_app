import { useState, useCallback, useEffect } from 'react';
import type { BrushConfig } from '../types';
import {
  buildBrushConfig,
  createInitialBrushState,
  filterDataByBrushRange,
  handleBrushKeyboard,
  handleBrushTouch,
  onBrushChange,
  resetBrush,
  validateBrushConfig,
  syncBrushState,
  getSyncedBrushState,
  type BrushState,
  type BrushChangeResult,
  type BuiltBrushConfig,
} from '../utils/brushConfig';

interface UseBrushOptions {
  config?: BrushConfig;
  data: unknown[];
  syncId?: string;
  onBrushChangeCallback?: (result: BrushChangeResult) => void;
}

interface UseBrushReturn {
  brushState: BrushState;
  builtConfig: BuiltBrushConfig | null;
  filteredData: unknown[];
  isValid: boolean;
  validationError: string | null;
  handlers: {
    onBrushChange: (startIndex: number, endIndex: number) => void;
    onReset: () => void;
    onKeyDown: (key: string) => void;
    onTouch: (touchX: number, containerWidth: number, isTouchStart?: boolean) => void;
  };
}

/**
 * React hook for managing brush state and interactions
 * Handles brush range selection, validation, filtering, and synchronization
 *
 * @param options - Configuration options
 * @returns Brush state and handler functions
 */
export function useBrush(options: UseBrushOptions): UseBrushReturn {
  const { config, data, syncId, onBrushChangeCallback } = options;

  // Validate input data
  const isValidData = Array.isArray(data) && data.length > 0;
  const dataLength = isValidData ? data.length : 0;

  // Validation error
  const validationError = validateBrushConfig(config, data);
  const isValid = validationError === null;

  // Initialize brush state
  const [brushState, setBrushState] = useState<BrushState>(() => {
    if (!isValidData) {
      return { isEnabled: false, dataStartIndex: 0, dataEndIndex: 0, isResetting: false };
    }

    // Try to recover synced state if syncId is provided
    if (syncId) {
      const syncedState = getSyncedBrushState(syncId);
      if (syncedState) {
        return syncedState;
      }
    }

    // Create initial state
    const initialState = createInitialBrushState(dataLength, config?.enabled ?? true);

    // Apply initial range from config if provided
    if (config?.dataStartIndex !== undefined || config?.dataEndIndex !== undefined) {
      return {
        ...initialState,
        dataStartIndex: config.dataStartIndex ?? 0,
        dataEndIndex: config.dataEndIndex ?? dataLength,
      };
    }

    return initialState;
  });

  // Build Recharts brush configuration
  const builtConfig: BuiltBrushConfig | null = isValid && config?.enabled
    ? (() => {
        try {
          return buildBrushConfig(config, dataLength);
        } catch (error) {
          console.error('Error building brush config:', error);
          return null;
        }
      })()
    : null;

  // Filter data based on brush range
  const filteredData = isValidData
    ? filterDataByBrushRange(data as Record<string, unknown>[], brushState.dataStartIndex, brushState.dataEndIndex)
    : [];

  // Synchronize state if syncId changes
  useEffect(() => {
    if (syncId) {
      const syncedState = syncBrushState(brushState, syncId);
      setBrushState(syncedState);
    }
  }, [syncId, brushState]);

  // Handle brush range changes
  const handleBrushChange = useCallback(
    (startIndex: number, endIndex: number) => {
      if (!isValidData) return;

      const result = onBrushChange(startIndex, endIndex, dataLength);

      setBrushState((prevState) => ({
        ...prevState,
        dataStartIndex: result.startIndex,
        dataEndIndex: result.endIndex,
        isResetting: false,
      }));

      onBrushChangeCallback?.(result);
    },
    [isValidData, dataLength, onBrushChangeCallback]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    if (!isValidData) return;

    const result = resetBrush(dataLength);

    setBrushState((prevState) => ({
      ...prevState,
      dataStartIndex: result.startIndex,
      dataEndIndex: result.endIndex,
      isResetting: true,
    }));

    onBrushChangeCallback?.(result);

    // Reset isResetting flag after animation
    setTimeout(() => {
      setBrushState((prevState) => ({
        ...prevState,
        isResetting: false,
      }));
    }, 300);
  }, [isValidData, dataLength, onBrushChangeCallback]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (key: string) => {
      if (!isValidData) return;

      const result = handleBrushKeyboard(
        key,
        brushState.dataStartIndex,
        brushState.dataEndIndex,
        dataLength,
        1
      );

      if (result) {
        handleBrushChange(result.startIndex, result.endIndex);
      }
    },
    [isValidData, brushState.dataStartIndex, brushState.dataEndIndex, dataLength, handleBrushChange]
  );

  // Handle touch events
  const handleTouchEvent = useCallback(
    (touchX: number, containerWidth: number, isTouchStart: boolean = true) => {
      if (!isValidData) return;

      const index = handleBrushTouch(touchX, containerWidth, dataLength, isTouchStart);

      // For touch start, update the start index
      // For ongoing drag, update the end index
      if (isTouchStart) {
        handleBrushChange(index, brushState.dataEndIndex);
      } else {
        handleBrushChange(brushState.dataStartIndex, index);
      }
    },
    [isValidData, dataLength, brushState.dataStartIndex, brushState.dataEndIndex, handleBrushChange]
  );

  return {
    brushState,
    builtConfig,
    filteredData,
    isValid,
    validationError,
    handlers: {
      onBrushChange: handleBrushChange,
      onReset: handleReset,
      onKeyDown: handleKeyDown,
      onTouch: handleTouchEvent,
    },
  };
}
