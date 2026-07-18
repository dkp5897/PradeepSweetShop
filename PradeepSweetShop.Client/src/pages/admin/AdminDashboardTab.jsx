import React from "react";
import {
  Grid,
  Box,
  Typography,
  Stack,
  Paper,
  Avatar,
  Button,
} from "@mui/material";
import {
  ShoppingCart,
  Restaurant,
  AttachMoney,
  Inventory,
  Notifications as NotificationsIcon,
  ChevronRight,
} from "@mui/icons-material";

export default function AdminDashboardTab({
  adminOrders,
  adminProducts,
  notifications,
  setNotifications,
  setAdminActiveTab,
}) {
  const pendingCount = adminOrders.filter((o) => o.orderStatus === "Pending").length;
  const preparingCount = adminOrders.filter((o) => o.orderStatus === "Preparing").length;
  const revenue = adminOrders
    .filter((o) => o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const metrics = [
    { label: "Pending", value: pendingCount, icon: <ShoppingCart />, bgcolor: "primary.light", color: "primary.main" },
    { label: "Preparing", value: preparingCount, icon: <Restaurant />, bgcolor: "primary.light", color: "primary.main" },
    { label: "Sales Bill", value: `₹${revenue}`, icon: <AttachMoney />, bgcolor: "success.light", color: "success.main" },
    { label: "Sweets", value: adminProducts.length, icon: <Inventory />, bgcolor: "info.light", color: "info.main" },
  ];

  return (
    <Stack spacing={4}>
      {/* Metric Cards */}
      <Grid container spacing={3}>
        {metrics.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.label}>
            <Paper variant="outlined" sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: m.bgcolor, color: m.color, width: 48, height: 48 }}>
                {m.icon}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  {m.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {m.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Real-Time Order Notifications */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2.5, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationsIcon color="primary" /> SignalR Real-Time Orders
          </Typography>
          {notifications.length > 0 && (
            <Button size="small" color="error" onClick={() => setNotifications([])}>
              Clear
            </Button>
          )}
        </Stack>

        {notifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Waiting for incoming sweet orders... (Websocket Active)
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {notifications.map((notif, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "primary.light",
                  border: "1px solid #fde68a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Order: {notif.orderNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Customer: {notif.customerName} | Phone: {notif.customerPhone}
                  </Typography>
                </Box>
                <Stack spacing={1} alignItems="flex-end">
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    ₹{notif.totalAmount}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setAdminActiveTab("orders")}
                    endIcon={<ChevronRight />}
                  >
                    Process
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
