import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Avatar,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import JoditEditor from "jodit-react";
import axios from "axios";
import { API_BASE_URL, toAssetUrl } from "../../utils/api";

const ImageBox = styled(Box)(() => ({
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: 0,
  overflow: "hidden",
  width: "100%",
  aspectRatio: "1 / 1",
  position: "relative",
}));

const FullCoverAvatar = styled(Avatar)(() => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
}));

const getDefaultFormValues = () => ({
  name: "",
  homeCollection: "No",
  sortOrder: "1",
  status: "Active",
  description: "",
  image: "",
});

const DepartmentFormDialog = ({
  open,
  handleClose,
  initialData,
  fetchDepartments,
}) => {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const [formValues, setFormValues] = useState(getDefaultFormValues());
  const [existingImage, setExistingImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setFormValues({
        name: initialData.name || "",
        homeCollection: initialData.homeCollection || "No",
        sortOrder: String(initialData.sortOrder || "1"),
        status: initialData.status ? "Active" : "Inactive",
        description: initialData.description || "",
        image: "",
      });
      setExistingImage(initialData.image || "");
    } else {
      setFormValues(getDefaultFormValues());
      setExistingImage("");
    }

    setError("");
  }, [open, initialData]);

  const triggerInput = () => {
    if (imageInputRef.current) imageInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormValues((prev) => ({ ...prev, image: file }));
      setError("");
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
  };

  const handleDescriptionChange = (newContent) => {
    setFormValues((prev) => ({ ...prev, description: newContent }));
  };

  const getPreviewImage = () => {
    if (formValues.image instanceof File) {
      return URL.createObjectURL(formValues.image);
    }

    if (existingImage) {
      return toAssetUrl(existingImage);
    }

    return "https://via.placeholder.com/1000x1000?text=Upload+Image";
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!formValues.name.trim()) {
        setError("Department name is required.");
        return;
      }

      if (!formValues.sortOrder) {
        setError("Sort order is required.");
        return;
      }

      const hasNewImage = formValues.image instanceof File;
      if (!initialData && !hasNewImage) {
        setError("Department image is required. Please select an image before submitting.");
        return;
      }

      const formData = new FormData();
      formData.append("name", formValues.name.trim());
      formData.append("homeCollection", formValues.homeCollection);
      formData.append("sortOrder", String(formValues.sortOrder));
      formData.append("status", formValues.status === "Active" ? "true" : "false");
      formData.append("description", formValues.description || "");

      if (hasNewImage) {
        formData.append("image", formValues.image);
      }

      const response = initialData
        ? await axios.put(
            `${API_BASE_URL}/update-department/${initialData._id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          )
        : await axios.post(`${API_BASE_URL}/create-department`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      if (fetchDepartments) {
        await fetchDepartments();
      }

      console.log("Saved Successfully:", response.data);
      handleClose();
    } catch (submitError) {
      console.error("Error submitting department form:", submitError);
      setError(
        submitError.response?.data?.error ||
          submitError.response?.data?.message ||
          "Failed to save department. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        {initialData ? "Edit Department" : "Create Department"}
      </DialogTitle>
      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formValues.name}
              onChange={handleInputChange("name")}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Image (Size: 1000 x 1000 Px.) *
            </Typography>
            <ImageBox sx={{ aspectRatio: "1 / 1", maxWidth: 150 }}>
              <FullCoverAvatar variant="square" src={getPreviewImage()} />
              <input
                type="file"
                accept="image/*"
                hidden
                ref={imageInputRef}
                onChange={handleImageUpload}
              />
            </ImageBox>
            <Box mt={1}>
              <Button
                sx={{ border: "1px solid #ccc" }}
                size="small"
                onClick={triggerInput}
                disabled={loading}
              >
                Select Image
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Home Collection Option?</InputLabel>
              <Select
                value={formValues.homeCollection}
                onChange={handleInputChange("homeCollection")}
                label="Home Collection Option?"
                disabled={loading}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={formValues.sortOrder}
                onChange={handleInputChange("sortOrder")}
                label="Sort Order"
                disabled={loading}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formValues.status}
                onChange={handleInputChange("status")}
                label="Status"
                disabled={loading}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              Description
            </Typography>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                overflow: "hidden",
                minHeight: 300,
              }}
            >
              <JoditEditor
                ref={editorRef}
                value={formValues.description}
                config={{
                  readonly: false,
                  placeholder: "Start typing here...",
                  height: 300,
                  toolbarAdaptive: false,
                  toolbarSticky: false,
                  buttons: [
                    "bold",
                    "italic",
                    "underline",
                    "|",
                    "ul",
                    "ol",
                    "|",
                    "font",
                    "fontsize",
                    "paragraph",
                    "|",
                    "image",
                    "link",
                    "|",
                    "align",
                    "undo",
                    "redo",
                  ],
                  uploader: {
                    insertImageAsBase64URI: true,
                  },
                  showXPathInStatusbar: false,
                  showCharsCounter: false,
                  showWordsCounter: false,
                }}
                onBlur={(newContent) => handleDescriptionChange(newContent)}
              />
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ ml: 1 }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentFormDialog;
