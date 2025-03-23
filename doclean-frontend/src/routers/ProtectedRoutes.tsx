import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth/authService";

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
