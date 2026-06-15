import React, { useState } from "react";
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, TextField, MenuItem, Typography, Box, InputAdornment, IconButton
} from "@mui/material";
import axios from "axios";
import AutorenewIcon from '@mui/icons-material/Autorenew'; // for generate icon
import { API_BASE_URL } from "../../utils/api";

const API = API_BASE_URL;

const CouponFormDialog = ({ open, handleClose, onSuccess }) => {
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minAmount: "",
    maxDiscount: "",
    expiry: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Generate 10-character alphanumeric coupon code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(`${API}/coupon-create`, form);

      if (data.success) {
        onSuccess();
        handleClose();
        setForm({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minAmount: "",
          maxDiscount: "",
          expiry: "",
        });
      }
    } catch (error) {
      console.log("Create error", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create New Coupon
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            fullWidth
            label="Coupon Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Enter coupon code"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={generateCode} edge="end">
                    <AutorenewIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            select
            fullWidth
            label="Discount Type"
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
          >
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="flat">Flat</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Discount Value"
            name="discountValue"
            type="number"
            value={form.discountValue}
            onChange={handleChange}
            placeholder="Enter discount value"
          />

          <TextField
            fullWidth
            label="Minimum Amount"
            name="minAmount"
            type="number"
            value={form.minAmount}
            onChange={handleChange}
            placeholder="Minimum purchase amount"
          />

          {form.discountType === "percentage" && (
            <TextField
              fullWidth
              label="Maximum Discount"
              name="maxDiscount"
              type="number"
              value={form.maxDiscount}
              onChange={handleChange}
              placeholder="Maximum discount amount"
            />
          )}

          <TextField
            fullWidth
            label="Expiry Date"
            name="expiry"
            type="date"
            value={form.expiry}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Create Coupon
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponFormDialog;
