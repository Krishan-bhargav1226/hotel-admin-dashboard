/** @type {import('tailwindcss').Config} */

import { colors } from "./src/utils/theme/colorTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(39, 29, 25, 0.035), 0 10px 28px rgba(39, 29, 25, 0.05)",
        panel: "0 1px 2px rgba(39, 29, 25, 0.035), 0 4px 14px rgba(39, 29, 25, 0.035)",
      },
    },
  },
  plugins: [],
};
