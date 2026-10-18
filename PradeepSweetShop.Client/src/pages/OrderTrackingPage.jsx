import { useState } from "react";
import { Container, Box, Typography, TextField, Button, Paper, Stack, Chip, Stepper, Step, StepLabel, Table, TableBody, TableCell, TableRow, Alert } from "@mui/material";
import { privateTrackingCode } from "../checkout";
import { api } from "../api";

const STEPS = ["Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered"];
export default function OrderTrackingPage({
  trackedOrder, setTrackedOrder, trackingOrderNumber, setTrackingOrderNumber,
  handleTrackSubmit, trackingLoading, trackingError, connectionStatus,
}) {
  const [refreshError, setRefreshError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true); setRefreshError("");
    try { setTrackedOrder(await api.trackOrder(trackedOrder.orderNumber, trackedOrder.trackingToken)); }
    catch (error) { setRefreshError(error.message); }
    finally { setRefreshing(false); }
  };
  return (
    <Container maxWidth="md">
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Track Your Sweets Order</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Paste the complete private tracking code from your order confirmation. Keep it private.</Typography>
        <Box component="form" onSubmit={handleTrackSubmit} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField fullWidth required label="Private tracking code" size="small"
            autoComplete="off" value={trackingOrderNumber}
            onChange={event => setTrackingOrderNumber(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 170 } }} />
          <Button type="submit" variant="contained" disabled={trackingLoading}>{trackingLoading ? "Checking..." : "Track status"}</Button>
        </Box>
        {trackingError && <Alert severity="error" sx={{ mt: 2 }}>{trackingError}</Alert>}
      </Paper>
      {trackedOrder && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>Order {trackedOrder.orderNumber}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Placed {new Date(trackedOrder.orderDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</Typography>
          <Alert severity={connectionStatus === "live" ? "success" : "info"} sx={{ mb: 2 }}
            action={<Button disabled={refreshing} color="inherit" onClick={refresh}>Refresh</Button>}>
            {connectionStatus === "live" ? "Live order updates connected." :
              connectionStatus === "reconnecting" ? "Reconnecting. You can refresh the status." :
              connectionStatus === "connecting" ? "Connecting to live updates..." : "Live updates are unavailable. Refresh to check your order."}
          </Alert>
          {refreshError && <Alert severity="error" sx={{ mb: 2 }}>{refreshError}</Alert>}
          <TextField fullWidth label="Save this private tracking code" value={privateTrackingCode(trackedOrder)}
            slotProps={{ input: { readOnly: true }, htmlInput: { onFocus: event => event.target.select() } }}
            helperText="Select and copy this code to track from another device. This browser keeps the receipt for this session."
            size="small" sx={{ mb: 3 }} />
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip label={trackedOrder.orderStatus === "OutForDelivery" ? "Out for delivery" : trackedOrder.orderStatus} color="primary" />
            <Chip label={`Cash on delivery · ${trackedOrder.paymentStatus}`} variant="outlined" />
          </Stack>
          {trackedOrder.orderStatus === "Cancelled" ? <Alert severity="warning">This order was cancelled.</Alert> : (
            <Stepper activeStep={STEPS.indexOf(trackedOrder.orderStatus)} orientation="vertical" sx={{ mb: 3 }}>
              {STEPS.map(step => <Step key={step}><StepLabel>{step === "OutForDelivery" ? "Out for delivery" : step}</StepLabel></Step>)}
            </Stepper>
          )}
          <Typography variant="h6">Ordered items</Typography>
          <Table size="small" aria-label="Ordered items">
            <TableBody>
              {trackedOrder.orderItems.map(item => <TableRow key={item.id}>
                <TableCell>{item.productName}<Typography variant="caption" sx={{ display: "block" }}>{item.quantity} × {item.unitName}</Typography></TableCell>
                <TableCell align="right">₹{item.totalPrice.toFixed(2)}</TableCell>
              </TableRow>)}
              <TableRow><TableCell>Delivery</TableCell><TableCell align="right">{trackedOrder.deliveryFee ? `₹${trackedOrder.deliveryFee.toFixed(2)}` : "FREE"}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 800 }}>Total</TableCell><TableCell align="right" sx={{ fontWeight: 800 }}>₹{trackedOrder.totalAmount.toFixed(2)}</TableCell></TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
