import { lightColors, darkColors } from "./colors";

export const lightTheme = {
  dark: false,
  colors: lightColors,
};

export const darkTheme = {
  dark: true,
  colors: darkColors,
};

export type AppTheme = typeof darkTheme;