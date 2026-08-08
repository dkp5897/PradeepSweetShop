import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Rating,
  Button,
  TextField,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from "@mui/material";
import { Close, Star, RateReview, Person } from "@mui/icons-material";
import { api } from "../api";

export default function ProductReviewModal({ open, onClose, product, onReviewSubmitted }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (open && product?.id) {
      loadReviews();
      setSuccessMsg("");
      setError("");
    }
  }, [open, product?.id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getProductReviews(product.id);
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!rating || rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const newReview = await api.submitReview(product.id, {
        customerName,
        customerEmail,
        rating,
        comment,
      });

      setSuccessMsg("Thank you! Your review has been submitted successfully.");
      setReviews((prev) => [newReview, ...prev]);
      
      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setRating(5);
      setComment("");

      // Notify parent to refresh product rating
      if (onReviewSubmitted) {
        onReviewSubmitted(product.id);
      }
    } catch (err) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: isDark ? "#13151c" : "#fff",
          color: isDark ? "#fff" : "#0f172a",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
          boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.6)" : "0 10px 40px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RateReview sx={{ color: "#b45309" }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, fontFamily: "'Playfair Display', Georgia, serif" }}>
              {product.name}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>
              Ratings & Reviews
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {/* Rating Summary Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: isDark ? "rgba(180,83,9,0.12)" : "#fffbf5",
            border: `1px solid ${isDark ? "rgba(180,83,9,0.3)" : "#fde68a"}`,
          }}
        >
          <Box sx={{ textAlign: "center", minWidth: 80 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#b45309", lineHeight: 1 }}>
              {product.averageRating > 0 ? product.averageRating.toFixed(1) : "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#92400e", fontWeight: 700 }}>
              out of 5
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Rating
              value={product.averageRating || 0}
              precision={0.1}
              readOnly
              size="medium"
              emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />}
            />
            <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.7)" : "#64748b", fontWeight: 600, mt: 0.5 }}>
              {product.reviewCount || 0} customer {product.reviewCount === 1 ? "review" : "reviews"}
            </Typography>
          </Box>
        </Box>

        {/* Add Review Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            ✍️ Leave Your Review
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: isDark ? "rgba(255,255,255,0.7)" : "#334155" }}>
                Your Rating *
              </Typography>
              <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue || 5)}
                size="large"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Your Name *"
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                    color: isDark ? "#fff" : "#0f172a",
                  },
                }}
              />
              <TextField
                label="Email (Optional)"
                size="small"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                    color: isDark ? "#fff" : "#0f172a",
                  },
                }}
              />
            </Box>

            <TextField
              label="Your Comments / Review"
              multiline
              rows={2}
              placeholder="Tell us what you liked about this sweet..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                  color: isDark ? "#fff" : "#0f172a",
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                background: "linear-gradient(135deg, #b45309, #f59e0b)",
                fontWeight: 700,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(180,83,9,0.35)",
                "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
              }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Review"}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3, borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />

        {/* Existing Reviews Section */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          💬 Customer Reviews ({reviews.length})
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress size={28} sx={{ color: "#b45309" }} />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b", fontStyle: "italic", py: 2 }}>
            No reviews yet. Be the first to review this sweet!
          </Typography>
        ) : (
          <Stack spacing={2}>
            {reviews.map((rev) => (
              <Box
                key={rev.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "#b45309", fontSize: 13, fontWeight: 700 }}>
                      {rev.customerName ? rev.customerName[0].toUpperCase() : <Person fontSize="small" />}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {rev.customerName}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Rating value={rev.rating} readOnly precision={0.5} size="small" sx={{ mb: 0.5 }} />

                {rev.comment && (
                  <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.75)" : "#334155", mt: 0.5 }}>
                    "{rev.comment}"
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"}` }}>
        <Button onClick={onClose} sx={{ color: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
