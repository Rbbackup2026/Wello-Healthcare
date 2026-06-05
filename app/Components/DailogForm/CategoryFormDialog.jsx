import React, { useState, useEffect, useRef } from "react";
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
  Stack,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import JoditEditor from "jodit-react";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Custom Hooks
import useDepartments from "../Hooks/useDepartments";
import useCategories from "../Hooks/useCategories";
import useSortOrders from "../Hooks/useSortOrders";

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

const BASE_URL = "http://localhost:3000";

const createEmptyFaq = () => ({
  question: "",
  answer: "",
});

const normalizeFaqs = (faqs) => {
  if (Array.isArray(faqs)) {
    return faqs.map((faq) => ({
      question: faq?.question || faq?.q || faq?.title || "",
      answer: faq?.answer || faq?.a || faq?.content || "",
    }));
  }

  if (typeof faqs === "string") {
    try {
      return normalizeFaqs(JSON.parse(faqs));
    } catch {
      return [];
    }
  }

  return [];
};

const CategoryFormDialog = ({ open, handleClose, initialData, onSuccess }) => {
  const editorRef = useRef(null);
  const iconInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Hooks
  const { departments, loading: departmentsLoading } = useDepartments();
  const { sortOrders, loading: sortOrdersLoading, generateNewSortOrder } = useSortOrders();

  const [formValues, setFormValues] = useState({
    name: "",
    department: "",
    sortOrder: "",
    showHome: false,
    showInHomeBanner: false,
    showInNavbar: true,
    status: "true",
    description: "",
    faqs: [createEmptyFaq()],
    iconimg: null,
    bannerimg: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isTruthy = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      return normalized === "true" || normalized === "yes" || normalized === "active";
    }
    if (typeof value === "number") return value === 1;
    return false;
  };

  // ✅ FIXED useEffect — no auto reset while typing
  useEffect(() => {
    if (initialData) {
      const parsedFaqs = normalizeFaqs(initialData.faqs || initialData.faq);
      setFormValues({
        name: initialData.name || "",
        department: initialData.department || "",
        sortOrder: initialData.sortOrder || generateNewSortOrder(),
        showHome: isTruthy(initialData.showinhome),
        showInHomeBanner: isTruthy(initialData.showhomebanner),
        showInNavbar:
          initialData.showinnavbar === undefined &&
          initialData.showInNavbar === undefined &&
          initialData.showNavbar === undefined
            ? true
            : isTruthy(
                initialData.showinnavbar ??
                  initialData.showInNavbar ??
                  initialData.showNavbar
              ),
        status:
          initialData.status === true ||
          initialData.status === "Active" ||
          initialData.status === "true"
            ? "true"
            : "false",
        description: initialData.pagedescription || "",
        faqs: parsedFaqs.length > 0 ? parsedFaqs : [createEmptyFaq()],
        iconimg: initialData.iconimg || null,
        bannerimg: initialData.bannerimg || null,
      });
    } else if (open) {
      setFormValues({
        name: "",
        department: "",
        sortOrder: generateNewSortOrder(),
        showHome: false,
        showInHomeBanner: false,
        showInNavbar: true,
        status: "true",
        description: "",
        faqs: [createEmptyFaq()],
        iconimg: null,
        bannerimg: null,
      });
    }
  }, [initialData]); // ✅ Removed open from deps

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormValues({ ...formValues, [field]: value });
  };

  const handleDescriptionChange = (newContent) => {
    setFormValues((prev) => ({ ...prev, description: newContent }));
  };

  const handleFaqChange = (index, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, [field]: value } : faq
      ),
    }));
  };

  const handleAddFaq = () => {
    setFormValues((prev) => ({
      ...prev,
      faqs: [...prev.faqs, createEmptyFaq()],
    }));
  };

  const handleRemoveFaq = (index) => {
    setFormValues((prev) => {
      const nextFaqs = prev.faqs.filter((_, faqIndex) => faqIndex !== index);
      return {
        ...prev,
        faqs: nextFaqs.length > 0 ? nextFaqs : [createEmptyFaq()],
      };
    });
  };

  const triggerInput = (ref) => {
    if (ref.current) ref.current.click();
  };

  const handleImageUpload = (field) => (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }

    setError("");
    setFormValues((prev) => ({ ...prev, [field]: file }));
  };

  const removeImage = (field) => {
    setFormValues((prev) => ({ ...prev, [field]: null }));
  };

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/1000";
    if (typeof image === "string") {
      return image.startsWith("http") ? image : `${BASE_URL}/uploads/${image}`;
    }
    return URL.createObjectURL(image);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!formValues.name.trim()) return setError("Name is required.");
      if (!formValues.department) return setError("Department is required.");
      if (!initialData && !formValues.iconimg) return setError("Icon image is required.");
      if (!initialData && !formValues.bannerimg) return setError("Banner image is required.");

      const formData = new FormData();
      formData.append("name", formValues.name.trim());
      formData.append("department", formValues.department);
      formData.append("sortOrder", String(formValues.sortOrder));
      formData.append("showInHome", String(formValues.showHome));
      formData.append("showHomeBanner", String(formValues.showInHomeBanner));
      formData.append("showInNavbar", String(formValues.showInNavbar));
      formData.append("status", formValues.status);
      formData.append("pageDescription", formValues.description);
      const cleanedFaqs = formValues.faqs
        .map((faq) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }))
        .filter((faq) => faq.question || faq.answer);
      formData.append("faqs", JSON.stringify(cleanedFaqs));

      if (formValues.iconimg && formValues.iconimg instanceof File) {
        formData.append("iconimg", formValues.iconimg);
      }
      if (formValues.bannerimg && formValues.bannerimg instanceof File) {
        formData.append("bannerimg", formValues.bannerimg);
      }

      const url = initialData
        ? `${BASE_URL}/v1/api/put/${initialData._id}`
        : `${BASE_URL}/v1/api/create-category`;

      const method = initialData ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Success:", response.data);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>{initialData ? "Edit Category" : "Create New Category"}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} mt={1}>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formValues.name}
              onChange={handleInputChange("name")}
              disabled={loading}
            />
          </Grid>

          {/* Department */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={formValues.department}
                onChange={handleInputChange("department")}
                label="Department"
                disabled={departmentsLoading || loading}
              >
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {departmentsLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Icon Image */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Icon (Size: 1000x1000px){" "}
              {!formValues.iconimg && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <ImageBox sx={{ aspectRatio: "2 / 2", maxWidth: 150 }}>
              <FullCoverAvatar variant="square" src={getImageUrl(formValues.iconimg)} />
              <input
                type="file"
                accept="image/*"
                hidden
                ref={iconInputRef}
                onChange={handleImageUpload("iconimg")}
                disabled={loading}
              />
            </ImageBox>
            <Box mt={1}>
              <Button size="small" sx={{ border: "1px solid" }} onClick={() => triggerInput(iconInputRef)}>
                Select Image
              </Button>
              {formValues.iconimg && (
                <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => removeImage("iconimg")}>
                  Remove
                </Button>
              )}
            </Box>
          </Grid>

          {/* Banner Image */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Banner (Size: 1281x531px){" "}
              {!formValues.bannerimg && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <ImageBox sx={{ aspectRatio: "1281 / 531", maxWidth: 320 }}>
              <FullCoverAvatar variant="square" src={getImageUrl(formValues.bannerimg)} />
              <input
                type="file"
                accept="image/*"
                hidden
                ref={bannerInputRef}
                onChange={handleImageUpload("bannerimg")}
                disabled={loading}
              />
            </ImageBox>
            <Stack direction="row" spacing={1} mt={1}>
              <Button size="small" sx={{ border: "1px solid" }} onClick={() => triggerInput(bannerInputRef)}>
                Select Image
              </Button>
              {formValues.bannerimg && (
                <Button size="small" color="error" onClick={() => removeImage("bannerimg")}>
                  Remove
                </Button>
              )}
            </Stack>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={formValues.sortOrder}
                onChange={handleInputChange("sortOrder")}
                label="Sort Order"
                disabled={sortOrdersLoading || loading}
              >
                {sortOrdersLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  sortOrders.map((sortOrder, index) => (
                    <MenuItem key={index} value={sortOrder}>
                      {sortOrder}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Show Home */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Show Home?</InputLabel>
              <Select
                value={formValues.showHome ? "Yes" : "No"}
                onChange={(e) =>
                  setFormValues({ ...formValues, showHome: e.target.value === "Yes" })
                }
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Show In Home Banner */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Show In Home Banner?</InputLabel>
              <Select
                value={formValues.showInHomeBanner ? "Yes" : "No"}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    showInHomeBanner: e.target.value === "Yes",
                  })
                }
              >
                <MenuItem value="No">No</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Show In Navbar */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Show In Navbar?</InputLabel>
              <Select
                value={formValues.showInNavbar ? "Yes" : "No"}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    showInNavbar: e.target.value === "Yes",
                  })
                }
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
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
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>Description</Typography>
            <Box sx={{ border: "1px solid #ccc", borderRadius: 1, overflow: "hidden", minHeight: 300 }}>
              <JoditEditor
                ref={editorRef}
                value={formValues.description}
                config={{
                  readonly: loading,
                  placeholder: "Start typing here...",
                  height: 300,
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
                  uploader: { insertImageAsBase64URI: true },
                }}
                onBlur={(newContent) => handleDescriptionChange(newContent)}
              />
            </Box>
          </Grid>

          {/* FAQs */}
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              FAQs
            </Typography>
            <Stack spacing={2}>
              {formValues.faqs.map((faq, index) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 2,
                    bgcolor: "#fafafa",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="subtitle2">FAQ {index + 1}</Typography>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFaq(index)}
                      disabled={
                        loading ||
                        (formValues.faqs.length === 1 && !faq.question && !faq.answer)
                      }
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>

                  <Stack spacing={2}>
                    <TextField
                      label="Question"
                      value={faq.question}
                      onChange={(event) =>
                        handleFaqChange(index, "question", event.target.value)
                      }
                      fullWidth
                      disabled={loading}
                      placeholder="Enter FAQ question"
                    />
                    <TextField
                      label="Answer"
                      value={faq.answer}
                      onChange={(event) =>
                        handleFaqChange(index, "answer", event.target.value)
                      }
                      fullWidth
                      multiline
                      rows={3}
                      disabled={loading}
                      placeholder="Enter FAQ answer"
                    />
                  </Stack>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddFaq}
                disabled={loading}
              >
                Add FAQ
              </Button>
            </Stack>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outlined" color="error" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ ml: 1 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Submitting..." : initialData ? "Update" : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
