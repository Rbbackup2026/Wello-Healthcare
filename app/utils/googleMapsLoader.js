const GOOGLE_MAPS_SCRIPT_ID = "google-maps-js-sdk";

let googleMapsPromise = null;
let activeGoogleMapsKey = null;

export const loadGoogleMapsPlacesApi = (apiKey) => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Maps can only load in the browser.")
    );
  }

  if (!apiKey) {
    return Promise.reject(
      new Error("Missing Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.")
    );
  }

  if (window.google?.maps?.places && activeGoogleMapsKey === apiKey) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise && activeGoogleMapsKey === apiKey) {
    return googleMapsPromise;
  }

  const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

  if (existingScript && activeGoogleMapsKey !== apiKey) {
    existingScript.remove();
    googleMapsPromise = null;

    if (window.google) {
      delete window.google;
    }
  }

  activeGoogleMapsKey = apiKey;
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

    script.onload = () => {
      resolve(window.google.maps);
    };

    script.onerror = () => {
      googleMapsPromise = null;
      activeGoogleMapsKey = null;
      reject(new Error("Google Maps script failed to load."));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
