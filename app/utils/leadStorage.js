import axios from "axios";
import { API_BASE_URL } from "./api";

const LEADS_STORAGE_KEY = "adminLeadRecords";
const LEADS_API = `${API_BASE_URL}/leads`;

/** CRM pipeline stages */
export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Follow-up",
  "Converted",
  "Lost",
];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"];

export const LEAD_SOURCES = [
  "Manual",
  "Call",
  "WhatsApp",
  "Walk-in",
  "Help & Feedback",
  "Callback",
  "Referral",
  "Website Form",
  "Other",
];

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

const makeId = () => `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildActivity = (type, message) => ({
  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  type,
  message,
  createdAt: new Date().toISOString(),
});

const normalizeLead = (lead = {}) => ({
  assignedTo: "",
  followUpDate: "",
  interest: "",
  ...lead,
  id: lead.id || lead._id || makeId(),
  phone: normalizePhone(lead.phone),
  status: LEAD_STATUSES.includes(lead.status) ? lead.status : "New",
  priority: LEAD_PRIORITIES.includes(lead.priority) ? lead.priority : "Medium",
  activities: Array.isArray(lead.activities) ? lead.activities : [],
});

export const readLocalLeads = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLead);
  } catch (error) {
    console.error("Failed to parse lead records", error);
    return [];
  }
};

export const writeLocalLeads = (leads) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event("admin-leads-updated"));
};

/** @deprecated use fetchLeads */
export const readLeads = readLocalLeads;
/** @deprecated use API helpers */
export const writeLeads = writeLocalLeads;

export const fetchLeads = async ({ status, search } = {}) => {
  try {
    const response = await axios.get(LEADS_API, {
      params: {
        ...(status && status !== "All" ? { status } : {}),
        ...(search ? { search } : {}),
      },
    });

    if (response.data?.success && Array.isArray(response.data.data)) {
      const leads = response.data.data.map(normalizeLead);
      writeLocalLeads(leads);
      return leads;
    }
  } catch (error) {
    console.warn("Lead API unavailable, using local fallback", error?.message || error);
  }

  return readLocalLeads();
};

export const createLead = async (payload = {}) => {
  const body = {
    name: String(payload.name || "").trim(),
    phone: normalizePhone(payload.phone),
    email: String(payload.email || "").trim(),
    city: String(payload.city || "").trim(),
    source: payload.source || "Manual",
    status: payload.status || "New",
    priority: payload.priority || "Medium",
    assignedTo: String(payload.assignedTo || "").trim(),
    followUpDate: payload.followUpDate || "",
    interest: String(payload.interest || "").trim(),
    notes: String(payload.notes || "").trim(),
  };

  if (!body.name || !body.phone) return null;

  try {
    const response = await axios.post(LEADS_API, body);
    if (response.data?.success && response.data.data) {
      const lead = normalizeLead(response.data.data);
      const existing = readLocalLeads().filter((item) => item.id !== lead.id);
      writeLocalLeads([lead, ...existing]);
      return lead;
    }
  } catch (error) {
    console.warn("Lead create API failed, saving locally", error?.message || error);
  }

  // Local fallback (backend offline)
  const now = new Date().toISOString();
  const activities = [buildActivity("created", `Lead created from ${body.source}`)];
  if (body.notes) activities.push(buildActivity("note", body.notes));

  const lead = normalizeLead({
    ...body,
    id: makeId(),
    activities,
    createdAt: now,
    updatedAt: now,
  });

  const withoutOpenDupes = readLocalLeads().filter((item) => {
    const samePhone = normalizePhone(item.phone) === body.phone;
    const isClosed = item.status === "Converted" || item.status === "Lost";
    return !(samePhone && !isClosed);
  });

  writeLocalLeads([lead, ...withoutOpenDupes].slice(0, 500));
  return lead;
};

/** @deprecated use createLead */
export const saveLead = createLead;

export const updateLead = async (leadId, patch = {}) => {
  if (!leadId) return null;

  try {
    const response = await axios.put(`${LEADS_API}/${leadId}`, patch);
    if (response.data?.success && response.data.data) {
      const lead = normalizeLead(response.data.data);
      const list = readLocalLeads().map((item) => (item.id === lead.id ? lead : item));
      writeLocalLeads(list);
      return lead;
    }
  } catch (error) {
    console.warn("Lead update API failed, updating locally", error?.message || error);
  }

  const existing = readLocalLeads();
  const index = existing.findIndex((item) => item.id === leadId);
  if (index < 0) return null;

  const prev = existing[index];
  const now = new Date().toISOString();
  const next = normalizeLead({
    ...prev,
    ...patch,
    phone: normalizePhone(patch.phone ?? prev.phone),
    updatedAt: now,
  });

  const activities = [...(prev.activities || [])];
  if (patch.status && patch.status !== prev.status) {
    activities.unshift(buildActivity("status", `Status changed: ${prev.status} → ${patch.status}`));
  }
  if (patch.assignedTo !== undefined && patch.assignedTo !== prev.assignedTo) {
    activities.unshift(
      buildActivity(
        "assign",
        patch.assignedTo ? `Assigned to ${patch.assignedTo}` : "Assignment cleared"
      )
    );
  }
  if (patch.followUpDate !== undefined && patch.followUpDate !== prev.followUpDate) {
    activities.unshift(
      buildActivity(
        "followup",
        patch.followUpDate ? `Follow-up set for ${patch.followUpDate}` : "Follow-up cleared"
      )
    );
  }
  next.activities = activities.slice(0, 100);

  const list = [...existing];
  list[index] = next;
  writeLocalLeads(list);
  return next;
};

export const addLeadActivity = async (leadId, message, type = "note") => {
  const text = String(message || "").trim();
  if (!text || !leadId) return null;

  try {
    const response = await axios.post(`${LEADS_API}/${leadId}/activities`, {
      message: text,
      type,
    });
    if (response.data?.success && response.data.data) {
      const lead = normalizeLead(response.data.data);
      const list = readLocalLeads().map((item) => (item.id === lead.id ? lead : item));
      writeLocalLeads(list);
      return lead;
    }
  } catch (error) {
    console.warn("Lead activity API failed, saving locally", error?.message || error);
  }

  const existing = readLocalLeads();
  const index = existing.findIndex((item) => item.id === leadId);
  if (index < 0) return null;

  const lead = existing[index];
  const activity = buildActivity(type, text);
  const next = {
    ...lead,
    notes: type === "note" ? text : lead.notes,
    activities: [activity, ...(lead.activities || [])].slice(0, 100),
    updatedAt: new Date().toISOString(),
  };

  const list = [...existing];
  list[index] = next;
  writeLocalLeads(list);
  return next;
};

export const deleteLead = async (leadId) => {
  if (!leadId) return readLocalLeads();

  try {
    await axios.delete(`${LEADS_API}/${leadId}`);
  } catch (error) {
    console.warn("Lead delete API failed, deleting locally", error?.message || error);
  }

  const next = readLocalLeads().filter((item) => item.id !== leadId);
  writeLocalLeads(next);
  return next;
};

export const convertLeadByPhone = async (phone, note = "") => {
  const trimmedPhone = normalizePhone(phone);
  if (!trimmedPhone) return null;

  try {
    const response = await axios.post(`${LEADS_API}/convert-by-phone`, {
      phone: trimmedPhone,
      notes: note,
    });
    if (response.data?.success) {
      if (response.data.data) {
        const lead = normalizeLead(response.data.data);
        const list = readLocalLeads().map((item) => (item.id === lead.id ? lead : item));
        writeLocalLeads(list);
        return lead;
      }
      return null;
    }
  } catch (error) {
    console.warn("Lead convert API failed, using local fallback", error?.message || error);
  }

  const existing = readLocalLeads();
  const index = existing.findIndex((item) => {
    const samePhone = normalizePhone(item.phone) === trimmedPhone;
    return samePhone && item.status !== "Converted" && item.status !== "Lost";
  });

  if (index < 0) return null;

  const lead = existing[index];
  const message = note || "Lead converted after order booking";
  const next = {
    ...lead,
    status: "Converted",
    activities: [
      buildActivity("status", `Status changed: ${lead.status} → Converted`),
      buildActivity("converted", message),
      ...(lead.activities || []),
    ].slice(0, 100),
    updatedAt: new Date().toISOString(),
  };

  const list = [...existing];
  list[index] = next;
  writeLocalLeads(list);
  return next;
};

export { LEADS_STORAGE_KEY };
