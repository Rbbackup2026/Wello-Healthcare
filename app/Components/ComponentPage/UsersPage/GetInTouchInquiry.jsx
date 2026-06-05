"use client";
import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from '../../../lib/routerCompat';

const GetInTouchInquiry = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [cityFilter, setCityFilter] = useState('All');
  const navigate = useNavigate(); // If using React Router

  const handleBack = () => {
    // If using React Router:
    navigate(-1); // Go back one page
    
    // If not using React Router, you can use:
    // window.history.back();
  };

  const inquiries = [
    { id: 18, name: 'Hanna Ford', phone: '+1 (967) 802-8934', city: 'Butwal', addedDate: '2025-03-28' },
    { id: 17, name: 'Brennan Ellison', phone: '+1 (353) 828-4812', city: 'Butwal', addedDate: '2025-03-28' },
    { id: 16, name: 'Upton Nolan', phone: '+1 (792) 109-6627', city: 'Butwal', addedDate: '2025-03-28' },
    { id: 15, name: 'Kendall Lucas', phone: '+1 (668) 189-1444', city: 'Kathmandu', addedDate: '2025-03-28' },
  ];

  const cities = ['All', 'Butwal', 'Kathmandu', 'Pokhara', 'Biratnagar'];

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.phone.includes(searchQuery) ||
                         inquiry.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'All' || inquiry.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleActionClick = (event, row) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedRow(null);
  };

  const handleViewDetails = () => {
    setSelectedInquiry(selectedRow);
    setViewDialogOpen(true);
    handleActionClose();
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedInquiry(null);
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting data...');
  };

  const handleAddNew = () => {
    // Add new inquiry functionality
    console.log('Adding new inquiry...');
  };

  const getStatusColor = (city) => {
    switch(city) {
      case 'Kathmandu': return 'primary';
      case 'Butwal': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section with Back Button */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              border: '1px solid #e0e0e0',
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                display: 'block',
                mb: 0.5
              }}
            >
              SYSTEM SETTINGS
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1a237e',
              }}
            >
              Get In Touch Inquiry
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#424242',
            backgroundColor: '#e8f4fd',
            p: 2,
            borderRadius: 1,
            display: 'inline-block'
          }}
        >
          ALL GET IN TOUCH INQUIRY
        </Typography>
      </Box>

      {/* Toolbar Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
        backgroundColor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search inquiries..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { 
                backgroundColor: '#f8f9fa',
                borderRadius: 1
              }
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{
              borderColor: '#e0e0e0',
              color: '#424242',
              '&:hover': {
                borderColor: '#bdbdbd',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Filter
          </Button>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled sx={{ fontWeight: 600, color: '#424242' }}>
              Filter by City
            </MenuItem>
            {cities.map((city) => (
              <MenuItem 
                key={city} 
                onClick={() => {
                  setCityFilter(city);
                  handleFilterClose();
                }}
                selected={cityFilter === city}
              >
                {city}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderColor: '#388e3c',
                backgroundColor: '#e8f5e9'
              }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {/* Current Filter Display */}
      {cityFilter !== 'All' && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`City: ${cityFilter}`} 
            color="primary" 
            size="small"
            onDelete={() => setCityFilter('All')}
          />
          <Typography variant="caption" color="textSecondary">
            {filteredInquiries.length} results found
          </Typography>
        </Box>
      )}

      {/* Table Section */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#1a237e' }}>ID.</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a237e' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a237e' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a237e' }}>City</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a237e' }}>Added Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1a237e' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInquiries.map((inquiry) => (
              <TableRow 
                key={inquiry.id}
                hover
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f5f5f5' 
                  },
                  '&:last-child td, &:last-child th': { 
                    border: 0 
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 600, color: '#424242' }}>
                  #{inquiry.id}
                </TableCell>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {inquiry.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: '#616161' }}>
                  {inquiry.phone}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={inquiry.city} 
                    color={getStatusColor(inquiry.city)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ color: '#616161' }}>
                  {inquiry.addedDate}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionClick(e, inquiry)}
                    sx={{
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {filteredInquiries.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: '#757575',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom>
            No inquiries found
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {searchQuery ? 'Try adjusting your search or filter' : 'No inquiries available'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ mt: 1 }}
          >
            Create First Inquiry
          </Button>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { handleActionClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { handleActionClose(); }} sx={{ color: '#d32f2f' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#e3f2fd',
          color: '#1a237e',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <VisibilityIcon />
          Inquiry Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInquiry && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                  ID:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>#{selectedInquiry.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                  Name:
                </Typography>
                <Typography variant="body1">{selectedInquiry.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                  Phone:
                </Typography>
                <Typography variant="body1">{selectedInquiry.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                  City:
                </Typography>
                <Chip 
                  label={selectedInquiry.city} 
                  color={getStatusColor(selectedInquiry.city)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                  Added Date:
                </Typography>
                <Typography variant="body1">{selectedInquiry.addedDate}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseViewDialog}
            sx={{ 
              color: '#616161',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={handleCloseViewDialog}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Mark as Read
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer Stats and Back Button */}
      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        pt: 2,
        borderTop: '1px solid #e0e0e0'
      }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              borderColor: '#e0e0e0',
              color: '#616161',
              '&:hover': {
                borderColor: '#bdbdbd',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Back
          </Button>
          <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
            Last updated: Today
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GetInTouchInquiry;
