const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const replaceCityText = (content = "", selectedCity = "", fallbackCities = []) => {
  let nextContent = String(content || "");
  const resolvedCity = String(selectedCity || "").trim();

  if (!resolvedCity) {
    return nextContent;
  }

  nextContent = nextContent
    .replace(/\(CITY\)/gi, resolvedCity)
    .replace(/\{\{CITY\}\}/gi, resolvedCity)
    .replace(/\bCITY\b/g, resolvedCity);

  const uniqueFallbackCities = [...new Set(fallbackCities.filter(Boolean))];

  uniqueFallbackCities.forEach((city) => {
    const fallbackCity = String(city).trim();
    if (!fallbackCity || fallbackCity.toLowerCase() === resolvedCity.toLowerCase()) {
      return;
    }

    nextContent = nextContent.replace(
      new RegExp(`\\b${escapeRegExp(fallbackCity)}\\b`, "gi"),
      resolvedCity
    );
  });

  return nextContent;
};
