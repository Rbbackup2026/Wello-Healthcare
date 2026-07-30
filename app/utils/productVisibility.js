import { normalizeCityName } from "./cityApi";

export const isTruthy = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return ["true", "yes", "active", "1"].includes(normalized);
  }
  if (typeof value === "number") return value === 1;
  return false;
};

export const getProductCity = (product = {}) =>
  product?.city ||
  product?.location?.city ||
  product?.lab?.city ||
  product?.labDetails?.city ||
  "";

export const productMatchesCity = (product, city = "") => {
  const selectedCity = normalizeCityName(city);
  const productCity = normalizeCityName(getProductCity(product));

  if (!selectedCity || !productCity) {
    return true;
  }

  return (
    productCity === selectedCity ||
    productCity.startsWith(`${selectedCity} `) ||
    selectedCity.startsWith(`${productCity} `)
  );
};

export const isProductActive = (product = {}) =>
  isTruthy(product.status) || isTruthy(product.isActive);

export const isFullBodyProduct = (product = {}) =>
  isTruthy(product.showFullBodyHealthCheckup) || isTruthy(product.showFullBody);

export const isPopularProduct = (product = {}) =>
  product.showPopularPackage === "Yes" || isTruthy(product.showPopularPackage);

export const isPopularOrFullBodyProduct = (product = {}) =>
  isPopularProduct(product) || isFullBodyProduct(product);

export const isShownOnHome = (category = {}) =>
  isTruthy(category.showinhome) || isTruthy(category.showInHome);

export const isShownInNavbar = (category = {}) => {
  const value =
    category.showinnavbar ?? category.showInNavbar ?? category.showNavbar;

  if (value === undefined || value === null) {
    return true;
  }

  return isTruthy(value);
};

export const isShownOnHomeDisease = (disease = {}) =>
  isTruthy(disease.showHome) && disease.isActive !== false;

const normalizeDepartmentLabel = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const getDepartmentRecordsFromProduct = (product = {}) => {
  const departments = product?.department;
  if (!departments) return [];
  return Array.isArray(departments) ? departments : [departments];
};

export const resolveDepartmentNames = (product = {}, departmentRecords = []) => {
  const names = new Set();
  const lookup = new Map(
    departmentRecords.map((dept) => [
      String(dept._id || dept.id || ""),
      dept.name || dept.departmentName || dept.title || "",
    ])
  );

  getDepartmentRecordsFromProduct(product).forEach((entry) => {
    if (!entry) return;

    if (typeof entry === "string") {
      const resolved = lookup.get(entry) || entry;
      if (resolved) names.add(resolved);
      return;
    }

    if (typeof entry === "object") {
      const name = entry.name || entry.departmentName || entry.title;
      if (name) names.add(name);

      const id = entry._id || entry.id;
      if (id && lookup.get(String(id))) {
        names.add(lookup.get(String(id)));
      }
    }
  });

  const categoryDept = product?.category?.department;
  if (categoryDept) {
    if (typeof categoryDept === "object") {
      names.add(categoryDept.name || categoryDept.departmentName || "");
    } else {
      names.add(lookup.get(String(categoryDept)) || "");
    }
  }

  return [...names].filter(Boolean);
};

export const productMatchesDepartment = (
  product = {},
  departmentName = "",
  departmentRecords = []
) => {
  const target = normalizeDepartmentLabel(departmentName);
  if (!target) return true;

  return resolveDepartmentNames(product, departmentRecords).some((name) => {
    const normalized = normalizeDepartmentLabel(name);
    return (
      normalized === target ||
      normalized.includes(target) ||
      target.includes(normalized)
    );
  });
};

export const isRadiologyProduct = (product = {}, departmentRecords = []) =>
  productMatchesDepartment(product, "radiology", departmentRecords);

export const excludeRadiologyProducts = (products = [], departmentRecords = []) =>
  products.filter((product) => !isRadiologyProduct(product, departmentRecords));

const getCategoryDepartmentName = (category = {}, departmentRecords = []) => {
  const department = category?.department;

  if (!department) return "";

  if (typeof department === "object") {
    return department.name || department.departmentName || department.title || "";
  }

  const matched = departmentRecords.find(
    (record) => String(record._id || record.id) === String(department)
  );

  return matched?.name || matched?.departmentName || String(department);
};

export const isRadiologyCategory = (category = {}, departmentRecords = []) =>
  isRadiologyProduct(
    { department: [getCategoryDepartmentName(category, departmentRecords)] },
    departmentRecords
  );

/** Age from DOB string/Date. Returns null if invalid. */
export const getAgeFromDateOfBirth = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 && age <= 120 ? age : null;
};

const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "male" || normalized === "m") return "Male";
  if (normalized === "female" || normalized === "f") return "Female";
  if (normalized === "both" || normalized === "all") return "Both";
  return null;
};

