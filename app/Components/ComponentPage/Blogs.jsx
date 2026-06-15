"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  Pagination,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "../../lib/routerCompat";
import axios from "axios";
import BlogFormDialog from "../DailogForm/BlogFormDialog";
import { API_BASE_URL, toAssetUrl } from "../../utils/api";

const API_BASE = API_BASE_URL;

const normalizeFormValue = (value) => {
  if (value === null || value === undefined || value === "null") return "";
  return value;
};

const getBlogImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";
  return toAssetUrl(image);
};

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const rowsPerPage = 5;

  // GET BLOGS
  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/blogget`);
      setBlogs(res.data);
    } catch (err) {
      console.log("GET ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter + pagination
  const filteredBlogs = blogs.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filteredBlogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // ADD / EDIT
  const handleAdd = () => {
    setEditData(null);
    setOpenForm(true);
  };
  const handleEdit = (blog) => {
    setEditData(blog);
    setOpenForm(true);
  };

  // SAVE BLOG (parent handles API call)
  const handleSave = async (data, file) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "tags") formData.append("tags", JSON.stringify(data.tags || []));
        else if (key === "faqs") formData.append("faqs", JSON.stringify(data.faqs || []));
        else if (key === "sortOrder") {
          const sortOrder = normalizeFormValue(data.sortOrder);
          formData.append("sortOrder", sortOrder === "" ? "0" : sortOrder);
        }
        else formData.append(key, normalizeFormValue(data[key]));
      });
      if (file) formData.append("image", file);

      if (editData) {
        await axios.put(`${API_BASE}/blogput/${editData._id}`, formData);
      } else {
        await axios.post(`${API_BASE}/blogpost`, formData);
      }

      await fetchBlogs(); // refresh table
      setOpenForm(false);
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  // DELETE BLOG
  const handleDelete = async (blog) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await axios.delete(`${API_BASE}/blogdelete/${blog._id}`);
      fetchBlogs();
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  // TOGGLE STATUS
  const handleToggleStatus = async (blog) => {
    try {
      await axios.put(`${API_BASE}/blogtoggle-status/${blog._id}`);
      fetchBlogs();
    } catch (err) {
      console.log("TOGGLE ERROR:", err);
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ bgcolor: "#E3F2FD", "&:hover": { bgcolor: "#BBDEFB" } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
          Manage Blogs
        </Typography>
        <Button
          variant="contained"
          sx={{ borderRadius: "30px", px: 3 }}
          onClick={handleAdd}
        >
          Add New Blog
        </Button>
      </Stack>

      {/* Search */}
      <Box mb={2}>
        <TextField
          label="Search Blog..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F8F9FA" }}>
              <TableCell>ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Sort</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No blogs found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((b, index) => (
                <TableRow key={b._id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Avatar
                      src={getBlogImageUrl(b.image)}
                      variant="rounded"
                      sx={{ width: 55, height: 45, borderRadius: "6px" }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography fontWeight={600}>{b.name}</Typography>
                    <Typography fontSize="13px" color="text.secondary">
                      {b.intro}
                    </Typography>
                  </TableCell>
                  <TableCell>{b.category}</TableCell>
                  <TableCell>{b.sortOrder}</TableCell>
                  <TableCell>
                    <Switch
                      checked={b.status === "active"}
                      onChange={() => handleToggleStatus(b)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: "#1976D2",
                          color: "white",
                          "&:hover": { bgcolor: "#125EA7" },
                        }}
                        onClick={() => handleEdit(b)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: "red",
                          color: "white",
                          "&:hover": { bgcolor: "#C30000" },
                        }}
                        onClick={() => handleDelete(b)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack mt={3} alignItems="center">
        <Pagination
          count={Math.ceil(filteredBlogs.length / rowsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Stack>

      {/* Dialog */}
      <BlogFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        editData={editData}
      />
    </Box>
  );
};

export default Blogs;
