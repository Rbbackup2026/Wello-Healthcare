"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../../WebsiteComponent/Homecomponents/TopBar";
import Navbar from "../../WebsiteComponent/Homecomponents/Navbar";
import Footer from "../../WebsiteComponent/Homecomponents/Footer";
import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const BASE_URL = "http://localhost:3000";

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const storedUser = window.localStorage.getItem("customerUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);

    const fetchAddresses = async () => {
      if (!parsedUser) {
        setLoading(false);
        return;
      }

      try {
        const userId = parsedUser._id || parsedUser.id;
        const res = await axios.get(`${BASE_URL}/v1/api/get-saved-addresses/${userId}`);
        setAddresses(res.data.savedAddresses || []);
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-bold text-teal-600">
        Loading your addresses...
      </div>
    );
  }

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#F0F9FF] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="border-l-4 border-teal-500 pl-4 text-3xl font-extrabold text-blue-900">
              Saved Addresses
            </h1>
            <button className="flex items-center gap-2 rounded-xl bg-[#25C0DC] px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1a96a8]">
              <FaPlus size={14} /> Add New
            </button>
          </div>

          {!user ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
              <p className="text-lg text-gray-600">Please log in to see your saved addresses.</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xl">
              <div className="mb-4 text-6xl">Home</div>
              <h2 className="text-2xl font-bold text-gray-800">No saved addresses</h2>
              <p className="mt-2 text-gray-500">You haven&apos;t saved any addresses yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="flex-shrink-0 rounded-full bg-teal-50 p-3 text-teal-600">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-gray-800">
                      {addr.type || "Saved Address"}
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      {typeof addr === "string" ? addr : addr.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SavedAddresses;
