import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, clearToken, getToken, OdrSession, LoginResponse } from "@/lib/api";

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
  /** Gerçek login — 2FA / verification sonucu döner, yönlendirme çağırana ait */
  login: (email: string, password: string) => Promise<LoginResponse>;
  /** Demo giriş — API çağrısı olmadan anında giriş */
  demoLogin: (role: "student" | "teacher") => void;
  /** 2FA tamamlandıktan sonra kullanıcıyı context'e yükler */
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Supabase auth ile doğrulanmış admin kullanıcısını context'e yükler */
  loginAsAdmin: (session: OdrSession) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({} as LoginResponse),
  demoLogin: () => {},
  refreshUser: async () => {},
  signOut: async () => {},
  loginAsAdmin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<OdrSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authApi.login(email, password);
    // 2FA / verification gerekmiyorsa login yanıtındaki kullanıcı bilgisini direkt kullan
    if (
      !response.sessionNeedsEmail2FA &&
      !response.sessionNeedsMobile2FA &&
      !response.emailVerificationNeeded &&
      !response.mobileVerificationNeeded
    ) {
      setUser({
        userId: response.userId,
        email: response.email,
        fullname: response.fullname,
        roleId: response.roleId,
        avatar: response.avatar,
        sessionId: response.sessionId,
      });
    }
    return response;
  };

  const demoLogin = (role: "student" | "teacher") => {
    localStorage.setItem(DEMO_KEY, role);
    setUser(DEMO_USERS[role]);
  };

  const refreshUser = async () => {
    const userData = await authApi.currentUser();
    setUser(userData);
  };

  const signOut = async () => {
    const isDemo = !!localStorage.getItem(DEMO_KEY);
    localStorage.removeItem(DEMO_KEY);
    if (!isDemo) await authApi.logout();
    setUser(null);
  };

  const loginAsAdmin = (session: OdrSession) => {
    setUser(session);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, demoLogin, refreshUser, signOut, loginAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
