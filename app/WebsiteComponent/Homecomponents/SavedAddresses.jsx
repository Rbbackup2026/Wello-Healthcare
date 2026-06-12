"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import AccountLayout from "./AccountLayout";
import LoginModal from "./LoginFolder/LoginModal";
import {
  normalizeAddress,
  normalizeAddressList,
  readLocalAddresses,
  writeLocalAddresses,
} from "../../utils/savedAddressStorage";

const BASE_URL = "http://localhost:3000";
const EMPTY_FORM = {
  type: "HOME",
  houseNo: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const userId = user?._id || user?.id;

  const persistAddresses = useCallback(
    async (nextAddresses) => {
      setAddresses(nextAddresses);

      if (!userId) return;

      writeLocalAddresses(userId, nextAddresses);

      try {
        await axios.post(`${BASE_URL}/v1/api/save-saved-addresses`, {
          userId,
          savedAddresses: nextAddresses,
        });
      } catch {
        // Keep local copy when backend route is unavailable.
      }
    },
    [userId]
  );

  const loadAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/v1/api/get-saved-addresses/${userId}`);
      const apiAddresses = normalizeAddressList(res.data.savedAddresses || []);
      if (apiAddresses.length > 0) {
        setAddresses(apiAddresses);
        writeLocalAddresses(userId, apiAddresses);
      } else {
        setAddresses(readLocalAddresses(userId));
      }
    } catch {
      setAddresses(readLocalAddresses(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const storedUser = window.localStorage.getItem("customerUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openAddForm = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (entry) => {
    setEditingId(entry._id);
    setForm({
      type: entry.type || "HOME",
      houseNo: entry.houseNo || "",
      address: entry.address || "",
      city: entry.city || "",
      state: entry.state || "",
      pincode: entry.pincode || "",
    });
    setFormOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    if (!form.address.trim() && !form.houseNo.trim()) {
      toast.warn("Please enter house number or address.");
      return;
    }

    const payload = {
      ...form,
      type: form.type.toUpperCase(),
      _id: editingId || `addr-${Date.now()}`,
    };

    const nextAddresses = editingId
      ? addresses.map((entry) => (entry._id === editingId ? { ...entry, ...payload } : entry))
      : [...addresses, normalizeAddress(payload, addresses.length)];

    await persistAddresses(nextAddresses);
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    toast.success(editingId ? "Address updated." : "Address added.");
  };

  const handleDeleteAddress = async (entry) => {
    if (!window.confirm("Delete this saved address?")) return;

    const nextAddresses = addresses.filter((item) => item._id !== entry._id);
    await persistAddresses(nextAddresses);
    toast.success("Address deleted.");
  };

  return (
    <AccountLayout activePage="addresses">
      <div className="addresses-panel">
        <div className="addresses-panel-header">
          <h1>Manage Addresses</h1>
          <button type="button" className="addresses-add-btn" onClick={openAddForm}>
            <FaPlus aria-hidden="true" />
            Add New Address
          </button>
        </div>

        <div className="addresses-panel-body">
          {loading ? (
            <p className="addresses-empty">Loading your addresses...</p>
          ) : !user ? (
            <div className="addresses-empty-card">
              <p>Please log in to manage your saved addresses.</p>
              <button type="button" className="addresses-add-btn" onClick={() => setLoginOpen(true)}>
                Login
              </button>
            </div>
          ) : addresses.length === 0 ? (
            <div className="addresses-empty-card">
              <h2>No saved addresses</h2>
              <p>Add an address to use it quickly during checkout.</p>
              <button type="button" className="addresses-add-btn" onClick={openAddForm}>
                <FaPlus aria-hidden="true" />
                Add New Address
              </button>
            </div>
          ) : (
            <div className="addresses-list">
              {addresses.map((entry) => (
                <article key={entry._id} className="address-card">
                  <span className="address-card-tag">{entry.type || "HOME"}</span>

                  <button
                    type="button"
                    className="address-card-delete"
                    aria-label="Delete address"
                    onClick={() => handleDeleteAddress(entry)}
                  >
                    <FaTimes />
                  </button>

                  <div className="address-card-fields">
                    <div className="address-card-row">
                      <span className="address-card-label">House No. / Flat :</span>
                      <span className="address-card-value">{entry.houseNo || "-"}</span>
                    </div>
                    <div className="address-card-row">
                      <span className="address-card-label">Address :</span>
                      <span className="address-card-value">
                        {[entry.address, entry.city, entry.state].filter(Boolean).join(", ") || "-"}
                      </span>
                    </div>
                    <div className="address-card-row">
                      <span className="address-card-label">Pincode :</span>
                      <span className="address-card-value">{entry.pincode || "-"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="address-card-edit"
                    aria-label="Edit address"
                    onClick={() => openEditForm(entry)}
                  >
                    <FaEdit />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="address-modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="address-modal" onClick={(event) => event.stopPropagation()}>
            <div className="address-modal-header">
              <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>
              <button
                type="button"
                className="address-modal-close"
                aria-label="Close"
                onClick={() => setFormOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form className="address-modal-form" onSubmit={handleSaveAddress}>
              <label className="address-modal-field">
                <span>Address Type</span>
                <select name="type" value={form.type} onChange={handleFormChange}>
                  <option value="HOME">HOME</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>

              <label className="address-modal-field">
                <span>House No. / Flat</span>
                <input
                  type="text"
                  name="houseNo"
                  value={form.houseNo}
                  onChange={handleFormChange}
                  placeholder="e.g. 454454"
                />
              </label>

              <label className="address-modal-field">
                <span>Address</span>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Street, area, city"
                  required
                />
              </label>

              <div className="address-modal-grid">
                <label className="address-modal-field">
                  <span>City</span>
                  <input type="text" name="city" value={form.city} onChange={handleFormChange} />
                </label>
                <label className="address-modal-field">
                  <span>State</span>
                  <input type="text" name="state" value={form.state} onChange={handleFormChange} />
                </label>
              </div>

              <label className="address-modal-field">
                <span>Pincode</span>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleFormChange}
                  placeholder="122004"
                />
              </label>

              <button type="submit" className="address-modal-submit">
                {editingId ? "Update Address" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </AccountLayout>
  );
};

export default SavedAddresses;
