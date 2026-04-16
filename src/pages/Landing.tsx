import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroIllustration from "@/assets/hero-illustration.png";
import {
  GraduationCap, BookOpen, CheckCircle, Star,
  ArrowRight, Shield, Clock, Award, Users, Mail, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: CheckCircle, title: "Uzman Öğretmenler", desc: "Alanında deneyimli, başvurusu onaylanmış öğretmenlerle çalış." },
  { icon: Clock, title: "Esnek Saatler", desc: "Sana uygun gün ve saatlerde ders planla." },
  { icon: Star, title: "Garantili Kalite", desc: "Her öğretmen titizlikle seçilir ve değerlendirilir." },
  { icon: Award, title: "Her Seviyeye Uygun", desc: "İlkokuldan üniversiteye, her sınıf ve konu için destek." },
];

const steps = [
  { num: "01", title: "Başvur", desc: "Öğrenci veya öğretmen olarak ücretsiz başvuru formunu doldur." },
  { num: "02", title: "Eşleş", desc: "Ekibimiz ihtiyacına en uygun öğretmeni / öğrenciyi seçer." },
  { num: "03", title: "Başla", desc: "Deneme dersiyle tanışın, ardından dilediğin sıklıkta ders al." },
];

const subjects = [
  "Matematik", "Fizik", "Kimya", "Biyoloji",
  "Türkçe", "İngilizce", "Tarih", "Coğrafya",
  "TYT / AYT", "LGS", "ÖSYM", "Yazılım",
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" width={36} height={36} />
            <div>
              <span className="block text-base font-bold text-gray-900 leading-tight">Özel Ders Rehberim</span>
              <span className="block text-xs font-medium text-indigo-600 leading-tight">Fatma Sağdıç</span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#nasil-calisir" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Nasıl Çalışır?</a>
            <a href="#dersler" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dersler</a>
            <a href="#neden-biz" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Neden Biz?</a>
            <a href="#iletisim" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">İletişim</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden bg-indigo-600 text-white hover:bg-indigo-500 md:flex"
              onClick={() => navigate("/ogrenci-basvuru")}
            >
              Hemen Başvur
            </Button>
            {/* Admin giriş — görünmez ama erişilebilir */}
            <button
              onClick={() => navigate("/admin/login")}
              className="rounded-lg p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
              title="Yönetim"
            >
              <Shield className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
                🎓 Fatma Sağdıç — Özel Ders Rehberim
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                Doğru Öğretmeni Bul,<br />
                <span className="text-indigo-600">Hedefine Ulaş</span>
              </h1>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Alanında uzman öğretmenlerle birebir özel ders al. TYT, AYT, LGS ve daha fazlası için güvenilir destek.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-200 text-base"
                  onClick={() => navigate("/ogrenci-basvuru")}
                >
                  <GraduationCap className="h-5 w-5" />
                  Öğrenci Başvurusu
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 text-base"
                  onClick={() => navigate("/ogretmen-basvuru")}
                >
                  <BookOpen className="h-5 w-5" />
                  Öğretmen Başvurusu
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Ücretsiz başvuru
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Hızlı yanıt
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Esnek saatler
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={heroIllustration}
                alt="Özel ders"
                className="w-full max-w-md drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Istatistikler */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-gray-100 bg-white/70 px-6 py-6 shadow-sm backdrop-blur-sm">
            {[
              { value: "500+", label: "Kayıtlı Öğretmen" },
              { value: "2.000+", label: "Mutlu Öğrenci" },
              { value: "4.9★", label: "Ortalama Puan" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-indigo-600 md:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-xs text-gray-500 md:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ─────────────────────────────────────── */}
      <section id="nasil-calisir" className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Nasıl Çalışır?</h2>
            <p className="mt-2 text-gray-500">3 adımda özel derse başla</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-extrabold text-white shadow-md shadow-indigo-200">
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DERSLER ───────────────────────────────────────────── */}
      <section id="dersler" className="px-6 py-20 bg-indigo-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Hangi Dersler?</h2>
            <p className="mt-2 text-gray-500">Her konu, her seviye, her sınav</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((s) => (
              <span
                key={s}
                className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">Aradığın dersi bulamadın mı?</p>
            <button
              onClick={() => navigate("/ogrenci-basvuru")}
              className="mt-2 text-sm font-semibold text-indigo-600 hover:underline"
            >
              Başvurunda belirt, sana uygun öğretmen bulalım →
            </button>
          </div>
        </div>
      </section>

      {/* ── NEDEN BİZ ─────────────────────────────────────────── */}
      <section id="neden-biz" className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Neden Özel Ders Rehberim?</h2>
            <p className="mt-2 text-gray-500">Fark yaratan özellikler</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <f.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖĞRETMEN CTA ──────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 px-8 py-12 text-white text-center shadow-xl shadow-amber-200">
          <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-80" />
          <h2 className="text-3xl font-bold">Sen de Öğretmen misin?</h2>
          <p className="mt-3 text-amber-100 text-lg max-w-xl mx-auto">
            Platformumuza katıl, öğrencilere ulaş ve ek gelir kazan. Başvurun ücretsiz!
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-amber-700 hover:bg-amber-50 gap-2 text-base shadow-lg"
            onClick={() => navigate("/ogretmen-basvuru")}
          >
            <BookOpen className="h-5 w-5" />
            Öğretmen Olarak Başvur
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="mt-6 flex justify-center gap-8 text-sm text-amber-100">
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Ücretsiz üyelik</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Esnek çalışma</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Güvenli ödeme</div>
          </div>
        </div>
      </section>

      {/* ── İLETİŞİM ──────────────────────────────────────────── */}
      <section id="iletisim" className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">İletişim</h2>
            <p className="mt-2 text-gray-500">Sorularınız için bize ulaşın</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {[
              { icon: Mail, title: "E-posta", value: "fatma.sagdic38@gmail.com" },
              { icon: MapPin, title: "Şehir", value: "Kayseri, Türkiye" },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <c.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="font-semibold text-gray-900">{c.title}</p>
                <p className="mt-1 text-sm text-gray-500">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Hızlı CTA */}
          <div className="mt-12 rounded-2xl bg-indigo-600 px-8 py-10 text-center text-white">
            <Users className="mx-auto mb-3 h-10 w-10 opacity-80" />
            <h3 className="text-2xl font-bold">Hemen Başvur</h3>
            <p className="mt-2 text-indigo-200">Ücretsiz başvurunu yap, ekibimiz seni arasın.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
              <button
                onClick={() => navigate("/ogrenci-basvuru")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors"
              >
                <GraduationCap className="h-5 w-5" />
                Öğrenci Başvurusu
              </button>
              <button
                onClick={() => navigate("/ogretmen-basvuru")}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-amber-900 shadow-lg hover:bg-amber-300 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Öğretmen Başvurusu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" width={28} height={28} />
            <div>
              <span className="block text-sm font-semibold text-gray-700 leading-tight">Özel Ders Rehberim</span>
              <span className="block text-xs font-medium text-indigo-500 leading-tight">Fatma Sağdıç</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">© 2026 Fatma Sağdıç — Özel Ders Rehberim. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-700">Gizlilik</a>
            <a href="#" className="hover:text-gray-700">Şartlar</a>
            <button onClick={() => navigate("/admin/login")} className="hover:text-gray-700">Yönetim</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
