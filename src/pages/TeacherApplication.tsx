import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applicationStore, TeacherApplicationData } from "@/lib/applications";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const BRANCHES = [
  "Matematik", "Fizik", "Kimya", "Biyoloji",
  "Türkçe / Edebiyat", "İngilizce", "Tarih", "Coğrafya",
  "Almanca", "Fransızca", "Geometri", "Yazılım / Kodlama",
  "Müzik", "Resim / Sanat", "Diğer",
];

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const EXPERIENCE_OPTIONS = ["1 yıldan az", "1-3 yıl", "3-5 yıl", "5-10 yıl", "10+ yıl"];

const TeacherApplication = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<TeacherApplicationData>({
    fullname: "",
    email: "",
    phone: "",
    branch: "",
    experience: "",
    qualifications: "",
    hourlyRate: "",
    about: "",
    availableDays: [],
  });

  const set = (field: keyof TeacherApplicationData, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDay = (d: string) =>
    set(
      "availableDays",
      form.availableDays.includes(d)
        ? form.availableDays.filter((x) => x !== d)
        : [...form.availableDays, d]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branch) { toast.error("Lütfen branşınızı seçin."); return; }
    if (!form.experience) { toast.error("Lütfen deneyim sürenizi seçin."); return; }
    setSubmitting(true);
    try {
      applicationStore.add("teacher", form);
      navigate("/basvuru-basarili", { state: { type: "teacher" } });
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = form.fullname.trim() && form.email.trim() && form.phone.trim();
  const isStep2Valid = form.branch && form.experience;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button onClick={() => navigate("/")} className="rounded-lg p-1.5 hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <img src={logo} alt="Logo" width={28} height={28} />
          <div>
            <h1 className="text-sm font-bold text-gray-900">Öğretmen Başvurusu</h1>
            <p className="text-xs text-gray-400">Özel Ders Rehberim</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  step > s ? "bg-amber-500 text-white" :
                  step === s ? "bg-amber-500 text-white ring-4 ring-amber-100" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-amber-600" : "text-gray-400"}`}>
                  {s === 1 ? "Kişisel" : s === 2 ? "Uzmanlık" : "Hakkında"}
                </span>
                {s < 3 && <div className={`h-0.5 w-10 ${step > s ? "bg-amber-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">
                    {step === 1 ? "İletişim Bilgileri" : step === 2 ? "Uzmanlık Alanı" : "Kendinizi Tanıtın"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {step === 1 ? "Adım 1 / 3" : step === 2 ? "Adım 2 / 3" : "Adım 3 / 3"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Adım 1: Kişisel Bilgiler */}
              {step === 1 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="fullname">Ad Soyad <span className="text-red-500">*</span></Label>
                      <Input
                        id="fullname"
                        placeholder="Adınız ve soyadınız"
                        value={form.fullname}
                        onChange={(e) => set("fullname", e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0555 000 00 00"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-posta <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </>
              )}

              {/* Adım 2: Uzmanlık */}
              {step === 2 && (
                <>
                  <div>
                    <Label>Branş / Ders <span className="text-red-500">*</span></Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {BRANCHES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => set("branch", b)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all text-left ${
                            form.branch === b
                              ? "border-amber-500 bg-amber-50 text-amber-700"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-amber-200"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Deneyim <span className="text-red-500">*</span></Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {EXPERIENCE_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => set("experience", e)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                            form.experience === e
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-amber-300"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qualifications">Mezuniyet / Sertifika</Label>
                    <Input
                      id="qualifications"
                      placeholder="Ör: XYZ Üniversitesi Matematik Bölümü, 2022"
                      value={form.qualifications}
                      onChange={(e) => set("qualifications", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">Saatlik Ücret (₺)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      placeholder="Ör: 300"
                      value={form.hourlyRate}
                      onChange={(e) => set("hourlyRate", e.target.value)}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-400">Boş bırakabilirsiniz, ekibimiz sizinle görüşür.</p>
                  </div>
                </>
              )}

              {/* Adım 3: Hakkında */}
              {step === 3 && (
                <>
                  <div>
                    <Label>Uygun Günler</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DAYS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                            form.availableDays.includes(d)
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-amber-300"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="about">Kendinizi Tanıtın</Label>
                    <Textarea
                      id="about"
                      placeholder="Öğretme yaklaşımınız, deneyimleriniz, öğrencilere nasıl yardımcı olduğunuz..."
                      value={form.about}
                      onChange={(e) => set("about", e.target.value)}
                      className="mt-1 h-36 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 px-6 py-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="text-sm text-gray-400 hover:text-gray-700"
                >
                  ← Geri
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                  className="bg-amber-500 text-white hover:bg-amber-400 gap-2"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Devam Et →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 text-white hover:bg-amber-400 gap-2"
                >
                  {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder ✓"}
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Ücretsiz</div>
          <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> 24 saat içinde yanıt</div>
          <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Güvenli</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherApplication;
