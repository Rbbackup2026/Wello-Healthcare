import React, { useState, useEffect } from 'react';
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
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/v1/api';

const LabFormDialog = ({ open, onClose, lab, onSave }) => {
  const [formData, setFormData] = useState({
    city: '',
    labName: '',
    labId: '',
    labelCode: '',
    panelId: '',
    centreId: '',
    labType: 'Main Lab',
    phoneNumber: '',
    email: '',
    address: '',
    sortOrder: 2,
    status: 'active'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Lab types
  const labTypes = [
    'Main Lab',
    'Branch Lab',
    'Collection Center',
    'Partner Lab'
  ];

  // Fetch distinct city names from lab data
  const fetchCities = async () => {
    setCitiesLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/getlab`);
      const payload = response.data?.data ?? response.data?.items ?? response.data;
      const cityValues = Array.isArray(payload)
        ? payload
            .map((item) => {
              if (typeof item === 'string') return item;
              if (typeof item === 'object' && item !== null) {
                return (
                  item.city || item.area || item.location || item.labelCode || item.name || ''
                );
              }
              return '';
            })
            .filter(Boolean)
            .map((city) => city.toString().trim())
        : [];

      const uniqueCities = [...new Set(cityValues)].sort((a, b) => a.localeCompare(b));
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCities();
    }
  }, [open]);

  useEffect(() => {
    if (lab) {
      // Edit mode - populate form with existing lab data
      setFormData({
        city: lab.city || '',
        labName: lab.labName || '',
        labId: lab.labId || '',
        labelCode: lab.labelCode || '',
        panelId: lab.panelId || '',
        centreId: lab.centreId || '',
        labType: lab.labType || 'Main Lab',
        phoneNumber: lab.phoneNumber || '',
        email: lab.email || '',
        address: lab.address || '',
        sortOrder: lab.sortOrder || 2,
        status: lab.status || 'active'
      });
      
      if (lab.imageUrl) {
        setImagePreview(`${BASE_URL}${lab.imageUrl}`);
      }
    } else {
      // Add new mode - reset form
      setFormData({
        city: '',
        labName: '',
        labId: '',
        labelCode: '',
        panelId: '',
        centreId: '',
        labType: 'Main Lab',
        phoneNumber: '',
        email: '',
        address: '',
        sortOrder: 2,
        status: 'active'
      });
      setImageFile(null);
      setImagePreview(null);
    }
    setErrors({});
  }, [lab, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      // Validate image size (optional)
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Clear image error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.labName.trim()) newErrors.labName = 'Lab Name is required';
    if (!formData.labId.trim()) newErrors.labId = 'Lab ID is required';
    if (!formData.labelCode.trim()) newErrors.labelCode = 'Label Code is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Sort order validation
    if (!formData.sortOrder || formData.sortOrder < 1) {
      newErrors.sortOrder = 'Sort order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'imageFile') return; // Skip imageFile from formData
        submitData.append(key, formData[key]);
      });
      
      // Append image file if exists
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let response;
      if (lab) {
        // Update existing lab
        response = await axios.put(
          `${BASE_URL}/labs/${lab._id}`,
          submitData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      } else {
        // Create new lab
        response = await axios.post(
          `${BASE_URL}/post_lab`,
          submitData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }

      if (response.data.success) {
        onSave(response.data.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error saving lab:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save lab. Please try again.';
      
      // Handle duplicate lab ID error
      if (error.response?.data?.message?.includes('Lab ID already exists')) {
        setErrors(prev => ({
          ...prev,
          labId: 'Lab ID already exists. Please use a different Lab ID.'
        }));
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {lab ? 'Edit Lab' : 'Add New Lab'}
          </Typography>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ minWidth: 'auto', p: 1 }}
            disabled={loading}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* City and Lab Name Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Autocomplete
                freeSolo
                options={cities}
                value={formData.city}
                loading={citiesLoading}
                disabled={loading}
                onInputChange={(event, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    city: value,
                  }));

                  if (errors.city) {
                    setErrors((prev) => ({
                      ...prev,
                      city: '',
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City *"
                    placeholder="Select or type city"
                    fullWidth
                    error={!!errors.city}
                    helperText={errors.city}
                  />
                )}
              />

              <TextField
                label="Lab Name *"
                name="labName"
                value={formData.labName}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.labName}
                helperText={errors.labName}
                placeholder="Enter lab name"
                disabled={loading}
              />
            </Stack>

            {/* Lab ID and Label Code Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Lab ID *"
                name="labId"
                value={formData.labId}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.labId}
                helperText={errors.labId}
                placeholder="Enter lab ID"
                disabled={loading || lab} // Disable labId in edit mode
                inputProps={{ 
                  style: { textTransform: 'uppercase' },
                  maxLength: 20
                }}
              />

              <TextField
                label="Label Code *"
                name="labelCode"
                value={formData.labelCode}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.labelCode}
                helperText={errors.labelCode}
                placeholder="Enter label code"
                disabled={loading}
                inputProps={{ 
                  style: { textTransform: 'uppercase' },
                  maxLength: 20
                }}
              />
            </Stack>

            {/* Panel ID and Centre ID Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Panel ID"
                name="panelId"
                value={formData.panelId}
                onChange={handleInputChange}
                fullWidth
                placeholder="Enter panel ID"
                disabled={loading}
                inputProps={{ maxLength: 20 }}
              />

              <TextField
                label="Centre ID"
                name="centreId"
                value={formData.centreId}
                onChange={handleInputChange}
                fullWidth
                placeholder="Enter centre ID"
                disabled={loading}
                inputProps={{ maxLength: 20 }}
              />
            </Stack>

            {/* Lab Type */}
            <FormControl fullWidth>
              <InputLabel>Lab Type</InputLabel>
              <Select
                name="labType"
                value={formData.labType}
                onChange={handleInputChange}
                label="Lab Type"
                disabled={loading}
              >
                {labTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Phone and Email Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber || "10-digit number"}
                placeholder="Enter phone number"
                disabled={loading}
                inputProps={{ maxLength: 10 }}
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
                placeholder="Enter email address"
                disabled={loading}
              />
            </Stack>

            {/* Address */}
            <TextField
              label="Address *"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
              error={!!errors.address}
              helperText={errors.address}
              placeholder="Enter full address"
              disabled={loading}
            />

            {/* Image Upload and Sort Order Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box flex={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Image (Size: 1000 x 1000 Px.)
                </Typography>
                
                <Box 
                  sx={{ 
                    border: '2px dashed', 
                    borderColor: errors.image ? 'error.main' : 'grey.300',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: 'grey.50',
                    cursor: loading ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor: loading ? 'grey.50' : 'grey.100',
                      borderColor: loading ? 'grey.300' : 'primary.main'
                    }
                  }}
                  onClick={() => !loading && document.getElementById('lab-image-upload').click()}
                >
                  <input
                    id="lab-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                  
                  {imagePreview ? (
                    <Box>
                      <Avatar
                        src={imagePreview}
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          mx: 'auto',
                          mb: 1 
                        }}
                        variant="rounded"
                      />
                      <Typography variant="body2" color="primary">
                        Click to change image
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        Select Image
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Recommended: 1000x1000 px
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {errors.image && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.image}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Sort Order"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.sortOrder}
                helperText={errors.sortOrder}
                inputProps={{ min: 1 }}
                sx={{ maxWidth: { sm: 150 } }}
                disabled={loading}
              />
            </Stack>

            {/* Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === 'active'}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      status: e.target.checked ? 'active' : 'inactive'
                    }))
                  }
                  color="primary"
                  disabled={loading}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Status</Typography>
                  <Typography 
                    variant="caption" 
                    color={formData.status === 'active' ? 'success.main' : 'text.secondary'}
                  >
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ minWidth: 100 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : lab ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LabFormDialog;