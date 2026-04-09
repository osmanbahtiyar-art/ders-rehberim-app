import { useState } from "react";
import { ArrowLeft, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { subjects, exams, grades } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { qaApi } from "@/lib/api";

const AskQuestion = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [branch, setBranch] = useState("");
  const [examType, setExamType] = useState("");
  const [grade, setGrade] = useState("");
  const [content, setContent] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      qaApi.submitQuestion({
        content: content.trim() || "(Fotoğraflı soru)",
        branch: branch || "Genel",
        examType: examType || "Diğer",
        status: "pending",
        attachments: image ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Sorunuz gönderildi! Admin onayından sonra yayınlanacaktır.");
      navigate("/home");
    },
    onError: () => {
      toast.error("Soru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const handleSubmit = () => {
    if (!image && !content.trim()) {
      toast.error("Lütfen bir fotoğraf yükleyin veya soru açıklaması yazın.");
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Soru Sor</h1>
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-6 py-6">
        {/* Image Upload */}
        <div>
          <Label className="mb-2 block">Soru Fotoğrafı</Label>
          {image ? (
            <div className="relative">
              <img src={image} alt="Soru" className="w-full rounded-xl border border-border object-contain" />
              <button
                onClick={() => setImage(null)}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 py-12 transition-colors hover:border-primary/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Camera className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Fotoğraf Yükle</p>
                <p className="text-xs text-muted-foreground">veya sürükle bırak</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        <div className="space-y-2">
          <Label>Ders</Label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger><SelectValue placeholder="Ders seçin" /></SelectTrigger>
            <SelectContent>
              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sınav</Label>
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger><SelectValue placeholder="Sınav seçin" /></SelectTrigger>
            <SelectContent>
              {exams.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sınıf</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger><SelectValue placeholder="Sınıf seçin" /></SelectTrigger>
            <SelectContent>
              {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Açıklama (opsiyonel)</Label>
          <Textarea
            placeholder="Sorunuz hakkında ek bilgi yazabilirsiniz..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          <Upload className="h-4 w-4" />
          {submitMutation.isPending ? "Gönderiliyor..." : "Soruyu Gönder"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Sorunuz admin onayından sonra yayınlanacaktır.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default AskQuestion;
