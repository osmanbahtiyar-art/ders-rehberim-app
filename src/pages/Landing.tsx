import logo from "@/assets/logo.png";
import heroIllustration from "@/assets/hero-illustration.png";
import {
  GraduationCap, BookOpen, CheckCircle, Star,
  ArrowRight, Clock, Award, Users,
  Brain, Zap, LineChart, Sparkles, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STUDENT_FORM = "https://forms.gle/t38GioMe9E9DFY2e7";
const TEACHER_FORM = "https://forms.gle/esRP1T51tbwEXVph8";
const GOLD = "#D4AF37";

const features = [
  { icon: Brain, title: "AI Destekli Eşleşme", desc: "Algoritma, öğrencinin hedef ve eksiklerine göre en uygun öğretmeni saniyeler içinde belirler." },
  { icon: Clock, title: "Esnek Saatler", desc: "Sana uygun gün ve saatlerde ders planla, AI takviminizi optimize eder." },
  { icon: Star, title: "Akıllı Kalite Kontrolü", desc: "Her öğretmen AI destekli değerlendirme sistemimizle titizlikle seçilir." },
  { icon: Award, title: "Her Seviyeye Uygun", desc: "İlkokuldan üniversiteye, AI kişisel çalışma planıyla her konu için destek." },
];

const steps = [
  { num: "01", title: "Başvur", desc: "Ücretsiz başvuru formunu doldur. AI sistemimiz profilini analiz eder." },
  { num: "02", title: "AI Eşleştir", desc: "Gelişmiş algoritmamız ihtiyacına en uygun öğretmeni otomatik seçer." },
  { num: "03", title: "Başla & Takip Et", desc: "Kişisel çalışma planınla ders al, haftalık gelişim raporlarını incele." },
];

const subjects = [
  "Matematik", "Fizik", "Kimya", "Biyoloji",
  "Türkçe", "İngilizce", "Tarih", "Coğrafya",
  "TYT / AYT", "LGS", "ÖSYM", "Yazılım",
];

const philosophy = [
  {
    icon: Brain,
    title: "Akıllı Analiz",
    badge: "AI-Powered",
    desc: "Her öğrencinin öğrenme hızı ve stili yapay zeka ile analiz edilir. Başarı, öğrencinin bilişsel haritasını çıkarmakla başlar.",
  },
  {
    icon: Zap,
    title: "Algoritmik Eşleşme",
    badge: "Smart Match",
    desc: "Öğrencinin hedeflerine ve eksiklerine en uygun öğretmen, gelişmiş AI eşleştirme motorumuz tarafından saniyeler içinde belirlenir.",
  },
  {
    icon: LineChart,
    title: "Dinamik Takip",
    badge: "Auto-Update",
    desc: "Öğrencinin gelişim seyri sürekli izlenir ve yapay zeka destekli haftalık çalışma planları otomatik olarak güncellenir.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#0F172A]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" width={36} height={36} className="rounded-full" />
            <div>
              <span className="block text-base font-bold text-white leading-tight">Özel Ders Rehberim</span>
              <span className="flex items-center gap-1 text-xs font-semibold leading-tight" style={{ color: GOLD }}>
                <Bot className="h-3 w-3" /> AI Destekli Eğitim Akademisi
              </span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#felsefe" className="text-sm text-gray-400 hover:text-white transition-colors">Yaklaşımımız</a>
            <a href="#nasil-calisir" className="text-sm text-gray-400 hover:text-white transition-colors">Nasıl Çalışır?</a>
            <a href="#dersler" className="text-sm text-gray-400 hover:text-white transition-colors">Dersler</a>
            <a href="#neden-biz" className="text-sm text-gray-400 hover:text-white transition-colors">Neden Biz?</a>
            <a href="#iletisim" className="text-sm text-gray-400 hover:text-white transition-colors">İletişim</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden md:flex text-[#0F172A] font-bold shadow-lg hover:opacity-90"
              style={{ backgroundColor: GOLD }}
              onClick={() => window.open(STUDENT_FORM, "_blank")}
            >
              Hemen Başvur
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0F172A] px-6 py-20 md:py-28">
        {/* Arka plan parıltısı */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: GOLD }} />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4 border"
                style={{ color: GOLD, borderColor: GOLD + "44", backgroundColor: GOLD + "15" }}
              >
                <Sparkles className="h-3 w-3" /> Yapay Zeka Destekli Akıllı Eğitim Akademisi
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
                Yapay Zeka ile<br />
                <span style={{ color: GOLD }}>Doğru Öğretmeni</span><br />
                Bul, Hızlı Başar
              </h1>
              <div className="mt-3 h-1 w-20 rounded-full" style={{ backgroundColor: GOLD }} />
              <p className="mt-5 text-lg text-gray-300 leading-relaxed">
                AI destekli akıllı eşleştirme, kişiye özel çalışma planları ve eğitimde fırsat eşitliği vizyonuyla tanışın.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 font-bold text-[#0F172A] shadow-lg text-base hover:opacity-90"
                  style={{ backgroundColor: GOLD }}
                  onClick={() => window.open(STUDENT_FORM, "_blank")}
                >
                  <GraduationCap className="h-5 w-5" />
                  Öğrenci Başvurusu
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  className="gap-2 bg-white text-gray-900 hover:bg-gray-100 shadow-lg text-base font-bold border-0"
                  onClick={() => window.open(TEACHER_FORM, "_blank")}
                >
                  <BookOpen className="h-5 w-5" />
                  Öğretmen Başvurusu
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Ücretsiz başvuru
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  AI eşleştirme
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Kişisel plan
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={heroIllustration}
                alt="AI Destekli Özel Ders"
                className="w-full max-w-md drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── YAPAY ZEKA BAŞARI İLKELERİ ───────────────────────── */}
      <section id="felsefe" className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
              <Sparkles className="h-3.5 w-3.5" /> Özel Ders Rehberim
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Yapay Zeka Destekli Başarı İlkelerimiz</h2>
            <div className="mt-3 mx-auto h-1 w-16 rounded-full" style={{ backgroundColor: GOLD }} />
            <p className="mt-4 text-gray-500">Eğitimde fırsat eşitliğini mümkün kılan üç temel AI ilkesi</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {philosophy.map((p) => (
              <div
                key={p.title}
                className="relative rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: GOLD + "33" }}
              >
                <div className="absolute top-0 left-8 right-8 h-0.5 rounded-full" style={{ backgroundColor: GOLD }} />
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: GOLD + "18" }}
                  >
                    <p.icon className="h-6 w-6" style={{ color: GOLD }} />
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: GOLD + "18", color: GOLD }}
                  >
                    {p.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ─────────────────────────────────────── */}
      <section id="nasil-calisir" className="px-6 py-20 bg-[#0F172A]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Nasıl Çalışır?</h2>
            <p className="mt-2 text-gray-400">3 adımda AI destekli eğitime başla</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold shadow-md"
                  style={{ backgroundColor: GOLD, color: "#0F172A" }}
                >
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={() => window.open(STUDENT_FORM, "_blank")}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: GOLD, color: "#0F172A" }}
            >
              <GraduationCap className="h-4 w-4" />
              Hemen Başvur
            </button>
          </div>
        </div>
      </section>

      {/* ── DERSLER ───────────────────────────────────────────── */}
      <section id="dersler" className="px-6 py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Hangi Dersler?</h2>
            <div className="mt-3 mx-auto h-1 w-16 rounded-full" style={{ backgroundColor: GOLD }} />
            <p className="mt-4 text-gray-500">Her konu, her seviye — AI ile kişiselleştirilmiş</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((s) => (
              <span
                key={s}
                className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm"
                style={{ borderColor: GOLD + "55", color: "#0F172A" }}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">Aradığın dersi bulamadın mı?</p>
            <button
              onClick={() => window.open(STUDENT_FORM, "_blank")}
              className="mt-2 text-sm font-semibold hover:underline"
              style={{ color: GOLD }}
            >
              Başvurunda belirt, AI sistemimiz sana uygun öğretmen bulsun →
            </button>
          </div>
        </div>
      </section>

      {/* ── NEDEN BİZ ─────────────────────────────────────────── */}
      <section id="neden-biz" className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Neden Özel Ders Rehberim?</h2>
            <div className="mt-3 mx-auto h-1 w-16 rounded-full" style={{ backgroundColor: GOLD }} />
            <p className="mt-4 text-gray-500">Geleneksel değil, yapay zeka destekli</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:shadow-md transition-shadow">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: GOLD + "18" }}
                >
                  <f.icon className="h-5 w-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖĞRETMEN CTA ──────────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#0F172A]">
        <div
          className="mx-auto max-w-4xl rounded-3xl px-8 py-12 text-white text-center shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${GOLD}22 0%, #1e293b 100%)`, border: `1px solid ${GOLD}44` }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: GOLD + "22", border: `1px solid ${GOLD}66` }}
          >
            <BookOpen className="h-8 w-8" style={{ color: GOLD }} />
          </div>
          <h2 className="text-3xl font-bold text-white">Sen de Öğretmen misin?</h2>
          <p className="mt-3 text-gray-300 text-lg max-w-xl mx-auto">
            AI eşleştirme sistemimize katıl, sana uygun öğrencilere ulaş ve ek gelir kazan. Başvurun ücretsiz!
          </p>
          <button
            onClick={() => window.open(TEACHER_FORM, "_blank")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: GOLD, color: "#0F172A" }}
          >
            <BookOpen className="h-5 w-5" />
            Öğretmen Olarak Başvur
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="mt-6 flex justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" /> Ücretsiz üyelik</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" /> AI ile öğrenci eşleşme</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" /> Esnek çalışma</div>
          </div>
        </div>
      </section>


      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#0F172A] px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" width={28} height={28} className="rounded-full" />
            <div>
              <span className="block text-sm font-bold text-white leading-tight">Özel Ders Rehberim</span>
              <span className="flex items-center gap-1 text-xs font-semibold leading-tight" style={{ color: GOLD }}>
                <Bot className="h-3 w-3" /> AI Destekli Eğitim Akademisi
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">© 2026 Özel Ders Rehberim. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Şartlar</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
