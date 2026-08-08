import { createTheme } from "@mui/material";

export default function getTheme(mode) {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#b45309",
        light: isLight ? "#fef3c7" : "#3d2a10",
        dark: "#78350f",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isLight ? "#1e293b" : "#e2e8f0",
        light: isLight ? "#475569" : "#94a3b8",
        dark: isLight ? "#0f172a" : "#f8fafc",
        contrastText: "#ffffff",
      },
      background: {
        default: isLight ? "#faf8f5" : "#0f1117",
        paper: isLight ? "#ffffff" : "#1a1d27",
      },
      text: {
        primary: isLight ? "#0f172a" : "#e2e8f0",
        secondary: isLight ? "#64748b" : "#94a3b8",
      },
      divider: isLight ? "#f1f5f9" : "rgba(255,255,255,0.08)",
      success: { main: "#16a34a" },
      error: { main: "#ef4444" },
      warning: { main: "#f59e0b" },
      info: { main: "#2563eb" },
    },
    typography: {
      fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
      h1: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 },
      h2: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 750 },
      h3: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 },
      h4: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 },
      h5: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 },
      h6: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 18px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isLight
              ? "0 4px 20px rgba(180, 83, 9, 0.05)"
              : "0 4px 20px rgba(0, 0, 0, 0.3)",
            border: `1px solid ${isLight ? "#f1f5f9" : "rgba(255,255,255,0.06)"}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            backgroundColor: isLight ? "#f8fafc" : "#1e2130",
            color: isLight ? "#475569" : "#94a3b8",
          },
          root: {
            borderColor: isLight ? "#f1f5f9" : "rgba(255,255,255,0.06)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: isLight ? "#ffffff" : "#1a1d27",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}
