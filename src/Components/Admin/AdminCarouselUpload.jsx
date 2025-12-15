import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Stack,
  TablePagination,
  Paper,
  Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

import BannerFormDialog from "./BannerFormDialog";

const defaultImage = "/placeholder.png";

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
      const res = await axios.get("https://razobytehealthcare-website-backend-code.onrender.com/v1/api/getbanner");
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch banners error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (banner) => {
    try {
      await axios.put(`https://razobytehealthcare-website-backend-code.onrender.com/v1/api/banner/${banner._id}`, {
        isActive: !banner.isActive,
      });
      fetchBanners();
    } catch (err) {
      console.error("Toggle status error", err);
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await axios.delete(`https://razobytehealthcare-website-backend-code.onrender.com/v1/api/banner/${banner._id}`);
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

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const filtered = banners.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase())
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
        <Typography variant="h5">Category Banners</Typography>
        <Button variant="contained" onClick={handleAddNew}>
          + Add New
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box mb={2}>
          <TextField
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b._id?.slice(-6)}</TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={b.image ? `https://razobytehealthcare-website-backend-code.onrender.com${b.image}` : defaultImage}
                        alt={b.title}
                        sx={{ width: 80, height: 50, objectFit: "cover", cursor: "pointer" }}
                        onClick={() => {
                          setSelectedImage(
                            b.image
                              ? `https://razobytehealthcare-website-backend-code.onrender.com${b.image}`
                              : defaultImage
                          );
                          setImagePreviewOpen(true);
                        }}
                      />
                    </TableCell>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleStatusToggle(b)}>
                        {b.isActive ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{b.sortOrder || "-"}</TableCell>
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
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>

      <BannerFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        initialData={editingBanner}
        bannerCount={banners.length}
      />

      <Dialog
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        maxWidth="sm"
      >
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
