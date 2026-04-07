import { Search, Star, ChevronRight, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TeacherCard from "@/components/TeacherCard";
import QuestionCard from "@/components/QuestionCard";
import BottomNav from "@/components/BottomNav";
import { teachers, questions } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary px-6 pb-8 pt-10">
        <div className="mx-auto max-w-lg">
          <h2 className="text-lg font-semibold text-primary-foreground">Merhaba! 👋</h2>
          <p className="mt-0.5 text-sm text-primary-foreground/80">Bugün ne öğrenmek istersin?</p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ders veya öğretmen ara..."
              className="border-0 bg-card pl-10 shadow-card"
              onClick={() => navigate("/search")}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6">
        {/* Free Question Banner */}
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

        {/* Popular Teachers */}
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
          </div>
        </div>

        {/* Featured Teachers (horizontal scroll) */}
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
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="text-xs font-medium">{t.rating}</span>
                </div>
                <p className="mt-1 text-center text-sm font-bold text-primary">{t.price}₺</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Questions */}
        <div className="mt-8 mb-4">
          <h3 className="mb-3 text-lg font-bold text-foreground">Son Çözülen Sorular</h3>
          <div className="grid grid-cols-2 gap-3">
            {questions.map((q) => (
              <QuestionCard key={q.id} {...q} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
