"use client";
import React, { useRef, useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  Switch,
  Typography,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "../../lib/routerCompat";
import axios from "axios";
import ItemListingDialog from "../DailogForm/ItemListingDailog";
import { API_BASE_URL } from "../../utils/api";
import { downloadItemsCsvTemplate } from "../../utils/itemsCsvTemplate";

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeDepartment = (department) => {
  if (Array.isArray(department)) {
    return department
      .map((item) => item?.name || item?.departmentName || item)
      .filter(Boolean)
      .join(", ");
  }
  if (typeof department === "object" && department !== null) {
    return department.name || department.departmentName || "";
  }
  return department || "";
};

function Items() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const csvInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_product`);
      const extractedItems = extractItems(response.data);
      setItems(extractedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/put_status/${id}/toggle-status`, {
        isActive: !currentStatus,
      });
      showSnackbar("Status updated successfully");
      fetchItems();
    } catch (error) {
      console.error("Error toggling status:", error);
      showSnackbar("Failed to update status", "error");
    }
  };

  // ✅ FIX — showFullBodyHealthCheckup (schema ka sahi naam)
  const handleToggleFullBody = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Yes" ? "No" : "Yes";

      // Optimistic UI update
      setItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, showFullBodyHealthCheckup: newStatus } // ✅ naam fix
            : item
        )
      );

      await axios.put(`${API_BASE_URL}/items/${id}`, {
        showFullBodyHealthCheckup: newStatus, // ✅ naam fix
      });

      showSnackbar("Full Body status updated successfully");
    } catch (error) {
      console.error("Error toggling full body status:", error);
      // Rollback on error
      setItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, showFullBodyHealthCheckup: currentStatus } // ✅ naam fix
            : item
        )
      );
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleView = (item) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/delete_product/${id}`);
      showSnackbar("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      showSnackbar("Failed to delete item", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectionModel.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectionModel.length} items?`)) return;
    try {
      await Promise.all(
        selectionModel.map((id) =>
          axios.delete(`${API_BASE_URL}/delete_product/${id}`)
        )
      );
      showSnackbar("Selected items deleted successfully");
      setSelectionModel([]);
      fetchItems();
    } catch (error) {
      console.error("Error during bulk delete:", error);
      showSnackbar("Bulk delete failed", "error");
    }
  };

  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showSnackbar("Please select a CSV file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);

    setCsvImporting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/bulk-import-csv`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const result = response.data || {};
      const errorCount = Array.isArray(result.errors) ? result.errors.length : 0;
      const firstError =
        errorCount > 0
          ? ` First error (row ${result.errors[0].row}): ${result.errors[0].message}`
          : "";
      showSnackbar(
        `CSV import: ${result.created || 0} created, ${result.updated || 0} updated, ${result.skipped || 0} skipped.${firstError}`,
        result.skipped > 0 ? "warning" : "success"
      );
      fetchItems();
    } catch (error) {
      console.error("CSV import failed:", error);
      showSnackbar(
        error.response?.data?.message || "CSV import failed",
        "error"
      );
    } finally {
      setCsvImporting(false);
    }
  };

  const handleDownloadCsvTemplate = () => {
    downloadItemsCsvTemplate();
    showSnackbar("CSV template downloaded", "success");
  };

  const columns = [
    {
      field: "_id",
      headerName: "ID",
      width: 100,
      renderCell: (params) => String(params.row?._id || "").slice(-6),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color="primary"
          sx={{
            cursor: "pointer",
            fontWeight: "medium",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => handleView(params.row)}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
      valueGetter: (value) => normalizeDepartment(value),
    },
    { field: "sortOrder", headerName: "Sort order", width: 130 },
    {
      // ✅ FIX — field naam schema se match karo
      field: "showFullBodyHealthCheckup",
      headerName: "Full Body",
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.value === "Yes"}
          onChange={() =>
            handleToggleFullBody(params.row._id, params.value)
          }
        />
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleToggleStatus(params.row._id, params.value)}
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box p={2}>
      {/* Breadcrumb */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography>
          <Box component="span" sx={{ cursor: "pointer" }}>
            Manage Items /
          </Box>
          <Box component="span" sx={{ color: "#347deb", ml: 1 }}>
            Items
          </Box>
        </Typography>
      </Stack>

      {/* Title + Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Items
        </Typography>
        <Stack direction="row" spacing={1}>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleCsvImport}
          />
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCsvTemplate}
          >
            CSV Template
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<UploadFileIcon />}
            onClick={() => csvInputRef.current?.click()}
            disabled={csvImporting}
          >
            {csvImporting ? "Importing..." : "Import CSV"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => navigate("/admin")}
          >
            Admin
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingItem(null);
              setDialogOpen(true);
            }}
          >
            Add New
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            disabled={selectionModel.length === 0}
          >
            DELETE {selectionModel.length > 0 && `(${selectionModel.length})`}
          </Button>
        </Stack>
      </Stack>

      {/* Data Table */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          checkboxSelection
          pagination
          onRowSelectionModelChange={(newSelection) => {
            setSelectionModel(newSelection);
          }}
          pageSizeOptions={[10, 25, 50]}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Add/Edit Dialog */}
      <ItemListingDialog
        open={dialogOpen}
        handleClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
          fetchItems();
        }}
        initialData={editingItem}
      />

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Item Details</DialogTitle>
        <Divider />
        <DialogContent>
          {viewingItem && (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Name:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{viewingItem.name}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Department:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{normalizeDepartment(viewingItem.department)}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Sort Order:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{viewingItem.sortOrder}</Typography>
              </Grid>

              {/* ✅ FIX — View dialog mein bhi sahi naam */}
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Full Body:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Alert
                  severity={viewingItem.showFullBodyHealthCheckup === "Yes" ? "success" : "error"}
                  icon={false}
                  sx={{ py: 0, px: 1, width: "fit-content" }}
                >
                  {viewingItem.showFullBodyHealthCheckup === "Yes" ? "Yes" : "No"}
                </Alert>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Alert
                  severity={viewingItem.isActive ? "success" : "error"}
                  icon={false}
                  sx={{ py: 0, px: 1, width: "fit-content" }}
                >
                  {viewingItem.isActive ? "Active" : "Inactive"}
                </Alert>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">ID:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {viewingItem._id}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="sm"
      >
        <DialogContent>
          <Box
            component="img"
            src={selectedImage}
            alt="Preview"
            sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Items;
