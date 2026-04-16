import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, LogOut, Shield, Search, RefreshCw, ArrowLeft,
  Download, ChevronDown, ChevronUp, FileText, Mail, Phone,
  GraduationCap, Users, Clock, CheckCircle, AlertTriangle,
  Link2, XCircle, ThumbsUp, ThumbsDown, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  applicationStore, Application, ApplicationStatus, Match, MatchStatus,
  statusTR, statusColor, StudentApplicationData, TeacherApplicationData,
  generateMatchSuggestions, getSubjectGaps, matchStore,
} from "@/lib/applications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "applications" | "matching";

// ── Supabase kullanıcı sayıları ───────────────────────────────────

async function fetchUserCounts() {
  const [{ count: studentCount }, { count: teacherCount }] = await Promise.all([
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
  ]);
  return { students: studentCount ?? 0, teachers: teacherCount ?? 0 };
}

// ── DERS BOŞLUĞU UYARILARI ────────────────────────────────────────

const SubjectGapAlerts = ({ apps }: { apps: Application[] }) => {
  const gaps = getSubjectGaps(apps);
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h3 className="font-semibold text-amber-800">Öğretmen İhtiyacı</h3>
        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
          {gaps.length} ders
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {gaps.map(({ subject, count }) => (
          <div
            key={subject}
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-sm font-medium text-amber-900 capitalize">{subject}</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700">
              {count} öğrenci
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-amber-600">
        Bu dersler için öğretmen başvurusu bulunmuyor. Eşleştirme panelinde de öneriler göremezsiniz.
      </p>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────────

const DashboardTab = ({ setTab }: { setTab: (t: Tab) => void }) => {
  const allApps = applicationStore.list();
  const counts = applicationStore.counts();
  const matchCounts = matchStore.counts();
  const recentApps = allApps.slice(0, 5);

  const { data: userCounts, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-user-counts"],
    queryFn: fetchUserCounts,
  });

  const statCards = [
    {
      label: "Bekleyen Başvuru",
      value: counts.pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      tab: "applications" as Tab,
      highlight: counts.pending > 0,
    },
    {
      label: "Öğrenci Başvurusu",
      value: counts.student,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      tab: "applications" as Tab,
    },
    {
      label: "Öğretmen Başvurusu",
      value: counts.teacher,
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      tab: "applications" as Tab,
    },
    {
      label: "Kayıtlı Öğrenci",
      value: loadingUsers ? "—" : userCounts?.students,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      tab: null,
    },
    {
      label: "Kayıtlı Öğretmen",
      value: loadingUsers ? "—" : userCounts?.teachers,
      icon: GraduationCap,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      tab: null,
    },
    {
      label: "Onaylı Eşleşme",
      value: matchCounts.approved,
      icon: Link2,
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-100",
      tab: "matching" as Tab,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Ders boşluğu uyarıları */}
      <SubjectGapAlerts apps={allApps} />

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statCards.map((s) => {
          const Wrapper = s.tab ? "button" : "div";
          return (
            <Wrapper
              key={s.label}
              {...(s.tab ? { onClick: () => setTab(s.tab!) } : {})}
              className={cn(
                `rounded-2xl border p-4 text-left transition-all ${s.bg} ${s.border}`,
                s.tab && "hover:shadow-md cursor-pointer",
                s.highlight && "ring-2 ring-amber-400 ring-offset-1"
              )}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              {s.highlight && (s.value as number) > 0 && (
                <span className="mt-2 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  İnceleme Bekliyor
                </span>
              )}
            </Wrapper>
          );
        })}
      </div>

      {/* Son başvurular */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <FileText className="h-4 w-4 text-amber-500" />
            Son Başvurular
          </h3>
          <button
            onClick={() => setTab("applications")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Tümünü Gör →
          </button>
        </div>

        {recentApps.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Henüz başvuru yok.</p>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app) => {
              const d = app.data as Record<string, unknown>;
              const isStudent = app.type === "student";
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setTab("applications")}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${isStudent ? "bg-indigo-500" : "bg-emerald-500"}`}>
                    {String(d.fullname ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{String(d.fullname ?? "—")}</p>
                    <p className="text-xs text-muted-foreground">
                      {isStudent ? "Öğrenci" : "Öğretmen"} · {String(d.phone ?? "")}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[app.status]}`}>
                    {statusTR[app.status]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Özet */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-amber-500" />
            Başvuru Özeti
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Öğrenci Başvurusu", value: counts.student, color: "text-indigo-600" },
              { label: "Öğretmen Başvurusu", value: counts.teacher, color: "text-emerald-600" },
              { label: "Bekleyen", value: counts.pending, color: "text-amber-600" },
              { label: "Toplam", value: counts.total, color: "text-slate-700" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Kullanıcı Özeti
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Kayıtlı Öğrenci", value: loadingUsers ? "—" : userCounts?.students, color: "text-blue-600" },
              { label: "Kayıtlı Öğretmen", value: loadingUsers ? "—" : userCounts?.teachers, color: "text-violet-600" },
              {
                label: "Toplam Kayıt",
                value: loadingUsers ? "—" : (userCounts?.students ?? 0) + (userCounts?.teachers ?? 0),
                color: "text-slate-700",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── BAŞVURULAR ────────────────────────────────────────────────────

const ApplicationsTab = () => {
  const [typeFilter, setTypeFilter] = useState<"all" | "student" | "teacher">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>(() => applicationStore.list());

  const refresh = () => setApps(applicationStore.list());

  const filtered = apps.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    const d = a.data as Record<string, unknown>;
    if (search) {
      const q = search.toLowerCase();
      if (
        !String(d.fullname ?? "").toLowerCase().includes(q) &&
        !String(d.email ?? "").toLowerCase().includes(q) &&
        !String(d.phone ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const updateStatus = (id: string, status: ApplicationStatus) => {
    applicationStore.updateStatus(id, status);
    refresh();
    toast.success("Durum güncellendi.");
  };

  const deleteApp = (id: string) => {
    applicationStore.delete(id);
    refresh();
    toast.success("Başvuru silindi.");
  };

  const downloadCSV = () => {
    const csv = applicationStore.exportCSV();
    if (!csv) { toast.error("İndirilecek başvuru yok."); return; }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `basvurular-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV indirildi.");
  };

  const statusOptions: { value: "all" | ApplicationStatus; label: string }[] = [
    { value: "all", label: "Tümü" },
    { value: "pending", label: "Bekliyor" },
    { value: "contacted", label: "İletişime Geçildi" },
    { value: "accepted", label: "Kabul Edildi" },
    { value: "rejected", label: "Reddedildi" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="İsim, e-posta veya telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={refresh} title="Yenile">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-1.5">
          <Download className="h-4 w-4" /> CSV İndir
        </Button>
      </div>

      <div className="flex gap-2">
        {[
          { value: "all", label: "Tümü", count: apps.length },
          { value: "student", label: "Öğrenci", count: apps.filter((a) => a.type === "student").length },
          { value: "teacher", label: "Öğretmen", count: apps.filter((a) => a.type === "teacher").length },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value as typeof typeFilter)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              typeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f.label} <span className="ml-1 opacity-70">({f.count})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
              statusFilter === s.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/30"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-foreground">Başvuru bulunamadı</p>
          <p className="text-sm text-muted-foreground mt-1">
            {apps.length === 0 ? "Henüz hiç başvuru gelmedi." : "Filtreyi değiştirmeyi deneyin."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => {
            const d = app.data as Record<string, unknown>;
            const isStudent = app.type === "student";
            const isExpanded = expandedId === app.id;

            return (
              <div key={app.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${isStudent ? "bg-indigo-500" : "bg-emerald-500"}`}>
                    {String(d.fullname ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{String(d.fullname ?? "—")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isStudent ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {isStudent ? "Öğrenci" : "Öğretmen"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[app.status]}`}>
                        {statusTR[app.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />{String(d.email ?? "—")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />{String(d.phone ?? "—")}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(app.submittedAt).toLocaleDateString("tr-TR")}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-muted/20">
                    <div className="grid gap-3 sm:grid-cols-2 mb-4">
                      {isStudent ? (
                        <>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Sınıf</p>
                            <p className="text-sm text-foreground">{(d as StudentApplicationData).grade || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Dersler</p>
                            <p className="text-sm text-foreground">{((d as StudentApplicationData).subjects ?? []).join(", ") || "—"}</p>
                          </div>
                          {(d as StudentApplicationData).note && (
                            <div className="sm:col-span-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Not</p>
                              <p className="text-sm text-foreground">{(d as StudentApplicationData).note}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Branş</p>
                            <p className="text-sm text-foreground">{(d as TeacherApplicationData).branch || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Deneyim</p>
                            <p className="text-sm text-foreground">{(d as TeacherApplicationData).experience || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Saatlik Ücret</p>
                            <p className="text-sm text-foreground">
                              {(d as TeacherApplicationData).hourlyRate ? `₺${(d as TeacherApplicationData).hourlyRate}/sa` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Uygun Günler</p>
                            <p className="text-sm text-foreground">{((d as TeacherApplicationData).availableDays ?? []).join(", ") || "—"}</p>
                          </div>
                          {(d as TeacherApplicationData).qualifications && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Nitelikler</p>
                              <p className="text-sm text-foreground">{(d as TeacherApplicationData).qualifications}</p>
                            </div>
                          )}
                          {(d as TeacherApplicationData).about && (
                            <div className="sm:col-span-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Hakkında</p>
                              <p className="text-sm text-foreground">{(d as TeacherApplicationData).about}</p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Başvuru Tarihi</p>
                        <p className="text-sm text-foreground">
                          {new Date(app.submittedAt).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                      <span className="text-xs font-medium text-muted-foreground">Durum:</span>
                      {(["pending", "contacted", "accepted", "rejected"] as ApplicationStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(app.id, s)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                            app.status === s
                              ? statusColor[s] + " border-transparent"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {statusTR[s]}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteApp(app.id)}
                        className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── EŞLEŞTİRME ───────────────────────────────────────────────────

const matchStatusLabel: Record<MatchStatus, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};
const matchStatusStyle: Record<MatchStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const MatchingTab = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [matches, setMatches] = useState<Match[]>(() => {
    const apps = applicationStore.list();
    return generateMatchSuggestions(apps);
  });

  const apps = applicationStore.list();
  const appMap = Object.fromEntries(apps.map((a) => [a.id, a]));

  const refresh = useCallback(() => {
    const freshApps = applicationStore.list();
    setMatches(generateMatchSuggestions(freshApps));
  }, []);

  const updateMatch = (id: string, status: MatchStatus) => {
    matchStore.updateStatus(id, status);
    setMatches(matchStore.list());
    toast.success(status === "approved" ? "Eşleşme onaylandı." : "Eşleşme reddedildi.");
  };

  const filtered = matches.filter(
    (m) => statusFilter === "all" || m.status === statusFilter
  );

  const filterCounts = {
    all: matches.length,
    pending: matches.filter((m) => m.status === "pending").length,
    approved: matches.filter((m) => m.status === "approved").length,
    rejected: matches.filter((m) => m.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Açıklama */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
          <div>
            <p className="font-semibold text-teal-800">Otomatik Eşleştirme Önerileri</p>
            <p className="mt-0.5 text-sm text-teal-700">
              Öğrencilerin istediği dersler ile öğretmenlerin branşları karşılaştırılarak öneriler oluşturuldu.
              Onayladığınız eşleşmeler için iletişim bilgileri görünür — manuel olarak ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Araç çubuğu */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {s === "all" ? "Tümü" : matchStatusLabel[s]}
              <span className="ml-1.5 opacity-70">({filterCounts[s]})</span>
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={refresh} title="Yenile">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Boş durum */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Link2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-foreground">
            {matches.length === 0
              ? "Henüz eşleştirme önerisi yok"
              : "Bu filtrede eşleşme yok"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {matches.length === 0
              ? "Öğrenci ve öğretmen başvurularının aynı ders/branşta olması gerekiyor."
              : "Farklı bir filtre deneyin."}
          </p>
        </div>
      )}

      {/* Eşleşme kartları */}
      <div className="space-y-3">
        {filtered.map((match) => {
          const studentApp = appMap[match.studentAppId];
          const teacherApp = appMap[match.teacherAppId];
          if (!studentApp || !teacherApp) return null;

          const sd = studentApp.data as StudentApplicationData;
          const td = teacherApp.data as TeacherApplicationData;

          return (
            <div
              key={match.id}
              className={cn(
                "rounded-2xl border bg-card overflow-hidden transition-all",
                match.status === "approved" && "border-emerald-200",
                match.status === "rejected" && "border-red-100 opacity-60",
                match.status === "pending" && "border-border"
              )}
            >
              {/* Başlık */}
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-100 px-3 py-0.5 text-xs font-semibold capitalize text-teal-800">
                    📚 {match.subject.charAt(0).toUpperCase() + match.subject.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", matchStatusStyle[match.status])}>
                    {matchStatusLabel[match.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(match.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>

              {/* İçerik */}
              <div className="grid gap-0 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                {/* Öğrenci */}
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
                      <Users className="h-3 w-3 text-indigo-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Öğrenci</span>
                  </div>
                  <p className="font-semibold text-foreground">{sd.fullname}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {sd.grade && <span className="mr-2">{sd.grade}</span>}
                    {(sd.subjects ?? []).join(", ")}
                  </p>
                  {match.status === "approved" && (
                    <div className="mt-3 space-y-1.5 rounded-xl bg-indigo-50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-indigo-500" />
                        <a href={`mailto:${sd.email}`} className="font-medium text-indigo-700 hover:underline">{sd.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-indigo-500" />
                        <a href={`tel:${sd.phone}`} className="font-medium text-indigo-700 hover:underline">{sd.phone}</a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Öğretmen */}
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <GraduationCap className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Öğretmen</span>
                  </div>
                  <p className="font-semibold text-foreground">{td.fullname}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {td.branch}
                    {td.experience && <span className="ml-2 text-xs">· {td.experience} yıl deneyim</span>}
                    {td.hourlyRate && <span className="ml-2 text-xs font-medium text-emerald-600">· ₺{td.hourlyRate}/sa</span>}
                  </p>
                  {match.status === "approved" && (
                    <div className="mt-3 space-y-1.5 rounded-xl bg-emerald-50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-emerald-500" />
                        <a href={`mailto:${td.email}`} className="font-medium text-emerald-700 hover:underline">{td.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        <a href={`tel:${td.phone}`} className="font-medium text-emerald-700 hover:underline">{td.phone}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Aksiyonlar */}
              {match.status === "pending" && (
                <div className="flex gap-2 border-t border-border bg-muted/20 px-4 py-3">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                    onClick={() => updateMatch(match.id, "approved")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => updateMatch(match.id, "rejected")}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Reddet
                  </Button>
                </div>
              )}

              {match.status === "approved" && (
                <div className="flex items-center justify-between border-t border-emerald-100 bg-emerald-50/50 px-4 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    Onaylandı — İletişim bilgileri görünür
                  </span>
                  <button
                    onClick={() => updateMatch(match.id, "rejected")}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    Geri Al
                  </button>
                </div>
              )}

              {match.status === "rejected" && (
                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    Reddedildi
                  </span>
                  <button
                    onClick={() => updateMatch(match.id, "pending")}
                    className="text-xs text-primary hover:underline"
                  >
                    Tekrar Değerlendir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── ANA PANEL ─────────────────────────────────────────────────────

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const appCounts = applicationStore.counts();
  const mCounts = matchStore.counts();

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "dashboard", label: "Genel", icon: LayoutDashboard },
    { key: "applications", label: "Başvurular", icon: FileText, badge: appCounts.pending },
    { key: "matching", label: "Eşleştirme", icon: Link2, badge: mCounts.pending },
  ];

  const displayName = user?.fullname ?? user?.email ?? "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">Admin Paneli</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Özel Ders Rehberim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Siteye Dön</span>
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-1.5">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {initial}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-foreground">{displayName}</span>
            </div>
            <button
              onClick={async () => { await signOut(); navigate("/"); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-5xl overflow-x-auto">
          <div className="flex px-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.badge != null && t.badge > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {t.badge > 9 ? "9+" : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {activeTab === "dashboard" && <DashboardTab setTab={setActiveTab} />}
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "matching" && <MatchingTab />}
      </div>
    </div>
  );
};

export default AdminPanel;
