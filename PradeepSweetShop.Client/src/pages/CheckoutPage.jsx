import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Stack,
  Chip,
  IconButton,
  Alert,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  ShoppingBag,
  Restaurant,
  Payments,
  ExpandMore,
  ExpandLess,
  LocalShipping,
  VerifiedUser,
  CheckCircle,
} from "@mui/icons-material";
import { api } from "../api";
import OrderItem from "../components/OrderItem";
import DeliveryInformation from "../components/DeliveryInformation";
import { readStored, writeStored } from "../storage";
import { savedDetails, normalizePhone, reconcileCart, deliveryFee } from "../checkout";

export default function CheckoutPage({
  cart = [],
  setCart,
  getCartTotal,
  setCurrentPage,
  setTrackedOrder,
  handleUpdateCartQty,
  shop,
  onNotice,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery("(max-width:600px)");
  const [cartExpanded, setIsCartExpanded] = useState(false);
  const isCartExpanded = !isMobile || cartExpanded;
  const [formData, setFormData] = useState(() => savedDetails(readStored("delivery_details", null)));
  const [rememberDetails, setRememberDetails] = useState(() => !!readStored("delivery_details", null));
  const [checkingCart, setCheckingCart] = useState(true);
  const [cartNotice, setCartNotice] = useState("");
  const [storageNotice, setStorageNotice] = useState("");
  const submission = useRef(false);
  const pending = useRef((() => {
    const value = readStored("pending_checkout", null, true);
    return value && typeof value.key === "string" && /^[a-f0-9-]{36}$/i.test(value.key) &&
      typeof value.fingerprint === "string" && /^[a-f0-9]{64}$/i.test(value.fingerprint) ? value : null;
  })());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = typeof getCartTotal === "function" ? getCartTotal() : 0;
  const shippingFee = deliveryFee(cartTotal, shop);
  const payableTotal = cartTotal + shippingFee;

  useEffect(() => {
    let disposed = false;
    async function checkCart() {
      setCheckingCart(true);
      try {
        const products = await Promise.all([...new Set(cart.map(i => i.productId))].map(id =>
          api.getProduct(id).catch(error => { if (error.status === 404) return null; throw error; })));
        if (disposed) return;
        const updated = reconcileCart(cart, products.filter(Boolean));
        if (JSON.stringify(updated) !== JSON.stringify(cart)) {
          setCart(updated);
          setCartNotice("Your cart was updated to reflect current prices and availability. Please review the total.");
        }
      } catch (error) { if (!disposed) setErrorMessage(error.message); }
      finally { if (!disposed) setCheckingCart(false); }
    }
    checkCart();
    return () => { disposed = true; };
  }, [cart, setCart]);

  const forgetDetails = () => {
    const removed = writeStored("delivery_details", null);
    setRememberDetails(false);
    setFormData(savedDetails(null));
    setStorageNotice(removed ? "Saved delivery details have been forgotten." : "Browser storage is unavailable. Clear this site's data in your browser to remove saved details.");
  };
  const changeRemember = checked => {
    setRememberDetails(checked);
    if (!checked && !writeStored("delivery_details", null))
      setStorageNotice("Browser storage is unavailable. Clear this site's data in your browser to remove saved details.");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submission.current || checkingCart || !shop) return;
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty. Please add sweets before placing an order.");
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage("Please fill in your Name, Phone Number, and Complete Delivery Address.");
      return;
    }

    const phone = normalizePhone(formData.phone.trim());
    if (!phone) {
      setErrorMessage("Please enter a valid Indian mobile number, optionally prefixed with +91.");
      return;
    }
    if (!shop.deliveryPincodes.includes(formData.pincode.trim())) {
      setErrorMessage(`We currently deliver to pincode ${shop.deliveryPincodes.join(", ")}.`);
      return;
    }
    if (cartTotal < shop.minimumOrder) {
      setErrorMessage(`The minimum order is ₹${shop.minimumOrder}, excluding delivery.`);
      return;
    }

    submission.current = true;
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: formData.name.trim(),
        customerPhone: phone,
        expectedTotal: Number(payableTotal.toFixed(2)),
        pincode: formData.pincode.trim(),
        customerEmail: formData.email ? formData.email.trim() : null,
        deliveryAddress: formData.address.trim(),
        orderNotes: formData.notes ? formData.notes.trim() : null,
        items: cart.map((item) => ({
          productId: item.productId,
          productPriceId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(orderData)));
      const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (pending.current && pending.current.fingerprint !== fingerprint) {
        // Resolve an uncertain previous attempt before allowing different details.
        const previous = await api.recoverOrder(pending.current.key);
        if (previous) {
          setCart([]); setTrackedOrder(previous); setCurrentPage("track");
          writeStored("pending_checkout", null, true); pending.current = null;
          return;
        }
        pending.current = null;
      }
      pending.current ||= { key: crypto.randomUUID(), fingerprint };
      writeStored("pending_checkout", pending.current, true);
      const response = await api.placeOrder(orderData, pending.current.key);
      if (rememberDetails) {
        const details = { name: formData.name.trim(), phone, email: formData.email.trim(), address: formData.address.trim(), pincode: formData.pincode.trim() };
        if (!writeStored("delivery_details", details))
          onNotice("Your order was placed, but this browser could not save your delivery details.");
      }
      writeStored("pending_checkout", null, true);
      pending.current = null;
      if (typeof setCart === "function") {
        setCart([]);
      }
      if (typeof setTrackedOrder === "function") {
        setTrackedOrder(response);
      }
      if (typeof setCurrentPage === "function") {
        setCurrentPage("track");
      }
    } catch (err) {
      // A rejected retry (including throttling) does not prove an earlier
      // attempt failed. Keep the key until recovery resolves the outcome.
      setErrorMessage(err.message || "Failed to place order. Please check availability or try again.");
    } finally {
      submission.current = false;
      setIsSubmitting(false);
    }
  };

  // If cart is empty, show clean empty state
  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "#13151e" : "#fff",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: isDark ? "rgba(180,83,9,0.15)" : "primary.light",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <ShoppingBag sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 450, mx: "auto", mb: 4 }}>
            You haven't selected any sweets for delivery yet. Explore our handcrafted, pure desi ghee sweets and add them to your cart!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setCurrentPage("shop")}
            startIcon={<Restaurant />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
            }}
          >
            Browse Sweets Menu
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Top Navigation & Breadcrumbs */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => setCurrentPage("shop")}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { color: "primary.main", bgcolor: "transparent" },
          }}
        >
          Back to Sweets Menu
        </Button>
      </Stack>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary", fontSize: { xs: "2rem", sm: "2.75rem", md: "3rem" } }}>
              Checkout & Delivery Details
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Review the sweets you are ordering and provide your delivery address for doorstep delivery.
            </Typography>
          </Box>
          <Chip
            icon={<Payments sx={{ fontSize: "18px !important" }} />}
            label="Cash on Delivery Only"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, px: 1 }}
          />
        </Stack>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}
      {cartNotice && <Alert severity="info" sx={{ mb: 2 }}>{cartNotice}</Alert>}
      {storageNotice && <Alert severity="info" sx={{ mb: 2 }}>{storageNotice}</Alert>}
      {shop && <Alert severity="info" sx={{ mb: 2 }}>Delivery to {shop.deliveryPincodes.join(", ")} · Minimum order ₹{shop.minimumOrder} · ₹{shop.deliveryFee} delivery below ₹{shop.freeDeliveryFrom}, free from ₹{shop.freeDeliveryFrom}. Estimated delivery: {shop.estimatedDeliveryMinutes} minutes. Open {shop.openingHours}.</Alert>}
      {shop && cartTotal < shop.minimumOrder && <Alert severity="warning" sx={{ mb: 2 }}>Add ₹{(shop.minimumOrder - cartTotal).toFixed(2)} more in sweets to reach the minimum order. Delivery is charged separately.</Alert>}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3.5,
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* LEFT COLUMN: Selected Sweets (50% Width / Same Row on Laptop & iPad) */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
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
            }}
          >
            {/* Header (Clickable Collapse Toggle on Mobile) */}
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center",
                width: "100%",
                mb: isCartExpanded ? 1.5 : 0,
                cursor: isMobile ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                    Selected Sweets
                  </Typography>
                  {isMobile && !isCartExpanded && (
                    <Typography variant="subtitle2" sx={{ color: "primary.main", fontWeight: 800 }}>
                      (₹{payableTotal.toFixed(2)})
                    </Typography>
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {isMobile && !isCartExpanded
                    ? "Tap to view items & pricing summary"
                    : "Products you are going to order"}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center", ml: "auto" }}>
                <Chip
                  label={`${totalItemCount} ${totalItemCount === 1 ? "item" : "items"}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: isDark ? "rgba(180,83,9,0.2)" : "primary.light",
                    color: "primary.main",
                  }}
                />
                {isMobile && (
                  <IconButton aria-label={isCartExpanded ? "Hide cart summary" : "Show cart summary"} aria-expanded={isCartExpanded} aria-controls="checkout-cart-summary" onClick={() => setIsCartExpanded(prev => !prev)} size="small" sx={{ color: "primary.main", p: 0.5 }}>
                    {isCartExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Stack>
            </Stack>

            {/* Collapsible Content Body */}
            <Collapse id="checkout-cart-summary" in={isCartExpanded} timeout="auto" sx={{ width: "100%", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", flexGrow: 1, gap: 1.25 }}>
                <Divider sx={{ mb: 0.5, borderColor: theme.palette.divider }} />

                {/* Scrollable List of Ordered Products (Compact MaxHeight 220) */}
                <Box
                  sx={{
                    maxHeight: 220,
                    overflowY: "auto",
                    pr: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    "&::-webkit-scrollbar": { width: 5 },
                    "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      bgcolor: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8",
                    },
                  }}
                >
                  {cart.map((item, idx) => (
                    <React.Fragment key={`${item.productId}-${item.variantId}`}>
                      {idx > 0 && <Divider sx={{ my: 0.5, borderColor: theme.palette.divider }} />}
                      <OrderItem
                        item={item}
                        handleUpdateCartQty={isSubmitting ? undefined : handleUpdateCartQty}
                      />
                    </React.Fragment>
                  ))}
                </Box>

                <Divider sx={{ my: 0.5, borderColor: theme.palette.divider }} />

                {/* Bill Pricing Breakdown */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: "auto", pt: 0.5, width: "100%" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      Items Total ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", textAlign: "right" }}>
                      ₹{cartTotal}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      Sweets Gift Packaging
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700, textAlign: "right", fontSize: "0.85rem" }}>
                      Included
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      Doorstep Delivery
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 700, textAlign: "right", fontSize: "0.85rem" }}>
                      {shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderStyle: "dashed", borderColor: theme.palette.divider, my: 0.25 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                        Total Payable
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Includes delivery
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.main", textAlign: "right" }}>
                      ₹{payableTotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Assurances Bar */}
                <Box
                  sx={{
                    p: 1.25,
                    mt: 1,
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 4 }} >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <LocalShipping sx={{ color: "primary.main", fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                          Fresh Local Delivery
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <VerifiedUser sx={{ color: "success.main", fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                          100% Pure Sweets
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} >
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <CheckCircle sx={{ color: "warning.main", fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                          Pay on Delivery
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Box>

        {/* RIGHT COLUMN: Delivery Details Form (50% Width / Same Row on Laptop & iPad) */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <DeliveryInformation
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            checkingCart={checkingCart || !shop}
            rememberDetails={rememberDetails}
            onRememberChange={changeRemember}
            onForgetDetails={forgetDetails}
            cartTotal={payableTotal}
            cartLength={cart.length}
          />
        </Box>
      </Box>
    </Container>
  );
}
