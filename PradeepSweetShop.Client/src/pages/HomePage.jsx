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
  const specials = products.slice(0, 3);

  return (
    <Box>
      {/* HERO SECTION */}
      <Box sx={{ bgcolor: "primary.light", py: { xs: 8, md: 12 }, borderBottom: "1px solid #fde68a" }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Box>
                  <Chip
                    label="Traditional Taste, Modern Hygiene"
                    color="primary"
                    sx={{ fontWeight: 700, textTransform: "uppercase", fontSize: 11, px: 1 }}
                  />
                </Box>
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: 40, md: 56 }, color: "secondary.dark", fontWeight: 900, lineHeight: 1.15 }}
                >
                  Celebrate Life with{" "}
                  <Box component="span" sx={{ color: "primary.main" }}>
                    Pure Sweets
                  </Box>
                </Typography>
                <Typography variant="body1" sx={{ fontSize: 18, color: "secondary.light", maxWidth: 540 }}>
                  Welcome to Pradeep Sweets House. Indulge in our premium range of Ghee Laddu, Cashew
                  Katli, soft Bengali Rasgulla, and fresh savories crafted by master chefs.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => setCurrentPage("shop")}
                    endIcon={<ShoppingBag />}
                  >
                    Order Fresh Sweets Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => setCurrentPage("track")}
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
                    opacity: 0.1,
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
                    boxShadow: "0 20px 40px rgba(180, 83, 9, 0.15)",
                    border: "6px solid #fff",
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
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
            Browse Sweet Categories
          </Typography>
          <Typography variant="body1" color="text.secondary">
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
              onClick={() => {
                handleCategorySelect(cat.id);
                setCurrentPage("shop");
              }}
              sx={{
                textAlign: "center",
                p: 3,
                cursor: "pointer",
                transition: "all 0.3s",
                bgcolor: "#fffdf9",
                border: "1px solid rgba(180, 83, 9, 0.08)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 25px rgba(180, 83, 9, 0.1)",
                  bgcolor: "primary.light",
                },
              }}
            >
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, mx: "auto", mb: 2, boxShadow: 1 }}>
                <Layers />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
                {cat.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
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
          bgcolor: "#f8fafc",
          py: 10,
          borderTop: "1px solid #f1f5f9",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 5 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Today's Sweet Specials
              </Typography>
              <Typography variant="body1" color="text.secondary">
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
            {
              icon: <CheckCircle />,
              title: "100% Pure Desi Ghee",
              desc: "We use only premium quality ingredients and 100% pure milk fat (Desi Ghee) for traditional flavor.",
            },
            {
              icon: <AccessTime />,
              title: "Real-Time Tracking",
              desc: "Monitor your order's status in real-time from the moment it is confirmed until it reaches your door.",
            },
            {
              icon: <LocalShipping />,
              title: "Hygienic Home Delivery",
              desc: "Our deliveries are handled securely following contact-free and high hygienic packaging standards.",
            },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #f1f5f9" }}>
                <Avatar
                  sx={{ bgcolor: "primary.light", color: "primary.main", width: 48, height: 48, mx: "auto", mb: 2 }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
