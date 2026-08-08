import React from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Paper,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Search, FilterList, Warning } from "@mui/icons-material";
import ProductCard from "../components/ProductCard";

export default function ShopPage({
  products,
  categories,
  selectedCategory,
  handleCategorySelect,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  loadingProducts,
  setProducts,
  handleAddToCart,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Container maxWidth="lg" sx={{ minHeight: "80vh" }}>

      {/* Page Header + Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
            Fresh Sweet Menu
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Explore our range of traditional sweets, dry fruits, and hot snacks.
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: "flex", gap: 1, width: { xs: "100%", md: 400 }, flexShrink: 0 }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search sweets (e.g. Kaju, Laddu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 2,
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Category Filter Chips */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
          flexWrap: "nowrap",
          overflowX: "auto",
          mb: 4,
          pb: 1,
          "&::-webkit-scrollbar": { height: 3 },
          "&::-webkit-scrollbar-thumb": { bgcolor: theme.palette.divider, borderRadius: 4 },
        }}
      >
        <FilterList sx={{ color: "text.secondary", fontSize: 20, flexShrink: 0 }} />

        {[{ id: null, name: "All Sweets" }, ...categories].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Chip
              key={cat.id ?? "all"}
              label={cat.name}
              clickable
              onClick={() => handleCategorySelect(cat.id)}
              sx={{
                flexShrink: 0,
                fontWeight: 700,
                fontSize: "0.8rem",
                height: 34,
                borderRadius: "17px",
                bgcolor: isActive ? "#b45309" : isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                color: isActive ? "#fff" : "text.secondary",
                border: "none",
                boxShadow: isActive ? "0 2px 8px rgba(180,83,9,0.3)" : "none",
                "&:hover": {
                  bgcolor: isActive ? "#92400e" : isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                },
                transition: "all 0.18s ease",
              }}
            />
          );
        })}
      </Box>

      {/* Products */}
      {loadingProducts ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                height: 420,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fafaf8",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CircularProgress sx={{ color: "primary.main" }} />
            </Paper>
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fff",
          }}
        >
          <Warning color="warning" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
            No Sweets Found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            We couldn't find any sweets matching your selection. Try clearing filters.
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 3, borderRadius: 2,
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
            }}
            onClick={() => handleCategorySelect(null)}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleAddToCart={handleAddToCart}
              onVariantChange={(variant) => {
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === product.id ? { ...p, selectedVariant: variant } : p
                  )
                );
              }}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
