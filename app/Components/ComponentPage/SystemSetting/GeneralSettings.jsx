"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Stack,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    // Status Section
    statusFiles: 1,
    lineOptions: ['Business/Add Interface', 'Add Message', 'Customize'],
    
    // Website Section
    firstServiceEntry: '',
    invoiceHomePlan: '',
    timeViewOrderApp: '',
    
    // Identity Section
    publishedLink: '',
    firstServiceIncluded: '',
    termsLink: '',
    firstFormableIntercourse: '',
    
    // Personal Link Section
    whatsappNumber: '',
    email: '',
    text: '',
    
    // Feedback Text
    contactText: '',
    
    // User Status Section
    userStatusEmailSec: true,
    userExperienceServicesLogin: true,
    userLocationRequestLogin: true,
    
    // Date Section
    dateOfName: '01/11/07',
  });

  const [lineInput, setLineInput] = useState('');
  const [editingLineIndex, setEditingLineIndex] = useState(null);

  const handleAddLine = () => {
    if (lineInput.trim()) {
      setSettings({
        ...settings,
        lineOptions: [...settings.lineOptions, lineInput.trim()],
      });
      setLineInput('');
    }
  };

  const handleDeleteLine = (index) => {
    const newLines = settings.lineOptions.filter((_, i) => i !== index);
    setSettings({ ...settings, lineOptions: newLines });
  };

  const handleEditLine = (index) => {
    setEditingLineIndex(index);
    setLineInput(settings.lineOptions[index]);
  };

  const handleSaveEdit = () => {
    if (lineInput.trim() && editingLineIndex !== null) {
      const newLines = [...settings.lineOptions];
      newLines[editingLineIndex] = lineInput.trim();
      setSettings({ ...settings, lineOptions: newLines });
      setEditingLineIndex(null);
      setLineInput('');
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveAll = () => {
    // Save settings to backend or localStorage
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        fontWeight="bold"
        sx={{ mb: 4 }}
      >
        General Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Status Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
              Status
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" gutterBottom>
                  <strong>Status: {settings.statusFiles} File</strong>
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Line:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  {settings.lineOptions.map((line, index) => (
                    <Chip
                      key={index}
                      label={line}
                      onDelete={() => handleDeleteLine(index)}
                      onClick={() => handleEditLine(index)}
                      deleteIcon={<EditIcon />}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
                
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <TextField
                    label="Add Line Option"
                    value={lineInput}
                    onChange={(e) => setLineInput(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant={editingLineIndex !== null ? "contained" : "outlined"}
                    onClick={editingLineIndex !== null ? handleSaveEdit : handleAddLine}
                    startIcon={editingLineIndex !== null ? <SaveIcon /> : <AddIcon />}
                  >
                    {editingLineIndex !== null ? 'Save' : 'Add'}
                  </Button>
                  {editingLineIndex !== null && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setEditingLineIndex(null);
                        setLineInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Website Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
              Website
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Service-related entry"
                  value={settings.firstServiceEntry}
                  onChange={(e) => handleChange('firstServiceEntry', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Invoice Home Plan"
                  value={settings.invoiceHomePlan}
                  onChange={(e) => handleChange('invoiceHomePlan', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="TimeView, Order App"
                  value={settings.timeViewOrderApp}
                  onChange={(e) => handleChange('timeViewOrderApp', e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Divider>
            <Typography variant="h6" color="text.secondary">
              IDENTITY TO LISTEN IN MATERIAL
            </Typography>
          </Divider>
        </Grid>

        {/* Identity Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Published Link
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                label="FirstService/Included entry"
                value={settings.firstServiceIncluded}
                onChange={(e) => handleChange('firstServiceIncluded', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Terms Link"
                value={settings.termsLink}
                onChange={(e) => handleChange('termsLink', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="FirstFormable Intercourse"
                value={settings.firstFormableIntercourse}
                onChange={(e) => handleChange('firstFormableIntercourse', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Personal Link Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Personal Link
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                label="Whatsapp number"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Text"
                value={settings.text}
                onChange={(e) => handleChange('text', e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ChatIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Feedback Text */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Feedback Text
            </Typography>
            
            <TextField
              label="Contact Text"
              value={settings.contactText}
              onChange={(e) => handleChange('contactText', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* User Status Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              User Status
            </Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.userStatusEmailSec}
                    onChange={(e) => handleChange('userStatusEmailSec', e.target.checked)}
                  />
                }
                label={
                  <Typography>
                    <strong>User Status: Email SEC</strong>
                  </Typography>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.userExperienceServicesLogin}
                    onChange={(e) => handleChange('userExperienceServicesLogin', e.target.checked)}
                  />
                }
                label="userExperience/Services Login"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.userLocationRequestLogin}
                    onChange={(e) => handleChange('userLocationRequestLogin', e.target.checked)}
                  />
                }
                label="UserLocation/Request Login"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Date Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Date of Name
            </Typography>
            
            <TextField
              label="Date of Name"
              value={settings.dateOfName}
              onChange={(e) => handleChange('dateOfName', e.target.value)}
              fullWidth
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Current value: {settings.dateOfName}
            </Typography>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              sx={{ minWidth: 200 }}
            >
              Save All Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralSettings;