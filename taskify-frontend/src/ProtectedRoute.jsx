// src/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "./api";

/**
 * ProtectedRoute
 *
 * - If a valid access token exists -> allow access.
 * - If no access token but a refresh token exists -> attempt refresh once.
 *   While refresh is in progress, show a loading/checking state (do NOT redirect).
 * - If refresh succeeds -> store new tokens and allow access.
 * - If refresh fails or no refresh token -> redirect to /login.
 *
 * This prevents the immediate redirect-before-refresh race that caused the
 * frontend to go to the login page without ever calling /users/refresh.
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [checking, setChecking] = useState(false);   // true while trying refresh
  const [canProceed, setCanProceed] = useState(false); // true when access allowed

  // Read tokens & roles from localStorage (synchronous read OK)
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  let roles = [];
  try {
    const rolesRaw = localStorage.getItem("roles");
    roles = rolesRaw ? JSON.parse(rolesRaw) : [];
  } catch (e) {
    roles = [];
  }

  useEffect(() => {
    let didCancel = false;

    // If access token exists, allow proceeding immediately
    if (token) {
      setCanProceed(true);
      return;
    }

    // If no access token but we have a refresh token -> try refresh
    if (!token && refreshToken) {
      setChecking(true);
      (async () => {
        try {
          const res = await api.post("/users/refresh", { refreshToken });
          // backend might return { accessToken, refreshToken } or { token, refreshToken }
          const newAccess = res.data?.accessToken || res.data?.token;
          const newRefresh = res.data?.refreshToken || refreshToken;

          if (!newAccess) throw new Error("No access token returned from refresh");

          // store both keys for compatibility
          localStorage.setItem("accessToken", newAccess);
          localStorage.setItem("token", newAccess);
          if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

          if (!didCancel) {
            setCanProceed(true);
          }
        } catch (err) {
          // refresh failed -> ensure tokens removed so app knows to redirect
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          if (!didCancel) {
            setCanProceed(false);
          }
        } finally {
          if (!didCancel) setChecking(false);
        }
      })();
    }
    // If no token and no refreshToken -> we will redirect (canProceed remains false)
    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Important: while we are *checking*, do not redirect. Let the refresh attempt finish.
  if (checking) {
    // Optionally render a spinner / skeleton. Keep it simple so routing waits.
    return null;
  }

  // Only redirect to login when we are NOT checking, there is no token and refresh didn't succeed
  if (!token && !canProceed) {
    return <Navigate to="/login" replace />;
  }

  // Role gating (unchanged)
  if (requiredRole && !roles.includes(requiredRole)) {
    alert("You are not authorized to access this page.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
