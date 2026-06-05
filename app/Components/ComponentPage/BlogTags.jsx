"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "../../lib/routerCompat";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import BlogTagForm from "../DailogForm/BlogTagForm";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BlogTags = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  // Fetch Tags with axios
  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/tagget`, {
        params: {
          search: search,
          limit: itemsPerPage
        }
      });
      
      if (response.data.success) {
        setTags(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      showSnackbar("Failed to fetch tags", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [search, itemsPerPage]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Toggle Status with axios
  const handleToggleStatus = async (id) => {
  try {
    const response = await axios.put(`${BASE_URL}/tagtoggle-status/${id}`);
      
    if (response.data.success) {
      const updatedStatus = response.data.data.status;

      setTags(prev =>
        prev.map(tag =>
          tag._id === id ? { ...tag, status: updatedStatus } : tag
        )
      );

      showSnackbar(`Status changed to ${updatedStatus}`);
    } else {
      showSnackbar(response.data.message, "error");
    }
  } catch (error) {
    console.error("Error toggling status:", error);
    showSnackbar("Failed to update status", "error");
  }
};


  // Delete Single Tag with axios
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await axios.delete(`${BASE_URL}/tagdelete/${id}`);
      
      if (response.data.success) {
        setTags(prev => prev.filter(t => t._id !== id));
        showSnackbar("Tag deleted successfully");
      } else {
        showSnackbar(response.data.message, "error");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      showSnackbar("Failed to delete tag", "error");
    }
  };

  // Add New Tag
  const handleAddNew = () => {
    setSelectedTag(null);
    setOpenDialog(true);
  };

  // Edit Tag
  const handleEdit = (row) => {
    setSelectedTag(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTag(null);
  };

  // Add / Update Tag with axios
  const handleSubmit = async (formData) => {
    try {
      let response;

      if (selectedTag) {
        response = await axios.put(`${BASE_URL}/tagput/${selectedTag._id}`, formData);
      } else {
        response = await axios.post(`${BASE_URL}/blogtagpost`, formData);
      }

      if (response.data.success) {
        showSnackbar(selectedTag ? "Tag updated successfully" : "Tag created successfully");
        fetchTags();
        handleCloseDialog();
      } else {
        showSnackbar(response.data.message, "error");
      }

    } catch (error) {
      console.error("Error saving tag:", error);
      showSnackbar("Failed to save tag", "error");
    }
  };

  // Row Selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    const ids = tags.map(t => t._id);
    setSelectedRows(selectedRows.length === ids.length ? [] : ids);
  };

  // Bulk Delete with axios
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    if (!window.confirm(`Delete ${selectedRows.length} tags?`)) return;

    try {
      const response = await axios.delete(`${BASE_URL}/blogtag/bulk-delete`, {
        data: { ids: selectedRows }
      });

      if (response.data.success) {
        setTags(prev => prev.filter(t => !selectedRows.includes(t._id)));
        setSelectedRows([]);
        showSnackbar(`${response.data.message}`);
        fetchTags();
      } else {
        showSnackbar(response.data.message, "error");
      }

    } catch (error) {
      console.error("Error in bulk delete:", error);
      showSnackbar("Failed to delete tags", "error");
    }
  };

  // Debounced search implementation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTags();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <Box className="p-6 bg-white rounded-lg shadow-md">

      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <Button variant="outlined" startIcon={<FaArrowLeft />} onClick={() => navigate(-1)}>
          Back
        </Button>

        <Typography variant="h5" className="font-bold">Blog Tags</Typography>

        <Box className="flex gap-2">
          <Button variant="contained" onClick={handleAddNew}>+ Add New</Button>
          <Button 
            variant="outlined" 
            color="error" 
            disabled={!selectedRows.length} 
            onClick={handleBulkDelete}
          >
            Delete ({selectedRows.length})
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box className="flex justify-between items-center mb-4">
        <Select 
          value={itemsPerPage} 
          onChange={(e) => setItemsPerPage(e.target.value)} 
          size="small"
        >
          {[5, 10, 20, 50].map(num => (
            <MenuItem key={num} value={num}>{num}</MenuItem>
          ))}
        </Select>

        <TextField 
          size="small" 
          placeholder="Search…" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell align="center">
                <Checkbox
                  checked={selectedRows.length === tags.length && tags.length > 0}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < tags.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Most Used</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tags.length > 0 ? (
              tags.map(tag => (
                <TableRow key={tag._id} hover>
                  <TableCell align="center">
                    <Checkbox 
                      checked={selectedRows.includes(tag._id)} 
                      onChange={() => handleRowSelect(tag._id)} 
                    />
                  </TableCell>

                  <TableCell>{tag._id}</TableCell>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.sortOrder}</TableCell>
                  <TableCell>
                    {tag.mostUsed ? (
                      <span className="px-3 py-1 bg-green-600 text-white rounded text-sm">Yes</span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500 text-white rounded text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={tag.status === "Active"}
                          onChange={() => handleToggleStatus(tag._id, tag.status)}
                          color="success"
                        />
                      }
                      label={tag.status}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Box className="flex gap-3 justify-center">
                      <IconButton color="primary" onClick={() => handleEdit(tag)}>
                        <FaEdit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(tag._id)}>
                        <FaTrash />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tags found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <BlogTagForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialData={selectedTag}
      />

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BlogTags;
