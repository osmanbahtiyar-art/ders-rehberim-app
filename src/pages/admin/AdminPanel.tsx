import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  MessageSquare, LogOut, ChevronRight, CheckCircle,
  XCircle, Shield, Search, RefreshCw, ArrowLeft,
  TrendingUp, Clock, AlertCircle, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminApi, teacherApi, AdminUser,
  TeacherProfileItem, QuestionItem, BookingItem, friendlyError
} from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "users" | "teachers" | "bookings" | "questions";

// ── Yardımcı bileşenler ──────────────────────────────────────────

const roleColor: Record<string, string> = {
  superAdmin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  admin: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  teacher: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-muted text-muted-foreground",
};

const statusColor: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const roleTR: Record<string, string> = {
  superAdmin: "Süper Admin",
  admin: "Admin",
  teacher: "Öğretmen",
  user: "Öğrenci",
};

// ── Dashboard Tab ────────────────────────────────────────────────

const DashboardTab = () => {
  const { data: usersData } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminApi.listUsers({ pageRowCount: 100 }) });
  const { data: teachersData } = useQuery({ queryKey: ["admin-teachers"], queryFn: () => teacherApi.list({ pageRowCount: 100 }) });
  const { data: bookingsData } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminApi.listAllBookings({ pageRowCount: 100 }) });
  const { data: questionsData } = useQuery({ queryKey: ["admin-questions"], queryFn: () => adminApi.listAllQuestions({ pageRowCount: 100 }) });

  const totalUsers = usersData?.paging?.totalRowCount ?? 0;
  const totalTeachers = (teachersData as Record<string, unknown>)?.rowCount as number ?? 0;
  const totalBookings = (bookingsData as Record<string, unknown>)?.rowCount as number ?? 0;
  const totalQuestions = (questionsData as Record<string, unknown>)?.rowCount as number ?? 0;

  const users: AdminUser[] = usersData?.users ?? [];
  const verifiedUsers = users.filter((u) => u.emailVerified).length;
  const activeUsers = users.filter((u) => u.isActive).length;

  const stats = [
    { label: "Toplam Kullanıcı", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Öğretmen Profili", value: totalTeachers, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Rezervasyon", value: totalBookings, icon: BookOpen, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
    { label: "Soru", value: totalQuestions, icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border border-border p-4 ${s.bg}`}>
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-background`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Kullanıcı Durumu
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                E-posta Doğrulanmış
              </div>
              <span className="font-bold text-foreground">{verifiedUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Doğrulanmamış
              </div>
              <span className="font-bold text-foreground">{totalUsers - verifiedUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Shield className="h-4 w-4 text-blue-500" />
                Aktif Hesap
              </div>
              <span className="font-bold text-foreground">{activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Son Kayıtlar
          </h3>
          <div className="space-y-2">
            {users.slice(-4).reverse().map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <img
                  src={u.avatar}
                  alt={u.fullname}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.fullname}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColor[u.roleId] ?? roleColor.user}`}>
                  {roleTR[u.roleId] ?? u.roleId}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Users Tab ────────────────────────────────────────────────────

const UsersTab = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.listUsers({ pageRowCount: 100 }),
  });

  const users: AdminUser[] = (data?.users ?? []).filter((u) =>
    !search || u.fullname.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminApi.setUserRole(userId, roleId),
    onSuccess: () => { toast.success("Rol güncellendi"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const activeMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.setUserActive(userId, isActive),
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="İsim veya e-posta ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
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
                    <span className="font-semibold text-foreground truncate">{u.fullname}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.roleId] ?? roleColor.user}`}>
                      {roleTR[u.roleId] ?? u.roleId}
                    </span>
                    {u.emailVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500" title="E-posta doğrulandı" />
                    )}
                    {!u.isActive && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Pasif</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>

              {u.roleId !== "superAdmin" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={roleMutation.isPending}
                    onClick={() => roleMutation.mutate({ userId: u.id, roleId: nextRole[u.roleId]?.role ?? "user" })}
                  >
                    {nextRole[u.roleId]?.label ?? "Rol Değiştir"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("h-7 text-xs", u.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50")}
                    disabled={activeMutation.isPending}
                    onClick={() => activeMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                  >
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

// ── Teachers Tab ─────────────────────────────────────────────────

const TeachersTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: () => teacherApi.list({ pageRowCount: 100 }),
  });

  const rawKey = data ? Object.keys(data).find((k) => Array.isArray((data as Record<string, unknown>)[k])) : undefined;
  const teachers: TeacherProfileItem[] = rawKey ? (data as Record<string, unknown[]>)[rawKey] as TeacherProfileItem[] : [];

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : teachers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">Kayıtlı öğretmen profili yok.</div>
      ) : (
        teachers.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <img
                src={t.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.teacherId_data?.fullname ?? 'T')}&background=6366f1&color=fff`}
                alt={t.teacherId_data?.fullname}
                className="h-10 w-10 rounded-full object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{t.teacherId_data?.fullname ?? "Öğretmen"}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    t.verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
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
            {t.description && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// ── Bookings Tab ─────────────────────────────────────────────────

const BookingsTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminApi.listAllBookings({ pageRowCount: 50 }),
  });

  const rawKey = data ? Object.keys(data as object).find((k) => Array.isArray((data as Record<string, unknown>)[k])) : undefined;
  const bookings: BookingItem[] = rawKey ? (data as Record<string, unknown[]>)[rawKey] as BookingItem[] : [];

  const statusTR: Record<string, string> = { pending: "Bekliyor", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal" };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">Henüz rezervasyon yok.</div>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <img
                src={b.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=T&background=6366f1&color=fff`}
                alt={b.teacherId_data?.fullname}
                className="h-10 w-10 rounded-full object-cover border border-border"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{b.teacherId_data?.fullname ?? "Öğretmen"}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColor[b.bookingStatus] ?? "bg-muted text-muted-foreground")}>
                    {statusTR[b.bookingStatus] ?? b.bookingStatus}
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
        ))
      )}
    </div>
  );
};

