"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Paper,
  Button,
  Dialog,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "../../lib/routerCompat";
import axios from "axios";
import DepartmentFormDialog from "../DailogForm/DepartmentFormDialog";

const Department = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:3000/v1/api/get-departments");
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await axios.delete(`http://localhost:3000/v1/api/delete-department/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (department) => {
    try {
      await axios.put(`http://localhost:3000/v1/api/update-department/${department._id}`, {
        ...department,
        status: !department.status,
      });
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <IconButton onClick={() => navigate("/admin")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Department Management</Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => { setEditData(null); setOpenDialog(true); }}
        >
          + Add New
        </Button>
      </Stack>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(d => (
              <TableRow key={d._id}>
                <TableCell>{d._id}</TableCell>
                <TableCell>
                  <Avatar
                    src={`http://localhost:3000${d.image}`}
                    variant="square"
                  />
                </TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={d.status}
                    color="primary"
                    onChange={() => handleStatusToggle(d)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => { setEditData(d); setOpenDialog(true); }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(d._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DepartmentFormDialog
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          initialData={editData}
          fetchDepartments={fetchDepartments}
        />
      </Dialog>
    </Box>
  );
};

export default Department;
