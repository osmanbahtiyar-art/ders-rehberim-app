import { Settings, ChevronRight, Heart, Ticket, Clock, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.fullname || user?.email || "Kullanıcı";
  const initial = displayName.charAt(0).toUpperCase();

  const menuItems = [
    { icon: Heart, label: "Favori Öğretmenler" },
    { icon: Ticket, label: "Kuponlarım" },
    { icon: Clock, label: "Ders Geçmişi" },
    { icon: Settings, label: "Ayarlar" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-primary px-6 pb-8 pt-10">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl font-bold text-primary-foreground">
              {initial}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-primary-foreground">{displayName}</h2>
            <p className="text-sm text-primary-foreground/80">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6">
        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
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
