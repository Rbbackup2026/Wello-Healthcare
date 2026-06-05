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
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  IconButton,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from '../../../lib/routerCompat';

const ContactInquiry = () => {
  const [tabValue, setTabValue] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]); // This would typically come from an API
  const navigate = useNavigate(); // If using React Router

  const handleBack = () => {
    // If using React Router:
    navigate(-1); // Go back one page
    
    // If not using React Router, you can use:
    // window.history.back();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const statusChip = (status) => {
    let color = 'default';
    
    switch(status) {
      case 'Pending':
        color = 'warning';
        break;
      case 'Solved':
        color = 'success';
        break;
      case 'Canceled':
        color = 'error';
        break;
      default:
        color = 'default';
    }

    return <Chip label={status} color={color} size="small" />;
  };

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Solved', value: 'solved' },
    { label: 'Canceled', value: 'canceled' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
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
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            SYSTEM SETTINGS / CONTACT INQUIRY
          </Typography>
          <Typography variant="h6" sx={{ color: '#1976d2' }}>
            Contact Inquiry
          </Typography>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Toolbar Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <IconButton 
            size="small"
            sx={{ 
              border: '1px solid #e0e0e0',
              backgroundColor: 'white'
            }}
          >
            <FilterListIcon />
          </IconButton>
          <IconButton 
            size="small"
            sx={{ 
              border: '1px solid #e0e0e0',
              backgroundColor: 'white'
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">Items/page</Typography>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              displayEmpty
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name & Phone</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              // This would be populated with real data
              data.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {row.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>
                    <Typography noWrap sx={{ maxWidth: 200 }}>
                      {row.message}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{statusChip(row.status)}</TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="textSecondary">
                    No data available in table
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Showing 0 to 0 of 0 entries
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="body2" color="textSecondary">
          Showing {data.length > 0 ? page * itemsPerPage + 1 : 0} to{' '}
          {Math.min((page + 1) * itemsPerPage, data.length)} of {data.length} entries
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={itemsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onRowsPerPageChange={handleItemsPerPageChange}
            labelRowsPerPage=""
            sx={{ border: 'none' }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setPage(prev => Math.max(prev - 1, 0))}
              disabled={page === 0}
              size="small"
              sx={{ minWidth: 90 }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= Math.ceil(data.length / itemsPerPage) - 1}
              size="small"
              sx={{ minWidth: 90 }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#1976d2' }}
          onClick={() => {
            // Add functionality for new inquiry
            console.log('New inquiry clicked');
          }}
        >
          New Inquiry
        </Button>
        <Button
          variant="outlined"
          sx={{ borderColor: '#4caf50', color: '#4caf50' }}
          onClick={() => {
            // Export functionality
            console.log('Export clicked');
          }}
        >
          Export Data
        </Button>
        <Button
          variant="outlined"
          sx={{ borderColor: '#f44336', color: '#f44336' }}
          onClick={() => {
            // Delete functionality
            console.log('Delete clicked');
          }}
        >
          Delete Selected
        </Button>
      </Box>
    </Box>
  );
};

export default ContactInquiry;
