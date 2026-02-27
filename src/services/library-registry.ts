/**
 * Design System Registry
 *
 * Hybrid library discovery:
 * 1. Curated registry — instant, 100% accurate for known libraries
 * 2. GitHub API fallback — scans repo tree for component files
 * 3. HTML fetch + parse — extracts component names from docs pages
 */

import type { DesignLibrary, LibraryComponent } from '@/types/canvas';

/* ─── Curated component registries ──────────────────────── */

interface RegistryEntry {
  /** URL patterns that identify this library (tested against input URL) */
  patterns: RegExp[];
  /** Human-readable name */
  name: string;
  description: string;
  source: DesignLibrary['source'];
  sourceUrl: string;
  components: LibraryComponent[];
}

const REGISTRY: RegistryEntry[] = [
  /* ── shadcn/ui ──────────────────────────────────────── */
  {
    patterns: [
      /shadcn/i,
      /ui\.shadcn/i,
    ],
    name: 'shadcn/ui',
    description: 'Beautifully designed components built with Radix UI and Tailwind CSS',
    source: 'github',
    sourceUrl: 'https://github.com/shadcn-ui/ui',
    components: [
      { id: 'shadcn-accordion', name: 'Accordion', category: 'Disclosure', description: 'A vertically stacked set of interactive headings that reveal content' },
      { id: 'shadcn-alert', name: 'Alert', category: 'Feedback', description: 'Displays a callout for user attention' },
      { id: 'shadcn-alert-dialog', name: 'Alert Dialog', category: 'Overlay', description: 'A modal dialog that interrupts the user with important content' },
      { id: 'shadcn-aspect-ratio', name: 'Aspect Ratio', category: 'Layout', description: 'Displays content within a desired ratio' },
      { id: 'shadcn-avatar', name: 'Avatar', category: 'Data Display', description: 'An image element with a fallback for representing the user' },
      { id: 'shadcn-badge', name: 'Badge', category: 'Data Display', description: 'Displays a badge or a component that looks like a badge' },
      { id: 'shadcn-breadcrumb', name: 'Breadcrumb', category: 'Navigation', description: 'Displays the path to the current resource using a hierarchy of links' },
      { id: 'shadcn-button', name: 'Button', category: 'Actions', description: 'Displays a button or a component that looks like a button' },
      { id: 'shadcn-calendar', name: 'Calendar', category: 'Date & Time', description: 'A date field component that allows users to enter and edit date' },
      { id: 'shadcn-card', name: 'Card', category: 'Layout', description: 'Displays a card with header, content, and footer' },
      { id: 'shadcn-carousel', name: 'Carousel', category: 'Data Display', description: 'A carousel with motion and swipe built using Embla' },
      { id: 'shadcn-chart', name: 'Chart', category: 'Data Display', description: 'Beautiful charts built using Recharts' },
      { id: 'shadcn-checkbox', name: 'Checkbox', category: 'Forms', description: 'A control that allows the user to toggle between checked and not checked' },
      { id: 'shadcn-collapsible', name: 'Collapsible', category: 'Disclosure', description: 'An interactive component which expands/collapses a panel' },
      { id: 'shadcn-combobox', name: 'Combobox', category: 'Forms', description: 'Autocomplete input and command palette with a list of suggestions' },
      { id: 'shadcn-command', name: 'Command', category: 'Navigation', description: 'Fast, composable, unstyled command menu' },
      { id: 'shadcn-context-menu', name: 'Context Menu', category: 'Overlay', description: 'Displays a menu at the pointer position on right-click' },
      { id: 'shadcn-data-table', name: 'Data Table', category: 'Data Display', description: 'Powerful table and datagrids built using TanStack Table' },
      { id: 'shadcn-date-picker', name: 'Date Picker', category: 'Date & Time', description: 'A date picker component with range and presets' },
      { id: 'shadcn-dialog', name: 'Dialog', category: 'Overlay', description: 'A window overlaid on the primary window, rendering content underneath inert' },
      { id: 'shadcn-drawer', name: 'Drawer', category: 'Overlay', description: 'A drawer component for React built on top of Vaul' },
      { id: 'shadcn-dropdown-menu', name: 'Dropdown Menu', category: 'Overlay', description: 'Displays a menu of actions/options triggered by a button' },
      { id: 'shadcn-form', name: 'Form', category: 'Forms', description: 'Building forms with React Hook Form and Zod' },
      { id: 'shadcn-hover-card', name: 'Hover Card', category: 'Overlay', description: 'For sighted users to preview content available behind a link' },
      { id: 'shadcn-input', name: 'Input', category: 'Forms', description: 'Displays a form input field' },
      { id: 'shadcn-input-otp', name: 'Input OTP', category: 'Forms', description: 'Accessible one-time password component with copy paste functionality' },
      { id: 'shadcn-label', name: 'Label', category: 'Forms', description: 'Renders an accessible label associated with controls' },
      { id: 'shadcn-menubar', name: 'Menubar', category: 'Navigation', description: 'A visually persistent menu common in desktop applications' },
      { id: 'shadcn-navigation-menu', name: 'Navigation Menu', category: 'Navigation', description: 'A collection of links for navigating websites' },
      { id: 'shadcn-pagination', name: 'Pagination', category: 'Navigation', description: 'Pagination with page navigation, next and previous links' },
      { id: 'shadcn-popover', name: 'Popover', category: 'Overlay', description: 'Displays rich content in a portal, triggered by a button' },
      { id: 'shadcn-progress', name: 'Progress', category: 'Feedback', description: 'Displays an indicator showing the completion progress of a task' },
      { id: 'shadcn-radio-group', name: 'Radio Group', category: 'Forms', description: 'A set of checkable buttons where only one can be checked at a time' },
      { id: 'shadcn-resizable', name: 'Resizable', category: 'Layout', description: 'Accessible resizable panel groups and layouts with keyboard support' },
      { id: 'shadcn-scroll-area', name: 'Scroll Area', category: 'Layout', description: 'Augments native scroll functionality for custom, cross-browser styling' },
      { id: 'shadcn-select', name: 'Select', category: 'Forms', description: 'Displays a list of options for the user to pick from' },
      { id: 'shadcn-separator', name: 'Separator', category: 'Layout', description: 'Visually or semantically separates content' },
      { id: 'shadcn-sheet', name: 'Sheet', category: 'Overlay', description: 'Extends the Dialog component to display content that complements the page' },
      { id: 'shadcn-sidebar', name: 'Sidebar', category: 'Navigation', description: 'A composable, themeable and customizable sidebar component' },
      { id: 'shadcn-skeleton', name: 'Skeleton', category: 'Feedback', description: 'Use to show a placeholder while content is loading' },
      { id: 'shadcn-slider', name: 'Slider', category: 'Forms', description: 'An input where the user selects a value from within a given range' },
      { id: 'shadcn-sonner', name: 'Sonner', category: 'Feedback', description: 'An opinionated toast component' },
      { id: 'shadcn-switch', name: 'Switch', category: 'Forms', description: 'A control that allows the user to toggle between two states' },
      { id: 'shadcn-table', name: 'Table', category: 'Data Display', description: 'A responsive table component' },
      { id: 'shadcn-tabs', name: 'Tabs', category: 'Navigation', description: 'A set of layered sections of content, known as tab panels' },
      { id: 'shadcn-textarea', name: 'Textarea', category: 'Forms', description: 'Displays a form textarea' },
      { id: 'shadcn-toast', name: 'Toast', category: 'Feedback', description: 'A succinct message that is displayed temporarily' },
      { id: 'shadcn-toggle', name: 'Toggle', category: 'Actions', description: 'A two-state button that can be either on or off' },
      { id: 'shadcn-toggle-group', name: 'Toggle Group', category: 'Actions', description: 'A set of two-state buttons that can be toggled on or off' },
      { id: 'shadcn-tooltip', name: 'Tooltip', category: 'Overlay', description: 'A popup that displays information related to an element' },
    ],
  },

  /* ── Radix UI ───────────────────────────────────────── */
  {
    patterns: [
      /radix-ui/i,
      /radix\.com/i,
      /radixui/i,
    ],
    name: 'Radix UI',
    description: 'Unstyled, accessible components for building high-quality design systems',
    source: 'github',
    sourceUrl: 'https://github.com/radix-ui/primitives',
    components: [
      { id: 'radix-accordion', name: 'Accordion', category: 'Disclosure', description: 'A vertically stacked set of interactive headings' },
      { id: 'radix-alert-dialog', name: 'Alert Dialog', category: 'Overlay', description: 'A modal dialog that interrupts the user' },
      { id: 'radix-aspect-ratio', name: 'Aspect Ratio', category: 'Layout', description: 'Displays content within a desired ratio' },
      { id: 'radix-avatar', name: 'Avatar', category: 'Data Display', description: 'An image element with a fallback for representing the user' },
      { id: 'radix-checkbox', name: 'Checkbox', category: 'Forms', description: 'A control that allows the user to toggle between checked and not checked' },
      { id: 'radix-collapsible', name: 'Collapsible', category: 'Disclosure', description: 'An interactive component which expands/collapses a panel' },
      { id: 'radix-context-menu', name: 'Context Menu', category: 'Overlay', description: 'Displays a menu at the pointer position' },
      { id: 'radix-dialog', name: 'Dialog', category: 'Overlay', description: 'A window overlaid on the primary window' },
      { id: 'radix-dropdown-menu', name: 'Dropdown Menu', category: 'Overlay', description: 'Displays a menu of actions to the user' },
      { id: 'radix-form', name: 'Form', category: 'Forms', description: 'Primitives for building accessible forms' },
      { id: 'radix-hover-card', name: 'Hover Card', category: 'Overlay', description: 'Preview content behind a link' },
      { id: 'radix-label', name: 'Label', category: 'Forms', description: 'An accessible label for controls' },
      { id: 'radix-menubar', name: 'Menubar', category: 'Navigation', description: 'A visually persistent menu for desktop apps' },
      { id: 'radix-navigation-menu', name: 'Navigation Menu', category: 'Navigation', description: 'A collection of links for navigating websites' },
      { id: 'radix-popover', name: 'Popover', category: 'Overlay', description: 'Displays rich content in a portal' },
      { id: 'radix-progress', name: 'Progress', category: 'Feedback', description: 'Displays completion progress' },
      { id: 'radix-radio-group', name: 'Radio Group', category: 'Forms', description: 'A set of checkable buttons' },
      { id: 'radix-scroll-area', name: 'Scroll Area', category: 'Layout', description: 'Custom cross-browser scroll area' },
      { id: 'radix-select', name: 'Select', category: 'Forms', description: 'Displays a list of options for the user to pick from' },
      { id: 'radix-separator', name: 'Separator', category: 'Layout', description: 'Visually separates content' },
      { id: 'radix-slider', name: 'Slider', category: 'Forms', description: 'An input where the user selects a value from a range' },
      { id: 'radix-switch', name: 'Switch', category: 'Forms', description: 'A control to toggle between two states' },
      { id: 'radix-tabs', name: 'Tabs', category: 'Navigation', description: 'Layered sections of content' },
      { id: 'radix-toast', name: 'Toast', category: 'Feedback', description: 'A succinct temporary message' },
      { id: 'radix-toggle', name: 'Toggle', category: 'Actions', description: 'A two-state button' },
      { id: 'radix-toggle-group', name: 'Toggle Group', category: 'Actions', description: 'A set of two-state buttons' },
      { id: 'radix-toolbar', name: 'Toolbar', category: 'Navigation', description: 'A container for grouping controls' },
      { id: 'radix-tooltip', name: 'Tooltip', category: 'Overlay', description: 'A popup that displays information' },
    ],
  },

  /* ── Material UI 3 (MUI / Material Design 3) ────────── */
  {
    patterns: [
      /mui\.com/i,
      /material-ui/i,
      /material.*design/i,
      /mui\/material/i,
      /@mui/i,
    ],
    name: 'Material UI 3',
    description: 'Material Design 3 components — Google\'s open-source design system for React',
    source: 'npm',
    sourceUrl: 'https://mui.com/material-ui/',
    components: [
      // Inputs
      { id: 'mui-autocomplete', name: 'Autocomplete', category: 'Inputs', description: 'A text input enhanced by a panel of suggested options' },
      { id: 'mui-button', name: 'Button', category: 'Inputs', description: 'Buttons allow users to take actions with a single tap' },
      { id: 'mui-button-group', name: 'Button Group', category: 'Inputs', description: 'Group a series of buttons together on a single line' },
      { id: 'mui-checkbox', name: 'Checkbox', category: 'Inputs', description: 'Checkboxes allow the user to select items from a set' },
      { id: 'mui-fab', name: 'Floating Action Button', category: 'Inputs', description: 'A circular button that triggers the primary action' },
      { id: 'mui-radio', name: 'Radio Group', category: 'Inputs', description: 'Allows the user to select one option from a set' },
      { id: 'mui-rating', name: 'Rating', category: 'Inputs', description: 'Provide insight into others opinions and experiences' },
      { id: 'mui-select', name: 'Select', category: 'Inputs', description: 'Select components are used for collecting user-provided information' },
      { id: 'mui-slider', name: 'Slider', category: 'Inputs', description: 'Sliders allow users to make selections from a range of values' },
      { id: 'mui-switch', name: 'Switch', category: 'Inputs', description: 'Switches toggle the state of a single setting on or off' },
      { id: 'mui-text-field', name: 'Text Field', category: 'Inputs', description: 'Text fields let users enter and edit text' },
      { id: 'mui-toggle-button', name: 'Toggle Button', category: 'Inputs', description: 'Toggle buttons can be used to group related options' },
      // Data Display
      { id: 'mui-avatar', name: 'Avatar', category: 'Data Display', description: 'Avatars are found throughout material design' },
      { id: 'mui-badge', name: 'Badge', category: 'Data Display', description: 'Badge generates a small badge to its children' },
      { id: 'mui-chip', name: 'Chip', category: 'Data Display', description: 'Chips represent complex entities in small blocks' },
      { id: 'mui-divider', name: 'Divider', category: 'Data Display', description: 'A thin line that groups content in lists and layouts' },
      { id: 'mui-icon', name: 'Icon', category: 'Data Display', description: 'Material icons from the Material Design spec' },
      { id: 'mui-list', name: 'List', category: 'Data Display', description: 'Lists are continuous, vertical indexes of text or images' },
      { id: 'mui-table', name: 'Table', category: 'Data Display', description: 'Tables display sets of data across rows and columns' },
      { id: 'mui-tooltip', name: 'Tooltip', category: 'Data Display', description: 'Tooltips display informative text on hover' },
      { id: 'mui-typography', name: 'Typography', category: 'Data Display', description: 'Use typography to present content clearly' },
      // Feedback
      { id: 'mui-alert', name: 'Alert', category: 'Feedback', description: 'An alert displays a short, important message' },
      { id: 'mui-backdrop', name: 'Backdrop', category: 'Feedback', description: 'The backdrop signals a state change and can be used for loaders' },
      { id: 'mui-dialog', name: 'Dialog', category: 'Feedback', description: 'Dialogs inform users about a task or important information' },
      { id: 'mui-progress', name: 'Progress', category: 'Feedback', description: 'Progress indicators inform users about the status of ongoing processes' },
      { id: 'mui-skeleton', name: 'Skeleton', category: 'Feedback', description: 'Display a placeholder preview of content before data is loaded' },
      { id: 'mui-snackbar', name: 'Snackbar', category: 'Feedback', description: 'Snackbars provide brief notifications' },
      // Surfaces
      { id: 'mui-accordion', name: 'Accordion', category: 'Surfaces', description: 'An accordion is a lightweight container' },
      { id: 'mui-app-bar', name: 'App Bar', category: 'Surfaces', description: 'The App Bar displays information and actions' },
      { id: 'mui-card', name: 'Card', category: 'Surfaces', description: 'Cards contain content and actions about a single subject' },
      { id: 'mui-paper', name: 'Paper', category: 'Surfaces', description: 'Physical properties of paper translated to the screen' },
      // Navigation
      { id: 'mui-bottom-nav', name: 'Bottom Navigation', category: 'Navigation', description: 'Navigation bars at the bottom of the screen' },
      { id: 'mui-breadcrumbs', name: 'Breadcrumbs', category: 'Navigation', description: 'Breadcrumbs allow users to navigate between levels' },
      { id: 'mui-drawer', name: 'Drawer', category: 'Navigation', description: 'Navigation drawers provide access to destinations' },
      { id: 'mui-link', name: 'Link', category: 'Navigation', description: 'The Link component lets you customize anchor elements' },
      { id: 'mui-menu', name: 'Menu', category: 'Navigation', description: 'Menus display a list of choices on temporary surfaces' },
      { id: 'mui-pagination', name: 'Pagination', category: 'Navigation', description: 'Pagination separates long sets of data across pages' },
      { id: 'mui-speed-dial', name: 'Speed Dial', category: 'Navigation', description: 'A floating action button that can display related actions' },
      { id: 'mui-stepper', name: 'Stepper', category: 'Navigation', description: 'Steppers convey progress through numbered steps' },
      { id: 'mui-tabs', name: 'Tabs', category: 'Navigation', description: 'Tabs make it easy to explore and switch between views' },
      // Layout
      { id: 'mui-box', name: 'Box', category: 'Layout', description: 'The Box component serves as a wrapper component' },
      { id: 'mui-container', name: 'Container', category: 'Layout', description: 'The container centers content horizontally' },
      { id: 'mui-grid', name: 'Grid', category: 'Layout', description: 'The responsive layout grid adapts to screen size' },
      { id: 'mui-stack', name: 'Stack', category: 'Layout', description: 'Stack manages layout of immediate children along the vertical or horizontal axis' },
    ],
  },

  /* ── Fluent UI ──────────────────────────────────────── */
  {
    patterns: [
      /fluent/i,
      /fluentui/i,
      /fluent-ui/i,
      /fluent2/i,
    ],
    name: 'Fluent UI',
    description: 'Microsoft\'s cross-platform design system for creating adaptive, accessible experiences',
    source: 'github',
    sourceUrl: 'https://github.com/microsoft/fluentui',
    components: [
      // Actions
      { id: 'fluent-button', name: 'Button', category: 'Actions', description: 'Triggers an action or event' },
      { id: 'fluent-compound-button', name: 'Compound Button', category: 'Actions', description: 'Button with a primary and secondary text' },
      { id: 'fluent-menu-button', name: 'Menu Button', category: 'Actions', description: 'A button that opens a menu' },
      { id: 'fluent-split-button', name: 'Split Button', category: 'Actions', description: 'A button with a primary and menu action' },
      { id: 'fluent-toggle-button', name: 'Toggle Button', category: 'Actions', description: 'A button that can be toggled on or off' },
      { id: 'fluent-link', name: 'Link', category: 'Actions', description: 'An anchor element styled as a link' },
      // Inputs
      { id: 'fluent-checkbox', name: 'Checkbox', category: 'Inputs', description: 'Allows users to toggle a check' },
      { id: 'fluent-combobox', name: 'Combobox', category: 'Inputs', description: 'A select with text input for filtering' },
      { id: 'fluent-dropdown', name: 'Dropdown', category: 'Inputs', description: 'A select component for choosing options' },
      { id: 'fluent-field', name: 'Field', category: 'Inputs', description: 'Wrapper providing label, validation, and hints' },
      { id: 'fluent-input', name: 'Input', category: 'Inputs', description: 'A single-line text input' },
      { id: 'fluent-radio-group', name: 'Radio Group', category: 'Inputs', description: 'A group of exclusive options' },
      { id: 'fluent-search-box', name: 'SearchBox', category: 'Inputs', description: 'Input for search queries' },
      { id: 'fluent-select', name: 'Select', category: 'Inputs', description: 'A native select wrapper' },
      { id: 'fluent-slider', name: 'Slider', category: 'Inputs', description: 'An input for selecting a value from a range' },
      { id: 'fluent-spinbutton', name: 'SpinButton', category: 'Inputs', description: 'Number input with increment/decrement' },
      { id: 'fluent-switch', name: 'Switch', category: 'Inputs', description: 'Toggle between two states' },
      { id: 'fluent-textarea', name: 'Textarea', category: 'Inputs', description: 'Multi-line text input' },
      // Data Display
      { id: 'fluent-avatar', name: 'Avatar', category: 'Data Display', description: 'Graphical representation of a user' },
      { id: 'fluent-avatar-group', name: 'Avatar Group', category: 'Data Display', description: 'A group of avatar components' },
      { id: 'fluent-badge', name: 'Badge', category: 'Data Display', description: 'A visual indicator' },
      { id: 'fluent-counter-badge', name: 'Counter Badge', category: 'Data Display', description: 'A badge for showing counts' },
      { id: 'fluent-data-grid', name: 'Data Grid', category: 'Data Display', description: 'A grid for displaying tabular data' },
      { id: 'fluent-label', name: 'Label', category: 'Data Display', description: 'A text label for controls' },
      { id: 'fluent-persona', name: 'Persona', category: 'Data Display', description: 'A visual representation of a person' },
      { id: 'fluent-tag', name: 'Tag', category: 'Data Display', description: 'A compact element for categorization' },
      { id: 'fluent-text', name: 'Text', category: 'Data Display', description: 'A typography component' },
      { id: 'fluent-tree', name: 'Tree', category: 'Data Display', description: 'A hierarchical list' },
      // Feedback
      { id: 'fluent-alert', name: 'Alert', category: 'Feedback', description: 'Displays a brief important message' },
      { id: 'fluent-dialog', name: 'Dialog', category: 'Feedback', description: 'A modal overlay' },
      { id: 'fluent-drawer', name: 'Drawer', category: 'Feedback', description: 'A panel that slides from the edge' },
      { id: 'fluent-message-bar', name: 'MessageBar', category: 'Feedback', description: 'An inline status message' },
      { id: 'fluent-progress-bar', name: 'ProgressBar', category: 'Feedback', description: 'Shows task progress' },
      { id: 'fluent-skeleton', name: 'Skeleton', category: 'Feedback', description: 'A placeholder while content loads' },
      { id: 'fluent-spinner', name: 'Spinner', category: 'Feedback', description: 'An indeterminate progress indicator' },
      { id: 'fluent-toast', name: 'Toast', category: 'Feedback', description: 'Temporary notification' },
      // Navigation
      { id: 'fluent-breadcrumb', name: 'Breadcrumb', category: 'Navigation', description: 'Shows the navigation trail' },
      { id: 'fluent-menu', name: 'Menu', category: 'Navigation', description: 'A list of actions on a temporary surface' },
      { id: 'fluent-nav', name: 'Nav', category: 'Navigation', description: 'Side navigation panel' },
      { id: 'fluent-overflow', name: 'Overflow', category: 'Navigation', description: 'Manages items that overflow a container' },
      { id: 'fluent-tab-list', name: 'TabList', category: 'Navigation', description: 'A set of tabs for switching views' },
      { id: 'fluent-toolbar', name: 'Toolbar', category: 'Navigation', description: 'A container for grouping commands' },
      // Layout
      { id: 'fluent-card', name: 'Card', category: 'Layout', description: 'A flexible container for content' },
      { id: 'fluent-divider', name: 'Divider', category: 'Layout', description: 'A visual separator' },
      { id: 'fluent-accordion', name: 'Accordion', category: 'Layout', description: 'Expandable content sections' },
      { id: 'fluent-popover', name: 'Popover', category: 'Layout', description: 'Content displayed in a portal' },
      { id: 'fluent-tooltip', name: 'Tooltip', category: 'Layout', description: 'Informational text on hover' },
    ],
  },

  /* ── Apple Liquid Glass ─────────────────────────────── */
  {
    patterns: [
      /liquid.?glass/i,
      /apple.*glass/i,
      /glass.*apple/i,
      /developer\.apple\.com/i,
    ],
    name: 'Apple Liquid Glass',
    description: 'Apple\'s translucent, depth-aware design language introduced in 2025',
    source: 'other',
    sourceUrl: 'https://developer.apple.com/design/',
    components: [
      // Controls
      { id: 'glass-button', name: 'Glass Button', category: 'Controls', description: 'A translucent button with frosted-glass material and depth response' },
      { id: 'glass-toggle', name: 'Glass Toggle', category: 'Controls', description: 'A toggle switch with liquid glass material' },
      { id: 'glass-segmented-control', name: 'Segmented Control', category: 'Controls', description: 'A segmented picker with glass-morphic segments' },
      { id: 'glass-slider', name: 'Glass Slider', category: 'Controls', description: 'A slider with glass track and knob' },
      { id: 'glass-stepper', name: 'Stepper', category: 'Controls', description: 'Increment/decrement control with glass material' },
      { id: 'glass-picker', name: 'Picker', category: 'Controls', description: 'A selection wheel with depth and transparency' },
      { id: 'glass-color-picker', name: 'Color Picker', category: 'Controls', description: 'A glass-styled color selection control' },
      { id: 'glass-date-picker', name: 'Date Picker', category: 'Controls', description: 'Date and time selection with liquid glass chrome' },
      // Navigation
      { id: 'glass-tab-bar', name: 'Tab Bar', category: 'Navigation', description: 'Bottom tab navigation with translucent glass background' },
      { id: 'glass-navigation-bar', name: 'Navigation Bar', category: 'Navigation', description: 'Top navigation bar with glass material and blur' },
      { id: 'glass-sidebar', name: 'Sidebar', category: 'Navigation', description: 'A translucent sidebar with depth-aware layering' },
      { id: 'glass-toolbar', name: 'Toolbar', category: 'Navigation', description: 'A floating glass toolbar with contextual actions' },
      { id: 'glass-search-bar', name: 'Search Bar', category: 'Navigation', description: 'A glass-styled search input with live filtering' },
      // Presentation
      { id: 'glass-card', name: 'Glass Card', category: 'Presentation', description: 'A content card with frosted-glass background and specular highlights' },
      { id: 'glass-sheet', name: 'Glass Sheet', category: 'Presentation', description: 'A modal sheet with glass material, swipe to dismiss' },
      { id: 'glass-alert', name: 'Glass Alert', category: 'Presentation', description: 'An alert dialog with translucent glass backdrop' },
      { id: 'glass-notification', name: 'Notification Banner', category: 'Presentation', description: 'A notification banner with glass material' },
      { id: 'glass-popover', name: 'Glass Popover', category: 'Presentation', description: 'A floating popover with depth shadow and glass fill' },
      { id: 'glass-menu', name: 'Context Menu', category: 'Presentation', description: 'A context menu with liquid glass material' },
      { id: 'glass-tooltip', name: 'Glass Tooltip', category: 'Presentation', description: 'An informational tooltip with glass material' },
      // Layout & Containers
      { id: 'glass-panel', name: 'Glass Panel', category: 'Layout', description: 'A general-purpose translucent container with blur and depth' },
      { id: 'glass-group-box', name: 'Group Box', category: 'Layout', description: 'A grouped container with subtle glass border' },
      { id: 'glass-list', name: 'Glass List', category: 'Layout', description: 'A list view with glass row separators and translucency' },
      { id: 'glass-scroll-view', name: 'Scroll View', category: 'Layout', description: 'A scrollable container with fading glass edges' },
      { id: 'glass-split-view', name: 'Split View', category: 'Layout', description: 'A resizable split layout with glass divider' },
      // Data Display
      { id: 'glass-avatar', name: 'Glass Avatar', category: 'Data Display', description: 'User avatar with glass ring and depth shadow' },
      { id: 'glass-badge', name: 'Glass Badge', category: 'Data Display', description: 'A notification badge with translucent material' },
      { id: 'glass-progress', name: 'Glass Progress', category: 'Data Display', description: 'A progress indicator with glass track and fill' },
      { id: 'glass-tag', name: 'Glass Tag', category: 'Data Display', description: 'A label tag with glass-morphic appearance' },
      // Forms
      { id: 'glass-text-field', name: 'Glass Text Field', category: 'Forms', description: 'A text input with frosted-glass background' },
      { id: 'glass-text-editor', name: 'Glass Text Editor', category: 'Forms', description: 'A multi-line text area with glass material' },
      { id: 'glass-checkbox', name: 'Glass Checkbox', category: 'Forms', description: 'A checkbox with glass material and check animation' },
      { id: 'glass-radio', name: 'Glass Radio', category: 'Forms', description: 'Radio buttons with liquid glass indicators' },
    ],
  },
];

