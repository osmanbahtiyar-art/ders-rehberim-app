import { Clock, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useQuery } from "@tanstack/react-query";
import { bookingApi, BookingItem } from "@/lib/api";

const MyLessons = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-lessons"],
    queryFn: () => bookingApi.list(),
  });

  const raw = (data as Record<string, unknown>)?.lessonBookingRecord as BookingItem[] | undefined;
  const all = raw ?? [];

  const upcoming = all.filter((l) => ["pending", "confirmed"].includes(l.bookingStatus));
  const past = all.filter((l) => ["completed", "cancelled"].includes(l.bookingStatus));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Derslerim</h1>
      </div>

      <div className="mx-auto max-w-lg px-6 py-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Yaklaşan Dersler
        </h3>
        <div className="space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Yaklaşan ders yok</p>
          )}
          {upcoming.map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
              <img
                src={l.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(l.teacherId_data?.fullname ?? 'T')}&background=6366f1&color=fff`}
                alt={l.teacherId_data?.fullname}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-card-foreground">{l.teacherId_data?.fullname ?? "Öğretmen"}</p>
                <p className="text-sm text-muted-foreground capitalize">{l.bookingStatus}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary">{l.lessonDate}</p>
                <p className="text-sm text-muted-foreground">{l.startTime}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-8 flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle className="h-4 w-4 text-success" />
          Geçmiş Dersler
        </h3>
        <div className="space-y-3">
          {past.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Geçmiş ders yok</p>
          )}
          {past.map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
              <img
                src={l.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(l.teacherId_data?.fullname ?? 'T')}&background=6366f1&color=fff`}
                alt={l.teacherId_data?.fullname}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-card-foreground">{l.teacherId_data?.fullname ?? "Öğretmen"}</p>
                <p className="text-sm text-muted-foreground">{l.lessonDate}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                l.bookingStatus === "completed" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}>
                {l.bookingStatus === "completed" ? "Tamamlandı" : "İptal"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MyLessons;
