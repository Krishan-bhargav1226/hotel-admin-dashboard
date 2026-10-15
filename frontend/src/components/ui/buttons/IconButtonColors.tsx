import { colors } from "../../../utils/theme/colorTheme";

export const IconButtonIconColors = {
  WHITE: "#ffffff",
  BLACK: "#000000",
  YELLOW: "#fde68a",
} as const;

export const IconButtonBgColors = {
  RED: "#dc2626",
  BLUE: "#2563eb",
  GREEN: "#16a34a",
  ORANGE: "#f97316",
  PURPLE: "#7c3aed",
  GRAY: "#6b7280",
  PRIMARY: colors.primary,
  SECONDARY: colors.secondary,
} as const;

export type IconButtonIconColorKeys = keyof typeof IconButtonIconColors;
export type IconButtonBgColorKeys = keyof typeof IconButtonBgColors;
