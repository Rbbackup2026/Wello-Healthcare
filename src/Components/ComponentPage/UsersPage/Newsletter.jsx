import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom"; // If using React Router

const Newsletter = () => {
  const [rows] = useState([]); // empty data (as screenshot)
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate(); // If using React Router

  const handleBack = () => {
    // If using React Router:
    navigate(-1); // Go back one page
    
    // If not using React Router, you can use:
    // window.history.back();
  };

  return (
    <Box p={3} bgcolor="#f5f6fa" minHeight="100vh">
      {/* ===== Header ===== */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Back Button */}
          <IconButton
            onClick={handleBack}
            sx={{
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Typography variant="caption" color="text.secondary">
              USERS & WALLET / NEWSLETTER
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              Newsletter
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          sx={{
            borderColor: "#d32f2f",
            color: "#d32f2f",
            "&:hover": {
              borderColor: "#b71c1c",
              backgroundColor: "rgba(211, 47, 47, 0.04)",
            },
          }}
        >
          Delete
        </Button>
      </Stack>

      {/* ===== Table Card ===== */}
      <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mb={2}
            display="block"
            color="#1976d2"
          >
            ALL NEWSLETTER
          </Typography>

          {/* Controls */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={2}
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Items/page
              </Typography>
              <Select
                size="small"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Stack>

            <TextField
              size="small"
              placeholder="Search..."
              sx={{ minWidth: 200 }}
              InputProps={{
                sx: { backgroundColor: "white" },
              }}
            />
          </Stack>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f1f3f6" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ID.</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No data available in table
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox />
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mt={2}
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              Showing 0 to 0 of 0 entries
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                disabled
                sx={{ minWidth: 90 }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                disabled
                sx={{ minWidth: 90 }}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Optional: Add some sample data for testing */}
      <Box mt={3}>
        <Button
          variant="contained"
          sx={{ mr: 2 }}
          onClick={() => {
            // You can add functionality to add test data here
            console.log("Add newsletter clicked");
          }}
        >
          Add Newsletter
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            // Export functionality
            console.log("Export clicked");
          }}
        >
          Export Data
        </Button>
      </Box>
    </Box>
  );
};

export default Newsletter;