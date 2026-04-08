import { Settings, ChevronRight, Heart, Ticket, Clock, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      setProfile(data);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      setRole(roleData?.role ?? null);
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || user?.email || "Kullanıcı";
  const initial = displayName.charAt(0).toUpperCase();

  const menuItems = [
    { icon: Heart, label: "Favori Öğretmenler", count: 3 },
    { icon: Ticket, label: "Kuponlarım", count: 1 },
    { icon: Clock, label: "Ders Geçmişi" },
    { icon: Settings, label: "Ayarlar" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-primary px-6 pb-8 pt-10">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl font-bold text-primary-foreground">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-foreground">{displayName}</h2>
            <p className="text-sm text-primary-foreground/80">
              {role === "teacher" ? "Öğretmen" : role === "student" ? "Öğrenci" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6">
        <div className="-mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Ders", value: "0" },
            { label: "Soru", value: "0" },
            { label: "Puan", value: "-" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center shadow-card">
              <p className="text-xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
              {item.count && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{item.count}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
