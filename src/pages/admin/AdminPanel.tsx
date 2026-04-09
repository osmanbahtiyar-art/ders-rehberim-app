import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  MessageSquare, LogOut, CheckCircle, XCircle,
  Shield, Search, RefreshCw, ArrowLeft, Star,
  TrendingUp, Clock, AlertCircle, Download, Trash2,
  Phone, Mail, ChevronDown, ChevronUp, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminApi, teacherApi, AdminUser,
  TeacherProfileItem, QuestionItem, BookingItem, friendlyError
} from "@/lib/api";
import {
  applicationStore, Application, ApplicationStatus,
  statusTR, statusColor, StudentApplicationData, TeacherApplicationData
} from "@/lib/applications";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "applications" | "users" | "teachers" | "bookings" | "questions";

// ── Yardımcı ──────────────────────────────────────────────────────

const roleColor: Record<string, string> = {
  superAdmin: "bg-red-100 text-red-700",
  admin: "bg-orange-100 text-orange-700",
  teacher: "bg-blue-100 text-blue-700",
  user: "bg-gray-100 text-gray-600",
};
const roleTR: Record<string, string> = {
  superAdmin: "Süper Admin", admin: "Admin", teacher: "Öğretmen", user: "Öğrenci",
};
const bookingStatusTR: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal",
};
const bookingStatusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700", cancelled: "bg-red-100 text-red-700",
};

// ── DASHBOARD ─────────────────────────────────────────────────────

