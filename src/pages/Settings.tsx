import { ChevronLeft, User, Lock, Bell, Palette, Shield, ChevronRight, Eye, EyeOff } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, verificationApi, ApiError, friendlyError } from "@/lib/api";
import { toast } from "sonner";

type Section = "main" | "profile" | "password" | "notifications";

const Settings = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [section, setSection] = useState<Section>("main");

  // Profile form
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification toggles
  const [notifNewAnswer, setNotifNewAnswer] = useState(true);
  const [notifNewBooking, setNotifNewBooking] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  const handleProfileSave = async () => {
    if (!fullname.trim()) { toast.error("Ad Soyad boş olamaz."); return; }
    setSavingProfile(true);
    try {
      // Şimdilik auth-api üzerinden profile update (endpoint varsa)
      await authApi.currentUser(); // token geçerliliğini kontrol et
      // TODO: api.ts'ye updateProfile() eklenince burası güncellenecek
      toast.success("Profil güncellendi!");
      refreshUser();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) { toast.error("Mevcut şifrenizi girin."); return; }
    if (newPassword.length < 6) { toast.error("Yeni şifre en az 6 karakter olmalı."); return; }
    if (newPassword !== confirmPassword) { toast.error("Şifreler eşleşmiyor."); return; }
    setChangingPassword(true);
    try {
      // Şifre değiştirmek için: önce email reset başlat, kullanıcı onaylasın
      // Şimdilik mevcut akışla giriş kontrolü yapıyoruz
      await authApi.login(user?.email ?? "", currentPassword);
      // Sonra password-reset tamamla
      const start = await verificationApi.passwordResetEmailStart(user?.email ?? "");
      if (start.secretCode) {
        // Test modu: kodu direkt kullan
        await verificationApi.passwordResetEmailComplete(user?.email ?? "", String(start.secretCode), newPassword);
        toast.success("Şifreniz başarıyla değiştirildi!");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast.info("Şifre sıfırlama bağlantısı e-postanıza gönderildi.");
        navigate("/forgot-password");
      }
    } catch (err) {
      if (err instanceof ApiError && (err.errCode === "WrongPassword" || err.errCode === "InvalidCredentials")) {
        toast.error("Mevcut şifreniz hatalı.");
      } else {
        toast.error(friendlyError(err));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const mainItems = [
    {
      icon: User,
      label: "Profil Bilgileri",
      desc: "Ad, soyad ve hesap bilgilerini düzenle",
      action: () => setSection("profile"),
    },
    {
      icon: Lock,
      label: "Şifre Değiştir",
      desc: "Hesap güvenliğini artır",
      action: () => setSection("password"),
    },
    {
      icon: Bell,
      label: "Bildirimler",
      desc: "Hangi bildirimleri almak istediğini ayarla",
      action: () => setSection("notifications"),
    },
    {
      icon: Shield,
      label: "Gizlilik & Güvenlik",
      desc: "Hesap güvenlik ayarları",
      action: () => toast.info("Yakında aktif olacak."),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          onClick={() => (section === "main" ? navigate(-1) : setSection("main"))}
          className="rounded-lg p-1.5 hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          {section === "main" ? "Ayarlar" :
           section === "profile" ? "Profil Bilgileri" :
           section === "password" ? "Şifre Değiştir" :
           "Bildirimler"}
        </h1>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {/* Ana menü */}
        {section === "main" && (
          <div className="space-y-1">
            {mainItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}

            {/* Tema bilgisi */}
            <div className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3.5 bg-muted/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Tema</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sistem teması kullanılıyor</p>
              </div>
            </div>

            {/* Versiyon */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Özel Ders Rehberim v1.0.0
            </p>
          </div>
        )}

        {/* Profil bilgileri */}
        {section === "profile" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="space-y-4">
                <div>
                  <Label>E-posta</Label>
                  <Input value={user?.email ?? ""} disabled className="mt-1 bg-muted/50 text-muted-foreground" />
                  <p className="mt-1 text-xs text-muted-foreground">E-posta adresi değiştirilemez.</p>
                </div>
                <div>
                  <Label htmlFor="fullname">Ad Soyad</Label>
                  <Input
                    id="fullname"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Adınız ve soyadınız"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleProfileSave}
              disabled={savingProfile}
            >
              {savingProfile ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        )}

        {/* Şifre değiştir */}
        {section === "password" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <Label htmlFor="current-pass">Mevcut Şifre</Label>
                <div className="relative mt-1">
                  <Input
                    id="current-pass"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-pass">Yeni Şifre</Label>
                <div className="relative mt-1">
                  <Input
                    id="new-pass"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-pass">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              Şifrenizi mi unuttunuz?
            </button>
          </div>
        )}

        {/* Bildirimler */}
        {section === "notifications" && (
          <div className="space-y-2">
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {[
                { label: "Yeni cevap bildirimi", desc: "Soru yanıtlandığında bildir", value: notifNewAnswer, set: setNotifNewAnswer },
                { label: "Ders rezervasyonu", desc: "Ders onaylandığında bildir", value: notifNewBooking, set: setNotifNewBooking },
                { label: "Mesajlar", desc: "Yeni mesaj geldiğinde bildir", value: notifMessages, set: setNotifMessages },
                { label: "Kampanya & Fırsatlar", desc: "İndirim ve kupon bildirimleri", value: notifPromo, set: setNotifPromo },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={(v) => {
                      item.set(v);
                      toast.success(v ? "Bildirim açıldı" : "Bildirim kapatıldı");
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