/* ─── Registry lookup (instant, curated) ────────────────── */

export function lookupRegistry(url: string): DesignLibrary | null {
  const normalized = url.trim().toLowerCase();
  for (const entry of REGISTRY) {
    for (const pattern of entry.patterns) {
      if (pattern.test(normalized)) {
        return {
          id: `lib-${Date.now()}`,
          name: entry.name,
          description: entry.description,
          source: entry.source,
          sourceUrl: entry.sourceUrl,
          components: entry.components,
          active: true,
        };
      }
    }
  }
  return null;
}

/* ─── GitHub API fallback ───────────────────────────────── */

const COMPONENT_FILE_PATTERN = /\.(tsx|jsx|vue|svelte)$/i;
const IGNORE_PATTERNS = [
  /node_modules/i, /dist/i, /build/i, /__tests__/i, /\.test\./i, /\.spec\./i,
  /\.stories\./i, /\.d\.ts$/i, /index\.(tsx|jsx)$/i, /utils/i, /helpers/i,
  /types/i, /constants/i, /hooks/i, /context/i,
];

/** Guess a readable component name from a file path */
function nameFromPath(path: string): string {
  const file = path.split('/').pop() || '';
  const name = file.replace(/\.(tsx|jsx|vue|svelte)$/i, '');
  // Convert kebab-case or snake_case to Title Case
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Guess category from directory path */
function categoryFromPath(path: string): string {
  const dirs = path.split('/');
  // Find the most meaningful parent directory
  for (let i = dirs.length - 2; i >= 0; i--) {
    const dir = dirs[i].toLowerCase();
    if (['src', 'lib', 'packages', 'components'].includes(dir)) continue;
    return dirs[i].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return 'Components';
}

interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
}

/**
 * Fetch component list from a GitHub repository.
 * Uses the Trees API to get the full repo structure in a single request.
 */
export async function fetchFromGitHub(url: string): Promise<DesignLibrary | null> {
  // Extract owner/repo from GitHub URL
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/i);
  if (!match) return null;

  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');

  try {
    // Get default branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
    if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.status}`);
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Fetch full tree (recursive) — single API request
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`,
    );
    if (!treeRes.ok) throw new Error(`GitHub Tree API error: ${treeRes.status}`);
    const treeData = await treeRes.json();

    const items: GitHubTreeItem[] = treeData.tree || [];

    // Filter to component files
    const componentFiles = items.filter((item) => {
      if (item.type !== 'blob') return false;
      if (!COMPONENT_FILE_PATTERN.test(item.path)) return false;
      if (IGNORE_PATTERNS.some((p) => p.test(item.path))) return false;
      return true;
    });

    if (componentFiles.length === 0) return null;

    // Deduplicate by component name (keep the shortest path)
    const seen = new Map<string, GitHubTreeItem>();
    for (const file of componentFiles) {
      const name = nameFromPath(file.path);
      const existing = seen.get(name);
      if (!existing || file.path.length < existing.path.length) {
        seen.set(name, file);
      }
    }

    const components: LibraryComponent[] = Array.from(seen.entries()).map(
      ([name, file]) => ({
        id: `gh-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        category: categoryFromPath(file.path),
        description: `Component from ${owner}/${repoName}`,
      }),
    );

    return {
      id: `lib-${Date.now()}`,
      name: repoData.name || `${owner}/${repoName}`,
      description: repoData.description || `GitHub repository: ${owner}/${repoName}`,
      source: 'github',
      sourceUrl: url,
      components,
      active: true,
    };
  } catch (err) {
    console.warn('[library-registry] GitHub fetch failed:', err);
    return null;
  }
}

/* ─── Figma API integration ─────────────────────────────── */

const FIGMA_API = 'https://api.figma.com/v1';

/**
 * Extract a Figma file key from a URL.
 * Supports:
 *   https://www.figma.com/file/ABCDE/FileName
 *   https://www.figma.com/design/ABCDE/FileName
 *   https://figma.com/file/ABCDE
 */
function extractFigmaFileKey(url: string): string | null {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Fetch component list from a Figma file using the Figma REST API.
 * Requires a personal access token set via VITE_FIGMA_TOKEN.
 *
 * Reads both published components and component sets (variants).
 */
export async function fetchFromFigma(url: string): Promise<DesignLibrary | null> {
  const fileKey = extractFigmaFileKey(url);
  if (!fileKey) return null;

  const token = import.meta.env.VITE_FIGMA_TOKEN || '';
  if (!token) {
    console.warn('[library-registry] VITE_FIGMA_TOKEN not set — cannot read Figma files');
    return null;
  }

  try {
    // Use the /files/:key endpoint to get file metadata + components
    const res = await fetch(`${FIGMA_API}/files/${fileKey}?depth=1`, {
      headers: { 'X-Figma-Token': token },
    });
    if (!res.ok) throw new Error(`Figma API error: ${res.status}`);
    const data = await res.json();

    const components: LibraryComponent[] = [];
    const seenNames = new Set<string>();

    // Extract from components map (published components)
    if (data.components) {
      for (const [nodeId, meta] of Object.entries(data.components)) {
        const m = meta as { name: string; description?: string; componentSetId?: string };
        const name = m.name;
        if (!name || seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());
        components.push({
          id: `figma-${nodeId}`,
          name,
          category: m.componentSetId ? 'Variants' : 'Components',
          description: m.description || `Figma component`,
        });
      }
    }

    // Also extract component sets (variant groups)
    if (data.componentSets) {
      for (const [nodeId, meta] of Object.entries(data.componentSets)) {
        const m = meta as { name: string; description?: string };
        const name = m.name;
        if (!name || seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());
        components.push({
          id: `figma-set-${nodeId}`,
          name,
          category: 'Component Sets',
          description: m.description || `Figma component set`,
        });
      }
    }

    // For files that don't publish components, scan the top-level document
    // for COMPONENT and COMPONENT_SET node types
    if (components.length === 0 && data.document?.children) {
      const walk = (node: any) => {
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
          const name = node.name;
          if (name && !seenNames.has(name.toLowerCase())) {
            seenNames.add(name.toLowerCase());
            components.push({
              id: `figma-node-${node.id}`,
              name,
              category: node.type === 'COMPONENT_SET' ? 'Component Sets' : 'Components',
              description: `Figma ${node.type.toLowerCase().replace('_', ' ')}`,
            });
          }
        }
        if (node.children) node.children.forEach(walk);
      };
      data.document.children.forEach(walk);
    }

    if (components.length === 0) return null;

    const fileName = data.name || `Figma File (${fileKey})`;
    return {
      id: `lib-${Date.now()}`,
      name: fileName,
      description: `Figma file with ${components.length} components`,
      source: 'figma',
      sourceUrl: url,
      components: components.sort((a, b) => a.name.localeCompare(b.name)),
      active: true,
    };
  } catch (err) {
    console.warn('[library-registry] Figma fetch failed:', err);
    return null;
  }
}

/* ─── HTML fetch + parse fallback ───────────────────────── */

/**
 * Fetch a URL's HTML and extract component names from headings and common patterns.
 * Works for docs sites like Storybook, Chakra docs, component galleries, etc.
 */
export async function fetchFromHTML(url: string): Promise<DesignLibrary | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract page title for library name
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch?.[1]?.trim() || new URL(url).hostname;

    const components: LibraryComponent[] = [];
    const seenNames = new Set<string>();

    // Strategy 1: Find component names from navigation links
    // Common patterns: /docs/components/button, /components/button, sidebar links
    const navLinkPattern = /href=["'](?:[^"']*?)(?:\/components?\/|\/docs\/)([\w-]+)["']/gi;
    let navMatch;
    while ((navMatch = navLinkPattern.exec(html)) !== null) {
      const raw = navMatch[1];
      if (raw.length < 2 || raw.length > 40) continue;
      const name = raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (!seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        components.push({
          id: `html-${raw}`,
          name,
          category: 'Components',
          description: `Discovered from ${new URL(url).hostname}`,
        });
      }
    }

    // Strategy 2: Look for heading-based component listings  (h2/h3 with common component names)
    const headingPattern = /<h[2-4][^>]*>([^<]{2,40})<\/h[2-4]>/gi;
    const knownComponentWords = new Set([
      'button', 'input', 'select', 'checkbox', 'radio', 'switch', 'toggle',
      'slider', 'dialog', 'modal', 'alert', 'toast', 'tooltip', 'popover',
      'menu', 'dropdown', 'tabs', 'tab', 'accordion', 'card', 'avatar',
      'badge', 'breadcrumb', 'calendar', 'carousel', 'chip', 'divider',
      'drawer', 'form', 'grid', 'icon', 'label', 'link', 'list', 'nav',
      'pagination', 'progress', 'skeleton', 'spinner', 'stepper', 'table',
      'tag', 'textarea', 'toolbar', 'tree', 'typography', 'separator',
      'scroll', 'sheet', 'sidebar', 'combobox', 'picker', 'rating',
      'fab', 'snackbar', 'banner',
    ]);
    let headingMatch;
    while ((headingMatch = headingPattern.exec(html)) !== null) {
      const text = headingMatch[1].replace(/<[^>]+>/g, '').trim();
      const lower = text.toLowerCase().replace(/[-_\s]+/g, '');
      // Only include if it looks like a component name
      if (knownComponentWords.has(lower) && !seenNames.has(lower)) {
        seenNames.add(lower);
        components.push({
          id: `html-${lower}`,
          name: text,
          category: 'Components',
          description: `Discovered from ${new URL(url).hostname}`,
        });
      }
    }

    // Strategy 3: Look for JSON-LD or structured data
    const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        // Extract names from itemListElement if present
        if (data.itemListElement) {
          for (const item of data.itemListElement) {
            const name = item.name || item.item?.name;
            if (name && !seenNames.has(name.toLowerCase())) {
              seenNames.add(name.toLowerCase());
              components.push({
                id: `html-${name.toLowerCase().replace(/\s+/g, '-')}`,
                name,
                category: 'Components',
                description: `Discovered from structured data`,
              });
            }
          }
        }
      } catch {
        // Invalid JSON-LD, skip
      }
    }

    if (components.length === 0) return null;

    return {
      id: `lib-${Date.now()}`,
      name: pageTitle.split(/[|\-–—]/)[0].trim(),
      description: `Discovered from ${new URL(url).hostname}`,
      source: 'other',
      sourceUrl: url,
      components,
      active: true,
    };
  } catch (err) {
    console.warn('[library-registry] HTML fetch failed:', err);
    return null;
  }
}

/* ─── Main resolver (hybrid strategy) ──────────────────── */

export type ResolveStatus = 'resolving' | 'resolved' | 'error';

/**
 * Resolve a URL to a DesignLibrary using the hybrid strategy:
 * 1. Check curated registry (instant)
 * 2. Try Figma API (if Figma URL)
 * 3. Try GitHub API (if GitHub URL)
 * 4. Fall back to HTML fetch + parse
 */
export async function resolveLibrary(
  url: string,
  onStatus?: (status: ResolveStatus, message?: string) => void,
): Promise<DesignLibrary | null> {
  // 1. Curated registry — instant
  onStatus?.('resolving', 'Checking known libraries…');
  const curated = lookupRegistry(url);
  if (curated) {
    onStatus?.('resolved', `Matched ${curated.name} (${curated.components.length} components)`);
    return curated;
  }

  // 2. Figma API
  if (/figma\.com/i.test(url)) {
    onStatus?.('resolving', 'Reading Figma file…');
    const figmaLib = await fetchFromFigma(url);
    if (figmaLib && figmaLib.components.length > 0) {
      onStatus?.('resolved', `Found ${figmaLib.components.length} components from Figma`);
      return figmaLib;
    }
    // If Figma fetch returned nothing, don't fallback to HTML scraping
    onStatus?.('error', 'Could not read Figma file. Set VITE_FIGMA_TOKEN in your .env to enable Figma access.');
    return null;
  }

  // 3. GitHub API
  if (/github\.com/i.test(url)) {
    onStatus?.('resolving', 'Scanning GitHub repository…');
    const ghLib = await fetchFromGitHub(url);
    if (ghLib && ghLib.components.length > 0) {
      onStatus?.('resolved', `Found ${ghLib.components.length} components from GitHub`);
      return ghLib;
    }
  }

  // 4. HTML fetch + parse
  onStatus?.('resolving', 'Scanning page for components…');
  const htmlLib = await fetchFromHTML(url);
  if (htmlLib && htmlLib.components.length > 0) {
    onStatus?.('resolved', `Discovered ${htmlLib.components.length} components`);
    return htmlLib;
  }

  onStatus?.('error', 'No components found at this URL');
  return null;
}

/** Get all supported library names for display */
export function getSupportedLibraries(): string[] {
  return REGISTRY.map((e) => e.name).sort();
}

/** Get the full curated registry entries for the built-in panel */
export function getBuiltInEntries(): Array<{
  name: string;
  description: string;
  source: DesignLibrary['source'];
  sourceUrl: string;
  componentCount: number;
}> {
  return REGISTRY
    .map((e) => ({
      name: e.name,
      description: e.description,
      source: e.source,
      sourceUrl: e.sourceUrl,
      componentCount: e.components.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Instantiate a full DesignLibrary from a curated entry by name */
export function instantiateBuiltIn(name: string): DesignLibrary | null {
  const entry = REGISTRY.find((e) => e.name === name);
  if (!entry) return null;
  return {
    id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: entry.name,
    description: entry.description,
    source: entry.source,
    sourceUrl: entry.sourceUrl,
    components: entry.components,
    active: true,
  };
}
