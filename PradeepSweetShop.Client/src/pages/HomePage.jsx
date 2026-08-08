import React from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  Card,
  CardMedia,
  Avatar,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import {
  ShoppingBag,
  CheckCircle,
  AccessTime,
  LocalShipping,
  Layers,
  ChevronRight,
} from "@mui/icons-material";
import ProductCard from "../components/ProductCard";

export default function HomePage({ setCurrentPage, categories, handleCategorySelect, products, handleAddToCart }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const specials = products.slice(0, 3);

  return (
    <Box>
      {/* HERO SECTION */}
      <Box
        sx={{
          bgcolor: isDark ? "rgba(180,83,9,0.06)" : "primary.light",
          py: { xs: 8, md: 12 },
          borderBottom: `1px solid ${isDark ? "rgba(180,83,9,0.15)" : "#fde68a"}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Box>
                  <Chip
                    label="Traditional Taste, Modern Hygiene"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: 11,
                      px: 1,
                      bgcolor: isDark ? "rgba(180,83,9,0.2)" : undefined,
                      color: isDark ? "#fbbf24" : undefined,
                    }}
                    color={isDark ? undefined : "primary"}
                  />
                </Box>
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: 40, md: 56 }, color: "text.primary", fontWeight: 900, lineHeight: 1.15 }}
                >
                  Celebrate Life with{" "}
                  <Box component="span" sx={{ color: "primary.main" }}>
                    Pure Sweets
                  </Box>
                </Typography>
                <Typography variant="body1" sx={{ fontSize: 18, color: "text.secondary", maxWidth: 540 }}>
                  Welcome to Pradeep Sweets House. Indulge in our premium range of Ghee Laddu, Cashew
                  Katli, soft Bengali Rasgulla, and fresh savories crafted by master chefs.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setCurrentPage("shop")}
                    endIcon={<ShoppingBag />}
                    sx={{
                      background: "linear-gradient(135deg, #b45309, #f59e0b)",
                      boxShadow: "0 4px 12px rgba(180,83,9,0.3)",
                      "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    Order Fresh Sweets Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => setCurrentPage("track")}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Track Live Order
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center" }}>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    inset: -15,
                    bgcolor: "primary.main",
                    opacity: isDark ? 0.06 : 0.1,
                    borderRadius: "50%",
                    filter: "blur(30px)",
                  }}
                />
                <CardMedia
                  component="img"
                  image="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"
                  alt="Assorted Sweets"
                  sx={{
                    width: { xs: 320, sm: 400 },
                    height: 360,
                    borderRadius: 8,
                    boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(180, 83, 9, 0.15)",
                    border: `6px solid ${isDark ? "rgba(255,255,255,0.06)" : "#fff"}`,
                    position: "relative",
                    zIndex: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CATEGORIES SECTION */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
            Browse Sweet Categories
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Pick your favorite category to explore mouth-watering fresh varieties.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
            gap: 2,
          }}
        >
          {categories.map((cat) => (
            <Card
              key={cat.id}
              onClick={() => { handleCategorySelect(cat.id); setCurrentPage("shop"); }}
              sx={{
                textAlign: "center",
                p: 3,
                cursor: "pointer",
                transition: "all 0.3s",
                bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fffdf9",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(180,83,9,0.08)"}`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark ? "0 10px 25px rgba(0,0,0,0.3)" : "0 10px 25px rgba(180,83,9,0.1)",
                  bgcolor: isDark ? "rgba(180,83,9,0.1)" : "primary.light",
                },
              }}
            >
              <Avatar
                sx={{
                  background: "linear-gradient(135deg, #b45309, #f59e0b)",
                  width: 56, height: 56, mx: "auto", mb: 2,
                  boxShadow: "0 4px 12px rgba(180,83,9,0.25)",
                }}
              >
                <Layers />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
                {cat.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}
              >
                {cat.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>

      {/* TODAY'S SPECIALS */}
      <Box
        sx={{
          bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
          py: 10,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 5 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
                Today's Sweet Specials
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                Handcrafted and fresh from our kitchen today.
              </Typography>
            </Box>
            <Button color="primary" onClick={() => setCurrentPage("shop")} endIcon={<ChevronRight />}>
              View Entire Menu
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {specials.map((product) => (
              <ProductCard key={product.id} product={product} handleAddToCart={handleAddToCart} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* VALUE HIGHLIGHTS */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          {[
            { icon: <CheckCircle />, title: "100% Pure Desi Ghee", desc: "We use only premium quality ingredients and 100% pure milk fat (Desi Ghee) for traditional flavor." },
            { icon: <AccessTime />, title: "Real-Time Tracking", desc: "Monitor your order's status in real-time from the moment it is confirmed until it reaches your door." },
            { icon: <LocalShipping />, title: "Hygienic Home Delivery", desc: "Our deliveries are handled securely following contact-free and high hygienic packaging standards." },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(180,83,9,0.08)" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: isDark ? "rgba(180,83,9,0.15)" : "primary.light",
                    color: "primary.main",
                    width: 48, height: 48, mx: "auto", mb: 2,
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
