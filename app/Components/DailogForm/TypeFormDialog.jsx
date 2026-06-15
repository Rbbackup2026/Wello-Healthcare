import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Stack,
  Avatar,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { API_BASE_URL } from "../../utils/api";

const BASE_URL = API_BASE_URL;
const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6' rx='8'/%3E%3Cpath d='M22 54l13-16 9 10 7-8 8 14H22z' fill='%23cbd5e1'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23cbd5e1'/%3E%3C/svg%3E";

const ImageBox = styled(Box)(() => ({
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: 0,
  overflow: "hidden",
  width: "100%",
  aspectRatio: "1 / 1",
  position: "relative",
  maxWidth: 150,
}));

const FullCoverAvatar = styled(Avatar)(() => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
}));

export default function TypeFormDialog({ open, handleClose, initialData, onSuccess }) {
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    sortOrder: "1",
    status: "Active",
    showHome: false,
    iconimg: null,
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        department: initialData.department || "",
        sortOrder: initialData.sortOrder?.toString() || "1",
        status: initialData.status || "Active",
        showHome: initialData.showHome || false,
        iconimg: null,
      });
      // Set image preview for existing data
      if (initialData.iconimg) {
        setImagePreview(`${BASE_URL}/uploads/${initialData.iconimg}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        name: "",
        department: "",
        sortOrder: "1",
        status: "Active",
        showHome: false,
        iconimg: null,
      });
      setImagePreview(null);
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;
    
    if (name === "iconimg" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        iconimg: file
      }));
      // Create preview for new image
      setImagePreview(URL.createObjectURL(file));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const triggerInput = () => {
    if (imageInputRef.current) imageInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, iconimg: null }));
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Name is required field.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("department", formData.department);
    data.append("sortOrder", formData.sortOrder);
    data.append("status", formData.status);
    data.append("showHome", formData.showHome);

    if (formData.iconimg) {
      data.append("iconimg", formData.iconimg);
    }

    try {
      setLoading(true);
      let res;
      
      if (initialData && initialData.id) {
        // Update existing type
        res = await axios.put(`${BASE_URL}/types/${initialData.id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new type
        res = await axios.post(`${BASE_URL}/types`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      console.log("API Success:", res.data);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Edit Type" : "Add New Type"}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            required
            name="name"
            label="Type Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            name="department"
            label="Department"
            value={formData.department}
            onChange={handleChange}
            fullWidth
          />

          <Box>
            <Box mb={1}>Type Image (Recommended: 1:1 ratio)</Box>
            <ImageBox>
              <FullCoverAvatar
                variant="square"
                src={
                  imagePreview || 
                  (initialData?.iconimg ? `${BASE_URL}/uploads/${initialData.iconimg}` : defaultImage)
                }
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
              <input
                type="file"
                accept="image/*"
                hidden
                name="iconimg"
                ref={imageInputRef}
                onChange={handleChange}
              />
            </ImageBox>

            <Stack direction="row" spacing={1} mt={1}>
              <Button size="small" variant="outlined" onClick={triggerInput}>
                {imagePreview || initialData?.iconimg ? 'Change Image' : 'Select Image'}
              </Button>
              {(imagePreview || initialData?.iconimg) && (
                <Button size="small" variant="outlined" color="error" onClick={handleRemoveImage}>
                  Remove
                </Button>
              )}
            </Stack>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Sort Order</InputLabel>
            <Select
              name="sortOrder"
              value={formData.sortOrder}
              label="Sort Order"
              onChange={handleChange}
            >
              {[...Array(20)].map((_, i) => (
                <MenuItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                name="showHome"
                checked={formData.showHome}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Show on Homepage"
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Submitting..." : initialData ? "Update Type" : "Create Type"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
