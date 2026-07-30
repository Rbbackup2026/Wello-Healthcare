"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { useCart } from "../../Components/MainRoute/CartContext";
import LoginModal from "./LoginFolder/LoginModal";
import {
  describeProductDemographics,
  validatePatientForProduct,
  validateCartPatientAssignments,
} from "../../utils/productVisibility";

const PEOPLE_STORAGE_KEY = "cartPackagePeople";
const HOME_COLLECTION_STORAGE_KEY = "cartHomeCollectionSelected";
// Saare users ka global pool — sabhhi items ke across saved patients
const ALL_PATIENTS_KEY = "allSavedPatients";

const EMPTY_PERSON_FORM = {
  prefix: "",
  firstName: "",
  lastName: "",
  gender: "Male",
  mobileNumber: "",
  dateOfBirth: "",
  relation: "",
  address: "",
  state: "",
  city: "",
  area: "",
  pincode: "",
};

const readSavedPeople = () => {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(PEOPLE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const readAllPatients = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(ALL_PATIENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const writeAllPatients = (list) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALL_PATIENTS_KEY, JSON.stringify(list));
};

const readHomeCollectionSelected = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(HOME_COLLECTION_STORAGE_KEY) !== "false";
};

// Duplicate check — same firstName+lastName+dob
const isDuplicate = (list, person) =>
  list.some(
    (p) =>
      p.firstName?.trim().toLowerCase() === person.firstName?.trim().toLowerCase() &&
      p.lastName?.trim().toLowerCase() === person.lastName?.trim().toLowerCase() &&
      p.dateOfBirth === person.dateOfBirth
  );

