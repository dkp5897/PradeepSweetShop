import React, { createContext, useContext, useState, useMemo } from "react";

const ThemeContext = createContext();

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("theme_mode");
    return saved === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme_mode", next);
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
