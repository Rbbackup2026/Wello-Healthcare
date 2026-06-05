// BlogTagForm.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

const BlogTagForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 1,
    mostUsed: "No",
    status: "Active"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sortOrder: initialData.sortOrder || 1,
        mostUsed: initialData.mostUsed || "No",
        status: initialData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        sortOrder: 1,
        mostUsed: "No",
        status: "Active",
      });
    }
    setErrors({});
  }, [open, initialData]);

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.sortOrder < 1) newErrors.sortOrder = "Sort order must be at least 1";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const apiUrl = initialData
        ? `http://localhost:3000/v1/api/tagput/${initialData._id}`
        : "http://localhost:3000/v1/api/blogtagpost";

      const method = initialData ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        showNotification(
          initialData ? "Updated successfully!" : "Created successfully!"
        );
        onSubmit(result.data || formData);
        setTimeout(() => handleClose(), 800);
      } else {
        showNotification(result.message, "error");
      }

    } catch (err) {
      showNotification("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      sortOrder: 1,
      mostUsed: "No",
      status: "Active"
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={!loading ? handleClose : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{ component: "form", onSubmit: handleSubmit }}
      >
        <DialogTitle>
          <Typography variant="h6">
            {initialData ? "Edit Tag" : "Add New Tag"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box className="space-y-4 mt-2">

            {/* Name */}
            <TextField
              fullWidth
              label={<span>Name <span className="text-red-500">*</span></span>}
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              size="small"
              placeholder="Enter name"
            />

            {/* Sort Order + Most Used + Status */}
            <Box className="flex gap-4 pt-5">

              {/* Sort Order */}
              <FormControl fullWidth size="small" error={!!errors.sortOrder}>
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={formData.sortOrder}
                  label="Sort Order"
                  onChange={handleChange("sortOrder")}
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Most Used */}
              <FormControl fullWidth size="small">
                <InputLabel>Most Used</InputLabel>
                <Select
                  value={formData.mostUsed}
                  label="Most Used"
                  onChange={handleChange("mostUsed")}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>

              {/* Status */}
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleChange("status")}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

            </Box>

          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? "Please wait…" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BlogTagForm;
