const normalizeDepartmentLabel = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const isPathologyDepartmentName = (name = "") => {
  const normalized = normalizeDepartmentLabel(name);
  return normalized.includes("pathology");
};

export const isRadiologyDepartmentName = (name = "") => {
  const normalized = normalizeDepartmentLabel(name);
  return normalized.includes("radiology");
};

export const resolveCategoryDepartment = (category = {}, departments = []) => {
  const departmentValue = category?.department;
  if (!departmentValue) {
    return { id: "", name: "" };
  }

  if (typeof departmentValue === "object") {
    return {
      id: String(departmentValue._id || departmentValue.id || ""),
      name:
        departmentValue.name ||
        departmentValue.departmentName ||
        departmentValue.title ||
        "",
    };
  }

  const departmentString = String(departmentValue);
  const matchedDepartment = departments.find(
    (department) => String(department._id || department.id) === departmentString
  );

  if (matchedDepartment) {
    return {
      id: departmentString,
      name:
        matchedDepartment.name ||
        matchedDepartment.departmentName ||
        matchedDepartment.title ||
        "",
    };
  }

  return { id: "", name: departmentString };
};

export const categoryBelongsToDepartmentKind = (
  category = {},
  departments = [],
  kind = "pathology"
) => {
  const matcher =
    kind === "radiology" ? isRadiologyDepartmentName : isPathologyDepartmentName;
  const { id, name } = resolveCategoryDepartment(category, departments);

  if (name && matcher(name)) {
    return true;
  }

  if (!id) {
    return matcher(name);
  }

  const matchedDepartment = departments.find(
    (department) => String(department._id || department.id) === id
  );

  return matcher(
    matchedDepartment?.name ||
      matchedDepartment?.departmentName ||
      matchedDepartment?.title ||
      name
  );
};

export const diseaseBelongsToDepartmentKind = (
  disease = {},
  departments = [],
  kind = "pathology"
) => {
  const matcher =
    kind === "radiology" ? isRadiologyDepartmentName : isPathologyDepartmentName;
  const diseaseDepartment = disease?.department || "";

  if (matcher(diseaseDepartment)) {
    return true;
  }

  const normalizedDiseaseDepartment = normalizeDepartmentLabel(diseaseDepartment);
  return departments.some((department) => {
    const departmentId = String(department._id || department.id || "");
    const departmentName =
      department.name || department.departmentName || department.title || "";

    if (departmentId && departmentId === String(diseaseDepartment)) {
      return matcher(departmentName);
    }

    return (
      normalizeDepartmentLabel(departmentName) === normalizedDiseaseDepartment &&
      matcher(departmentName)
    );
  });
};

export const filterCategoriesByDepartmentKind = (
  categories = [],
  departments = [],
  kind = "pathology"
) =>
  categories.filter((category) =>
    categoryBelongsToDepartmentKind(category, departments, kind)
  );

export const filterDiseasesByDepartmentKind = (
  diseases = [],
  departments = [],
  kind = "pathology"
) =>
  diseases.filter((disease) =>
    diseaseBelongsToDepartmentKind(disease, departments, kind)
  );

export const getDepartmentLabelByKind = (departments = [], kind = "pathology") => {
  const matcher =
    kind === "radiology" ? isRadiologyDepartmentName : isPathologyDepartmentName;
  const matched = departments.find((department) =>
    matcher(
      department.name || department.departmentName || department.title || ""
    )
  );

  return matched?.name || matched?.departmentName || kind;
};
