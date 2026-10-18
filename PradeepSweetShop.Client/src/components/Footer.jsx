
import {
  Box,
  Container,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import { Store, Phone, Place } from "@mui/icons-material";

export default function Footer({ setCurrentPage, shop }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDark ? "#0a0c14" : "#0f172a",
        color: "grey.400",
        pt: 3.5,
        pb: 2.25,
        borderTop: "3px solid #b45309",
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "1.3fr 0.8fr 1.1fr 1.2fr",
            },
            gap: { xs: 2.5, sm: 3, md: 4 },
            alignItems: "start",
            mb: 2.5,
          }}
        >
          {/* Brand */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Store sx={{ color: "primary.main", fontSize: 22 }} />
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>
                Pradeep Sweets
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.5, color: "grey.400", fontSize: 13, maxWidth: 300 }}>
              Traditional sweets and fresh savories from Pradeep Sweets House.
            </Typography>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", fontWeight: 800, mb: 1, textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {[
                { label: "Home", page: "home" },
                { label: "Menu Shop", page: "shop" },
                { label: "Track Order", page: "track" },
                { label: "Admin Login", page: "admin-login" },
              ].map((link) => (
                <Typography
                  component="button"
                  key={link.page}
                  variant="body2"
                  onClick={() => setCurrentPage(link.page)}
                  sx={{
                    cursor: "pointer",
                    border: 0,
                    background: "transparent",
                    padding: 0,
                    font: "inherit",
                    fontSize: 13,
                    color: "grey.400",
                    transition: "color 0.2s ease",
                    "&:hover": { color: "#fff" },
                    width: "fit-content",
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Working Hours */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", fontWeight: 800, mb: 1, textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}
            >
              Working Hours
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Typography variant="body2" sx={{ fontSize: 13, color: "grey.400" }}>
                {shop?.openingHours || "Loading shop hours..."}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 13, color: "grey.400" }}>
                {shop ? `Estimated delivery: ${shop.estimatedDeliveryMinutes} minutes` : ""}
              </Typography>
              <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, fontSize: 12 }}>
                {shop ? `Local delivery to ${shop.deliveryPincodes.join(", ")}` : "Fresh batches prepared daily."}
              </Typography>
            </Box>
          </Box>

          {/* Contact */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", fontWeight: 800, mb: 1, textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}
            >
              Get in Touch
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, color: "grey.400" }}>
                <Phone sx={{ fontSize: 15 }} /> {shop?.phone && <a href={`tel:+91${shop.phone}`} style={{ color: "inherit" }}>{shop.phone}</a>}
              </Typography>
              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, color: "grey.400" }}>
                <Place sx={{ fontSize: 15 }} /> {shop?.address || "Loading shop address..."}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.75 }} />
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", color: "grey.600", fontSize: 11.5 }}
        >
          © {new Date().getFullYear()} Pradeep Sweets House. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
