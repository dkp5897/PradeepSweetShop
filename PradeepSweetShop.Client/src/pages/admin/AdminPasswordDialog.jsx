import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert } from "@mui/material";
import { api } from "../../api";

export default function AdminPasswordDialog({ open, onClose, onChanged }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    if (next !== confirm) { setError("The new passwords must match."); return; }
    setBusy(true); setError("");
    try { await api.changeAdminPassword(current, next); onChanged(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  return <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
    <form onSubmit={submit}>
      <DialogTitle>Change admin password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Current password" type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} disabled={busy} />
          <TextField label="New password" type="password" autoComplete="new-password" required value={next} onChange={e => setNext(e.target.value)} disabled={busy} helperText="Use at least 12 characters. Previous admin sessions will be signed out." slotProps={{ htmlInput: { minLength: 12, maxLength: 200 } }} />
          <TextField label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} disabled={busy} />
        </Stack>
      </DialogContent>
      <DialogActions><Button disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? "Changing..." : "Change password"}</Button></DialogActions>
    </form>
  </Dialog>;
}
