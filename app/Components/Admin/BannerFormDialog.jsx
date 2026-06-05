"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, MenuItem, Switch,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const BannerFormDialog = ({ open, onClose, initialData, bannerCount, onSuccess }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    display: "home",
    city: "",
    link: "",
    sortId: bannerCount + 1,
    status: "Active",
    webImgFile: null,
    appImgFile: null,
    webPreview: "",
    appPreview: "",
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        display: initialData.display || "home",
        city: initialData.city || "",
        link: initialData.link || "",
        sortId: initialData.sortId ?? bannerCount + 1,
        status: initialData.status || "Active",
        webImgFile: null,
        appImgFile: null,
        webPreview: initialData.webImage
          ? initialData.webImage.startsWith("http")
            ? initialData.webImage
            : `${API_BASE_URL}${initialData.webImage}`
          : "",
        appPreview: initialData.appImage
          ? initialData.appImage.startsWith("http")
            ? initialData.appImage
            : `${API_BASE_URL}${initialData.appImage}`
          : "",
      });
    } else {
      setFormData({
        display: "home",
        city: "",
        link: "",
        sortId: bannerCount + 1,
        status: "Active",
        webImgFile: null,
        appImgFile: null,
        webPreview: "",
        appPreview: "",
      });
    }
  }, [initialData, bannerCount, isEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "webImgFile" && files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        webImgFile: files[0],
        webPreview: URL.createObjectURL(files[0]),
      }));
    } else if (name === "appImgFile" && files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        appImgFile: files[0],
        appPreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.display) {
      alert("Display type is required.");
      return;
    }
    if (!isEdit && (!formData.webImgFile || !formData.appImgFile)) {
      alert("Both Web Image and App Image are required.");
      return;
    }

    try {
      const data = new FormData();
      data.append("display", formData.display);
      data.append("city", formData.city);
      data.append("link", formData.link);
      data.append("sortId", String(formData.sortId));
      data.append("status", formData.status);

      if (formData.webImgFile) data.append("webImage", formData.webImgFile);
      if (formData.appImgFile) data.append("appImage", formData.appImgFile);

      const url = isEdit
        ? `${API_BASE_URL}/v1/api/banner/put/${initialData._id}`
        : `${API_BASE_URL}/v1/api/banner/uploadhomebanner`;

      const method = isEdit ? "put" : "post";
      await axios[method](url, data);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save banner."
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Banner" : "Add New Banner"}</DialogTitle>
      <DialogContent dividers>

        {/* Display */}
        <TextField
          select label="Display" name="display"
          value={formData.display} onChange={handleChange}
          fullWidth margin="normal" required
        >
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="premium">Premium</MenuItem>
          <MenuItem value="pathology">Pathology</MenuItem>
        </TextField>

        {/* Status */}
        <TextField
          select label="Status" name="status"
          value={formData.status} onChange={handleChange}
          fullWidth margin="normal"
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>

        {/* Sort ID */}
        <TextField
          label="Sort ID" name="sortId" type="number"
          value={formData.sortId} onChange={handleChange}
          fullWidth margin="normal" inputProps={{ min: 0 }}
        />

        {/* City */}
        <TextField
          label="City (optional)" name="city"
          value={formData.city} onChange={handleChange}
          fullWidth margin="normal"
        />

        {/* Link */}
        <TextField
          label="Link (optional)" name="link"
          value={formData.link} onChange={handleChange}
          fullWidth margin="normal"
        />

        {/* Web Image */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Web Image {!isEdit && <span style={{ color: "red" }}>*</span>}
          </Typography>
          <input
            accept="image/*" type="file" name="webImgFile"
            id="web-image-upload" style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="web-image-upload">
            <Button variant="contained" component="span">
              {isEdit ? "Change Web Image" : "Upload Web Image"}
            </Button>
          </label>
          {formData.webPreview && (
            <Box component="img" src={formData.webPreview} alt="Web Preview"
              sx={{ mt: 2, maxWidth: "100%", maxHeight: 200, display: "block" }}
            />
          )}
        </Box>

        {/* App Image */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            App Image {!isEdit && <span style={{ color: "red" }}>*</span>}
          </Typography>
          <input
            accept="image/*" type="file" name="appImgFile"
            id="app-image-upload" style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="app-image-upload">
            <Button variant="outlined" component="span">
              {isEdit ? "Change App Image" : "Upload App Image"}
            </Button>
          </label>
          {formData.appPreview && (
            <Box component="img" src={formData.appPreview} alt="App Preview"
              sx={{ mt: 2, maxWidth: "100%", maxHeight: 200, display: "block" }}
            />
          )}
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BannerFormDialog;