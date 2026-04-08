import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { verificationApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import OtpInput from "@/components/OtpInput";

const RESEND_COOLDOWN = 60;

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const type: "email" | "mobile" = location.state?.type || "email";
  const userId: string = location.state?.userId || "";
  const sessionId: string = location.state?.sessionId || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(true);
  const [codeIndex, setCodeIndex] = useState<number | null>(null);
  const [testCode, setTestCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const callStart = async () => {
    setStartLoading(true);
    try {
      const fn = type === "email" ? verificationApi.email2FAStart : verificationApi.mobile2FAStart;
      const res = await fn(userId, sessionId);
      setCodeIndex(res.codeIndex);
      if (res.secretCode) setTestCode(res.secretCode);
      startCooldown();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kod gönderilemedi";
      toast.error(msg);
    } finally {
      setStartLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !sessionId) { navigate("/login"); return; }
    callStart();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    try {
      const fn = type === "email" ? verificationApi.email2FAComplete : verificationApi.mobile2FAComplete;
      const res = await fn(userId, sessionId, code);

      // Eğer mobile 2FA hâlâ gerekiyorsa devam et
      if (res.sessionNeedsMobile2FA && type === "email") {
        toast.success("E-posta doğrulandı! Şimdi telefon doğrulaması yapınız.");
        navigate("/2fa", { state: { type: "mobile", userId, sessionId }, replace: true });
        return;
      }

      await refreshUser();
      toast.success("Giriş başarılı!");
      navigate("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Doğrulama başarısız";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const label = type === "email" ? "e-posta" : "telefon";
  const Icon = ShieldCheck;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate("/login")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> İptal
        </button>

        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">İki Faktörlü Doğrulama</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {label === "e-posta"
              ? "E-posta adresinize"
              : "Telefon numaranıza"} 6 haneli güvenlik kodu gönderildi.
          </p>
          {codeIndex !== null && (
            <p className="mt-1 text-xs text-muted-foreground">Kod dizini: <span className="font-semibold">#{codeIndex}</span></p>
          )}
        </div>

        {testCode && (
          <div className="mb-6 rounded-xl border border-dashed border-warning bg-warning/10 p-3 text-center">
            <p className="text-xs font-medium text-warning-foreground">🧪 Test Modu — Güvenlik Kodu:</p>
            <p className="mt-1 text-2xl font-bold tracking-widest text-foreground">{testCode}</p>
          </div>
        )}

        {startLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <OtpInput value={code} onChange={setCode} />
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading || code.length < 6}>
              {loading ? "Doğrulanıyor..." : "Doğrula"}
            </Button>
          </form>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled={cooldown > 0 || startLoading}
            onClick={callStart}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : "Kodu tekrar gönder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
