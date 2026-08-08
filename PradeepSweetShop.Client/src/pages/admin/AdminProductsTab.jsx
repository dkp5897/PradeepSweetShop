import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import { api } from "../../api";

export default function AdminProductsTab({ adminProducts, adminCategories, fetchAdminData }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", categoryId: "", imageUrl: "", isActive: true, prices: [],
  });
  const [newVariantUnit, setNewVariantUnit] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantStock, setNewVariantStock] = useState("100");
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);

  const cancelVariantEdit = () => {
    setEditingVariantIndex(null);
    setNewVariantUnit("");
    setNewVariantPrice("");
    setNewVariantStock("100");
  };

  const openAddModal = () => {
    setEditingProduct(null);
    cancelVariantEdit();
    setFormData({
      name: "", description: "",
      categoryId: adminCategories.length > 0 ? adminCategories[0].id.toString() : "",
      imageUrl: "", isActive: true, prices: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    cancelVariantEdit();
    setFormData({
      name: prod.name, description: prod.description || "",
      categoryId: prod.categoryId.toString(), imageUrl: prod.imageUrl || "",
      isActive: prod.isActive, prices: [...prod.prices],
    });
    setIsModalOpen(true);
  };

  const addVariantToForm = () => {
    if (!newVariantUnit || !newVariantPrice) { alert("Please enter unit and price."); return; }
    const price = parseFloat(newVariantPrice);
    if (isNaN(price) || price <= 0) { alert("Please enter a valid price."); return; }
    const stock = parseInt(newVariantStock);
    setFormData((prev) => ({
      ...prev,
      prices: [...prev.prices, { id: 0, unit: newVariantUnit, price, stockQuantity: isNaN(stock) ? 100 : stock, isAvailable: true }],
    }));
    cancelVariantEdit();
  };

  const startEditVariant = (idx) => {
    const variant = formData.prices[idx];
    setEditingVariantIndex(idx);
    setNewVariantUnit(variant.unit);
    setNewVariantPrice(variant.price.toString());
    setNewVariantStock(variant.stockQuantity.toString());
  };

  const saveVariantEdit = () => {
    if (!newVariantUnit || !newVariantPrice) { alert("Please enter unit and price."); return; }
    const price = parseFloat(newVariantPrice);
    if (isNaN(price) || price <= 0) { alert("Please enter a valid price."); return; }
    const stock = parseInt(newVariantStock);
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.map((pr, i) =>
        i === editingVariantIndex
          ? { ...pr, unit: newVariantUnit, price, stockQuantity: isNaN(stock) ? 100 : stock }
          : pr
      ),
    }));
    cancelVariantEdit();
  };

  const removeVariantFromForm = (idx) => {
    if (editingVariantIndex === idx) cancelVariantEdit();
    setFormData((prev) => ({ ...prev, prices: prev.prices.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    if (formData.prices.length === 0) { alert("At least one pricing variant is required."); return; }
    const payload = {
      name: formData.name, description: formData.description, categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl, isActive: formData.isActive, prices: formData.prices,
    };
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      cancelVariantEdit();
      await fetchAdminData();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;
    try {
      await api.deleteProduct(id);
      await fetchAdminData();
    } catch (err) {
      alert("Failed to delete sweet: " + err.message);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
          Configure pricing variants in grams, kilograms, or piece count.
        </Typography>
        <Button
          variant="contained"
          onClick={openAddModal}
          startIcon={<Add />}
          sx={{
            borderRadius: 20,
            px: 3,
            background: "linear-gradient(135deg, #b45309, #f59e0b)",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 4px 12px rgba(180,83,9,0.3)",
            "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)", boxShadow: "0 6px 16px rgba(180,83,9,0.4)" },
          }}
        >
          Add Sweet
        </Button>
      </Stack>

      {/* Products Grid */}
      <Grid container spacing={2.5}>
        {adminProducts.map((prod) => (
          <Grid item xs={12} sm={6} md={4} key={prod.id}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: isDark ? "#13151e" : "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: isDark ? "rgba(180,83,9,0.3)" : "rgba(180,83,9,0.2)",
                  boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.3)" : "0 8px 24px rgba(180,83,9,0.08)",
                },
              }}
            >
              {/* Image */}
              <Box sx={{ height: 140, position: "relative", overflow: "hidden" }}>
                <Box
                  component="img"
                  src={prod.imageUrl || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400"}
                  alt={prod.name}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400"; }}
                />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
                <Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 8, right: 8 }}>
                  <Chip
                    label={prod.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      height: 20, fontSize: 10, fontWeight: 700,
                      bgcolor: prod.isActive ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)",
                      color: "#fff", backdropFilter: "blur(4px)",
                    }}
                  />
                </Stack>
                <Chip
                  label={prod.categoryName}
                  size="small"
                  sx={{ position: "absolute", bottom: 8, left: 8, height: 20, fontSize: 10, fontWeight: 700, bgcolor: "rgba(0,0,0,0.5)", color: "#fff", backdropFilter: "blur(4px)" }}
                />
              </Box>

              {/* Content */}
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "text.primary", mb: 1, lineHeight: 1.3 }} noWrap>
                  {prod.name}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5, mb: 1.5 }}>
                  {prod.prices.map((pr) => (
                    <Chip
                      key={pr.id}
                      label={`${pr.unit}: ₹${pr.price}`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: 10, fontWeight: 600, borderRadius: 1.5, borderColor: theme.palette.divider }}
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button
                    fullWidth variant="outlined" size="small" startIcon={<Edit sx={{ fontSize: "14px !important" }} />}
                    onClick={() => openEditModal(prod)}
                    sx={{ borderRadius: 2, fontSize: 12, fontWeight: 600, borderColor: theme.palette.divider, color: "text.secondary" }}
                  >
                    Edit
                  </Button>
                  <Button
                    fullWidth variant="outlined" size="small" color="error" startIcon={<Delete sx={{ fontSize: "14px !important" }} />}
                    onClick={() => handleDelete(prod.id)}
                    sx={{ borderRadius: 2, fontSize: 12, fontWeight: 600 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Dialog */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => { setIsModalOpen(false); cancelVariantEdit(); }} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Sweet"}
            </Typography>
            <IconButton onClick={() => { setIsModalOpen(false); cancelVariantEdit(); }} size="small"><Close /></IconButton>
          </DialogTitle>

          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Sweet Name *" required size="small" value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="dialog-cat-label">Category *</InputLabel>
                    <Select labelId="dialog-cat-label" value={formData.categoryId} label="Category *"
                      onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))} sx={{ fontWeight: 600 }}>
                      {adminCategories.map((c) => (<MenuItem key={c.id} value={c.id.toString()}>{c.name}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField fullWidth label="Description" multiline rows={2} size="small" value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />

              <TextField fullWidth label="Image URL" size="small" value={formData.imageUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/..." />

              <FormControlLabel
                control={<Checkbox checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} color="primary" />}
                label="Available / Active on Menu"
              />

              {/* Pricing Variants */}
              <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                  Pricing Units {editingVariantIndex !== null && "(Editing Selected Unit)"}
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-end"
                  sx={{
                    p: 2, borderRadius: 2, mb: 2, transition: "all 0.2s ease",
                    bgcolor: editingVariantIndex !== null ? (isDark ? "rgba(180,83,9,0.15)" : "#fef3c7") : (isDark ? "rgba(255,255,255,0.03)" : "#f8fafc"),
                    border: editingVariantIndex !== null ? "1px solid #f59e0b" : `1px solid ${theme.palette.divider}`,
                  }}>
                  <TextField size="small" label="Unit Name" placeholder="e.g. 500 Gm" value={newVariantUnit} onChange={(e) => setNewVariantUnit(e.target.value)} />
                  <TextField size="small" label="Price (₹)" placeholder="e.g. 250" type="number" value={newVariantPrice} onChange={(e) => setNewVariantPrice(e.target.value)} />
                  <TextField size="small" label="Stock" placeholder="e.g. 100" type="number" value={newVariantStock} onChange={(e) => setNewVariantStock(e.target.value)} />
                  {editingVariantIndex === null ? (
                    <Button variant="contained" size="small" onClick={addVariantToForm} sx={{ minWidth: 80, borderRadius: 2, fontWeight: 600 }}>
                      Add
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="success" size="small" onClick={saveVariantEdit} sx={{ minWidth: 70, borderRadius: 2, fontWeight: 600 }}>
                        Update
                      </Button>
                      <Button variant="outlined" size="small" onClick={cancelVariantEdit} sx={{ minWidth: 60, borderRadius: 2 }}>
                        Cancel
                      </Button>
                    </Stack>
                  )}
                </Stack>

                {formData.prices.length === 0 ? (
                  <Typography variant="caption" color="error" sx={{ fontStyle: "italic", display: "block", textAlign: "center" }}>
                    At least one pricing option is required.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Unit</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Stock</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.prices.map((pr, idx) => (
                          <TableRow
                            key={idx}
                            sx={{
                              bgcolor: editingVariantIndex === idx ? (isDark ? "rgba(180,83,9,0.2)" : "#fff8e1") : "transparent",
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{pr.unit}</TableCell>
                            <TableCell sx={{ fontSize: 13 }}>₹{pr.price}</TableCell>
                            <TableCell sx={{ fontSize: 13 }}>{pr.stockQuantity}</TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <IconButton size="small" color="primary" onClick={() => startEditVariant(idx)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => removeVariantFromForm(idx)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => { setIsModalOpen(false); cancelVariantEdit(); }} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: 2, background: "linear-gradient(135deg, #b45309, #f59e0b)", fontWeight: 700 }}>
                Save Sweet
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
