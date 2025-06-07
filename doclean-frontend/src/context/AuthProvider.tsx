import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
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
  const { sessionId } = useParams<{ sessionId: string }>();
  useEffect(() => {
    let isMounted: boolean = true;
    const sessionId = window.location.pathname.split("/project/")[1];
    getProjectByProjectId(sessionId);
    // const authCheck = async () => {
    //   try {
    //     const res = await AuthService.authCheck();
    //     if (isMounted)
    //       if (res.status === 200) setIsAuthenticated(true);
    //       else setIsAuthenticated(false);
    //   } catch (err) {
    //     if (isMounted) setIsAuthenticated(false);
    //   }
    // };

    // if (!bypassAuthCheckRoutes[currPath]) authCheck();
  }, []);

  const getProjectByProjectId = async (projectId: string) => {
    try {
      const res = await ProjectService.getProjectByProjectId(projectId);
      console.log("debug project res", res)
      setProjectShareType(res.projectShareType);
      if (res.projectShareType === 1) setIsAuthenticated(true);
      else setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  const tempSignIn = async (email: string) => {
    try {
      const sessionId = window.location.pathname.split("/project/")[1];
      await AuthService.tempSignIn(sessionId, email);
      setIsAuthenticated(true);
    } catch (err) {
      console.log("debug err", err )
    }
  }

  const value = {
    user,
    setUser,
    projectShareType, 
    setProjectShareType,
    isAuthenticated,
    setIsAuthenticated,
    tempSignIn
    // login,
    // logout
  };

  // const

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
