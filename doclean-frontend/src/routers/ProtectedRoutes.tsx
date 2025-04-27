import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth/authService";
import { useAuth } from "@/context/AuthProvider";

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const res = await AuthService.authCheck();
  //       if (res.status === 200) {
  //         setIsAuthenticated(true);
  //       }
  //     } catch (error) {
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Optional loading state
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
