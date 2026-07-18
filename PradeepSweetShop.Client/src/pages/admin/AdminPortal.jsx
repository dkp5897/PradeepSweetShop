import React, { useEffect } from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  Layers,
  ExitToApp,
  Refresh,
} from "@mui/icons-material";
import AdminDashboardTab from "./AdminDashboardTab";
import AdminOrdersTab from "./AdminOrdersTab";
import AdminProductsTab from "./AdminProductsTab";
import AdminCategoriesTab from "./AdminCategoriesTab";

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
}) {
  useEffect(() => {
    fetchAdminData();
  }, [adminActiveTab]);

  return (
    <Container maxWidth="lg" sx={{ minHeight: "80vh", py: 2 }}>
      {/* Portal Header Banner */}
      <Paper sx={{ p: 4, bgcolor: "secondary.dark", color: "#fff", borderRadius: 4, mb: 4 }} elevation={0}>
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={7}>
            <Typography
              variant="caption"
              sx={{ color: "primary.main", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}
            >
              Secure Admin Access
            </Typography>
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 855, mt: 0.5 }}>
              Pradeep Sweets Management
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.400", mt: 0.5 }}>
              Logged in: <strong>{adminUser?.fullName}</strong>
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
            sx={{ display: "flex", gap: 1.5, justifyContent: { md: "flex-end" } }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                fetchAdminData();
                alert("Dashboard refreshed!");
              }}
              startIcon={<Refresh />}
              sx={{ color: "#fff", borderColor: "primary.main" }}
            >
              Refresh
            </Button>
            <Button variant="contained" color="error" onClick={handleAdminLogout} startIcon={<ExitToApp />}>
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sidebar + Content */}
      <Grid container spacing={4}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "uppercase",
                px: 2,
                mb: 1,
                display: "block",
              }}
            >
              Portal Modules
            </Typography>
            <Tabs
              orientation="vertical"
              value={adminActiveTab}
              onChange={(e, val) => setAdminActiveTab(val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textAlign: "left",
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  fontWeight: 700,
                },
                "& .Mui-selected": { bgcolor: "primary.light" },
              }}
            >
              <Tab value="dashboard" label="Overview Dashboard" icon={<TrendingUp />} iconPosition="start" />
              <Tab
                value="orders"
                label={
                  <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center">
                    <span>Manage Orders</span>
                    {adminOrders.filter((o) => o.orderStatus === "Pending").length > 0 && (
                      <Chip
                        label={adminOrders.filter((o) => o.orderStatus === "Pending").length}
                        color="primary"
                        size="small"
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    )}
                  </Stack>
                }
                icon={<ShoppingCart />}
                iconPosition="start"
              />
              <Tab value="products" label="Manage Sweets" icon={<Inventory />} iconPosition="start" />
              <Tab value="categories" label="Manage Categories" icon={<Layers />} iconPosition="start" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab Content Area */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
