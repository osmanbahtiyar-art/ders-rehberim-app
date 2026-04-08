import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, clearToken, getToken, OdrSession } from "@/lib/api";

interface AuthContextType {
  user: OdrSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<OdrSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const signOut = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
