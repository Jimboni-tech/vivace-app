/**
 * App Theme Configuration
 * This file contains the global theme settings for the Vivace app
 */

// Base colors that can be used across the app
export const BASE_COLORS = {
  blue: {
    primary: '#3D9CFF',      // Main blue color
    dark: '#2D8BEE',         // Darker blue for highlights
    light: '#8CC5FF',        // Lighter blue (used in NotesModal)
    ultraLight: '#D6EBFF',   // Very light blue for subtle backgrounds
    pressed: '#216BB8',      // Color for pressed states
  },
  gray: {
    50: '#F7FAFC',           // Lightest gray, used for backgrounds
    100: '#E2E8F0',          // Very light gray, used for borders
    200: '#CBD5E0',          // Light gray, used for disabled states
    300: '#A0AEC0',          // Medium light gray
    400: '#718096',          // Medium gray, used for secondary text
    500: '#4A5568',          // Medium dark gray, used for primary text
    600: '#2D3748',          // Dark gray
    700: '#1A202C',          // Very dark gray
    800: '#121212',          // Almost black
  },
  white: '#FFFFFF',
  black: '#000000',
  red: {
    light: '#FEE2E2',        // Light red for error backgrounds
    primary: '#DC2626',      // Standard red for errors
    dark: '#B91C1C',         // Dark red for error text
  },
  green: {
    light: '#D1FAE5',        // Light green for success backgrounds
    primary: '#10B981',      // Standard green for success indicators
    dark: '#059669',         // Dark green for success text
  },
  yellow: {
    light: '#FEF3C7',        // Light yellow for warning backgrounds
    primary: '#F59E0B',      // Standard yellow for warnings
    dark: '#D97706',         // Dark yellow for warning text
  },
  transparent: 'transparent',
};

