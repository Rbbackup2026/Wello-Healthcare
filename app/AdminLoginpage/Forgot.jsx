"use client";

import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "../lib/routerCompat";
import axios from "axios";
import { toApiUrl } from "../utils/api";

function Forgot() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    try {
      const response = await axios.post(toApiUrl("/forgot-password"), {
        email,
      });

      console.log("Forgot password request sent:", response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending reset email:", error.response?.data || error.message);
      alert("Failed to send reset instructions. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={0}
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your registered email address to receive reset instructions.
        </Typography>

        {!submitted ? (
          <>
            <Typography fontSize="14px" fontWeight={600} mb={0.5}>
              Email Address
            </Typography>
            <TextField
              placeholder="admin@gmail.com"
              fullWidth
              size="small"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: "#002db3",
                "&:hover": { backgroundColor: "#001f80" },
                textTransform: "none",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Send Reset Link
            </Button>

            <Button
              fullWidth
              onClick={() => navigate("/admin_index")}
              sx={{ textTransform: "none", fontSize: "14px" }}
            >
              Back to Sign In
            </Button>
          </>
        ) : (
          <Box textAlign="center">
            <Typography color="success.main" fontWeight={600}>
              If an account exists, reset instructions have been sent.
            </Typography>
            <Button
              fullWidth
              sx={{ mt: 3, textTransform: "none" }}
              onClick={() => navigate("/admin-login")}
            >
              Back to Sign In
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Forgot;
