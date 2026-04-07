import { ArrowLeft, Star, MessageCircle, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { teachers } from "@/data/mockData";
import BottomNav from "@/components/BottomNav";

const reviews = [
  { name: "Selin K.", rating: 5, text: "Çok iyi anlattı, teşekkürler!", date: "2 gün önce" },
  { name: "Emre T.", rating: 5, text: "Sabırlı ve anlaşılır. Kesinlikle tavsiye ederim.", date: "1 hafta önce" },
  { name: "Deniz A.", rating: 4, text: "Güzel ders ama biraz hızlıydı.", date: "2 hafta önce" },
];

const availableSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const teacher = teachers.find((t) => t.id === Number(id)) || teachers[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary px-4 pb-16 pt-4">
        <button onClick={() => navigate(-1)} className="text-primary-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-lg px-6">
        {/* Profile Card */}
        <div className="-mt-12 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <img src={teacher.avatar} alt={teacher.name} className="h-20 w-20 rounded-full border-4 border-card object-cover shadow-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-card-foreground">{teacher.name}</h1>
              <p className="text-sm text-muted-foreground">{teacher.subject} Öğretmeni</p>
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-card-foreground">{teacher.rating}</span>
                <span className="text-xs text-muted-foreground">({teacher.reviewCount} yorum)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{teacher.price}₺</span>
              <p className="text-xs text-muted-foreground">/ 40 dk</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="hero" className="flex-1 gap-1.5">
              <Calendar className="h-4 w-4" />
              Ders Al
            </Button>
            <Button variant="outline" className="gap-1.5">
              <MessageCircle className="h-4 w-4" />
              Mesaj
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold text-foreground">Hakkında</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            10 yıllık deneyime sahip {teacher.subject} öğretmeniyim. İstanbul Üniversitesi mezunuyum.
            Öğrencilerin konuları en kolay şekilde anlamasını sağlamak için interaktif yöntemler kullanıyorum.
          </p>
        </div>

        {/* Available Times */}
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-foreground">Müsait Saatler (Bugün)</h3>
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Solved Questions */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold text-foreground">Çözdüğü Sorular</h3>
          <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-foreground">47 soru çözdü</span>
            <span className="text-xs text-muted-foreground">· ücretsiz soru alanında</span>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-6 mb-4">
          <h3 className="mb-3 font-semibold text-foreground">Yorumlar</h3>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-card-foreground">{r.name}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TeacherProfile;
