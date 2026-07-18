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
  return (
    <Container maxWidth="lg" sx={{ minHeight: "80vh" }}>

      {/* ── Page Header + Search ── */}
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
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
            Fresh Sweet Menu
          </Typography>
          <Typography variant="body1" color="text.secondary">
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
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="primary" type="submit" sx={{ whiteSpace: "nowrap" }}>
            Search
          </Button>
        </Box>
      </Box>

      {/* ── Category Filter Chips ── */}
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
          "&::-webkit-scrollbar-thumb": { bgcolor: "#e2e8f0", borderRadius: 4 },
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
                bgcolor: isActive ? "#b45309" : "#f1f5f9",
                color: isActive ? "#fff" : "#64748b",
                border: "none",
                boxShadow: isActive ? "0 2px 8px rgba(180,83,9,0.3)" : "none",
                "&:hover": {
                  bgcolor: isActive ? "#92400e" : "#e2e8f0",
                  boxShadow: isActive ? "0 2px 8px rgba(180,83,9,0.4)" : "none",
                },
                transition: "all 0.18s ease",
              }}
            />
          );
        })}
      </Box>

      {/* ── Products ── */}
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
              variant="outlined"
              sx={{
                height: 420,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                bgcolor: "#fafaf8",
              }}
            >
              <CircularProgress color="primary" />
            </Paper>
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ border: "1px solid #f1f5f9", p: 8, textAlign: "center", borderRadius: 4 }}
        >
          <Warning color="warning" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            No Sweets Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We couldn't find any sweets matching your selection. Try clearing filters.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => handleCategorySelect(null)}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
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
