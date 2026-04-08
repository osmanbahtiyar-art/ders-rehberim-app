import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, clearToken, getToken, OdrSession } from "@/lib/api";

const DEMO_USERS: Record<string, OdrSession> = {
  student: {
    userId: "demo-student",
    email: "demo.student@ozelders.com",
    fullname: "Demo Öğrenci",
    roleId: "student",
    avatar: "https://ui-avatars.com/api/?name=Demo+%C3%96%C4%9Frenci&background=6366f1&color=fff",
  },
  teacher: {
    userId: "demo-teacher",
    email: "demo.teacher@ozelders.com",
    fullname: "Demo Öğretmen",
    roleId: "teacher",
    avatar: "https://ui-avatars.com/api/?name=Demo+%C3%96%C4%9Fretmen&background=f59e0b&color=fff",
  },
};

const DEMO_KEY = "odr-demo-role";

interface AuthContextType {
  user: OdrSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: "student" | "teacher") => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  demoLogin: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<OdrSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo oturumu kontrolü
    const demoRole = localStorage.getItem(DEMO_KEY) as "student" | "teacher" | null;
    if (demoRole && DEMO_USERS[demoRole]) {
      setUser(DEMO_USERS[demoRole]);
      setLoading(false);
      return;
    }
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi.currentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    const userData = await authApi.currentUser();
    setUser(userData);
  };

  const demoLogin = (role: "student" | "teacher") => {
    localStorage.setItem(DEMO_KEY, role);
    setUser(DEMO_USERS[role]);
  };

  const signOut = async () => {
    const isDemo = !!localStorage.getItem(DEMO_KEY);
    localStorage.removeItem(DEMO_KEY);
    if (!isDemo) await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, demoLogin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
