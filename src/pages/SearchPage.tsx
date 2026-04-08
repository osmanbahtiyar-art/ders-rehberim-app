import { useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import TeacherCard from "@/components/TeacherCard";
import BottomNav from "@/components/BottomNav";
import { subjects, exams } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teacherApi, normalizeTeacher } from "@/lib/api";

const SearchPage = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["teachers", selectedSubject],
    queryFn: () => teacherApi.list({ branch: selectedSubject ?? undefined, pageRowCount: 50 }),
  });

  const rawTeachers = (data as Record<string, unknown>)?.teacherProfile as unknown[] | undefined;
  const teachers = (rawTeachers ?? []).map((t) => normalizeTeacher(t as Parameters<typeof normalizeTeacher>[0]));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Ders veya öğretmen ara..." className="pl-10" autoFocus />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="rounded-lg border border-border p-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-lg">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">DERS</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(selectedSubject === s ? null : s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedSubject === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-3 text-xs font-semibold text-muted-foreground">SINAV</p>
            <div className="flex flex-wrap gap-2">
              {exams.map((e) => (
                <button
                  key={e}
                  onClick={() => setSelectedExam(selectedExam === e ? null : e)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedExam === e ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Yükleniyor...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{teachers.length} öğretmen bulundu</p>
            {teachers.map((t) => (
              <TeacherCard key={t.id} {...t} />
            ))}
            {teachers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Öğretmen bulunamadı</p>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default SearchPage;
