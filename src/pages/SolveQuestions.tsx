import { useState } from "react";
import { ArrowLeft, Camera, Upload, BookOpen, Send, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { subjects } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qaApi, QuestionItem } from "@/lib/api";
import { toast } from "sonner";

const SolveQuestions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [solutionText, setSolutionText] = useState("");
  const [solutionImage, setSolutionImage] = useState<string | null>(null);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["pending-questions", selectedBranch],
    queryFn: () =>
      qaApi.listPendingQuestions({
        pageRowCount: 20,
        branch: selectedBranch !== "all" ? selectedBranch : undefined,
      }),
  });

  const rawQuestions = (questionsData as Record<string, unknown>)?.studentQuestion as QuestionItem[] | undefined;
  const questions = rawQuestions ?? [];

  const answerMutation = useMutation({
    mutationFn: (params: { questionId: string; content: string; attachments?: string }) =>
      qaApi.submitAnswer(params),
    onSuccess: () => {
      toast.success("Çözümünüz gönderildi! Teşekkür ederiz.");
      setSelectedQuestion(null);
      setSolutionText("");
      setSolutionImage(null);
      queryClient.invalidateQueries({ queryKey: ["pending-questions"] });
    },
    onError: () => {
      toast.error("Çözüm gönderilirken bir hata oluştu.");
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSolutionImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSolution = () => {
    if (!selectedQuestion) return;
    if (!solutionText.trim() && !solutionImage) {
      toast.error("Lütfen bir çözüm yazın veya fotoğraf ekleyin.");
      return;
    }
    answerMutation.mutate({
      questionId: selectedQuestion.id,
      content: solutionText,
      attachments: solutionImage ?? undefined,
    });
  };

  const openSolveDialog = (question: QuestionItem) => {
    setSelectedQuestion(question);
    setSolutionText("");
    setSolutionImage(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Soru Çöz</h1>
        <Badge variant="secondary" className="ml-auto">
          {questions.length} soru
        </Badge>
      </div>

      {/* Filter */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tüm Dersler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Dersler</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question List */}
      <div className="mx-auto max-w-lg space-y-4 px-6 py-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Bekleyen soru yok</p>
            <p className="text-sm text-muted-foreground">Şu an çözülmeyi bekleyen soru bulunmuyor.</p>
          </div>
        )}

        {questions.map((question) => (
          <div
            key={question.id}
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          >
            {/* Question image */}
            {question.attachments && (
              <img
                src={question.attachments}
                alt="Soru fotoğrafı"
                className="w-full max-h-48 object-contain bg-muted"
              />
            )}
            {!question.attachments && (
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <BookOpen className="h-10 w-10 text-primary/40" />
              </div>
            )}

            <div className="p-4">
              {/* Tags */}
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">{question.branch}</Badge>
                {question.examType && (
                  <Badge variant="outline" className="text-xs">{question.examType}</Badge>
                )}
                {question.answerCount === 0 && (
                  <Badge className="text-xs bg-amber-500 hover:bg-amber-500">Cevaplanmadı</Badge>
                )}
                {question.answerCount > 0 && (
                  <Badge className="text-xs bg-green-600 hover:bg-green-600">{question.answerCount} cevap</Badge>
                )}
              </div>

              {/* Content */}
              {question.content && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{question.content}</p>
              )}

              {/* Student info */}
              {question.studentId_data?.fullname && (
                <p className="mb-3 text-xs text-muted-foreground">
                  Soran: <span className="font-medium">{question.studentId_data.fullname}</span>
                </p>
              )}

              <Button
                variant="hero"
                size="sm"
                className="w-full gap-2"
                onClick={() => openSolveDialog(question)}
              >
                <Send className="h-4 w-4" />
                Çözüm Gönder
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Solve Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="mx-4 max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Çözüm Gönder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question preview */}
            {selectedQuestion?.attachments && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={selectedQuestion.attachments}
                  alt="Soru"
                  className="w-full max-h-40 object-contain bg-muted"
                />
              </div>
            )}
            {selectedQuestion?.content && (
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Soru</p>
                <p className="text-sm text-foreground">{selectedQuestion.content}</p>
              </div>
            )}

            {/* Solution text */}
            <div className="space-y-2">
              <Label>Çözüm Açıklaması</Label>
              <Textarea
                placeholder="Çözüm adımlarını açıklayın..."
                rows={4}
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
              />
            </div>

            {/* Solution image */}
            <div className="space-y-2">
              <Label>Çözüm Fotoğrafı (opsiyonel)</Label>
              {solutionImage ? (
                <div className="relative">
                  <img
                    src={solutionImage}
                    alt="Çözüm"
                    className="w-full rounded-xl border border-border object-contain"
                  />
                  <button
                    onClick={() => setSolutionImage(null)}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 py-8 transition-colors hover:border-primary/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Fotoğraf Ekle</p>
                    <p className="text-xs text-muted-foreground">Çözüm fotoğrafı yükleyin</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmitSolution}
              disabled={answerMutation.isPending}
            >
              <Upload className="h-4 w-4" />
              {answerMutation.isPending ? "Gönderiliyor..." : "Çözümü Gönder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default SolveQuestions;
