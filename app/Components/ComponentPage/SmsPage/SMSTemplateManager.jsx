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
  Chip,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const SMS_TEMPLATES = [
  {
    id: 4,
    name: 'order_cancel',
    smsText: 'Dear (name), Your Booking (order_ID) has cancelled, please contact our customer 01-4377450 or drop a message on our Whatsapp number: 9801081735 or Visit Website www.mdcnepal.com',
    status: 'active'
  },
  {
    id: 3,
    name: 'confirm_booking',
    smsText: 'Dear (name), Your Booking has confirmed Your Booking ID is (order_ID). For more enquiry, please contact our customer 01-4377450 or drop a message on our Whatsapp number: 9801081735 or Visit Website www.mdcnepal.com',
    status: 'active'
  },
  {
    id: 2,
    name: 'Google Review',
    smsText: 'Dear (#var#),your report is ready. ID (#var#) & PW (#var#). Visit www.mdcnepal.com to download your report. If you are happy with our services, please rate us at https://goo.gl/maps/AsGNKTLXhszjcwag6 MDCPL',
    status: 'inactive'
  },
  {
    id: 1,
    name: 'OTP',
    smsText: 'Dear (name), Welcome to MODERN! (otp) is your One Time Password (OTP) for login into your account. ---',
    status: 'active'
  }
];

const SMSTemplateManager = () => {
  const [templates, setTemplates] = useState(SMS_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.smsText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditTemplate = (id) => {
    console.log('Edit template:', id);
    // Implement edit logic
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(template => template.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setTemplates(templates.map(template => 
      template.id === id 
        ? { ...template, status: template.status === 'active' ? 'inactive' : 'active' }
        : template
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="SMS SETTING / SMS TEMPLATE"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
        />
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="medium">
              SMS Template
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredTemplates.length} templates found
            </Typography>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" align="right">
                10 Items/page
              </Typography>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SMS Text</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((template) => (
                    <TableRow key={template.id} hover>
                      <TableCell>{template.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {template.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 500 }}>
                        <Typography variant="body2" sx={{ 
                          wordBreak: 'break-word',
                          color: 'text.secondary'
                        }}>
                          {template.smsText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={template.status === 'active' ? 'Active' : 'Inactive'}
                          color={template.status === 'active' ? 'success' : 'default'}
                          size="small"
                          icon={template.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                          onClick={() => handleToggleStatus(template.id)}
                          clickable
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditTemplate(template.id)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteTemplate(template.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTemplates.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Items per page:"
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> Placeholders like (name), (order_ID), (otp), (#var#) will be replaced dynamically when sending SMS.
        </Typography>
      </Box>
    </Box>
  );
};

export default SMSTemplateManager;