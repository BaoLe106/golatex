// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { getToken, logout } from "@/services/auth/authService";
// import Layout from "@/components/layouts/layout";
// import LayoutAuthenticated from "@/components/layouts/layout-authenticated";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  currentUserEmail: string;
  setCurrentUserMail: (email: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  currentUserEmail: "",
  setCurrentUserMail: () => {},
  logoutUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(getToken());
  const [currentUserEmail, setCurrentUserMail] = useState<string>("");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      // window.location.href = "/login";
    }
  }, [token]);

  const logoutUser = () => {
    logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        currentUserEmail,
        setCurrentUserMail,
        logoutUser,
      }}
    >
      {children}
      {/* {!token ? (
        // {children?.toString()}
        <Layout>{children}</Layout>
      ) : (
        <LayoutAuthenticated>{children}</LayoutAuthenticated>
      )} */}
    </AuthContext.Provider>
  );
};
