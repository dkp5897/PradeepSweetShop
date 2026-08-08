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
  IconButton,
  useTheme,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { api } from "../../api";

export default function AdminCategoriesTab({ adminCategories, fetchAdminData }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      if (editingId) {
        await api.updateCategory(editingId, { id: editingId, name, description, isActive: true });
      } else {
        await api.createCategory({ name, description, isActive: true });
      }
      setName(""); setDescription(""); setEditingId(null);
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
      await api.deleteCategory(id);
      await fetchAdminData();
    } catch (err) {
      alert("Failed to delete category: " + err.message);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13, mb: 3 }}>
        Define broad groupings (e.g. Bengali sweets, snacks) for user menus.
      </Typography>

      <Grid container spacing={3}>
        {/* Category Form */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? "#13151e" : "#fff",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "text.primary", mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
              <Add sx={{ fontSize: 18, color: "primary.main" }} />
              {editingId ? "Edit Category" : "Add Category"}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth label="Category Name *" required size="small" value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                fullWidth label="Description" multiline rows={3} size="small" value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Button
                  variant="contained" type="submit" fullWidth
                  sx={{
                    borderRadius: 2, fontWeight: 700,
                    background: "linear-gradient(135deg, #b45309, #f59e0b)",
                    "&:hover": { background: "linear-gradient(135deg, #92400e, #d97706)" },
                  }}
                >
                  {editingId ? "Save" : "Create"}
                </Button>
                {editingId && (
                  <Button
                    variant="outlined" fullWidth sx={{ borderRadius: 2 }}
                    onClick={() => { setEditingId(null); setName(""); setDescription(""); }}
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
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? "#13151e" : "#fff",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminCategories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    hover
                    sx={{ "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" } }}
                  >
                    <TableCell sx={{ fontWeight: 700, fontSize: 14, py: 2 }}>{cat.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                      {cat.description || "--"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => handleEdit(cat)} sx={{ color: "primary.main" }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
