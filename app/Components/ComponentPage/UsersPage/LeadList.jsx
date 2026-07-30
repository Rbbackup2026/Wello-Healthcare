"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "../../../lib/routerCompat";
import { toast } from "react-toastify";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  addLeadActivity,
  createLead,
  deleteLead,
  fetchLeads,
  updateLead,
} from "../../../utils/leadStorage";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  source: "Call",
  status: "New",
  priority: "Medium",
  assignedTo: "",
  followUpDate: "",
  interest: "",
  notes: "",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatusColor = (status) => {
  switch (status) {
    case "New":
      return "warning";
    case "Contacted":
      return "info";
    case "Qualified":
      return "primary";
    case "Follow-up":
      return "secondary";
    case "Converted":
      return "success";
    case "Lost":
      return "error";
    default:
      return "default";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "error";
    case "Medium":
      return "warning";
    case "Low":
      return "default";
    default:
      return "default";
  }
};

const LeadList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [activityText, setActivityText] = useState("");
  const [loading, setLoading] = useState(true);

  const syncLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncLeads();
    const onUpdate = () => {
      syncLeads();
    };
    window.addEventListener("storage", onUpdate);
    window.addEventListener("admin-leads-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("admin-leads-updated", onUpdate);
    };
  }, []);

  const stageCounts = useMemo(() => {
    const counts = { All: leads.length };
    LEAD_STATUSES.forEach((status) => {
      counts[status] = leads.filter((lead) => lead.status === status).length;
    });
    return counts;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads
      .filter((lead) => {
        const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
        const haystack = [
          lead.name,
          lead.phone,
          lead.email,
          lead.city,
          lead.source,
          lead.assignedTo,
          lead.interest,
          lead.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesStatus && (!term || haystack.includes(term));
      })
      .sort((a, b) => {
        const aFollow = a.followUpDate ? new Date(a.followUpDate).getTime() : Infinity;
        const bFollow = b.followUpDate ? new Date(b.followUpDate).getTime() : Infinity;
        if (aFollow !== bFollow) return aFollow - bFollow;
        return (
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
        );
      });
  }, [leads, search, statusFilter]);

  const paginatedLeads = filteredLeads.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const openAddDialog = () => {
    setEditingLead(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      city: lead.city || "",
      source: lead.source || "Call",
      status: lead.status || "New",
      priority: lead.priority || "Medium",
      assignedTo: lead.assignedTo || "",
      followUpDate: lead.followUpDate || "",
      interest: lead.interest || "",
      notes: lead.notes || "",
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSaveLead = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name) {
      toast.error("Lead name is required");
      return;
    }
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    if (editingLead) {
      await updateLead(editingLead.id, {
        name,
        phone,
        email: form.email.trim(),
        city: form.city.trim(),
        source: form.source,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo.trim(),
        followUpDate: form.followUpDate,
        interest: form.interest.trim(),
        notes: form.notes.trim(),
      });
      toast.success("Lead updated");
    } else {
      const created = await createLead({
        name,
        phone,
        email: form.email.trim(),
        city: form.city.trim(),
        source: form.source,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo.trim(),
        followUpDate: form.followUpDate,
        interest: form.interest.trim(),
        notes: form.notes.trim(),
      });
      if (!created) {
        toast.error("Could not create lead");
        return;
      }
      toast.success("Lead saved to database");
    }

    await syncLeads();
    setDialogOpen(false);
    setEditingLead(null);
    setForm(emptyForm);
  };

  const handleDeleteLead = async () => {
    if (!deleteTarget) return;
    await deleteLead(deleteTarget.id);
    await syncLeads();
    setDeleteTarget(null);
    if (viewLead?.id === deleteTarget.id) setViewLead(null);
    toast.success("Lead deleted");
  };

  const handleQuickStatus = async (lead, status) => {
    const updated = await updateLead(lead.id, { status });
    await syncLeads();
    if (viewLead?.id === lead.id) setViewLead(updated);
    toast.success(`Moved to ${status}`);
  };

  const handleAddActivity = async () => {
    if (!viewLead || !activityText.trim()) return;
    const updated = await addLeadActivity(viewLead.id, activityText.trim(), "note");
    setActivityText("");
    await syncLeads();
    setViewLead(updated);
    toast.success("Activity logged");
  };

  return (
    <Box p={3} bgcolor="#f5f6fa" minHeight="100vh">
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="caption" color="text.secondary">
            CRM / LEADS
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Lead Pipeline
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        mb={2}
        flexWrap="wrap"
        useFlexGap
      >
        {["All", ...LEAD_STATUSES].map((status) => (
          <Paper
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(0);
            }}
            sx={{
              px: 2,
              py: 1.25,
              minWidth: 110,
              cursor: "pointer",
              border: statusFilter === status ? "2px solid #1976d2" : "1px solid #e5e7eb",
              bgcolor: statusFilter === status ? "rgba(25,118,210,0.06)" : "white",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {status}
            </Typography>
            <Typography fontWeight={700}>{stageCounts[status] || 0}</Typography>
          </Paper>
        ))}
      </Stack>

      <Paper sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={2}
        >
          <Typography fontWeight={600}>
            {loading
              ? "Loading leads..."
              : `${statusFilter === "All" ? "All Leads" : statusFilter} (${filteredLeads.length})`}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Search name, phone, owner..."
              sx={{ minWidth: { xs: "100%", sm: 260 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ whiteSpace: "nowrap" }}
            >
              Add Lead
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Lead</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Interest</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Follow-up</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{lead.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lead.phone}
                      </Typography>
                      {lead.email ? (
                        <Typography variant="caption" color="primary">
                          {lead.email}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{lead.interest || lead.city || "-"}</TableCell>
                    <TableCell>
                      <Chip label={lead.source || "-"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={lead.status || "New"}
                        onChange={(event) => handleQuickStatus(lead, event.target.value)}
                        sx={{ minWidth: 120, fontSize: "0.8rem" }}
                      >
                        {LEAD_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.priority || "Medium"}
                        size="small"
                        color={getPriorityColor(lead.priority)}
                      />
                    </TableCell>
                    <TableCell>{lead.assignedTo || "Unassigned"}</TableCell>
                    <TableCell>{formatDate(lead.followUpDate)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setViewLead(lead);
                          setActivityText("");
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => openEditDialog(lead)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(lead)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" mb={1}>
                      No leads in this stage.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add manually, or capture from Help &amp; Feedback / Callback forms.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredLeads.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      {/* Add / Edit Lead */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingLead ? "Edit Lead" : "Add Lead"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Name"
                value={form.name}
                onChange={handleFormChange("name")}
                required
                fullWidth
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={handleFormChange("phone")}
                required
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Email"
                value={form.email}
                onChange={handleFormChange("email")}
                fullWidth
              />
              <TextField
                label="City"
                value={form.city}
                onChange={handleFormChange("city")}
                fullWidth
              />
            </Stack>
            <TextField
              label="Interest / Requirement"
              value={form.interest}
              onChange={handleFormChange("interest")}
              placeholder="e.g. Full body checkup, Home collection"
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select label="Source" value={form.source} onChange={handleFormChange("source")}>
                  {LEAD_SOURCES.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select label="Stage" value={form.status} onChange={handleFormChange("status")}>
                  {LEAD_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={handleFormChange("priority")}
                >
                  {LEAD_PRIORITIES.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Assigned To"
                value={form.assignedTo}
                onChange={handleFormChange("assignedTo")}
                placeholder="Sales executive name"
                fullWidth
              />
              <TextField
                label="Follow-up Date"
                type="date"
                value={form.followUpDate}
                onChange={handleFormChange("followUpDate")}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={handleFormChange("notes")}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLead}>
            {editingLead ? "Update Lead" : "Save Lead"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lead detail / activity timeline */}
      <Dialog
        open={Boolean(viewLead)}
        onClose={() => setViewLead(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Lead Details</DialogTitle>
        <DialogContent>
          {viewLead ? (
            <Stack spacing={2} mt={0.5}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {viewLead.name}
                </Typography>
                <Typography color="text.secondary">
                  {viewLead.phone}
                  {viewLead.email ? ` · ${viewLead.email}` : ""}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={viewLead.status} color={getStatusColor(viewLead.status)} size="small" />
                <Chip
                  label={viewLead.priority || "Medium"}
                  color={getPriorityColor(viewLead.priority)}
                  size="small"
                />
                <Chip label={viewLead.source || "-"} size="small" variant="outlined" />
              </Stack>

              <Typography variant="body2">
                <strong>Interest:</strong> {viewLead.interest || "-"}
              </Typography>
              <Typography variant="body2">
                <strong>Owner:</strong> {viewLead.assignedTo || "Unassigned"}
              </Typography>
              <Typography variant="body2">
                <strong>Follow-up:</strong> {formatDate(viewLead.followUpDate)}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {formatDateTime(viewLead.createdAt)}
              </Typography>

              <Divider />

              <Typography fontWeight={600}>Log activity</Typography>
              <TextField
                placeholder="Call done / WhatsApp sent / Quote shared..."
                value={activityText}
                onChange={(event) => setActivityText(event.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <Button variant="outlined" onClick={handleAddActivity} disabled={!activityText.trim()}>
                Add Note
              </Button>

              <Tabs value={0}>
                <Tab label="Activity Timeline" />
              </Tabs>
              <Stack spacing={1.25} maxHeight={240} overflow="auto">
                {(viewLead.activities || []).length > 0 ? (
                  (viewLead.activities || []).map((activity) => (
                    <Paper key={activity.id} variant="outlined" sx={{ p: 1.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(activity.createdAt)} · {activity.type}
                      </Typography>
                      <Typography variant="body2">{activity.message}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No activities yet.
                  </Typography>
                )}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLead(null)}>Close</Button>
          {viewLead ? (
            <Button
              variant="contained"
              onClick={() => {
                openEditDialog(viewLead);
                setViewLead(null);
              }}
            >
              Edit Lead
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <Typography>
            Delete lead <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteLead}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadList;
