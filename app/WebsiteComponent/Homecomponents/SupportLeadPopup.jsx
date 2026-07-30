"use client";

import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaShieldAlt, FaTimes, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { createLead } from "../../utils/leadStorage";
import { METRO_CITIES } from "../../utils/cityApi";
import { useLocation } from "../../Components/MainRoute/LocationContext";

const QUERY_TYPES = [
  { id: "booking", label: "New Booking" },
  { id: "support", label: "Customer Support Query" },
];

const emptyForm = {
  phone: "",
  name: "",
  city: "Gurugram",
  consent: true,
};

const SupportLeadPopup = ({ open, onClose, defaultType = "booking" }) => {
  const { location } = useLocation();
  const [queryType, setQueryType] = useState(defaultType);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setQueryType(defaultType);
    const city = location?.city || "Gurugram";
    const cities = METRO_CITIES.includes(city) ? METRO_CITIES : [city, ...METRO_CITIES];

    let phone = "";
    let name = "";
    try {
      const user = JSON.parse(localStorage.getItem("customerUser") || "null");
      phone = user?.mobileNo || user?.phone || "";
      name = user?.name || "";
    } catch {
      // ignore
    }

    setForm({
      phone,
      name,
      city: cities[0] === city ? city : city || "Gurugram",
      consent: true,
    });
  }, [open, defaultType, location?.city]);

  if (!open) return null;

  const cityOptions = METRO_CITIES.includes(form.city)
    ? METRO_CITIES
    : [form.city, ...METRO_CITIES];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const phone = form.phone.replace(/\D/g, "");
    const name = form.name.trim();

    if (phone.length < 10) {
      toast.warn("Please enter a valid 10 digit mobile number.");
      return;
    }
    if (!name) {
      toast.warn("Please enter your name.");
      return;
    }
    if (!form.consent) {
      toast.warn("Please accept Terms & Conditions.");
      return;
    }

    setSubmitting(true);
    try {
      const isBooking = queryType === "booking";
      const lead = await createLead({
        name,
        phone,
        city: form.city,
        source: "Callback",
        status: "New",
        priority: isBooking ? "High" : "Medium",
        interest: isBooking ? "New Booking" : "Customer Support Query",
        notes: isBooking
          ? "Requested callback for new booking from Support popup"
          : "Requested callback for support query from Support popup",
      });

      if (!lead) {
        toast.error("Could not save your request. Please try again.");
        return;
      }

      toast.success("Request submitted! Our health expert will call you soon.");
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-lead-overlay" role="presentation" onClick={onClose}>
      <div
        className="support-lead-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-lead-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="support-lead-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h2 id="support-lead-title" className="support-lead-title">
          Get Health Tests at Best Price
        </h2>
        <p className="support-lead-subtitle">
          Talk to our Health Expert in 10 Minutes
        </p>

        <div className="support-lead-tabs" role="tablist">
          {QUERY_TYPES.map((type) => {
            const active = queryType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`support-lead-tab${active ? " is-active" : ""}`}
                onClick={() => setQueryType(type.id)}
              >
                <span className="support-lead-tab-icon" aria-hidden="true">
                  {active ? "✓" : ""}
                </span>
                {type.label}
              </button>
            );
          })}
        </div>

        <form className="support-lead-form" onSubmit={handleSubmit}>
          <label className="support-lead-field">
            <FaPhoneAlt className="support-lead-field-icon" aria-hidden="true" />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter Mobile Number *"
              maxLength={10}
              inputMode="numeric"
              required
            />
          </label>

          <label className="support-lead-field">
            <FaUser className="support-lead-field-icon" aria-hidden="true" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter Your Name *"
              required
            />
          </label>

          <label className="support-lead-field support-lead-field--select">
            <FaMapMarkerAlt className="support-lead-field-icon" aria-hidden="true" />
            <select name="city" value={form.city} onChange={handleChange}>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="support-lead-consent">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
            />
            <span>
              You hereby affirm &amp; authorise Wello to process the personal data as
              per the <a href="/help-feedback">T&amp;C</a>.
            </span>
          </label>

          <button type="submit" className="support-lead-submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Get a Call Back"}
          </button>
        </form>

        <p className="support-lead-trust">
          <FaShieldAlt aria-hidden="true" />
          Trusted by 1 Crore+ Customers
        </p>
      </div>
    </div>
  );
};

export default SupportLeadPopup;
