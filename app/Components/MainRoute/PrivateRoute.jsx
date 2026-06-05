// src/Components/MainRoute/PrivateRoute.js
import React from "react";
import { Navigate } from "../../lib/routerCompat";

const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/admin_index" replace />;
};

export default PrivateRoute;
