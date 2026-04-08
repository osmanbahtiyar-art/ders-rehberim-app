import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, friendlyError } from "@/lib/api";
import { toast } from "sonner";

const ADMIN_ROLES = ["superAdmin", "admin"];

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Zaten admin olarak giriş yapılmışsa direkt panele gönder
  useEffect(() => {
    if (!loading && user && ADMIN_ROLES.includes(user.roleId)) {
      navigate("/admin", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await login(email, password);

      // 2FA / doğrulama akışları
      if (res.emailVerificationNeeded) {
        toast.error("E-posta doğrulaması gerekiyor.");
        setSubmitting(false);
        return;
      }
      if (res.sessionNeedsEmail2FA) {
        navigate("/2fa", { state: { type: "email", userId: res.userId, sessionId: res.sessionId, redirectTo: "/admin" } });
        return;
      }
      if (res.sessionNeedsMobile2FA) {
        navigate("/2fa", { state: { type: "mobile", userId: res.userId, sessionId: res.sessionId, redirectTo: "/admin" } });
        return;
      }

      // Rol kontrolü — sadece admin/superAdmin geçebilir
      if (!ADMIN_ROLES.includes(res.roleId ?? "")) {
        toast.error("Bu hesabın admin paneline erişim yetkisi yok.");
        setSubmitting(false);
        return;
      }

      toast.success("Admin paneline hoş geldiniz!");
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const badCreds = ["invalid_credentials", "InvalidCredentials", "WrongPassword"];
        toast.error(badCreds.includes(err.errCode) ? "E-posta veya şifre hatalı." : friendlyError(err));
      } else {
        toast.error(friendlyError(err));
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6">
      {/* Arka plan deseni */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo & Başlık */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Girişi</h1>
          <p className="mt-1.5 text-sm text-gray-400">
            OzelDers Yönetim Paneline erişmek için <br className="hidden sm:block" />
            admin kimlik bilgilerinizi girin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-300">E-posta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="admin@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="border-gray-700 bg-gray-900 pl-10 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-gray-300">Şifre</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-gray-700 bg-gray-900 pl-10 pr-10 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !email || !password}
            className="mt-2 w-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-500/20 transition-all"
            size="lg"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Giriş yapılıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Olarak Giriş Yap
              </span>
            )}
          </Button>
        </form>

        {/* Alt link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Normal kullanıcı girişine dön
          </button>
        </div>

        {/* Güvenlik notu */}
        <div className="mt-8 flex items-start gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <p className="text-xs text-gray-500">
            Bu sayfa yalnızca yetkili yöneticiler içindir. Yetkisiz erişim girişimleri kayıt altına alınır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
