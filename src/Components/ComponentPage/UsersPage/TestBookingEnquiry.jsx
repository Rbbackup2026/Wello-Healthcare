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
  Avatar,
  Grid,
  Card,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  Badge,
  TablePagination,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'; // If using React Router

const TestBookingEnquiry = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [testTypeFilter, setTestTypeFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate(); // If using React Router

  const handleBack = () => {
    // If using React Router:
    navigate(-1); // Go back one page
    
    // If not using React Router, you can use:
    // window.history.back();
  };

  const enquiries = [
    {
      id: 26,
      user: {
        name: 'sha',
        gender: 'Male',
        age: 30,
      },
      contact: {
        phone: '7355972574',
        email: 'sha@example.com'
      },
      address: 'Butwal',
      briefDetails: 'New Booking',
      fileType: 'MR/ICT Scan Etc',
      fileCount: 1,
      addedDate: '2025-11-21',
      status: 'Pending',
      testType: 'MRI Scan',
      priority: 'High'
    },
    {
      id: 25,
      user: {
        name: 'Color Doppler Scan',
        gender: 'Female',
        age: 45,
      },
      contact: {
        phone: '1234567890',
        email: 'color@example.com'
      },
      address: 'Kathmandu',
      briefDetails: 'New Booking',
      fileType: 'Blood Test',
      fileCount: 3,
      addedDate: '2025-10-31',
      status: 'Confirmed',
      testType: 'Blood Test',
      priority: 'Medium'
    },
    {
      id: 24,
      user: {
        name: 'Test',
        gender: 'Other',
        age: 28,
      },
      contact: {
        phone: '1234567890',
        email: 'test@example.com'
      },
      address: 'Kathmandu',
      briefDetails: 'New Booking',
      fileType: 'MR/ICT Scan Etc',
      fileCount: 4,
      addedDate: '2025-09-15',
      status: 'Completed',
      testType: 'CT Scan',
      priority: 'Low',
      scores: '(15/29/32/14 avg)'
    },
  ];

  const testTypes = ['All', 'MRI Scan', 'Blood Test', 'CT Scan', 'X-Ray', 'Ultrasound'];
  const statuses = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.contact.phone.includes(searchQuery) ||
      enquiry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.testType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || enquiry.status === statusFilter;
    const matchesTestType = testTypeFilter === 'All' || enquiry.testType === testTypeFilter;
    
    return matchesSearch && matchesStatus && matchesTestType;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleActionClick = (event, enquiry) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedEnquiry(enquiry);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedEnquiry(null);
  };

  const handleViewDetails = () => {
    setViewDialogOpen(true);
    handleActionClose();
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedEnquiry(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Confirmed': return 'info';
      case 'In Progress': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('Scan')) return <PictureAsPdfIcon fontSize="small" />;
    if (fileType.includes('Blood')) return <ImageIcon fontSize="small" />;
    return <DescriptionIcon fontSize="small" />;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const paginatedEnquiries = filteredEnquiries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
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
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: '#1a237e',
                mb: 0.5
              }}
            >
              USERS & WALLET / TEST BOOKING ENQUIRY
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1976d2',
              }}
            >
              Test Booking Enquiry
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#e8f4fd',
          p: 2,
          borderRadius: 2,
          mb: 2
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#0d47a1'
            }}
          >
            ALL TEST BOOKING ENQUIRY
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Items/page
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            borderLeft: '4px solid #2196f3'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Enquiries
              </Typography>
              <Typography variant="h4" color="primary">
                {enquiries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            borderLeft: '4px solid #ff9800'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {enquiries.filter(e => e.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            borderLeft: '4px solid #4caf50'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {enquiries.filter(e => e.status === 'Completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            borderLeft: '4px solid #9c27b0'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                This Month
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {enquiries.filter(e => e.addedDate.startsWith('2025-11')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
        backgroundColor: 'white',
        p: 3,
        borderRadius: 2,
        boxShadow: 2
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
              sx: { 
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                minWidth: 250
              }
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Test Type</InputLabel>
            <Select
              value={testTypeFilter}
              label="Test Type"
              onChange={(e) => setTestTypeFilter(e.target.value)}
            >
              {testTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{
              borderColor: '#9e9e9e',
              color: '#616161',
              '&:hover': {
                borderColor: '#757575',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            More Filters
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Export clicked')}
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
            startIcon={<AttachFileIcon />}
            onClick={() => console.log('New Booking clicked')}
            sx={{
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#1976d2'
              }
            }}
          >
            New Booking
          </Button>
        </Box>
      </Box>

      {/* Active Filters Display */}
      {(statusFilter !== 'All' || testTypeFilter !== 'All') && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {statusFilter !== 'All' && (
            <Chip 
              label={`Status: ${statusFilter}`} 
              color="primary" 
              size="small"
              onDelete={() => setStatusFilter('All')}
            />
          )}
          {testTypeFilter !== 'All' && (
            <Chip 
              label={`Test: ${testTypeFilter}`} 
              color="secondary" 
              size="small"
              onDelete={() => setTestTypeFilter('All')}
            />
          )}
          <Typography variant="caption" color="textSecondary">
            {filteredEnquiries.length} enquiry(s) found
          </Typography>
        </Box>
      )}

      {/* Table Section */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#0d47a1' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>ID.</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Phone & Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Brief Details</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Added Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEnquiries.map((enquiry) => (
              <TableRow 
                key={enquiry.id}
                hover
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f8fafc' 
                  }
                }}
              >
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    #{enquiry.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: enquiry.gender === 'Male' ? '#2196f3' : 
                              enquiry.gender === 'Female' ? '#e91e63' : '#9c27b0',
                      width: 42,
                      height: 42
                    }}>
                      {getInitials(enquiry.user.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {enquiry.user.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Gender: {enquiry.user.gender} | Age: {enquiry.user.age}
                      </Typography>
                      <Chip 
                        label={enquiry.testType} 
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {enquiry.contact.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                        {enquiry.contact.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {enquiry.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip 
                      label={enquiry.briefDetails} 
                      size="small"
                      color="secondary"
                      sx={{ mb: 0.5 }}
                    />
                    {enquiry.scores && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        {enquiry.scores}
                      </Typography>
                    )}
                    <Chip 
                      label={enquiry.priority} 
                      size="small"
                      color={getPriorityColor(enquiry.priority)}
                      sx={{ mt: 0.5, fontSize: '0.7rem' }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title={`${enquiry.fileType} (${enquiry.fileCount} files)`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge 
                        badgeContent={enquiry.fileCount} 
                        color="primary"
                      >
                        <IconButton size="small">
                          {getFileIcon(enquiry.fileType)}
                        </IconButton>
                      </Badge>
                      <Typography variant="caption" color="textSecondary">
                        {enquiry.fileType}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {enquiry.addedDate}
                      </Typography>
                    </Box>
                    <Chip 
                      label={enquiry.status} 
                      size="small"
                      color={getStatusColor(enquiry.status)}
                      sx={{ width: 'fit-content' }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionClick(e, enquiry)}
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

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredEnquiries.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ 
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 1,
          mb: 2
        }}
      />

      {/* Empty State */}
      {filteredEnquiries.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: 'white',
          borderRadius: 2,
          mt: 2,
          mb: 2,
          boxShadow: 1
        }}>
          <InsertDriveFileIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="textSecondary">
            No test booking enquiries found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No enquiries available'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AttachFileIcon />}
            onClick={() => console.log('Create first booking')}
            sx={{ mt: 1 }}
          >
            Create First Booking
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
        <MenuItem onClick={handleActionClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Booking
        </MenuItem>
        <MenuItem onClick={handleActionClose}>
          <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
          View Files
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ color: '#d32f2f' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Booking
        </MenuItem>
      </Menu>

      {/* View Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#0d47a1',
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFileIcon />
            Test Booking Details
          </Box>
          {selectedEnquiry && (
            <Chip 
              label={selectedEnquiry.status} 
              color={getStatusColor(selectedEnquiry.status)}
              sx={{ color: 'white' }}
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEnquiry && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: selectedEnquiry.gender === 'Male' ? '#2196f3' : 
                            selectedEnquiry.gender === 'Female' ? '#e91e63' : '#9c27b0',
                    width: 64,
                    height: 64
                  }}>
                    {getInitials(selectedEnquiry.user.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {selectedEnquiry.user.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Booking ID: #{selectedEnquiry.id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#0d47a1' }}>
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Patient Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Gender</Typography>
                        <Typography variant="body2">{selectedEnquiry.user.gender}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Age</Typography>
                        <Typography variant="body2">{selectedEnquiry.user.age}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Test Type</Typography>
                        <Chip 
                          label={selectedEnquiry.testType} 
                          size="small"
                          color="primary"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Priority</Typography>
                        <Chip 
                          label={selectedEnquiry.priority} 
                          size="small"
                          color={getPriorityColor(selectedEnquiry.priority)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#0d47a1' }}>
                      <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selectedEnquiry.contact.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selectedEnquiry.contact.email}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#0d47a1' }}>
                      <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Address & Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="textSecondary">Address</Typography>
                        <Typography variant="body2">{selectedEnquiry.address}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="textSecondary">Brief Details</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={selectedEnquiry.briefDetails} 
                            color="secondary"
                          />
                          {selectedEnquiry.scores && (
                            <Typography variant="body2">
                              {selectedEnquiry.scores}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#0d47a1' }}>
                      <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Files
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge badgeContent={selectedEnquiry.fileCount} color="primary">
                        <IconButton>
                          {getFileIcon(selectedEnquiry.fileType)}
                        </IconButton>
                      </Badge>
                      <Box>
                        <Typography variant="body2">{selectedEnquiry.fileType}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {selectedEnquiry.fileCount} file(s) attached
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#0d47a1' }}>
                      <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Booking Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Added Date</Typography>
                        <Typography variant="body2">{selectedEnquiry.addedDate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip 
                          label={selectedEnquiry.status} 
                          size="small"
                          color={getStatusColor(selectedEnquiry.status)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
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
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleCloseViewDialog}
            sx={{ 
              borderColor: '#2196f3',
              color: '#2196f3'
            }}
          >
            Download Report
          </Button>
          <Button 
            variant="contained"
            onClick={handleCloseViewDialog}
            sx={{ 
              backgroundColor: '#0d47a1',
              '&:hover': {
                backgroundColor: '#0b3d91'
              }
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer with Back Button */}
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
          Showing {paginatedEnquiries.length} of {filteredEnquiries.length} enquiries
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          <Typography variant="body2" color="textSecondary">
            Page {page + 1} of {Math.ceil(filteredEnquiries.length / rowsPerPage)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TestBookingEnquiry;