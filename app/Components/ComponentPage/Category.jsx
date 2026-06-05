"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
  Avatar,
  Switch,
  DialogTitle,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "../../lib/routerCompat";
import axios from "axios";
import CategoryFormDialog from "../DailogForm/CategoryFormDialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BASE_URL = "http://localhost:3000"; // ✅ /v1/api ke bina — images yahan serve hoti hain

const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23f0f0f0' rx='6'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22' fill='%23bbb'%3E%3F%3C/text%3E%3C/svg%3E";

// ✅ Backend se aane wala imageUrl use karo, fallback mein iconimg se banao
const getImageUrl = (item) => {
  if (item?.imageUrl) return item.imageUrl;
  if (item?.iconimg) return `${BASE_URL}/uploads/category/${item.iconimg}`;
  return DEFAULT_IMAGE;
};
 // Update with your actual backend URL

function Category() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // ✅ Helper: Different DB values (Yes, 1, Active, true) ko Boolean mein convert karna
  const isTruthy = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.toLowerCase();
      return v === "true" || v === "yes" || v === "active";
    }
    if (typeof value === "number") return value === 1;
    return false;
  };

  const isShownInNavbar = (category) => {
    const value =
      category?.showinnavbar ??
      category?.showInNavbar ??
      category?.showNavbar;

    return value === undefined || value === null ? true : isTruthy(value);
  };

  // ✅ Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/v1/api/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Toggle category active/inactive
  const handleToggleStatus = async (id) => {
    const originalCategories = [...categories];

    // Optimistic update
    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === id ? { ...cat, status: !isTruthy(cat.status) } : cat
      )
    );

    try {
      await axios.put(`${BASE_URL}/v1/api/toggle-status/${id}`);
    } catch (err) {
      setCategories(originalCategories); // rollback on failure
      console.error("Error toggling status:", err);
      setError("Failed to update category status.");
    }
  };

  // ✅ FIX: Toggle category Show on Home — use 'showinhome' (exact schema field)
  const handleToggleShowHome = async (category) => {
    const id = category._id;
    const originalCategories = [...categories];

    // Optimistic update with correct field name
    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === id
          ? { ...cat, showinhome: !isTruthy(cat.showinhome) } // ✅ correct field
          : cat
      )
    );

    try {
      // Backend khud toggle karta hai — body bhejne ki zaroorat nahi
      await axios.put(`${BASE_URL}/v1/api/toggle-showInHome/${id}`);
    } catch (err) {
      setCategories(originalCategories); // rollback on failure
      console.error("Error toggling show home status:", err);
      setError("Failed to update home display status.");
    }
  };

  const handleToggleShowNavbar = async (category) => {
    const id = category._id;
    const originalCategories = [...categories];
    const nextValue = !isShownInNavbar(category);

    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === id
          ? {
              ...cat,
              showinnavbar: nextValue,
              showInNavbar: nextValue,
              showNavbar: nextValue,
            }
          : cat
      )
    );

    try {
      await axios.put(`${BASE_URL}/v1/api/toggle-showInNavbar/${id}`);
    } catch (toggleError) {
      try {
        const formData = new FormData();
        const departmentId =
          typeof category.department === "object"
            ? category.department?._id || ""
            : category.department || "";

        formData.append("name", category.name || "");
        formData.append("department", departmentId);
        formData.append("sortOrder", String(category.sortOrder || ""));
        formData.append("showInHome", String(isTruthy(category.showinhome)));
        formData.append("showHomeBanner", String(isTruthy(category.showhomebanner)));
        formData.append("showInNavbar", String(nextValue));
        formData.append("status", String(isTruthy(category.status)));
        formData.append("pageDescription", category.pagedescription || "");
        formData.append(
          "faqs",
          typeof category.faqs === "string"
            ? category.faqs
            : JSON.stringify(category.faqs || category.faq || [])
        );

        await axios.put(`${BASE_URL}/v1/api/put/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        setCategories(originalCategories);
        console.error("Error toggling navbar display status:", err);
        setError("Failed to update navbar display status.");
      }
    }
  };

  // ✅ Handle delete click
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  // ✅ Confirm delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(
        `${BASE_URL}/v1/api/delete/${categoryToDelete._id}`
      );
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category.");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(search.toLowerCase()) ||
      category.department?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{ p: 3, backgroundColor: "background.default", minHeight: "100vh" }}
    >
      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => navigate("/admin")}
                color="primary"
                size="small"
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" color="text.secondary">
                  MANAGE ITEMS / CATEGORY
                </Typography>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Categories
                </Typography>
              </Box>
            </Stack>
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              size="large"
            >
              Add New Category
            </Button>
          }
        />
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Search and Controls */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedCategories.length} of{" "}
                {filteredCategories.length} categories
              </Typography>
            </Stack>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Image
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Sort Order
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Show on Home
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Show in Navbar
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 2 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading categories...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        {search
                          ? "No categories found matching your search."
                          : "No categories available."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((category) => (
                    <TableRow
                      key={category._id}
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontFamily="monospace"
                        >
                          {category._id?.slice(-8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={
                            category.iconimg
                              ? `${BASE_URL}${category.iconimg}`
                              : DEFAULT_IMAGE
                          }
                          variant="rounded"
                          sx={{
                            width: 40,
                            height: 40,
                            cursor: "pointer",
                            border: 1,
                            borderColor: "divider",
                          }}
                          onClick={() =>
                            setSelectedImage(`${BASE_URL}${category.iconimg}`)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.department || "N/A"}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {category.sortOrder || "-"}
                        </Typography>
                      </TableCell>

                      {/* ✅ FIX: 'showinhome' — exact schema field name */}
                      <TableCell>
                        <Switch
                          checked={isTruthy(category.showinhome)}
                          onChange={() => handleToggleShowHome(category)}
                          color="primary"
                          size="small"
                          title="Toggle Show on Home"
                        />
                      </TableCell>

                      <TableCell>
                        <Switch
                          checked={isShownInNavbar(category)}
                          onChange={() => handleToggleShowNavbar(category)}
                          color="primary"
                          size="small"
                          title="Toggle Show in Navbar"
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isTruthy(category.status)}
                                onChange={() =>
                                  handleToggleStatus(category._id)
                                }
                                color="success"
                                size="small"
                              />
                            }
                            label=""
                          />
                          <Box sx={{ display: { xs: "none", sm: "block" } }}>
                            {isTruthy(category.status) ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <CancelIcon color="error" fontSize="small" />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(category)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(category)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          {category.iconimg && (
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() =>
                                setSelectedImage(
                                  `${BASE_URL}${category.iconimg}`
                                )
                              }
                              title="View Image"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: 1, borderColor: "divider" }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        handleClose={() => {
          setDialogOpen(false);
          setEditingCategory(null);
          fetchCategories();
        }}
        initialData={editingCategory}
      />

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Category Image Preview
          </Typography>
          <Box
            component="img"
            src={selectedImage}
            alt="Category Preview"
            sx={{
              width: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>"{categoryToDelete?.name}"</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Category;
