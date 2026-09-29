import { Platform } from "react-native";

export const typography = {
  fontFamily: Platform.select({ ios: "System", android: "sans-serif", default: "sans-serif" }),
  fontFamilyMedium: Platform.select({ ios: "System", android: "sans-serif-medium", default: "sans-serif" }),
  fontFamilyBold: Platform.select({ ios: "System", android: "sans-serif", default: "sans-serif" }),
  sizes: {
    xs: 12,
    sm: 14,
    body: 16,
    md: 18,
    lg: 22,
    xl: 28,
    display: 34,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "900" as const,
  },
};

export type AppTypography = typeof typography;
