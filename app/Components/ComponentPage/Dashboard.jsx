"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";

const StatCard = ({ label, value, hint }) => (
  <Paper sx={{ p: 2.5, height: "100%", borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
      {value}
    </Typography>
    {hint ? (
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    ) : null}
  </Paper>
);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`);
      setStats(res.data?.stats || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Live Dashboard
        </Typography>
        <Chip label="Today" color="primary" variant="outlined" onClick={fetchStats} />
      </Stack>

      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}. Login again if token expired.
        </Alert>
      ) : null}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Today's Bookings"
            value={stats?.todayBookings ?? 0}
            hint="Orders placed today"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Today's Revenue"
            value={`₹ ${(stats?.todayRevenue || 0).toLocaleString()}`}
            hint="Excludes cancelled/refunded"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Pending Collections"
            value={stats?.pendingCollections ?? 0}
            hint="Booked / In progress"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Active Catalog"
            value={stats?.activeCatalogCount ?? 0}
            hint="Active tests/packages"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popular Tests
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Test</TableCell>
                  <TableCell align="right">Bookings</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats?.popularTests || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>No booking data yet</TableCell>
                  </TableRow>
                ) : (
                  (stats?.popularTests || []).map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.bookings}</TableCell>
                      <TableCell align="right">
                        ₹ {Number(row.revenue || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats?.recentOrders || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>No orders yet</TableCell>
                  </TableRow>
                ) : (
                  (stats?.recentOrders || []).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.patientName}</TableCell>
                      <TableCell>{order.city || "-"}</TableCell>
                      <TableCell>
                        <Chip size="small" label={order.status} />
                      </TableCell>
                      <TableCell align="right">
                        ₹ {Number(order.totalAmount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
