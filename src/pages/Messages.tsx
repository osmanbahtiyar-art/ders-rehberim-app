import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { teachers } from "@/data/mockData";

const conversations = [
  { teacher: teachers[0], lastMessage: "Tamam, yarın görüşürüz!", time: "14:30", unread: 2 },
  { teacher: teachers[1], lastMessage: "Ders notu gönderdim 📎", time: "Dün", unread: 0 },
  { teacher: teachers[5], lastMessage: "Teşekkürler hocam!", time: "2 gün önce", unread: 0 },
];

const Messages = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Mesajlar</h1>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Mesajlarda ara..." className="pl-10" />
        </div>
      </div>

      <div className="mx-auto max-w-lg">
        {conversations.map((c, i) => (
          <button key={i} className="flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left transition-colors hover:bg-muted/50">
            <div className="relative">
              <img src={c.teacher.avatar} alt={c.teacher.name} className="h-12 w-12 rounded-full object-cover" />
              {c.teacher.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{c.teacher.name}</span>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
              <p className="truncate text-sm text-muted-foreground">{c.lastMessage}</p>
            </div>
            {c.unread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Messages;
