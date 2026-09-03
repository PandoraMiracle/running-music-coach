/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  bg: '#0B1324',
  bgElevated: '#121C31',
  card: '#162033',
  cardBorder: '#243049',
  text: '#F4F7FB',
  muted: '#8B97AB',
  accent: '#2EE59D',
  accentDim: '#163F32',
  blue: '#5B8CFF',
  warning: '#FFB020',
  danger: '#FF5C7A',
} as const;

export const Colors = {
  light: {
    text: '#0B1324',
    background: '#F4F7FB',
    backgroundElement: '#E7EDF6',
    backgroundSelected: '#D7E1EE',
    textSecondary: '#5B6B82',
  },
  dark: {
    text: Palette.text,
    background: Palette.bg,
    backgroundElement: Palette.card,
    backgroundSelected: Palette.bgElevated,
    textSecondary: Palette.muted,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
