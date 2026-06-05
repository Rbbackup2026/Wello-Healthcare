"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "selectedWebsiteLocation";

const DEFAULT_LOCATION = {
  city: "Delhi",
  state: "Delhi",
  country: "India",
  formattedAddress: "Delhi, India",
  latitude: 28.6139,
  longitude: 77.209,
  source: "default",
};

const LocationContext = createContext(null);

const readStoredLocation = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCATION;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return DEFAULT_LOCATION;
    }

    const parsedValue = JSON.parse(storedValue);
    const mergedLocation = { ...DEFAULT_LOCATION, ...parsedValue };

    if (mergedLocation.city === "Current Location") {
      return {
        ...mergedLocation,
        city: mergedLocation.formattedAddress?.startsWith("Lat ")
          ? "Detected Location"
          : mergedLocation.formattedAddress || DEFAULT_LOCATION.city,
      };
    }

    return mergedLocation;
  } catch (error) {
    console.error("Failed to read saved location:", error);
    return DEFAULT_LOCATION;
  }
};

const slugifyLocation = (value) =>
  (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [hasLoadedStoredLocation, setHasLoadedStoredLocation] = useState(false);

  useEffect(() => {
    setLocationState(readStoredLocation());
    setHasLoadedStoredLocation(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredLocation) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }, [hasLoadedStoredLocation, location]);

  const setLocation = (nextLocation) => {
    setLocationState((previousLocation) => ({
      ...previousLocation,
      ...nextLocation,
      source: nextLocation?.source || previousLocation.source || "manual",
    }));
  };

  const resetLocation = () => {
    setLocationState(DEFAULT_LOCATION);
  };

  const value = useMemo(
    () => ({
      location,
      setLocation,
      resetLocation,
      citySlug: slugifyLocation(location.city || location.formattedAddress),
      locationLabel:
        location.city ||
        location.formattedAddress ||
        DEFAULT_LOCATION.city,
    }),
    [location]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return context;
};

export { DEFAULT_LOCATION, slugifyLocation };
