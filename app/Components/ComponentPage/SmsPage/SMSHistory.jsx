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
  IconButton,
  Typography,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Tooltip,
  Chip,
  TablePagination,
  InputAdornment,
  Avatar,
  Badge,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const SMS_HISTORY_DATA = [
  {
    id: 98,
    phone: '9851158460',
    smsText: 'Dear Guest, Welcome to MODERN! 3512 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-25T16:53:22',
    status: 'delivered'
  },
  {
    id: 97,
    phone: '9809277800',
    smsText: 'Dear Guest, Welcome to MODERN! 3568 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-23T21:30:09',
    status: 'delivered'
  },
  {
    id: 96,
    phone: '9768496221',
    smsText: 'Dear Guest, Welcome to MODERN! 7182 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-19T13:19:03',
    status: 'delivered'
  },
  {
    id: 95,
    phone: '9813947291',
    smsText: 'Dear Guest, Welcome to MODERN! 2036 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-18T14:30:58',
    status: 'failed'
  },
  {
    id: 94,
    phone: '9843599656',
    smsText: 'Dear Guest, Welcome to MODERN! 8160 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-14T15:44:53',
    status: 'delivered'
  },
  {
    id: 93,
    phone: '9823031276',
    smsText: 'Dear Guest, Welcome to MODERN! 3476 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-12T08:30:46',
    status: 'delivered'
  },
  {
    id: 92,
    phone: '9860049907',
    smsText: 'Dear Guest, Welcome to MODERN! 7916 is your One Time Password (OTP) for login into your account. www.mdcnepal.com.',
    smsId: 1,
    totalSMS: 1,
    date: '2025-12-12T02:46:59',
    status: 'pending'
  },
];

const SMSHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Format date function without date-fns
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Format day
      const day = String(date.getDate()).padStart(2, '0');
      
      // Format month (getMonth() returns 0-11)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Format year
      const year = date.getFullYear();
      
      // Format time
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      // If date parsing fails, return the original string
      return dateString;
    }
  };

  const filteredHistory = SMS_HISTORY_DATA.filter(entry => {
    const matchesSearch = 
      entry.phone.includes(searchTerm) ||
      entry.smsText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    console.log('Refreshing SMS history...');
    // Implement refresh logic here
  };

  const handleExport = () => {
    console.log('Exporting SMS history...');
    // Implement export logic here
  };

  const handleViewDetails = (id) => {
    console.log('Viewing details for ID:', id);
    // Implement view details logic here
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="SMS SETTING / SMS HISTORY"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton onClick={handleExport} size="small" color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="medium">
              SMS History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ALL SMS_HISTORY • {filteredHistory.length} records found
            </Typography>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by phone, SMS text or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <TextField
                  select
                  fullWidth
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Items per page:
              </Typography>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                size="small"
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 80 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 140 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PhoneIcon fontSize="small" />
                      <span>Phone</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 300 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <MessageIcon fontSize="small" />
                      <span>SMS Text</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 100 }}>SMS ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Total SMS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 180 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarIcon fontSize="small" />
                      <span>Date & Time</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 100 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                            <PhoneIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          </Avatar>
                          <Typography variant="body2" fontFamily="monospace">
                            {entry.phone}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                            color: 'text.secondary'
                          }}
                        >
                          {entry.smsText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`#${entry.smsId}`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge 
                          badgeContent={entry.totalSMS} 
                          color="primary"
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(entry.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          color={getStatusColor(entry.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(entry.id)}
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredHistory.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage=""
            sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}
          />
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Total Messages</Typography>
              <Typography variant="h6" fontWeight="bold">{SMS_HISTORY_DATA.length}</Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Delivered</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {SMS_HISTORY_DATA.filter(s => s.status === 'delivered').length}
              </Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Failed</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {SMS_HISTORY_DATA.filter(s => s.status === 'failed').length}
              </Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {SMS_HISTORY_DATA.filter(s => s.status === 'pending').length}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SMSHistory;