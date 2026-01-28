# Accessibility Guide for Data Visualization App

This document provides guidance on using and maintaining the accessibility features of the Data Visualization application.

## Overview

This application has been designed with accessibility as a core principle, following WCAG 2.1 Level AAA standards. The implementation includes comprehensive support for keyboard navigation, screen readers, high contrast modes, and responsive design.

## Keyboard Navigation

### Primary Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next interactive element |
| `Shift + Tab` | Move focus to the previous interactive element |
| `Enter` | Activate a focused button or link |
| `Space` | Toggle button state (pressed/unpressed) |
| `Escape` | Close tooltips or menus |
| `Arrow Keys` | Navigate between data points within charts |

### Chart Interaction

- **Tab to focus chart**: Press `Tab` to navigate to the chart element
- **Arrow keys for navigation**: Use Arrow keys to move focus between data points
- **Enter for activation**: Press `Enter` to view details of a data point
- **Escape to close**: Press `Escape` to close any open tooltips or menus

### Button Actions

- **"Show Data Table"**: Displays tabular representation of chart data for non-visual access
- **"Focus Chart"**: Places keyboard focus on the chart element for navigation

## Screen Reader Support

### Features

1. **Semantic HTML Structure**: All content uses proper heading hierarchy and semantic elements
2. **ARIA Labels**: Chart elements are labeled with descriptive ARIA attributes
3. **Live Regions**: Status messages are announced in real-time
4. **Alt Text**: Charts include textual descriptions of data
5. **Data Table**: Accessible table view of all chart data

### Screen Reader Announcements

#### Chart Load
```
"Chart loaded: [Title]. [Chart Type] type."
```

#### Error Messages
```
"Error loading chart: [Error Details]"
```

#### Data Description
```
"Chart data: [X-axis]: [values]; [Series names with values]..."
```

### Using the Data Table

For best screen reader compatibility, use the "Show Data Table" button to view chart data in a tabular format. The table includes:
- Column headers (X-axis label and series names)
- Rows of data values
- Count of displayed vs. total rows
- Proper semantic markup for tables

## Color Contrast and Visual Accessibility

### Color Contrast Standards

The application meets WCAG AAA standards:
- **Body Text**: Minimum 7:1 contrast ratio
- **Large Text**: Minimum 7:1 contrast ratio (all text is large by modern standards)
- **UI Components**: Minimum 3:1 contrast ratio

### Theme Support

#### Light Theme
- Background: `#ffffff` (white)
- Text: `#111827` (dark gray)
- Ensures maximum contrast for readability

#### Dark Theme
- Background: `#1f2937` (dark gray)
- Text: `#f3f4f6` (light gray)
- Reduces eye strain in low-light environments

### High Contrast Mode

When "Prefer more contrast" is enabled in system settings:
- Text becomes pure black/white
- Borders become more pronounced
- Focus indicators are more visible

#### Enabling High Contrast (by OS)

**Windows 10/11**:
1. Settings > Ease of Access > Display
2. Enable "High contrast" toggle

**macOS**:
1. System Preferences > Accessibility > Display
2. Enable "Increase contrast"

**Linux**:
1. Accessibility settings vary by distribution
2. Generally under Display or Appearance settings

## Motion and Animation

### Reduced Motion

The application respects the `prefers-reduced-motion` media query. When reduced motion is enabled:
- All animations are minimized or disabled
- Transitions occur instantly or with minimal duration
- Smooth scrolling is disabled in favor of instant navigation

#### Enabling Reduced Motion (by OS)

**Windows 10/11**:
1. Settings > Ease of Access > Display
2. Enable "Show animations"

**macOS**:
1. System Preferences > Accessibility > Display
2. Enable "Reduce motion"

**Linux**:
1. Accessibility settings > Motion and Animation
2. Select "Reduce motion" option

## Responsive Design

### Mobile Accessibility

The application is fully responsive and works on all screen sizes:
- **Minimum width**: Supports devices as small as 320px (mobile phones)
- **Touch targets**: All interactive elements are at least 44x44px
- **Text sizing**: Responsive font sizes for readability on all devices

### Breakpoints

| Device | Width Range | Font Size | Notes |
|--------|------------|-----------|-------|
| Mobile | < 480px | 13px | Portrait orientation |
| Tablet | 480px - 768px | 14px | Landscape/Portrait |
| Desktop | > 768px | 16px | Standard desktop |

### Text Sizing

Users can increase text size using browser controls:
- **Chrome/Firefox/Safari**: `Ctrl/Cmd + +` to increase
- **Reset**: `Ctrl/Cmd + 0` to reset
- The application scales properly at up to 200% zoom

## Focus Management

### Visual Focus Indicators

All interactive elements display a clear focus indicator:
```css
outline: 2px solid var(--color-focus);
outline-offset: 2px;
```

### Focus Order

The application maintains a logical focus order:
1. Skip to main content link (invisible until focused)
2. Chart container
3. Data table toggle button
4. Focus chart button
5. Data table (if visible)

### Skip Links

A "Skip to main content" link is available:
- Appears at top-left when focused
- Allows quick navigation past header content
- Keyboard accessible: `Tab` at page load

## Accessibility Testing Checklist

### Manual Testing

- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Focus indicators are clearly visible
- [ ] Colors provide adequate contrast
- [ ] Touch targets are at least 44x44 pixels
- [ ] Text scales properly at 200% zoom
- [ ] Application works with reduced motion enabled
- [ ] Data table provides alternative data access
- [ ] Error messages are announced immediately
- [ ] Charts are responsive on mobile devices

### Automated Testing Tools

Use these tools to verify accessibility:

1. **Browser Extensions**:
   - axe DevTools (Chrome, Firefox)
   - WAVE (Chrome, Firefox)
   - Lighthouse (Built into Chrome DevTools)

2. **Command Line**:
   ```bash
   # Using axe-core
   npm install --save-dev @axe-core/cli
   axe [URL]
   ```

3. **Online Tools**:
   - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
   - WCAG 2.1 Validator: https://www.w3.org/WAI/test-evaluate/

## Developer Guidelines

### Adding Accessible Components

When creating new chart components:

1. **Add ARIA Labels**:
```tsx
<div role="img" aria-label="Chart title - Chart type with data summary" />
```

2. **Include Descriptions**:
```tsx
<div id="chart-description" style={{ position: "absolute", left: "-10000px" }}>
  Chart data description for screen readers
</div>
```

3. **Support Keyboard Navigation**:
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "ArrowRight") {
    // Navigate to next data point
  } else if (e.key === "ArrowLeft") {
    // Navigate to previous data point
  }
};
```

4. **Announce Changes**:
```tsx
const announcement = createAnnouncement("Data updated", "polite");
document.body.appendChild(announcement);
```

5. **Use Semantic HTML**:
```tsx
<h1>Chart Title</h1>  // Use proper heading levels
<button>Action</button> // Use button elements for actions
<table>...</table>     // Use table elements for tabular data
```

### Color Selection

When choosing colors:

1. Use the contrast ratio checker:
```tsx
import { getContrastRatio } from "./utils/a11y";

const ratio = getContrastRatio("#ffffff", "#000000");
console.log(ratio); // { ratio: 21, level: "AAA" }
```

2. Test with color blindness simulators (Coblis, Color Oracle)

3. Avoid relying solely on color to convey information

### Testing Utilities

Use the provided accessibility utilities:

```tsx
import {
  getContrastRatio,
  prefersHighContrast,
  prefersReducedMotion,
  getPrefersColorScheme,
  createAnnouncement,
  createChartDataDescription,
  getKeyboardShortcuts,
} from "./utils/a11y";

// Check user preferences
const reducedMotion = prefersReducedMotion();
const highContrast = prefersHighContrast();
const isDarkTheme = getPrefersColorScheme() === "dark";

// Generate accessible content
const description = createChartDataDescription(data, series, xAxis);
const announcement = createAnnouncement("Chart loaded");
```

## WCAG 2.1 Compliance

### Principle 1: Perceivable
- [x] Non-text Content: Images have alternative text descriptions
- [x] Adaptable: Content is presented without loss at different zoom levels
- [x] Distinguishable: Text has sufficient contrast (AAA standard)

### Principle 2: Operable
- [x] Keyboard Accessible: All functionality available via keyboard
- [x] Enough Time: No content has time limits
- [x] Seizures: No content flashes more than 3 times per second
- [x] Navigable: Focus order is logical and predictable

### Principle 3: Understandable
- [x] Readable: Text language is identified
- [x] Predictable: Navigation is consistent
- [x] Input Assistance: Errors are identified and corrected

### Principle 4: Robust
- [x] Compatible: Content works with assistive technologies
- [x] Markup: HTML is valid and properly structured

## Accessibility Improvements Roadmap

### Current (v1.0)
- [x] WCAG AAA color contrast
- [x] Keyboard navigation
- [x] Screen reader support
- [x] High contrast mode
- [x] Reduced motion support
- [x] Responsive design
- [x] Accessibility data table

### Future (v1.1)
- [ ] Touch gesture labels
- [ ] Customizable font sizes
- [ ] Additional chart types with a11y support
- [ ] Audio descriptions for complex data
- [ ] Braille support for legend

### Future (v1.2+)
- [ ] Multi-language support
- [ ] RTL layout support
- [ ] Text-to-speech integration
- [ ] Alternative input methods (voice, eye-tracking)

## Resources and References

### WCAG 2.1 Guidelines
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### ARIA Specifications
- [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/)

### Testing Tools
- [WebAIM Resources](https://webaim.org/resources/)
- [The A11Y Project](https://www.a11yproject.com/)
- [Accessibility Insights](https://accessibilityinsights.io/)

### Developer Resources
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Recharts Accessibility](https://recharts.org/en-US/guide/accessibility)

## Support and Feedback

If you encounter accessibility issues:

1. Describe the issue in detail
2. Specify your assistive technology (screen reader, etc.)
3. Provide steps to reproduce
4. Include system and browser information
5. Submit as a GitHub issue or accessibility report

## Acknowledgments

This accessibility implementation follows best practices from:
- W3C Web Accessibility Initiative (WAI)
- The A11Y Project
- Recharts accessibility guidelines
- WebAIM recommendations
