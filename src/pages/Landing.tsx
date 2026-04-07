import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroIllustration from "@/assets/hero-illustration.png";
import { GraduationCap, BookOpen } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <img src={logo} alt="Özel Ders Rehberim" width={80} height={80} className="drop-shadow-lg" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Özel Ders Rehberim</h1>
          <p className="mt-2 text-muted-foreground">Doğru öğretmeni bul, hedefine ulaş</p>
        </div>

        <img
          src={heroIllustration}
          alt="Öğrenci ve öğretmen"
          width={280}
          height={210}
          className="my-4"
        />

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2 text-base"
            onClick={() => navigate("/register?role=student")}
          >
            <GraduationCap className="h-5 w-5" />
            Öğrenciyim
          </Button>
          <Button
            variant="accent"
            size="lg"
            className="w-full gap-2 text-base"
            onClick={() => navigate("/register?role=teacher")}
          >
            <BookOpen className="h-5 w-5" />
            Öğretmenim
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 text-sm">
        <button onClick={() => navigate("/login")} className="font-medium text-primary hover:underline">
          Giriş Yap
        </button>
        <span className="text-muted-foreground">•</span>
        <button onClick={() => navigate("/register")} className="font-medium text-muted-foreground hover:underline">
          Kayıt Ol
        </button>
      </div>
    </div>
  );
};

export default Landing;
