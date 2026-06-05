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
} from "@mui/material";
import { styled } from "@mui/material/styles";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

export default function KeyfeturesDailog({ open, handleClose, initialData, onSuccess }) {
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    info: "",
    keyimg: null,
    sortOrder: "1",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        info: initialData.info || "",
        keyimg: null,
        sortOrder: initialData.sortOrder?.toString() || "1",
        status: initialData.status || "Active",
      });
      // Set image preview for existing data
      if (initialData.keyimg) {
        setImagePreview(`${BASE_URL}/uploads/${initialData.keyimg}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        name: "",
        info: "",
        keyimg: null,
        sortOrder: "1",
        status: "Active",
      });
      setImagePreview(null);
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "keyimg" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        keyimg: file
      }));
      // Create preview for new image
      setImagePreview(URL.createObjectURL(file));
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
    setFormData((prev) => ({ ...prev, keyimg: null }));
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
    data.append("info", formData.info);
    data.append("sortOrder", formData.sortOrder);
    data.append("status", formData.status);

    if (formData.keyimg) {
      data.append("keyimg", formData.keyimg);
    }

    try {
      setLoading(true);
      let res;
      
      if (initialData) {
        // Update existing key feature
        res = await axios.put(`${BASE_URL}/key_feature/${initialData._id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new key feature
        res = await axios.post(`${BASE_URL}/key_feature`, data, {
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
      <DialogTitle>{initialData ? "Edit Key Feature" : "Add Key Feature"}</DialogTitle>
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
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            name="info"
            label="Info"
            value={formData.info}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <Box>
            <Box mb={1}>Image (Recommended: 1:1 ratio)</Box>
            <ImageBox>
              <FullCoverAvatar
                variant="square"
                src={
                  imagePreview || 
                  (initialData?.keyimg ? `${BASE_URL}/uploads/${initialData.keyimg}` : "https://via.placeholder.com/500x500?text=Upload+Image")
                }
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/500x500?text=Image+Not+Found";
                }}
              />
              <input
                type="file"
                accept="image/*"
                hidden
                name="keyimg"
                ref={imageInputRef}
                onChange={handleChange}
              />
            </ImageBox>

            <Stack direction="row" spacing={1} mt={1}>
              <Button size="small" variant="outlined" onClick={triggerInput}>
                {imagePreview || initialData?.keyimg ? 'Change' : 'Select'}
              </Button>
              {(imagePreview || initialData?.keyimg) && (
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
          {loading ? "Submitting..." : initialData ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}