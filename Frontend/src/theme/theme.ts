import { lightColors, darkColors } from "./colors";
import { typography } from "./typography";

export const lightTheme = {
  dark: false,
  colors: lightColors,
  typography,
};

export const darkTheme = {
  dark: true,
  colors: darkColors,
  typography,
};

export type AppTheme = typeof darkTheme;