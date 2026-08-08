import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  useTheme,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  Layers,
  ExitToApp,
  Refresh,
  RateReview,
  DarkMode,
  LightMode,
  Store,
  Home,
} from "@mui/icons-material";
import { useThemeMode } from "../../context/ThemeContext";
import AdminDashboardTab from "./AdminDashboardTab";
import AdminOrdersTab from "./AdminOrdersTab";
import AdminProductsTab from "./AdminProductsTab";
import AdminCategoriesTab from "./AdminCategoriesTab";
import AdminReviewsTab from "./AdminReviewsTab";

const SIDEBAR_WIDTH = 260;

const NAV_ITEMS = [
  { value: "dashboard", label: "Dashboard", icon: TrendingUp },
  { value: "orders", label: "Orders", icon: ShoppingCart },
  { value: "products", label: "Products", icon: Inventory },
  { value: "categories", label: "Categories", icon: Layers },
  { value: "reviews", label: "Reviews", icon: RateReview },
];

export default function AdminPortal({
  adminUser,
  handleAdminLogout,
  adminActiveTab,
  setAdminActiveTab,
  adminOrders,
  adminProducts,
  adminCategories,
  fetchAdminData,
  notifications,
  setNotifications,
  orderFilter,
  setOrderFilter,
  setCurrentPage,
}) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";
  const pendingCount = adminOrders.filter((o) => o.orderStatus === "Pending").length;

  useEffect(() => {
    fetchAdminData();
  }, [adminActiveTab]);

  const initials = adminUser?.fullName
    ? adminUser.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "A";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ─── SIDEBAR ─── */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: isDark ? "#13151e" : "#fff",
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Sidebar Header / Brand */}
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            cursor: "pointer",
          }}
          onClick={() => setCurrentPage("home")}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 15, color: "text.primary", lineHeight: 1.2 }}>
              Pradeep Sweets
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "primary.main", textTransform: "uppercase", letterSpacing: 1 }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flex: 1, py: 2, px: 1.5 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "text.secondary",
              px: 1.5,
              mb: 1.5,
            }}
          >
            Navigation
          </Typography>

          <Stack spacing={0.5}>
            {NAV_ITEMS.map((item) => {
              const isActive = adminActiveTab === item.value;
              const Icon = item.icon;
              return (
                <Box
                  key={item.value}
                  onClick={() => setAdminActiveTab(item.value)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    cursor: "pointer",
                    position: "relative",
                    bgcolor: isActive
                      ? isDark ? "rgba(180,83,9,0.15)" : "rgba(180,83,9,0.08)"
                      : "transparent",
                    color: isActive ? "primary.main" : "text.secondary",
                    fontWeight: isActive ? 700 : 500,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: isActive
                        ? isDark ? "rgba(180,83,9,0.2)" : "rgba(180,83,9,0.12)"
                        : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    },
                    "&::before": isActive ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                    } : {},
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: "inherit" }}>
                    {item.label}
                  </Typography>
                  {item.value === "orders" && pendingCount > 0 && (
                    <Badge
                      badgeContent={pendingCount}
                      color="warning"
                      sx={{ ml: "auto", "& .MuiBadge-badge": { fontSize: 10, height: 18, minWidth: 18 } }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Sidebar Footer — User Info */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 700,
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              color: "#fff",
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", lineHeight: 1.2 }} noWrap>
              {adminUser?.fullName || "Admin"}
            </Typography>
            <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
              Administrator
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleAdminLogout} sx={{ color: "error.main" }}>
              <ExitToApp fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top Bar */}
        <Box
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "rgba(19,21,30,0.6)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
              {NAV_ITEMS.find((n) => n.value === adminActiveTab)?.label || "Dashboard"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Manage your sweet shop operations
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Go to Store">
              <IconButton onClick={() => setCurrentPage("home")} sx={{ color: "text.secondary" }}>
                <Home />
              </IconButton>
            </Tooltip>
            <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: isDark ? "#fbbf24" : "text.secondary",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "rotate(30deg)" },
                }}
              >
                {isDark ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={fetchAdminData}
              sx={{
                borderRadius: 20,
                borderColor: theme.palette.divider,
                color: "text.secondary",
                fontWeight: 600,
                fontSize: 12,
                "&:hover": { borderColor: "primary.main", color: "primary.main" },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        {/* Page Content */}
        <Box sx={{ p: 4, flex: 1 }}>
          {adminActiveTab === "dashboard" && (
            <AdminDashboardTab
              adminOrders={adminOrders}
              adminProducts={adminProducts}
              notifications={notifications}
              setNotifications={setNotifications}
              setAdminActiveTab={setAdminActiveTab}
            />
          )}
          {adminActiveTab === "orders" && (
            <AdminOrdersTab
              adminOrders={adminOrders}
              fetchAdminData={fetchAdminData}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
            />
          )}
          {adminActiveTab === "products" && (
            <AdminProductsTab
              adminProducts={adminProducts}
              adminCategories={adminCategories}
              fetchAdminData={fetchAdminData}
            />
          )}
          {adminActiveTab === "categories" && (
            <AdminCategoriesTab
              adminCategories={adminCategories}
              fetchAdminData={fetchAdminData}
            />
          )}
          {adminActiveTab === "reviews" && (
            <AdminReviewsTab />
          )}
        </Box>
      </Box>
    </Box>
  );
}
