import { Heart, ChevronLeft, Star, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teacherApi, normalizeTeacher } from "@/lib/api";
import { Button } from "@/components/ui/button";

const FAVORITES_KEY = "odr-favorite-teachers";

export function getFavoriteIds(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); }
  catch { return []; }
}

export function toggleFavorite(id: string): boolean {
  const ids = getFavoriteIds();
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return !exists;
}

const FavoriteTeachers = () => {
  const navigate = useNavigate();
  const favoriteIds = getFavoriteIds();

  const { data, isLoading } = useQuery({
    queryKey: ["teachers-all"],
    queryFn: () => teacherApi.list({ pageRowCount: 100 }),
    enabled: favoriteIds.length > 0,
  });

  const rawKey = data
    ? Object.keys(data).find((k) => Array.isArray((data as Record<string, unknown>)[k]))
    : undefined;
  const allTeachers = rawKey
    ? ((data as Record<string, unknown[]>)[rawKey] || []).map(normalizeTeacher)
    : [];

  const favorites = allTeachers.filter((t) => favoriteIds.includes(t.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-muted">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Favori Öğretmenler</h1>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && favoriteIds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Henüz favori yok</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Öğretmen profillerini ziyaret ederek favorilere ekleyebilirsin.
            </p>
            <Button onClick={() => navigate("/search")}>Öğretmen Ara</Button>
          </div>
        )}

        {!isLoading && favoriteIds.length > 0 && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">Favori öğretmenler yüklenemedi.</p>
          </div>
        )}

        <div className="space-y-3">
          {favorites.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/teacher/${t.id}`)}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all hover:shadow-md hover:border-primary/20"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-card-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t.subject || "Ders Seçilmedi"}
                </p>
                {t.rating > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">{t.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({t.reviewCount} değerlendirme)</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{t.price > 0 ? `₺${t.price}/sa` : "—"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FavoriteTeachers;
