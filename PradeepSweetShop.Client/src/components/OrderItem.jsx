import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Remove,
  Add,
  Delete,
  Restaurant,
} from "@mui/icons-material";

/**
 * Reusable OrderItem component displaying:
 * Product image ---> Name & unit subtitle ---> Count button (- 1 +) ---> Price ---> Delete button
 */
export default function OrderItem({
  item,
  handleUpdateCartQty,
  showControls = true,
  onDelete,
  sx = {},
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleDecrease = () => {
    if (handleUpdateCartQty) {
      handleUpdateCartQty(item.productId, item.variantId, -1);
    }
  };

  const handleIncrease = () => {
    if (handleUpdateCartQty) {
      handleUpdateCartQty(item.productId, item.variantId, 1);
    }
  };

  const handleRemove = () => {
    if (onDelete) {
      onDelete(item);
    } else if (handleUpdateCartQty) {
      handleUpdateCartQty(item.productId, item.variantId, -item.quantity);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        gap: 1.25,
        py: 0.5,
        ...sx,
      }}
    >
      {/* 1. Product Image */}
      <Avatar
        src={item.imageUrl}
        variant="rounded"
        alt={item.productName}
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? "rgba(180,83,9,0.15)" : "primary.light",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        <Restaurant sx={{ fontSize: 20 }} />
      </Avatar>

      {/* 2. Product Name & Unit Subtitle */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          noWrap
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: "0.85rem",
            lineHeight: 1.3,
          }}
          title={item.productName}
        >
          {item.productName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: 11,
            fontWeight: 600,
            display: "block",
          }}
        >
          {item.unit}
        </Typography>
      </Box>

      {/* 3. Count Button (- 1 +) */}
      {showControls && handleUpdateCartQty ? (
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1.5,
            bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
            height: 30,
            px: 0.5,
            flexShrink: 0,
            gap: 0.25,
          }}
        >
          <IconButton
            size="small"
            onClick={handleDecrease}
            sx={{ p: 0, width: 22, height: 22, minWidth: 22 }}
            aria-label="decrease quantity"
          >
            <Remove sx={{ fontSize: 13 }} />
          </IconButton>
          <Box
            component="span"
            sx={{
              fontWeight: 800,
              px: 0.5,
              minWidth: 16,
              textAlign: "center",
              color: "text.primary",
              fontSize: "0.85rem",
              lineHeight: "22px",
              display: "inline-block",
            }}
          >
            {item.quantity}
          </Box>
          <IconButton
            size="small"
            onClick={handleIncrease}
            sx={{ p: 0, width: 22, height: 22, minWidth: 22 }}
            aria-label="increase quantity"
          >
            <Add sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>
      ) : (
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: "text.secondary", flexShrink: 0 }}
        >
          Qty: {item.quantity}
        </Typography>
      )}

      {/* 4. Price */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 900,
          color: "primary.main",
          whiteSpace: "nowrap",
          flexShrink: 0,
          minWidth: 42,
          textAlign: "right",
          fontSize: "0.875rem",
          lineHeight: 1,
        }}
      >
        ₹{item.price * item.quantity}
      </Typography>

      {/* 5. Red Delete Trash Icon */}
      {showControls && handleUpdateCartQty && (
        <IconButton
          size="small"
          color="error"
          onClick={handleRemove}
          sx={{
            p: 0,
            width: 26,
            height: 26,
            minWidth: 26,
            flexShrink: 0,
            opacity: 0.8,
            "&:hover": { opacity: 1 },
          }}
          title="Remove product"
        >
          <Delete sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
}
