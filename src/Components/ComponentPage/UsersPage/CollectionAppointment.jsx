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
  Badge,
  Grid,
  Card,
  CardContent,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'; // If using React Router

const CollectionAppointment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const navigate = useNavigate(); // If using React Router

  const handleBack = () => {
    // If using React Router:
    navigate(-1); // Go back one page
    
    // If not using React Router, you can use:
    // window.history.back();
  };

  const appointments = [
    {
      id: 8,
      user: {
        name: 'OOZXDQVOQIPCmVgapdE',
        gender: 'Male',
        age: 28,
        occupation: 'VOZiWgMPtTwkiaNMyhqMIP'
      },
      contact: {
        phone: '7558495741',
        email: 'lubiduromu840@gmail.com'
      },
      address: 'Burwal ccilPnBvZCvjeRjhuJtpX',
      briefDetails: 'IzahsXXCSyhjsKJM',
      reference: '',
      addedDate: '2025-11-18',
      status: 'Scheduled',
      appointmentTime: '10:30 AM'
    },
    {
      id: 7,
      user: {
        name: 'IDYOkigOcTlkrShooku',
        gender: 'Female',
        age: 32,
        occupation: 'opUUMnDFnhCNI0wZIBo'
      },
      contact: {
        phone: '3210112996',
        email: 'avidezipag84@gmail.com'
      },
      address: 'Kathmandu kjBcmwsRYmVxlcnmmqxjyM',
      briefDetails: 'pNvOyEdNejxSCQvoikElzh',
      reference: 'friends',
      addedDate: '2025-11-15',
      status: 'Completed',
      appointmentTime: '2:00 PM'
    },
  ];

  const statuses = ['All', 'Scheduled', 'Completed', 'Cancelled', 'Pending'];
  const dates = ['All', 'Today', 'This Week', 'This Month', 'Last 30 Days'];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.contact.phone.includes(searchQuery) ||
      appointment.contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleActionClick = (event, appointment) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleViewDetails = () => {
    setViewDialogOpen(true);
    handleActionClose();
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: '#1a237e',
                mb: 0.5
              }}
            >
              USERS & WALLET / COLLECTION APPOINTMENT
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1976d2',
              }}
            >
              Collection Appointment
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
            display: 'inline-block',
            mt: 1
          }}
        >
          ALL COLLECTION APPOINTMENT
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            borderLeft: '4px solid #2196f3'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Appointments
              </Typography>
              <Typography variant="h4" color="primary">
                {appointments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            borderLeft: '4px solid #00bcd4'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Scheduled
              </Typography>
              <Typography variant="h4" color="info.main">
                1
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            borderLeft: '4px solid #4caf50'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                1
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 2,
            borderLeft: '4px solid #ff9800'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                This Month
              </Typography>
              <Typography variant="h4" color="warning.main">
                2
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
            placeholder="Search appointments..."
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
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateFilter}
              label="Date Range"
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {dates.map((date) => (
                <MenuItem key={date} value={date}>{date}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{
              borderColor: '#e0e0e0',
              color: '#424242',
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
            startIcon={<CalendarTodayIcon />}
            onClick={() => console.log('New Appointment clicked')}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            New Appointment
          </Button>
        </Box>
      </Box>

      {/* Active Filters Display */}
      {(statusFilter !== 'All' || dateFilter !== 'All') && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {statusFilter !== 'All' && (
            <Chip 
              label={`Status: ${statusFilter}`} 
              color="primary" 
              size="small"
              onDelete={() => setStatusFilter('All')}
            />
          )}
          {dateFilter !== 'All' && (
            <Chip 
              label={`Date: ${dateFilter}`} 
              color="secondary" 
              size="small"
              onDelete={() => setDateFilter('All')}
            />
          )}
          <Typography variant="caption" color="textSecondary">
            {filteredAppointments.length} appointment(s) found
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
          <TableHead sx={{ backgroundColor: '#1a237e' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Phone & Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Brief Details</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Reference</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }}>Added Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'white' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow 
                key={appointment.id}
                hover
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f5f7fa' 
                  }
                }}
              >
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    #{appointment.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: appointment.user.gender === 'Male' ? '#2196f3' : '#e91e63',
                      width: 40, 
                      height: 40 
                    }}>
                      {getInitials(appointment.user.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {appointment.user.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Gender: {appointment.user.gender} | Age: {appointment.user.age}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {appointment.user.occupation}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {appointment.contact.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {appointment.contact.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                    <Typography variant="body2">
                      {appointment.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={appointment.briefDetails} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {appointment.reference ? (
                    <Chip 
                      label={appointment.reference} 
                      size="small"
                      color="secondary"
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      No reference
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {appointment.addedDate}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {appointment.appointmentTime}
                    </Typography>
                    <Chip 
                      label={appointment.status} 
                      size="small"
                      color={getStatusColor(appointment.status)}
                      sx={{ mt: 0.5, width: 'fit-content' }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionClick(e, appointment)}
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
      {filteredAppointments.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: 'white',
          borderRadius: 2,
          mt: 2,
          boxShadow: 1
        }}>
          <CalendarTodayIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="textSecondary">
            No appointments found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Try adjusting your search or filter criteria' : 'No appointments scheduled yet'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalendarTodayIcon />}
            onClick={() => console.log('Schedule first appointment')}
            sx={{ mt: 1 }}
          >
            Schedule First Appointment
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
          Edit Appointment
        </MenuItem>
        <MenuItem onClick={handleActionClose}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          Reschedule
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ color: '#d32f2f' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Cancel Appointment
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
          backgroundColor: '#1a237e',
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon />
            Appointment Details
          </Box>
          {selectedAppointment && (
            <Chip 
              label={selectedAppointment.status} 
              color={getStatusColor(selectedAppointment.status)}
              sx={{ color: 'white' }}
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedAppointment && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: selectedAppointment.user.gender === 'Male' ? '#2196f3' : '#e91e63',
                    width: 64,
                    height: 64
                  }}>
                    {getInitials(selectedAppointment.user.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {selectedAppointment.user.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Appointment ID: #{selectedAppointment.id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      User Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Gender</Typography>
                        <Typography variant="body2">{selectedAppointment.user.gender}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Age</Typography>
                        <Typography variant="body2">{selectedAppointment.user.age}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Occupation</Typography>
                        <Typography variant="body2">{selectedAppointment.user.occupation}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                      <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selectedAppointment.contact.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{selectedAppointment.contact.email}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                      <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Address
                    </Typography>
                    <Typography variant="body2">{selectedAppointment.address}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                      <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Brief Details</Typography>
                        <Chip 
                          label={selectedAppointment.briefDetails} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Reference</Typography>
                        {selectedAppointment.reference ? (
                          <Chip 
                            label={selectedAppointment.reference} 
                            size="small"
                            color="secondary"
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">None</Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                      <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Appointment Schedule
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Added Date</Typography>
                        <Typography variant="body2">{selectedAppointment.addedDate}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Time</Typography>
                        <Typography variant="body2">{selectedAppointment.appointmentTime}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip 
                          label={selectedAppointment.status} 
                          color={getStatusColor(selectedAppointment.status)}
                          sx={{ ml: 1 }}
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
            Download
          </Button>
          <Button 
            variant="contained"
            onClick={handleCloseViewDialog}
            sx={{ 
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d1a47'
              }
            }}
          >
            Print Details
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
          Showing {filteredAppointments.length} of {appointments.length} appointments
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
            Last updated: Today, {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionAppointment;