import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaMapMarkerAlt, FaLocationArrow } from "react-icons/fa";
import { useLocation } from "../../Components/MainRoute/LocationContext";
import { loadGoogleMapsPlacesApi } from "../../utils/googleMapsLoader";

const LocationDialog = ({ onClose }) => {
  const { location, setLocation } = useLocation();
  const [city, setCity] = useState(location.city || "Delhi");
  const [selectedLocationDetails, setSelectedLocationDetails] = useState(location);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const inputRef = useRef(null);
  const selectedPlaceRef = useRef(null);
  const resolvedLocationRef = useRef(location);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const detectTimeoutRef = useRef(null);

  const popularCities = [
    "Bengaluru", "Chennai", "Delhi",
    "Gurugram", "Hyderabad", "Kolkata",
    "Mumbai", "Noida", "Pune",
  ];

  const handleSelectPopularCity = (cityName) => {
    setCity(cityName);
    selectedPlaceRef.current = null;
    const nextLocation = {
      city: cityName,
      formattedAddress: `${cityName}, India`,
      source: "manual",
    };
    resolvedLocationRef.current = nextLocation;
    setSelectedLocationDetails(nextLocation);
    setStatusMessage("");
  };

  useEffect(() => {
    setCity(location.city || "Delhi");
    resolvedLocationRef.current = location;
    setSelectedLocationDetails(location);
  }, [location]);

  useEffect(() => {
    return () => {
      if (detectTimeoutRef.current) {
        window.clearTimeout(detectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let autocomplete;
    if (!googleMapsApiKey || !inputRef.current) return undefined;

    loadGoogleMapsPlacesApi(googleMapsApiKey)
      .then((maps) => {
        if (!inputRef.current) return;
        autocomplete = new maps.places.Autocomplete(inputRef.current, {
          fields: ["address_components", "formatted_address", "geometry", "name"],
          types: ["(cities)"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const nextLocation = extractLocationFromPlace(place);
          selectedPlaceRef.current = place;
          resolvedLocationRef.current = nextLocation;
          setSelectedLocationDetails(nextLocation);
          setCity(nextLocation.city || place.formatted_address || place.name || "");
          setStatusMessage("Suggested location selected. Save to apply it.");
        });
      })
      .catch((error) => {
        console.error("Google Maps autocomplete failed:", error);
        setStatusMessage("Google suggestions unavailable. You can still type your city manually.");
      });

    return () => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [googleMapsApiKey]);

  const extractLocationFromPlace = (place) => {
    const components = place?.address_components || [];
    const findComponent = (type) =>
      components.find((c) => c.types?.includes(type))?.long_name || "";

    const cityName =
      findComponent("locality") ||
      findComponent("administrative_area_level_2") ||
      findComponent("administrative_area_level_1") ||
      place?.name || city;

    return {
      city: cityName,
      state: findComponent("administrative_area_level_1"),
      country: findComponent("country"),
      formattedAddress: place?.formatted_address || cityName,
      latitude: place?.geometry?.location?.lat?.() ?? location.latitude,
      longitude: place?.geometry?.location?.lng?.() ?? location.longitude,
      source: "google_places",
    };
  };

  const reverseGeocodePosition = async (latitude, longitude) => {
    const maps = await withTimeout(
      loadGoogleMapsPlacesApi(googleMapsApiKey),
      7000,
      "Google Maps took too long to load."
    );
    const geocoder = new maps.Geocoder();
    const response = await withTimeout(
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }),
      7000,
      "Google reverse geocoding took too long."
    );
    const primaryResult = response?.results?.[0];
    if (!primaryResult) throw new Error("Could not resolve your current city.");
    return extractLocationFromPlace({
      ...primaryResult,
      geometry: { location: { lat: () => latitude, lng: () => longitude } },
    });
  };

  const reverseGeocodeWithOpenStreetMap = async (latitude, longitude) => {
    const response = await withTimeout(
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      ),
      8000,
      "OpenStreetMap reverse geocoding took too long."
    );

    if (!response.ok) {
      throw new Error(`OpenStreetMap request failed with status ${response.status}`);
    }

    const result = await response.json();
    const address = result?.address || {};
    const cityName =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state_district ||
      address.state ||
      "";

    if (!cityName && !result?.display_name) {
      throw new Error("Could not resolve your current location.");
    }

    return {
      city: cityName || result.display_name.split(",")[0],
      state: address.state || "",
      country: address.country || "",
      formattedAddress: result.display_name || cityName,
      latitude,
      longitude,
      source: "geolocation",
    };
  };

  const resolveCurrentLocation = async (latitude, longitude) => {
    if (googleMapsApiKey) {
      try {
        return {
          ...(await reverseGeocodePosition(latitude, longitude)),
          source: "geolocation",
        };
      } catch (error) {
        console.error("Google reverse geocoding failed:", error);
      }
    }

    return reverseGeocodeWithOpenStreetMap(latitude, longitude);
  };

  const geocodeCityName = async (cityName) => {
    const maps = await withTimeout(
      loadGoogleMapsPlacesApi(googleMapsApiKey),
      7000,
      "Google Maps took too long to load."
    );
    const geocoder = new maps.Geocoder();
    const response = await withTimeout(
      geocoder.geocode({
        address: cityName,
        componentRestrictions: { country: "IN" },
      }),
      7000,
      "Location search took too long."
    );
    const primaryResult = response?.results?.[0];
    if (!primaryResult) throw new Error("Could not find this location.");
    return extractLocationFromPlace(primaryResult);
  };

  const withTimeout = (promise, timeoutMs, message) =>
    Promise.race([
      promise,
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);

  const getFallbackLocationFromCoords = (latitude, longitude) => ({
    city: "Detected Location",
    formattedAddress: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
    latitude,
    longitude,
    source: "geolocation",
  });

  const applyLocationChange = (nextLocation) => {
    if (detectTimeoutRef.current) {
      window.clearTimeout(detectTimeoutRef.current);
      detectTimeoutRef.current = null;
    }
    setLocation(nextLocation);
    onClose();
    if (typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPlaceRef.current) {
      applyLocationChange(extractLocationFromPlace(selectedPlaceRef.current));
      return;
    }

    if (
      resolvedLocationRef.current?.city === city.trim() &&
      resolvedLocationRef.current?.source !== "manual"
    ) {
      applyLocationChange(resolvedLocationRef.current);
      return;
    }

    const manualCity = city.trim() || "Delhi";

    if (!googleMapsApiKey) {
      applyLocationChange({ city: manualCity, formattedAddress: `${manualCity}, India`, source: "manual" });
      return;
    }

    setIsSearchingLocation(true);
    setStatusMessage("Searching location...");

    try {
      const resolvedLocation = await geocodeCityName(manualCity);
      resolvedLocationRef.current = resolvedLocation;
      setSelectedLocationDetails(resolvedLocation);
      setCity(resolvedLocation.city || manualCity);
      applyLocationChange(resolvedLocation);
    } catch (error) {
      console.error("Location search failed:", error);
      applyLocationChange({ city: manualCity, formattedAddress: `${manualCity}, India`, source: "manual" });
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Browser geolocation is not supported on this device.");
      return;
    }
    setIsDetectingLocation(true);
    setStatusMessage("Detecting your current location...");
    detectTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage("Location detection is taking too long. Please allow access or type your city manually.");
      setIsDetectingLocation(false);
      detectTimeoutRef.current = null;
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (detectTimeoutRef.current === null) return;
        const { latitude, longitude } = position.coords;
        try {
          const resolvedLocation = await resolveCurrentLocation(latitude, longitude);
          if (detectTimeoutRef.current === null) return;
          resolvedLocationRef.current = resolvedLocation;
          setSelectedLocationDetails(resolvedLocation);
          setCity(resolvedLocation.city || resolvedLocation.formattedAddress || "Detected Location");
          setStatusMessage("Location detected. Save to apply it.");
        } catch (error) {
          console.error("All reverse geocoding failed:", error);
          if (detectTimeoutRef.current === null) return;
          const fallbackLocation = getFallbackLocationFromCoords(latitude, longitude);
          resolvedLocationRef.current = fallbackLocation;
          setSelectedLocationDetails(fallbackLocation);
          setCity(fallbackLocation.city);
          setStatusMessage("Location detected, but city name could not be resolved. Try typing your city manually.");
        } finally {
          if (detectTimeoutRef.current) {
            window.clearTimeout(detectTimeoutRef.current);
            detectTimeoutRef.current = null;
          }
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation failed:", error);
        if (detectTimeoutRef.current) {
          window.clearTimeout(detectTimeoutRef.current);
          detectTimeoutRef.current = null;
        }
        setStatusMessage("Please allow location access, or type your city manually.");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(15, 23, 42, 0.45)",
        }}
      />

      {/* ── Modal ── */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "calc(100% - 32px)",
          maxWidth: "420px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
          padding: "24px",
          boxSizing: "border-box",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: "14px",
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b" }}>
              Select your location
            </h2>
            <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
              Search for your city or choose one from the list below.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 0, background: "transparent", cursor: "pointer",
              color: "#94a3b8", fontSize: "16px", padding: "2px 0 0 12px",
              lineHeight: 1, flexShrink: 0,
            }}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Selected city card */}
        {city && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "#f0fdfb",
              border: "1px solid #b2f5ea",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "42px", height: "42px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%", background: "#ccfbf1", color: "#0d9488",
              }}
            >
              <FaMapMarkerAlt size={18} />
            </div>
            <div>
              <p style={{
                margin: 0, fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748b",
              }}>
                Selected city
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                {city}
              </p>
              {selectedLocationDetails?.formattedAddress &&
                selectedLocationDetails.formattedAddress !== city && (
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>
                    {selectedLocationDetails.formattedAddress}
                  </p>
                )}
            </div>
          </div>
        )}

        {/* Metro cities grid */}
        <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "#334155" }}>
          Metro cities
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            marginBottom: "22px",
          }}
        >
          {popularCities.map((cityName) => {
            const isSelected = city === cityName;
            return (
              <button
                key={cityName}
                type="button"
                onClick={() => handleSelectPopularCity(cityName)}
                style={{
                  padding: "9px 6px",
                  border: `1px solid ${isSelected ? "#26c6da" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  background: isSelected ? "#e7fbfd" : "#ffffff",
                  color: isSelected ? "#0891b2" : "#475569",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                {cityName}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block", fontSize: "13px",
              fontWeight: 600, color: "#334155", marginBottom: "8px",
            }}
          >
            Enter your city
          </label>
          <input
            ref={inputRef}
            type="text"
            value={city}
            onChange={(e) => {
              const nextCity = e.target.value;
              setCity(nextCity);
              selectedPlaceRef.current = null;
              const nextLocation = {
                city: nextCity,
                formattedAddress: nextCity,
                source: "manual",
              };
              resolvedLocationRef.current = nextLocation;
              setSelectedLocationDetails(nextLocation);
              setStatusMessage("");
            }}
            placeholder="Type your city…"
            style={{
              width: "100%", padding: "11px 14px",
              border: "1.5px solid #e2e8f0", borderRadius: "8px",
              fontSize: "14px", color: "#334155", outline: "none",
              boxSizing: "border-box", marginBottom: "14px",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#26c6da")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />

          {statusMessage && (
            <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#64748b" }}>
              {statusMessage}
            </p>
          )}

          {!googleMapsApiKey && (
            <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#d97706" }}>
              Google autocomplete disabled. Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code>.
            </p>
          )}

          {/* Use Current Location */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetectingLocation || isSearchingLocation}
            style={{
              width: "100%", padding: "11px",
              border: "1.5px solid #26c6da", borderRadius: "8px",
              background: "#ffffff", color: "#26c6da",
              fontSize: "14px", fontWeight: 700,
              cursor: isDetectingLocation || isSearchingLocation ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginBottom: "10px", opacity: isDetectingLocation || isSearchingLocation ? 0.6 : 1,
              boxSizing: "border-box", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!isDetectingLocation && !isSearchingLocation) e.currentTarget.style.background = "#e7fbfd"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            <FaLocationArrow size={13} />
            {isDetectingLocation ? "Detecting…" : "Use Current Location"}
          </button>

          {/* Save Location */}
          <button
            type="submit"
            disabled={isDetectingLocation || isSearchingLocation}
            style={{
              width: "100%", padding: "12px",
              border: 0, borderRadius: "8px",
              background: "#26c6da", color: "#ffffff",
              fontSize: "14px", fontWeight: 700,
              cursor: isDetectingLocation || isSearchingLocation ? "not-allowed" : "pointer", boxSizing: "border-box",
              opacity: isDetectingLocation || isSearchingLocation ? 0.7 : 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!isDetectingLocation && !isSearchingLocation) e.currentTarget.style.background = "#1bb5c8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#26c6da"; }}
          >
            {isSearchingLocation ? "Searching..." : "Save Location"}
          </button>
        </form>
      </div>
    </>
  );
};

export default LocationDialog;
