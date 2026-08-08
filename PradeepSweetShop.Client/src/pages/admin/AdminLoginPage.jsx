import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import { Store, DarkMode, LightMode } from "@mui/icons-material";
import { useThemeMode } from "../../context/ThemeContext";
import { api } from "../../api";

export default function AdminLoginPage({ setAdminUser, setAdminToken, setCurrentPage }) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.loginAdmin(username, password);
      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_user", JSON.stringify({ username: response.username, fullName: response.fullName }));
      setAdminToken(response.token);
      setAdminUser({ username: response.username, fullName: response.fullName });
      setCurrentPage("admin");
    } catch (err) {
      setError(err.message || "Unauthorized. Please check username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Theme Toggle */}
      <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            color: isDark ? "#fbbf24" : "#64748b",
            "&:hover": { transform: "rotate(30deg)" },
            transition: "all 0.3s ease",
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>

      {/* Back to Store */}
      <Button
        onClick={() => setCurrentPage("home")}
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          color: "text.secondary",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ← Back to Store
      </Button>

      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "rgba(26,29,39,0.8)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Stack alignItems="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: "linear-gradient(135deg, #b45309, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                boxShadow: "0 8px 20px rgba(180,83,9,0.3)",
              }}
            >
              <Store sx={{ color: "#fff", fontSize: 30 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
              Admin Access
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, textAlign: "center" }}>
              Sign in to manage your sweet shop
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              fullWidth label="Username" required size="small"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth label="Password" type="password" required size="small"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 15,
                background: "linear-gradient(135deg, #b45309, #f59e0b)",
                boxShadow: "0 4px 12px rgba(180,83,9,0.3)",
                "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)", boxShadow: "0 6px 16px rgba(180,83,9,0.4)" },
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
