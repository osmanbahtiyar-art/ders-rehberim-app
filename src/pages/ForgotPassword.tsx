import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verificationApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"email" | "mobile" | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return;
    setLoading(true);
    try {
      if (method === "email") {
        const res = await verificationApi.passwordResetEmailStart(email);
        navigate("/reset-password", {
          state: {
            method: "email",
            email,
            codeIndex: res.codeIndex,
            testCode: res.secretCode,
          },
        });
      } else {
        const res = await verificationApi.passwordResetMobileStart(email);
        navigate("/reset-password", {
          state: {
            method: "mobile",
            email,
            mobile: res.mobile,
            codeIndex: res.codeIndex,
            testCode: res.secretCode,
          },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "İşlem başarısız";
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

        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground">Şifremi Unuttum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Doğrulama yöntemini seçin, size sıfırlama kodu göndereceğiz.
          </p>
        </div>

        {/* Yöntem Seçimi */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethod("email")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              method === "email"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <Mail className="h-6 w-6" />
            <span className="text-sm font-medium">E-posta</span>
          </button>
          <button
            onClick={() => setMethod("mobile")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              method === "mobile"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <Smartphone className="h-6 w-6" />
            <span className="text-sm font-medium">Telefon</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta adresiniz</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {method === "mobile" && (
              <p className="text-xs text-muted-foreground">
                E-posta ile telefon numaranızı bulup SMS göndereceğiz.
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            size="lg"
            disabled={loading || !method || !email}
          >
            {loading ? "Gönderiliyor..." : "Kod Gönder"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
