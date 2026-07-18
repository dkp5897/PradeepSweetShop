import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#b45309", // Warm Amber Gold
      light: "#fef3c7",
      dark: "#78350f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1e293b", // Slate Charcoal
      light: "#475569",
      dark: "#0f172a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#faf8f5", // Creamy Vanilla Off-White
      paper: "#ffffff",
    },
    success: {
      main: "#16a34a",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#2563eb",
    },
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
          boxShadow: "0 4px 20px rgba(180, 83, 9, 0.05)",
          border: "1px solid #f1f5f9",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: "#f8fafc",
        },
      },
    },
  },
});

export default theme;
