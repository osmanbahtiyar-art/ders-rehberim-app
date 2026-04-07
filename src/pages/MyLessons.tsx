import { ArrowLeft, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { teachers } from "@/data/mockData";

const upcomingLessons = [
  { id: 1, teacher: teachers[0], date: "Bugün", time: "14:00", subject: "Matematik" },
  { id: 2, teacher: teachers[1], date: "Yarın", time: "10:00", subject: "Fizik" },
];

const pastLessons = [
  { id: 3, teacher: teachers[2], date: "3 Nisan", time: "16:00", subject: "Türkçe", rated: true },
  { id: 4, teacher: teachers[3], date: "1 Nisan", time: "11:00", subject: "Kimya", rated: false },
];

const MyLessons = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Derslerim</h1>
      </div>

      <div className="mx-auto max-w-lg px-6 py-4">
        {/* Upcoming */}
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Yaklaşan Dersler
        </h3>
        <div className="space-y-3">
          {upcomingLessons.map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
              <img src={l.teacher.avatar} alt={l.teacher.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-card-foreground">{l.teacher.name}</p>
                <p className="text-sm text-muted-foreground">{l.subject}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary">{l.date}</p>
                <p className="text-sm text-muted-foreground">{l.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Past */}
        <h3 className="mb-3 mt-8 flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle className="h-4 w-4 text-success" />
          Geçmiş Dersler
        </h3>
        <div className="space-y-3">
          {pastLessons.map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
              <img src={l.teacher.avatar} alt={l.teacher.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-card-foreground">{l.teacher.name}</p>
                <p className="text-sm text-muted-foreground">{l.subject} · {l.date}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <RotateCcw className="h-3 w-3" />
                Tekrar Al
              </Button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MyLessons;
