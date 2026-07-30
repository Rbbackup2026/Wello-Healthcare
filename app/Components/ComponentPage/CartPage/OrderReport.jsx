"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/api";

const ReportTable = ({ title, rows, nameKey = "_id" }) => (
  <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align="right">Orders</TableCell>
          <TableCell align="right">Revenue</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(rows || []).length === 0 ? (
          <TableRow>
            <TableCell colSpan={3}>No data</TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={String(row[nameKey])}>
              <TableCell>{row[nameKey] || "-"}</TableCell>
              <TableCell align="right">{row.orders}</TableCell>
              <TableCell align="right">
                ₹ {Number(row.revenue || 0).toLocaleString()}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Paper>
);

const OrderReport = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/order-reports`, {
        params: {
          from: from || undefined,
          to: to || undefined,
          city: city || undefined,
        },
      });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const summary = report?.summary || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Order Reports
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <TextField
          type="date"
          label="From"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          type="date"
          label="To"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <TextField
          label="City"
          size="small"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Button variant="contained" onClick={fetchReport}>
          Apply
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} mb={3}>
            {[
              ["Orders", summary.orders || 0],
              ["Revenue", `₹ ${Number(summary.revenue || 0).toLocaleString()}`],
              ["AOV", `₹ ${Number(summary.averageOrderValue || 0).toLocaleString()}`],
              ["Conversion", `${summary.conversionRate || 0}%`],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ReportTable title="By Date" rows={report?.byDate || []} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportTable title="By City" rows={report?.byCity || []} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportTable title="By Lab" rows={report?.byLab || []} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportTable title="By Test" rows={report?.byTest || []} />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default OrderReport;