const CartDrawer = ({ open = true, onClose, asPage = false }) => {
  const { cartItems, decreaseQty, increaseQty, removeItem } = useCart();
  const [homeCollectionSelected, setHomeCollectionSelected] = useState(
    readHomeCollectionSelected
  );
  const [loginOpen, setLoginOpen] = useState(false);

  // Modal state:
  // null                    → closed
  // { itemKey, mode: "select" } → showing saved patients list
  // { itemKey, mode: "form" }   → showing add-new form
  const [activeForm, setActiveForm] = useState(null);

  const [personForm, setPersonForm] = useState(EMPTY_PERSON_FORM);
  const [savedPeople, setSavedPeople] = useState(readSavedPeople);
  const [allPatients, setAllPatients] = useState(readAllPatients);

  // Which patients are checked in select mode
  const [selectedIds, setSelectedIds] = useState([]);

  const handleClose = asPage ? undefined : onClose;

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  const homeCollectionCharge =
    homeCollectionSelected && cartItems.length > 0 ? 150 : 0;

  const getItemKey = (item) => item.cartEntryId || item._id || item.id;

  const getCartItemByKey = (itemKey) =>
    cartItems.find((item) => getItemKey(item) === itemKey);

  const showPatientMismatchError = (message) => {
    toast.error(message, { position: "top-center", autoClose: 6000 });
  };

  const validatePatientsForItem = (itemKey, patients) => {
    const cartItem = getCartItemByKey(itemKey);
    if (!cartItem) return { ok: true };

    for (const patient of patients) {
      const result = validatePatientForProduct(cartItem, patient);
      if (!result.ok) {
        return result;
      }
    }
    return { ok: true };
  };

  const getMissingPatientItem = () =>
    cartItems.find((item) => {
      const itemKey = getItemKey(item);
      const itemPeople = savedPeople[itemKey] || {};
      return (
        (itemPeople.patients || []).length === 0 &&
        (itemPeople.members || []).length === 0
      );
    });

  const handleScheduleBookClick = (event) => {
    if (cartItems.length === 0) {
      event.preventDefault();
      toast.warn("Your cart is empty!");
      return;
    }

    const user = localStorage.getItem("customerUser");
    if (!user) {
      event.preventDefault();
      toast.error("Please login to schedule and book.", { position: "top-center" });
      setLoginOpen(true);
      return;
    }

    const missingPatientItem = getMissingPatientItem();
    if (missingPatientItem) {
      event.preventDefault();
      toast.error("Please add patient details before scheduling.", {
        position: "top-center",
      });
      openPersonModal(getItemKey(missingPatientItem));
      return;
    }

    const demographicErrors = validateCartPatientAssignments(
      cartItems,
      savedPeople,
      getItemKey
    );
    if (demographicErrors.length > 0) {
      event.preventDefault();
      showPatientMismatchError(demographicErrors[0]);
      return;
    }

    handleClose?.();
  };

  // Persist per-item people
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(savedPeople));
  }, [savedPeople]);

  // Persist global pool
  useEffect(() => {
    writeAllPatients(allPatients);
  }, [allPatients]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      HOME_COLLECTION_STORAGE_KEY,
      String(homeCollectionSelected)
    );
    window.dispatchEvent(
      new CustomEvent("cart-home-collection-changed", {
        detail: { selected: homeCollectionSelected },
      })
    );
  }, [homeCollectionSelected]);

  // ── Open modal in "select" mode if there are saved patients, else "form" mode
  const openPersonModal = (itemKey) => {
    const pool = readAllPatients();
    setAllPatients(pool);

    if (pool.length > 0) {
      // Pre-tick patients already assigned to this item
      const itemPeople = savedPeople[itemKey] || { patients: [], members: [] };
      const alreadySelected = [
        ...(itemPeople.patients || []),
        ...(itemPeople.members || []),
      ].map((p) => `${p.firstName}_${p.lastName}_${p.dateOfBirth}`);
      setSelectedIds(alreadySelected);
      setActiveForm({ itemKey, mode: "select" });
    } else {
      setActiveForm({ itemKey, mode: "form" });
    }
    setPersonForm(EMPTY_PERSON_FORM);
  };

  const closeModal = () => {
    setActiveForm(null);
    setPersonForm(EMPTY_PERSON_FORM);
    setSelectedIds([]);
  };

  const toggleSelect = (patientKey) => {
    setSelectedIds((prev) =>
      prev.includes(patientKey)
        ? prev.filter((k) => k !== patientKey)
        : [...prev, patientKey]
    );
  };

  // Confirm selection from list
  const confirmSelection = () => {
    const chosen = allPatients.filter((p) =>
      selectedIds.includes(`${p.firstName}_${p.lastName}_${p.dateOfBirth}`)
    );
    const { itemKey } = activeForm;

    const validation = validatePatientsForItem(itemKey, chosen);
    if (!validation.ok) {
      showPatientMismatchError(validation.message);
      return;
    }

    setSavedPeople((prev) => ({
      ...prev,
      [itemKey]: {
        patients: chosen,
        members: prev[itemKey]?.members || [],
      },
    }));
    closeModal();
  };

  const updatePersonForm = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "mobileNumber"
        ? value.replace(/\D/g, "").slice(0, 10)
        : name === "pincode"
        ? value.replace(/\D/g, "").slice(0, 6)
        : value;
    setPersonForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const savePerson = () => {
    const { itemKey } = activeForm;
    const fullName = [personForm.firstName, personForm.lastName]
      .map((v) => v.trim())
      .filter(Boolean)
      .join(" ");

    const trimmedPerson = {
      prefix: personForm.prefix,
      firstName: personForm.firstName.trim(),
      lastName: personForm.lastName.trim(),
      name: fullName,
      gender: personForm.gender,
      mobileNumber: personForm.mobileNumber.trim(),
      dateOfBirth: personForm.dateOfBirth,
      relation: personForm.relation,
      address: personForm.address.trim(),
      state: personForm.state,
      city: personForm.city,
      area: personForm.area.trim(),
      pincode: personForm.pincode.trim(),
    };

    if (
      !trimmedPerson.firstName ||
      !trimmedPerson.lastName ||
      !trimmedPerson.dateOfBirth ||
      !trimmedPerson.address ||
      !trimmedPerson.state ||
      !trimmedPerson.city ||
      !trimmedPerson.area ||
      !/^\d{6}$/.test(trimmedPerson.pincode)
    ) return;

    const validation = validatePatientsForItem(itemKey, [trimmedPerson]);
    if (!validation.ok) {
      showPatientMismatchError(validation.message);
      return;
    }

    // Add to global pool (no duplicates)
    setAllPatients((prev) => {
      if (isDuplicate(prev, trimmedPerson)) return prev;
      return [...prev, trimmedPerson];
    });

    // Assign to this item
    setSavedPeople((prev) => ({
      ...prev,
      [itemKey]: {
        patients: [...(prev[itemKey]?.patients || []), trimmedPerson],
        members: prev[itemKey]?.members || [],
      },
    }));

    closeModal();
  };

  const isPersonFormValid = Boolean(
    personForm.firstName.trim() &&
      personForm.lastName.trim() &&
      personForm.dateOfBirth &&
      personForm.address.trim() &&
      personForm.state &&
      personForm.city &&
      personForm.area.trim() &&
      /^\d{6}$/.test(personForm.pincode.trim())
  );

  return (
    <div
      className={`wello-cart-panel ${open ? "is-open" : ""} ${asPage ? "is-page" : ""} ${
        activeForm ? "has-person-modal" : ""
      }`}
      aria-hidden={!asPage && !open}
    >
      {!asPage && (
        <button type="button" className="wello-cart-backdrop" onClick={handleClose} />
      )}

      <aside className="wello-cart-content" aria-label="Cart">
        {!asPage && (
          <div className="wello-cart-head">
            <button
              type="button"
              className="wello-cart-close"
              onClick={handleClose}
              aria-label="Close cart"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="wello-cart-scroll">
          <div className="wello-cart-grid">
            <section className="wello-cart-main-area">
              <div className="wello-cart-section-title">
                <h3>Add Tests in Your Cart</h3>
              </div>

              {cartItems.length === 0 ? (
                <div className="wello-cart-empty">
                  <div className="wello-cart-empty-icon">
                    <FaShoppingCart />
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Add a test or health package to start booking.</p>
                </div>
              ) : (
                <>
                  <div className="wello-cart-list">
                    {cartItems.map((item) => {
                      const itemQty = Number(item.qty || 1);
                      const itemPrice = Number(item.price || 0);
                      const itemKey = getItemKey(item);
                      const itemPeople = savedPeople[itemKey] || {
                        patients: [],
                        members: [],
                      };

                      return (
                        <div className="wello-cart-item" key={itemKey}>
                          <div className="wello-cart-item-top">
                            <div>
                              <h3>{item.name}</h3>
                              <span className="wello-cart-pill">Includes 1 Test</span>
                            </div>
                            <div className="wello-cart-price-row">
                              <strong>₹ {itemPrice * itemQty}</strong>
                              <button
                                type="button"
                                className="wello-cart-remove"
                                onClick={() => removeItem(itemKey)}
                                aria-label="Remove item"
                              >
                                <img
                                  src="/images/Mask group (1).png"
                                  alt=""
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          <div className="wello-cart-item-actions">
                            <button
                              type="button"
                              className="wello-cart-patient-btn"
                              onClick={() => openPersonModal(itemKey)}
                            >
                              <FaUserPlus />
                              {itemPeople.patients.length > 0
                                ? "Manage Patients"
                                : "Add Patient / Member"}
                            </button>
                          </div>

                          {(itemPeople.patients.length > 0 ||
                            itemPeople.members.length > 0) && (
                            <div className="wello-cart-people-list">
                              {itemPeople.patients.map((person, index) => {
                                const name =
                                  typeof person === "string"
                                    ? person
                                    : person.name || person.firstName;
                                return (
                                  <span key={`patient-${name}-${index}`}>
                                    Patient: {name}
                                  </span>
                                );
                              })}
                              {itemPeople.members.map((person, index) => {
                                const name =
                                  typeof person === "string"
                                    ? person
                                    : person.name || person.firstName;
                                return (
                                  <span key={`member-${name}-${index}`}>
                                    Member: {name}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="wello-cart-qty">
                            <span>Qty</span>
                            <button
                              type="button"
                              onClick={() => decreaseQty(itemKey)}
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <strong>{itemQty}</strong>
                            <button
                              type="button"
                              onClick={() => increaseQty(itemKey)}
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <p className="wello-cart-faq">
                FAQ for <Link href="/lab-tests">Radiology Imaging</Link> and{" "}
                <Link href="/lab-tests">Pathology Blood Test</Link>
              </p>
            </section>

            <aside
              className="wello-cart-side-area"
              aria-label="Booking actions and summary"
            >
              <Link
                href="/lab-tests"
                className="wello-cart-add-test"
                onClick={handleClose}
              >
                Add Test
              </Link>

              <div className="wello-cart-summary-card" aria-label="Booking summary">
                <div className="wello-cart-service">
                  <img
                    src="/images/Mask group.png"
                    alt=""
                    className="wello-cart-service-icon"
                    aria-hidden="true"
                  />
                  <div>
                    <h4>Sample Home Collection Service</h4>
                    <p>
                      Blood tests can be done through home blood sample collection
                      services.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`wello-cart-service-check ${
                      homeCollectionSelected ? "is-checked" : ""
                    }`}
                    onClick={() =>
                      setHomeCollectionSelected((value) => !value)
                    }
                    aria-pressed={homeCollectionSelected}
                    aria-label="Toggle sample home collection service"
                  />
                </div>

                <div className="wello-cart-booking-box">
                  <p>Booking Summary ({cartItems.length} Items)</p>
                  <div className="wello-cart-total">
                    <span>Subtotal</span>
                    <strong>₹ {subtotal}</strong>
                  </div>
                  {homeCollectionSelected && (
                    <div className="wello-cart-total">
                      <span>Home Collection</span>
                      <strong>₹ {homeCollectionCharge}</strong>
                    </div>
                  )}
                  <Link
                    href="/cart-checkout"
                    className="wello-cart-checkout"
                    onClick={handleScheduleBookClick}
                  >
                    Schedule &amp; Book
                  </Link>
                </div>

                <p className="wello-cart-note">
                  Inclusive of all the taxes, fees and subject to availability
                </p>

                <div className="wello-cart-category-actions">
                  <Link href="/lab-tests" onClick={handleClose}>
                    <MdHealthAndSafety />
                    Pathology tests
                  </Link>
                  <Link href="/lab-tests" onClick={handleClose}>
                    <MdHealthAndSafety />
                    Radiology tests
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="wello-cart-mobile-footer">
            <div className="wello-cart-total">
              <span>Subtotal</span>
              <strong>₹ {subtotal}</strong>
            </div>
            {homeCollectionSelected && (
              <div className="wello-cart-total">
                <span>Home Collection</span>
                <strong>₹ {homeCollectionCharge}</strong>
              </div>
            )}
            <Link
              href="/cart-checkout"
              className="wello-cart-checkout"
              onClick={handleScheduleBookClick}
            >
              Schedule &amp; Book
            </Link>
          </div>
        )}
      </aside>

      {/* ══════════════ MODAL ══════════════ */}
      {activeForm && (
        <div
          className="wello-cart-modal-wrap"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-person-title"
        >
          <button
            type="button"
            className="wello-cart-modal-backdrop"
            onClick={closeModal}
            aria-label="Close form"
          />

          <div className="wello-cart-person-modal">
            {/* ── HEAD ── */}
            <div className="wello-cart-person-head">
              <h3 id="cart-person-title">
                {activeForm.mode === "select"
                  ? "SELECT / ADD PATIENTS"
                  : "ADD NEW FAMILY MEMBER"}
              </h3>
              <button type="button" onClick={closeModal} aria-label="Close form">
                <FaTimes />
              </button>
            </div>

            {(() => {
              const cartItem = getCartItemByKey(activeForm.itemKey);
              const suitability = cartItem
                ? describeProductDemographics(cartItem)
                : "";
              if (!suitability) return null;
              return (
                <p className="wello-patient-test-hint">
                  This test is for <strong>{suitability}</strong>. Select patient
                  with matching age &amp; gender (e.g. child for kids test).
                </p>
              );
            })()}

            {/* ══ MODE: SELECT ══ */}
            {activeForm.mode === "select" && (
              <div className="wello-patient-select">
                {/* "Add Member" CTA at top */}
                <div className="wello-patient-select-topbar">
                  <button
                    type="button"
                    className="wello-patient-add-new-btn"
                    onClick={() =>
                      setActiveForm((prev) => ({ ...prev, mode: "form" }))
                    }
                  >
                    <FaUserPlus />
                    ADD MEMBER TO YOUR ACCOUNT
                  </button>
                </div>

                {/* Patient list */}
                <ul className="wello-patient-list">
                  {allPatients.map((person, idx) => {
                    const key = `${person.firstName}_${person.lastName}_${person.dateOfBirth}`;
                    const checked = selectedIds.includes(key);

                    // Age calculation
                    let ageLabel = "";
                    if (person.dateOfBirth) {
                      const dob = new Date(person.dateOfBirth);
                      const diff = Date.now() - dob.getTime();
                      const ageYrs = Math.floor(
                        diff / (1000 * 60 * 60 * 24 * 365.25)
                      );
                      ageLabel = `${ageYrs} yrs.`;
                    }

                    const fullAddress = [
                      person.address,
                      person.area,
                      person.city,
                      person.pincode ? `- ${person.pincode}` : "",
                      person.state,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <li
                        key={key + idx}
                        className={`wello-patient-list-item ${
                          checked ? "is-selected" : ""
                        }`}
                        onClick={() => toggleSelect(key)}
                      >
                        <div className="wello-patient-checkbox">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(key)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="wello-patient-info">
                          <p className="wello-patient-name">
                            {idx + 1}. {person.prefix} {person.firstName}{" "}
                            {person.lastName}
                          </p>
                          {(person.gender || ageLabel) && (
                            <p className="wello-patient-meta">
                              {[person.gender, ageLabel]
                                .filter(Boolean)
                                .join(" , ")}
                            </p>
                          )}
                          {fullAddress && (
                            <p className="wello-patient-address">
                              {fullAddress}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Confirm button */}
                <div className="wello-cart-person-actions">
                  <button
                    type="button"
                    className="wello-cart-person-cancel"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="wello-cart-person-save"
                    onClick={confirmSelection}
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            )}

            {/* ══ MODE: FORM ══ */}
            {activeForm.mode === "form" && (
              <>
                {/* Back to list (if there are saved patients) */}
                {allPatients.length > 0 && (
                  <div className="wello-patient-back-row">
                    <button
                      type="button"
                      className="wello-patient-back-btn"
                      onClick={() =>
                        setActiveForm((prev) => ({ ...prev, mode: "select" }))
                      }
                    >
                      ← Back to list
                    </button>
                  </div>
                )}

                <div className="wello-cart-person-fields">
                  <label className="wello-cart-field-prefix">
                    Prefix
                    <select
                      name="prefix"
                      value={personForm.prefix}
                      onChange={updatePersonForm}
                      autoFocus
                    >
                      <option value="">Select</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Master">Master</option>
                    </select>
                  </label>
                  <label>
                    First Name
                    <input
                      type="text"
                      name="firstName"
                      value={personForm.firstName}
                      onChange={updatePersonForm}
                    />
                  </label>
                  <label>
                    Last Name
                    <input
                      type="text"
                      name="lastName"
                      value={personForm.lastName}
                      onChange={updatePersonForm}
                    />
                  </label>
                  <fieldset className="wello-cart-person-gender">
                    <legend>Gender</legend>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={personForm.gender === "Male"}
                        onChange={updatePersonForm}
                      />
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={personForm.gender === "Female"}
                        onChange={updatePersonForm}
                      />
                      Female
                    </label>
                  </fieldset>
                  <label className="wello-cart-person-span-2">
                    Mobile Number
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={personForm.mobileNumber}
                      onChange={updatePersonForm}
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </label>
                  <label>
                    Date Of Birth *
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={personForm.dateOfBirth}
                      onChange={updatePersonForm}
                    />
                  </label>
                  <label className="wello-cart-person-span-2">
                    Relation
                    <select
                      name="relation"
                      value={personForm.relation}
                      onChange={updatePersonForm}
                    >
                      <option value="">Select</option>
                      <option value="Self">Self</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="wello-cart-person-wide">
                    Address (Area and Street) *
                    <textarea
                      name="address"
                      value={personForm.address}
                      onChange={updatePersonForm}
                    />
                  </label>
                  <label className="wello-cart-person-span-2">
                    State *
                    <select
                      name="state"
                      value={personForm.state}
                      onChange={updatePersonForm}
                    >
                      <option value="">Select</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </label>
                  <label className="wello-cart-person-span-2">
                    City *
                    <select
                      name="city"
                      value={personForm.city}
                      onChange={updatePersonForm}
                    >
                      <option value="">Select</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gurugram">Gurugram</option>
                      <option value="Noida">Noida</option>
                      <option value="Ghaziabad">Ghaziabad</option>
                      <option value="Faridabad">Faridabad</option>
                    </select>
                  </label>
                  <label className="wello-cart-person-span-2">
                    Area *
                    <input
                      type="text"
                      name="area"
                      value={personForm.area}
                      onChange={updatePersonForm}
                    />
                  </label>
                  <label className="wello-cart-person-span-2">
                    Pincode *
                    <input
                      type="text"
                      name="pincode"
                      value={personForm.pincode}
                      onChange={updatePersonForm}
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </label>
                </div>

                <div className="wello-cart-person-actions">
                  <button
                    type="button"
                    className="wello-cart-person-cancel"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="wello-cart-person-save"
                    onClick={savePerson}
                    disabled={!isPersonFormValid}
                  >
                    Save Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default CartDrawer;
