"use client";
import React, { useState } from 'react';
import { useNavigate } from '../../../lib/routerCompat';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Grid
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  ArrowBack
} from '@mui/icons-material';

// Separate Dialog Component
const StateFormDialog = ({ isOpen, onClose, onSubmit, editData }) => {
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    apiId: editData?.apiId || '',
    sortOrder: editData?.sortOrder || 2,
    status: editData?.status || 'Active'
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'State Name is required';
    if (!formData.apiId.trim()) newErrors.apiId = 'State API ID is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || '' : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      apiId: '',
      sortOrder: 2,
      status: 'Active'
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        State Form
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="State Name*"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="State Api Id*"
                name="apiId"
                value={formData.apiId}
                onChange={handleChange}
                error={!!errors.apiId}
                helperText={errors.apiId}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sort Order"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleChange}
                margin="normal"
                size="small"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Main Component
const CountryManagement = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState([
    { id: 1, name: 'India', apiId: 'IN', sortOrder: 1, status: 'Active', createdAt: '2024-01-15' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState(null);

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.apiId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (formData) => {
    if (editingState) {
      // Update existing state
      setStates(states.map(state => 
        state.id === editingState.id 
          ? { ...state, ...formData }
          : state
      ));
    } else {
      // Add new state
      const newState = {
        id: Math.max(...states.map(s => s.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStates([...states, newState]);
    }
    setEditingState(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (state) => {
    setEditingState(state);
    setIsDialogOpen(true);
  };

  const toggleStatus = (id) => {
    setStates(states.map(state => 
      state.id === id 
        ? { 
            ...state, 
            status: state.status === 'Active' ? 'Inactive' : 'Active' 
          }
        : state
    ));
  };

  const deleteState = (id) => {
    if (window.confirm('Are you sure you want to delete this state?')) {
      setStates(states.filter(state => state.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingState(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingState(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={() => navigate("/admin")} 
              color="primary"
              size="large"
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'grey.900' }}>
                Country Management
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.600' }}>
                Manage and organize all Country in your system
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Controls */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'center' } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flex: 1 }}>
              <TextField
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'grey.400', mr: 1 }} />
                }}
                sx={{ 
                  flex: 1,
                  maxWidth: { md: 400 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                size="small"
              />
              
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  label="Items per page"
                >
                  <MenuItem value={10}>10 per page</MenuItem>
                  <MenuItem value={25}>25 per page</MenuItem>
                  <MenuItem value={50}>50 per page</MenuItem>
                  <MenuItem value={100}>100 per page</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                startIcon={<Download />}
                variant="outlined"
                color="inherit"
                sx={{ borderRadius: 2 }}
              >
                Export
              </Button>
              <Button
                startIcon={<Upload />}
                variant="outlined"
                color="inherit"
                sx={{ borderRadius: 2 }}
              >
                Import
              </Button>
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={handleAddNew}
                sx={{ borderRadius: 2 }}
              >
                Add State
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    State Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    API ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Sort Order
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Created Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'grey.600', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStates.map((state) => (
                  <TableRow 
                    key={state.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                      #{state.id}
                    </TableCell>
                    <TableCell sx={{ color: 'grey.900' }}>
                      {state.name}
                    </TableCell>
                    <TableCell sx={{ color: 'grey.600' }}>
                      {state.apiId}
                    </TableCell>
                    <TableCell sx={{ color: 'grey.600' }}>
                      {state.sortOrder}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={state.status}
                        color={state.status === 'Active' ? 'success' : 'error'}
                        size="small"
                        onClick={() => toggleStatus(state.id)}
                        clickable
                        variant={state.status === 'Active' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'grey.600' }}>
                      {state.createdAt}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEdit(state)}
                          color="primary"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          onClick={() => deleteState(state.id)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'grey.200', bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Showing <Typography component="span" variant="body2" sx={{ fontWeight: 'medium' }}>{filteredStates.length}</Typography> of{' '}
                <Typography component="span" variant="body2" sx={{ fontWeight: 'medium' }}>{states.length}</Typography> states
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button variant="outlined" size="small" sx={{ borderRadius: 1 }}>
                  Previous
                </Button>
                <Typography variant="body2" sx={{ color: 'grey.600', px: 2 }}>
                  Page 1 of 1
                </Typography>
                <Button variant="outlined" size="small" sx={{ borderRadius: 1 }}>
                  Next
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Dialog Form */}
        <StateFormDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          editData={editingState}
        />
      </Box>
    </Box>
  );
};

export default CountryManagement;
