"use client";

import { useEffect } from "react";
import axios from "axios";

let configured = false;

function clearAdminSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("adminTokenExpiry");
  localStorage.removeItem("adminLoginTime");
}

function isAdminTokenExpired() {
  const expiry = localStorage.getItem("adminTokenExpiry");
  if (!expiry) return false;
  return Date.now() > parseInt(expiry, 10);
}

export default function AdminAxiosAuth() {
  useEffect(() => {
    if (configured) return;
    configured = true;

    axios.interceptors.request.use((config) => {
      if (isAdminTokenExpired()) {
        clearAdminSession();
        if (typeof window !== "undefined" && !window.location.pathname.includes("admin_index")) {
          window.location.href = "/admin_index";
        }
        return Promise.reject(new Error("Admin session expired. Please login again."));
      }

      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "";
        const isAuthFailure =
          status === 401 &&
          (message.includes("token") ||
            message.includes("Authentication") ||
            message.includes("login"));

        if (isAuthFailure && typeof window !== "undefined") {
          clearAdminSession();
          if (!window.location.pathname.includes("admin_index")) {
            window.location.href = "/admin_index";
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);

  return null;
}
