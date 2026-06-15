"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, TextField, Stack,
  TablePagination, Paper, Dialog, Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

import BannerFormDialog from "./BannerFormDialog";
import { buildBannerImageUrl } from "../../utils/bannerImageUtils";
import { API_BASE_URL } from "../../utils/api";

const AdminCarouselUpload = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      // ✅ Sahi route
      const res = await axios.get(`${API_BASE_URL}/banner/getall`);
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch banners error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (banner) => {
    try {
      // ✅ Sahi route + sahi field name
      await axios.put(`${API_BASE_URL}/banner/put/${banner._id}`, {
        status: banner.status === "Active" ? "Inactive" : "Active",
      });
      fetchBanners();
    } catch (err) {
      console.error("Toggle status error", err);
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      // ✅ Sahi route
      await axios.delete(`${API_BASE_URL}/banner/delete/${banner._id}`);
      fetchBanners();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBanner(null);
    fetchBanners();
  };

  // ✅ Search display/city se karo kyunki title field nahi hai
  const filtered = banners.filter((b) =>
    b.display?.toLowerCase().includes(search.toLowerCase()) ||
    b.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Manage Banners</Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Home Banners</Typography>
        <Button variant="contained" onClick={handleAddNew}>
          + Add New
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box mb={2}>
          <TextField
            placeholder="Search by display or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Web Image</TableCell>
              <TableCell>App Image</TableCell>
              <TableCell>Display</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Sort ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No banners found</TableCell>
              </TableRow>
            ) : (
              filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b._id?.slice(-6)}</TableCell>

                    {/* ✅ webImage */}
                    <TableCell>
                      {buildBannerImageUrl(b.webImage) ? (
                        <Box
                          component="img"
                          src={buildBannerImageUrl(b.webImage)}
                          alt="web"
                          sx={{ width: 80, height: 50, objectFit: "cover", cursor: "pointer" }}
                          onClick={() => {
                            setSelectedImage(buildBannerImageUrl(b.webImage));
                            setImagePreviewOpen(true);
                          }}
                        />
                      ) : "—"}
                    </TableCell>

                    {/* ✅ appImage */}
                    <TableCell>
                      {buildBannerImageUrl(b.appImage) ? (
                        <Box
                          component="img"
                          src={buildBannerImageUrl(b.appImage)}
                          alt="app"
                          sx={{ width: 80, height: 50, objectFit: "cover", cursor: "pointer" }}
                          onClick={() => {
                            setSelectedImage(buildBannerImageUrl(b.appImage));
                            setImagePreviewOpen(true);
                          }}
                        />
                      ) : "—"}
                    </TableCell>

                    <TableCell>{b.display || "—"}</TableCell>
                    <TableCell>{b.city || "—"}</TableCell>
                    <TableCell>{b.sortId ?? "—"}</TableCell>

                    {/* ✅ status field */}
                    <TableCell>
                      <Chip
                        label={b.status}
                        color={b.status === "Active" ? "success" : "error"}
                        size="small"
                        onClick={() => handleStatusToggle(b)}
                        sx={{ cursor: "pointer" }}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={() => handleEdit(b)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(b)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>

      <BannerFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        initialData={editingBanner}
        bannerCount={banners.length}
        onSuccess={fetchBanners}
      />

      <Dialog open={imagePreviewOpen} onClose={() => setImagePreviewOpen(false)} maxWidth="md">
        <Box p={2}>
          <Box
            component="img"
            src={selectedImage}
            alt="Preview"
            sx={{ width: "100%", objectFit: "contain" }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminCarouselUpload;
