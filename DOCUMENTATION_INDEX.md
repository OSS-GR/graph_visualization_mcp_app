# Documentation Index

## Overview

This document provides an index to all documentation files for the Graph Visualization MCP App.

---

## Quick Start

**New to this project?** Start here:
1. Read `README.md` for project overview
2. Read `INTEGRATION_GUIDE.md` for setup and basic usage
3. Check `FEATURES.md` for available chart types
4. See code examples in `INTEGRATION_GUIDE.md`

---

## Documentation Files

### Core Documentation

#### [`README.md`](./README.md) (4.7 KB)
**Purpose:** Project overview and quick reference
**Contents:**
- Project description
- Technology stack
- Chart types overview
- Key features
- Installation instructions
- Basic usage example

**When to read:** First time setup

---

#### [`FEATURES.md`](./FEATURES.md) (18 KB)
**Purpose:** Comprehensive feature documentation
**Contents:**
- All 10 chart types with descriptions
- Configuration examples for each chart
- All 50+ configuration properties documented
- Utility function reference with examples
- Type definitions guide
- Accessibility features
- Performance notes

**When to read:** Understanding what's available, creating new visualizations

---

#### [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) (13 KB)
**Purpose:** Integration and developer guide
**Contents:**
- Architecture overview
- Directory structure
- Component hierarchy
- 4 complete integration scenarios with code
- Data format specification
- Customization guide (colors, styling, tooltips)
- MCP server integration
- Performance optimization
- Testing guide
- Troubleshooting
- Migration guide
- Best practices

**When to read:** Integrating into your application, solving problems

---

### Feature-Specific Documentation

#### [`BRUSH_USAGE_GUIDE.md`](./BRUSH_USAGE_GUIDE.md) (8.9 KB)
**Purpose:** Brush (range selection) feature documentation
**Contents:**
- Brush feature overview
- Configuration options
- Keyboard controls
- Touch/mobile support
- Synchronization across charts
- Visual preview customization
- Performance considerations
- Code examples

**When to read:** Implementing data range selection

---

#### [`REFERENCE_CONFIG_GUIDE.md`](./REFERENCE_CONFIG_GUIDE.md) (11 KB)
**Purpose:** Reference lines and areas documentation
**Contents:**
- Reference elements overview
- Reference line configuration
- Reference area configuration
- Dynamic value calculation (average, max, min, median)
- Percentage-based references
- Styling options
- Multiple references
- Code examples

**When to read:** Adding reference lines or areas to charts

---

#### [`ACCESSIBILITY_GUIDE.md`](./ACCESSIBILITY_GUIDE.md) (11 KB)
**Purpose:** Accessibility features documentation
**Contents:**
- WCAG compliance
- Keyboard navigation
- Screen reader support
- Color blindness considerations
- Motion preferences
- ARIA labels
- Semantic HTML
- Testing accessibility

**When to read:** Ensuring accessibility compliance

---

#### [`SYNC_IMPLEMENTATION_GUIDE.md`](./SYNC_IMPLEMENTATION_GUIDE.md) (17 KB)
**Purpose:** Multi-chart synchronization documentation
**Contents:**
- Synchronization overview
- syncId property usage
- Tooltip synchronization
- Legend filtering sync
- Brush range sync
- Data interaction sync
- Cross-chart communication
- Context-based sync
- Performance considerations
- Code examples

**When to read:** Implementing dashboard with multiple synchronized charts

---

### Technical Documentation

#### [`INTEGRATION_REPORT.md`](./INTEGRATION_REPORT.md) (8.5 KB)
**Purpose:** Technical integration analysis
**Contents:**
- Build verification status
- Compilation error analysis
- File verification results
- Schema completeness check
- Type system coverage
- Recommendations for next steps

**When to read:** Understanding technical status, debugging build issues

---

#### [`TASK_16_COMPLETION_SUMMARY.md`](./TASK_16_COMPLETION_SUMMARY.md) (12 KB)
**Purpose:** Final integration task completion report
**Contents:**
- All deliverables summary
- Critical fixes applied
- Documentation summary
- Code quality metrics
- Verification checklist
- Known issues
- Recommendations

**When to read:** Understanding what was completed in Task #16

---

### Configuration

