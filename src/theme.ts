// MTS Design System tokens
// Colors extracted from Figma file + mts.ru design tokens
export const Colors = {
  // Background
  bg: '#1D2023',           // greyscale-800 — основной фон
  bgCard: '#2C3135',       // greyscale-700 — карточки
  bgCardDim: 'rgba(98,108,119,0.25)',  // greyscale-500 @25% — тонированные элементы

  // Brand
  red: '#FF0032',          // brand-mts-red
  redDim: 'rgba(255,0,50,0.12)',

  // Accent
  green: '#26CD58',        // apple-normal / accent-positive
  greenDim: 'rgba(38,205,88,0.12)',

  // Purple (for premium/highlights in this file)
  primary: '#8F8FFF',      // from Figma catalog fills
  primaryDim: 'rgba(143,143,255,0.15)',

  // Text
  text: '#FAFAFA',         // primary text
  textSecondary: '#969FA8', // greyscale-400
  textTertiary: '#626C77', // greyscale-500
  white: '#FFFFFF',

  // Borders / overlays
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  primaryBorder: 'rgba(143,143,255,0.35)',
  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(127,140,153,0.35)',  // from Figma fills

  // Elevated backgrounds
  bgSheet: '#252A2E',
  bgCardHover: '#363D42',
};

export const Gradients = {
  topHero: ['#3A2D8A', '#1D2023'] as const,
  topHeroAlpha: ['rgba(88,70,200,0.9)', 'rgba(29,32,35,0)'] as const,
  cardPrimary: ['#2C3135', '#1D2023'] as const,
};

// MTS Spacing tokens (from mts.ru CSS)
export const Spacing = {
  xs: 4,    // size-spacing-4
  sm: 8,    // size-spacing-8
  md: 12,   // size-spacing-12
  lg: 16,   // size-spacing-16
  xl: 20,
  xxl: 24,  // size-spacing-24
  xxxl: 32, // size-spacing-32
  xxxxl: 40,// size-spacing-40
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// MTS Font Families
export const Fonts = {
  wide: 'MTSWide-Medium',
  wideBold: 'MTSWide-Bold',
  compact: 'MTSCompact-Regular',
  compactMedium: 'MTSCompact-Medium',
};

// MTS Typography — exact values from Figma
export const Typography = {
  // MTS Wide — headings
  h1:           { fontFamily: 'MTSWide-Bold',     fontSize: 32, lineHeight: 36, fontWeight: '700' as const },
  h2:           { fontFamily: 'MTSWide-Bold',     fontSize: 24, lineHeight: 28, fontWeight: '700' as const },
  h3:           { fontFamily: 'MTSWide-Medium',   fontSize: 20, lineHeight: 24, fontWeight: '500' as const },
  title:        { fontFamily: 'MTSWide-Medium',   fontSize: 24, lineHeight: 28, fontWeight: '500' as const },
  sectionTitle: { fontFamily: 'MTSWide-Medium',   fontSize: 20, lineHeight: 24, fontWeight: '500' as const },
  label:        { fontFamily: 'MTSWide-Bold',     fontSize: 10, lineHeight: 12, fontWeight: '700' as const, letterSpacing: 0.5 },
  button:       { fontFamily: 'MTSWide-Bold',     fontSize: 12, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.6 },

  // MTS Compact — body
  bodyLargeBold:{ fontFamily: 'MTSCompact-Medium',  fontSize: 17, lineHeight: 24, fontWeight: '500' as const },
  bodyLarge:    { fontFamily: 'MTSCompact-Regular', fontSize: 17, lineHeight: 20, fontWeight: '400' as const },
  body:         { fontFamily: 'MTSCompact-Regular', fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  bodyMedium:   { fontFamily: 'MTSCompact-Medium',  fontSize: 15, lineHeight: 20, fontWeight: '500' as const },
  cardValue:    { fontFamily: 'MTSCompact-Medium',  fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  cardSubtitle: { fontFamily: 'MTSCompact-Regular', fontSize: 14, lineHeight: 18, fontWeight: '400' as const },
  caption:      { fontFamily: 'MTSCompact-Regular', fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  captionMedium:{ fontFamily: 'MTSCompact-Medium',  fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  chip:         { fontFamily: 'MTSCompact-Regular', fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  badge:        { fontFamily: 'MTSCompact-Medium',  fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  tiny:         { fontFamily: 'MTSCompact-Regular', fontSize: 10, lineHeight: 14, fontWeight: '400' as const },

  // Fallback (system, e.g. status bar)
  mono: { fontSize: 12, lineHeight: 21, fontWeight: '500' as const },
};
