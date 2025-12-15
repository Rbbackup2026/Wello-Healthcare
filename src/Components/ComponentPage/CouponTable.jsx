import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CouponFormDialog from "../DailogForm/CouponFormDialog"; // ✅ Import dialog

const API = "https://razobytehealthcare-website-backend-code.onrender.com/v1/api";

const CouponTable = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ================== FETCH COUPONS ==================
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/all`);
      setCoupons(data.coupons || []);
    } catch (error) {
      console.log("Error fetching coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ================== DELETE ==================
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/delete/${id}`);
      fetchCoupons();
    } catch (error) {
      console.log("Delete error", error);
    }
  };

  // ================== TOGGLE ==================
  const toggleStatus = async (id, status) => {
    try {
      await axios.put(`${API}/deactivate/${id}`, { active: status });
      fetchCoupons();
    } catch (error) {
      console.log("Toggle error", error);
    }
  };

  return (
    <Box p={2}>
      {/* ================= Breadcrumb ================= */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <IconButton onClick={() => navigate("/admin")} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography>
          <Box component="span" sx={{ cursor: "pointer" }}>Manage Coupons /</Box>
          <Box component="span" sx={{ color: "#347deb", ml: 1 }}>Coupons</Box>
        </Typography>
      </Stack>

      {/* ================= Title + Actions ================= */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Coupon Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add New Coupon
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
            DELETE
          </Button>
        </Stack>
      </Stack>

      {/* ================= Table ================= */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: "#f3f3f3" }}>
            <TableRow>
              <TableCell><b>Code</b></TableCell>
              <TableCell><b>Type</b></TableCell>
              <TableCell><b>Value</b></TableCell>
              <TableCell><b>Min Amount</b></TableCell>
              <TableCell><b>Expiry</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Action</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType}</TableCell>
                  <TableCell>{coupon.discountValue}</TableCell>
                  <TableCell>{coupon.minAmount}</TableCell>
                  <TableCell>{new Date(coupon.expiry).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.active}
                      onChange={() => toggleStatus(coupon._id, !coupon.active)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(coupon._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? "Loading..." : "No Coupons Found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= Dialog Form ================= */}
      <CouponFormDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        onSuccess={fetchCoupons}
      />
    </Box>
  );
};

export default CouponTable;
