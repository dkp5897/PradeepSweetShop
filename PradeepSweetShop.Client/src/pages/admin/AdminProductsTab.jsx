import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Card,
  CardMedia,
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
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import { api } from "../../api";

export default function AdminProductsTab({ adminProducts, adminCategories, fetchAdminData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    isActive: true,
    prices: [],
  });

  const [newVariantUnit, setNewVariantUnit] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantStock, setNewVariantStock] = useState("100");

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      categoryId: adminCategories.length > 0 ? adminCategories[0].id.toString() : "",
      imageUrl: "",
      isActive: true,
      prices: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || "",
      categoryId: prod.categoryId.toString(),
      imageUrl: prod.imageUrl || "",
      isActive: prod.isActive,
      prices: [...prod.prices],
    });
    setIsModalOpen(true);
  };

  const addVariantToForm = () => {
    if (!newVariantUnit || !newVariantPrice) {
      alert("Please enter unit and price.");
      return;
    }
    const price = parseFloat(newVariantPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    const stock = parseInt(newVariantStock);

    setFormData((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        { id: 0, unit: newVariantUnit, price, stockQuantity: isNaN(stock) ? 100 : stock, isAvailable: true },
      ],
    }));
    setNewVariantUnit("");
    setNewVariantPrice("");
    setNewVariantStock("100");
  };

  const removeVariantFromForm = (idx) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    if (formData.prices.length === 0) {
      alert("At least one pricing variant is required.");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl,
      isActive: formData.isActive,
      prices: formData.prices,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        alert("Sweet updated successfully!");
      } else {
        await api.createProduct(payload);
        alert("Sweet created successfully!");
      }
      setIsModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;
    try {
      const response = await api.deleteProduct(id);
      alert(response.message);
      await fetchAdminData();
    } catch (err) {
      alert("Failed to delete sweet: " + err.message);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4, pb: 2, borderBottom: "1px solid #f1f5f9" }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Sweets Catalog
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Configure pricing variants in grams, kilograms or piece count.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={openAddModal} startIcon={<Add />}>
          Add New Sweet
        </Button>
      </Stack>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {adminProducts.map((prod) => (
          <Grid item xs={12} sm={6} key={prod.id}>
            <Card variant="outlined" sx={{ display: "flex", p: 2, gap: 2, bgcolor: "#fafbfc" }}>
              <CardMedia
                component="img"
                image={
                  prod.imageUrl ||
                  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200"
                }
                alt={prod.name}
                sx={{ width: 90, height: 90, borderRadius: 2, objectFit: "cover", border: "1px solid #e2e8f0" }}
              />
              <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {prod.name}
                    </Typography>
                    <Chip
                      label={prod.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={prod.isActive ? "success" : "default"}
                      sx={{ height: 18, fontSize: 9, fontWeight: 700 }}
                    />
                  </Stack>
                  <Chip
                    label={prod.categoryName}
                    size="small"
                    sx={{ height: 18, fontSize: 9, fontWeight: 600, mt: 0.5, bgcolor: "primary.light" }}
                  />
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
                    {prod.prices.map((pr) => (
                      <Chip
                        key={pr.id}
                        label={`${pr.unit}: ₹${pr.price}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: 9, fontWeight: 600 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                  sx={{ mt: 1.5, pt: 1, borderTop: "1px solid #f1f5f9" }}
                >
                  <Button variant="text" size="small" startIcon={<Edit />} onClick={() => openEditModal(prod)}>
                    Edit
                  </Button>
                  <Button variant="text" size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(prod.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Dialog */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {editingProduct ? `Edit Sweet: ${editingProduct.name}` : "Add Sweet Product"}
            </Typography>
            <IconButton onClick={() => setIsModalOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>

          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sweet Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="dialog-cat-label">Category *</InputLabel>
                    <Select
                      labelId="dialog-cat-label"
                      value={formData.categoryId}
                      label="Category *"
                      onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                      sx={{ fontWeight: 600 }}
                    >
                      {adminCategories.map((c) => (
                        <MenuItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />

              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Available / Active on Menu"
              />

              {/* Pricing Variants */}
              <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                  Add Pricing Units (e.g. Kg, Piece, Box)
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems="flex-end"
                  sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, mb: 2 }}
                >
                  <TextField
                    size="small"
                    label="Unit Name"
                    placeholder="e.g. 500 Gm"
                    value={newVariantUnit}
                    onChange={(e) => setNewVariantUnit(e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Price (₹)"
                    placeholder="e.g. 250"
                    type="number"
                    value={newVariantPrice}
                    onChange={(e) => setNewVariantPrice(e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Stock Qty"
                    placeholder="e.g. 100"
                    type="number"
                    value={newVariantStock}
                    onChange={(e) => setNewVariantStock(e.target.value)}
                  />
                  <Button variant="contained" size="small" onClick={addVariantToForm} sx={{ minWidth: 100 }}>
                    Add Unit
                  </Button>
                </Stack>

                {formData.prices.length === 0 ? (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ fontStyle: "italic", display: "block", textAlign: "center" }}
                  >
                    At least one pricing option variant is required.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Unit Size</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Stock</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.prices.map((pr, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 700 }}>{pr.unit}</TableCell>
                            <TableCell>₹{pr.price}</TableCell>
                            <TableCell>{pr.stockQuantity}</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="error" onClick={() => removeVariantFromForm(idx)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setIsModalOpen(false)} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Sweet
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Paper>
  );
}