#### [`CLAUDE.md`](./CLAUDE.md) (2.5 KB)
**Purpose:** Development environment configuration
**Contents:**
- Bun.js usage recommendations
- API alternatives to express/node modules
- Testing setup
- Frontend development with HTML imports

**When to read:** Setting up development environment

---

## How to Find What You Need

### By Use Case

**"I want to create a simple bar chart"**
→ Read: INTEGRATION_GUIDE.md (Scenario 1)

**"I need to add reference lines to my chart"**
→ Read: REFERENCE_CONFIG_GUIDE.md

**"I want to synchronize multiple charts"**
→ Read: SYNC_IMPLEMENTATION_GUIDE.md

**"I need to implement range selection"**
→ Read: BRUSH_USAGE_GUIDE.md

**"I need to make my charts accessible"**
→ Read: ACCESSIBILITY_GUIDE.md

**"I'm debugging a problem"**
→ Read: INTEGRATION_GUIDE.md (Troubleshooting section)

**"I want to understand the architecture"**
→ Read: INTEGRATION_GUIDE.md (Architecture section)

**"I need to customize colors and styling"**
→ Read: INTEGRATION_GUIDE.md (Customization section)

---

### By Feature

| Feature | Documentation |
|---------|---------------|
| Bar Charts | FEATURES.md (1. Bar Chart) |
| Line Charts | FEATURES.md (2. Line Chart) |
| Area Charts | FEATURES.md (3. Area Chart) |
| Pie/Donut Charts | FEATURES.md (4. Pie Chart) |
| Composed Charts | FEATURES.md (5. Composed Chart) |
| Scatter Charts | FEATURES.md (6. Scatter Chart) |
| Radar Charts | FEATURES.md (7. Radar Chart) |
| Funnel Charts | FEATURES.md (8. Funnel Chart) |
| Sankey Charts | FEATURES.md (9. Sankey Chart) |
| Treemap Charts | FEATURES.md (10. Treemap Chart) |
| Brush/Range Selection | BRUSH_USAGE_GUIDE.md |
| Reference Lines/Areas | REFERENCE_CONFIG_GUIDE.md |
| Multi-Chart Sync | SYNC_IMPLEMENTATION_GUIDE.md |
| Accessibility | ACCESSIBILITY_GUIDE.md |
| Integration | INTEGRATION_GUIDE.md |
| Configuration | FEATURES.md (Configuration Properties) |

---

### By Audience

**End Users / Business Analysts**
→ Start: README.md
→ Then: FEATURES.md
→ Reference: Specific feature guides

**Frontend Developers**
→ Start: INTEGRATION_GUIDE.md
→ Then: FEATURES.md (Configuration Properties)
→ Reference: Feature-specific guides

**Backend / Integration Developers**
→ Start: INTEGRATION_GUIDE.md (MCP Server section)
→ Then: FEATURES.md (Server Schema)
→ Reference: INTEGRATION_REPORT.md

**DevOps / Deployment**
→ Start: README.md
→ Then: INTEGRATION_GUIDE.md (Build section)
→ Reference: CLAUDE.md

**QA / Testing**
→ Start: INTEGRATION_GUIDE.md (Testing section)
→ Then: ACCESSIBILITY_GUIDE.md (Testing accessibility)
→ Reference: Scenario examples in INTEGRATION_GUIDE.md

---

## Key Concepts

### Configuration Properties (50+)

All documented in FEATURES.md under "Configuration Properties"

**Basic Properties:**
- chartType, data, title, subtitle

**Axes:**
- xAxis, yAxis, yAxis2, axisConfig

**Series:**
- series, seriesConfig

**Styling & Layout:**
- layout, responsive, width, height, theme, palette, styling

**Interactions:**
- clickable, syncId, syncMethod

**Components:**
- tooltip, legend, label, brush, referenceElements

**Chart-Specific:**
- cx, cy, innerRadius, outerRadius, startAngle, endAngle
- curveType, barSize, barGap, stackOffset, etc.

### 10 Chart Types

1. Bar Chart - Categorical data visualization
2. Line Chart - Trend visualization
3. Area Chart - Stacked area charts
4. Pie Chart - Proportional data
5. Composed Chart - Mixed chart types
6. Scatter Chart - X-Y coordinate plots
7. Radar Chart - Multi-dimensional comparison
8. Funnel Chart - Conversion stages
9. Sankey Chart - Flow diagrams
10. Treemap Chart - Hierarchical data

