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

const BlogCategoryForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 1,
    status: "Active"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Initialize form when dialog opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sortOrder: initialData.sortOrder || 1,
        status: initialData.status || "Active"
      });
    } else {
      setFormData({
        name: "",
        sortOrder: 1,
        status: "Active"
      });
    }
    setErrors({});
  }, [open, initialData]);

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    
    if (formData.sortOrder < 1) {
      newErrors.sortOrder = "Sort order must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        showNotification("Please login again", "error");
        return;
      }

      const apiUrl = initialData 
        ? `http://localhost:3000/v1/api/categoryblogput/${initialData._id}`
        : 'http://localhost:3000/v1/api/categoryblog/post';

      const method = initialData ? 'PUT' : 'POST';

      console.log('📤 Sending request to:', apiUrl);
      console.log('📦 Request data:', formData);

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      console.log('📥 Response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        showNotification(
          initialData ? "Category updated successfully!" : "Category created successfully!", 
          "success"
        );
        
        // Pass the created/updated data back to parent
        if (onSubmit) {
          onSubmit(result.data || formData);
        }
        
        // Close dialog after success
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        throw new Error(result.message || "Operation failed");
      }

    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        setErrors({ name: 'Category with this name already exists' });
      } else if (error.message.includes('Category name is required')) {
        setErrors({ name: 'Category name is required' });
      } else if (error.message.includes('Sort order must be at least 1')) {
        setErrors({ sortOrder: 'Sort order must be at least 1' });
      } else {
        showNotification(error.message || "Something went wrong. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'sortOrder' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      sortOrder: 1,
      status: "Active"
    });
    setErrors({});
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={loading ? undefined : handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit
        }}
      >
        <DialogTitle>
          <Typography variant="h6" component="h2">
            {initialData ? "Edit Category" : "Add New Category"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box className="space-y-4 mt-2">
            {/* Name Field */}
            <TextField
              fullWidth
              label={
                <span>
                  Name <span className="text-red-500">*</span>
                </span>
              }
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              size="small"
              margin="normal"
              disabled={loading}
              placeholder="Enter category name"
            />

            {/* Sort Order and Status */}
            <Box className="flex gap-4">
              {/* Sort Order */}
              <FormControl fullWidth size="small" margin="normal" error={!!errors.sortOrder}>
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={formData.sortOrder}
                  onChange={handleChange('sortOrder')}
                  label="Sort Order"
                  disabled={loading}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
                {errors.sortOrder && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, display: 'block' }}>
                    {errors.sortOrder}
                  </Typography>
                )}
              </FormControl>

              {/* Status */}
              <FormControl fullWidth size="small" margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                  label="Status"
                  disabled={loading}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose} 
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? "Processing..." : (initialData ? "Update" : "Create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BlogCategoryForm;