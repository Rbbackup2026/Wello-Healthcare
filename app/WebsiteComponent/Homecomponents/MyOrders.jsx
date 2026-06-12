"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AccountLayout from "./AccountLayout";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderYear = (order) => {
  const source = order?.createdAt || order?.orderDate || order?.slotDate || order?.updatedAt;
  if (!source) return null;
  const year = new Date(source).getFullYear();
  return Number.isNaN(year) ? null : year;
};

const getBookingId = (order) => {
  if (order?.bookingId) return order.bookingId;
  if (order?.orderId) return order.orderId;
  const id = String(order?._id || "");
  return id ? id.slice(-11).toUpperCase() : "N/A";
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

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
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const availableYears = useMemo(() => {
    const years = orders
      .map(getOrderYear)
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [orders]);

  useEffect(() => {
    if (availableYears.length === 0) return;
    if (!availableYears.includes(Number(selectedYear))) {
      setSelectedYear(String(availableYears[0]));
    }
  }, [availableYears, selectedYear]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => String(getOrderYear(order)) === selectedYear),
    [orders, selectedYear]
  );

  return (
    <AccountLayout activePage="bookings">
      <div className="bookings-panel">
        <div className="bookings-panel-header">
          <h1>My Bookings</h1>
          <div className="bookings-year-filter">
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              aria-label="Filter bookings by year"
            >
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bookings-panel-body">
          {loading ? (
            <div className="bookings-empty">Loading your bookings...</div>
          ) : !user ? (
            <div className="bookings-empty">
              <p>Please log in to view your bookings.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bookings-empty">
              <h2>No bookings found</h2>
              <p>Your test bookings will appear here once you place them.</p>
              <Link href="/lab-tests" className="bookings-browse-btn">
                Browse Tests
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredOrders.map((order) => {
                const orderDate = formatDate(order.createdAt || order.orderDate);
                const collectionDate = formatDate(order.slotDate);
                const price = order.totalAmount || order.amount || 0;

                return (
                  <article key={order._id} className="booking-card">
                    <div className="booking-card-main">
                      <h2 className="booking-card-name">{order.patientName || user?.name || "Patient"}</h2>

                      <dl className="booking-card-details">
                        <div>
                          <dt>Booking ID</dt>
                          <dd>{getBookingId(order)}</dd>
                        </div>
                        <div>
                          <dt>Order Status</dt>
                          <dd>{order.status || "Pending"}</dd>
                        </div>
                        <div>
                          <dt>Order Date</dt>
                          <dd>{orderDate}</dd>
                        </div>
                        <div>
                          <dt>Sample Collection Date</dt>
                          <dd>{collectionDate}</dd>
                        </div>
                        <div>
                          <dt>Order Price</dt>
                          <dd>₹{Number(price).toLocaleString("en-IN")}</dd>
                        </div>
                      </dl>

                      <Link
                        href={`/order-confirmation/${order._id}`}
                        className="booking-summary-btn"
                      >
                        Booking Summary
                      </Link>
                    </div>

                    <Link
                      href={`/order-confirmation/${order._id}`}
                      className="booking-tracking-panel"
                    >
                      <span className="booking-tracking-icon" aria-hidden="true">
                        📄
                      </span>
                      <span>Order Tracking</span>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
};

export default MyOrders;
