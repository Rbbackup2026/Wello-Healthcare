"use client";

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Footer from "../../Homecomponents/Footer";
import TopBar from "../../Homecomponents/TopBar";
import Navbar from "../../Homecomponents/Navbar";

const ReportsPage = () => {
  const [orderId, setOrderId] = useState("");
  const [member, setMember] = useState("All");
  const [date, setDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncCustomerLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("customerToken"));
    };

    syncCustomerLogin();

    window.addEventListener("customer-auth-changed", syncCustomerLogin);
    window.addEventListener("storage", syncCustomerLogin);

    return () => {
      window.removeEventListener("customer-auth-changed", syncCustomerLogin);
      window.removeEventListener("storage", syncCustomerLogin);
    };
  }, []);

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <div className="bg-gray-50 p-6">
        <div className="mb-4 text-sm text-gray-600">
          <span className="cursor-pointer text-blue-500 hover:underline">Home</span>
          <span className="mx-1">{">"}</span>
          <span className="font-medium text-gray-800">Reports</span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold text-teal-600">ALL ORDERS</h3>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-md border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-teal-600">Member Name</h3>
            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>All</option>
              <option>John Doe</option>
              <option>Jane Smith</option>
            </select>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-teal-600">Booking Date</h3>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Date</option>
              <option value="2025-09-01">01 Sep 2025</option>
              <option value="2025-09-05">05 Sep 2025</option>
            </select>
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="rounded-md border bg-gray-50 p-6 text-center text-blue-900">
            Please login to view reports
          </div>
        ) : (
          <div className="rounded-md border bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">Your Reports</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Member Name</th>
                  <th className="border p-2">Booking Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">#12345</td>
                  <td className="border p-2">John Doe</td>
                  <td className="border p-2">01 Sep 2025</td>
                  <td className="border p-2 text-green-600">Completed</td>
                </tr>
                <tr>
                  <td className="border p-2">#12346</td>
                  <td className="border p-2">Jane Smith</td>
                  <td className="border p-2">05 Sep 2025</td>
                  <td className="border p-2 text-yellow-600">Pending</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReportsPage;
