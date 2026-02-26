export const colors = {
  surface: {
    50: 'oklch(0.985 0 0)',
    100: 'oklch(0.97 0 0)',
    200: 'oklch(0.92 0 0)',
    300: 'oklch(0.87 0 0)',
    400: 'oklch(0.71 0 0)',
    500: 'oklch(0.55 0 0)',
    600: 'oklch(0.43 0 0)',
    700: 'oklch(0.37 0 0)',
    800: 'oklch(0.28 0 0)',
    900: 'oklch(0.205 0 0)',
    950: 'oklch(0.145 0 0)',
  },
  accent: {
    blue: 'oklch(0.67 0.185 55)',
    red: 'oklch(0.63 0.25 29)',
    green: 'oklch(0.72 0.19 155)',
    yellow: 'oklch(0.78 0.18 80)',
    purple: 'oklch(0.55 0.28 310)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const typography = {
  xs: { size: '12px', lineHeight: '16px' },
  sm: { size: '14px', lineHeight: '20px' },
  base: { size: '16px', lineHeight: '24px' },
  lg: { size: '18px', lineHeight: '28px' },
  xl: { size: '20px', lineHeight: '28px' },
  '2xl': { size: '24px', lineHeight: '32px' },
} as const;

export const shadows = {
  panel: '0 4px 6px oklch(0 0 0 / 0.1)',
  elevated: '0 8px 16px oklch(0 0 0 / 0.15)',
  sm: '0 1px 2px oklch(0 0 0 / 0.05)',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const;
