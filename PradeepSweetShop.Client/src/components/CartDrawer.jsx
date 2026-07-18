import React from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import {
  ShoppingBag,
  ShoppingCart,
  Close,
  Remove,
  Add,
  Delete,
  ChevronRight,
} from "@mui/icons-material";

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  handleUpdateCartQty,
  getCartTotal,
  setCurrentPage,
}) {
  return (
    <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
      <Box
        sx={{ width: { xs: "100vw", sm: 400 }, display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShoppingBag color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Sweets Cart
            </Typography>
          </Stack>
          <IconButton onClick={() => setIsCartOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        {/* Items */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
          {cart.length === 0 ? (
            <Stack spacing={2} alignItems="center" sx={{ mt: 10, textAlign: "center" }}>
              <ShoppingCart sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Your cart is empty
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentPage("shop");
                }}
              >
                Browse Fresh Sweets
              </Button>
            </Stack>
          ) : (
            <List disablePadding>
              {cart.map((item, idx) => (
                <React.Fragment key={`${item.productId}-${item.variantId}`}>
                  {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                  <ListItem disableGutters alignItems="flex-start" sx={{ py: 1 }}>
                    <ListItemAvatar sx={{ minWidth: 70 }}>
                      <Avatar
                        src={item.imageUrl}
                        variant="rounded"
                        sx={{ width: 56, height: 56, border: "1px solid #f1f5f9" }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "primary.dark", ml: 2 }}>
                            ₹{item.price * item.quantity}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={item.unit}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                          />
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 1.5 }}
                          >
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 1.5,
                                bgcolor: "#f8fafc",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateCartQty(item.productId, item.variantId, -1)}
                              >
                                <Remove fontSize="inherit" />
                              </IconButton>
                              <Typography variant="body2" sx={{ fontWeight: 700, px: 1 }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateCartQty(item.productId, item.variantId, 1)}
                              >
                                <Add fontSize="inherit" />
                              </IconButton>
                            </Stack>
                            <Button
                              variant="text"
                              color="error"
                              size="small"
                              onClick={() =>
                                handleUpdateCartQty(item.productId, item.variantId, -item.quantity)
                              }
                              startIcon={<Delete size={14} />}
                            >
                              Remove
                            </Button>
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <Box sx={{ p: 3, borderTop: "1px solid #f1f5f9", bgcolor: "#f8fafc" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Subtotal
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
                ₹{getCartTotal()}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
              Shipping & delivery costs are covered. Order updates instantly via live timeline.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => {
                setIsCartOpen(false);
                setCurrentPage("checkout");
              }}
              endIcon={<ChevronRight />}
              sx={{ py: 1.5 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
