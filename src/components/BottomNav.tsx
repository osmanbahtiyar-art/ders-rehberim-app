import { Home, HelpCircle, BookOpen, MessageCircle, User, CheckSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const studentNavItems = [
  { icon: Home, label: "Ana Sayfa", path: "/home" },
  { icon: HelpCircle, label: "Soru Sor", path: "/ask-question" },
  { icon: BookOpen, label: "Derslerim", path: "/my-lessons" },
  { icon: MessageCircle, label: "Mesajlar", path: "/messages" },
  { icon: User, label: "Profil", path: "/profile" },
];

const teacherNavItems = [
  { icon: Home, label: "Ana Sayfa", path: "/home" },
  { icon: CheckSquare, label: "Soru Çöz", path: "/solve-questions" },
  { icon: BookOpen, label: "Derslerim", path: "/my-lessons" },
  { icon: MessageCircle, label: "Mesajlar", path: "/messages" },
  { icon: User, label: "Profil", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = user?.roleId === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/10")} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
