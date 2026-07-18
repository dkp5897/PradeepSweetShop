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
} from "@mui/material";
import {
  ShoppingCart,
  Store,
} from "@mui/icons-material";

export default function Navbar({ currentPage, setCurrentPage, cart, setIsCartOpen, fetchProducts, adminToken }) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={1}
      sx={{ bgcolor: "background.paper", borderBottom: "1px solid #f1f5f9" }}
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
                sx={{ fontWeight: 800, color: "secondary.dark", letterSpacing: -0.5, lineHeight: 1.1 }}
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
            spacing={3}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            <Button
              color={currentPage === "home" ? "primary" : "inherit"}
              onClick={() => {
                setCurrentPage("home");
              }}
            >
              Home
            </Button>
            <Button
              color={currentPage === "shop" ? "primary" : "inherit"}
              onClick={() => {
                setCurrentPage("shop");
                fetchProducts();
              }}
            >
              Menu Shop
            </Button>
            <Button
              color={currentPage === "track" ? "primary" : "inherit"}
              onClick={() => setCurrentPage("track")}
            >
              Track Order
            </Button>
            {adminToken ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setCurrentPage("admin")}
                size="small"
              >
                Admin Panel
              </Button>
            ) : (
              <Button color="inherit" onClick={() => setCurrentPage("admin-login")}>
                Admin Login
              </Button>
            )}
          </Stack>

          {/* Cart Icon Button */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setIsCartOpen(true)}
              sx={{
                bgcolor: "primary.light",
                color: "primary.dark",
                "&:hover": { bgcolor: "#fde68a" },
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
