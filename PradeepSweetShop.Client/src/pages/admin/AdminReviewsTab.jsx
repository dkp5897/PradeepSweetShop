import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
} from "@mui/material";
import { Search, Delete, Star, RateReview } from "@mui/icons-material";
import { api } from "../../api";

export default function AdminReviewsTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminReviews();
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to load admin reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.deleteReview(deleteTarget.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setAlertMsg(`Review by ${deleteTarget.customerName} has been deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete review: " + (err.message || "Error occurred"));
    } finally {
      setDeleting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.productName && r.productName.toLowerCase().includes(term)) ||
      (r.customerName && r.customerName.toLowerCase().includes(term)) ||
      (r.comment && r.comment.toLowerCase().includes(term))
    );
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? "#fff" : "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
            <RateReview sx={{ color: "#b45309" }} /> Customer Reviews & Ratings
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}>
            Monitor and moderate all customer sweet reviews
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 280 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
              color: isDark ? "#fff" : "#0f172a",
            },
          }}
        />
      </Box>

      {alertMsg && (
        <Alert severity="success" onClose={() => setAlertMsg("")} sx={{ mb: 3, borderRadius: 2 }}>
          {alertMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={32} sx={{ color: "#b45309" }} />
        </Box>
      ) : filteredReviews.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: isDark ? "#13151c" : "#fff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f0ed"}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDark ? "#fff" : "#0f172a" }}>
            No Reviews Found
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            {search ? "No customer reviews match your search." : "No customer reviews have been posted yet."}
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            bgcolor: isDark ? "#13151c" : "#fff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f0ed"}`,
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>Sweet Product</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>Review / Comment</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews.map((r) => (
                <TableRow key={r.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? "#fff" : "#0f172a" }}>
                    {r.productName}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? "#fff" : "#0f172a" }}>
                      {r.customerName}
                    </Typography>
                    {r.customerEmail && (
                      <Typography variant="caption" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
                        {r.customerEmail}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Rating value={r.rating} readOnly precision={0.5} size="small" emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.8)" : "#334155" }}>
                      {r.comment || <Typography component="span" variant="caption" sx={{ fontStyle: "italic", opacity: 0.5 }}>(No comment written)</Typography>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b", fontSize: 13 }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Review">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(r)}
                        sx={{
                          bgcolor: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                          "&:hover": { bgcolor: isDark ? "rgba(239,68,68,0.2)" : "#fee2e2" },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the review by <strong>{deleteTarget?.customerName}</strong> for <strong>{deleteTarget?.productName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
