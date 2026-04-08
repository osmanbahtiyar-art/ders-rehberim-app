import { Settings, ChevronRight, Heart, Ticket, Clock, LogOut, BookOpen, CheckSquare, Star, GraduationCap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.fullname || user?.email || "Kullanıcı";
  const initial = displayName.charAt(0).toUpperCase();
  const isTeacher = user?.roleId === "teacher";

  const studentMenuItems = [
    { icon: Heart, label: "Favori Öğretmenler", action: () => {} },
    { icon: Ticket, label: "Kuponlarım", action: () => {} },
    { icon: Clock, label: "Ders Geçmişi", action: () => {} },
    { icon: Settings, label: "Ayarlar", action: () => {} },
  ];

  const teacherMenuItems = [
    { icon: CheckSquare, label: "Çözdüğüm Sorular", action: () => navigate("/solve-questions") },
    { icon: BookOpen, label: "Derslerim", action: () => navigate("/my-lessons") },
    { icon: Star, label: "Değerlendirmelerim", action: () => {} },
    { icon: Settings, label: "Ayarlar", action: () => {} },
  ];

  const menuItems = isTeacher ? teacherMenuItems : studentMenuItems;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className={`px-6 pb-8 pt-10 ${isTeacher ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-primary"}`}>
        <div className="mx-auto flex max-w-lg items-start gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20 text-3xl font-bold text-primary-foreground border-2 border-white/30">
                {initial}
              </div>
            )}
          </div>

          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-primary-foreground">{displayName}</h2>
              <Badge
                className={`text-xs font-semibold ${
                  isTeacher
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-white/20 text-white border-white/30"
                }`}
                variant="outline"
              >
                {isTeacher ? "Öğretmen" : "Öğrenci"}
              </Badge>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-0.5">{user?.email}</p>

            {/* Teacher stats */}
            {isTeacher && (
              <div className="mt-3 flex gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">0</p>
                  <p className="text-xs text-white/70">Çözülen Soru</p>
                </div>
                <div className="h-full w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">0</p>
                  <p className="text-xs text-white/70">Verilen Ders</p>
                </div>
                <div className="h-full w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">—</p>
                  <p className="text-xs text-white/70">Ortalama Puan</p>
                </div>
              </div>
            )}

            {/* Student info */}
            {!isTeacher && (
              <div className="mt-2 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary-foreground/70" />
                <p className="text-xs text-primary-foreground/70">Öğrenci Hesabı</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6">
        {/* Role info card */}
        <div className={`mt-4 rounded-xl p-4 ${isTeacher ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800" : "bg-primary/5 border border-primary/10"}`}>
          <p className="text-sm font-medium text-foreground">
            {isTeacher
              ? "Öğrencilerin sorduğu soruları çözerek onlara yardım edebilirsin."
              : "Anlamadığın soruları yükle, öğretmenler senin için çözsün!"}
          </p>
          <button
            onClick={() => navigate(isTeacher ? "/solve-questions" : "/ask-question")}
            className={`mt-2 text-sm font-semibold ${isTeacher ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}
          >
            {isTeacher ? "Soruları Gör →" : "Soru Sor →"}
          </button>
        </div>

        {/* Menu items */}
        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
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
