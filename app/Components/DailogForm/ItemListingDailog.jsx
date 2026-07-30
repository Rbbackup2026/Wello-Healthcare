import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  Checkbox,
  Chip,
  OutlinedInput,
  Box,
  Typography,
  Autocomplete,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { API_BASE_URL, toAssetUrl } from "../../utils/api";
import { METRO_CITIES } from "../../utils/cityApi";

// Custom Hooks Import
import useCategories from "../Hooks/useCategories";
import useKeyFeatures from "../Hooks/useKeyFeatures";
import useDepartments from "../Hooks/useDepartments";
import useDiseases from "../Hooks/useDiseases";
import useCertificates from "../Hooks/useCertificates";
import useLabs from "../Hooks/useLabs";

const BASE_URL = API_BASE_URL;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ScrollableMenuProps = {
  PaperProps: {
    style: {
      maxHeight: 200,
      width: 250,
      overflow: "auto",
    },
  },
};

// React Quill toolbar config
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const createEmptyFaq = () => ({
  question: "",
  answer: "",
});

const normalizeFaqs = (faqs) => {
  if (Array.isArray(faqs)) {
    return faqs.map((faq) => ({
      question: faq?.question || "",
      answer: faq?.answer || "",
    }));
  }

  if (typeof faqs === "string") {
    try {
      const parsedFaqs = JSON.parse(faqs);
      return normalizeFaqs(parsedFaqs);
    } catch {
      return [];
    }
  }

  return [];
};

const createEmptyPriceGroup = () => ({
  id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  cities: [],
  price: "",
  mrp: "",
  schedulePrice: "",
  priceValidUntil: "",
});

const cityPricingToGroups = (cityPricing = []) => {
  const groups = [];

  cityPricing.forEach((entry) => {
    if (!entry?.city) return;

    const validUntilValue = entry.priceValidUntil
      ? String(entry.priceValidUntil).slice(0, 10)
      : "";
    const signature = `${entry.price ?? ""}|${entry.mrp ?? ""}|${validUntilValue}`;
    const existingGroup = groups.find((group) => group.signature === signature);

    if (existingGroup) {
      existingGroup.cities.push(entry.city);
      return;
    }

    groups.push({
      id: createEmptyPriceGroup().id,
      signature,
      cities: [entry.city],
      price: entry.price ?? "",
      mrp: entry.mrp ?? "",
      schedulePrice: entry.schedulePrice ?? "",
      priceValidUntil: validUntilValue,
    });
  });

  return groups;
};

const groupsToCityPricing = (priceGroups = []) =>
  priceGroups.flatMap((group) =>
    group.cities.map((city) => {
      const mrp = Number(group.mrp);
      const offerPrice =
        group.price !== "" && group.price !== null && group.price !== undefined
          ? Number(group.price)
          : 0;
      return {
        city,
        price: Number.isFinite(offerPrice) && offerPrice > 0 ? offerPrice : 0,
        mrp,
        schedulePrice:
          group.schedulePrice !== "" ? Number(group.schedulePrice) : undefined,
        priceValidUntil:
          offerPrice > 0 && group.priceValidUntil
            ? group.priceValidUntil
            : null,
      };
    })
  );

const getAssignedCities = (priceGroups = []) =>
  priceGroups.flatMap((group) => group.cities);

const getAvailableCitiesForGroup = (groupId, allSelectedCities, groups) => {
  const takenByOtherGroups = groups
    .filter((group) => group.id !== groupId)
    .flatMap((group) => group.cities);

  return allSelectedCities.filter((city) => !takenByOtherGroups.includes(city));
};

const normalizeCityPricing = (cityPricing, fallback = {}) => {
  if (Array.isArray(cityPricing) && cityPricing.length > 0) {
    return cityPricing.map((entry) => ({
      city: entry?.city || "",
      price: entry?.price ?? "",
      mrp: entry?.mrp ?? "",
      schedulePrice: entry?.schedulePrice ?? "",
      priceValidUntil: entry?.priceValidUntil
        ? String(entry.priceValidUntil).slice(0, 10)
        : "",
    }));
  }

  if (fallback.city) {
    return [{
      city: fallback.city,
      price: fallback.price ?? "",
      mrp: fallback.mrp ?? "",
      schedulePrice: fallback.schedulePrice ?? "",
      priceValidUntil: fallback.priceValidUntil
        ? String(fallback.priceValidUntil).slice(0, 10)
        : "",
    }];
  }

  return [];
};

