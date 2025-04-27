import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import { AuthService } from "@/services/auth/authService";

// Define the auth context type
interface AuthContextType {
  user: any | null;
  setUser: React.Dispatch<any>;
  isAuthenticated: boolean | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
  // login: (userData: any) => void;
  // logout: () => void;
}

// Create a context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
const bypassAuthCheckRoutes: Record<string, boolean> = {
  "/login": true,
  "/register": true,
  "/confirm": true,
};
// AuthProvider component to wrap around your app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // const location = useLocation();
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted: boolean = true;
    const currPath = window.location.pathname;

    const authCheck = async () => {
      try {
        const res = await AuthService.authCheck();
        if (isMounted)
          if (res.status === 200) setIsAuthenticated(true);
          else setIsAuthenticated(false);
      } catch (err) {
        if (isMounted) setIsAuthenticated(false);
      }
    };

    if (!bypassAuthCheckRoutes[currPath]) authCheck();
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    // login,
    // logout
  };

  // const

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
