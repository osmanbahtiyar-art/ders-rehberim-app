import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  MessageSquare, LogOut, CheckCircle,
  XCircle, Shield, Search, RefreshCw, ArrowLeft,
  TrendingUp, Clock, AlertCircle, Star, Eye,
  Ban, Bell, ChevronDown, ChevronUp, Image as ImageIcon,
  UserCheck, BookMarked, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminApi, teacherApi, AdminUser,
  TeacherProfileItem, QuestionItem, BookingItem,
  MessageItem, ConversationItem, friendlyError
} from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Supabase kullanıcı tipi ───────────────────────────────────────

interface SupabaseProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  role: string | null;           // user_roles tablosundan join edilecek
  is_student: boolean;
  is_teacher: boolean;
}

async function fetchAllProfiles(): Promise<SupabaseProfile[]> {
  // profiles tablosunu çek
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (pErr) throw new Error(pErr.message);
  if (!profiles || profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.user_id);

  // user_roles tablosunu çek
  const { data: roles } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);

  // student_profiles var mı kontrol
  const { data: students } = await supabase
    .from('student_profiles')
    .select('user_id')
    .in('user_id', userIds);

  // teacher_profiles var mı kontrol
  const { data: teachers } = await supabase
    .from('teacher_profiles')
    .select('user_id')
    .in('user_id', userIds);

  const roleMap: Record<string, string> = {};
  (roles ?? []).forEach((r) => { roleMap[r.user_id] = r.role; });

  const studentSet = new Set((students ?? []).map((s) => s.user_id));
  const teacherSet = new Set((teachers ?? []).map((t) => t.user_id));

  return profiles.map((p) => ({
    id: p.id,
    user_id: p.user_id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
    role: roleMap[p.user_id] ?? (teacherSet.has(p.user_id) ? 'teacher' : 'student'),
    is_student: studentSet.has(p.user_id),
    is_teacher: teacherSet.has(p.user_id),
  }));
}

async function setSupabaseUserRole(userId: string, role: string) {
  // Önce mevcut rolü sil, sonra yeni rol ekle
  await supabase.from('user_roles').delete().eq('user_id', userId);
  if (role !== 'student') {
    // 'student' default — sadece teacher/admin kaydet
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: role as 'student' | 'teacher' });
    if (error) throw new Error(error.message);
  }
}

type Tab = "dashboard" | "users" | "teachers" | "bookings" | "questions" | "messages";

// ── Yardımcı ──────────────────────────────────────────────────────

const roleColor: Record<string, string> = {
  superAdmin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  admin:      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  teacher:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  parent:     "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  user:       "bg-muted text-muted-foreground",
};