// ── Questions Tab ────────────────────────────────────────────────

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

  const statusTR: Record<string, string> = { approved: "Onaylı", pending: "Bekliyor", rejected: "Reddedildi" };
  const filters = [
    { value: "all", label: "Tümü" },
    { value: "pending", label: "Bekliyor" },
    { value: "approved", label: "Onaylı" },
    { value: "rejected", label: "Reddedildi" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">Soru bulunamadı.</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <img
                  src={q.studentId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(q.studentId_data?.fullname ?? 'S')}&background=6366f1&color=fff`}
                  alt={q.studentId_data?.fullname}
                  className="h-8 w-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{q.studentId_data?.fullname ?? "Öğrenci"}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColor[q.status] ?? "bg-muted text-muted-foreground")}>
                      {statusTR[q.status] ?? q.status}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{q.branch}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground line-clamp-2">{q.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{q.answerCount} cevap</p>
                </div>
              </div>
              {q.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm" variant="outline"
                    className="h-7 text-xs flex-1 text-green-600 hover:bg-green-50 border-green-200"
                    onClick={() => statusMutation.mutate({ id: q.id, status: "approved" })}
                    disabled={statusMutation.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Onayla
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="h-7 text-xs flex-1 text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => statusMutation.mutate({ id: q.id, status: "rejected" })}
                    disabled={statusMutation.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reddet
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

// ── Ana AdminPanel ───────────────────────────────────────────────

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Genel Bakış", icon: LayoutDashboard },
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
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Uygulamaya Dön</span>
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
              <img src={user?.avatar} alt={user?.fullname} className="h-6 w-6 rounded-full object-cover" />
              <span className="hidden sm:block text-sm font-medium text-foreground">{user?.fullname}</span>
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

        {/* Tab bar */}
        <div className="mx-auto max-w-5xl overflow-x-auto">
          <div className="flex px-4 gap-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "teachers" && <TeachersTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "questions" && <QuestionsTab />}
      </div>
    </div>
  );
};

export default AdminPanel;