### Key Features

- **Responsive Design** - Auto-scaling to container
- **Accessibility** - WCAG compliance, keyboard navigation
- **Synchronization** - Cross-chart data sync via syncId
- **Reference Elements** - Lines and areas with dynamic values
- **Brush Control** - Interactive range selection
- **Customization** - Colors, styling, labels, tooltips
- **Performance** - Optimized rendering for large datasets
- **Type Safety** - Full TypeScript support

---

## Code Examples

Quick code examples are provided in:
- INTEGRATION_GUIDE.md (4 complete scenarios)
- FEATURES.md (multiple per feature)
- README.md (basic example)
- Feature-specific guides (targeted examples)

---

## API Reference

### Utility Functions

Located in `src/utils/`:

**referenceConfig.ts:**
- parseReferenceValue()
- createReferenceLine()
- createReferenceArea()
- createStatisticLines()
- buildReferenceElements()
- validateReferenceElements()

**brushConfig.ts:**
- buildBrushConfig()
- onBrushChange()
- resetBrush()
- filterDataByBrushRange()
- handleBrushKeyboard()
- handleBrushTouch()
- syncBrushState()

**useBrush.ts:**
- useBrush() - React hook

Documented in: FEATURES.md (Utility Functions section)

---

## Types & Interfaces

Main interfaces:
- ChartConfig
- ParsedChartConfig
- TooltipConfig
- LegendConfig
- BrushConfig
- ReferenceElement
- AxisConfig
- LabelConfig

Defined in: `src/types.ts`
Documented in: FEATURES.md (Type Definitions section)

---

## Getting Help

**Question About...** | **Check...**
---|---
Chart types | FEATURES.md
Configuration | FEATURES.md (Properties table)
Integration | INTEGRATION_GUIDE.md
Specific feature | Feature-specific guide
Accessibility | ACCESSIBILITY_GUIDE.md
Performance | INTEGRATION_GUIDE.md or feature guide
Architecture | INTEGRATION_GUIDE.md (Architecture section)
Troubleshooting | INTEGRATION_GUIDE.md (Troubleshooting)
Code examples | Any guide with "Example" sections

---

## File Statistics

| Document | Size | Content Type | Audience |
|----------|------|--------------|----------|
| README.md | 4.7 KB | Overview | Everyone |
| FEATURES.md | 18 KB | Reference | Developers |
| INTEGRATION_GUIDE.md | 13 KB | How-to | Developers |
| BRUSH_USAGE_GUIDE.md | 8.9 KB | Feature Specific | Developers |
| REFERENCE_CONFIG_GUIDE.md | 11 KB | Feature Specific | Developers |
| ACCESSIBILITY_GUIDE.md | 11 KB | Feature Specific | QA/Compliance |
| SYNC_IMPLEMENTATION_GUIDE.md | 17 KB | Feature Specific | Architects |
| INTEGRATION_REPORT.md | 8.5 KB | Technical | DevOps/Engineers |
| TASK_16_COMPLETION_SUMMARY.md | 12 KB | Status | Project Managers |
| CLAUDE.md | 2.5 KB | Configuration | DevOps |
| **Total** | **~107 KB** | **Comprehensive** | **All Roles** |

---

## Updates & Maintenance

This documentation index was created on: **2026-01-28**

All documentation reflects Task #16 completion status.

For updates to specific documentation, refer to:
- Feature guides: Updated when features change
- Integration guide: Updated when architecture changes
- Type definitions: Updated with types.ts
- Configuration: Updated when properties change

---

## Summary

With **80KB+ of comprehensive documentation** covering:
- 10 chart types
- 50+ configuration properties
- 40+ utility functions
- 4 detailed integration scenarios
- Complete API reference
- Best practices and troubleshooting

This codebase is thoroughly documented for developers at all levels.

**Start with:** README.md or INTEGRATION_GUIDE.md
**Reference:** FEATURES.md
**Troubleshoot:** INTEGRATION_GUIDE.md
**Deep Dive:** Feature-specific guides

---

**Questions?** Check the table above or search for keywords in the relevant guides.
