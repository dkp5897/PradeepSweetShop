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
  const activeIndex = trackedOrder ? getActiveStepIndex(trackedOrder.orderStatus) : 0;

  return (
    <Container maxWidth="md">
      {/* Search Input */}
      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }} elevation={0} variant="outlined">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Track Your Sweets Order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your sweet order number to see real-time preparation and delivery status.
        </Typography>

        <Box component="form" onSubmit={handleTrackSubmit} sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="e.g. PSH-20260614-1234"
            required
            value={trackingOrderNumber}
            onChange={(e) => setTrackingOrderNumber(e.target.value)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={trackingLoading}
            sx={{ px: 4 }}
          >
            {trackingLoading ? "Tracking..." : "Track Status"}
          </Button>
        </Box>
      </Paper>

      {/* Order Details */}
      {trackedOrder && (
        <Paper sx={{ p: 4, borderRadius: 4 }} elevation={0} variant="outlined">
          {/* Order Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              pb: 3,
              borderBottom: "1px solid #f1f5f9",
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
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                Order Ref: {trackedOrder.orderNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Placed on {new Date(trackedOrder.orderDate).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
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
                bgcolor: "error.light",
                borderRadius: 4,
                textAlign: "center",
                border: "1px solid #fee2e2",
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
              <Typography variant="h6" sx={{ fontWeight: 800, textAlign: "center", mb: 4 }}>
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
                              bgcolor: idx <= activeIndex ? "primary.main" : "grey.300",
                              color: "#fff",
                              width: 40,
                              height: 40,
                              transform: idx === activeIndex ? "scale(1.1)" : "none",
                              boxShadow:
                                idx === activeIndex ? "0 0 12px rgba(180, 83, 9, 0.4)" : "none",
                              transition: "all 0.3s",
                            }}
                          >
                            <StepIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        )}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
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
          <Grid container spacing={4} sx={{ pt: 4, borderTop: "1px solid #f1f5f9" }}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Inventory color="primary" /> Ordered Items
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableBody>
                    {trackedOrder.orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 755 }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} x {item.unitName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>
                          ₹{item.totalPrice}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "primary.light" }}>
                      <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Total Bill</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: "primary.dark" }}>
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
                sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Place color="primary" /> Delivery Information
              </Typography>

              <Stack
                spacing={2}
                sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #f1f5f9" }}
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
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}

                {trackedOrder.orderNotes && (
                  <Box sx={{ pt: 1.5, borderTop: "1px solid #e2e8f0" }}>
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
