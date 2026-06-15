"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CategoryFormDialog from "../DailogForm/CategoryFormDialog";
import { useNavigate } from "../../lib/routerCompat";
import { API_BASE_URL, API_ORIGIN } from "../../utils/api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BASE_URL = API_BASE_URL;
const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6' rx='8'/%3E%3Cpath d='M22 54l13-16 9 10 7-8 8 14H22z' fill='%23cbd5e1'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23cbd5e1'/%3E%3C/svg%3E";

const Types = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch types from API
  const fetchTypes = async (searchTerm = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/types_get`);
      console.log("API Response:", response.data);
      
      let typesData = [];
      if (response.data && Array.isArray(response.data)) {
        typesData = response.data;
      } else {
        typesData = [];
      }
      
      // Search filter
      const filtered = typesData.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTypes(filtered);
    } catch (error) {
      console.error("Error fetching types:", error);
      showSnackbar("Failed to fetch types", "error");
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Handle edit
  const handleEdit = (type) => {
    setEditingType(type);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingType(null);
  };

  const handleDialogSuccess = () => {
    fetchTypes(search);
    showSnackbar(`Type ${editingType ? "updated" : "created"} successfully!`);
    handleDialogClose();
  };

  // Handle search with debounce
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => fetchTypes(value), 500));
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this type?")) return;
    
    try {
      await axios.delete(`${BASE_URL}/types_delete/${id}`);
      fetchTypes(search);
      showSnackbar("Type deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar(error.response?.data?.message || "Failed to delete type", "error");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`${BASE_URL}/types_toggle/${id}`);
      
      // Update local state immediately
      setTypes(prev => prev.map(item => 
        item._id === id 
          ? { ...item, status: response.data.data.status }
          : item
      ));
      
      showSnackbar(`Type ${response.data.data.status ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error("Status toggle error:", error);
      showSnackbar(error.response?.data?.message || "Failed to toggle status", "error");
    }
  };

  // Get image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return defaultImage;
    return `${API_ORIGIN}/uploads/types/${imageName}`;
  };

  // Get status display text
  const getStatusText = (status) => {
    return status ? "Active" : "Inactive";
  };

  const filteredData = types.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography>
          Manage Items / <Box component="span" sx={{ color: "#347deb", ml: 1 }}>Type</Box>
        </Typography>
      </Stack>

      {/* Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Type 
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingType(null);
              setDialogOpen(true);
            }}
          >
            + Add New
          </Button>
        </Stack>
      </Stack>

      {/* Table */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Search types..."
            value={search}
            onChange={handleSearch}
            sx={{ width: 300 }}
          />
          <Typography variant="body2" color="textSecondary">
            Showing {filteredData.length} of {types.length} types
          </Typography>
        </Stack>

        <Table>
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox /></TableCell>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Image</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Sort Order</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ mt: 1 }}>Loading types...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    {types.length === 0 ? "No types found. Click 'Add New' to create one." : "No types match your search."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow key={item._id} hover>
                    <TableCell padding="checkbox"><Checkbox /></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={getImageUrl(item.iconimg)}
                        alt={item.name}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "8px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: "1px solid #e0e0e0"
                        }}
                        onClick={() => {
                          setSelectedImage(getImageUrl(item.iconimg));
                          setIsModalOpen(true);
                        }}
                        onError={(e) => {
                          e.target.src = defaultImage;
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {item.description.length > 50 
                            ? `${item.description.substring(0, 50)}...` 
                            : item.description
                          }
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.sortOrder} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleStatusToggle(item._id, item.status)}
                        size="small"
                        title={`Click to ${item.status ? "deactivate" : "activate"}`}
                      >
                        {item.status ? (
                          <CheckCircleIcon sx={{ color: "green" }} />
                        ) : (
                          <CancelIcon sx={{ color: "red" }} />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          sx={{ bgcolor: "primary.main", color: "white", '&:hover': { bgcolor: "primary.dark" } }}
                          size="small"
                          onClick={() => handleEdit(item)}
                          title="Edit type"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          sx={{ bgcolor: "error.main", color: "white", '&:hover': { bgcolor: "error.dark" } }} 
                          size="small"
                          onClick={() => handleDelete(item._id)}
                          title="Delete type"
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Form Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        initialData={editingType}
      />

      {/* Image Preview Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <Box p={2}>
          <Box
            component="img"
            src={selectedImage}
            alt="Type Preview"
            sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 1 }}
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Types;
