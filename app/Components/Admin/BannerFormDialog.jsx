"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, MenuItem,
  FormControlLabel, Checkbox, FormGroup, Divider,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL, API_ORIGIN } from "../../utils/api";
import { DISPLAY_OPTIONS } from "../../utils/bannerApi";
import { METRO_CITIES } from "../../utils/cityApi";
import {
  filterCategoriesByDepartmentKind,
  filterDiseasesByDepartmentKind,
  getDepartmentLabelByKind,
} from "../../utils/bannerDepartmentUtils";
import useDepartments from "../Hooks/useDepartments";
import useDiseases from "../Hooks/useDiseases";

const EMPTY_FORM = {
  displays: ["home"],
  pathologyTarget: "all",
  categoryId: "all",
  categoryName: "All Categories",
  diseaseId: "",
  diseaseName: "",
  radiologyTarget: "all",
  radiologyCategoryId: "all",
  radiologyCategoryName: "All Categories",
  radiologyDiseaseId: "",
  radiologyDiseaseName: "",
  cities: [],
  link: "",
  sortId: 1,
  status: "Active",
  webImgFile: null,
  appImgFile: null,
  webPreview: "",
  appPreview: "",
};

const BannerTargetSection = ({
  title,
  targetName,
  targetValue,
  onTargetChange,
  categoryValue,
  onCategoryChange,
  diseaseValue,
  onDiseaseChange,
  categories,
  diseases,
  categoriesLoading,
  diseasesLoading,
  allPagesLabel,
  departmentLabel,
  showDiseaseOption = true,
}) => (
  <Box mt={2}>
    <Divider sx={{ mb: 2 }} />
    <Typography variant="subtitle2" gutterBottom>
      {title}
    </Typography>
    {departmentLabel ? (
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Department: {departmentLabel}
      </Typography>
    ) : null}

    <TextField
      select
      label="Show On"
      name={targetName}
      value={targetValue}
      onChange={onTargetChange}
      fullWidth
      margin="normal"
    >
      <MenuItem value="all">{allPagesLabel}</MenuItem>
      <MenuItem value="category">Category</MenuItem>
      {showDiseaseOption ? <MenuItem value="disease">Disease</MenuItem> : null}
    </TextField>

    {targetValue === "category" ? (
      <TextField
        select
        label="Category"
        value={categoryValue}
        onChange={onCategoryChange}
        fullWidth
        margin="normal"
        disabled={categoriesLoading}
        helperText={
          categories.length === 0
            ? "No categories found for this department."
            : ""
        }
      >
        <MenuItem value="all">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category._id} value={category._id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
    ) : null}

    {showDiseaseOption && targetValue === "disease" ? (
      <TextField
        select
        label="Disease"
        value={diseaseValue}
        onChange={onDiseaseChange}
        fullWidth
        margin="normal"
        disabled={diseasesLoading}
        helperText={
          diseases.length === 0 ? "No diseases found for this department." : ""
        }
      >
        <MenuItem value="">Select Disease</MenuItem>
        {diseases.map((disease) => (
          <MenuItem key={disease._id} value={disease._id}>
            {disease.name}
          </MenuItem>
        ))}
      </TextField>
    ) : null}
  </Box>
);