const statusColor: Record<string, string> = {
  approved:  "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  rejected:  "bg-red-100 text-red-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const roleTR: Record<string, string> = {
  superAdmin: "Süper Admin",
  admin:      "Admin",
  teacher:    "Öğretmen",
  parent:     "Veli",
  user:       "Öğrenci",
};

function Avatar({ src, name, size = 10 }: { src?: string; name: string; size?: number }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=6366f1&color=fff`;
  return (
    <img
      src={src || fallback}
      alt={name}
      className={`h-${size} w-${size} rounded-full object-cover border border-border shrink-0`}
    />
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="py-20 text-center">
      <Icon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ApiError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const msg = error instanceof Error ? error.message : String(error);
  const isAuth = msg.includes("401") || msg.includes("LoginRequired") || msg.includes("Unauthorized");
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-6 text-center">
      <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
      <p className="font-semibold text-red-700 dark:text-red-400">
        {isAuth ? "Yetki Hatası" : "Bağlantı Hatası"}
      </p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-500">
        {isAuth
          ? "Bu verileri görmek için admin/superAdmin yetkisi gerekiyor. Lütfen admin hesabıyla giriş yapın."
          : msg}
      </p>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-1.5 mx-auto rounded-lg bg-red-100 dark:bg-red-900/30 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"
      >
        <RefreshCw className="h-4 w-4" /> Tekrar Dene
      </button>
    </div>
  );
}

/** API yanıtından diziyi güvenli biçimde çeker.
 *  Önce bilinen anahtarları (users, items, data, list vb.) dener,
 *  bulamazsa response içindeki ilk diziyi alır. */
function extractList<T>(data: unknown, knownKeys: string[] = []): T[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  for (const k of [...knownKeys, "users", "items", "data", "list", "records", "rows"]) {
    if (Array.isArray(obj[k])) return obj[k] as T[];
  }
  const dynKey = Object.keys(obj).find(
    (k) => Array.isArray(obj[k]) && k !== "paging" && k !== "errors"
  );
  return dynKey ? (obj[dynKey] as T[]) : [];
}

// ── Dashboard Tab ─────────────────────────────────────────────────

const DashboardTab = () => {
  // Supabase'den kullanıcılar
  const { data: supaUsers = [], isError: usersErr, error: usersErrMsg, refetch: refetchUsers } = useQuery({
    queryKey: ["supabase-users"],
    queryFn: fetchAllProfiles,
    retry: 1,
  });

  // ODR'dan rezervasyon ve sorular
  const { data: bookingsData, isError: bookingsErr, error: bookingsErrMsg, refetch: refetchBookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminApi.listAllBookings({ pageRowCount: 200 }),
    retry: 1,
  });
  const { data: questionsData, isError: questionsErr, error: questionsErrMsg } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: () => adminApi.listAllQuestions({ pageRowCount: 200 }),
    retry: 1,
  });

  const anyError = usersErr; // ODR hataları kritik değil

  const totalStudents = supaUsers.filter((u) => !u.role || u.role === "student").length;
  const totalTeachers = supaUsers.filter((u) => u.role === "teacher").length;
  const totalAdmins   = supaUsers.filter((u) => u.role === "admin").length;
  const totalUsers    = supaUsers.length;

  const bookings: BookingItem[] = extractList<BookingItem>(bookingsData);
  const activeBookings = bookings.filter((b) => b.bookingStatus === "confirmed" || b.bookingStatus === "pending").length;

  const questions: QuestionItem[] = extractList<QuestionItem>(questionsData);
  const pendingQuestions = questions.filter((q) => q.status === "pending").length;

  // eski değişkenler artık kullanılmıyor — dummy değerler
  const verifiedUsers = 0;
  const activeUsers = totalUsers;
  const bannedUsers = 0;
  const totalParents = 0;

  const statCards = [
    { label: "Toplam Öğrenci",   value: totalStudents,    icon: Users,        color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Toplam Öğretmen",  value: totalTeachers,    icon: GraduationCap,color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Aktif Dersler",    value: activeBookings,   icon: BookMarked,   color: "text-green-500",  bg: "bg-green-50 dark:bg-green-950/30" },
    { label: "Bekleyen Sorular", value: pendingQuestions, icon: HelpCircle,   color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  ];

  return (
    <div className="space-y-6">

      {/* API Hata Bildirimi */}
      {anyError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 space-y-2">
          <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> API Bağlantı Hatası
          </p>
          {usersErr && (
            <p className="text-xs text-red-600 font-mono">Kullanıcılar: {(usersErrMsg as Error)?.message}</p>
          )}
          {bookingsErr && (
            <p className="text-xs text-red-600 font-mono">Rezervasyonlar: {(bookingsErrMsg as Error)?.message}</p>
          )}
          {questionsErr && (
            <p className="text-xs text-red-600 font-mono">Sorular: {(questionsErrMsg as Error)?.message}</p>
          )}
          <p className="text-xs text-red-500">Browser Console'u açın (F12) — detaylı log için [ODR API] satırlarına bakın.</p>
          <button
            onClick={() => { refetchUsers(); refetchBookings(); }}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl border border-border p-4 ${s.bg}`}>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-background">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Kullanıcı Dağılımı */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Kullanıcı Dağılımı
          </h3>
          <div className="space-y-3">
            {[
              { label: "Öğrenci",  value: totalStudents, color: "text-blue-500",   dot: "bg-blue-500" },
              { label: "Öğretmen", value: totalTeachers, color: "text-amber-500",  dot: "bg-amber-500" },
              { label: "Admin",    value: totalAdmins,   color: "text-orange-500", dot: "bg-orange-500" },
              { label: "Toplam",   value: totalUsers,    color: "text-foreground",  dot: "bg-muted-foreground" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                  {row.label}
                </div>
                <span className={`font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hesap Durumu */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Hesap Durumu
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <UserCheck className="h-4 w-4 text-blue-500" />
                Kayıtlı Kullanıcı
              </div>
              <span className="font-bold text-blue-600">{totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <GraduationCap className="h-4 w-4 text-amber-500" />
                Öğretmen Profili
              </div>
              <span className="font-bold text-amber-600">{supaUsers.filter(u => u.is_teacher).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Users className="h-4 w-4 text-green-500" />
                Öğrenci Profili
              </div>
              <span className="font-bold text-green-600">{supaUsers.filter(u => u.is_student).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Shield className="h-4 w-4 text-orange-500" />
                Admin Sayısı
              </div>
              <span className="font-bold text-orange-600">{totalAdmins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Son Kayıtlar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Son Kayıtlar
        </h3>
        <div className="space-y-2">
          {supaUsers.slice(0, 6).map((u) => {
            const role = u.role ?? "student";
            const roleColorMap: Record<string,string> = { admin:"bg-orange-100 text-orange-700", teacher:"bg-blue-100 text-blue-700", student:"bg-muted text-muted-foreground" };
            const roleTRMap: Record<string,string> = { admin:"Admin", teacher:"Öğretmen", student:"Öğrenci" };
            return (
              <div key={u.id} className="flex items-center gap-3">
                <img
                  src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name||'K')}&background=6366f1&color=fff`}
                  alt={u.full_name}
                  className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColorMap[role] ?? roleColorMap.student}`}>
                  {roleTRMap[role] ?? role}
                </span>
              </div>
            );
          })}
          {supaUsers.length === 0 && !usersErr && (
            <p className="text-sm text-muted-foreground text-center py-4">Henüz kayıtlı kullanıcı yok.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Users Tab (Supabase) ──────────────────────────────────────────

const UsersTab = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: allUsers = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["supabase-users"],
    queryFn: fetchAllProfiles,
    retry: 1,
  });

  const users = allUsers.filter((u) => {
    const name = u.full_name?.toLowerCase() ?? "";
    const matchesSearch = !search || name.includes(search.toLowerCase());
    const role = u.role ?? "student";
    const matchesRole = roleFilter === "all" || role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      setSupabaseUserRole(userId, role),
    onSuccess: () => {
      toast.success("Rol güncellendi");
      qc.invalidateQueries({ queryKey: ["supabase-users"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const roleOptions = [
    { value: "all",     label: "Tümü" },
    { value: "student", label: "Öğrenci" },
    { value: "teacher", label: "Öğretmen" },
    { value: "admin",   label: "Admin" },
  ];

  const roleSequence: Record<string, { next: string; label: string }> = {
    student: { next: "teacher", label: "Öğretmen Yap" },
    teacher: { next: "admin",   label: "Admin Yap" },
    admin:   { next: "student", label: "Öğrenci Yap" },
  };

  const roleColorSupa: Record<string, string> = {
    admin:   "bg-orange-100 text-orange-700",
    teacher: "bg-blue-100 text-blue-700",
    student: "bg-muted text-muted-foreground",
  };

  const roleTRSupa: Record<string, string> = {
    admin:   "Admin",
    teacher: "Öğretmen",
    student: "Öğrenci",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="İsim ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Rol filtresi */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {roleOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRoleFilter(opt.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              roleFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isError && <ApiError error={error} onRetry={refetch} />}

      {!isError && !isLoading && (
        <p className="text-xs text-muted-foreground">{users.length} kullanıcı</p>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? null : users.length === 0 ? (
        <EmptyState icon={Users} text="Kullanıcı bulunamadı." />
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const role = u.role ?? "student";
            const avatarSrc =
              u.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || "K")}&background=6366f1&color=fff`;
            const next = roleSequence[role] ?? roleSequence.student;

            return (
              <div key={u.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarSrc}
                    alt={u.full_name}
                    className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">{u.full_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColorSupa[role] ?? roleColorSupa.student}`}>
                        {roleTRSupa[role] ?? role}
                      </span>
                      {u.is_student && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Öğrenci Profili</span>
                      )}
                      {u.is_teacher && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Öğretmen Profili</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kayıt: {new Date(u.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={roleMutation.isPending}
                    onClick={() => roleMutation.mutate({ userId: u.user_id, role: next.next })}
                  >
                    {next.label}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Teachers Tab ──────────────────────────────────────────────────

const TeachersTab = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: () => teacherApi.list({ pageRowCount: 100 }),
    retry: 1,
  });

  const teachers: TeacherProfileItem[] = extractList<TeacherProfileItem>(data, ["teacherProfiles", "teachers", "teacherprofiles"]);

  return (
    <div className="space-y-3">
      {isError && <ApiError error={error} onRetry={refetch} />}
      {isLoading ? <LoadingSpinner /> : isError ? null : teachers.length === 0 ? (
        <EmptyState icon={GraduationCap} text="Kayıtlı öğretmen profili yok." />
      ) : (
        teachers.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar src={t.teacherId_data?.avatar} name={t.teacherId_data?.fullname ?? "T"} size={10} />
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

// ── Bookings Tab ──────────────────────────────────────────────────

const BookingsTab = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminApi.listAllBookings({ pageRowCount: 50 }),
    retry: 1,
  });

  const bookings: BookingItem[] = extractList<BookingItem>(data, ["lessonBookings", "bookings"]);

  const statusTR: Record<string, string> = { pending: "Bekliyor", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal" };

  return (
    <div className="space-y-3">
      {isError && <ApiError error={error} onRetry={refetch} />}
      {isLoading ? <LoadingSpinner /> : isError ? null : bookings.length === 0 ? (
        <EmptyState icon={BookOpen} text="Henüz rezervasyon yok." />
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar src={b.teacherId_data?.avatar} name={b.teacherId_data?.fullname ?? "T"} size={10} />
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

// ── Questions Tab (Moderation) ────────────────────────────────────

const QuestionsTab = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedImg, setExpandedImg] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-questions", statusFilter],
    queryFn: () => adminApi.listAllQuestions({ pageRowCount: 50, status: statusFilter === "all" ? undefined : statusFilter }),
    retry: 1,
  });

  const questions: QuestionItem[] = extractList<QuestionItem>(data, ["questions", "studentQuestions"]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateQuestionStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(vars.status === "approved" ? "Soru yayına alındı" : "Soru reddedildi");
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const statusTR: Record<string, string> = { approved: "Onaylı", pending: "Bekliyor", rejected: "Reddedildi" };
  const filters = [
    { value: "pending",  label: "Bekleyenler" },
    { value: "approved", label: "Onaylı" },
    { value: "rejected", label: "Reddedildi" },
    { value: "all",      label: "Tümü" },
  ];

  return (
    <div className="space-y-4">
      {/* Image lightbox */}
      {expandedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedImg(null)}
        >
          <img src={expandedImg} alt="Soru fotoğrafı" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError && <ApiError error={error} onRetry={refetch} />}
      {isLoading ? <LoadingSpinner /> : isError ? null : questions.length === 0 ? (
        <EmptyState icon={HelpCircle} text="Bu kategoride soru bulunamadı." />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Question image */}
              {q.attachments && (
                <div className="relative bg-muted">
                  <img
                    src={q.attachments}
                    alt="Soru fotoğrafı"
                    className="h-48 w-full object-contain cursor-pointer"
                    onClick={() => setExpandedImg(q.attachments!)}
                  />
                  <button
                    className="absolute top-2 right-2 rounded-lg bg-black/50 p-1.5 text-white hover:bg-black/70"
                    onClick={() => setExpandedImg(q.attachments!)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* If no image, show placeholder */}
              {!q.attachments && (
                <div className="flex h-24 items-center justify-center bg-muted/50">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={q.studentId_data?.avatar} name={q.studentId_data?.fullname ?? "Öğrenci"} size={8} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{q.studentId_data?.fullname ?? "Öğrenci"}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColor[q.status] ?? "bg-muted text-muted-foreground")}>
                        {statusTR[q.status] ?? q.status}
                      </span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{q.branch}</span>
                      {q.examType && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{q.examType}</span>
                      )}
                    </div>
                    {q.content && (
                      <p className="mt-1 text-sm text-foreground line-clamp-2">{q.content}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{q.answerCount} cevap</p>
                  </div>
                </div>

                {q.status === "pending" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      size="sm" variant="outline"
                      className="h-8 text-xs text-green-600 hover:bg-green-50 border-green-200 gap-1"
                      onClick={() => statusMutation.mutate({ id: q.id, status: "approved" })}
                      disabled={statusMutation.isPending}
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Yayına Al
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="h-8 text-xs text-red-600 hover:bg-red-50 border-red-200 gap-1"
                      onClick={() => statusMutation.mutate({ id: q.id, status: "rejected" })}
                      disabled={statusMutation.isPending}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reddet
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Messages Tab (Mesaj Denetimi) ─────────────────────────────────

const MessagesTab = () => {
  const qc = useQueryClient();
  const [expandedConv, setExpandedConv] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Try to load conversations from messaging API
  const { data: convsData, isLoading, error } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: () => adminApi.listAllConversations({ pageRowCount: 100 }),
    retry: 1,
  });

  // Load messages for expanded conversation
  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ["admin-conv-messages", expandedConv],
    queryFn: () => adminApi.listConversationMessages(expandedConv!),
    enabled: !!expandedConv,
    retry: 1,
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => adminApi.setUserActive(userId, false),
    onSuccess: () => {
      toast.success("Kullanıcı banlılandı");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-conversations"] });
    },
    onError: (err) => toast.error(friendlyError(err)),
  });

  const rawConvKey = convsData ? Object.keys(convsData as object).find((k) => Array.isArray((convsData as Record<string, unknown>)[k])) : undefined;
  const conversations: ConversationItem[] = rawConvKey ? (convsData as Record<string, unknown[]>)[rawConvKey] as ConversationItem[] : [];

  const rawMsgKey = msgsData ? Object.keys(msgsData as object).find((k) => Array.isArray((msgsData as Record<string, unknown>)[k])) : undefined;
  const messages: MessageItem[] = rawMsgKey ? (msgsData as Record<string, unknown[]>)[rawMsgKey] as MessageItem[] : [];

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true;
    const nameA = c.participantA_data?.fullname?.toLowerCase() ?? "";
    const nameB = c.participantB_data?.fullname?.toLowerCase() ?? "";
    return nameA.includes(search.toLowerCase()) || nameB.includes(search.toLowerCase());
  });

  if (error) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900/50 p-6 text-center">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
        <p className="font-semibold text-yellow-800 dark:text-yellow-300">Mesaj API'sine Bağlanılamadı</p>
        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
          Mesajlaşma servisi henüz aktif değil veya yetki hatası oluştu.
        </p>
        <p className="mt-2 text-xs text-yellow-500">Hata: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Kullanıcı adıyla ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50 p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          Platform güvenliği: Tüm mesajlar platform dışı iletişim engeli için denetlenmektedir.
        </p>
      </div>

      {isLoading ? <LoadingSpinner /> : filteredConvs.length === 0 ? (
        <EmptyState icon={MessageSquare} text="Henüz mesajlaşma kaydı yok." />
      ) : (
        <div className="space-y-2">
          {filteredConvs.map((conv) => {
            const isExpanded = expandedConv === conv.id;
            const nameA = conv.participantA_data?.fullname ?? "Kullanıcı A";
            const nameB = conv.participantB_data?.fullname ?? "Kullanıcı B";

            return (
              <div key={conv.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Conversation header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => setExpandedConv(isExpanded ? null : conv.id)}
                >
                  <div className="flex -space-x-2 shrink-0">
                    <Avatar src={conv.participantA_data?.avatar} name={nameA} size={9} />
                    <Avatar src={conv.participantB_data?.avatar} name={nameB} size={9} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{nameA}</span>
                      <span className="text-xs text-muted-foreground">↔</span>
                      <span className="text-sm font-semibold text-foreground">{nameB}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {conv.participantA_data?.roleId && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColor[conv.participantA_data.roleId] ?? roleColor.user}`}>
                          {roleTR[conv.participantA_data.roleId] ?? conv.participantA_data.roleId}
                        </span>
                      )}
                      {conv.participantB_data?.roleId && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColor[conv.participantB_data.roleId] ?? roleColor.user}`}>
                          {roleTR[conv.participantB_data.roleId] ?? conv.participantB_data.roleId}
                        </span>
                      )}
                      {conv.messageCount !== undefined && (
                        <span className="text-xs text-muted-foreground">{conv.messageCount} mesaj</span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="mt-1 text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {/* Expanded: messages + action buttons */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Action bar */}
                    <div className="flex gap-2 px-4 py-3 bg-muted/30">
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs gap-1 text-yellow-600 hover:bg-yellow-50 border-yellow-200"
                        onClick={() => {
                          toast.success(`${nameA} kullanıcısına uyarı gönderildi`);
                        }}
                      >
                        <Bell className="h-3.5 w-3.5" /> {nameA}'yı Uyar
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs gap-1 text-yellow-600 hover:bg-yellow-50 border-yellow-200"
                        onClick={() => {
                          toast.success(`${nameB} kullanıcısına uyarı gönderildi`);
                        }}
                      >
                        <Bell className="h-3.5 w-3.5" /> {nameB}'yı Uyar
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs gap-1 text-red-600 hover:bg-red-50 border-red-200"
                        disabled={banMutation.isPending}
                        onClick={() => {
                          if (conv.participantA) banMutation.mutate(conv.participantA);
                        }}
                      >
                        <Ban className="h-3.5 w-3.5" /> Banla
                      </Button>
                    </div>

                    {/* Messages list */}
                    <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                      {msgsLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                      ) : messages.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">Mesaj bulunamadı.</p>
                      ) : (
                        messages.map((msg) => {
                          const senderName = msg.senderId_data?.fullname ?? "Kullanıcı";
                          const senderRole = msg.senderId_data?.roleId ?? "user";
                          return (
                            <div key={msg.id} className="flex items-start gap-2">
                              <Avatar src={msg.senderId_data?.avatar} name={senderName} size={7} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{senderName}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColor[senderRole] ?? roleColor.user}`}>
                                    {roleTR[senderRole] ?? senderRole}
                                  </span>
                                  {msg.createdAt && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {new Date(msg.createdAt).toLocaleString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-sm text-foreground bg-muted rounded-lg px-3 py-2">{msg.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
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

// ── Ana AdminPanel ────────────────────────────────────────────────

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Genel Bakış",   icon: LayoutDashboard },
    { key: "questions", label: "Soru Onay",      icon: HelpCircle },
    { key: "messages",  label: "Mesaj Denetimi", icon: MessageSquare },
    { key: "users",     label: "Kullanıcılar",   icon: Users },
    { key: "teachers",  label: "Öğretmenler",    icon: GraduationCap },
    { key: "bookings",  label: "Rezervasyonlar", icon: BookOpen },
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
              <p className="text-xs text-muted-foreground mt-0.5">Ders Rehberim Yönetim</p>
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
        {activeTab === "questions" && <QuestionsTab />}
        {activeTab === "messages"  && <MessagesTab />}
        {activeTab === "users"     && <UsersTab />}
        {activeTab === "teachers"  && <TeachersTab />}
        {activeTab === "bookings"  && <BookingsTab />}
      </div>
    </div>
  );
};

export default AdminPanel;
