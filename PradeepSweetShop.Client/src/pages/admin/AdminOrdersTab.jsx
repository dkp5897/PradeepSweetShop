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
} from "@mui/material";
import { ShoppingCart, Visibility, Close } from "@mui/icons-material";
import { api } from "../../api";

function getStatusChip(status) {
  const map = {
    Pending: <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 700 }} />,
    Confirmed: <Chip label="Confirmed" color="info" size="small" sx={{ fontWeight: 700 }} />,
    Preparing: <Chip label="Preparing" color="secondary" size="small" sx={{ fontWeight: 700 }} />,
    OutForDelivery: <Chip label="Out For Delivery" color="primary" size="small" sx={{ fontWeight: 700 }} />,
    Delivered: <Chip label="Delivered" color="success" size="small" sx={{ fontWeight: 700 }} />,
    Cancelled: <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 700 }} />,
  };
  return map[status] || <Chip label={status} size="small" />;
}

const STATUS_OPTIONS = ["Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled"];

export default function AdminOrdersTab({ adminOrders, fetchAdminData, orderFilter, setOrderFilter }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchAdminData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
      alert(`Order status updated to: ${newStatus}`);
    } catch (err) {
      alert("Failed to update status. " + err.message);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 4, pb: 2, borderBottom: "1px solid #f1f5f9" }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Manage Sweets Orders
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Filter, process, and change order status states in real-time.
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="order-filter-label">Filter Status</InputLabel>
          <Select
            labelId="order-filter-label"
            value={orderFilter}
            label="Filter Status"
            onChange={(e) => setOrderFilter(e.target.value)}
            sx={{ fontWeight: 700 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s === "OutForDelivery" ? "Out For Delivery" : s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Orders Table */}
      {adminOrders.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <ShoppingCart sx={{ fontSize: 50, color: "text.secondary", opacity: 0.2, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No orders found.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Ref</TableCell>
                <TableCell>Customer Details</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => setSelectedOrder(order)}
                      startIcon={<Visibility />}
                      sx={{ fontWeight: 700 }}
                    >
                      {order.orderNumber}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(order.orderDate).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>₹{order.totalAmount}</TableCell>
                  <TableCell>{getStatusChip(order.orderStatus)}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      sx={{ fontSize: 12, fontWeight: 700 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
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
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Order Ref: {selectedOrder.orderNumber}
            </Typography>
            <IconButton onClick={() => setSelectedOrder(null)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Customer Details */}
              <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #f1f5f9" }}>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ fontWeight: 755, mb: 1.5, textTransform: "uppercase" }}
                >
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
                      <Grid item xs={9}>
                        <span style={{ fontStyle: "italic" }}>"{selectedOrder.orderNotes}"</span>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>

              {/* Status Update */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Order Status:
                </Typography>
                <Select
                  size="small"
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s === "OutForDelivery" ? "Out For Delivery" : s}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              {/* Items Table */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Sweets Ordered
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sweet Item</TableCell>
                        <TableCell>Variant</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{item.productName}</TableCell>
                          <TableCell>{item.unitName}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: "primary.light" }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 800 }}>
                          Grand Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: "primary.dark" }}>
                          ₹{selectedOrder.totalAmount}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedOrder(null)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
}
