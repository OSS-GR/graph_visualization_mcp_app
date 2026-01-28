/**
 * React Context for providing synchronized chart state across the application
 * Enables multi-chart coordination using the syncConfig utilities
 */

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import {
  createGlobalSyncState,
  registerSyncListener,
  unregisterSyncListener,
  getActiveSyncedTooltip,
  getActiveSyncedBrush,
  GlobalSyncState,
  SyncedTooltipState,
  SyncedBrushState,
} from '../utils/syncConfig';

/**
 * Context for providing global sync state
 */
const SyncStateContext = createContext<GlobalSyncState | null>(null);

/**
 * Provider component for sync state
 * Wrap your chart components with this provider to enable synchronization
 *
 * @example
 * ```tsx
 * <SyncStateProvider>
 *   <Chart1 />
 *   <Chart2 />
 *   <Chart3 />
 * </SyncStateProvider>
 * ```
 */
export function SyncStateProvider({ children }: { children: ReactNode }) {
  const [syncState] = useState(() => createGlobalSyncState());

  return (
    <SyncStateContext.Provider value={syncState}>
      {children}
    </SyncStateContext.Provider>
  );
}

/**
 * Hook to access the global sync state
 * Must be used within a SyncStateProvider
 *
 * @returns GlobalSyncState instance
 * @throws Error if used outside SyncStateProvider
 *
 * @example
 * ```tsx
 * const syncState = useSyncState();
 * handleSyncedTooltip(syncState, 'chart-sync-1', { active: true, index: 2 });
 * ```
 */
export function useSyncState(): GlobalSyncState {
  const context = useContext(SyncStateContext);
  if (!context) {
    throw new Error('useSyncState must be used within a SyncStateProvider');
  }
  return context;
}

/**
 * Hook to listen for and access synced tooltip state
 * Automatically handles listener registration and cleanup
 *
 * @param syncId - The sync group identifier
 * @returns Active tooltip state or undefined
 *
 * @example
 * ```tsx
 * const tooltip = useSyncedTooltip('chart-sync-1');
 * if (tooltip?.active) {
 *   console.log('Tooltip at index:', tooltip.index);
 * }
 * ```
 */
export function useSyncedTooltip(syncId: string): SyncedTooltipState | undefined {
  const syncState = useSyncState();
  const [tooltip, setTooltip] = useState<SyncedTooltipState | undefined>(
    getActiveSyncedTooltip(syncState, syncId)
  );

  useEffect(() => {
    const listener = (state: GlobalSyncState) => {
      setTooltip(getActiveSyncedTooltip(state, syncId));
    };

    registerSyncListener(syncState, syncId, listener);

    return () => {
      unregisterSyncListener(syncState, syncId, listener);
    };
  }, [syncState, syncId]);

  return tooltip;
}

/**
 * Hook to listen for and access synced brush state
 * Automatically handles listener registration and cleanup
 *
 * @param syncId - The sync group identifier
 * @returns Active brush state or undefined
 *
 * @example
 * ```tsx
 * const brush = useSyncedBrush('chart-sync-1');
 * if (brush) {
 *   console.log(`Brush range: ${brush.dataStartIndex} to ${brush.dataEndIndex}`);
 * }
 * ```
 */
export function useSyncedBrush(syncId: string): SyncedBrushState | undefined {
  const syncState = useSyncState();
  const [brush, setBrush] = useState<SyncedBrushState | undefined>(
    getActiveSyncedBrush(syncState, syncId)
  );

  useEffect(() => {
    const listener = (state: GlobalSyncState) => {
      setBrush(getActiveSyncedBrush(state, syncId));
    };

    registerSyncListener(syncState, syncId, listener);

    return () => {
      unregisterSyncListener(syncState, syncId, listener);
    };
  }, [syncState, syncId]);

  return brush;
}

/**
 * Hook that provides both synced tooltip and brush state
 * Convenient for components that need both
 *
 * @param syncId - The sync group identifier
 * @returns Object with tooltip and brush states
 *
 * @example
 * ```tsx
 * const { tooltip, brush } = useSyncState('chart-sync-1');
 * ```
 */
export function useSyncState2(syncId: string) {
  const tooltip = useSyncedTooltip(syncId);
  const brush = useSyncedBrush(syncId);

  return { tooltip, brush };
}