function ItemListingDialog({ open, handleClose, initialData, onSuccess }) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { keyFeatures, loading: featuresLoading } = useKeyFeatures();
  const { departments, loading: departmentsLoading } = useDepartments();
  const { diseases, loading: diseasesLoading } = useDiseases();
  const { certificates, loading: certificatesLoading } = useCertificates();
  const { labs, loading: labsLoading, getActiveLabs } = useLabs();

  const [formData, setFormData] = useState({
    name: "",
    itemType: "Package",
    testCount: 1,
    keyFeatures: [],
    department: [],
    diseases: "",
    category: "",
    reportingTime: "",
    specimen: "",
    fromAge: "",
    toAge: "",
    gender: "Both",
    showIn: "",
    showPopularPackage: "No",
    showFullBodyHealthCheckup: "No",
    showInHome: false,
    showHomeBanner: false,
    status: true,

    startDate: "",
    endDate: "",
    certificate: "",
    lab: "",

    // ✅ Product Description
    description: "",
    faqs: [createEmptyFaq()],

    // Cart upsell — other tests shown as recommended when this item is in cart
    recommendedTests: [],

    // Meta Fields
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    metaSchema: "",
  });

  const [iconImg, setIconImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [priceGroups, setPriceGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const activeLabs = getActiveLabs();

  const handleChipDelete = (field, valueToDelete) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== valueToDelete),
    }));
  };

  // Prefill form when editing
  useEffect(() => {
    if (initialData) {
      console.log("ItemListingDialog: initialData.description =", initialData.description); // Diagnostic log
      console.log("Editing product:", initialData);
      setFormData({
        name: initialData.name || "",
        itemType: initialData.itemType || "Package",
        testCount: initialData.testCount || 1,
        keyFeatures: Array.isArray(initialData.keyFeatures)
          ? initialData.keyFeatures.map((f) => f._id || f)
          : [],
        department: Array.isArray(initialData.department)
          ? initialData.department.map((d) => d._id || d)
          : [],
        diseases: initialData.diseases?._id || initialData.diseases || "",
        category: initialData.category?._id || initialData.category || "",
        reportingTime: initialData.reportingTime || "",
        specimen: initialData.specimen || "",
        fromAge:
          initialData.fromAge && Number(initialData.fromAge) > 0
            ? initialData.fromAge
            : "",
        toAge:
          initialData.toAge && Number(initialData.toAge) > 0
            ? initialData.toAge
            : "",
        gender: initialData.gender || "Both",
        showIn: initialData.showIn || "",
        showPopularPackage: initialData.showPopularPackage || "No",
        showFullBodyHealthCheckup:
          initialData.showFullBodyHealthCheckup || initialData.showFullBody || "No",
        showInHome: initialData.showInHome || false,
        showHomeBanner: initialData.showHomeBanner || false,
        status: initialData.status ?? true,

        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        certificate:
          initialData.certificate?._id || initialData.certificate || "",
        lab: initialData.lab?._id || initialData.lab || "",

        // ✅ Product Description
        description: initialData.description || "",
        faqs: (() => {
          const parsedFaqs = normalizeFaqs(initialData.faqs);
          return parsedFaqs.length > 0 ? parsedFaqs : [createEmptyFaq()];
        })(),
        recommendedTests: Array.isArray(initialData.recommendedTests)
          ? initialData.recommendedTests.map((item) => item._id || item)
          : [],

        // Meta
        metaTitle: initialData.metaTitle || "",
        metaKeywords: initialData.metaKeywords || "",
        metaDescription: initialData.metaDescription || "",
        metaSchema: initialData.metaSchema || "",
      });

      const normalizedPricing = normalizeCityPricing(initialData.cityPricing, {
        city: initialData.city,
        price: initialData.price,
        mrp: initialData.mrp,
        schedulePrice: initialData.schedulePrice,
        priceValidUntil: initialData.priceValidUntil,
      });
      const groupedPricing = cityPricingToGroups(normalizedPricing);

      setSelectedCities(normalizedPricing.map((entry) => entry.city).filter(Boolean));
      setPriceGroups(groupedPricing);

      if (initialData.iconImg) {
        setPreviewImg(toAssetUrl(`/uploads/${initialData.iconImg}`));
      } else {
        setPreviewImg(null);
      }
      setIconImg(null);
    } else {
      resetForm();
    }
  }, [initialData, open]);

  // Load products for Recommended Tests picker
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/get_product`);
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        if (!cancelled) {
          setProductOptions(
            list
              .filter((item) => item?.status !== false && item?.isActive !== false)
              .map((item) => {
                const departmentIds = Array.isArray(item.department)
                  ? item.department
                      .map((dept) => String(dept?._id || dept || ""))
                      .filter(Boolean)
                  : item.department
                    ? [String(item.department._id || item.department)]
                    : [];

                return {
                  _id: item._id,
                  name: item.name || "Unnamed",
                  itemType: item.itemType || "",
                  departmentIds,
                };
              })
          );
        }
      } catch (err) {
        console.error("Failed to load products for recommended tests", err);
        if (!cancelled) setProductOptions([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Keep recommended picks only for selected departments
  useEffect(() => {
    const selectedDeptIds = (formData.department || []).map(String);
    if (selectedDeptIds.length === 0) {
      if (formData.recommendedTests?.length) {
        setFormData((prev) => ({ ...prev, recommendedTests: [] }));
      }
      return;
    }

    if (!productOptions.length || !formData.recommendedTests?.length) return;

    const allowedIds = new Set(
      productOptions
        .filter((item) =>
          (item.departmentIds || []).some((deptId) =>
            selectedDeptIds.includes(String(deptId))
          )
        )
        .map((item) => String(item._id))
    );

    const nextRecommended = formData.recommendedTests.filter((id) =>
      allowedIds.has(String(id))
    );

    if (nextRecommended.length !== formData.recommendedTests.length) {
      setFormData((prev) => ({
        ...prev,
        recommendedTests: nextRecommended,
      }));
    }
  }, [formData.department, formData.recommendedTests, productOptions]);

  const recommendedProductOptions = productOptions.filter((item) => {
    if (item._id === (initialData?._id || "")) return false;
    const selectedDeptIds = (formData.department || []).map(String);
    if (selectedDeptIds.length === 0) return false;
    return (item.departmentIds || []).some((deptId) =>
      selectedDeptIds.includes(String(deptId))
    );
  });

  const resetForm = () => {
    setFormData({
      name: "",
      itemType: "Package",
      testCount: 1,
      keyFeatures: [],
      department: [],
      diseases: "",
      category: "",
      reportingTime: "",
      specimen: "",
      fromAge: "",
      toAge: "",
      gender: "Both",
      showIn: "",
      showPopularPackage: "No",
      showFullBodyHealthCheckup: "No",
      showInHome: false,
      showHomeBanner: false,
      status: true,
      startDate: "",
      endDate: "",
      certificate: "",
      lab: "",
      description: "",   // ✅ reset
      faqs: [createEmptyFaq()],
      recommendedTests: [],
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
      metaSchema: "",
    });
    setPreviewImg(null);
    setIconImg(null);
    setSelectedCities([]);
    setPriceGroups([]);
    setError("");
  };

  const toggleSelectedCity = (cityName) => {
    const isSelected = selectedCities.includes(cityName);

    if (isSelected) {
      setSelectedCities((prev) => prev.filter((city) => city !== cityName));
      setPriceGroups((prev) =>
        prev.map((group) => ({
          ...group,
          cities: group.cities.filter((city) => city !== cityName),
        }))
      );
      return;
    }

    setSelectedCities((prev) => [...prev, cityName]);
    setPriceGroups((prev) => (prev.length === 0 ? [createEmptyPriceGroup()] : prev));
  };

  const addPriceGroup = () => {
    setPriceGroups((prev) => [...prev, createEmptyPriceGroup()]);
  };

  const removePriceGroup = (groupId) => {
    setPriceGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const updatePriceGroup = (groupId, field, value) => {
    setPriceGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, [field]: value } : group
      )
    );
  };

  const patchPriceGroup = (groupId, patch) => {
    setPriceGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, ...patch } : group
      )
    );
  };

  const toggleGroupCity = (groupId, cityName) => {
    setPriceGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          const hasCity = group.cities.includes(cityName);
          return {
            ...group,
            cities: hasCity
              ? group.cities.filter((city) => city !== cityName)
              : [...group.cities, cityName],
          };
        }

        return group;
      })
    );
  };

  const selectAllCitiesInGroup = (groupId) => {
    const availableCities = getAvailableCitiesForGroup(
      groupId,
      selectedCities,
      priceGroups
    );

    setPriceGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, cities: availableCities } : group
      )
    );
  };

  const clearGroupCities = (groupId) => {
    setPriceGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, cities: [] } : group
      )
    );
  };

  const selectAllMetroCities = () => {
    setSelectedCities([...METRO_CITIES]);
    setPriceGroups((prev) => (prev.length === 0 ? [createEmptyPriceGroup()] : prev));
  };

  const clearAllSelectedCities = () => {
    setSelectedCities([]);
    setPriceGroups([]);
  };

  const assignedCities = getAssignedCities(priceGroups);
  const unassignedCities = selectedCities.filter(
    (city) => !assignedCities.includes(city)
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMultiSelectChange = (name, values) => {
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  const handleFaqChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, [field]: value } : faq
      ),
    }));
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, createEmptyFaq()],
    }));
  };

  const handleRemoveFaq = (index) => {
    setFormData((prev) => {
      const nextFaqs = prev.faqs.filter((_, faqIndex) => faqIndex !== index);
      return {
        ...prev,
        faqs: nextFaqs.length > 0 ? nextFaqs : [createEmptyFaq()],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setIconImg(file);
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Item name is required");
      return false;
    }
    if (selectedCities.length === 0) {
      setError("Select at least one city");
      return false;
    }
    if (priceGroups.length === 0) {
      setError("Add at least one price group");
      return false;
    }
    if (unassignedCities.length > 0) {
      setError(`Assign price groups for: ${unassignedCities.join(", ")}`);
      return false;
    }
    const invalidGroup = priceGroups.find((group) => {
      if (group.cities.length === 0) return true;
      if (!group.mrp || Number(group.mrp) <= 0) return true;
      const hasOffer =
        group.price !== "" &&
        group.price !== null &&
        Number(group.price) > 0;
      if (hasOffer && Number(group.price) >= Number(group.mrp)) return true;
      if (hasOffer && !group.priceValidUntil) return true;
      return false;
    });
    if (invalidGroup) {
      if (!invalidGroup.mrp || Number(invalidGroup.mrp) <= 0) {
        setError("Each price group needs a valid MRP (mandatory)");
      } else if (
        invalidGroup.price !== "" &&
        Number(invalidGroup.price) > 0 &&
        Number(invalidGroup.price) >= Number(invalidGroup.mrp)
      ) {
        setError("Offer Price must be less than MRP");
      } else if (
        invalidGroup.price !== "" &&
        Number(invalidGroup.price) > 0 &&
        !invalidGroup.priceValidUntil
      ) {
        setError("Select Price Valid Until date when Offer Price is set");
      } else {
        setError("Each price group must have at least one city and a valid MRP");
      }
      return false;
    }
    if (!formData.metaTitle.trim()) {
      setError("Meta title is required");
      return false;
    }
    if (!formData.metaKeywords.trim()) {
      setError("Meta keywords are required");
      return false;
    }
    if (!formData.metaDescription.trim()) {
      setError("Meta description is required");
      return false;
    }

    const fromAgeNum =
      formData.fromAge === "" || formData.fromAge === null
        ? 0
        : Number(formData.fromAge);
    const toAgeNum =
      formData.toAge === "" || formData.toAge === null
        ? 0
        : Number(formData.toAge);
    if (
      fromAgeNum > 0 &&
      toAgeNum > 0 &&
      fromAgeNum > toAgeNum
    ) {
      setError("From Age cannot be greater than To Age");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setError("");
      if (!validateForm()) return;

      setLoading(true);

      const submitData = new FormData();
      const cleanedFaqs = formData.faqs
        .map((faq) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }))
        .filter((faq) => faq.question || faq.answer);

      const normalizedCityPricing = groupsToCityPricing(priceGroups);

      const normalizedFormData = {
        ...formData,
        faqs: cleanedFaqs,
        cityPricing: normalizedCityPricing,
        city: normalizedCityPricing.map((entry) => entry.city).join(", "),
        price: normalizedCityPricing[0]?.price || 0,
        mrp: normalizedCityPricing[0]?.mrp ?? "",
        schedulePrice: normalizedCityPricing[0]?.schedulePrice ?? "",
        priceValidUntil: normalizedCityPricing[0]?.priceValidUntil || "",
        // blank age → 0 = no restriction (valid for everyone)
        fromAge:
          formData.fromAge === "" || formData.fromAge === null
            ? 0
            : Number(formData.fromAge) || 0,
        toAge:
          formData.toAge === "" || formData.toAge === null
            ? 0
            : Number(formData.toAge) || 0,
        gender: formData.gender || "Both",
      };

      Object.keys(normalizedFormData).forEach((key) => {
        if (Array.isArray(normalizedFormData[key])) {
          submitData.append(key, JSON.stringify(normalizedFormData[key]));
        } else if (
          normalizedFormData[key] !== null &&
          normalizedFormData[key] !== undefined
        ) {
          submitData.append(key, normalizedFormData[key]);
        }
      });

      if (iconImg) {
        submitData.append("iconImg", iconImg);
      }

      let response;
      if (initialData) {
        response = await axios.put(
          `${BASE_URL}/items/${initialData._id}`,
          submitData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axios.post(`${BASE_URL}/post_product`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      console.log("Success:", response.data);
      if (onSuccess) onSuccess();
      handleClose();
      resetForm();
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {initialData ? "Edit Item" : "Create New Item"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} mt={1}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Name */}
          <TextField
            label="Item Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            error={!formData.name.trim()}
            helperText={!formData.name.trim() ? "Item name is required" : ""}
          />

          {/* Item Type & Test Count */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Item Type</InputLabel>
              <Select
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                label="Item Type"
              >
                <MenuItem value="Package">Package</MenuItem>
                <MenuItem value="Test">Test</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Test Count"
              name="testCount"
              type="number"
              value={formData.testCount}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              inputProps={{ min: 1 }}
            />
          </Stack>

          {/* Key Features */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Key Features</InputLabel>
            <Select
              multiple
              value={formData.keyFeatures}
              onChange={(e) =>
                handleMultiSelectChange("keyFeatures", e.target.value)
              }
              input={<OutlinedInput label="Key Features" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const feature = keyFeatures.find((f) => f._id === value);
                    return (
                      <Chip
                        key={value}
                        label={feature ? feature.name : value}
                        size="small"
                        onDelete={() => handleChipDelete("keyFeatures", value)}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
              disabled={featuresLoading}
            >
              {featuresLoading ? (
                <MenuItem disabled>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography>Loading key features...</Typography>
                  </Stack>
                </MenuItem>
              ) : keyFeatures.length === 0 ? (
                <MenuItem disabled>No key features available</MenuItem>
              ) : (
                keyFeatures.map((feature) => (
                  <MenuItem key={feature._id} value={feature._id}>
                    <Typography noWrap>{feature.name}</Typography>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Department */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Department</InputLabel>
            <Select
              multiple
              value={formData.department}
              onChange={(e) =>
                handleMultiSelectChange("department", e.target.value)
              }
              input={<OutlinedInput label="Department" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const dept = departments.find((d) => d._id === value);
                    return (
                      <Chip
                        key={value}
                        label={dept ? dept.name : value}
                        size="small"
                        onDelete={() => handleChipDelete("department", value)}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
              disabled={departmentsLoading}
            >
              {departmentsLoading ? (
                <MenuItem disabled>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography>Loading departments...</Typography>
                  </Stack>
                </MenuItem>
              ) : departments.length === 0 ? (
                <MenuItem disabled>No departments available</MenuItem>
              ) : (
                departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    <Typography noWrap>{dept.name}</Typography>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Diseases */}
          <FormControl fullWidth>
            <Autocomplete
              options={diseases}
              getOptionLabel={(option) => option.name || ""}
              value={diseases.find((d) => d._id === formData.diseases) || null}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  diseases: newValue ? newValue._id : "",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Diseases"
                  variant="outlined"
                  fullWidth
                  placeholder="Select disease"
                />
              )}
              disabled={diseasesLoading}
              noOptionsText="No diseases found"
            />
          </FormControl>

          {/* Category */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
              disabled={categoriesLoading}
              MenuProps={ScrollableMenuProps}
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categoriesLoading ? (
                <MenuItem disabled>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography>Loading categories...</Typography>
                  </Stack>
                </MenuItem>
              ) : categories.length === 0 ? (
                <MenuItem disabled>No categories available</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    <Typography noWrap title={category.name}>
                      {category.name}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Reporting Time */}
          <TextField
            label="Reporting Time"
            name="reportingTime"
            value={formData.reportingTime}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="e.g., 24 hours, 2 days"
          />

          {/* Specimen */}
          <TextField
            label="Specimen"
            name="specimen"
            multiline
            rows={3}
            value={formData.specimen}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="Type of specimen required..."
          />

          {/* Image Upload */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Item Image
            </Typography>
            <Button component="label" variant="outlined" fullWidth sx={{ mb: 1 }}>
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {previewImg && (
              <Box mt={1} textAlign="center">
                <img
                  src={previewImg}
                  alt="Preview"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e0e0e0",
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Preview
                </Typography>
              </Box>
            )}
          </Box>

          {/* Age & Gender — blank age = valid for everyone */}
          <Stack spacing={1}>
            <Typography variant="caption" color="textSecondary">
              Leave From/To Age blank to allow all ages. Fill ages only when this
              test is limited (validated at checkout with patient DOB). Gender
              &quot;Both&quot; = all genders.
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="From Age"
                type="number"
                name="fromAge"
                value={formData.fromAge}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="All ages"
                helperText="Blank = no min age"
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                label="To Age"
                type="number"
                name="toAge"
                value={formData.toAge}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="All ages"
                helperText="Blank = no max age"
                inputProps={{ min: 0, max: 100 }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="Both">Both (All genders)</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {/* Show In */}
          <TextField
            label="Show In"
            name="showIn"
            value={formData.showIn}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="Where to display this item"
          />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Show Popular Package?</InputLabel>
              <Select
                name="showPopularPackage"
                value={formData.showPopularPackage}
                onChange={handleChange}
                label="Show Popular Package?"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined">
              <InputLabel>Show on Full Body?</InputLabel>
              <Select
                name="showFullBodyHealthCheckup"
                value={formData.showFullBodyHealthCheckup}
                onChange={handleChange}
                label="Show on Full Body?"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Pricing & Location */}
          <Divider>
            <Typography variant="subtitle2" color="primary">
              Cities & Pricing
            </Typography>
          </Divider>

          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Step 1: Select Cities *
            </Typography>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="caption" color="textSecondary">
                Select the cities where this item will be available.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="text" onClick={selectAllMetroCities}>
                  Select All Cities
                </Button>
                {selectedCities.length > 0 && (
                  <Button size="small" variant="text" color="error" onClick={clearAllSelectedCities}>
                    Clear All
                  </Button>
                )}
              </Stack>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {METRO_CITIES.map((cityName) => (
                <FormControlLabel
                  key={cityName}
                  control={
                    <Switch
                      checked={selectedCities.includes(cityName)}
                      onChange={() => toggleSelectedCity(cityName)}
                    />
                  }
                  label={cityName}
                />
              ))}
            </Box>

            {selectedCities.length === 0 ? (
              <Alert severity="warning">Select at least one city.</Alert>
            ) : (
              <>
                <Divider sx={{ my: 2 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      Step 2: Price Groups
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      MRP is mandatory. Offer Price + Valid Until date are optional.
                      If Offer Price is empty/expired, website shows MRP only.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addPriceGroup}
                  >
                    Add Price Group
                  </Button>
                </Stack>

                {unassignedCities.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Assign these cities to a price group:{" "}
                    <strong>{unassignedCities.join(", ")}</strong>
                  </Alert>
                )}

                <Stack spacing={2}>
                  {priceGroups.map((group, index) => {
                    const availableCities = getAvailableCitiesForGroup(
                      group.id,
                      selectedCities,
                      priceGroups
                    );
                    const allSelectedInGroup =
                      availableCities.length > 0 &&
                      availableCities.every((city) => group.cities.includes(city));

                    return (
                    <Box
                      key={group.id}
                      sx={{
                        border: "1px solid #ececec",
                        borderRadius: 2,
                        p: 2,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1.5 }}
                      >
                        <Typography variant="subtitle2">
                          Price Group {index + 1}
                        </Typography>
                        {priceGroups.length > 1 && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removePriceGroup(group.id)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        )}
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Select cities for this group
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => selectAllCitiesInGroup(group.id)}
                            disabled={availableCities.length === 0 || allSelectedInGroup}
                          >
                            Select All
                          </Button>
                          {group.cities.length > 0 && (
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={() => clearGroupCities(group.id)}
                            >
                              Clear
                            </Button>
                          )}
                        </Stack>
                      </Stack>

                      {availableCities.length === 0 ? (
                        <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: "block" }}>
                          No cities available for this group — all cities are assigned to other groups.
                        </Typography>
                      ) : (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                          {availableCities.map((cityName) => {
                            const isChecked = group.cities.includes(cityName);

                            return (
                              <FormControlLabel
                                key={`${group.id}-${cityName}`}
                                control={
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => toggleGroupCity(group.id, cityName)}
                                  />
                                }
                                label={cityName}
                              />
                            );
                          })}
                        </Box>
                      )}

                      {group.cities.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                          {group.cities.map((cityName) => (
                            <Chip key={cityName} label={cityName} size="small" color="primary" variant="outlined" />
                          ))}
                        </Box>
                      )}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          label="MRP *"
                          type="number"
                          value={group.mrp}
                          onChange={(e) =>
                            updatePriceGroup(group.id, "mrp", e.target.value)
                          }
                          fullWidth
                          required
                          helperText="Always shown / mandatory"
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                        <TextField
                          label="Offer Price"
                          type="number"
                          value={group.price}
                          onChange={(e) => {
                            const nextPrice = e.target.value;
                            const patch = { price: nextPrice };
                            if (!nextPrice || Number(nextPrice) <= 0) {
                              patch.priceValidUntil = "";
                            }
                            patchPriceGroup(group.id, patch);
                          }}
                          fullWidth
                          helperText="Optional discount price"
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                        <TextField
                          label="Price Valid Until *"
                          type="date"
                          value={group.priceValidUntil || ""}
                          onChange={(e) =>
                            updatePriceGroup(
                              group.id,
                              "priceValidUntil",
                              e.target.value
                            )
                          }
                          fullWidth
                          disabled={
                            !group.price || Number(group.price) <= 0
                          }
                          InputLabelProps={{ shrink: true }}
                          helperText={
                            group.price && Number(group.price) > 0
                              ? "Offer price valid till this date"
                              : "Required only when Offer Price is set"
                          }
                        />
                      </Stack>
                    </Box>
                    );
                  })}
                </Stack>

                <Alert severity="success" sx={{ mt: 2 }}>
                  Tip: Select All Cities → Group Select All → enter MRP. Add Offer Price
                  only when you want a limited-time deal (set Valid Until date).
                </Alert>
              </>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* Certificate & Lab */}
          <Divider>
            <Typography variant="subtitle2" color="primary">
              Certificate & Lab
            </Typography>
          </Divider>

          <FormControl fullWidth variant="outlined">
            <InputLabel>Choose Certificate</InputLabel>
            <Select
              name="certificate"
              value={formData.certificate}
              onChange={handleChange}
              label="Choose Certificate"
              disabled={certificatesLoading}
              MenuProps={ScrollableMenuProps}
            >
              <MenuItem value="">
                <em>Select Certificate</em>
              </MenuItem>
              {certificatesLoading ? (
                <MenuItem disabled>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography>Loading certificates...</Typography>
                  </Stack>
                </MenuItem>
              ) : certificates.length === 0 ? (
                <MenuItem disabled>No certificates available</MenuItem>
              ) : (
                certificates.map((certificate) => (
                  <MenuItem key={certificate._id} value={certificate._id}>
                    <Typography noWrap title={certificate.name}>
                      {certificate.name}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel>Choose Lab</InputLabel>
            <Select
              name="lab"
              value={formData.lab}
              onChange={handleChange}
              label="Choose Lab"
              disabled={labsLoading}
              MenuProps={ScrollableMenuProps}
            >
              <MenuItem value="">
                <em>Select Lab</em>
              </MenuItem>
              {labsLoading ? (
                <MenuItem disabled>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography>Loading labs...</Typography>
                  </Stack>
                </MenuItem>
              ) : activeLabs.length === 0 ? (
                <MenuItem disabled>No active labs available</MenuItem>
              ) : (
                activeLabs.map((lab) => (
                  <MenuItem key={lab._id} value={lab._id}>
                    <Box>
                      <Typography noWrap title={lab.name}>
                        {lab.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        {lab.city} • {lab.contactNumber}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Recommended Tests (shown in cart) */}
          <Divider>
            <Typography variant="subtitle2" color="primary">
              Recommended Tests (Cart)
            </Typography>
          </Divider>

          <Autocomplete
            multiple
            options={recommendedProductOptions}
            getOptionLabel={(option) =>
              option.itemType
                ? `${option.name} (${option.itemType})`
                : option.name || ""
            }
            value={recommendedProductOptions.filter((item) =>
              formData.recommendedTests.map(String).includes(String(item._id))
            )}
            onChange={(_, selected) => {
              setFormData((prev) => ({
                ...prev,
                recommendedTests: selected.map((item) => item._id),
              }));
            }}
            isOptionEqualToValue={(option, value) =>
              String(option._id) === String(value._id)
            }
            loading={productsLoading}
            disabled={formData.department.length === 0}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
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
                label="Recommended Tests"
                placeholder={
                  formData.department.length === 0
                    ? "Select department first"
                    : "Select same-department tests"
                }
                helperText={
                  formData.department.length === 0
                    ? "Pehle Department select karo — phir us department ke tests yahan dikhenge."
                    : "Sirf selected department ke tests recommend list mein aayenge (jaise Radiology → Radiology tests)."
                }
              />
            )}
          />

          {/* ✅ PRODUCT DESCRIPTION — React Quill */}
          <Divider>
            <Typography variant="subtitle2" color="primary">
              PRODUCT DESCRIPTION
            </Typography>
          </Divider>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Description (Rich Text)
            </Typography>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
              modules={quillModules}
              style={{ height: 200, marginBottom: 42 }}
              placeholder="Write product description here..."
            />
            <Typography variant="caption" color="textSecondary">
              {"Tip: Use `(CITY)` or `{{CITY}}` in the description. The city will update automatically when the website location changes."}
            </Typography>
          </Box>

          <Divider>
            <Typography variant="subtitle2" color="primary">
              PRODUCT FAQ
            </Typography>
          </Divider>

          <Stack spacing={2}>
            {formData.faqs.map((faq, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
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
                  <Typography variant="subtitle2">
                    FAQ {index + 1}
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveFaq(index)}
                    disabled={formData.faqs.length === 1 && !faq.question && !faq.answer}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    label="Question"
                    value={faq.question}
                    onChange={(e) =>
                      handleFaqChange(index, "question", e.target.value)
                    }
                    fullWidth
                    placeholder="Enter FAQ question"
                  />
                  <TextField
                    label="Answer"
                    value={faq.answer}
                    onChange={(e) =>
                      handleFaqChange(index, "answer", e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter FAQ answer"
                  />
                </Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddFaq}
            >
              Add FAQ
            </Button>
          </Stack>

          {/* Meta Description */}
          <Divider>
            <Typography variant="subtitle2" color="primary">
              META DESCRIPTION
            </Typography>
          </Divider>

          <TextField
            label="Title *"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            placeholder="Meta title for SEO"
            error={!formData.metaTitle.trim()}
            helperText={
              !formData.metaTitle.trim() ? "Meta title is required" : ""
            }
          />

          <TextField
            label="Keywords *"
            name="metaKeywords"
            value={formData.metaKeywords}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            placeholder="Comma separated keywords"
            error={!formData.metaKeywords.trim()}
            helperText={
              !formData.metaKeywords.trim() ? "Meta keywords are required" : ""
            }
          />

          <TextField
            label="Description *"
            name="metaDescription"
            multiline
            rows={3}
            value={formData.metaDescription}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            placeholder="Meta description for SEO"
            error={!formData.metaDescription.trim()}
            helperText={
              !formData.metaDescription.trim()
                ? "Meta description is required"
                : ""
            }
          />

          <TextField
            label="Meta Schema"
            name="metaSchema"
            multiline
            rows={3}
            value={formData.metaSchema}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="JSON-LD schema or other meta schema"
          />

          <Typography variant="caption" color="textSecondary">
            Note: Write city name like (CITY) in meta details. It will change
            with current city. *
          </Typography>

          {/* Visibility Switches */}
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Visibility Settings
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.showInHome}
                    onChange={handleChange}
                    name="showInHome"
                  />
                }
                label="Show in Home"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.showHomeBanner}
                    onChange={handleChange}
                    name="showHomeBanner"
                  />
                }
                label="Show as Home Banner"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={handleChange}
                    name="status"
                  />
                }
                label="Active Status"
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleDialogClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} color="inherit" />
              <Typography>Saving...</Typography>
            </Stack>
          ) : initialData ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ItemListingDialog;
