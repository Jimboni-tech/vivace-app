# Vivace App Font and Theme Guide

## Font System

Vivace uses the Nunito font family across the entire application. Nunito is a rounded, friendly, and legible font that works great for iOS apps.

## Font Variants

The following Nunito font variants are available throughout the app:

- `Nunito-Regular`: For normal text
- `Nunito-Medium`: For slightly emphasized text
- `Nunito-SemiBold`: For medium emphasis
- `Nunito-Bold`: For strong emphasis
- `Nunito-ExtraBold`: For very strong emphasis
- `Nunito-Black`: For headings and titles
- `Nunito-Light`: For lighter text
- `Nunito-Italic`: For italic text

## Using the Theme

The app has a centralized theme system in `constants/theme.js`. Always use this theme for consistent styling across the app.

### Importing the Theme

```javascript
import { COLORS, FONTS, SIZES } from "../constants/theme";
```

### Using Theme Colors

```javascript
<View style={{ backgroundColor: COLORS.primary }}>
  <Text style={{ color: COLORS.text }}>Some text</Text>
</View>
```

### Using Theme Fonts

```javascript
<Text style={FONTS.h1}>Heading 1</Text>
<Text style={FONTS.body1}>Regular body text</Text>
<Text style={FONTS.button}>Button text</Text>
```

### Using Specific Font Families

```javascript
<Text style={{ ...FONTS.bold, fontSize: 16 }}>Bold text</Text>
<Text style={{ ...FONTS.regular, fontSize: 14 }}>Regular text</Text>
```

### Using Theme Sizes

```javascript
<View style={{ padding: SIZES.spacing.md }}>
  <Text style={{ fontSize: SIZES.large }}>Large text</Text>
</View>
```

### Combining Theme Properties in StyleSheet

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.spacing.sm,
  },
  content: {
    ...FONTS.body1,
    color: COLORS.text,
  },
});
```

## Best Practices

1. Always use the theme system instead of hardcoding colors, font families, or sizes
2. Use the predefined text styles (h1, h2, body1, etc.) when possible
3. For custom text styles, use the font family presets and customize size as needed
4. Maintain consistency by using the spacing and radius values from the theme
