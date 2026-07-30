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
  Rating,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/api";

const emptyForm = {
  name: "",
  city: "",
  rating: 5,
  message: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
  showOnHome: true,
};

const ManageTestimonials = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/testimonials`);
      setRows(res.data?.testimonials || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load testimonials");
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
      name: row.name || "",
      city: row.city || "",
      rating: row.rating || 5,
      message: row.message || "",
      imageUrl: row.imageUrl || "",
      sortOrder: row.sortOrder || 0,
      isActive: row.isActive !== false,
      showOnHome: row.showOnHome !== false,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      alert("Name and message are required");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/testimonials/${editingId}`, form);
      } else {
        await axios.post(`${API_BASE_URL}/testimonials`, form);
      }
      setOpen(false);
      fetchRows();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/testimonials/${id}`);
      fetchRows();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Testimonials CMS
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Testimonial
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
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Home</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No testimonials yet</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.city || "-"}</TableCell>
                    <TableCell>
                      <Rating value={Number(row.rating || 5)} readOnly size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography noWrap>{row.message}</Typography>
                    </TableCell>
                    <TableCell>{row.showOnHome ? "Yes" : "No"}</TableCell>
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
        <DialogTitle>{editingId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="City"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              fullWidth
            />
            <Box>
              <Typography variant="body2" mb={0.5}>
                Rating
              </Typography>
              <Rating
                value={Number(form.rating)}
                onChange={(_, value) => setForm((p) => ({ ...p, rating: value || 5 }))}
              />
            </Box>
            <TextField
              label="Message"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.showOnHome}
                  onChange={(e) => setForm((p) => ({ ...p, showOnHome: e.target.checked }))}
                />
              }
              label="Show on Home"
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

export default ManageTestimonials;