const DashboardTab = ({ setTab }: { setTab: (t: Tab) => void }) => {
  const { data: usersData } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminApi.listUsers({ pageRowCount: 500 }) });
  const { data: teachersData } = useQuery({ queryKey: ["admin-teachers"], queryFn: () => teacherApi.list({ pageRowCount: 100 }) });
  const { data: bookingsData } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminApi.listAllBookings({ pageRowCount: 100 }) });
  const { data: questionsData } = useQuery({ queryKey: ["admin-questions-all"], queryFn: () => adminApi.listAllQuestions({ pageRowCount: 100 }) });

  const counts = applicationStore.counts();
  const totalUsers = usersData?.paging?.totalRowCount ?? 0;
  const totalTeachers = (teachersData as Record<string, unknown>)?.rowCount as number ?? 0;
  const totalBookings = (bookingsData as Record<string, unknown>)?.rowCount as number ?? 0;

  const users: AdminUser[] = usersData?.users ?? [];
  const verifiedUsers = users.filter((u) => u.emailVerified).length;

  const qRawKey = questionsData ? Object.keys(questionsData as object).find((k) => Array.isArray((questionsData as Record<string, unknown>)[k])) : undefined;
  const questions: QuestionItem[] = qRawKey ? (questionsData as Record<string, unknown[]>)[qRawKey] as QuestionItem[] : [];
  const pendingQuestions = questions.filter((q) => q.status === "pending").length;

  const stats = [
    { label: "Bekleyen Başvuru", value: counts.pending, icon: FileText, color: "text-amber-500", bg: "bg-amber-50", tab: "applications" as Tab, badge: counts.pending > 0 },
    { label: "Toplam Başvuru", value: counts.total, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50", tab: "applications" as Tab },
    { label: "Kayıtlı Kullanıcı", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50", tab: "users" as Tab },
    { label: "Öğretmen Profili", value: totalTeachers, icon: GraduationCap, color: "text-green-500", bg: "bg-green-50", tab: "teachers" as Tab },
    { label: "Rezervasyon", value: totalBookings, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50", tab: "bookings" as Tab },
    { label: "Bekleyen Soru", value: pendingQuestions, icon: MessageSquare, color: "text-red-500", bg: "bg-red-50", tab: "questions" as Tab },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setTab(s.tab)}
            className={`rounded-xl border border-border p-4 text-left transition-all hover:shadow-md ${s.bg}`}
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-background">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              {s.badge && s.value > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">!</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <FileText className="h-4 w-4 text-amber-500" />
            Başvuru Özeti
          </h3>
          <div className="space-y-3">
            {[
              { label: "Öğrenci Başvurusu", value: counts.student, color: "text-indigo-600" },
              { label: "Öğretmen Başvurusu", value: counts.teacher, color: "text-amber-600" },
              { label: "Bekleyen", value: counts.pending, color: "text-red-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setTab("applications")}
            className="mt-4 w-full rounded-lg bg-amber-50 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            Tüm Başvuruları Gör →
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Kullanıcı Durumu
          </h3>
          <div className="space-y-3">
            {[
              { label: "E-posta Doğrulanmış", value: verifiedUsers, icon: CheckCircle, color: "text-green-500" },
              { label: "Doğrulanmamış", value: totalUsers - verifiedUsers, icon: AlertCircle, color: "text-yellow-500" },
              { label: "Toplam Kullanıcı", value: totalUsers, icon: Users, color: "text-blue-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </div>
                <span className="font-bold text-foreground">{item.value}</span>
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
          <Input placeholder="İsim, e-posta veya telefon..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
              typeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
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
              <div key={app.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Özet satır */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${isStudent ? "bg-indigo-600" : "bg-amber-500"}`}>
                    {String(d.fullname ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{String(d.fullname ?? "—")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isStudent ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
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
                        <Trash2 className="h-3.5 w-3.5" /> Sil
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

// ── KULLANICILAR ─────────────────────────────────────────────────

const UsersTab = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.listUsers({ pageRowCount: 500 }),
  });

  const users: AdminUser[] = (data?.users ?? []).filter((u) =>
    !search || u.fullname.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => adminApi.setUserRole(userId, roleId),
    onSuccess: () => { toast.success("Rol güncellendi"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const activeMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => adminApi.setUserActive(userId, isActive),
    onSuccess: () => { toast.success("Durum güncellendi"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const nextRole: Record<string, { role: string; label: string }> = {
    user: { role: "teacher", label: "Öğretmen Yap" },
    teacher: { role: "admin", label: "Admin Yap" },
    admin: { role: "user", label: "Kullanıcı Yap" },
    superAdmin: { role: "superAdmin", label: "Süper Admin" },
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="İsim veya e-posta ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.fullname} className="h-10 w-10 rounded-full object-cover border border-border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{u.fullname}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.roleId] ?? roleColor.user}`}>{roleTR[u.roleId] ?? u.roleId}</span>
                    {u.emailVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {!u.isActive && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Pasif</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>
              {u.roleId !== "superAdmin" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled={roleMutation.isPending}
                    onClick={() => roleMutation.mutate({ userId: u.id, roleId: nextRole[u.roleId]?.role ?? "user" })}>
                    {nextRole[u.roleId]?.label ?? "Rol Değiştir"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={activeMutation.isPending}
                    className={cn("h-7 text-xs", u.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50")}
                    onClick={() => activeMutation.mutate({ userId: u.id, isActive: !u.isActive })}>
                    {u.isActive ? "Deaktif Et" : "Aktif Et"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── ÖĞRETMENLER ───────────────────────────────────────────────────

const TeachersTab = () => {
  const { data, isLoading } = useQuery({ queryKey: ["admin-teachers"], queryFn: () => teacherApi.list({ pageRowCount: 100 }) });
  const rawKey = data ? Object.keys(data).find((k) => Array.isArray((data as Record<string, unknown>)[k])) : undefined;
  const teachers: TeacherProfileItem[] = rawKey ? (data as Record<string, unknown[]>)[rawKey] as TeacherProfileItem[] : [];

  return (
    <div className="space-y-3">
      {isLoading ? <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        : teachers.length === 0 ? <div className="py-16 text-center text-muted-foreground">Kayıtlı öğretmen profili yok.</div>
        : teachers.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <img src={t.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.teacherId_data?.fullname ?? 'T')}&background=6366f1&color=fff`}
                alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{t.teacherId_data?.fullname ?? "Öğretmen"}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                    t.verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                    {t.verificationStatus === "verified" ? "Doğrulandı" : "Bekliyor"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{t.branches || "—"}</p>
              </div>
              <div className="text-right shrink-0">
                {t.profileStats && t.profileStats.avgRating > 0 && (
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{t.profileStats.avgRating.toFixed(1)}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{t.profileStats?.lessonsGiven ?? 0} ders</p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

// ── REZERVASYONLAR ────────────────────────────────────────────────

const BookingsTab = () => {
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminApi.listAllBookings({ pageRowCount: 50 }) });
  const rawKey = data ? Object.keys(data as object).find((k) => Array.isArray((data as Record<string, unknown>)[k])) : undefined;
  const bookings: BookingItem[] = rawKey ? (data as Record<string, unknown[]>)[rawKey] as BookingItem[] : [];

  return (
    <div className="space-y-3">
      {isLoading ? <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        : bookings.length === 0 ? <div className="py-16 text-center text-muted-foreground">Henüz rezervasyon yok.</div>
        : bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <img src={b.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=T&background=6366f1&color=fff`}
                alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{b.teacherId_data?.fullname ?? "Öğretmen"}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", bookingStatusColor[b.bookingStatus] ?? "bg-muted text-muted-foreground")}>
                    {bookingStatusTR[b.bookingStatus] ?? b.bookingStatus}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{b.lessonDate} — {b.startTime} / {b.endTime}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">₺{b.pricePerLesson}</p>
                <p className="text-xs text-muted-foreground">{b.paymentStatus === "paid" ? "Ödendi" : "Bekliyor"}</p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

// ── SORULAR ───────────────────────────────────────────────────────

const QuestionsTab = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", statusFilter],
    queryFn: () => adminApi.listAllQuestions({ pageRowCount: 50, status: statusFilter === "all" ? undefined : statusFilter }),
  });

  const rawKey = data ? Object.keys(data as object).find((k) => Array.isArray((data as Record<string, unknown>)[k])) : undefined;
  const questions: QuestionItem[] = rawKey ? (data as Record<string, unknown[]>)[rawKey] as QuestionItem[] : [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateQuestionStatus(id, status),
    onSuccess: () => { toast.success("Durum güncellendi"); qc.invalidateQueries({ queryKey: ["admin-questions"] }); },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const qStatusColor: Record<string, string> = {
    approved: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", rejected: "bg-red-100 text-red-700",
  };
  const qStatusTR: Record<string, string> = { approved: "Onaylı", pending: "Bekliyor", rejected: "Reddedildi" };
  const filters = [{ value: "all", label: "Tümü" }, { value: "pending", label: "Bekliyor" }, { value: "approved", label: "Onaylı" }, { value: "rejected", label: "Reddedildi" }];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={cn("shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
            {f.label}
          </button>
        ))}
      </div>
      {isLoading ? <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        : questions.length === 0 ? <div className="py-16 text-center text-muted-foreground">Soru bulunamadı.</div>
        : <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <img src={q.studentId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(q.studentId_data?.fullname ?? 'S')}&background=6366f1&color=fff`}
                  alt="" className="h-8 w-8 rounded-full object-cover border border-border shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{q.studentId_data?.fullname ?? "Öğrenci"}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", qStatusColor[q.status] ?? "bg-muted text-muted-foreground")}>{qStatusTR[q.status] ?? q.status}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{q.branch}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground line-clamp-2">{q.content}</p>
                </div>
              </div>
              {q.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1 text-green-600 hover:bg-green-50 border-green-200"
                    onClick={() => statusMutation.mutate({ id: q.id, status: "approved" })} disabled={statusMutation.isPending}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Onayla
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1 text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => statusMutation.mutate({ id: q.id, status: "rejected" })} disabled={statusMutation.isPending}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reddet
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>}
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
    { key: "users", label: "Kullanıcılar", icon: Users },
    { key: "teachers", label: "Öğretmenler", icon: GraduationCap },
    { key: "bookings", label: "Rezervasyonlar", icon: BookOpen },
    { key: "questions", label: "Sorular", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">Admin Paneli</h1>
              <p className="text-xs text-muted-foreground mt-0.5">OzelDers Yönetim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Siteye Dön</span>
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
              <img src={user?.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="hidden sm:block text-sm font-medium text-foreground">{user?.fullname}</span>
            </div>
            <button onClick={async () => { await signOut(); navigate("/"); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Çıkış">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-5xl overflow-x-auto">
          <div className="flex px-4">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={cn("relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.badge != null && t.badge > 0 && (
                  <span className="absolute -top-0.5 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
        {activeTab === "users" && <UsersTab />}
        {activeTab === "teachers" && <TeachersTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "questions" && <QuestionsTab />}
      </div>
    </div>
  );
};

export default AdminPanel;
