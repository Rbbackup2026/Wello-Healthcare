import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  Snackbar,
  CircularProgress,
  Fade,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");
    const tokenExpiry = localStorage.getItem("adminTokenExpiry");

    if (token && userData && tokenExpiry) {
      const isExpired = Date.now() > parseInt(tokenExpiry);
      if (!isExpired) {
        console.log("✅ User already logged in, redirecting...");
        if (setIsAuthenticated) setIsAuthenticated(true);
        navigate("/admin");
      } else {
        // Clear expired data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminTokenExpiry");
      }
    }
  }, [navigate, setIsAuthenticated]);

  // Notification handler
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      showNotification("Please enter both email and password.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://razobytehealthcare-website-backend-code.onrender.com/v1/api/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("📨 Full API Response:", response);
      console.log("📊 Response Data:", response.data);

      // Check if login was successful
      if (response.data && response.data.msg === "Login successful") {
        
        // ✅ Token backend se aa raha hai ab
        let token = response.data.token;
        
        if (!token) {
          showNotification("No token received from server.", "error");
          return;
        }

        console.log("🔑 Token received from backend:", token);

        // User data prepare karein
        const userData = {
          email: response.data.userdata.email,
          id: response.data.userdata._id,
          name: response.data.userdata.name || "Admin User"
        };

        console.log("👤 User data:", userData);

        // LocalStorage mein save karein
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(userData));
        localStorage.setItem("adminLoginTime", Date.now().toString());
        
        // Expiry time set karein based on keepLoggedIn
        if (keepLoggedIn) {
          const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
          localStorage.setItem("adminTokenExpiry", expiryTime.toString());
          console.log("🕒 Token expires in 7 days");
        } else {
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 1 day
          localStorage.setItem("adminTokenExpiry", expiryTime.toString());
          console.log("🕒 Token expires in 1 day");
        }

        console.log("✅ Login successful, data saved to localStorage");
        
        // Show success notification
        showNotification("Login successful! Redirecting...", "success");

        // Authentication state update karein
        setTimeout(() => {
          if (setIsAuthenticated) setIsAuthenticated(true);
          navigate("/admin");
        }, 1500);

      } else {
        showNotification("Login failed: Invalid response from server", "error");
      }

    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        console.log("Error response data:", error.response.data);
        
        // Server responded with error status
        switch (error.response.status) {
          case 401:
            errorMessage = error.response.data?.msg || "Invalid email or password.";
            break;
          case 404:
            errorMessage = error.response.data?.msg || "User not found.";
            break;
          case 500:
            errorMessage = error.response.data?.msg || "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.msg || "Login failed.";
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
        console.log("Network error details:", error.request);
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else {
        errorMessage = "An unexpected error occurred.";
      }

      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Test API connection
  const testAPI = async () => {
    try {
      console.log("🧪 Testing API connection...");
      const response = await axios.get("https://razobytehealthcare-website-backend-code.onrender.com/v1/api/authuser");
      console.log("API Test Response:", response.data);
    } catch (error) {
      console.error("API Test Error:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 50% 50%, #333 0%, #000 100%)",
          zIndex: 0,
        },
      }}
    >
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              backgroundColor: "#fff",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              transform: "translateY(0)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
              },
            }}
          >
            {/* Header Section */}
            <Box textAlign="center" mb={3}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                mb={1}
                sx={{
                  background: "linear-gradient(135deg, #002db3 0%, #0055ff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your admin dashboard
              </Typography>
              
              {/* Debug Button - Remove in production */}
              {/* <Button 
                size="small" 
                onClick={testAPI}
                sx={{ mt: 1, fontSize: '10px' }}
              >
                Test API
              </Button> */}
            </Box>

            {/* Email Field */}
            <Box mb={3}>
              <Typography fontSize="14px" fontWeight={600} mb={1}>
                Email Address
              </Typography>
              <TextField
                placeholder="email"
                fullWidth
                size="medium"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#002db3",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#002db3",
                    },
                  },
                }}
              />
            </Box>

            {/* Password Field */}
            <Box mb={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography fontSize="14px" fontWeight={600}>
                  Password
                </Typography>
                <Link
                  component="button"
                  onClick={() => navigate("/forgot-password")}
                  underline="hover"
                  fontSize="13px"
                  color="#002db3"
                  fontWeight="500"
                  disabled={loading}
                >
                  Forgot password?
                </Link>
              </Box>
              <TextField
                fullWidth
                size="medium"
                variant="outlined"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        sx={{ color: "text.secondary" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#002db3",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#002db3",
                    },
                  },
                }}
              />
            </Box>

            {/* Login Button */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                backgroundColor: "#002db3",
                background: "linear-gradient(135deg, #002db3 0%, #0055ff 100%)",
                "&:hover": {
                  backgroundColor: "#001f80",
                  background: "linear-gradient(135deg, #001f80 0%, #0044cc 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 45, 179, 0.3)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #cccccc 0%, #999999 100%)",
                },
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "16px",
                borderRadius: 2,
                boxShadow: "0 4px 8px rgba(0, 45, 179, 0.2)",
                transition: "all 0.3s ease",
              }}
              onClick={handleLogin}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Keep Logged In Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  color="primary"
                  size="small"
                  disabled={loading}
                  sx={{
                    color: "#002db3",
                    "&.Mui-checked": {
                      color: "#002db3",
                    },
                  }}
                />
              }
              label={
                <Typography fontSize="14px" color="text.secondary">
                  Keep Me Logged In For 1 Week
                </Typography>
              }
              sx={{ mt: 1 }}
            />

            {/* Footer */}
            <Box mt={3} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Secure admin access • Protected by encryption
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default AdminLogin;