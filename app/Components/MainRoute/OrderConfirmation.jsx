"use client";

import React, { useEffect, useState } from "react";
import { Link, useParams } from "../../lib/routerCompat";
import axios from "axios";
import { FaHome, FaCheckCircle } from "react-icons/fa";
import TopBar from "../../WebsiteComponent/Homecomponents/TopBar";
import Navbar from "../../WebsiteComponent/Homecomponents/Navbar";
import Footer from "../../WebsiteComponent/Homecomponents/Footer";
import { toApiUrl } from "../../utils/api";

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // मान लें कि backend में यह endpoint है जो ID से order देता है
        const res = await axios.get(toApiUrl(`/order/${id}`));
        setOrder(res.data.order || res.data);
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-teal-600 text-xl font-bold">
        Fetching Booking Details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        Booking details not found!
      </div>
    );
  }

  return (
    <>
      <div className="wello-sticky-header">
        <TopBar />
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#F0F9FF] py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100">
          {/* Header Section */}
          <div className="bg-teal-500 p-10 text-center text-white">
            <FaCheckCircle className="text-7xl mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-extrabold tracking-tight">Thank You!</h1>
            <p className="text-teal-50 text-lg mt-3 font-medium opacity-90">
              Your booking has been successfully placed.
            </p>
            <div className="mt-4 bg-white/20 inline-block px-4 py-1 rounded-full text-sm font-mono tracking-wider">
              ORDER ID: {id}
            </div>
          </div>

          <div className="p-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Patient Details */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-teal-500 pb-2 inline-block">
                  Booking Summary
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Patient Name</label>
                    <p className="text-xl font-bold text-gray-800">{order.patientName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visit Address</label>
                    <p className="text-gray-700 leading-relaxed">{order.address}</p>
                  </div>
                  <div className="flex gap-10">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slot Date</label>
                      <p className="text-gray-800 font-semibold">{order.slotDate}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time Slot</label>
                      <p className="text-gray-800 font-semibold">{order.slotTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-teal-50/50 p-8 rounded-2xl border border-teal-100 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-tighter">Payment Status</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="text-2xl font-black text-teal-600">Rs. {order.totalAmount || order.amount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-teal-200 mt-2">
                  <span className="text-gray-500 text-sm italic">Method</span>
                  <span className="font-bold text-gray-700">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Home Icon Navigation */}
            <div className="mt-12 text-center border-t border-slate-100 pt-10">
              <Link
                to="/"
                className="inline-flex items-center gap-3 bg-[#25C0DC] text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-[#1a96a8] shadow-xl hover:shadow-teal-200 transition-all active:scale-95 group"
              >
                <FaHome className="text-2xl group-hover:-translate-y-1 transition-transform" />
                GO TO HOME
              </Link>
              <p className="mt-6 text-gray-400 text-sm font-medium italic">
                Our team will reach out to you shortly for the sample collection.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
