
import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import {
  LocationOn,
  Payments,
} from "@mui/icons-material";

export default function DeliveryInformation({
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting = false,
  checkingCart = false,
  rememberDetails,
  onRememberChange,
  onForgetDetails,
  cartTotal = 0,
  cartLength = 0,
  submitButtonText,
  sx = {},
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: isDark ? "#13151e" : "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.5 }}>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 1.5,
            bgcolor: isDark ? "rgba(180,83,9,0.15)" : "primary.light",
            color: "primary.main",
            display: "flex",
          }}
        >
          <LocationOn fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
            Delivery Information
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Where should we deliver your fresh sweets?
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />

      {/* Form Body */}
      <Box
        component="form"
        id="checkout-form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={1.5}>
          {/* Name & Phone on the same line with equal 50% width */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                fullWidth
                size="small"
                label="Full name"
                name="name"
                autoComplete="name"
                disabled={isSubmitting}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Rajesh Kumar"

              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                fullWidth
                size="small"
                label="Mobile number"
                name="phone"
                type="tel"
                autoComplete="tel"
                disabled={isSubmitting}
                slotProps={{ htmlInput: { inputMode: "tel", maxLength: 25 } }}
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. 9876543210"

              />
            </Box>
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Email Address (Optional)"
            name="email"
            autoComplete="email"
            disabled={isSubmitting}
            slotProps={{ htmlInput: { maxLength: 254 } }}
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g. rajesh@example.com"

          />

          <TextField
            fullWidth
            size="small"
            label="Delivery address"
            name="address"
            autoComplete="street-address"
            disabled={isSubmitting}
            slotProps={{ htmlInput: { maxLength: 500, minLength: 10 } }}
            required
            multiline
            rows={2}
            value={formData.address}
            onChange={handleInputChange}
            placeholder="House / Flat No., Building / Society, Street, Colony, Landmark, City, Pincode"
          />

          <TextField
            fullWidth
            size="small"
            label="Order Notes / Delivery Instructions (Optional)"
            name="notes"
            disabled={isSubmitting}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            multiline
            rows={2}
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="e.g. Ring doorbell twice, deliver fresh before 6 PM"

          />
        </Stack>

        <TextField fullWidth size="small" label="Delivery pincode" name="pincode" required
          autoComplete="postal-code" value={formData.pincode} onChange={handleInputChange} disabled={isSubmitting}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6, pattern: "[0-9]{6}" } }} />
        <Box>
          <FormControlLabel control={<Checkbox checked={rememberDetails} disabled={isSubmitting} onChange={event => onRememberChange(event.target.checked)} />} label="Remember my details on this device" />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Use this on a personal device. Your name, phone, email and address will be saved after checkout. Order notes are not saved.</Typography>
          {rememberDetails && <Button size="small" disabled={isSubmitting} onClick={onForgetDetails}>Forget saved details</Button>}
        </Box>
        {/* Submit Button */}
        <Button
          variant="contained"
          type="submit"
          form="checkout-form"
          size="medium"
          fullWidth
          disabled={isSubmitting || checkingCart || cartLength === 0}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Payments />
            )
          }
          sx={{
            mt: 1.5,
            py: 1.25,
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: "0.95rem",
            letterSpacing: 0.3,
            boxShadow: "0 4px 14px rgba(180,83,9,0.35)",
            background: "linear-gradient(135deg, #b45309, #f59e0b)",
            "&:hover": {
              background: "linear-gradient(135deg, #92400e, #d97706)",
              boxShadow: "0 6px 18px rgba(180,83,9,0.45)",
            },
          }}
        >
          {checkingCart ? "Checking prices and availability..." : isSubmitting
            ? "Placing Your Order..."
            : submitButtonText || `Confirm & Place Order (₹${cartTotal})`}
        </Button>
      </Box>
    </Paper>
  );
}
