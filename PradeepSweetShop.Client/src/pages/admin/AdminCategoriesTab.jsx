import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { api } from "../../api";

export default function AdminCategoriesTab({ adminCategories, fetchAdminData }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (editingId) {
        await api.updateCategory(editingId, { id: editingId, name, description, isActive: true });
        alert("Category updated successfully!");
      } else {
        await api.createCategory({ name, description, isActive: true });
        alert("Category created successfully!");
      }
      setName("");
      setDescription("");
      setEditingId(null);
      await fetchAdminData();
    } catch (err) {
      alert("Error saving category: " + err.message);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await api.deleteCategory(id);
      alert(response.message);
      await fetchAdminData();
    } catch (err) {
      alert("Failed to delete category: " + err.message);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ mb: 4, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Manage Categories
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Define broad groupings (e.g. Bengali sweets, snacks) for user menus.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Category Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 3 }} elevation={0} variant="outlined">
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              {editingId ? "Edit Category" : "Add New Category"}
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                fullWidth
                label="Category Name *"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  {editingId ? "Save" : "Create"}
                </Button>
                {editingId && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingId(null);
                      setName("");
                      setDescription("");
                    }}
                    fullWidth
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Categories Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminCategories.map((cat) => (
                  <TableRow key={cat.id} hover>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>{cat.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 12 }}>
                      {cat.description || "--"}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button size="small" variant="text" onClick={() => handleEdit(cat)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}
