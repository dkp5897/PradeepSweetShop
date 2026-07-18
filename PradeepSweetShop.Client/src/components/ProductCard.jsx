import React from "react";
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

// Warm amber gradient placeholder when no product image
const PLACEHOLDER_GRADIENT =
  "linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fbbf24 100%)";

export default function ProductCard({ product, handleAddToCart, onVariantChange }) {
  const currentVariant = product.selectedVariant;
  const isOutOfStock =
    !product.prices ||
    product.prices.length === 0 ||
    !product.prices.some((pr) => pr.isAvailable && pr.stockQuantity > 0);

  return (
    <Box
      sx={{
        height: 440,
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "#fff",
        border: "1px solid #f1f0ed",
        boxShadow: "0 2px 12px rgba(180,83,9,0.06)",
        cursor: "pointer",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 14px 36px rgba(180,83,9,0.13)",
        },
      }}
    >
      {/* ── IMAGE ZONE: fixed 210px ── */}
      <Box
        sx={{
          position: "relative",
          height: 210,
          flexShrink: 0,
          overflow: "hidden",
          bgcolor: "#fef3c7",
        }}
      >
        {product.imageUrl ? (
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              background: PLACEHOLDER_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{ fontSize: 48, userSelect: "none" }}
              role="img"
              aria-label="sweets"
            >
              🍮
            </Typography>
          </Box>
        )}

        {/* Category badge — top left */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
          }}
        >
          <Chip
            label={product.categoryName}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.92)",
              color: "#b45309",
              fontWeight: 700,
              fontSize: "0.68rem",
              height: 22,
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(180,83,9,0.15)",
            }}
          />
        </Box>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(15,23,42,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(3px)",
            }}
          >
            <Chip
              label="Out of Stock"
              sx={{
                bgcolor: "#ef4444",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 28,
              }}
            />
          </Box>
        )}
      </Box>

      {/* ── CONTENT ZONE: remaining 230px ── */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: "14px 16px 16px",
          overflow: "hidden",
        }}
      >
        {/* Product name — max 2 lines */}
        <Typography
          sx={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: "1rem",
            lineHeight: 1.3,
            color: "#0f172a",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.75,
          }}
        >
          {product.name}
        </Typography>

        {/* Description — max 2 lines */}
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#64748b",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: "auto",
          }}
        >
          {product.description || "Freshly prepared with premium ingredients."}
        </Typography>

        {/* Divider */}
        <Box sx={{ borderTop: "1px dashed #f1f0ed", mt: 1.5, mb: 1.5 }} />

        {/* Variant Selector */}
        {product.prices && product.prices.length > 0 && (
          <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
            <InputLabel
              id={`vl-${product.id}`}
              sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#92400e" }}
            >
              Select Pack Size
            </InputLabel>
            <Select
              labelId={`vl-${product.id}`}
              value={currentVariant?.id ?? ""}
              label="Select Pack Size"
              onChange={(e) => {
                const selected = product.prices.find((pr) => pr.id === parseInt(e.target.value));
                if (onVariantChange) onVariantChange(selected);
              }}
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                bgcolor: "#fffbf5",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#fde68a" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#b45309" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#b45309" },
              }}
            >
              {product.prices.map((pr) => (
                <MenuItem
                  key={pr.id}
                  value={pr.id}
                  disabled={!pr.isAvailable || pr.stockQuantity <= 0}
                  sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  {pr.unit} — ₹{pr.price}
                  {pr.stockQuantity <= 0 ? " (Sold out)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Price + Add button */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Price */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.4 }}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 900,
                fontSize: "1.35rem",
                color: "#b45309",
                lineHeight: 1,
              }}
            >
              ₹{currentVariant?.price ?? "—"}
            </Typography>
            {currentVariant?.unit && (
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>
                /{currentVariant.unit}
              </Typography>
            )}
          </Box>

          {/* Add to Cart Button */}
          <Button
            variant="contained"
            size="small"
            onClick={() => handleAddToCart(product)}
            disabled={isOutOfStock || !currentVariant || currentVariant.stockQuantity <= 0}
            startIcon={<ShoppingCart sx={{ fontSize: "15px !important" }} />}
            sx={{
              fontWeight: 700,
              fontSize: "0.78rem",
              borderRadius: "20px",
              px: 2.5,
              py: 0.85,
              flexShrink: 0,
              bgcolor: "#b45309",
              color: "#fff",
              boxShadow: "0 3px 10px rgba(180,83,9,0.3)",
              "&:hover": {
                bgcolor: "#92400e",
                boxShadow: "0 4px 14px rgba(180,83,9,0.4)",
              },
              "&:disabled": {
                bgcolor: "#e2e8f0",
                color: "#94a3b8",
                boxShadow: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
