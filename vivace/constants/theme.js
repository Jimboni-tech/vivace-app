/**
 * App Theme Configuration
 * This file contains the global theme settings for the Vivace app
 */

export const COLORS = {
  primary: '#3D9CFF',        // Main blue color
  primaryDark: '#2D8BEE',    // Darker blue for highlights
  background: '#FFFFFF',     // Background color
  text: '#4A5568',           // Main text color
  textLight: '#718096',      // Secondary text color
  inputBg: '#F7FAFC',        // Background for input fields
  inputBorder: '#E2E8F0',    // Border for inputs
  error: '#DC2626',          // Error color
  success: '#10B981',        // Success color
  warning: '#F59E0B',        // Warning color
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay color
  black: '#000000',
  white: '#FFFFFF',
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

const theme = { COLORS, SIZES, FONTS };

export default theme;
