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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Language as LanguageIcon,
  Apple as AppleIcon,
  Web as WebIcon,
  DesktopWindows as DesktopIcon,
  Smartphone as MobileIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

const AdminLoginHistory = () => {
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterBrowser, setFilterBrowser] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  const [loginHistory, setLoginHistory] = useState([
    {
      id: 226,
      browser: 'Chrome',
      browserVersion: '120.0.0.0',
      ip: '152.58.128.235',
      date: '28-12-2025 20:49:37',
      status: 'success',
      location: 'Kathmandu, Nepal',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 225,
      browser: 'Chrome',
      browserVersion: '120.0.0.0',
      ip: '152.58.128.235',
      date: '28-12-2025 18:57:26',
      status: 'success',
      location: 'Kathmandu, Nepal',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 224,
      browser: 'Chrome',
      browserVersion: '119.0.0.0',
      ip: '106.219.153.131',
      date: '26-12-2025 13:26:48',
      status: 'success',
      location: 'New Delhi, India',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
    },
    {
      id: 223,
      browser: 'Chrome',
      browserVersion: '119.0.0.0',
      ip: '152.59.183.209',
      date: '26-12-2025 11:38:42',
      status: 'success',
      location: 'Pokhara, Nepal',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 222,
      browser: 'Chrome',
      browserVersion: '119.0.0.0',
      ip: '152.59.183.209',
      date: '26-12-2025 09:47:14',
      status: 'success',
      location: 'Pokhara, Nepal',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 221,
      browser: 'Firefox',
      browserVersion: '121.0',
      ip: '103.21.58.105',
      date: '25-12-2025 15:22:10',
      status: 'failed',
      location: 'Unknown',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0)',
    },
    {
      id: 220,
      browser: 'Safari',
      browserVersion: '17.2',
      ip: '45.117.42.98',
      date: '24-12-2025 12:15:33',
      status: 'success',
      location: 'Singapore',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)',
    },
    {
      id: 219,
      browser: 'Edge',
      browserVersion: '120.0.0.0',
      ip: '152.58.128.235',
      date: '23-12-2025 16:45:22',
      status: 'success',
      location: 'Kathmandu, Nepal',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  ]);

  const getBrowserIcon = (browser) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return <LanguageIcon sx={{ color: '#4285F4' }} />;
      case 'firefox':
        return <LanguageIcon sx={{ color: '#FF7139' }} />;
      case 'safari':
        return <AppleIcon sx={{ color: '#000000' }} />;
      case 'edge':
        return <LanguageIcon sx={{ color: '#0078D7' }} />;
      default:
        return <LanguageIcon />;
    }
  };

  const getDeviceIcon = (device) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <DesktopIcon fontSize="small" />;
      case 'mobile':
        return <MobileIcon fontSize="small" />;
      default:
        return <ComputerIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedLog(null);
  };

  const handleRefresh = () => {
    // Refresh data
    console.log('Refreshing login history...');
  };

  const handleExport = () => {
    // Export data as CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Browser,IP,Date,Status,Location,Device\n"
      + loginHistory.map(log => 
          `${log.id},${log.browser},${log.ip},${log.date},${log.status},${log.location},${log.device}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "admin_login_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all login history?')) {
      setLoginHistory([]);
    }
  };

  const filteredHistory = loginHistory.filter((log) => {
    const matchesSearch =
      log.ip.includes(search) ||
      log.browser.toLowerCase().includes(search.toLowerCase()) ||
      log.location.toLowerCase().includes(search.toLowerCase());

    const matchesBrowser = filterBrowser === 'all' || log.browser === filterBrowser;
    const matchesDate = filterDate === 'all' || true; // Add date filter logic

    return matchesSearch && matchesBrowser && matchesDate;
  });

  // Calculate statistics
  const totalLogins = loginHistory.length;
  const successfulLogins = loginHistory.filter((log) => log.status === 'success').length;
  const failedLogins = loginHistory.filter((log) => log.status === 'failed').length;
  const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;

  const getUniqueBrowsers = () => {
    return [...new Set(loginHistory.map((log) => log.browser))];
  };

  const formatDate = (dateStr) => {
    const [date, time] = dateStr.split(' ');
    return { date, time };
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
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
          letterSpacing: 1,
        }}
      >
        SYSTEM SETTING / ADMIN LOGIN HISTORY
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
        {/* Section Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2" fontWeight="medium">
              Admin Login History
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearHistory}
              >
                Clear History
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#e8f4fd' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalLogins}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Logins
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#e8f7ed' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <ComputerIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {successfulLogins}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Successful
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#fdeded' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {failedLogins}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Failed Attempts
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, bgcolor: '#fff4e5' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {successRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={successRate}
                      color="warning"
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight="medium">
                ALL ADMIN LOGIN HISTORY
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <Select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(e.target.value)}
                >
                  <MenuItem value={10}>10 items/page</MenuItem>
                  <MenuItem value={25}>25 items/page</MenuItem>
                  <MenuItem value={50}>50 items/page</MenuItem>
                  <MenuItem value={100}>100 items/page</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Browser Filter</InputLabel>
                <Select
                  value={filterBrowser}
                  label="Browser Filter"
                  onChange={(e) => setFilterBrowser(e.target.value)}
                >
                  <MenuItem value="all">All Browsers</MenuItem>
                  {getUniqueBrowsers().map((browser) => (
                    <MenuItem key={browser} value={browser}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getBrowserIcon(browser)}
                        <Typography>{browser}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                placeholder="Search by IP, Browser, or Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.light' }}>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Browser</strong>
                </TableCell>
                <TableCell>
                  <strong>IP Address</strong>
                </TableCell>
                <TableCell>
                  <strong>Date & Time</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Location</strong>
                </TableCell>
                <TableCell>
                  <strong>Device</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Action</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.slice(0, rowsPerPage).map((log) => {
                const { date, time } = formatDate(log.date);
                return (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => handleViewDetails(log)}
                  >
                    <TableCell>
                      <Chip
                        label={`#${log.id}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getBrowserIcon(log.browser)}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {log.browser}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            v{log.browserVersion}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {log.ip}
                        </Typography>
                        <Tooltip title="Copy IP Address">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(log.ip);
                            }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status.toUpperCase()}
                        color={getStatusColor(log.status)}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.location}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getDeviceIcon(log.device)}
                        label={log.device}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(log);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No login history found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or search criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Info */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min(filteredHistory.length, rowsPerPage)} of {filteredHistory.length} entries
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" disabled>
              Previous
            </Button>
            <Button size="small" variant="outlined">
              Next
            </Button>
          </Stack>
        </Box>

        {/* Browser Distribution */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Browser Distribution
          </Typography>
          <Grid container spacing={2}>
            {getUniqueBrowsers().map((browser) => {
              const count = loginHistory.filter((log) => log.browser === browser).length;
              const percentage = (count / totalLogins) * 100;
              return (
                <Grid item xs={12} sm={6} md={3} key={browser}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor:
                            browser === 'Chrome'
                              ? '#4285F4'
                              : browser === 'Firefox'
                              ? '#FF7139'
                              : browser === 'Safari'
                              ? '#000000'
                              : '#0078D7',
                        }}
                      >
                        {getBrowserIcon(browser)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {browser}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} logins ({percentage.toFixed(1)}%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="medium">
                Login Details #{selectedLog.id}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Browser
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getBrowserIcon(selectedLog.browser)}
                      <Typography variant="body1" fontWeight="medium">
                        {selectedLog.browser} {selectedLog.browserVersion}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Device
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedLog.device}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedLog.ip}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(selectedLog.date).date}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(selectedLog.date).time}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedLog.location}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedLog.status.toUpperCase()}
                      color={getStatusColor(selectedLog.status)}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Agent
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {selectedLog.userAgent}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setLoginHistory(loginHistory.filter(log => log.id !== selectedLog.id));
                  handleCloseDetails();
                }}
              >
                Delete This Log
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminLoginHistory;