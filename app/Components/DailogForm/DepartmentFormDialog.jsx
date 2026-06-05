import React, { useState, useRef } from "react";
import {
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

const DepartmentFormDialog = ({ open, handleClose, initialData }) => {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const [formValues, setFormValues] = useState({
    name: "",
    homeCollection: "No",
    sortOrder: "",
    status: "Active",
    description: "",
    image: "",
  });

  const triggerInput = () => {
    if (imageInputRef.current) imageInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormValues((prev) => ({ ...prev, image: file }));
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormValues({ ...formValues, [field]: event.target.value });
  };

  const handleDescriptionChange = (newContent) => {
    setFormValues((prev) => ({ ...prev, description: newContent }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("homeCollection", formValues.homeCollection);
      formData.append("sortOrder", formValues.sortOrder);
      formData.append("status", formValues.status);
      formData.append("description", formValues.description);
      if (formValues.image) formData.append("image", formValues.image);

      const res = await axios.post(
        "http://localhost:3000/v1/api/create-department",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Saved Successfully:", res.data);
      handleClose();
    } catch (error) {
      console.error("Error submitting department form:", error);
    }
  };

//   hooks



  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Department Form</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={1}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formValues.name}
              onChange={handleInputChange("name")}
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Image (Size : 1000 x 1000 Px.)
            </Typography>
            <ImageBox sx={{ aspectRatio: "1 / 1", maxWidth: 150 }}>
              <FullCoverAvatar
                variant="square"
                src={
                  formValues.image
                    ? URL.createObjectURL(formValues.image)
                    : "https://via.placeholder.com/1000x1000?text=No+Image"
                }
              />
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
              >
                Select Image
              </Button>
            </Box>
          </Grid>

          {/* Home Collection Option */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Home Collection Option?</InputLabel>
              <Select
                value={formValues.homeCollection}
                onChange={handleInputChange("homeCollection")}
                label="Home Collection Option?"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={formValues.sortOrder}
                onChange={handleInputChange("sortOrder")}
                label="Sort Order"
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formValues.status}
                onChange={handleInputChange("status")}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
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

          {/* Buttons */}
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
          >
            <Button variant="outlined" color="error" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ ml: 1 }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentFormDialog;
