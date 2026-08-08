import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Container,
  Stack,
  Box,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  ShoppingCart,
  Store,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { useThemeMode } from "../context/ThemeContext";

export default function Navbar({ currentPage, setCurrentPage, cart, setIsCartOpen, fetchProducts, adminToken }) {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isDark = mode === "dark";
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: isDark ? "rgba(15,17,23,0.85)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 0.5 }}>

          {/* Brand Logo */}
          <Box
            onClick={() => setCurrentPage("home")}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
          >
            <Store sx={{ color: "primary.main", fontSize: 32 }} />
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "text.primary", letterSpacing: -0.5, lineHeight: 1.1 }}
              >
                Pradeep Sweets
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "primary.main",
                }}
              >
                House
              </Typography>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {[
              { key: "home", label: "Home" },
              { key: "shop", label: "Menu Shop", onClick: () => { setCurrentPage("shop"); fetchProducts(); } },
              { key: "track", label: "Track Order" },
            ].map((nav) => (
              <Button
                key={nav.key}
                onClick={nav.onClick || (() => setCurrentPage(nav.key))}
                sx={{
                  color: currentPage === nav.key ? "primary.main" : "text.secondary",
                  fontWeight: currentPage === nav.key ? 700 : 500,
                  position: "relative",
                  "&::after": currentPage === nav.key ? {
                    content: '""',
                    position: "absolute",
                    bottom: 4,
                    left: "20%",
                    right: "20%",
                    height: 2,
                    borderRadius: 1,
                    bgcolor: "primary.main",
                  } : {},
                }}
              >
                {nav.label}
              </Button>
            ))}

            {adminToken ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setCurrentPage("admin")}
                size="small"
                sx={{ borderRadius: 20, px: 2 }}
              >
                Admin Panel
              </Button>
            ) : (
              <Button color="inherit" onClick={() => setCurrentPage("admin-login")} sx={{ color: "text.secondary" }}>
                Admin Login
              </Button>
            )}
          </Stack>

          {/* Right Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Dark/Light Toggle */}
            <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: isDark ? "#fbbf24" : "#64748b",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(251,191,36,0.1)" : "rgba(100,116,139,0.1)",
                    transform: "rotate(30deg)",
                  },
                }}
              >
                {isDark ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            {/* Cart */}
            <IconButton
              onClick={() => setIsCartOpen(true)}
              sx={{
                bgcolor: isDark ? "rgba(180,83,9,0.15)" : "primary.light",
                color: isDark ? "#fbbf24" : "primary.dark",
                "&:hover": { bgcolor: isDark ? "rgba(180,83,9,0.25)" : "#fde68a" },
                p: 1.25,
              }}
            >
              <Badge badgeContent={cartItemCount} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Stack>

        </Toolbar>
      </Container>
    </AppBar>
  );
}
