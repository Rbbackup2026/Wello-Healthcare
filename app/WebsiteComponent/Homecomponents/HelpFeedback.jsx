"use client";

import React, { useEffect, useState } from "react";
import { FaEnvelope, FaFacebookF, FaMapMarkerAlt, FaPhoneAlt, FaTwitter } from "react-icons/fa";
import { toast } from "react-toastify";
import { createLead } from "../../utils/leadStorage";
import AccountLayout from "./AccountLayout";

const SUPPORT_PHONE = "8448158188";
const SUPPORT_PHONE_DISPLAY = "+91-8448158188";
const SUPPORT_EMAIL = "support@wellohealthcare.com";
const HEAD_OFFICE =
  "2nd floor Capital Cyberscape, Sector 59, Gurugram, Haryana 122102";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  city: "",
  message: "",
};

const HelpFeedback = () => {
  const [feedback, setFeedback] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem("customerUser");
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      setFeedback((previous) => ({
        ...previous,
        name: previous.name || user?.name || "",
        email: previous.email || user?.email || "",
        phone: previous.phone || user?.mobileNo || user?.phone || "",
        city: previous.city || user?.city || "Gurugram",
      }));
    } catch {
      // Ignore invalid stored user data.
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback((previous) => ({ ...previous, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!feedback.name.trim() || !feedback.email.trim() || !feedback.phone.trim()) {
      toast.warn("Please fill all required fields.");
      return;
    }

    if (!feedback.message.trim()) {
      toast.warn("Please write your query.");
      return;
    }

    const phoneDigits = feedback.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast.warn("Please enter a valid phone number.");
      return;
    }

    const lead = await createLead({
      name: feedback.name.trim(),
      phone: phoneDigits,
      email: feedback.email.trim(),
      city: feedback.city.trim(),
      source: "Help & Feedback",
      status: "New",
      priority: "Medium",
      interest: "Support / Query",
      notes: feedback.message.trim(),
    });

    if (!lead) {
      toast.error("Could not save your query. Please try again.");
      setSubmitted(false);
      return;
    }

    window.dispatchEvent(new Event("admin-leads-updated"));
    toast.success("Submitted! Query saved to Leads database.");
    setSubmitted(true);
    setFeedback((previous) => ({
      ...EMPTY_FORM,
      name: previous.name,
      email: previous.email,
      phone: previous.phone,
      city: previous.city,
    }));
  };

  return (
    <AccountLayout activePage="help">
      <div className="help-feedback-panel">
        <header className="help-feedback-header">
          <h1 className="help-feedback-title">Help &amp; Feedback</h1>
        </header>

        <div className="help-feedback-layout">
          <section className="help-feedback-info-card">
            <div className="help-feedback-info-icon" aria-hidden="true">
              <FaEnvelope />
            </div>
            <h2 className="help-feedback-info-title">Email Us</h2>
            <p className="help-feedback-info-text">
              For any issues related to service, sample collection, bookings, or reports please
              reach us here.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="help-feedback-info-link">
              {SUPPORT_EMAIL}
            </a>
            <a href={`tel:+91${SUPPORT_PHONE}`} className="help-feedback-info-phone">
              <FaPhoneAlt aria-hidden="true" />
              {SUPPORT_PHONE_DISPLAY}
            </a>
            <div className="help-feedback-social">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
            </div>
          </section>

          <section className="help-feedback-form-wrap">
            <h2 className="help-feedback-form-heading">
              Fill the Form Below and Our Executives Will Contact You Soon!
            </h2>
            <form className="help-feedback-form" onSubmit={handleSubmit}>
              {submitted ? (
                <p
                  style={{
                    margin: "0 0 12px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#047857",
                    fontWeight: 600,
                  }}
                >
                  Thank you! Your query is saved. Check Admin → CRM / Leads.
                </p>
              ) : null}
              <div className="help-feedback-form-row">
                <label className="help-feedback-field">
                  <span>Full Name*</span>
                  <input
                    type="text"
                    name="name"
                    value={feedback.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="help-feedback-field">
                  <span>Email*</span>
                  <input
                    type="email"
                    name="email"
                    value={feedback.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="help-feedback-form-row">
                <label className="help-feedback-field">
                  <span>Phone Number*</span>
                  <input
                    type="tel"
                    name="phone"
                    value={feedback.phone}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="help-feedback-field">
                  <span>City*</span>
                  <input
                    type="text"
                    name="city"
                    value={feedback.city}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label className="help-feedback-field help-feedback-field--full">
                <textarea
                  name="message"
                  value={feedback.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Write your query"
                  required
                />
              </label>

              <button type="submit" className="help-feedback-submit">
                Submit
              </button>
            </form>

            <div className="help-feedback-office-divider" />

            <div className="help-feedback-office-footer">
              <div className="help-feedback-office-heading">
                <FaMapMarkerAlt className="help-feedback-office-icon" aria-hidden="true" />
                <h3 className="help-feedback-office-title">Head Office</h3>
              </div>
              <p className="help-feedback-office-address">{HEAD_OFFICE}</p>
            </div>
          </section>
        </div>
      </div>
    </AccountLayout>
  );
};

export default HelpFeedback;
