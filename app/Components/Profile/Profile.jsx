"use client";

import React from "react";
import {
  Box,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { useNavigate } from "../../lib/routerCompat";

export default function Profile({ setIsAuthenticated }) {
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

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

  // Open confirmation dialog
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  // Close confirmation dialog
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  // Actual logout logic
  const handleLogout = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("adminToken");
      
      console.log("🔑 Token for logout:", token);
      
      if (token) {
        // Try to call backend logout API
        try {
          await axios.post(
            "http://localhost:3000/v1/api/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("✅ Backend logout successful");
        } catch (apiError) {
          console.log("⚠️ Backend logout failed, but continuing with frontend logout:", apiError.message);
          // Continue with frontend logout even if backend fails
        }
      }

      // Clear all frontend storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminTokenExpiry");
      localStorage.removeItem("adminLoginTime");
      
      // Also clear old token names if they exist
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      console.log("🗑️ All localStorage cleared");

      // Update authentication state
      if (setIsAuthenticated) setIsAuthenticated(false);
      
      showNotification("Logout successful!", "success");

      // Redirect after short delay
      setTimeout(() => {
        navigate("/admin_index");
      }, 1000);

    } catch (error) {
      console.error("❌ Logout error:", error);
      
      // Even if there's an error, clear frontend storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminTokenExpiry");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      if (setIsAuthenticated) setIsAuthenticated(false);
      
      showNotification("Logged out successfully", "info");
      
      setTimeout(() => {
        navigate("/admin_index");
      }, 1000);
    } finally {
      handleCloseConfirm();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
      <MenuItem onClick={handleOpenConfirm}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <strong>Logout</strong>
      </MenuItem>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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
    </Box>
  );
}
