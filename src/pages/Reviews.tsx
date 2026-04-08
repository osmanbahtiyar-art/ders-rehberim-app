import { Star, ChevronLeft, MessageSquare } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teacherApi, TeacherReviewItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const Reviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-reviews", user?.userId],
    queryFn: () => teacherApi.getReviews(user?.userId ?? ""),
    enabled: !!user?.userId,
  });

  const rawKey = data
    ? Object.keys(data).find((k) => Array.isArray((data as Record<string, unknown>)[k]))
    : undefined;
  const reviews: TeacherReviewItem[] = rawKey
    ? ((data as Record<string, unknown[]>)[rawKey] || []) as TeacherReviewItem[]
    : [];

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-muted">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Değerlendirmelerim</h1>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Özet kart */}
            {reviews.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5 flex items-center gap-5">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-500">{avgRating.toFixed(1)}</p>
                  <StarRating rating={Math.round(avgRating)} />
                  <p className="mt-1 text-xs text-muted-foreground">{reviews.length} değerlendirme</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = reviews.filter((r) => r.rating === s).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <span className="w-3 text-xs text-muted-foreground text-right">{s}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-4 text-xs text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Değerlendirmeler listesi */}
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Henüz değerlendirme yok</h3>
                <p className="text-sm text-muted-foreground">
                  Öğrenciler ders sonrası seni değerlendirecek.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {r.studentId_data?.fullname?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-card-foreground">
                            {r.studentId_data?.fullname ?? "Öğrenci"}
                          </p>
                          <StarRating rating={r.rating} />
                        </div>
                        {r.comment && (
                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                            "{r.comment}"
                          </p>
                        )}
                        {r.createdAt && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Reviews;
