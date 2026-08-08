import React, { useState } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { api } from "../api";

export default function CheckoutPage({ cart, setCart, getCartTotal, setCurrentPage, setTrackedOrder }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in Name, Phone, and Delivery Address.");
      return;
    }

    const phoneRegex = /^[0-9+ ]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      alert("Please enter a valid phone number (10-15 digits).");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email || null,
        deliveryAddress: formData.address,
        orderNotes: formData.notes || null,
        items: cart.map((item) => ({
          productId: item.productId,
          productPriceId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const response = await api.placeOrder(orderData);
      setCart([]);
      setTrackedOrder(response);
      setCurrentPage("track");
    } catch (err) {
      alert(err.message || "Failed to place order. Please check availability or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
          Checkout Delivery Details
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          We will deliver fresh sweets straight from our shop. Cash on Delivery only.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Delivery Form */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? "#13151e" : "#fff",
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 4, pb: 1, borderBottom: `1px solid ${theme.palette.divider}`, color: "text.primary" }}
            >
              Delivery Information
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Full Name *"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Rajesh Kumar"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email Address (Optional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rajesh@gmail.com"
              />

              <TextField
                fullWidth
                label="Complete Delivery Address *"
                name="address"
                required
                multiline
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="House No, Street, Colony, City Landmark, Pin Code"
              />

              <TextField
                fullWidth
                label="Order Notes / Custom Requests"
                name="notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add extra dry fruits, deliver before 6 PM etc."
              />

              <Button
                variant="contained"
                type="submit"
                size="large"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  py: 1.5, mt: 2, borderRadius: 2, fontWeight: 700,
                  background: "linear-gradient(135deg, #b45309, #f59e0b)",
                  "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
                }}
              >
                {isSubmitting ? "Placing Order..." : `Confirm & Place Order (₹${getCartTotal()})`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: "fit-content",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? "#13151e" : "#fff",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: "text.primary" }}>
              Order Summary
            </Typography>

            <List disablePadding>
              {cart.map((item) => (
                <ListItem
                  key={`${item.productId}-${item.variantId}`}
                  disableGutters
                  sx={{ py: 1.5, justifyContent: "space-between" }}
                >
                  <ListItemText
                    primary={item.productName}
                    primaryTypographyProps={{ fontWeight: 700, variant: "subtitle2", color: "text.primary" }}
                    secondary={`${item.quantity} x ${item.unit}`}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                    ₹{item.price * item.quantity}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Delivery Fee
                </Typography>
                <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700 }}>
                  FREE
                </Typography>
              </Stack>
              <Divider sx={{ borderStyle: "dashed", borderColor: theme.palette.divider }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                  Grand Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
                  ₹{getCartTotal()}
                </Typography>
              </Stack>
            </Stack>

            <Box
              sx={{
                mt: 4, p: 2,
                bgcolor: isDark ? "rgba(180,83,9,0.1)" : "primary.light",
                borderRadius: 2,
                border: `1px solid ${isDark ? "rgba(180,83,9,0.2)" : "#fde68a"}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Info color="primary" sx={{ mt: 0.25 }} />
                <Typography
                  variant="caption"
                  sx={{ color: isDark ? "#fbbf24" : "primary.dark", fontWeight: 600, lineHeight: 1.4 }}
                >
                  <strong>Cash on Delivery (COD) Only</strong>. Payments will be collected in-person
                  upon sweet delivery. Order status updates in real-time.
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
