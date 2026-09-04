import React from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import {
  ShoppingBag,
  ShoppingCart,
  Close,
  ChevronRight,
} from "@mui/icons-material";
import OrderItem from "./OrderItem";

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  handleUpdateCartQty,
  getCartTotal,
  setCurrentPage,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
      <Box
        sx={{
          width: { xs: "100vw", sm: 400 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShoppingBag color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
              Sweets Cart
            </Typography>
          </Stack>
          <IconButton onClick={() => setIsCartOpen(false)} sx={{ color: "text.secondary" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Items */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2.5 }}>
          {cart.length === 0 ? (
            <Stack spacing={2} alignItems="center" sx={{ mt: 10, textAlign: "center" }}>
              <ShoppingCart sx={{ fontSize: 60, color: "text.secondary", opacity: 0.2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Your cart is empty
              </Typography>
              <Button
                variant="contained"
                onClick={() => { setIsCartOpen(false); setCurrentPage("shop"); }}
                sx={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #b45309, #f59e0b)",
                  "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
                }}
              >
                Browse Fresh Sweets
              </Button>
            </Stack>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {cart.map((item, idx) => (
                <React.Fragment key={`${item.productId}-${item.variantId}`}>
                  {idx > 0 && <Divider sx={{ my: 0.75, borderColor: theme.palette.divider }} />}
                  <OrderItem
                    item={item}
                    handleUpdateCartQty={handleUpdateCartQty}
                  />
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <Box
            sx={{
              p: 2.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%", mb: 1.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                Subtotal
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
                ₹{getCartTotal()}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ display: "block", mb: 2.5, color: "text.secondary" }}>
              Shipping & delivery costs are covered. Order updates instantly via live timeline.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => { setIsCartOpen(false); setCurrentPage("checkout"); }}
              endIcon={<ChevronRight />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                background: "linear-gradient(135deg, #b45309, #f59e0b)",
                boxShadow: "0 4px 12px rgba(180,83,9,0.3)",
                "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

