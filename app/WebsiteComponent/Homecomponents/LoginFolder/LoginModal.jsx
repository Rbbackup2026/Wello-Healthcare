import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  clearCustomerCheckoutState,
  dispatchCustomerAuthChanged,
  getCustomerIdentity,
} from "../../../utils/customerSession";
import { API_BASE_URL } from "../../../utils/api";

const LoginModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState("email"); // 'email', 'otp', or 'profile'
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // ✅ NEW: Show success message after profile update (without closing modal)
  const [profileUpdated, setProfileUpdated] = useState(false);

  useEffect(() => {
    if (open) {
      const storedUser = localStorage.getItem("customerUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setEmail(user.email || "");
        setName(user.name || "");
        setMobileNo(user.mobileNo || "");
        setDob(user.dob || "");
        setAge(user.age || "");
        setAddress(user.address || "");
        setGender(user.gender || "");
        setStep("profile");
        setIsEditing(false);
      }
    } else {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setEmail("");
    setOtp("");
    setName("");
    setMobileNo("");
    setDob("");
    setAddress("");
    setAge("");
    setGender("");
    setError("");
    setSuccess(false);
    setProfileUpdated(false);
    setStep("email");
    setLoading(false);
    setIsEditing(false);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (error) setError("");
  };

  const handleDobChange = (event) => {
    const selectedDob = event.target.value;
    setDob(selectedDob);
    if (selectedDob) {
      setAge(calculateAge(selectedDob));
    }
  };

  const handleLogin = async () => {
    // ================= EMAIL STEP =================
    if (step === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/request-otp`,
          { email }
        );

        if (res.data.success) {
          setStep("otp");
          setError("");
        } else {
          setError(res.data.message || res.data.msg || "Failed to send OTP");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            "Failed to send OTP. Please try again."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // ================= OTP STEP =================
    if (step === "otp") {
      if (otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      setLoading(true);

      try {
        const res = await axios.post(
          `${API_BASE_URL}/verify-otp`,
          { email, otp }
        );

        if (res.data.success) {
          const u = res.data.user;
          if (u && u.name) {
            // User already registered - sync and close modal with success
            const customerUser = {
              _id: u._id || u.id,
              email,
              name: u.name,
              mobileNo: u.mobileNo,
              dob: u.dob,
              age: u.age,
              address: u.address,
              gender: u.gender,
              displayPhone: u.name || email,
              loginTime: new Date().toISOString(),
            };
            syncAuthData(customerUser);
            // ✅ Fill state with fetched user data
            setName(u.name || "");
            setMobileNo(u.mobileNo || "");
            setDob(u.dob || "");
            setAge(u.age || "");
            setAddress(u.address || "");
            setGender(u.gender || "");
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              onClose();
            }, 1500);
          } else {
            // New user - go to profile editing
            setStep("profile");
            setIsEditing(true);
          }
          setError("");
        } else {
          setError(
            res.data.message || res.data.msg || "Invalid or expired OTP"
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            "OTP verification failed"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // ================= PROFILE STEP =================
    if (step === "profile") {
      if (!isEditing) {
        setIsEditing(true);
        return;
      }

      if (!name || !mobileNo || !address) {
        setError("Please fill in your Name, Mobile Number and Address.");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/update-profile`,
          {
            email,
            name,
            mobileNo,
            dob,
            age,
            address,
            gender,
          }
        );

        if (res.data.success) {
          const u = res.data.user;
          completeLogin(u);
        } else {
          setError(
            res.data.message ||
              res.data.msg ||
              "Failed to update profile"
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            "An error occurred while saving profile."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const syncAuthData = (user) => {
    const previousUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    );
    const previousIdentity = getCustomerIdentity(previousUser);
    const currentIdentity = getCustomerIdentity(user);

    if (previousIdentity !== currentIdentity) {
      clearCustomerCheckoutState();
    }

    localStorage.setItem("customerToken", `email-${user.email}`);
    localStorage.setItem("customerUser", JSON.stringify(user));
    localStorage.setItem("customerLoginTime", Date.now().toString());
    dispatchCustomerAuthChanged({
      previousIdentity,
      currentIdentity,
      action: "login",
    });
  };

  const handleLogout = () => {
    const previousUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    );
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    localStorage.removeItem("customerLoginTime");
    clearCustomerCheckoutState();
    dispatchCustomerAuthChanged({
      previousIdentity: getCustomerIdentity(previousUser),
      currentIdentity: "",
      action: "logout",
    });
    resetForm();
    onClose();
  };

  // ✅ UPDATED: completeLogin ab modal band NAHI karega
  // Sirf profile view mode mein le jaayega updated data ke saath
  const completeLogin = (user) => {
    const customerUser = {
      _id: user?._id || user?.id,
      email,
      name,
      mobileNo,
      dob,
      age,
      address,
      gender,
      displayPhone: name || email,
      loginTime: new Date().toISOString(),
    };

    syncAuthData(customerUser);

    // ✅ Edit mode band karo - profile VIEW dikhao
    setIsEditing(false);
    setError("");

    // ✅ Profile updated success banner dikhao (modal band nahi hoga)
    setProfileUpdated(true);
    setTimeout(() => {
      setProfileUpdated(false);
    }, 3000);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className={`wello-login-panel ${open ? "is-open" : ""}`}>
      <div className="wello-login-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="wello-login-close"
        >
          ×
        </button>

        {success ? (
          // Login success screen
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-teal-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold">Login Successful!</h2>
          </div>
        ) : (
          <>
            {/* ── FIXED HEADER ── */}
            <div>
              <h2 className="wello-login-title">Login/Sign Up</h2>
              <p className="wello-login-subtitle">
                {step === "email"
                  ? "Enter your email"
                  : step === "otp"
                  ? `Enter OTP sent to ${email}`
                  : "Complete Your Profile"}
              </p>

              {/* Profile update success banner */}
              {profileUpdated && (
                <div className="mt-2 flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-3 py-2 rounded-lg text-sm">
                  <span className="text-teal-500 text-lg">✓</span>
                  <span>Profile successfully updated!</span>
                </div>
              )}
            </div>

            {/* ── SCROLLABLE CONTENT ── */}
            <div className="wello-login-scroll">
              {step === "email" && (
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  className="wello-login-input"
                />
              )}

              {step === "otp" && (
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyDown={handleKeyDown}
                  className="wello-login-input"
                />
              )}

              {step === "profile" && (
                <div>
                  {/* Profile Icon - compact */}
                  <div className="wello-profile-icon-wrap">
                    <div className="wello-profile-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="wello-profile-initial">
                      {name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>

                  {/* VIEW MODE */}
                  {!isEditing ? (
                    <div className="wello-profile-card">
                      {[
                        { label: "Name", value: name },
                        { label: "Email", value: email, small: true },
                        { label: "Mobile", value: mobileNo },
                        { label: "DOB", value: dob },
                        { label: "Age", value: age ? `${age} Yrs` : "" },
                        { label: "Address", value: address },
                        { label: "Gender", value: gender },
                      ].map(({ label, value, small }, i, arr) => (
                        <div key={label} className="wello-profile-row">
                          <span className="wello-profile-label">{label}</span>
                          <span className="wello-profile-value">
                            {value || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // EDIT MODE — no nested scroll, outer div scrolls
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="wello-login-input"
                      />
                      <input
                        type="tel"
                        placeholder="Mobile Number *"
                        value={mobileNo}
                        onChange={(e) =>
                          setMobileNo(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className="wello-login-input"
                      />
                      <div className="text-xs text-gray-500 ml-1 font-semibold">Date of Birth</div>
                      <input
                        type="date"
                        value={dob}
                        onChange={handleDobChange}
                        className="wello-login-input"
                      />
                      <div className="text-xs text-gray-500 ml-1 font-semibold">Calculated Age</div>
                      <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        readOnly
                        className="wello-login-input"
                      />
                      <textarea
                        placeholder="Full Address *"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="wello-login-textarea"
                        rows="3"
                      />
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="wello-login-select"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-gray-500 hover:text-black underline"
                      >
                        Cancel Editing
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── FIXED BOTTOM BUTTONS ── */}
            <div className="wello-login-footer">
              {error && <p className="wello-login-error">{error}</p>}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="wello-login-primary"
              >
                {loading
                  ? "Processing..."
                  : step === "email"
                  ? "Send OTP"
                  : step === "otp"
                  ? "Verify OTP"
                  : !isEditing
                  ? "Edit Profile"
                  : "Update Details"}
              </button>

              {step === "profile" && !isEditing && (
                <button
                  onClick={onClose}
                  className="wello-login-secondary"
                >
                  Close
                </button>
              )}

              {step === "profile" && (
                <button
                  onClick={handleLogout}
                  className="wello-login-danger"
                >
                  Logout Account
                </button>
              )}

              {(step === "otp" || step === "profile") && (
                <button
                  onClick={() => setStep("email")}
                  className="text-sm text-blue-500 mt-2 block"
                >
                  Change Email
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
