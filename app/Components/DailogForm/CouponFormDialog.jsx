import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import axios from "axios";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { API_BASE_URL } from "../../utils/api";
import { METRO_CITIES } from "../../utils/cityApi";

const API = API_BASE_URL;

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minAmount: "",
  maxDiscount: "",
  expiry: "",
};

const CouponFormDialog = ({ open, handleClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const { data } = await axios.get(`${API}/get_product`);
        const items = Array.isArray(data?.data) ? data.data : data?.data?.data || [];
        setProducts(items);
      } catch (fetchError) {
        console.error("Failed to fetch products", fetchError);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [open]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 10; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  const toggleCity = (cityName) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((city) => city !== cityName)
        : [...prev, cityName]
    );
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedCities([]);
    setSelectedProducts([]);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSubmitting(true);

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        cities: selectedCities,
        products: selectedProducts.map((product) => product._id),
      };

      const { data } = await axios.post(`${API}/coupon-create`, payload);

      if (data.success) {
        onSuccess();
        handleClose();
        resetForm();
      }
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create New Coupon
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}

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
              ),
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

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              City Restrictions (Optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Leave all unchecked to allow every city.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {METRO_CITIES.map((cityName) => (
                <FormControlLabel
                  key={cityName}
                  control={
                    <Switch
                      checked={selectedCities.includes(cityName)}
                      onChange={() => toggleCity(cityName)}
                    />
                  }
                  label={cityName}
                />
              ))}
            </Box>
            {selectedCities.length > 0 && (
              <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block" }}>
                Selected: {selectedCities.join(", ")}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Product Restrictions (Optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Leave empty to allow all products. Discount applies to eligible cart items only.
            </Typography>
            <Autocomplete
              multiple
              options={products}
              loading={productsLoading}
              value={selectedProducts}
              onChange={(_, value) => setSelectedProducts(value)}
              getOptionLabel={(option) => option.name || "Unnamed product"}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Products"
                  placeholder="Search tests or packages"
                />
              )}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleDialogClose} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {submitting ? "Creating..." : "Create Coupon"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponFormDialog;
