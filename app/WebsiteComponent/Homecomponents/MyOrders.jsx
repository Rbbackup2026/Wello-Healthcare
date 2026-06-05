"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "../../lib/routerCompat";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const storedUser = window.localStorage.getItem("customerUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);

    const fetchOrders = async () => {
      if (!parsedUser) {
        setLoading(false);
        return;
      }

      try {
        const userId = parsedUser._id || parsedUser.id;
        const res = await axios.get(`http://localhost:3000/v1/api/orders/${userId}`);
        const ordersData = res.data.orders || res.data || [];
        setOrders(Array.isArray(ordersData) ? [...ordersData].reverse() : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-bold text-teal-600">
        Loading your booking history...
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
          <h1 className="mb-8 border-l-4 border-teal-500 pl-4 text-3xl font-extrabold text-blue-900">
            My Bookings
          </h1>

          {!user ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
              <p className="text-lg text-gray-600">Please log in to see your orders.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xl">
              <div className="mb-4 text-6xl">List</div>
              <h2 className="text-2xl font-bold text-gray-800">No bookings yet</h2>
              <p className="mt-2 text-gray-500">
                Your test bookings will appear here once you place them.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-[#25C0DC] px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-[#1a96a8]"
              >
                Browse Tests
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              order.status === "Completed" ? "bg-green-500" : "bg-orange-400"
                            }`}
                          />
                          <span className="text-sm font-bold uppercase tracking-tighter text-gray-700">
                            {order.status || "Pending"}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-gray-400">ID: {order._id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-teal-600">
                          Rs. {order.totalAmount || order.amount}
                        </p>
                        <p className="text-xs text-gray-500">{order.slotDate}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-50 pt-4">
                      <h4 className="mb-2 text-sm font-bold text-gray-800">
                        Patient: {order.patientName}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Link
                        to={`/order-confirmation/${order._id}`}
                        className="flex items-center gap-1 text-sm font-bold text-blue-500 hover:text-blue-700"
                      >
                        View Details {"->"}
                      </Link>
                    </div>
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

export default MyOrders;
