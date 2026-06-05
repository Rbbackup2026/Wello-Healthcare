"use client";
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
  Checkbox,
  TextField,
  Stack,
  TablePagination,
  Paper,
  Chip,
  Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Back Icon
import CategoryFormDialog from "../DailogForm/CategoryFormDialog";
import { useNavigate } from "../../lib/routerCompat";

const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6' rx='8'/%3E%3Cpath d='M22 54l13-16 9 10 7-8 8 14H22z' fill='%23cbd5e1'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23cbd5e1'/%3E%3C/svg%3E";

const DiseasesBanner = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([
    { id: 1, sortOrder: 1, status: "Active", iconimg: "image1.jpg" },
    { id: 2, sortOrder: 2, status: "Inactive", iconimg: "image2.jpg" },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchCategories = (searchTerm = "") => {
    setLoading(true);
    setTimeout(() => {
      setCategories(
        categories.filter((category) =>
          category.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleDialogSuccess = () => {
    fetchCategories(search);
    handleDialogClose();
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchCategories(value);
  };

  const filteredData = categories;

  const handleStatusToggle = (category) => {
    const updatedCategories = categories.map((item) =>
      item.id === category.id
        ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" }
        : item
    );
    setCategories(updatedCategories);
  };

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        {/* Back Button */}
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBackIcon />
        </IconButton>

        <Typography mb={2}>
          <Box component="span" sx={{ cursor: "pointer" }}>
            Manage Items /
          </Box>
          <Box component="span" sx={{ color: "#347deb", ml: 1 }}>
            Item Diseases Banner
          </Box>
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Item Diseases Banner
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
            onChange={handleSearch}
          />
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
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
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.iconimg ? `/uploads/${item.iconimg}` : defaultImage}
                        alt="Category"
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "8px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSelectedImage(item.iconimg ? `/uploads/${item.iconimg}` : defaultImage);
                          setIsModalOpen(true);
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sortOrder}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleStatusToggle(item)}>
                        {item.status === "Active" ? (
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
                        <IconButton sx={{ bgcolor: "error.main", color: "white" }} size="small">
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

      {/* Image Preview Dialog */}
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

export default DiseasesBanner;
