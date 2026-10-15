import { createTheme, type PaletteMode } from "@mui/material/styles";

export const colors = {
  primary: "#356B4F",
  secondary: "#66746B",
  success: "#2F7A55",
  danger: "#C94F5D",
  warning: "#B8792E",
  info: "#557D8A",
  surface: "#F4F5F1",
  ink: "#202923",
  line: "#E2E7E0",
  brand: {
    50: "#EFF6F0",
    100: "#DDECE0",
    200: "#C0D9C7",
    300: "#97BFA4",
    400: "#6E9D7F",
    500: "#4E8264",
    600: "#356B4F",
    700: "#2B573F",
    800: "#244834",
    900: "#1D3A2C",
    950: "#10271D",
  },

  sidebar: {
    bg: "#FFFFFF",
    text: "#202923",
    textMuted: "#66746B",
  },

  status: {
    available: "#2F7A55",
    occupied: "#C94F5D",
    cleaning: "#B8792E",
    maintenance: "#66746B",
  },
};

export function createAppTheme(mode: PaletteMode = "light") {
  const dark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary, contrastText: "#FFFFFF" },
      success: { main: colors.success },
      error: { main: colors.danger },
      warning: { main: colors.warning },
      info: { main: colors.info },
      background: {
        default: dark ? "#111713" : colors.surface,
        paper: dark ? "#19221C" : "#FFFFFF",
      },
      text: {
        primary: dark ? "#EDF3EE" : colors.ink,
        secondary: dark ? "#A0AEA3" : colors.secondary,
      },
      divider: dark ? "#313D34" : colors.line,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            textTransform: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: dark ? "#19221C" : "#FFFFFF",
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: dark ? "#526156" : "#C5D0C7" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary, borderWidth: 1 },
          },
          notchedOutline: { borderColor: dark ? "#39483D" : colors.line },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${dark ? "#313D34" : colors.line}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: dark ? "#313D34" : colors.line },
        },
      },
    },
  });
}

export const colorTheme = createAppTheme("light");
