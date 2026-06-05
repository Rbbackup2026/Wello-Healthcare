"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Stack,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from "@mui/icons-material";

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Sample data
  const samplePages = [
    {
      id: 1,
      title: "Terms & Conditions",
      creationDate: "29-03-25",
      sortOrder: 1,
      status: true,
    },
    {
      id: 2,
      title: "Privacy Policy", 
      creationDate: "29-03-25",
      sortOrder: 2,
      status: true,
    },
    {
      id: 3,
      title: "Cancellation & Return Policy",
      creationDate: "29-03-25", 
      sortOrder: 3,
      status: true,
    },
    {
      id: 4,
      title: "modern-lab",
      creationDate: "29-03-25",
      sortOrder: 4,
      status: false,
    }
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPages(samplePages);
      setLoading(false);
    }, 500);
  };

  const handleStatusToggle = (pageItem) => {
    setPages(pages.map(p => 
      p.id === pageItem.id ? { ...p, status: !p.status } : p
    ));
  };

  const handleDelete = (pageItem) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    setPages(pages.filter(p => p.id !== pageItem.id));
  };

  const handleEdit = (pageItem) => {
    setEditingPage(pageItem);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingPage(null);
  };

  const handleSavePage = (pageData) => {
    if (editingPage) {
      // Update existing page
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, ...pageData } : p));
    } else {
      // Add new page
      const newPage = {
        id: pages.length + 1,
        ...pageData,
        creationDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
      };
      setPages([...pages, newPage]);
    }
    setDialogOpen(false);
    setEditingPage(null);
  };

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const filtered = pages.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Information Pages</Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">ALL PAGES</Typography>
        <Button variant="contained" onClick={handleAddNew} startIcon={<AddIcon />}>
          Add New Page
        </Button>
      </Stack>

      {/* Table */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box mb={2}>
          <TextField
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Page Title</strong></TableCell>
              <TableCell><strong>Creation Date</strong></TableCell>
              <TableCell><strong>Sort Order</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {p.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{p.creationDate}</TableCell>
                    <TableCell>{p.sortOrder}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={p.status}
                            onChange={() => handleStatusToggle(p)}
                            color="success"
                          />
                        }
                        label={p.status ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(p)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(p)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <PageFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        page={editingPage}
        onSave={handleSavePage}
      />
    </Box>
  );
};

// Simple Form Dialog
const PageFormDialog = ({ open, onClose, page, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    sortOrder: '',
    status: true
  });

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        sortOrder: page.sortOrder,
        status: page.status
      });
    } else {
      setFormData({
        title: '',
        sortOrder: '',
        status: true
      });
    }
  }, [page]);

  const handleSubmit = () => {
    onSave({
      ...formData,
      sortOrder: parseInt(formData.sortOrder)
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {page ? 'Edit Page' : 'Add New Page'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Page Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
          />
          
          <TextField
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                color="success"
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {page ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Pages;