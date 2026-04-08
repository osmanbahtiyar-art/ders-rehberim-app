import { Ticket, ChevronLeft, Copy, CheckCheck, Tag } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Coupon {
  code: string;
  description: string;
  discount: string;
  validUntil: string;
  isUsed: boolean;
  type: "percent" | "fixed";
}

// Demo kuponlar - gerçek backend entegrasyonu yapıldığında API'den çekilecek
const demoCoupons: Coupon[] = [
  {
    code: "HOŞGELDİN20",
    description: "Yeni üye hoş geldin kuponu",
    discount: "%20",
    validUntil: "2026-06-30",
    isUsed: false,
    type: "percent",
  },
  {
    code: "İLKDERS50",
    description: "İlk ders indirimi",
    discount: "₺50",
    validUntil: "2026-05-15",
    isUsed: false,
    type: "fixed",
  },
  {
    code: "YAZA10",
    description: "Yaz kampanyası",
    discount: "%10",
    validUntil: "2026-07-31",
    isUsed: true,
    type: "percent",
  },
];

const Coupons = () => {
  const navigate = useNavigate();
  const [coupons] = useState<Coupon[]>(demoCoupons);
  const [couponInput, setCouponInput] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success("Kupon kodu kopyalandı!");
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    toast.error("Bu kupon kodu geçerli değil veya kullanılmış.");
    setCouponInput("");
  };

  const activeCoupons = coupons.filter((c) => !c.isUsed);
  const usedCoupons = coupons.filter((c) => c.isUsed);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-muted">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Kuponlarım</h1>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {/* Kupon gir */}
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Kupon Kodun Var Mı?</p>
          <div className="flex gap-2">
            <Input
              placeholder="Kupon kodu gir..."
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="uppercase"
            />
            <Button onClick={handleApplyCoupon} disabled={!couponInput.trim()}>
              Uygula
            </Button>
          </div>
        </div>

        {/* Aktif kuponlar */}
        <h3 className="mt-6 mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Tag className="h-4 w-4 text-primary" />
          Aktif Kuponlar
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {activeCoupons.length}
          </span>
        </h3>

        {activeCoupons.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Aktif kuponun yok.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCoupons.map((c) => (
              <div
                key={c.code}
                className="relative overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                {/* Sol şerit */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-foreground tracking-wider">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopy(c.code)}
                        className="rounded p-1 hover:bg-muted transition-colors"
                      >
                        {copiedCode === c.code ? (
                          <CheckCheck className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Son kullanma: {c.validUntil}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">{c.discount}</span>
                    <p className="text-xs text-muted-foreground">indirim</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kullanılmış kuponlar */}
        {usedCoupons.length > 0 && (
          <>
            <h3 className="mt-6 mb-3 flex items-center gap-2 font-semibold text-muted-foreground">
              <Tag className="h-4 w-4" />
              Kullanılmış
            </h3>
            <div className="space-y-3">
              {usedCoupons.map((c) => (
                <div
                  key={c.code}
                  className="relative overflow-hidden rounded-xl border border-border bg-muted/30 opacity-60"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/40 rounded-l-xl" />
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Ticket className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="font-mono text-base font-bold text-muted-foreground tracking-wider line-through">
                        {c.code}
                      </span>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-muted-foreground">{c.discount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Coupons;
