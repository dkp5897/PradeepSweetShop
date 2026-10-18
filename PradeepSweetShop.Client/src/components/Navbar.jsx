
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
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  ShoppingCart,
  Store,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useThemeMode } from "../context/themeMode";
import { useState } from "react";

export default function Navbar({ currentPage, setCurrentPage, cart, setIsCartOpen, fetchProducts, adminToken }) {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isDark = mode === "dark";
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [menuAnchor, setMenuAnchor] = useState(null);

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
            component="button"
            aria-label="Pradeep Sweets home"
            onClick={() => setCurrentPage("home")}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", border: 0, background: "transparent", textAlign: "left", p: 0 }}
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
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconButton aria-label="Open navigation menu" aria-controls={menuAnchor ? "mobile-navigation" : undefined} aria-expanded={!!menuAnchor} onClick={event => setMenuAnchor(event.currentTarget)} sx={{ display: { md: "none" } }}><MenuIcon /></IconButton>
            <Menu id="mobile-navigation" anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
              {[{ page: "home", label: "Home" }, { page: "shop", label: "Menu Shop" }, { page: "track", label: "Track Order" }, { page: adminToken ? "admin" : "admin-login", label: adminToken ? "Admin Panel" : "Admin Login" }].map(item => <MenuItem key={item.page} onClick={() => { setCurrentPage(item.page); if (item.page === "shop") fetchProducts(); setMenuAnchor(null); }}>{item.label}</MenuItem>)}
            </Menu>
            {/* Dark/Light Toggle */}
            <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
              aria-label={`Open cart, ${cartItemCount} items`}
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