// Component-specific color scheme
export const DEFAULT_THEME = {
  // General UI
  common: {
    background: BASE_COLORS.white,
    text: BASE_COLORS.gray[500],
    textLight: BASE_COLORS.gray[400],
    headerBackground: BASE_COLORS.blue.primary,
    headerText: BASE_COLORS.white,
    iconActive: BASE_COLORS.blue.primary,
    iconInactive: BASE_COLORS.gray[400],
    divider: BASE_COLORS.gray[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: BASE_COLORS.gray[300],
  },
  
  // Navigation
  navigation: {
    tabBackground: BASE_COLORS.white,
    tabActiveText: BASE_COLORS.blue.primary,
    tabInactiveText: BASE_COLORS.gray[400],
    tabActiveIcon: BASE_COLORS.blue.primary,
    tabInactiveIcon: BASE_COLORS.gray[400],
    tabBorder: BASE_COLORS.gray[100],
    headerBackground: BASE_COLORS.blue.primary,
    headerText: BASE_COLORS.white,
    headerIcon: BASE_COLORS.white,
  },
  
  // Buttons
  button: {
    primaryBackground: BASE_COLORS.blue.primary,
    primaryText: BASE_COLORS.white,
    primaryPressed: BASE_COLORS.blue.pressed,
    secondaryBackground: BASE_COLORS.transparent,
    secondaryText: BASE_COLORS.blue.primary,
    secondaryBorder: BASE_COLORS.blue.primary,
    secondaryPressed: BASE_COLORS.blue.ultraLight,
    disabledBackground: BASE_COLORS.gray[200],
    disabledText: BASE_COLORS.gray[400],
    iconColor: BASE_COLORS.white,
  },
  
  // Form elements
  input: {
    background: BASE_COLORS.gray[50],
    text: BASE_COLORS.gray[500],
    placeholder: BASE_COLORS.gray[300],
    border: BASE_COLORS.gray[100],
    focusBorder: BASE_COLORS.blue.primary,
    label: BASE_COLORS.gray[500],
    error: BASE_COLORS.red.primary,
  },
  
  // Cards and sections
  card: {
    background: BASE_COLORS.white,
    border: BASE_COLORS.gray[100],
    title: BASE_COLORS.blue.primary,
    text: BASE_COLORS.gray[500],
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Modals and overlays
  modal: {
    background: BASE_COLORS.blue.primary,
    text: BASE_COLORS.white,
    input: {
      background: BASE_COLORS.blue.light,
      text: BASE_COLORS.white,
      border: 'rgba(255, 255, 255, 0.5)',
      placeholder: 'rgba(255, 255, 255, 0.6)',
    },
    button: {
      background: BASE_COLORS.white,
      text: BASE_COLORS.blue.primary,
    },
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Practice session specific
  practiceSession: {
    background: BASE_COLORS.blue.primary,
    timerText: BASE_COLORS.white,
    timerBackground: BASE_COLORS.transparent,
    controlBarBackground: BASE_COLORS.blue.primary,
    controlBarText: BASE_COLORS.white,
    controlBarIcon: BASE_COLORS.white,
    sessionBarBackground: BASE_COLORS.blue.primary,
    sessionBarText: BASE_COLORS.white,
    sessionBarIcon: BASE_COLORS.white,
  },
  
  // Status indicators
  status: {
    success: {
      background: BASE_COLORS.green.light,
      text: BASE_COLORS.green.dark,
      icon: BASE_COLORS.green.primary,
    },
    error: {
      background: BASE_COLORS.red.light,
      text: BASE_COLORS.red.dark,
      icon: BASE_COLORS.red.primary,
    },
    warning: {
      background: BASE_COLORS.yellow.light,
      text: BASE_COLORS.yellow.dark,
      icon: BASE_COLORS.yellow.primary,
    },
    info: {
      background: BASE_COLORS.blue.ultraLight,
      text: BASE_COLORS.blue.dark,
      icon: BASE_COLORS.blue.primary,
    },
  },
};

// Legacy COLORS object for backward compatibility
export const COLORS = {
  primary: BASE_COLORS.blue.primary,
  primaryDark: BASE_COLORS.blue.dark,
  background: BASE_COLORS.white,
  text: BASE_COLORS.gray[500],
  textLight: BASE_COLORS.gray[400],
  inputBg: BASE_COLORS.gray[50],
  inputBorder: BASE_COLORS.gray[100],
  error: BASE_COLORS.red.primary,
  success: BASE_COLORS.green.primary,
  warning: BASE_COLORS.yellow.primary,
  overlay: DEFAULT_THEME.common.overlay,
  black: BASE_COLORS.black,
  white: BASE_COLORS.white,
};

export const SIZES = {
  // Font sizes
  xxsmall: 10,
  xsmall: 12,
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  xxxlarge: 30,

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16, 
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 30,
    round: 999, // For fully rounded elements
  }
};

export const FONTS = {
  regular: {
    fontFamily: 'Nunito-Regular',
  },
  medium: {
    fontFamily: 'Nunito-Medium',
  },
  semiBold: {
    fontFamily: 'Nunito-SemiBold',
  },
  bold: {
    fontFamily: 'Nunito-Bold',
  },
  extraBold: {
    fontFamily: 'Nunito-ExtraBold',
  },
  black: {
    fontFamily: 'Nunito-Black',
  },
  light: {
    fontFamily: 'Nunito-Light',
  },
  italic: {
    fontFamily: 'Nunito-Italic',
  },

  // Text styles
  h1: {
    fontFamily: 'Nunito-Bold',
    fontSize: SIZES.xxxlarge,
    lineHeight: 38,
  },
  h2: {
    fontFamily: 'Nunito-Bold',
    fontSize: SIZES.xxlarge,
    lineHeight: 32,
  },
  h3: {
    fontFamily: 'Nunito-Bold',
    fontSize: SIZES.xlarge,
    lineHeight: 28,
  },
  h4: {
    fontFamily: 'Nunito-Bold', 
    fontSize: SIZES.large,
    lineHeight: 24,
  },
  body1: {
    fontFamily: 'Nunito-Regular',
    fontSize: SIZES.medium,
    lineHeight: 24,
  },
  body2: {
    fontFamily: 'Nunito-Regular',
    fontSize: SIZES.small,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Nunito-Regular',
    fontSize: SIZES.xsmall,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Nunito-Bold',
    fontSize: SIZES.medium,
    lineHeight: 24,
  },
};

const theme = { COLORS, SIZES, FONTS, BASE_COLORS, DEFAULT_THEME };

export default theme;
