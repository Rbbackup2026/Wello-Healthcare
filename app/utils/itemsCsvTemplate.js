/** Sample CSV matching admin Item form (multi-city price groups) */
export const ITEMS_CSV_TEMPLATE_HEADERS = [
  "name",
  "sku",
  "itemType",
  "testCount",
  "category",
  "departments",
  "diseases",
  "keyFeatures",
  "lab",
  "certificate",
  "recommendedTests",
  "cities",
  "mrp",
  "price",
  "priceValidUntil",
  "cities2",
  "mrp2",
  "price2",
  "priceValidUntil2",
  "reportingTime",
  "specimen",
  "fromAge",
  "toAge",
  "gender",
  "showPopularPackage",
  "showFullBodyHealthCheckup",
  "showInHome",
  "showHomeBanner",
  "status",
  "description",
  "faqs",
  "metaTitle",
  "metaKeywords",
  "metaDescription",
];

/** Example rows — 3 cities same price group, 2 cities another group */
export const ITEMS_CSV_TEMPLATE_ROWS = [
  [
    "Full Body Checkup Classic",
    "SKU-FBC-001",
    "Package",
    "45",
    "Full Body Health Checkup",
    "Pathology",
    "Diabetes",
    "Home Collection,Fasting Required",
    "",
    "",
    "CBC Test,Lipid Profile",
    "Delhi,Mumbai,Pune",
    "2999",
    "1999",
    "2026-12-31",
    "Bengaluru,Hyderabad",
    "2899",
    "1899",
    "2026-12-31",
    "24 Hours",
    "Blood",
    "",
    "",
    "Both",
    "Yes",
    "Yes",
    "true",
    "false",
    "true",
    "Complete full body package with essential tests.",
    "What is included?|45+ tests||Is fasting required?|Yes 8-10 hours",
    "Full Body Checkup Classic",
    "full body,health checkup",
    "Book Full Body Checkup Classic online.",
  ],
  [
    "Vitamin D Test",
    "SKU-VITD-001",
    "Test",
    "1",
    "Vitamin Tests",
    "Pathology",
    "",
    "",
    "",
    "",
    "",
    "Delhi,Gurugram,Noida,Mumbai,Pune",
    "999",
    "",
    "",
    "",
    "",
    "",
    "",
    "36 Hours",
    "Blood",
    "18",
    "65",
    "Both",
    "No",
    "No",
    "false",
    "false",
    "true",
    "Vitamin D deficiency screening.",
    "",
    "Vitamin D Test",
    "vitamin d",
    "Book Vitamin D Test online.",
  ],
];

const escapeCsvCell = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const buildItemsCsvTemplateContent = () => {
  const lines = [
    ITEMS_CSV_TEMPLATE_HEADERS.map(escapeCsvCell).join(","),
    ...ITEMS_CSV_TEMPLATE_ROWS.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return `${lines.join("\n")}\n`;
};

export const downloadItemsCsvTemplate = () => {
  const content = buildItemsCsvTemplateContent();
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wello-items-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
