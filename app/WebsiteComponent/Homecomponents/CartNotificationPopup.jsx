"use client";

import React, { useEffect, useState } from "react";
import { Button, Paper, Typography, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "../../lib/routerCompat";
import { useCart } from "../../Components/MainRoute/CartContext";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";

const CartNotificationPopup = ({ currentUserId }) => {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const hasCartItems = Array.isArray(cartItems) && cartItems.length > 0;

  const fetchNotifications = async () => {
    if (!currentUserId || !hasCartItems) {
      console.log("Skipping notification fetch because user has no cart items or user is not logged in.");
      setNotification(null);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/notifications/${currentUserId}?t=${Date.now()}`
      );

      console.log("Notification response:", res.data);

      const data =
        res.data?.data ||
        res.data?.notifications ||
        res.data?.notification ||
        res.data;

      if (Array.isArray(data) && data.length > 0) {
        setNotification(data[0]);
      } else if (
        data &&
        typeof data === "object" &&
        (data._id || data.id || data.message || data.body || data.title)
      ) {
        setNotification(data);
      } else {
        setNotification(null);
      }
    } catch (err) {
      console.error("Notification fetch failed", err);
      setNotification(null);
    }
  };

  useEffect(() => {
    if (currentUserId && hasCartItems) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 1000000);
      return () => clearInterval(interval);
    }

    setNotification(null);
    return undefined;
  }, [currentUserId, hasCartItems]);

  const handleDismiss = () => setNotification(null);

  const markAsSeenOnServer = async () => {
    const notificationId = notification?._id || notification?.id;
    if (!notificationId) return;

    try {
      await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/seen`);
    } catch (err) {
      console.error("Failed to mark seen", err);
    }
  };

  const handleCompleteOrder = () => {
    markAsSeenOnServer();
    setNotification(null);
    navigate("/cart_section");
  };

  if (!notification || !hasCartItems) return null;

  return (
    <Paper
      key={notification._id || notification.id}
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 340,
        borderRadius: 3,
        p: 2.5,
        zIndex: 9999,
        borderLeft: "5px solid #1976d2",
        animation: "slideIn 0.3s ease",
        "@keyframes slideIn": {
          from: { transform: "translateX(120%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="center">
          <ShoppingCartIcon color="primary" />
          <Typography fontWeight={700} fontSize={15}>
            Cart Reminder
          </Typography>
        </Stack>
        <IconButton size="small" onClick={handleDismiss}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
        {notification.message || notification.body || notification.title}
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button variant="contained" size="small" fullWidth onClick={handleCompleteOrder}>
          Complete Order
        </Button>
        <Button variant="outlined" size="small" fullWidth onClick={handleDismiss}>
          Later
        </Button>
      </Stack>
    </Paper>
  );
};

export default CartNotificationPopup;
