import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, LogOut, Shield, Search, RefreshCw, ArrowLeft,
  Download, ChevronDown, ChevronUp, FileText, Mail, Phone,
  GraduationCap, Users, Clock, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  applicationStore, Application, ApplicationStatus,
  statusTR, statusColor, StudentApplicationData, TeacherApplicationData,
} from "@/lib/applications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "applications";

// ── Supabase kullanıcı sayıları ───────────────────────────────────

async function fetchUserCounts() {
  const [{ count: studentCount }, { count: teacherCount }] = await Promise.all([
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
  ]);
  return { students: studentCount ?? 0, teachers: teacherCount ?? 0 };
}

// ── DASHBOARD ─────────────────────────────────────────────────────

const DashboardTab = ({ setTab }: { setTab: (t: Tab) => void }) => {
  const counts = applicationStore.counts();
  const apps = applicationStore.list().slice(0, 5);

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
      label: "Toplam Başvuru",
      value: counts.total,
      icon: FileText,
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-100",
      tab: "applications" as Tab,
    },
  ];

  return (
    <div className="space-y-6">
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
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              {s.highlight && s.value > 0 && (
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

        {apps.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Henüz başvuru yok.</p>
        ) : (
          <div className="space-y-2">
            {apps.map((app) => {
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
                    <p className="text-xs text-muted-foreground">{isStudent ? "Öğrenci" : "Öğretmen"} · {String(d.phone ?? "")}</p>
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
      {/* Araç çubuğu */}
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

      {/* Tip filtresi */}
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
              typeFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f.label} <span className="ml-1 opacity-70">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Durum filtresi */}
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

      {/* Liste */}
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
                {/* Özet satır */}
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

                {/* Detay */}
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

                    {/* Durum değiştir */}
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

// ── ANA PANEL ─────────────────────────────────────────────────────

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const appCounts = applicationStore.counts();

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "dashboard", label: "Genel", icon: LayoutDashboard },
    { key: "applications", label: "Başvurular", icon: FileText, badge: appCounts.pending },
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
      </div>
    </div>
  );
};

export default AdminPanel;
