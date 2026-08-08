import React from "react";
import {
  Grid,
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import {
  ShoppingCart,
  Restaurant,
  AttachMoney,
  Inventory,
  Notifications as NotificationsIcon,
  ChevronRight,
  AccessTime,
} from "@mui/icons-material";

const GRADIENTS = {
  amber: "linear-gradient(135deg, #f59e0b, #b45309)",
  green: "linear-gradient(135deg, #22c55e, #16a34a)",
  blue: "linear-gradient(135deg, #3b82f6, #2563eb)",
  purple: "linear-gradient(135deg, #a855f7, #7c3aed)",
};

export default function AdminDashboardTab({
  adminOrders,
  adminProducts,
  notifications,
  setNotifications,
  setAdminActiveTab,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const pendingCount = adminOrders.filter((o) => o.orderStatus === "Pending").length;
  const preparingCount = adminOrders.filter((o) => o.orderStatus === "Preparing").length;
  const revenue = adminOrders
    .filter((o) => o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const metrics = [
    { label: "Pending Orders", value: pendingCount, icon: <ShoppingCart />, gradient: GRADIENTS.amber },
    { label: "Preparing", value: preparingCount, icon: <Restaurant />, gradient: GRADIENTS.purple },
    { label: "Total Revenue", value: `₹${revenue.toLocaleString()}`, icon: <AttachMoney />, gradient: GRADIENTS.green },
    { label: "Total Sweets", value: adminProducts.length, icon: <Inventory />, gradient: GRADIENTS.blue },
  ];

  return (
    <Stack spacing={4}>
      {/* Metric Cards */}
      <Grid container spacing={3}>
        {metrics.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: m.gradient,
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                cursor: "default",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {m.icon}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 28, fontWeight: 900, lineHeight: 1, mb: 0.5 }}>
                  {m.value}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {m.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Real-Time Order Notifications */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? "#13151e" : "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#22c55e",
                boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "text.primary" }}>
              Live Order Feed
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              SignalR WebSocket Active
            </Typography>
          </Stack>
          {notifications.length > 0 && (
            <Button size="small" color="error" onClick={() => setNotifications([])} sx={{ fontSize: 12 }}>
              Clear All
            </Button>
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <NotificationsIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.2, mb: 1 }} />
              <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                Waiting for incoming sweet orders...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {notifications.map((notif, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(180,83,9,0.08)" : "#fffbf2",
                    border: `1px solid ${isDark ? "rgba(180,83,9,0.15)" : "#fde68a"}`,
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: isDark ? "rgba(180,83,9,0.12)" : "#fef3c7" },
                  }}
                >
                  {/* Color accent */}
                  <Box sx={{ width: 4, alignSelf: "stretch", borderRadius: 2, bgcolor: "primary.main", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}>
                      Order: {notif.orderNumber}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {notif.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {notif.customerPhone}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5}>
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: "primary.main" }}>
                      ₹{notif.totalAmount}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setAdminActiveTab("orders")}
                      endIcon={<ChevronRight sx={{ fontSize: "14px !important" }} />}
                      sx={{ fontSize: 11, fontWeight: 600, p: 0 }}
                    >
                      Process
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}
