import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Stack,
} from "@mui/material";
import { Store } from "@mui/icons-material";
import { api } from "../../api";

export default function AdminLoginPage({ setAdminUser, setAdminToken, setCurrentPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.loginAdmin(username, password);
      localStorage.setItem("admin_token", response.token);
      localStorage.setItem(
        "admin_user",
        JSON.stringify({ username: response.username, fullName: response.fullName })
      );

      setAdminToken(response.token);
      setAdminUser({ username: response.username, fullName: response.fullName });
      setCurrentPage("admin");
    } catch (err) {
      setError(err.message || "Unauthorized. Please check username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }} variant="outlined">
        <Stack alignItems="center" sx={{ mb: 4 }}>
          <Store color="primary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Admin Access
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: "center" }}>
            Provide secure credentials for sweet portal.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleLoginSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            fullWidth
            label="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mt: 1 }}
          >
            {loading ? "Authenticating..." : "Login Securely"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
