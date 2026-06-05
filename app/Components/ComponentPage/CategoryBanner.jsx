"use client";
import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, Checkbox, TextField,
  Stack, TablePagination, Paper, Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CategoryFormDialog from "../DailogForm/CategoryFormDialog";
import { useNavigate } from "../../lib/routerCompat";

const BASE_URL = "http://localhost:3000"; // ✅ Standardizing the URL
const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6' rx='8'/%3E%3Cpath d='M22 54l13-16 9 10 7-8 8 14H22z' fill='%23cbd5e1'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23cbd5e1'/%3E%3C/svg%3E";

const CategoryBanner = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]); // ✅ Empty array
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // ✅ Real API call — server se fresh data
  const fetchCategories = async () => {
    setLoading(true);
    try {
     const res = await fetch(`${BASE_URL}/v1/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Image URL fix — DB mein already /uploads/ hai, dobara mat lagao
  const getImageUrl = (image) => {
    if (!image) return defaultImage;
    if (image.startsWith("http") || image.startsWith("data:")) return image;
    if (image.startsWith("/")) return `${BASE_URL}${image}?t=${Date.now()}`;
    return `${BASE_URL}/uploads/${image}?t=${Date.now()}`;
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  // ✅ Upload ke baad fresh data fetch
  const handleDialogSuccess = () => {
    fetchCategories();
    handleDialogClose();
  };

  // ✅ Status toggle — API call
  const handleStatusToggle = async (category) => {
    try {
      await fetch(`${BASE_URL}/v1/api/toggle-status/${category._id}`, {
        method: "PUT",
      });
      fetchCategories(); // Refresh
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // ✅ Delete — API call
  const handleDelete = async (id) => {
    if (!window.confirm("Delete karna chahte ho?")) return;
    try {
      await fetch(`${BASE_URL}/v1/api/delete/${id}`, { method: "DELETE" });
      fetchCategories(); // Refresh
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Search filter (local)
  const filteredData = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography mb={2}>
          <Box component="span" sx={{ cursor: "pointer" }}>
            Manage Items /
          </Box>
          <Box component="span" sx={{ color: "#347deb", ml: 1 }}>
            Item Category Banner
          </Box>
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Item Category Banner
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingCategory(null);
              setDialogOpen(true);
            }}
          >
            + Add New
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
            DELETE
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox /></TableCell>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Image</b></TableCell>
              <TableCell><b>Sort Order</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Koi data nahi mila</TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell padding="checkbox"><Checkbox /></TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        // ✅ Yahi fix hai — double /uploads/ nahi hoga
                        src={getImageUrl(item.bannerimg || item.iconimg)}
                        alt="Category Banner"
                        sx={{
                          width: 200,
                          height: "auto",
                          maxHeight: 120,
                          borderRadius: "8px",
                          objectFit: "contain",
                          cursor: "pointer",
                          bgcolor: "#f5f5f5", 
                        }}
                        onClick={() => {
                          setSelectedImage(getImageUrl(item.bannerimg || item.iconimg));
                          setIsModalOpen(true);
                        }}
                        onError={(e) => {
                          e.target.src = defaultImage; // ✅ Error par placeholder
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sortOrder}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleStatusToggle(item)}>
                        {item.status ? (
                          <CheckCircleIcon sx={{ color: "green" }} />
                        ) : (
                          <CancelIcon sx={{ color: "red" }} />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton sx={{ bgcolor: "warning.main", color: "white" }} size="small">
                          <ChatBubbleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          sx={{ bgcolor: "primary.main", color: "white" }}
                          size="small"
                          onClick={() => handleEdit(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          sx={{ bgcolor: "error.main", color: "white" }}
                          size="small"
                          onClick={() => handleDelete(item._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <CategoryFormDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        initialData={editingCategory}
      />

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm">
        <Box p={2}>
          <Box
            component="img"
            src={selectedImage}
            alt="Preview"
            sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default CategoryBanner;
