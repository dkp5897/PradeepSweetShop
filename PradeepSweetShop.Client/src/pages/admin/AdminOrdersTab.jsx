import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
} from "@mui/material";
import { ShoppingCart, Visibility, Close } from "@mui/icons-material";
import { api } from "../../api";

const STATUS_COLORS = {
  Pending: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Confirmed: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  Preparing: { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
  OutForDelivery: { bg: "#fce7f3", color: "#9d174d", dot: "#ec4899" },
  Delivered: { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

function StatusChip({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  const label = status === "OutForDelivery" ? "Out For Delivery" : status;
  return (
    <Chip
      size="small"
      label={
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.dot }} />
          <span>{label}</span>
        </Stack>
      }
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: 11, height: 26, border: "none" }}
    />
  );
}

const STATUS_OPTIONS = ["Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled"];

export default function AdminOrdersTab({ adminOrders, fetchAdminData, orderFilter, setOrderFilter }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchAdminData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status. " + err.message);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            Filter, process, and update order statuses in real-time.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="order-filter-label">Filter Status</InputLabel>
          <Select
            labelId="order-filter-label"
            value={orderFilter}
            label="Filter Status"
            onChange={(e) => setOrderFilter(e.target.value)}
            sx={{ fontWeight: 600, borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s === "OutForDelivery" ? "Out For Delivery" : s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Orders Table */}
      {adminOrders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 10,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "#13151e" : "#fff",
          }}
        >
          <ShoppingCart sx={{ fontSize: 48, color: "text.secondary", opacity: 0.15, mb: 1 }} />
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            No orders found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "#13151e" : "#fff",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Ref</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" },
                  }}
                >
                  <TableCell>
                    <Button
                      variant="text"
                      onClick={() => setSelectedOrder(order)}
                      startIcon={<Visibility sx={{ fontSize: "14px !important" }} />}
                      sx={{ fontWeight: 700, fontSize: 13, p: 0, minWidth: 0 }}
                    >
                      {order.orderNumber}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}>
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
                      {order.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 12 }}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, color: "text.primary" }}>
                      ₹{order.totalAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={order.orderStatus} />
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      sx={{ fontSize: 12, fontWeight: 600, borderRadius: 2, minWidth: 130 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                          {s === "OutForDelivery" ? "Out For Delivery" : s}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Order: {selectedOrder.orderNumber}
              </Typography>
              <StatusChip status={selectedOrder.orderStatus} />
            </Box>
            <IconButton onClick={() => setSelectedOrder(null)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Customer Details */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 11, color: "primary.main", mb: 1.5, textTransform: "uppercase", letterSpacing: 1 }}>
                  Customer Details
                </Typography>
                <Grid container spacing={1} sx={{ fontSize: 13 }}>
                  <Grid item xs={3}><strong>Name:</strong></Grid>
                  <Grid item xs={9}>{selectedOrder.customerName}</Grid>
                  <Grid item xs={3}><strong>Phone:</strong></Grid>
                  <Grid item xs={9}>{selectedOrder.customerPhone}</Grid>
                  <Grid item xs={3}><strong>Email:</strong></Grid>
                  <Grid item xs={9}>{selectedOrder.customerEmail || "--"}</Grid>
                  <Grid item xs={3}><strong>Address:</strong></Grid>
                  <Grid item xs={9}>{selectedOrder.deliveryAddress}</Grid>
                  {selectedOrder.orderNotes && (
                    <>
                      <Grid item xs={3}><strong>Notes:</strong></Grid>
                      <Grid item xs={9}><em>"{selectedOrder.orderNotes}"</em></Grid>
                    </>
                  )}
                </Grid>
              </Paper>

              {/* Status Update */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Update Status:</Typography>
                <Select
                  size="small"
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  sx={{ minWidth: 160, fontSize: 13, borderRadius: 2 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                      {s === "OutForDelivery" ? "Out For Delivery" : s}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              {/* Items Table */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 11, color: "primary.main", mb: 1.5, textTransform: "uppercase", letterSpacing: 1 }}>
                  Items Ordered
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Variant</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{item.productName}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{item.unitName}</TableCell>
                          <TableCell align="center" sx={{ fontSize: 13 }}>{item.quantity}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13 }}>₹{item.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} sx={{ fontWeight: 800, fontSize: 13, borderBottom: "none" }}>
                          Grand Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, fontSize: 15, color: "primary.main", borderBottom: "none" }}>
                          ₹{selectedOrder.totalAmount}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedOrder(null)} variant="outlined" sx={{ borderRadius: 2 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
