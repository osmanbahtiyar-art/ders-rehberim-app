import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, friendlyError } from "@/lib/api";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { GraduationCap, BookOpen } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Öğrenci", role: "student" as const, icon: GraduationCap, variant: "hero" as const },
  { label: "Öğretmen", role: "teacher" as const, icon: BookOpen, variant: "accent" as const },
];

const Login = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);

      // Email doğrulama gerekiyor
      if (res.emailVerificationNeeded) {
        navigate("/verify-email", { state: { email } });
        return;
      }
      // Mobile doğrulama gerekiyor
      if (res.mobileVerificationNeeded) {
        navigate("/verify-mobile", { state: { email } });
        return;
      }
      // 2FA gerekiyor
      if (res.sessionNeedsEmail2FA) {
        navigate("/2fa", { state: { type: "email", userId: res.userId, sessionId: res.sessionId } });
        return;
      }
      if (res.sessionNeedsMobile2FA) {
        navigate("/2fa", { state: { type: "mobile", userId: res.userId, sessionId: res.sessionId } });
        return;
      }

      toast.success("Giriş başarılı!");
      navigate("/home");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.errCode === "EmailVerificationNeeded") {
          navigate("/verify-email", { state: { email } });
          return;
        }
        if (err.errCode === "MobileVerificationNeeded") {
          navigate("/verify-mobile", { state: { email } });
          return;
        }
        toast.error(err.errCode === "invalid_credentials" ? "E-posta veya şifre hatalı" : err.message);
      } else {
        toast.error(friendlyError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[number]) => {
    demoLogin(account.role);
    toast.success(`${account.label} demo hesabıyla giriş yapıldı!`);
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="Logo" width={56} height={56} />
          <h1 className="mt-3 text-xl font-bold text-foreground">Giriş Yap</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hesabınıza giriş yapın</p>
        </div>

        {/* Demo Hesapları */}
        <div className="mb-6 rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Demo Hesapları
          </p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.label}
                variant={account.variant}
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => handleDemoLogin(account)}
              >
                <account.icon className="h-3.5 w-3.5" />
                {account.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">veya e-posta ile giriş yap</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-primary hover:underline"
              >
                Şifremi Unuttum
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <button onClick={() => navigate("/register")} className="font-medium text-primary hover:underline">
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
