import { createTheme, PaletteOptions } from "@mui/material/styles";

import { ThemeMode } from "./hooks/useThemeMode";

// Samostatný (standalone) motiv – dříve se načítal z hostitelské konfigurace (window.top.env.themeV7).
const lightPalette: PaletteOptions = {
  mode: "light",
  primary: { main: "#19405e", contrastText: "#EEF5FA" },
  secondary: { main: "#f18811", contrastText: "#EEF5FA" },
  error: { main: "#e1313d" },
  success: { main: "#429e9d" },
  info: { main: "#4b7ca5" },
  warning: { main: "#e15b31" },
  background: { default: "#f5fcff", paper: "#ffffff" },
  text: { primary: "#19405e", secondary: "#19405e" },
  divider: "#dde7ee",
};

const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: { main: "#5b9bd5", contrastText: "#0d1b26" },
  secondary: { main: "#f18811", contrastText: "#0d1b26" },
  error: { main: "#e1313d" },
  success: { main: "#429e9d" },
  info: { main: "#6e95b6" },
  warning: { main: "#e15b31" },
  background: { default: "#0f1b24", paper: "#16242f" },
  text: { primary: "#e6eef5", secondary: "#aac2d4" },
  divider: "#2a3a47",
};

const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    palette: mode === "dark" ? darkPalette : lightPalette,
    typography: {
      fontFamily: "proxima-nova, sans-serif",
      fontWeightRegular: 300,
      fontWeightMedium: 600,
      fontWeightBold: 800,
    },
  });

export default createAppTheme;
