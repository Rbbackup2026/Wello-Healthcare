"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Button, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Checkbox, TextField, Stack, TablePagination, Paper, Chip,
  Dialog, Snackbar, Alert, CircularProgress, Tooltip
} from "@mui/material";
import {
  Edit, Delete, CheckCircle, Cancel, ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "../../lib/routerCompat";
import DiseaseFormDialog from "../DailogForm/DiseaseFormDialog";

// =============================================
// Constants
// =============================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BASE_URL = "http://localhost:3000"; // ✅ /v1/api ke bina — images yahan serve hoti hain

const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23f0f0f0' rx='6'/%3E%3Ctext x='25' y='32' text-anchor='middle' font-size='22' fill='%23bbb'%3E%3F%3C/text%3E%3C/svg%3E";

// ✅ Backend se aane wala imageUrl use karo, fallback mein iconimg se banao
const getImageUrl = (item) => {
  if (item?.imageUrl) return item.imageUrl;
  if (item?.iconimg) return `${BASE_URL}/uploads/diseases/${item.iconimg}`;
  return DEFAULT_IMAGE;
};

// =============================================
// API Instance
// =============================================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// =============================================
// Component
// =============================================
const Diseases = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    diseases: [],
    loading: false,
    page: 0,
    rowsPerPage: 10,
    search: "",
    dialogOpen: false,
    editingDisease: null,
    selectedDiseases: [],
    selectedImage: null,
    imageModalOpen: false,
    searchTimeout: null,
    snackbar: { open: false, message: "", severity: "success" }
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // =============================================
  // API Calls
  // =============================================
  const fetchDiseases = useCallback(async (searchTerm = "") => {
    updateState({ loading: true });
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const { data } = await api.get("/diseasepost", { params });
      const diseases = data?.diseases || data || [];
      updateState({ diseases, loading: false });
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Failed to fetch diseases", "error");
      updateState({ diseases: [], loading: false });
    }
  }, []);

  const deleteDisease = async (diseaseId) => {
    if (!window.confirm("Are you sure you want to delete this disease?")) return;
    try {
      await api.delete(`/diseasepost/${diseaseId}`);
      setState(prev => ({
        ...prev,
        diseases: prev.diseases.filter(d => d._id !== diseaseId)
      }));
      showSnackbar("Disease deleted successfully");
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Delete failed", "error");
    }
  };

  const deleteSelectedDiseases = async () => {
    const { selectedDiseases } = state;
    if (selectedDiseases.length === 0) {
      showSnackbar("Please select diseases to delete", "warning");
      return;
    }
    if (!window.confirm(`Delete ${selectedDiseases.length} disease(s)?`)) return;
    try {
      await api.delete("/diseasepost", { data: { ids: selectedDiseases } });
      setState(prev => ({
        ...prev,
        diseases: prev.diseases.filter(d => !selectedDiseases.includes(d._id)),
        selectedDiseases: []
      }));
      showSnackbar(`${selectedDiseases.length} disease(s) deleted`);
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Delete failed", "error");
    }
  };

  const toggleActive = async (diseaseId) => {
    try {
      const { data } = await api.patch(`/diseasepost/${diseaseId}/toggle-active`);
      if (data?.disease) {
        setState(prev => ({
          ...prev,
          diseases: prev.diseases.map(d =>
            d._id === diseaseId ? { ...d, isActive: data.disease.isActive } : d
          )
        }));
        showSnackbar(`Disease ${data.disease.isActive ? "activated" : "deactivated"}`);
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Toggle failed", "error");
    }
  };

  // =============================================
  // Handlers
  // =============================================
  const showSnackbar = (message, severity = "success") => {
    updateState({ snackbar: { open: true, message, severity } });
  };

  const handleCloseSnackbar = () => {
    setState(prev => ({ ...prev, snackbar: { ...prev.snackbar, open: false } }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setState(prev => {
      clearTimeout(prev.searchTimeout);
      const searchTimeout = setTimeout(() => fetchDiseases(value), 500);
      return { ...prev, search: value, searchTimeout };
    });
  };

  const handleSelectDisease = (diseaseId) => {
    setState(prev => ({
      ...prev,
      selectedDiseases: prev.selectedDiseases.includes(diseaseId)
        ? prev.selectedDiseases.filter(id => id !== diseaseId)
        : [...prev.selectedDiseases, diseaseId]
    }));
  };

  const handleSelectAll = (e) => {
    const { filteredData } = getFilteredData();
    updateState({
      selectedDiseases: e.target.checked ? filteredData.map(d => d._id) : []
    });
  };

  const handleEdit = (disease) => {
    updateState({ editingDisease: disease, dialogOpen: true });
  };

  const handleDialogClose = () => {
    updateState({ dialogOpen: false, editingDisease: null });
  };

  const handleDialogSuccess = () => {
    fetchDiseases(state.search);
    showSnackbar(`Disease ${state.editingDisease ? "updated" : "created"} successfully`);
    handleDialogClose();
  };

  // =============================================
  // Utilities
  // =============================================
  const getFilteredData = () => {
    const { diseases, search } = state;
    const filteredData = diseases.filter(disease =>
      disease.name?.toLowerCase().includes(search.toLowerCase()) ||
      disease.department?.toLowerCase().includes(search.toLowerCase())
    );
    return { filteredData };
  };

  // =============================================
  // Effects
  // =============================================
  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  // =============================================
  // Render Helpers
  // =============================================
  const renderTableHeaders = () => (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={
              state.selectedDiseases.length > 0 &&
              state.selectedDiseases.length < getFilteredData().filteredData.length
            }
            checked={
              getFilteredData().filteredData.length > 0 &&
              state.selectedDiseases.length === getFilteredData().filteredData.length
            }
            onChange={handleSelectAll}
          />
        </TableCell>
        {["Image", "Name", "Department", "Sort Order", "Show Home", "Status", "Actions"].map(header => (
          <TableCell key={header}><b>{header}</b></TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderDiseaseRow = (item) => {
    const imgSrc = getImageUrl(item); // ✅ pura item pass karo

    return (
      <TableRow key={item._id} hover>
        <TableCell padding="checkbox">
          <Checkbox
            checked={state.selectedDiseases.includes(item._id)}
            onChange={() => handleSelectDisease(item._id)}
          />
        </TableCell>

        {/* Image */}
        <TableCell>
          <Box
            component="img"
            src={imgSrc}
            alt={item.name}
            sx={{
              width: 50, height: 50, borderRadius: 2, cursor: "pointer",
              objectFit: "cover", border: "1px solid #e0e0e0"
            }}
            onClick={() => updateState({ selectedImage: imgSrc, imageModalOpen: true })}
            onError={(e) => { e.target.src = DEFAULT_IMAGE; }} // ✅ fallback — 404 nahi aayega
          />
        </TableCell>

        {/* Name & Description */}
        <TableCell>
          <Typography variant="body2" fontWeight="medium">{item.name}</Typography>
          {item.description && (
            <Typography variant="caption" color="textSecondary" display="block">
              {item.description.length > 50
                ? `${item.description.substring(0, 50)}...`
                : item.description}
            </Typography>
          )}
        </TableCell>

        {/* Department */}
        <TableCell>
          <Chip label={item.department} size="small" variant="outlined" />
        </TableCell>

        {/* Sort Order */}
        <TableCell>
          <Typography align="center">{item.sortOrder}</Typography>
        </TableCell>

        {/* Show Home */}
        <TableCell>
          <Chip
            label={item.showHome ? "Yes" : "No"}
            color={item.showHome ? "success" : "default"}
            size="small"
            variant={item.showHome ? "filled" : "outlined"}
          />
        </TableCell>

        {/* isActive Toggle */}
        <TableCell>
          <Tooltip title={`Toggle ${item.isActive ? "Inactive" : "Active"}`}>
            <IconButton onClick={() => toggleActive(item._id)} size="small">
              {item.isActive
                ? <CheckCircle sx={{ color: "green" }} />
                : <Cancel sx={{ color: "red" }} />
              }
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
              <IconButton
                sx={{ bgcolor: "primary.main", color: "white", '&:hover': { bgcolor: "primary.dark" } }}
                onClick={() => handleEdit(item)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                sx={{ bgcolor: "error.main", color: "white", '&:hover': { bgcolor: "error.dark" } }}
                onClick={() => deleteDisease(item._id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  // =============================================
  // Pagination
  // =============================================
  const { filteredData } = getFilteredData();
  const paginatedData = filteredData.slice(
    state.page * state.rowsPerPage,
    state.page * state.rowsPerPage + state.rowsPerPage
  );

  // =============================================
  // JSX
  // =============================================
  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography>
          Manage Items / <Box component="span" sx={{ color: "#347deb", ml: 1 }}>Diseases</Box>
        </Typography>
      </Stack>

      {/* Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Diseases {state.diseases.length > 0 && `(${state.diseases.length})`}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => updateState({ dialogOpen: true, editingDisease: null })}
          >
            + Add New
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={deleteSelectedDiseases}
            disabled={state.selectedDiseases.length === 0}
          >
            DELETE ({state.selectedDiseases.length})
          </Button>
        </Stack>
      </Stack>

      {/* Table */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Search diseases..."
            value={state.search}
            onChange={handleSearch}
            sx={{ width: 300 }}
          />
          <Typography variant="body2" color="textSecondary">
            Showing {filteredData.length} of {state.diseases.length} diseases
          </Typography>
        </Stack>

        <Table>
          {renderTableHeaders()}
          <TableBody>
            {state.loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="textSecondary">
                    {state.diseases.length === 0 ? "No diseases found" : "No matching diseases"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(renderDiseaseRow)
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={state.page}
          onPageChange={(e, newPage) => updateState({ page: newPage })}
          rowsPerPage={state.rowsPerPage}
          onRowsPerPageChange={(e) => updateState({ rowsPerPage: +e.target.value, page: 0 })}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Disease Form Dialog */}
      <DiseaseFormDialog
        open={state.dialogOpen}
        handleClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        initialData={state.editingDisease}
      />

      {/* Image Preview Modal */}
      <Dialog
        open={state.imageModalOpen}
        onClose={() => updateState({ imageModalOpen: false })}
        maxWidth="sm"
        fullWidth
      >
        <Box p={2}>
          <Box
            component="img"
            src={state.selectedImage || DEFAULT_IMAGE}
            alt="Preview"
            sx={{ width: "100%", borderRadius: 1 }}
          />
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={state.snackbar.severity}>
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Diseases;