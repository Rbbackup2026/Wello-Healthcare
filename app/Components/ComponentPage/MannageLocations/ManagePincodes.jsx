"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/api";

const emptyForm = {
  pincode: "",
  area: "",
  city: "",
  state: "",
  homeCollectionAvailable: true,
  labVisitAvailable: true,
  isActive: true,
  notes: "",
};

const ManagePincodes = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/service-pincodes`, {
        params: search ? { pincode: search } : undefined,
      });
      setRows(res.data?.pincodes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pincodes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      pincode: row.pincode || "",
      area: row.area || "",
      city: row.city || "",
      state: row.state || "",
      homeCollectionAvailable: row.homeCollectionAvailable !== false,
      labVisitAvailable: row.labVisitAvailable !== false,
      isActive: row.isActive !== false,
      notes: row.notes || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!/^\d{6}$/.test(form.pincode) || !form.city.trim()) {
      alert("Valid 6-digit pincode and city are required");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/service-pincodes/${editingId}`, form);
      } else {
        await axios.post(`${API_BASE_URL}/service-pincodes`, form);
      }
      setOpen(false);
      fetchRows();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pincode?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/service-pincodes/${id}`);
      fetchRows();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Pincodes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Pincode
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} mb={2}>
        <TextField
          size="small"
          label="Search pincode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outlined" onClick={fetchRows}>
          Search
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pincode</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Home Collection</TableCell>
                <TableCell>Lab Visit</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No pincodes yet</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row.pincode}</TableCell>
                    <TableCell>{row.area || "-"}</TableCell>
                    <TableCell>
                      {row.city}
                      {row.state ? `, ${row.state}` : ""}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={row.homeCollectionAvailable ? "success" : "default"}
                        label={row.homeCollectionAvailable ? "Yes" : "No"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={row.labVisitAvailable ? "success" : "default"}
                        label={row.labVisitAvailable ? "Yes" : "No"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Pincode" : "Add Pincode"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                }))
              }
              fullWidth
            />
            <TextField
              label="Area"
              value={form.area}
              onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
              fullWidth
            />
            <TextField
              label="City"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              fullWidth
            />
            <TextField
              label="State"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.homeCollectionAvailable}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      homeCollectionAvailable: e.target.checked,
                    }))
                  }
                />
              }
              label="Home Collection Available"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.labVisitAvailable}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, labVisitAvailable: e.target.checked }))
                  }
                />
              }
              label="Lab Visit Available"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagePincodes;
