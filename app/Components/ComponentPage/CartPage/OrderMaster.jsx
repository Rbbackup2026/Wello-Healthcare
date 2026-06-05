import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  InputBase,
  Select,
  MenuItem,
  Pagination,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PlayArrow } from "@mui/icons-material";
import { useNavigate } from "../../../lib/routerCompat";

// Sample order data
const ordersData = [
  {
    id: "MD28",
    date: "11-05-2025",
    platform: "Web",
    customer: "PAWON K.C",
    phone: "9849335591",
    city: "Kathmandu",
    total: "Rs 6384.00",
    payment: "ONLINE",
    status: "Pending",
  },
  {
    id: "MD29",
    date: "12-05-2025",
    platform: "Mobile",
    customer: "Sita Sharma",
    phone: "9876543210",
    city: "Pokhara",
    total: "Rs 4500.00",
    payment: "COD",
    status: "Confirmed",
  },
  {
    id: "MD30",
    date: "10-05-2025",
    platform: "Web",
    customer: "Ram Thapa",
    phone: "9812345678",
    city: "Biratnagar",
    total: "Rs 7000.00",
    payment: "ONLINE",
    status: "Canceled",
  },
];

// Status color mapping for Chip component
const statusColors = {
  Pending: "warning",
  Confirmed: "success",
  Canceled: "error",
};

const OrderMaster = () => {
  const navigate = useNavigate();

  // States
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Effect example: Reset page to 1 on tab change or itemsPerPage change
  useEffect(() => {
    setPage(1);
  }, [tab, itemsPerPage]);

  // Change active tab
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  // Change page number
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Filter orders by status based on active tab
  const filteredByStatus = ordersData.filter((order) => {
    if (tab === 1) return order.status === "Pending";
    if (tab === 2) return order.status === "Confirmed";
    if (tab === 3) return order.status === "Canceled";
    return true; // tab === 0 means "All"
  });

  // Further filter by search input (id, customer, city)
  const filteredOrders = filteredByStatus.filter(
    (order) =>
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.city.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <Box p={3}>
      {/* Back Button */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBackIcon />
        </IconButton>

        <Typography mb={2}>
          <Box component="span" sx={{ cursor: "pointer" }}>
           Orders /
          </Box>
          <Box component="span" sx={{ color: "#347deb", ml: 1 }}>
           All Orders
          </Box>
        </Typography>
      </Stack>

      {/* Title and Action Buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Orders
        </Typography>
        <Stack direction="row" spacing={1}>
          {/* Add buttons here if needed */}
        </Stack>
      </Stack>

      {/* Tabs for filtering by status */}
      <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 3 }}>
        <Tab label={`All (${ordersData.length})`} />
        <Tab label={`Pending (${ordersData.filter((o) => o.status === "Pending").length})`} />
        <Tab label={`Confirmed (${ordersData.filter((o) => o.status === "Confirmed").length})`} />
        <Tab label={`Canceled (${ordersData.filter((o) => o.status === "Canceled").length})`} />
      </Tabs>

      {/* Filters: Items per page & Search */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        spacing={1}
      >
        <Select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(e.target.value)}
          size="small"
          sx={{ width: 100 }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>

        <InputBase
          placeholder="Search by ID, Customer, City"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            border: "1px solid #ccc",
            borderRadius: 1,
            px: 2,
            py: 0.8,
            width: { xs: "100%", sm: 280 },
            fontSize: 14,
          }}
          inputProps={{ "aria-label": "search orders" }}
        />
      </Stack>

      {/* Orders Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Order Date</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>City</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{order.date}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.platform}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{order.customer}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.phone}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{order.city}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{order.total}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.payment}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={statusColors[order.status]}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="info"
                      size="small"
                      aria-label={`view order ${order.id}`}
                      onClick={() => alert(`View order ${order.id}`)}
                    >
                      <PlayArrow />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box
        mt={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="body2" flex="1">
          Showing {filteredOrders.length === 0 ? 0 : startIndex + 1}-
          {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
        </Typography>

        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default OrderMaster;
