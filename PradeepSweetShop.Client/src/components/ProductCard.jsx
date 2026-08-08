import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Rating,
  useTheme,
} from "@mui/material";
import { ShoppingCart, Star } from "@mui/icons-material";
import ProductReviewModal from "./ProductReviewModal";

const PLACEHOLDER_GRADIENT =
  "linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fbbf24 100%)";

export default function ProductCard({ product, handleAddToCart, onVariantChange, onReviewSubmitted }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const currentVariant = product.selectedVariant;
  const isOutOfStock =
    !product.prices ||
    product.prices.length === 0 ||
    !product.prices.some((pr) => pr.isAvailable && pr.stockQuantity > 0);

  return (
    <>
      <Box
        sx={{
          height: 460,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: isDark ? "#13151c" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f1f0ed"}`,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(180,83,9,0.06)",
          transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 14px 36px rgba(180,83,9,0.13)",
            borderColor: isDark ? "rgba(180,83,9,0.4)" : "rgba(180,83,9,0.2)",
          },
        }}
      >
        {/* IMAGE ZONE */}
        <Box
          sx={{
            position: "relative",
            height: 200,
            flexShrink: 0,
            overflow: "hidden",
            bgcolor: isDark ? "#1e1a12" : "#fef3c7",
          }}
        >
          {product.imageUrl ? (
            <Box
              component="img"
              src={product.imageUrl}
              alt={product.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
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
              <Typography sx={{ fontSize: 48 }} role="img" aria-label="sweets">🍮</Typography>
            </Box>
          )}

          {/* Gradient overlay */}
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)" }} />

          {/* Category badge */}
          <Box sx={{ position: "absolute", top: 10, left: 10 }}>
            <Chip
              label={product.categoryName}
              size="small"
              sx={{
                bgcolor: "rgba(0,0,0,0.45)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 10,
                height: 22,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
          </Box>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(15,23,42,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(3px)",
              }}
            >
              <Chip
                label="Out of Stock"
                sx={{ bgcolor: "#ef4444", color: "#fff", fontWeight: 800, fontSize: 12, height: 28 }}
              />
            </Box>
          )}
        </Box>

        {/* CONTENT ZONE */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: "14px 16px 16px",
            overflow: "hidden",
          }}
        >
          {/* Product name */}
          <Typography
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.3,
              color: isDark ? "#f1f5f9" : "#0f172a",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 0.5,
            }}
          >
            {product.name}
          </Typography>

          {/* Rating & Review trigger */}
          <Box
            onClick={() => setReviewModalOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: 0.75,
              cursor: "pointer",
              width: "fit-content",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Rating
              value={product.averageRating || 0}
              precision={0.1}
              readOnly
              size="small"
              emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#b45309", fontSize: "0.75rem" }}>
              {product.averageRating > 0 ? product.averageRating.toFixed(1) : "New"}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8", fontSize: "0.75rem" }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>

          {/* Description */}
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
              lineHeight: 1.5,
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
          <Box sx={{ borderTop: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "#f1f0ed"}`, mt: 1.5, mb: 1.5 }} />

          {/* Variant Selector */}
          {product.prices && product.prices.length > 0 && (
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel
                id={`vl-${product.id}`}
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: isDark ? "rgba(255,255,255,0.4)" : "#92400e",
                  "&.Mui-focused": { color: "#b45309" },
                }}
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
                  bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#fffbf5",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#fde68a",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#b45309",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#b45309" },
                  "& .MuiSvgIcon-root": { color: isDark ? "rgba(255,255,255,0.4)" : "#b45309" },
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

          {/* Price + Add Button */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                <Typography sx={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8", fontWeight: 600 }}>
                  /{currentVariant.unit}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock || !currentVariant || currentVariant.stockQuantity <= 0}
              startIcon={<ShoppingCart sx={{ fontSize: "15px !important" }} />}
              sx={{
                fontWeight: 700,
                fontSize: "0.78rem",
                borderRadius: 20,
                px: 2.5,
                py: 0.85,
                flexShrink: 0,
                background: "linear-gradient(135deg, #b45309, #f59e0b)",
                color: "#fff",
                boxShadow: "0 3px 10px rgba(180,83,9,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #92400e, #d97706)",
                  boxShadow: "0 5px 15px rgba(180,83,9,0.5)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": { bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0", color: isDark ? "rgba(255,255,255,0.2)" : "#94a3b8", boxShadow: "none" },
                transition: "all 0.2s ease",
              }}
            >
              Add to Cart
            </Button>
          </Box>
        </Box>
      </Box>

      <ProductReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={product}
        onReviewSubmitted={onReviewSubmitted}
      />
    </>
  );
}
