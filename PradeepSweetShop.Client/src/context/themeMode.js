import { createContext, useContext } from "react";
export const ThemeContext = createContext();
export function useThemeMode() { return useContext(ThemeContext); }
