import React from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { Store, Phone, Mail, Place } from "@mui/icons-material";

export default function Footer({ setCurrentPage }) {
  return (
    <Box
      sx={{
        bgcolor: "secondary.dark",
        color: "grey.400",
        pt: 8,
        pb: 4,
        borderTop: "4px solid #b45309",
        mt: 10,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>

          {/* Brand */}
          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Store sx={{ color: "primary.main", fontSize: 28 }} />
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
                  Pradeep Sweets
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ lineHeight: 1.6, display: "block" }}>
                Delivering authentic taste, rich flavor, and absolute hygienic sweets across town since
                1995.
              </Typography>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", fontWeight: 800, mb: 2, textTransform: "uppercase" }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1} sx={{ fontSize: 13 }}>
              <Typography
                onClick={() => setCurrentPage("home")}
                sx={{ cursor: "pointer", "&:hover": { color: "#fff" } }}
              >
                Home
              </Typography>
              <Typography
                onClick={() => setCurrentPage("shop")}
                sx={{ cursor: "pointer", "&:hover": { color: "#fff" } }}
              >
                Menu Shop
              </Typography>
              <Typography
                onClick={() => setCurrentPage("track")}
                sx={{ cursor: "pointer", "&:hover": { color: "#fff" } }}
              >
                Track Order
              </Typography>
              <Typography
                onClick={() => setCurrentPage("admin-login")}
                sx={{ cursor: "pointer", "&:hover": { color: "#fff" } }}
              >
                Admin Login
              </Typography>
            </Stack>
          </Grid>

          {/* Working Hours */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", fontWeight: 800, mb: 2, textTransform: "uppercase" }}
            >
              Working Hours
            </Typography>
            <Stack spacing={1} sx={{ fontSize: 13 }}>
              <Typography>Monday - Saturday: 8:00 AM - 10:00 PM</Typography>
              <Typography>Sunday Specials: 7:00 AM - 10:00 PM</Typography>
              <Typography sx={{ color: "primary.main" }}>Fresh batches delivered daily.</Typography>
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", fontWeight: 800, mb: 2, textTransform: "uppercase" }}
            >
              Get in Touch
            </Typography>
            <Stack spacing={1} sx={{ fontSize: 13 }}>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone fontSize="inherit" /> +91 98765 43210
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail fontSize="inherit" /> contact@pradeepsweets.com
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Place fontSize="inherit" /> Main Bazar Road, Delhi, IN
              </Typography>
            </Stack>
          </Grid>

        </Grid>

        <Divider sx={{ borderColor: "grey.800", mb: 3 }} />
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", color: "grey.600" }}
        >
          © {new Date().getFullYear()} Pradeep Sweets House. All rights reserved. Secure real-time
          e-commerce setup.
        </Typography>
      </Container>
    </Box>
  );
}
