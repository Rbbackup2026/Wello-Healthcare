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
  TablePagination,
  TextField,
  Button,
  IconButton,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const ManageNotification = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  // Mock data - replace with actual data
  const notifications = [];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = notifications.map((n) => n.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectClick = (event, id) => {
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
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        MANAGE NOTIFICATION / NOTIFICATION
      </Typography>

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Notification
        </Typography>

        {/* Controls Row */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="body1">
              ALL NOTIFICATION
            </Typography>
          </Grid>
          <Grid item sx={{ ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Items/page</InputLabel>
              <Select
                value={rowsPerPage}
                label="Items/page"
                onChange={handleChangeRowsPerPage}
              >
                <MenuItem value={10}>10°</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              ADD NEW
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={selected.length === 0}
            >
              DELETE
            </Button>
          </Grid>
          <Grid item sx={{ ml: 'auto' }}>
            <TextField
              placeholder="Search..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < notifications.length}
                    checked={notifications.length > 0 && selected.length === notifications.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Message</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.length > 0 ? (
                notifications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((notification) => {
                    const isItemSelected = isSelected(notification.id);
                    return (
                      <TableRow
                        key={notification.id}
                        hover
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={(event) => handleSelectClick(event, notification.id)}
                          />
                        </TableCell>
                        <TableCell>{notification.id}</TableCell>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>
                          {notification.image ? (
                            <Box
                              component="img"
                              src={notification.image}
                              alt="Notification"
                              sx={{ width: 50, height: 50, objectFit: 'cover' }}
                            />
                          ) : (
                            'No image'
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography noWrap>
                            {notification.message}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View">
                            <IconButton size="small" sx={{ mr: 1 }}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No data available in table
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Grid container alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Showing {notifications.length === 0 ? 0 : page * rowsPerPage + 1} to{' '}
              {Math.min((page + 1) * rowsPerPage, notifications.length)} of{' '}
              {notifications.length} entries
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={page >= Math.ceil(notifications.length / rowsPerPage) - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ManageNotification;