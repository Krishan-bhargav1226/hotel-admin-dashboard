import { createTheme, type PaletteMode } from "@mui/material/styles";

export const colors = {
  primary: "#E97252",
  secondary: "#76716D",
  success: "#2F7A55",
  danger: "#D85D5D",
  warning: "#C9853D",
  info: "#64869B",
  surface: "#F8F7F6",
  ink: "#24211F",
  line: "#EAE6E3",
  brand: {
    50: "#FFF4F0",
    100: "#FFE6DD",
    200: "#FFC9B8",
    300: "#F8A98F",
    400: "#F18B6D",
    500: "#E97252",
    600: "#DC6042",
    700: "#BC4931",
    800: "#993A29",
    900: "#783125",
    950: "#421B16",
  },

  sidebar: {
    bg: "#FFFFFF",
    text: "#24211F",
    textMuted: "#76716D",
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
  const primary = dark ? "#F18B6D" : colors.primary;

  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: colors.secondary, contrastText: "#FFFFFF" },
      success: { main: colors.success },
      error: { main: colors.danger },
      warning: { main: colors.warning },
      info: { main: colors.info },
      background: {
        default: dark ? "#151413" : colors.surface,
        paper: dark ? "#201E1C" : "#FFFFFF",
      },
      text: {
        primary: dark ? "#F1EEEC" : colors.ink,
        secondary: dark ? "#B5AEAA" : colors.secondary,
      },
      divider: dark ? "#383330" : colors.line,
    },
    shape: { borderRadius: 12 },
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
            backgroundColor: dark ? "#201E1C" : "#FFFFFF",
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: dark ? "#66564F" : "#D9C7C0" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: primary, borderWidth: 1 },
          },
          notchedOutline: { borderColor: dark ? "#49413D" : colors.line },
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
            border: `1px solid ${dark ? "#383330" : colors.line}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: dark ? "#383330" : colors.line },
        },
      },
    },
  });
}

export const colorTheme = createAppTheme("light");
