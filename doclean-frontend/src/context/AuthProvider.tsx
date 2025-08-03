import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/services/auth/authService";
import { ProjectService } from "@/services/projects/projectService";

// Define the auth context type
interface AuthContextType {
  user: any | null;
  setUser: React.Dispatch<any>;
  projectShareType: number;
  setProjectShareType: React.Dispatch<React.SetStateAction<number>>;
  isAuthenticated: boolean | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
  tempSignIn: (email: string) => Promise<void>;
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
  const [projectShareType, setProjectShareType] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted: boolean = true;
    const currentPath = window.location.pathname;
    const sessionId = currentPath.split("/project/")[1];
    const authCheck = async (sessionId: string) => {
      try {
        const res = await AuthService.tempAuthCheck(sessionId);
        if (isMounted && res.status === 200) setIsAuthenticated(true);
      } catch (err: any) {
        // if (err?.status !== 401 && isMounted)
        setIsAuthenticated(false);
      }
    };
    if (!sessionId) {
      setIsAuthenticated(false);
      return;
    }
    if (!bypassAuthCheckRoutes[currentPath] && sessionId) authCheck(sessionId);
    getProjectByProjectId(sessionId);
  }, []);

  const getProjectByProjectId = async (projectId: string) => {
    try {
      const res = await ProjectService.getProjectByProjectId(projectId);
      setProjectShareType(res.projectShareType);
      // if (isAuthenticated !== true && res.projectShareType !== 2) {
      //   setIsAuthenticated(true);
      // } else {
      //   setIsAuthenticated(false);
      // }
    } catch (err) {
      console.error(err);
    }
  };

  const tempSignIn = async (email: string) => {
    try {
      const sessionId = window.location.pathname.split("/project/")[1];
      await AuthService.tempSignIn(sessionId, email);
      setIsAuthenticated(true);
    } catch (err) {}
  };

  const value = {
    user,
    setUser,
    projectShareType,
    setProjectShareType,
    isAuthenticated,
    setIsAuthenticated,
    tempSignIn,
    // login,
    // logout
  };

  // const

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
