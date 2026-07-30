"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/api";

const STATUS_FLOW = [
  "Booked",
  "Sample Collected",
  "Processing",
  "Report Ready",
  "Completed",
  "Cancelled",
  "Refunded",
];

const statusColor = {
  Booked: "warning",
  Pending: "warning",
  "Sample Collected": "info",
  Confirmed: "info",
  Processing: "primary",
  "Report Ready": "success",
  Completed: "success",
  Cancelled: "error",
  Refunded: "default",
};

const OrderMaster = () => {
  const [tab, setTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("Booked");
  const [labId, setLabId] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/orders`, {
        params: {
          status: tab,
          search: search || undefined,
          limit: 100,
        },
      });
      setOrders(res.data?.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getlab`);
      const list = res.data?.labs || res.data?.data || res.data || [];
      setLabs(Array.isArray(list) ? list : []);
    } catch {
      setLabs([]);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const openOrder = (order) => {
    setSelected(order);
    setEditStatus(order.displayStatus || order.status || "Booked");
    setLabId(order.assignedLab?._id || order.assignedLab || "");
    setRefundReason(order.refundReason || "");
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/order-status/${selected._id}`, {
        status: editStatus,
        paymentStatus:
          editStatus === "Completed"
            ? "Paid"
            : editStatus === "Refunded"
              ? "Refunded"
              : selected.paymentStatus,
      });
      await fetchOrders();
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignLab = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/admin/orders/${selected._id}/assign-lab`, {
        labId: labId || null,
      });
      await fetchOrders();
      openOrder({
        ...selected,
        assignedLab: labId,
        assignedLabName:
          labs.find((lab) => String(lab._id) === String(labId))?.labName || "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Lab assign failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!selected) return;
    if (!window.confirm("Refund this order?")) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/admin/orders/${selected._id}/refund`, {
        refundReason,
        refundAmount: selected.totalAmount,
      });
      await fetchOrders();
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || "Refund failed");
    } finally {
      setSaving(false);
    }
  };

  const tabs = useMemo(() => ["All", ...STATUS_FLOW], []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Order Master
        </Typography>
        <IconButton onClick={fetchOrders}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search patient, phone, city, test..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={fetchOrders}>
          Search
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {tabs.map((item) => (
          <Tab key={item} value={item} label={item} />
        ))}
      </Tabs>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Lab</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>No orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{String(order._id).slice(-6).toUpperCase()}</TableCell>
                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.patientName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.mobileNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.city || "-"}</TableCell>
                    <TableCell>
                      {order.assignedLabName ||
                        order.assignedLab?.labName ||
                        "Unassigned"}
                    </TableCell>
                    <TableCell>
                      {order.paymentMethod} / {order.paymentStatus}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={statusColor[order.displayStatus || order.status] || "default"}
                        label={order.displayStatus || order.status}
                      />
                    </TableCell>
                    <TableCell align="right">
                      ₹ {Number(order.totalAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => openOrder(order)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Order</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Stack spacing={2} mt={1}>
              <Typography variant="body2">
                <strong>{selected.patientName}</strong> · {selected.city} ·{" "}
                {selected.slotDate} {selected.slotTime}
              </Typography>
              <Typography variant="body2">
                Items: {(selected.items || []).map((i) => i.name).join(", ")}
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {STATUS_FLOW.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Assign Lab</InputLabel>
                <Select
                  label="Assign Lab"
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {labs.map((lab) => (
                    <MenuItem key={lab._id} value={lab._id}>
                      {lab.labName || lab.name} ({lab.city})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Refund reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={2}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button onClick={handleAssignLab} disabled={saving}>
            Save Lab
          </Button>
          <Button color="error" onClick={handleRefund} disabled={saving}>
            Refund
          </Button>
          <Button variant="contained" onClick={handleUpdateStatus} disabled={saving}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderMaster;
