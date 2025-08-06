import React from "react";
import { useAppSelector } from "../../store/hooks";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppSelector((state) => state.user);
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
