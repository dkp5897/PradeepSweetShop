import { useState, useMemo } from "react";
import { ThemeContext } from "./themeMode";
import { readStored, writeStored } from "../storage";

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = readStored("theme_mode", "light");
    return saved === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      writeStored("theme_mode", next);
      return next;
    });
  };

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
