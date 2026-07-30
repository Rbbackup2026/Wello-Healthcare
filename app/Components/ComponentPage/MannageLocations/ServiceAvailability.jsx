"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/api";

/** Combined view: check which pincodes/areas have home collection */
const ServiceAvailability = () => {
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [checkPin, setCheckPin] = useState("");
  const [checkResult, setCheckResult] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pinRes, areaRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/service-pincodes`, {
          params: city ? { city } : undefined,
        }),
        axios.get(`${API_BASE_URL}/service-areas`, {
          params: city ? { city } : undefined,
        }),
      ]);
      setPincodes(pinRes.data?.pincodes || []);
      setAreas(areaRes.data?.areas || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load service data");
      setPincodes([]);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const availablePins = useMemo(
    () => pincodes.filter((row) => row.isActive && row.homeCollectionAvailable),
    [pincodes]
  );

  const handleCheck = async () => {
    if (!/^\d{6}$/.test(checkPin)) {
      alert("Enter a valid 6-digit pincode");
      return;
    }
    try {
      const res = await axios.get(
        `${API_BASE_URL}/service-pincodes/check/${checkPin}`
      );
      setCheckResult(res.data);
    } catch (err) {
      setCheckResult({
        available: false,
        message: err.response?.data?.message || "Check failed",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Service Availability
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage home-collection coverage by pincode & area. Add data from Pincodes
        / Areas menus, then review here.
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <TextField
          size="small"
          label="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Button variant="contained" onClick={load}>
          Apply
        </Button>
        <TextField
          size="small"
          label="Check pincode"
          value={checkPin}
          onChange={(e) =>
            setCheckPin(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />
        <Button variant="outlined" onClick={handleCheck}>
          Check
        </Button>
      </Stack>

      {checkResult ? (
        <Alert
          severity={checkResult.available ? "success" : "warning"}
          sx={{ mb: 2 }}
        >
          {checkResult.available
            ? `Home collection available for ${checkPin}${
                checkResult.service?.area
                  ? ` (${checkResult.service.area}, ${checkResult.service.city})`
                  : ""
              }`
            : `Home collection not available for ${checkPin}`}
        </Alert>
      ) : null}

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Home Collection Pincodes ({availablePins.length})
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pincode</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availablePins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      No active home-collection pincodes. Add from Manage
                      Pincodes.
                    </TableCell>
                  </TableRow>
                ) : (
                  availablePins.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{row.pincode}</TableCell>
                      <TableCell>{row.area || "-"}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>
                        <Chip size="small" color="success" label="Available" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Service Areas ({areas.filter((a) => a.isActive).length})
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Area</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.filter((a) => a.isActive).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      No active areas. Add from Areas/Localities.
                    </TableCell>
                  </TableRow>
                ) : (
                  areas
                    .filter((a) => a.isActive)
                    .map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.city}</TableCell>
                        <TableCell>{row.state || "-"}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}
    </Box>
  );
};

export default ServiceAvailability;
