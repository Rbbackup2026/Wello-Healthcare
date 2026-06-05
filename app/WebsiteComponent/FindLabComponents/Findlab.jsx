"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "../../lib/routerCompat";
import Navbar from "../Homecomponents/Navbar";
import TopBar from "../Homecomponents/TopBar";
import Footer from "../Homecomponents/Footer";
import {
  slugifyLocation,
  useLocation,
} from "../../Components/MainRoute/LocationContext";
import {
  deslugifyLocation,
  fetchCityCollection,
  mapApiLab,
} from "../../utils/cityApi";

const Findlab = () => {
  const { citySlug } = useParams();
  const { location, locationLabel } = useLocation();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestedCity = useMemo(() => {
    if (!citySlug) {
      return location.city || "Delhi";
    }

    return citySlug === slugifyLocation(location.city)
      ? location.city
      : deslugifyLocation(citySlug);
  }, [citySlug, location.city]);

  useEffect(() => {
    let isMounted = true;

    const loadLabs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchCityCollection("getlab", requestedCity);
        if (!isMounted) {
          return;
        }

        setLabs(response.map(mapApiLab));
      } catch (fetchError) {
        console.error("Failed to fetch city labs:", fetchError);
        if (isMounted) {
          setError("Labs could not be loaded for this city right now.");
          setLabs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLabs();

    return () => {
      isMounted = false;
    };
  }, [requestedCity]);

  const embedSource = useMemo(() => {
    if (location.latitude && location.longitude && requestedCity === location.city) {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=12&output=embed`;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(
      requestedCity || location.formattedAddress || locationLabel
    )}&z=12&output=embed`;
  }, [
    location.city,
    location.formattedAddress,
    location.latitude,
    location.longitude,
    locationLabel,
    requestedCity,
  ]);

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <div className="p-6 space-y-6">
        <div className="text-sm text-gray-500">
          Home <span className="mx-2">{">"}</span>
          <span className="text-blue-600 font-medium">Find a Lab</span>
        </div>

        <h2 className="text-xl font-bold text-blue-900">
          FIND A LAB IN {requestedCity.toUpperCase()}
        </h2>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <select className="border rounded-md px-3 py-2 w-full md:w-48">
            <option>STATE</option>
            <option>{location.state || "Delhi"}</option>
          </select>
          <select className="border rounded-md px-3 py-2 w-full md:w-48">
            <option>CITY</option>
            <option>{requestedCity}</option>
          </select>
          <select className="border rounded-md px-3 py-2 w-full md:w-48">
            <option>AREA</option>
            <option>All Areas</option>
          </select>
          <div className="ml-auto text-sm text-slate-600">
            Active location: <strong>{location.formattedAddress || requestedCity}</strong>
          </div>
        </div>

        <div className="w-full h-96 rounded-md overflow-hidden border">
          <iframe
            src={embedSource}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
        </div>

        <p className="text-sm text-gray-600">
          {loading ? "Loading labs..." : `${labs.length} labs found`}
        </p>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-white shadow-md rounded-lg p-4 border"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-blue-900">{lab.name}</h3>
                  <p className="text-blue-600 font-medium">
                    {lab.area} ({lab.type})
                  </p>
                  <p className="text-gray-700 mt-1">{lab.address}</p>
                  {lab.phoneNumber ? (
                    <p className="text-xs text-gray-500 mt-1">Phone: {lab.phoneNumber}</p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <button className="text-blue-600 font-semibold hover:underline">
                    See Details
                  </button>
                  <button className="bg-blue-900 text-white px-4 py-2 rounded-md">
                    Walk In
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && labs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No labs were returned for <strong>{requestedCity}</strong>.
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Findlab;
