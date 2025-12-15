// BlogCategory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Checkbox, Button, Select, MenuItem, TextField,
  Typography, Snackbar, Alert
} from "@mui/material";
import { FaCheck, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import BlogCategoryForm from "../DailogForm/BlogCategoryForm";

const BASE_URL = "https://razobytehealthcare-website-backend-code.onrender.com/v1/api"; // 👈 apna backend URL

const BlogCategory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success"
  });

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/categorybloget?search=${search}&limit=${itemsPerPage}`
      );

      const data = await res.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      showSnackbar("Failed to fetch categories", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, itemsPerPage]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ✅ Delete Single Category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`${BASE_URL}/categoryblogid/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setCategories(prev => prev.filter(cat => cat._id !== id));
        showSnackbar("Category deleted successfully");
      } else {
        showSnackbar(data.message, "error");
      }

    } catch (err) {
      showSnackbar("Failed to delete category", "error");
    }
  };

  // Add New
  const handleAddNew = () => {
    setSelectedCategory(null);
    setOpenDialog(true);
  };

  // Edit Category
  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  // ✅ Add / Update API Integration
  const handleSubmit = async (formData) => {
    try {
      let response;

      if (selectedCategory) {
        // Update
        response = await fetch(
          `${BASE_URL}/categoryblogput/${selectedCategory._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
      } else {
        // Create
        response = await fetch(`${BASE_URL}/categoryblog/post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar(selectedCategory ? "Category updated" : "Category created");
        fetchCategories();
      } else {
        showSnackbar(data.message, "error");
      }

    } catch (err) {
      showSnackbar("Failed to save category", "error");
    }
  };

  // Row Selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select All
  const handleSelectAll = () => {
    const ids = categories.map(cat => cat._id);
    setSelectedRows(selectedRows.length === ids.length ? [] : ids);
  };

  // ✅ Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    if (!window.confirm(`Delete ${selectedRows.length} categories?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/catogryblog/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows }),
      });

      const data = await res.json();

      if (data.success) {
        setCategories(prev =>
          prev.filter(cat => !selectedRows.includes(cat._id))
        );
        setSelectedRows([]);
        showSnackbar(`${selectedRows.length} categories deleted`);
      } else {
        showSnackbar(data.message, "error");
      }

    } catch (err) {
      showSnackbar("Failed bulk delete", "error");
    }
  };

  return (
    <Box className="p-6 bg-white rounded-lg shadow-md">

      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <Button
          variant="outlined"
          startIcon={<FaArrowLeft />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Typography variant="h5" className="font-bold">Blog Categories</Typography>

        <Box className="flex gap-2">
          <Button variant="contained" onClick={handleAddNew}>+ Add New</Button>

          <Button
            variant="outlined"
            color="error"
            disabled={selectedRows.length === 0}
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
                  checked={
                    selectedRows.length === categories.length &&
                    categories.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Sort</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat._id}>
                <TableCell align="center">
                  <Checkbox
                    checked={selectedRows.includes(cat._id)}
                    onChange={() => handleRowSelect(cat._id)}
                  />
                </TableCell>

                <TableCell>{cat._id}</TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.sortOrder}</TableCell>
                <TableCell>
                  {cat.status === "Active" && (
                    <FaCheck className="text-green-600" />
                  )}
                </TableCell>

                <TableCell className="flex gap-3 justify-center">
                  <IconButton color="primary" onClick={() => handleEdit(cat)}>
                    <FaEdit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(cat._id)}>
                    <FaTrash />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <BlogCategoryForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialData={selectedCategory}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default BlogCategory;
