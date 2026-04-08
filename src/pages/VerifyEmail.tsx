import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { verificationApi } from "@/lib/api";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import OtpInput from "@/components/OtpInput";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email: string = location.state?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(true);
  const [codeIndex, setCodeIndex] = useState<number | null>(null);
  const [testCode, setTestCode] = useState<string | null>(null);

  useEffect(() => {
    if (!email) { navigate("/login"); return; }
    verificationApi.emailStart(email)
      .then((res) => {
        setCodeIndex(res.codeIndex);
        if (res.secretCode) setTestCode(res.secretCode);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setStartLoading(false));
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    try {
      const res = await verificationApi.emailComplete(email, code);
      if (res.mobileVerificationNeeded) {
        toast.success("E-posta doğrulandı! Şimdi telefon doğrulaması yapınız.");
        navigate("/verify-mobile", { state: { email } });
      } else {
        toast.success("E-posta başarıyla doğrulandı!");
        navigate("/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Doğrulama başarısız";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate("/login")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>

        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">E-posta Doğrulama</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> adresine 6 haneli kod gönderildi.
          </p>
          {codeIndex !== null && (
            <p className="mt-1 text-xs text-muted-foreground">Kod dizini: <span className="font-semibold">#{codeIndex}</span></p>
          )}
        </div>

        {testCode && (
          <div className="mb-6 rounded-xl border border-dashed border-warning bg-warning/10 p-3 text-center">
            <p className="text-xs font-medium text-warning-foreground">🧪 Test Modu — Doğrulama Kodu:</p>
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

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Kod gelmedi mi?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => {
              verificationApi.emailStart(email)
                .then((res) => { if (res.secretCode) setTestCode(res.secretCode); toast.success("Kod tekrar gönderildi"); })
                .catch((err) => toast.error(err.message));
            }}
          >
            Tekrar gönder
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
