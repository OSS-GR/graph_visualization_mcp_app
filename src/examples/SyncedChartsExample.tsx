/**
 * Example: Multi-Chart Synchronization with syncId
 *
 * This example demonstrates how to create synchronized charts that share
 * tooltip and brush interactions using the sync utilities.
 */

import React, { useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import {
  useSyncState,
  useSyncedTooltip,
  useSyncedBrush,
  SyncStateProvider,
} from '../context/SyncStateContext';
import {
  handleSyncedTooltip,
  handleSyncedBrush,
  findIndexByValue,
  transformTooltipIndex,
  transformBrushRange,
} from '../utils/syncConfig';

// Sample data
const salesData = [
  { month: 'Jan', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Apr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
];

const profitData = [
  { period: 'Jan', profit: 2400, margin: 0.5 },
  { period: 'Feb', profit: 2210, margin: 0.45 },
  { period: 'Mar', profit: 2290, margin: 0.55 },
  { period: 'Apr', profit: 2000, margin: 0.48 },
  { period: 'May', profit: 2181, margin: 0.52 },
  { period: 'Jun', profit: 2500, margin: 0.58 },
];

/**
 * Example component: Chart using index-based sync
 * Tooltips sync by array position
 */
function IndexBasedSyncExample() {
  const syncState = useSyncState();
  const syncId = 'sales-sync-index';

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
      <div style={{ flex: 1 }}>
        <h3>Chart 1: Sales (Index-based Sync)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={salesData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              dataKey="sales"
              stroke="#8884d8"
              onMouseMove={(state) => {
                if (state.isTooltipActive && typeof state.activeTooltipIndex === 'number') {
                  handleSyncedTooltip(syncState, syncId, {
                    active: true,
                    index: state.activeTooltipIndex,
                  });
                }
              }}
              onMouseLeave={() => {
                handleSyncedTooltip(syncState, syncId, { active: false });
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Chart 2: Profit (Index-based Sync)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={profitData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="profit" stroke="#82ca9d" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Example component: Chart using value-based sync
 * Tooltips sync by matching categorical values
 */
function ValueBasedSyncExample() {
  const syncState = useSyncState();
  const syncId = 'sales-sync-value';
  const tooltip = useSyncedTooltip(syncId);

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
      <div style={{ flex: 1 }}>
        <h3>Chart 1: Sales (Value-based Sync)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={salesData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              dataKey="sales"
              stroke="#8884d8"
              onMouseMove={(state) => {
                if (state.isTooltipActive && typeof state.activeTooltipIndex === 'number') {
                  const monthValue = salesData[state.activeTooltipIndex]?.month;
                  handleSyncedTooltip(syncState, syncId, {
                    active: true,
                    index: state.activeTooltipIndex,
                    value: monthValue,
                  });
                }
              }}
              onMouseLeave={() => {
                handleSyncedTooltip(syncState, syncId, { active: false });
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Chart 2: Profit (Value-based Sync)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart
            data={profitData}
            syncId={syncId}
            margin={{
              top: tooltip?.active ? 5 : 5,
              right: 30,
              bottom: 5,
              left: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="profit" stroke="#82ca9d" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Example component: Charts with synchronized brush selection
 * Brush ranges sync by array position
 */
function BrushSyncExample() {
  const syncState = useSyncState();
  const syncId = 'sales-sync-brush';
  const brush = useSyncedBrush(syncId);

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
      <div style={{ flex: 1 }}>
        <h3>Chart 1: Sales with Brush</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RechartsLineChart data={salesData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="sales" stroke="#8884d8" />
            <Brush
              dataStartIndex={brush?.dataStartIndex ?? 0}
              dataEndIndex={brush?.dataEndIndex ?? salesData.length - 1}
              height={40}
              onChange={(range) => {
                handleSyncedBrush(syncState, syncId, {
                  dataStartIndex: range.startIndex ?? 0,
                  dataEndIndex: range.endIndex ?? salesData.length - 1,
                });
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Chart 2: Profit (Brush follows Chart 1)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RechartsLineChart data={profitData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="profit" stroke="#82ca9d" />
            <Brush
              dataStartIndex={brush?.dataStartIndex ?? 0}
              dataEndIndex={brush?.dataEndIndex ?? profitData.length - 1}
              height={40}
              onChange={(range) => {
                handleSyncedBrush(syncState, syncId, {
                  dataStartIndex: range.startIndex ?? 0,
                  dataEndIndex: range.endIndex ?? profitData.length - 1,
                });
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Example component: Multiple charts with tooltip transformation
 * Demonstrates transforming tooltip position between different data structures
 */
function TooltipTransformationExample() {
  const syncState = useSyncState();
  const syncId = 'sales-sync-transform';
  const tooltip = useSyncedTooltip(syncId);

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
      <div style={{ flex: 1 }}>
        <h3>Chart 1: Sales (Source)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={salesData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              dataKey="sales"
              stroke="#8884d8"
              onMouseMove={(state) => {
                if (state.isTooltipActive && typeof state.activeTooltipIndex === 'number') {
                  const monthValue = salesData[state.activeTooltipIndex]?.month;
                  handleSyncedTooltip(syncState, syncId, {
                    active: true,
                    index: state.activeTooltipIndex,
                    value: monthValue,
                  });
                }
              }}
              onMouseLeave={() => {
                handleSyncedTooltip(syncState, syncId, { active: false });
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Chart 2: Profit (Transformed Target)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={profitData} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              dataKey="profit"
              stroke="#82ca9d"
              highlightedDataIndex={
                tooltip?.active
                  ? transformTooltipIndex(
                      salesData,
                      profitData,
                      tooltip.index ?? 0,
                      'month',
                      'period',
                      'value'
                    )
                  : undefined
              }
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Main example component
 * Shows all synchronization patterns
 */
export function SyncedChartsExample() {
  return (
    <SyncStateProvider>
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1>Multi-Chart Synchronization Examples</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          The following examples demonstrate different synchronization patterns for coordinating
          interactions across multiple charts using the syncConfig utilities.
        </p>

        <section style={{ marginBottom: '40px' }}>
          <h2>Example 1: Index-Based Synchronization</h2>
          <p>
            Tooltips sync by array position. Both charts have the same structure, so the tooltip
            at index 2 in Chart 1 corresponds to index 2 in Chart 2.
          </p>
          <IndexBasedSyncExample />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Example 2: Value-Based Synchronization</h2>
          <p>
            Tooltips sync by matching categorical values. Chart 1 uses "month" field and Chart 2
            uses "period" field, but they represent the same time periods.
          </p>
          <ValueBasedSyncExample />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Example 3: Brush Synchronization</h2>
          <p>
            Both charts share the same brush selection range. Adjusting the brush in either chart
            updates the range in both charts.
          </p>
          <BrushSyncExample />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Example 4: Tooltip Index Transformation</h2>
          <p>
            Demonstrates transforming a tooltip position from one chart to another when the charts
            have different data structures but share categorical values.
          </p>
          <TooltipTransformationExample />
        </section>

        <section>
          <h2>Key Features</h2>
          <ul>
            <li>
              <strong>Index-based sync</strong>: Charts sync by data array position
            </li>
            <li>
              <strong>Value-based sync</strong>: Charts sync by matching categorical axis values
            </li>
            <li>
              <strong>Tooltip synchronization</strong>: Tooltips appear at the same logical position
              across all synced charts
            </li>
            <li>
              <strong>Brush synchronization</strong>: Brush selections are coordinated across charts
            </li>
            <li>
              <strong>Data transformation</strong>: Utilities to convert between different data
              structures while maintaining synchronization
            </li>
          </ul>
        </section>
      </div>
    </SyncStateProvider>
  );
}
