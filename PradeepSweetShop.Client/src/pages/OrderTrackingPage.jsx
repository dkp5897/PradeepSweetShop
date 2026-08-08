import React from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Stack,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  Restaurant,
  LocalShipping,
  Check,
  Warning,
  Inventory,
  Place,
} from "@mui/icons-material";

const ORDER_STEPS = [
  { label: "Pending", icon: AccessTime },
  { label: "Confirmed", icon: CheckCircle },
  { label: "Preparing", icon: Restaurant },
  { label: "Out For Delivery", icon: LocalShipping },
  { label: "Delivered", icon: Check },
];

function getActiveStepIndex(status) {
  switch (status) {
    case "Pending": return 0;
    case "Confirmed": return 1;
    case "Preparing": return 2;
    case "OutForDelivery": return 3;
    case "Delivered": return 4;
    default: return 0;
  }
}

export default function OrderTrackingPage({
  trackedOrder,
  trackingOrderNumber,
  setTrackingOrderNumber,
  handleTrackSubmit,
  trackingLoading,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const activeIndex = trackedOrder ? getActiveStepIndex(trackedOrder.orderStatus) : 0;

  return (
    <Container maxWidth="md">
      {/* Search Input */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          mb: 4,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? "#13151e" : "#fff",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
          Track Your Sweets Order
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          Enter your sweet order number to see real-time preparation and delivery status.
        </Typography>

        <Box component="form" onSubmit={handleTrackSubmit} sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="e.g. PSH-20260614-1234"
            required
            size="small"
            value={trackingOrderNumber}
            onChange={(e) => setTrackingOrderNumber(e.target.value)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={trackingLoading}
            sx={{
              px: 4,
              borderRadius: 2,
              fontWeight: 700,
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
            }}
          >
            {trackingLoading ? "Tracking..." : "Track Status"}
          </Button>
        </Box>
      </Paper>

      {/* Order Details */}
      {trackedOrder && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "#13151e" : "#fff",
          }}
        >
          {/* Order Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              pb: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "primary.main", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}
              >
                Real-Time Stepper Active
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "text.primary" }}>
                Order Ref: {trackedOrder.orderNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Placed on {new Date(trackedOrder.orderDate).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                Payment Method (COD)
              </Typography>
              <Chip
                label={trackedOrder.paymentStatus}
                color={trackedOrder.paymentStatus === "Completed" ? "success" : "warning"}
                size="small"
                sx={{ fontWeight: 700, mt: 0.5 }}
              />
            </Box>
          </Box>

          {/* Status Stepper or Cancelled */}
          {trackedOrder.orderStatus === "Cancelled" ? (
            <Box
              sx={{
                p: 4,
                bgcolor: isDark ? "rgba(239,68,68,0.1)" : "error.light",
                borderRadius: 4,
                textAlign: "center",
                border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "#fee2e2"}`,
                color: "error.main",
              }}
            >
              <Warning sx={{ fontSize: 50, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Order Cancelled
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This order has been cancelled by the admin. Please contact the sweet shop for inquiries.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, textAlign: "center", mb: 4, color: "text.primary" }}>
                Live Preparation Timeline
              </Typography>
              <Stepper activeStep={activeIndex} alternativeLabel>
                {ORDER_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  return (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Avatar
                            sx={{
                              bgcolor: idx <= activeIndex ? "primary.main" : isDark ? "rgba(255,255,255,0.1)" : "grey.300",
                              color: "#fff",
                              width: 40,
                              height: 40,
                              transform: idx === activeIndex ? "scale(1.1)" : "none",
                              boxShadow: idx === activeIndex ? "0 0 12px rgba(180, 83, 9, 0.4)" : "none",
                              transition: "all 0.3s",
                            }}
                          >
                            <StepIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        )}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, color: "text.primary" }}>
                          {step.label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
          )}

          {/* Order Items & Delivery Info */}
          <Grid container spacing={4} sx={{ pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}
              >
                <Inventory color="primary" /> Ordered Items
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                  <TableBody>
                    {trackedOrder.orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 755, color: "text.primary" }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {item.quantity} x {item.unitName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "text.primary" }}>
                          ₹{item.totalPrice}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: isDark ? "rgba(180,83,9,0.1)" : "primary.light" }}>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, color: "text.primary" }}>Total Bill</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>
                        ₹{trackedOrder.totalAmount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}
              >
                <Place color="primary" /> Delivery Information
              </Typography>

              <Stack
                spacing={2}
                sx={{
                  p: 2.5,
                  bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {[
                  { label: "Customer:", value: trackedOrder.customerName },
                  { label: "Phone:", value: trackedOrder.customerPhone },
                  { label: "Address:", value: trackedOrder.deliveryAddress },
                ].map(({ label, value }) => (
                  <Stack direction="row" spacing={1} key={label}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary", width: 90 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, lineHeight: 1.4, color: "text.primary" }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}

                {trackedOrder.orderNotes && (
                  <Box sx={{ pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      <strong>Notes:</strong> "{trackedOrder.orderNotes}"
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}
