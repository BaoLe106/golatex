import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoutes = () => {
  const [accessToken, _] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
