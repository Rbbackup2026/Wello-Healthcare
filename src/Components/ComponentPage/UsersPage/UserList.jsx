import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const usersMock = [
  {
    id: 58,
    name: "",
    phone: "9843599656",
    email: "",
    date: "14-12-2025 03:44 PM",
    otp: "Yes",
    otpCode: "8160",
    status: true,
  },
  {
    id: 57,
    name: "Simron Limbu",
    phone: "9823031276",
    email: "Lasayu@rocketmail.com",
    date: "12-12-2025 08:31 AM",
    otp: "Yes",
    otpCode: "3476",
    status: true,
  },
  {
    id: 56,
    name: "",
    phone: "9860049907",
    email: "",
    date: "12-12-2025 02:46 AM",
    otp: "No",
    otpCode: "7916",
    status: true,
  },
];

const UserList = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  return (
    <Box p={3} bgcolor="#f5f6fa" minHeight="100vh">
      {/* ===== Header ===== */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Typography variant="caption" color="text.secondary">
              CUSTOMERS / CUSTOMER LIST
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              Customer List
            </Typography>
          </Box>
        </Stack>

        <Button variant="contained">+ Add New</Button>
      </Stack>

      {/* ===== Search Section ===== */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography fontWeight={500} mb={2}>
            Search
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField type="date" size="small" />
            <TextField type="date" size="small" />
            <Button variant="contained" color="success">
              Search
            </Button>
            <Button variant="contained" color="error">
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===== Tabs & Table ===== */}
      <Card>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="All (50)" />
          <Tab label="Active (50)" />
          <Tab label="Inactive (0)" />
        </Tabs>

        <CardContent>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Select size="small" defaultValue={10}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>

            <TextField size="small" placeholder="Search..." />
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f1f3f6" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone & Email</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>OTP Verified</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {usersMock.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>

                    <TableCell>{u.name || "-"}</TableCell>

                    <TableCell>
                      <Typography>{u.phone}</Typography>
                      {u.email && (
                        <Typography color="primary" variant="body2">
                          {u.email}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{u.date}</TableCell>

                    <TableCell>
                      <Chip
                        label={u.otp}
                        size="small"
                        color={u.otp === "Yes" ? "warning" : "error"}
                      />
                      <Typography variant="caption" display="block">
                        {u.otpCode}
                      </Typography>
                    </TableCell>

                    <TableCell>{u.status ? "✔" : "✖"}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained">
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserList;
