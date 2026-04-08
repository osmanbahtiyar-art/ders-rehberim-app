import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verificationApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, KeyRound } from "lucide-react";
import OtpInput from "@/components/OtpInput";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const method: "email" | "mobile" = location.state?.method || "email";
  const email: string = location.state?.email || "";
  const mobile: string | undefined = location.state?.mobile;
  const codeIndex: number | undefined = location.state?.codeIndex;
  const testCode: string | undefined = location.state?.testCode;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { toast.error("Lütfen 6 haneli kodu girin"); return; }
    if (password.length < 6) { toast.error("Şifre en az 6 karakter olmalıdır"); return; }
    if (password !== passwordConfirm) { toast.error("Şifreler eşleşmiyor"); return; }

    setLoading(true);
    try {
      if (method === "email") {
        await verificationApi.passwordResetEmailComplete(email, code, password);
      } else {
        await verificationApi.passwordResetMobileComplete(email, code, password);
      }
      toast.success("Şifreniz başarıyla güncellendi!");
      navigate("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "İşlem başarısız";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate("/forgot-password")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>

        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">Şifre Sıfırlama</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {method === "email"
              ? `${email} adresine gönderilen kodu girin`
              : `${mobile ?? "telefon numaranıza"} gönderilen kodu girin`}
          </p>
          {codeIndex !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">Kod dizini: <span className="font-semibold">#{codeIndex}</span></p>
          )}
        </div>

        {testCode && (
          <div className="mb-6 rounded-xl border border-dashed border-warning bg-warning/10 p-3 text-center">
            <p className="text-xs font-medium text-warning-foreground">🧪 Test Modu — Doğrulama Kodu:</p>
            <p className="mt-1 text-2xl font-bold tracking-widest text-foreground">{testCode}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center">
            <OtpInput value={code} onChange={setCode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Yeni Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
            />
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-xs text-destructive">Şifreler eşleşmiyor</p>
            )}
          </div>

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            size="lg"
            disabled={loading || code.length < 6 || !password || password !== passwordConfirm}
          >
            {loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
