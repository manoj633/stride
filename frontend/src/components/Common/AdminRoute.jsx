import React from "react";
import { useAppSelector } from "../../store/hooks";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { userInfo } = useAppSelector((state) => state.user);
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  if (userInfo.twoFactorAuthSetup) {
    return <Navigate to="/two-factor-setup" replace />;
  }
  if (!userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