/** Read logged-in customer age/gender from localStorage.customerUser */
export const getCustomerDemographics = () => {
  if (typeof window === "undefined") {
    return { age: null, gender: null };
  }

  try {
    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    if (!user) return { age: null, gender: null };

    const ageFromProfile =
      user.age !== undefined && user.age !== null && user.age !== ""
        ? Number(user.age)
        : null;
    const age = Number.isFinite(ageFromProfile)
      ? ageFromProfile
      : getAgeFromDateOfBirth(user.dob || user.dateOfBirth);

    return {
      age: Number.isFinite(age) ? age : null,
      gender: normalizeGender(user.gender),
    };
  } catch {
    return { age: null, gender: null };
  }
};

export const getProductAgeGender = (product = {}) => {
  const source = product?.raw && typeof product.raw === "object" ? product.raw : product;

  const parseAge = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const fromAge = parseAge(source?.fromAge ?? product?.fromAge);
  const toAge = parseAge(source?.toAge ?? product?.toAge);
  const gender = normalizeGender(source?.gender ?? product?.gender) || "Both";

  return {
    fromAge,
    toAge,
    gender,
    /** blank / 0–0 → no age limit (valid for everyone) */
    hasAgeRestriction: fromAge > 0 || toAge > 0,
    hasGenderRestriction: Boolean(gender) && gender !== "Both",
  };
};

/**
 * Match product fromAge/toAge/gender against demographics.
 * No age set (blank/0) → age rule skipped (all ages).
 * Gender Both → gender rule skipped.
 */
export const productMatchesDemographics = (product = {}, demographics = {}) => {
  const age =
    demographics?.age !== undefined && demographics?.age !== null && demographics?.age !== ""
      ? Number(demographics.age)
      : null;
  const gender = normalizeGender(demographics?.gender);

  const hasAge = Number.isFinite(age);
  const hasGender = Boolean(gender) && gender !== "Both";

  if (!hasAge && !hasGender) {
    return true;
  }

  const { fromAge, toAge, gender: productGender, hasAgeRestriction, hasGenderRestriction } =
    getProductAgeGender(product);

  if (hasAge && hasAgeRestriction) {
    const minAge = fromAge > 0 ? fromAge : 0;
    const maxAge = toAge > 0 ? toAge : 150;
    if (age < minAge || age > maxAge) {
      return false;
    }
  }

  if (hasGender && hasGenderRestriction) {
    if (productGender !== gender) {
      return false;
    }
  }

  return true;
};

export const filterProductsByDemographics = (products = [], demographics = {}) =>
  (Array.isArray(products) ? products : []).filter((product) =>
    productMatchesDemographics(product, demographics)
  );

export const describeProductDemographics = (product = {}) => {
  const { fromAge, toAge, gender, hasAgeRestriction, hasGenderRestriction } =
    getProductAgeGender(product);
  const parts = [];

  if (hasAgeRestriction) {
    if (fromAge > 0 && toAge > 0) parts.push(`Age ${fromAge}–${toAge}`);
    else if (fromAge > 0) parts.push(`Age ${fromAge}+`);
    else parts.push(`Age up to ${toAge}`);
  }

  if (hasGenderRestriction) {
    parts.push(gender);
  }

  return parts.join(" · ");
};

export const getPatientDemographicsFromPerson = (person = {}) => ({
  age: getAgeFromDateOfBirth(person.dateOfBirth),
  gender: normalizeGender(person.gender),
});

/** Checkout-only: validate selected patient against test age/gender rules */
export const validatePatientForProduct = (product = {}, person = {}) => {
  const demographics = getPatientDemographicsFromPerson(person);
  const { hasAgeRestriction, hasGenderRestriction } = getProductAgeGender(product);

  // No age + gender Both → valid for everyone
  if (!hasAgeRestriction && !hasGenderRestriction) {
    return { ok: true };
  }

  const suitability = describeProductDemographics(product);
  const testName = product.name || "This test";

  if (hasAgeRestriction && demographics.age === null) {
    return {
      ok: false,
      message: `${testName} is for ${suitability}. Please enter patient date of birth.`,
    };
  }

  if (hasGenderRestriction && !demographics.gender) {
    return {
      ok: false,
      message: `${testName} is for ${suitability}. Please select patient gender.`,
    };
  }

  if (!productMatchesDemographics(product, demographics)) {
    const patientLabel = [
      demographics.age !== null ? `Age ${demographics.age}` : null,
      demographics.gender || null,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      ok: false,
      message: `${testName} is for ${suitability}. Selected patient (${patientLabel}) does not match.`,
    };
  }

  return { ok: true };
};

export const validateCartPatientAssignments = (cartItems = [], packagePeople = {}, getItemKey) => {
  const errors = [];

  cartItems.forEach((item) => {
    const itemKey = getItemKey(item);
    const people = packagePeople[itemKey] || {};
    const patients = [...(people.patients || []), ...(people.members || [])];

    if (patients.length === 0) return;

    const product = {
      name: item.name,
      fromAge: item.fromAge,
      toAge: item.toAge,
      gender: item.gender,
      raw: item.raw,
    };

    patients.forEach((patient) => {
      const result = validatePatientForProduct(product, patient);
      if (!result.ok) errors.push(result.message);
    });
  });

  return errors;
};
