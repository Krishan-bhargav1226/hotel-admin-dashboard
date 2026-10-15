import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createAppTheme } from "./colorTheme";
import { ThemeModeContext, type ThemePreference } from "./themeContext";

const STORAGE_KEY = "hotel-admin-theme";

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
  });
  const [system, setSystem] = useState<"light" | "dark">(systemTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolved = preference === "system" ? system : preference;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference, resolved]);

  const theme = useMemo(() => createAppTheme(resolved), [resolved]);
  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
