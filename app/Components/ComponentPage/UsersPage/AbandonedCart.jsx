"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import { useNavigate } from "../../../lib/routerCompat";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/api";
import { toast } from "react-toastify";

const ABANDONED_CARTS_STORAGE_KEY = "abandonedCartRecords";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const readAbandonedCarts = () => {
  try {
    const stored = localStorage.getItem(ABANDONED_CARTS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse abandoned cart records", error);
    return [];
  }
};

const AbandonedCart = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page] = useState(1);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState("");
  const lastRecordsRef = useRef("[]");

  useEffect(() => {
    const syncRecords = () => {
      const latestRecordsMap = new Map();

      readAbandonedCarts()
        .filter((entry) => (entry?.items?.length || entry?.customerName || entry?.phone) && (entry?.phone || entry?.email || entry?.address))
        .sort(
          (a, b) =>
            new Date(b.updatedOn || b.addedOn || 0).getTime() -
            new Date(a.updatedOn || a.addedOn || 0).getTime()
        )
        .forEach((entry) => {
          const dedupeKey =
            entry.userId ||
            entry.phone ||
            entry.email ||
            entry.sessionKey ||
            entry.recordKey ||
            entry.id;

          if (!dedupeKey || latestRecordsMap.has(dedupeKey)) {
            return;
          }

          latestRecordsMap.set(dedupeKey, entry);
        });

      const nextRecords = Array.from(latestRecordsMap.values());

      const serialized = JSON.stringify(nextRecords);
      if (lastRecordsRef.current === serialized) return;
      lastRecordsRef.current = serialized;
      setRecords(nextRecords);
    };

    let timeoutId;
    const scheduleSync = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(syncRecords, 250);
    };

    syncRecords();
    window.addEventListener("storage", scheduleSync);
    window.addEventListener("abandoned-cart-updated", scheduleSync);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", scheduleSync);
      window.removeEventListener("abandoned-cart-updated", scheduleSync);
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return records;

    return records.filter((record) => {
      const itemNames = (record.items || []).map((item) => item.name).join(" ");
      const haystack = [
        record.customerName,
        record.phone,
        record.email,
        record.address,
        record.city,
        record.state,
        itemNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [records, search]);
const handleOpenNotify = (record) => {
  console.log("🔍 Full record:", record); // Yeh print karo
  setSelectedUser(record);
  setNotifyMessage(`Hello ${record.customerName || 'Customer'}, you have some items left in your cart. Complete your order now to book your tests!`);
  setIsNotifyOpen(true);
};

const handleSendNotification = async () => {
  if (!notifyMessage.trim()) return;

  // ✅ Pehle console mein dekho kya field available hai
  console.log("Selected user full object:", selectedUser);

  // ✅ डेटाबेस के हिसाब से userId निकालें
  const userId = selectedUser?.userId || selectedUser?.customerId || (typeof selectedUser?.id === 'string' ? selectedUser.id : null);

  if (!userId) {
    toast.error("User ID not found! Cannot send notification.");
    return;
  }

  try {
    await axios.post(`${API_BASE_URL}/send-user-notification`, {
      userId: userId,
      message: notifyMessage,
    });

    toast.success("Notification sent successfully!");
    setIsNotifyOpen(false);
    setNotifyMessage("");
    setSelectedUser(null);
  } catch (error) {
    console.error("Failed to send notification:", error);
    toast.error("Failed to send notification.");
  }
};

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box p={3} bgcolor="#f5f6fa" minHeight="100vh">
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>

        <Box>
          <Typography variant="caption" color="text.secondary">
            USERS &amp; WALLET / ABANDONED CART
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Abandoned Cart
          </Typography>
        </Box>
      </Stack>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
            mb={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <LocalMallOutlinedIcon sx={{ color: "#1976d2" }} />
              <Typography fontWeight={600}>
                All Cart Lost ({filteredRecords.length})
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Select
                size="small"
                value={itemsPerPage}
                onChange={(event) => setItemsPerPage(Number(event.target.value))}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value={10}>10 Items/page</MenuItem>
                <MenuItem value={25}>25 Items/page</MenuItem>
                <MenuItem value={50}>50 Items/page</MenuItem>
              </Select>

              <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, phone, item..."
                sx={{ minWidth: { xs: "100%", sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Added On</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record, index) => (
                    <TableRow key={record.id || `${record.phone}-${index}`} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {startIndex + index + 1}
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600}>
                          {record.customerName || "Name not entered"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.phone || "No phone"}
                        </Typography>
                        {record.email ? (
                          <Typography variant="caption" color="primary">
                            {record.email}
                          </Typography>
                        ) : null}
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.75}>
                          {(record.items || []).slice(0, 3).map((item, itemIndex) => (
                            <Typography key={`${record.id}-item-${itemIndex}`} variant="body2">
                              {item.name} x {item.quantity || item.qty || 1}
                            </Typography>
                          ))}
                          {(record.items || []).length === 0 ? (
                            <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>
                              Items cleared from cart
                            </Typography>
                          ) : null}
                          {(record.items || []).length > 3 ? (
                            <Typography variant="caption" color="text.secondary">
                              +{record.items.length - 3} more items
                            </Typography>
                          ) : null}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600}>
                          {formatCurrency(record.totalAmount || record.subtotal)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="body2">
                          {record.address || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            {formatDateTime(record.updatedOn || record.addedOn)}
                          </Typography>
                          <Chip
                            label={record.source || "Web"}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenNotify(record)}
                        >
                          Send Notification
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography fontWeight={600}>No abandoned carts found.</Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        User cart details will appear here when a user fills out checkout details but does not complete the payment.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            mt={2}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {filteredRecords.length ? startIndex + 1 : 0}-
              {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of{" "}
              {filteredRecords.length}
            </Typography>

            <Chip
              label={`Showing latest ${itemsPerPage}`}
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Notification Modal */}
      <Dialog open={isNotifyOpen} onClose={() => setIsNotifyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Notification to User</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box mb={2}>
              <Typography variant="body2"><strong>To:</strong> {selectedUser.customerName || "Customer"}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {selectedUser.phone || "N/A"}</Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Type Message"
            value={notifyMessage}
            onChange={(e) => setNotifyMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNotifyOpen(false)}>Cancel</Button>
          <Button onClick={handleSendNotification} variant="contained" color="primary">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AbandonedCart;
