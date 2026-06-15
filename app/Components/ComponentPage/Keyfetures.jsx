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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "../../lib/routerCompat";
import { API_BASE_URL, API_ORIGIN } from "../../utils/api";

import KeyfeturesDailog from "../DailogForm/KeyfeturesDailog";

const BASE_URL = API_BASE_URL;
const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6' rx='8'/%3E%3Cpath d='M22 54l13-16 9 10 7-8 8 14H22z' fill='%23cbd5e1'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23cbd5e1'/%3E%3C/svg%3E";

const KeyFeatures = () => {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyFeatures, setKeyFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeyFeature, setEditingKeyFeature] = useState(null);

  const fetchKeyFeatures = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/key_feature_get`);
      console.log("API Response:", res.data);
      
      let featuresData = [];
      if (res.data && Array.isArray(res.data)) {
        featuresData = res.data;
      } else {
        featuresData = [];
      }
      
      const filtered = featuresData.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setKeyFeatures(filtered);
    } catch (error) {
      console.error("Error fetching key features:", error);
      setKeyFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyFeatures();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (keyFeature) => {
    setEditingKeyFeature(keyFeature);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingKeyFeature(null);
  };

  const handleDialogSuccess = () => {
    fetchKeyFeatures(search);
    handleDialogClose();
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchKeyFeatures(value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this key feature?")) return;
    try {
      await axios.delete(`${BASE_URL}/key_feature_delete/${id}`);
      fetchKeyFeatures(search);
      alert("Key feature deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete. Check the console for details.");
    }
  };

  // ✅ CORRECTED: Use PATCH method for toggle
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      // ✅ Use the toggle endpoint with PATCH method
      const response = await axios.patch(`${BASE_URL}/key_feature_toggle/${id}`);
      
      // Update local state immediately for better UX
      setKeyFeatures(prev => prev.map(item => 
        item._id === id 
          ? { ...item, status: response.data.data.status }
          : item
      ));
      
      console.log(`Status toggled successfully: ${response.data.data.status}`);
    } catch (error) {
      console.error("Status toggle error:", error);
      alert("Failed to toggle status. Check the console for details.");
    }
  };

  // Function to get correct image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return defaultImage;
    return `${API_ORIGIN}/uploads/${imageName}`;
  };

  // Function to get status display text
  const getStatusText = (status) => {
    return status ? "Active" : "Inactive";
  };

  // Function to get status color
  const getStatusColor = (status) => {
    return status ? "success" : "default";
  };

  const filteredData = keyFeatures.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography>
          Manage Items / <Box component="span" sx={{ color: "#347deb", ml: 1 }}>Key Features</Box>
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Key Features
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => { 
            setEditingKeyFeature(null); 
            setDialogOpen(true); 
          }}
        >
          + Add New Key Feature
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField 
            size="small" 
            placeholder="Search key features..." 
            value={search} 
            onChange={handleSearch}
            sx={{ width: 300 }}
          />
          <Typography variant="body2" color="textSecondary">
            {filteredData.length} key features found
          </Typography>
        </Stack>

        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Image</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Description</b></TableCell>
              <TableCell><b>Sort Order</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography>Loading key features...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    {search ? 'No key features found matching your search.' : 'No key features available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                <TableRow 
                  key={item._id} 
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'grey.50' 
                    } 
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={getImageUrl(item.keyimg)}
                      alt={item.name}
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.src = defaultImage;
                      }}
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: "8px", 
                        objectFit: "cover", 
                        cursor: "pointer",
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}
                      onClick={() => { 
                        setSelectedImage(getImageUrl(item.keyimg)); 
                        setIsModalOpen(true); 
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary" sx={{ 
                      maxWidth: 200, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.info || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.sortOrder || 0} 
                      variant="outlined"
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {/* ✅ CORRECTED: Use boolean status properly */}
                    <Chip 
                      label={getStatusText(item.status)} 
                      color={getStatusColor(item.status)} 
                      size="small"
                      onClick={() => handleStatusToggle(item._id, item.status)}
                      style={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        sx={{ 
                          bgcolor: "primary.main", 
                          color: "white",
                          '&:hover': { bgcolor: "primary.dark" }
                        }} 
                        size="small" 
                        onClick={() => handleEdit(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        sx={{ 
                          bgcolor: "error.main", 
                          color: "white",
                          '&:hover': { bgcolor: "error.dark" }
                        }} 
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid', borderColor: 'grey.200' }}
        />
      </Paper>

      <KeyfeturesDailog
        open={dialogOpen}
        handleClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        initialData={editingKeyFeature}
      />

      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <Box p={2}>
          <Box 
            component="img" 
            src={selectedImage} 
            alt="Preview" 
            onError={(e) => {
              console.log('Modal image failed to load:', e.target.src);
              e.target.src = defaultImage;
            }}
            sx={{ 
              width: "100%", 
              maxHeight: "70vh", 
              objectFit: "contain",
              borderRadius: 1
            }} 
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default KeyFeatures;
