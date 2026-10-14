export const lightTheme = {
  blue: "#1769df",
  primary: "#1769df",
  ink: "#202b39",
  muted: "#6e7c8f",
  bg: "#f7f9fe",
  border: "#e0e6ef",
  green: "#209c78",
  red: "#d94e60",
  surface: "#ffffff",
  softBlue: "#eaf2ff",
  softRed: "#feedef",
  dark: false,
};
export type AppTheme = typeof lightTheme;
export const darkTheme: AppTheme = {
  blue: "#80b2ff",
  primary: "#1769df",
  ink: "#edf3fc",
  muted: "#a8b6cc",
  bg: "#101827",
  border: "#35445b",
  green: "#63d4ac",
  red: "#ff91a2",
  surface: "#1c283b",
  softBlue: "#253c5d",
  softRed: "#4a2937",
  dark: true,
};
// Default palette for non-rendering consumers.
export const theme = lightTheme;
