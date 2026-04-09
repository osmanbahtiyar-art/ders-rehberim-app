import { Search, Star, ChevronRight, HelpCircle, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import TeacherCard from "@/components/TeacherCard";
import QuestionCard from "@/components/QuestionCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teacherApi, qaApi, normalizeTeacher } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.roleId === "teacher";

  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teacherApi.list({ pageRowCount: 10 }),
  });

  const { data: questionsData } = useQuery({
    queryKey: ["questions-home"],
    queryFn: () => qaApi.listQuestions({ pageRowCount: 6 }),
  });

  const rawTeachersKey = teachersData
    ? Object.keys(teachersData as object).find((k) => Array.isArray((teachersData as Record<string, unknown>)[k]))
    : undefined;
  const teachers = rawTeachersKey
    ? ((teachersData as Record<string, unknown[]>)[rawTeachersKey] || []).map((t) => normalizeTeacher(t as Parameters<typeof normalizeTeacher>[0]))
    : [];

  const rawQKey = questionsData
    ? Object.keys(questionsData as object).find((k) => Array.isArray((questionsData as Record<string, unknown>)[k]))
    : undefined;
  const rawQuestions = rawQKey ? (questionsData as Record<string, unknown[]>)[rawQKey] : [];
  const questions = (rawQuestions ?? []) as Array<{
    id: string;
    branch: string;
    examType: string;
    attachments?: string;
    studentId_data?: { fullname: string };
  }>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className={`px-6 pb-8 pt-10 ${isTeacher ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-primary"}`}>
        <div className="mx-auto max-w-lg">
          <h2 className="text-lg font-semibold text-primary-foreground">Merhaba! 👋</h2>
          <p className="mt-0.5 text-sm text-primary-foreground/80">
            {isTeacher ? "Bugün kaç soru çözeceksin?" : "Bugün ne öğrenmek istersin?"}
          </p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isTeacher ? "Ders ara..." : "Ders veya öğretmen ara..."}
              className="border-0 bg-card pl-10 shadow-card"
              onClick={() => navigate("/search")}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6">
        {isTeacher ? (
          <button
            onClick={() => navigate("/solve-questions")}
            className="mt-6 flex w-full items-center gap-3 rounded-xl bg-amber-500/10 p-4 text-left transition-colors hover:bg-amber-500/15 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Soru Çöz</p>
              <p className="text-xs text-muted-foreground">Öğrencilerin sorularına çözüm gönder!</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/ask-question")}
            className="mt-6 flex w-full items-center gap-3 rounded-xl bg-accent/10 p-4 text-left transition-colors hover:bg-accent/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent">
              <HelpCircle className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Ücretsiz Soru Çöz</p>
              <p className="text-xs text-muted-foreground">Sorunu yükle, öğretmenler çözsün!</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Popüler Öğretmenler</h3>
            <button onClick={() => navigate("/search")} className="text-sm font-medium text-primary hover:underline">
              Tümü
            </button>
          </div>
          <div className="space-y-3">
            {teachers.slice(0, 3).map((t) => (
              <TeacherCard key={t.id} {...t} />
            ))}
            {teachers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">Öğretmen bulunamadı</p>
            )}
          </div>
        </div>

        {teachers.length > 3 && (
          <div className="mt-8">
            <h3 className="mb-3 text-lg font-bold text-foreground">Öne Çıkan Öğretmenler</h3>
            <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-none">
              {teachers.slice(3).map((t) => (
                <div
                  key={t.id}
                  className="min-w-[160px] cursor-pointer rounded-xl border border-border bg-card p-3 shadow-card"
                  onClick={() => navigate(`/teacher/${t.id}`)}
                >
                  <img src={t.avatar} alt={t.name} className="mx-auto h-16 w-16 rounded-full object-cover" loading="lazy" />
                  <h4 className="mt-2 text-center text-sm font-semibold text-card-foreground">{t.name}</h4>
                  <p className="text-center text-xs text-muted-foreground">{t.subject}</p>
                  {t.rating > 0 && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs font-medium">{t.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {t.price > 0 && <p className="mt-1 text-center text-sm font-bold text-primary">{t.price}₺</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 mb-4">
          <h3 className="mb-3 text-lg font-bold text-foreground">Son Çözülen Sorular</h3>
          {questions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  image={q.attachments ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(q.branch)}&background=6366f1&color=fff&size=200`}
                  subject={q.branch}
                  grade={q.examType}
                  answeredBy={q.studentId_data?.fullname}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">Henüz soru yok</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
