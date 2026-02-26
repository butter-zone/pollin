export const colors = {
  surface: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  accent: {
    blue: '#0066ff',
    red: '#ff5555',
    green: '#00dd44',
    yellow: '#ffaa00',
    purple: '#bb00ff',
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
  panel: '0 4px 6px rgba(0, 0, 0, 0.1)',
  elevated: '0 8px 16px rgba(0, 0, 0, 0.15)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const;
