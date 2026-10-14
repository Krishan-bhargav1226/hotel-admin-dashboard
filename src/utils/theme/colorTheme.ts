import { createTheme } from "@mui/material/styles";

export const colors = {
  primary: "#27336B",
  secondary: "#E8A33D",
  success: "#1E9E6A",
  danger: "#D64545",
  warning: "#E8A33D",
  info: "#2D8FD6",
  surface: "#F2F4F8",

  sidebar: {
    bg: "#141B3D",
    text: "#ffffff",
    textMuted: "#9AA3C7",
  },

  status: {
    available: "#1E9E6A",
    occupied: "#D64545",
    cleaning: "#2D8FD6",
    maintenance: "#7B8794",
  },
};

export const colorTheme = createTheme({
  palette: {
    primary: { main: colors.primary },
    secondary: { main: colors.secondary, contrastText: "#1A1F3D" },
    success: { main: colors.success },
    error: { main: colors.danger },
    warning: { main: colors.warning },
    info: { main: colors.info },
    background: { default: colors.surface },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});
