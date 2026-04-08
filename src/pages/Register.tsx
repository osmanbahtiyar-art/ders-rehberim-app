import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { subjects, exams, grades } from "@/data/mockData";
import { GraduationCap, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") as "student" | "teacher" | null;
  const [role, setRole] = useState<"student" | "teacher">(initialRole || "student");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Student fields
  const [grade, setGrade] = useState("");
  const [targetExam, setTargetExam] = useState("");
  // Teacher fields
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      toast.error("Kayıt sırasında bir hata oluştu");
      setLoading(false);
      return;
    }

    // Insert role
    await supabase.from("user_roles").insert({ user_id: userId, role });

    // Insert role-specific profile
    if (role === "student") {
      await supabase.from("student_profiles").insert({
        user_id: userId,
        grade: grade || null,
        target_exam: targetExam || null,
      });
    } else {
      await supabase.from("teacher_profiles").insert({
        user_id: userId,
        subject: subject || null,
        experience_years: experience ? parseInt(experience) : null,
        education: education || null,
        price_per_lesson: price ? parseInt(price) : null,
        bio: bio || null,
      });
    }

    toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <img src={logo} alt="Logo" width={48} height={48} />
          <h1 className="mt-3 text-xl font-bold text-foreground">Kayıt Ol</h1>
        </div>

        <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
          <button
            onClick={() => setRole("student")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              role === "student"
                ? "bg-card text-primary shadow-card"
                : "text-muted-foreground"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Öğrenci
          </button>
          <button
            onClick={() => setRole("teacher")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              role === "teacher"
                ? "bg-card text-accent shadow-card"
                : "text-muted-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Öğretmen
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input placeholder="Adınız Soyadınız" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Şifre</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {role === "student" && (
            <>
              <div className="space-y-2">
                <Label>Sınıf</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue placeholder="Sınıfınızı seçin" /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hedef Sınav</Label>
                <Select value={targetExam} onValueChange={setTargetExam}>
                  <SelectTrigger><SelectValue placeholder="Sınav seçin" /></SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {role === "teacher" && (
            <>
              <div className="space-y-2">
                <Label>Branş</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Branşınızı seçin" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deneyim (yıl)</Label>
                <Input type="number" placeholder="5" value={experience} onChange={(e) => setExperience(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Mezuniyet</Label>
                <Input placeholder="İstanbul Üniversitesi, Matematik" value={education} onChange={(e) => setEducation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ders Fiyatı (40 dk) - ₺</Label>
                <Input type="number" placeholder="300" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hakkında</Label>
                <Textarea placeholder="Kendinizi tanıtın..." rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </>
          )}

          <Button type="submit" variant={role === "student" ? "hero" : "accent"} className="w-full" size="lg" disabled={loading}>
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <button onClick={() => navigate("/login")} className="font-medium text-primary hover:underline">
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
