"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Chip,
  Stack,
  Grid,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  Divider,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const MetaManagement = () => {
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const [metaData, setMetaData] = useState([
    {
      id: 32,
      pageName: 'lab_Insights',
      title: 'Lab Insights | MDC Nepal',
      description: '',
      keywords: '',
      status: 'active',
    },
    {
      id: 31,
      pageName: 'schedule_your_test',
      title: 'Schedule Your Test | MDC Nepal',
      description: '',
      keywords: '',
      status: 'active',
    },
    {
      id: 30,
      pageName: 'know_us',
      title: 'Know Us | MDC Nepal',
      description: '',
      keywords: '',
      status: 'active',
    },
    {
      id: 29,
      pageName: 'home-labs',
      title: 'Trusted Pathology Lab in Kathmandu, Nepal | 1 Abs Near me',
      description: '',
      keywords: '',
      status: 'active',
    },
  ]);

  const [formData, setFormData] = useState({
    pageName: '',
    title: '',
    description: '',
    keywords: '',
    status: 'active',
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleOpenDialog = (meta = null) => {
    if (meta) {
      setEditingMeta(meta.id);
      setFormData({
        pageName: meta.pageName,
        title: meta.title,
        description: meta.description || '',
        keywords: meta.keywords || '',
        status: meta.status,
      });
    } else {
      setEditingMeta(null);
      setFormData({
        pageName: '',
        title: '',
        description: '',
        keywords: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMeta(null);
  };

  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    if (editingMeta) {
      // Update existing meta
      setMetaData(metaData.map(meta => 
        meta.id === editingMeta ? { ...meta, ...formData } : meta
      ));
    } else {
      // Add new meta
      const newMeta = {
        id: Math.max(...metaData.map(m => m.id)) + 1,
        ...formData,
      };
      setMetaData([...metaData, newMeta]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this meta?')) {
      setMetaData(metaData.filter(meta => meta.id !== id));
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = metaData.map((n) => n.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const filteredData = metaData.filter(meta =>
    meta.pageName.toLowerCase().includes(search.toLowerCase()) ||
    meta.title.toLowerCase().includes(search.toLowerCase()) ||
    meta.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const formatPageName = (name) => {
    return name.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        fontWeight="bold"
        sx={{ 
          mb: 3, 
          color: 'primary.main',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Meta
      </Typography>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        {/* Section Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
            ALL META
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Controls */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    displayEmpty
                  >
                    <MenuItem value={10}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>10</Typography>
                        <Box sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                          ▼ Items/page
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value={25}>25 Items/page</MenuItem>
                    <MenuItem value={50}>50 Items/page</MenuItem>
                    <MenuItem value={100}>100 Items/page</MenuItem>
                  </Select>
                </FormControl>
                
                {selected.length > 0 && (
                  <Chip
                    label={`${selected.length} selected`}
                    color="primary"
                    onDelete={() => setSelected([])}
                    deleteIcon={<DeleteIcon />}
                  />
                )}
              </Stack>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  ADD NEW PAGE
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search..."
            value={search}
            onChange={handleSearch}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        {/* Meta List */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < metaData.length}
                    checked={metaData.length > 0 && selected.length === metaData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Page Name</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((meta) => {
                const isItemSelected = isSelected(meta.id);
                return (
                  <TableRow 
                    key={meta.id}
                    hover
                    selected={isItemSelected}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleSelect(event, meta.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meta.id}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPageName(meta.pageName)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {meta.pageName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 400 }}>
                        <Typography variant="body2" noWrap>
                          {meta.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {meta.title.length} characters
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(meta)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Copy Title">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleCopy(meta.title)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(meta.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Preview">
                          <IconButton size="small" color="default">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No meta data found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or add a new page
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Total Pages
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {metaData.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active meta tags
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Recent Meta Titles
                </Typography>
                <Stack spacing={1}>
                  {metaData.slice(0, 3).map((meta) => (
                    <Box 
                      key={meta.id}
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {meta.title}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Add/Edit Meta Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="medium">
            {editingMeta ? 'Edit Meta Information' : 'Add New Page Meta'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Page Name"
                  value={formData.pageName}
                  onChange={(e) => handleFormChange('pageName', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g., about_us, contact_page"
                  helperText="Use underscores or hyphens, no spaces"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Meta Title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  helperText={`${formData.title.length}/60 characters (Recommended: 50-60)`}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopy(formData.title)}
                          disabled={!formData.title}
                        >
                          <CopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Meta Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  helperText={`${formData.description.length}/160 characters (Recommended: 150-160)`}
                  placeholder="Brief description of the page content"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Keywords"
                  value={formData.keywords}
                  onChange={(e) => handleFormChange('keywords', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  helperText="Separate keywords with commas"
                  placeholder="e.g., lab, test, pathology, nepal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Preview */}
            {formData.title && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Preview (Google Search):
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a0dab',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {formData.title}
                </Typography>
                {formData.description && (
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                    {formData.description}
                  </Typography>
                )}
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.pageName || !formData.title}
          >
            {editingMeta ? 'Update Meta' : 'Create Meta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MetaManagement;