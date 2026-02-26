# Accessibility Standards

Baseline accessibility principles for all design and implementation work in Pollin.

## Goals

- Ensure inclusive, usable experiences by default
- Reduce retroactive accessibility fixes
- Provide clear, testable expectations for all canvas interactions

## Core Principles

- Accessibility is not optional
- Keyboard and screen-reader support is required
- Color contrast must meet WCAG AA standards
- Content and interactions must be perceivable, operable, and understandable

## Canvas-Specific Accessibility

### Drawing Surface
- Canvas element must have proper `role="img"` and `aria-label`
- Keyboard shortcuts should support tool selection and color changes
- Strokes and interactions should be describable to assistive technologies

### Control Panel
- All controls must be fully keyboard accessible
- Visual feedback must be paired with semantic state (aria-pressed, aria-expanded)
- Color-only feedback is prohibited; use text, icons, or status indicators
- Labels must be associated with all inputs (not just placeholders)

### Form Controls
- Line width slider must have proper `aria-label`
- Color picker must be supplemented with text input for hex values
- Tool selection buttons must use `aria-pressed` for state
- All buttons must be clearly labeled and focusable

## Minimum Checklist

- ✅ Semantic HTML and ARIA roles
- ✅ Visible focus states (blue outline on all interactive elements)
- ✅ WCAG AA color contrast (4.5:1 for text, 3:1 for graphics)
- ✅ Meaningful labels, descriptions, and state indicators
- ✅ Full keyboard navigation (Tab, arrows, Enter)
- ✅ Screen reader announcements for state changes
- ✅ No color-only feedback; always pair with text/icons

## Testing Requirements

Before shipping:

1. **Keyboard Navigation** - Tab through all controls, verify focus is visible
2. **Screen Reader** - Test with NVDA (Windows) or VoiceOver (Mac)
3. **Color Contrast** - Verify all text and interactive elements meet WCAG AA
4. **Reduced Motion** - Respect `prefers-reduced-motion` media query for animations

## Future Additions

- Detailed WCAG 2.1 Level AA mapping
- Component-level accessibility patterns
- Touch/pointer support guidelines
- Localization and i18n accessibility