const BannerFormDialog = ({ open, onClose, initialData, bannerCount, onSuccess }) => {
  const isEdit = Boolean(initialData);
  const { departments, loading: departmentsLoading } = useDepartments();
  const { diseases, loading: diseasesLoading } = useDiseases();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState(METRO_CITIES);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM, sortId: bannerCount + 1 });

  const pathologyCategories = useMemo(
    () => filterCategoriesByDepartmentKind(categories, departments, "pathology"),
    [categories, departments]
  );

  const radiologyCategories = useMemo(
    () => filterCategoriesByDepartmentKind(categories, departments, "radiology"),
    [categories, departments]
  );

  const pathologyDiseases = useMemo(
    () => filterDiseasesByDepartmentKind(diseases, departments, "pathology"),
    [diseases, departments]
  );

  const pathologyDepartmentLabel = useMemo(
    () => getDepartmentLabelByKind(departments, "pathology"),
    [departments]
  );

  const radiologyDepartmentLabel = useMemo(
    () => getDepartmentLabelByKind(departments, "radiology"),
    [departments]
  );

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await axios.get(`${API_ORIGIN}/v1/api/categories`);
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();

    const fetchCityOptions = async () => {
      setCitiesLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/getlab`);
        const payload = response.data?.data ?? response.data?.items ?? response.data;
        const apiCities = Array.isArray(payload)
          ? payload
              .map((item) => {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item !== null) {
                  return item.city || item.area || item.location || item.labelCode || item.name || "";
                }
                return "";
              })
              .map((city) => city.toString().trim())
              .filter(Boolean)
          : [];

        const mergedCities = [...new Set([...METRO_CITIES, ...apiCities])].sort((a, b) =>
          a.localeCompare(b)
        );
        setCityOptions(mergedCities);
      } catch (error) {
        console.error("Failed to fetch city options:", error);
        setCityOptions(METRO_CITIES);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCityOptions();
  }, [open]);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        displays:
          Array.isArray(initialData.displays) && initialData.displays.length > 0
            ? initialData.displays
            : [initialData.display || "home"],
        pathologyTarget: initialData.pathologyTarget || "all",
        categoryId: initialData.categoryId || "all",
        categoryName: initialData.categoryName || "All Categories",
        diseaseId: initialData.diseaseId || "",
        diseaseName: initialData.diseaseName || "",
        radiologyTarget: initialData.radiologyTarget || "all",
        radiologyCategoryId: initialData.radiologyCategoryId || "all",
        radiologyCategoryName: initialData.radiologyCategoryName || "All Categories",
        radiologyDiseaseId: initialData.radiologyDiseaseId || "",
        radiologyDiseaseName: initialData.radiologyDiseaseName || "",
        cities:
          Array.isArray(initialData.cities) && initialData.cities.length > 0
            ? initialData.cities
            : initialData.city
              ? String(initialData.city)
                  .split(",")
                  .map((city) => city.trim())
                  .filter(Boolean)
              : [],
        link: initialData.link || "",
        sortId: initialData.sortId ?? bannerCount + 1,
        status: initialData.status || "Active",
        webImgFile: null,
        appImgFile: null,
        webPreview: initialData.webImage
          ? initialData.webImage.startsWith("http")
            ? initialData.webImage
            : `${API_ORIGIN}${initialData.webImage}`
          : "",
        appPreview: initialData.appImage
          ? initialData.appImage.startsWith("http")
            ? initialData.appImage
            : `${API_ORIGIN}${initialData.appImage}`
          : "",
      });
    } else {
      setFormData({ ...EMPTY_FORM, sortId: bannerCount + 1 });
    }
  }, [initialData, bannerCount, isEdit, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "webImgFile" && files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        webImgFile: files[0],
        webPreview: URL.createObjectURL(files[0]),
      }));
      return;
    }

    if (name === "appImgFile" && files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        appImgFile: files[0],
        appPreview: URL.createObjectURL(files[0]),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDisplayToggle = (displayValue) => {
    setFormData((prev) => {
      const isSelected = prev.displays.includes(displayValue);
      const displays = isSelected
        ? prev.displays.filter((item) => item !== displayValue)
        : [...prev.displays, displayValue];

      return {
        ...prev,
        displays,
        pathologyTarget:
          displayValue === "pathology" && isSelected ? "all" : prev.pathologyTarget,
        radiologyTarget:
          displayValue === "radiology" && isSelected ? "all" : prev.radiologyTarget,
        radiologyDiseaseId:
          displayValue === "radiology" && isSelected ? "" : prev.radiologyDiseaseId,
        radiologyDiseaseName:
          displayValue === "radiology" && isSelected ? "" : prev.radiologyDiseaseName,
      };
    });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setFormData((prev) => ({
        ...prev,
        categoryId: "all",
        categoryName: "All Categories",
      }));
      return;
    }

    const selected = pathologyCategories.find((category) => category._id === value);
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
      categoryName: selected?.name || "",
    }));
  };

  const handleDiseaseChange = (e) => {
    const value = e.target.value;
    const selected = pathologyDiseases.find((disease) => disease._id === value);
    setFormData((prev) => ({
      ...prev,
      diseaseId: value,
      diseaseName: selected?.name || "",
    }));
  };

  const handleRadiologyCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setFormData((prev) => ({
        ...prev,
        radiologyCategoryId: "all",
        radiologyCategoryName: "All Categories",
      }));
      return;
    }

    const selected = radiologyCategories.find((category) => category._id === value);
    setFormData((prev) => ({
      ...prev,
      radiologyCategoryId: value,
      radiologyCategoryName: selected?.name || "",
    }));
  };

  const handleCityToggle = (cityName) => {
    setFormData((prev) => {
      const isSelected = prev.cities.includes(cityName);
      const cities = isSelected
        ? prev.cities.filter((city) => city !== cityName)
        : [...prev.cities, cityName];
      return { ...prev, cities };
    });
  };

  const buildFormData = () => {
    const data = new FormData();
    formData.displays.forEach((display) => data.append("displays", display));
    data.append("display", formData.displays[0]);
    formData.cities.forEach((city) => data.append("cities", city));
    data.append("city", formData.cities.join(", "));
    data.append("link", formData.link);
    data.append("sortId", String(formData.sortId));
    data.append("status", formData.status);
    data.append("pathologyTarget", formData.pathologyTarget);
    data.append("categoryId", formData.categoryId);
    data.append("categoryName", formData.categoryName);
    data.append("diseaseId", formData.diseaseId);
    data.append("diseaseName", formData.diseaseName);
    data.append("radiologyTarget", formData.radiologyTarget);
    data.append("radiologyCategoryId", formData.radiologyCategoryId);
    data.append("radiologyCategoryName", formData.radiologyCategoryName);
    data.append("radiologyDiseaseId", formData.radiologyDiseaseId);
    data.append("radiologyDiseaseName", formData.radiologyDiseaseName);

    if (formData.webImgFile) data.append("webImage", formData.webImgFile);
    if (formData.appImgFile) data.append("appImage", formData.appImgFile);

    return data;
  };

  const handleSubmit = async () => {
    if (formData.displays.length === 0) {
      alert("Select at least one display location.");
      return;
    }

    if (formData.displays.includes("pathology")) {
      if (formData.pathologyTarget === "category" && !formData.categoryId) {
        alert("Select a category for pathology banner.");
        return;
      }
      if (formData.pathologyTarget === "disease" && !formData.diseaseId) {
        alert("Select a disease for pathology banner.");
        return;
      }
    }

    if (formData.displays.includes("radiology")) {
      if (formData.radiologyTarget === "category" && !formData.radiologyCategoryId) {
        alert("Select a category for radiology banner.");
        return;
      }
      if (formData.radiologyTarget === "category" && formData.radiologyCategoryId !== "all") {
        const hasCategory = radiologyCategories.some(
          (category) => category._id === formData.radiologyCategoryId
        );
        if (!hasCategory) {
          alert("Selected radiology category is not available for the Radiology department.");
          return;
        }
      }
    }

    if (!isEdit && (!formData.webImgFile || !formData.appImgFile)) {
      alert("Both Web Image and App Image are required.");
      return;
    }

    try {
      const data = buildFormData();
      const url = isEdit
        ? `${API_BASE_URL}/banner/put/${initialData._id}`
        : `${API_BASE_URL}/banner/uploadhomebanner`;
      const method = isEdit ? "put" : "post";
      await axios[method](url, data);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save banner."
      );
    }
  };

  const showPathologyOptions = formData.displays.includes("pathology");
  const showRadiologyOptions = formData.displays.includes("radiology");

  useEffect(() => {
    if (!showRadiologyOptions && formData.radiologyTarget === "disease") {
      setFormData((prev) => ({ ...prev, radiologyTarget: "all" }));
    }
  }, [showRadiologyOptions, formData.radiologyTarget]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Banner" : "Add New Banner"}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
          Display Locations *
        </Typography>
        <FormGroup>
          {DISPLAY_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={formData.displays.includes(option.value)}
                  onChange={() => handleDisplayToggle(option.value)}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>

        {showPathologyOptions ? (
          <BannerTargetSection
            title="Pathology Banner Settings"
            targetName="pathologyTarget"
            targetValue={formData.pathologyTarget}
            onTargetChange={handleChange}
            categoryValue={formData.categoryId}
            onCategoryChange={handleCategoryChange}
            diseaseValue={formData.diseaseId}
            onDiseaseChange={handleDiseaseChange}
            categories={pathologyCategories}
            diseases={pathologyDiseases}
            categoriesLoading={categoriesLoading || departmentsLoading}
            diseasesLoading={diseasesLoading || departmentsLoading}
            allPagesLabel="All Pathology Pages"
            departmentLabel={pathologyDepartmentLabel}
            showDiseaseOption
          />
        ) : null}

        {showRadiologyOptions ? (
          <BannerTargetSection
            title="Radiology Banner Settings"
            targetName="radiologyTarget"
            targetValue={formData.radiologyTarget}
            onTargetChange={handleChange}
            categoryValue={formData.radiologyCategoryId}
            onCategoryChange={handleRadiologyCategoryChange}
            diseaseValue=""
            onDiseaseChange={() => {}}
            categories={radiologyCategories}
            diseases={[]}
            categoriesLoading={categoriesLoading || departmentsLoading}
            diseasesLoading={false}
            allPagesLabel="All Radiology Pages"
            departmentLabel={radiologyDepartmentLabel}
            showDiseaseOption={false}
          />
        ) : null}

        <TextField
          select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>

        <TextField
          label="Sort ID"
          name="sortId"
          type="number"
          value={formData.sortId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ min: 0 }}
        />

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Locations (optional)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Select one or more cities. Leave all unchecked to show banner in every city.
          </Typography>
          <FormGroup
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 0.5,
              maxHeight: 220,
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            {citiesLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading cities...
              </Typography>
            ) : (
              cityOptions.map((cityName) => (
                <FormControlLabel
                  key={cityName}
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.cities.includes(cityName)}
                      onChange={() => handleCityToggle(cityName)}
                    />
                  }
                  label={cityName}
                />
              ))
            )}
          </FormGroup>
          {formData.cities.length > 0 ? (
            <Typography variant="caption" color="primary" display="block" sx={{ mt: 1 }}>
              Selected: {formData.cities.join(", ")}
            </Typography>
          ) : null}
        </Box>

        <TextField
          label="Link (optional)"
          name="link"
          value={formData.link}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Web Image {!isEdit && <span style={{ color: "red" }}>*</span>}
          </Typography>
          <input
            accept="image/*"
            type="file"
            name="webImgFile"
            id="web-image-upload"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="web-image-upload">
            <Button variant="contained" component="span">
              {isEdit ? "Change Web Image" : "Upload Web Image"}
            </Button>
          </label>
          {formData.webPreview ? (
            <Box
              component="img"
              src={formData.webPreview}
              alt="Web Preview"
              sx={{ mt: 2, maxWidth: "100%", maxHeight: 200, display: "block" }}
            />
          ) : null}
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            App Image {!isEdit && <span style={{ color: "red" }}>*</span>}
          </Typography>
          <input
            accept="image/*"
            type="file"
            name="appImgFile"
            id="app-image-upload"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="app-image-upload">
            <Button variant="outlined" component="span">
              {isEdit ? "Change App Image" : "Upload App Image"}
            </Button>
          </label>
          {formData.appPreview ? (
            <Box
              component="img"
              src={formData.appPreview}
              alt="App Preview"
              sx={{ mt: 2, maxWidth: "100%", maxHeight: 200, display: "block" }}
            />
          ) : null}
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
