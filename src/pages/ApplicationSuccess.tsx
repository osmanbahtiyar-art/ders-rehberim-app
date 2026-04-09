import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, GraduationCap, BookOpen, ArrowLeft, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const ApplicationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const type = (location.state as { type?: string })?.type ?? "student";
  const isTeacher = type === "teacher";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${
      isTeacher
        ? "bg-gradient-to-br from-amber-50 via-white to-orange-50"
        : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    }`}>
      <div className="w-full max-w-md text-center">
        {/* Başarı ikonu */}
        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-xl ${
          isTeacher ? "bg-amber-500 shadow-amber-200" : "bg-indigo-600 shadow-indigo-200"
        }`}>
          <CheckCircle className="h-12 w-12 text-white" />
        </div>

        <img src={logo} alt="Logo" width={40} height={40} className="mx-auto mb-4 opacity-60" />

        <h1 className="text-2xl font-extrabold text-gray-900">Başvurunuz Alındı!</h1>
        <p className="mt-3 text-gray-500 leading-relaxed">
          {isTeacher
            ? "Öğretmen başvurunuz başarıyla iletildi. Ekibimiz profilinizi inceleyip en kısa sürede sizinle iletişime geçecek."
            : "Öğrenci başvurunuz başarıyla iletildi. Ekibimiz size en uygun öğretmeni bulup en kısa sürede arayacak."}
        </p>

        {/* Bilgi kartları */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
            <Clock className={`mx-auto mb-2 h-6 w-6 ${isTeacher ? "text-amber-500" : "text-indigo-600"}`} />
            <p className="font-semibold text-gray-900 text-sm">24 Saat İçinde</p>
            <p className="text-xs text-gray-400 mt-0.5">Ekibimiz sizi arayacak</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
            <Phone className={`mx-auto mb-2 h-6 w-6 ${isTeacher ? "text-amber-500" : "text-indigo-600"}`} />
            <p className="font-semibold text-gray-900 text-sm">Telefon ile</p>
            <p className="text-xs text-gray-400 mt-0.5">Verdiğiniz numaradan</p>
          </div>
        </div>

        {/* İkinci başvuru linki */}
        <div className={`mt-6 rounded-xl border px-5 py-4 ${
          isTeacher ? "border-indigo-100 bg-indigo-50" : "border-amber-100 bg-amber-50"
        }`}>
          <p className="text-sm font-medium text-gray-700 mb-3">
            {isTeacher ? "Öğrenci olarak da kayıt olmak ister misiniz?" : "Siz de öğretmen misiniz?"}
          </p>
          <button
            onClick={() => navigate(isTeacher ? "/ogrenci-basvuru" : "/ogretmen-basvuru")}
            className={`flex items-center gap-2 mx-auto text-sm font-semibold ${
              isTeacher ? "text-indigo-600" : "text-amber-600"
            } hover:underline`}
          >
            {isTeacher ? <GraduationCap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            {isTeacher ? "Öğrenci Başvurusu →" : "Öğretmen Başvurusu →"}
          </button>
        </div>

        {/* Ana sayfa */}
        <Button
          variant="outline"
          className="mt-6 gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
