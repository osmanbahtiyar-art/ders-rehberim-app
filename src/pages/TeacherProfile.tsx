import { useState } from "react";
import { ArrowLeft, Star, MessageCircle, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi, bookingApi, normalizeTeacher } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["teacher", id],
    queryFn: () => teacherApi.get(id!),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["teacher-reviews", id],
    queryFn: () => teacherApi.getReviews(id!),
    enabled: !!id,
  });

  const { data: slotsData } = useQuery({
    queryKey: ["teacher-slots", id],
    queryFn: () => bookingApi.getSlots(id!),
    enabled: !!id && bookingOpen,
  });

  const bookMutation = useMutation({
    mutationFn: bookingApi.book,
    onSuccess: () => {
      setStep("done");
      toast({ title: "Ders planlandı! ✅", description: `${teacher?.name} ile dersiniz onaylandı.` });
    },
    onError: (err: Error) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  const rawProfile = (profileData as Record<string, unknown>)?.teacherProfile;
  const teacher = rawProfile ? normalizeTeacher(rawProfile as Parameters<typeof normalizeTeacher>[0]) : null;

  const rawReviews = (reviewsData as Record<string, unknown>)?.teacherReview as Array<{
    id: string; rating: number; comment: string; createdAt?: string; studentId_data?: { fullname: string };
  }> | undefined;
  const reviews = rawReviews ?? [];

  const rawSlots = (slotsData as Record<string, unknown>)?.calendarSlotRecord as Array<{
    id: string; startTime: string; endTime: string;
  }> | undefined;
  const slots = rawSlots ?? [];

  const handleBook = () => {
    if (!teacher || !user || !selectedDate || !selectedSlot) return;
    const [startH, startM] = selectedSlot.split(":").map(Number);
    const endH = startH + 1;
    bookMutation.mutate({
      teacherId: teacher.teacherId,
      studentId: user.userId,
      lessonType: "individual",
      lessonDate: selectedDate.toISOString().split("T")[0],
      startTime: selectedSlot,
      endTime: `${String(endH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
      pricePerLesson: teacher.price,
      packageSize: 1,
      bookedCount: 1,
      bookingStatus: "pending",
      paymentStatus: "unpaid",
      calendarSlotId: selectedSlotId ?? undefined,
    });
  };

  const resetBooking = () => {
    setBookingOpen(false);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSelectedSlotId(null);
    setCoupon("");
    setStep("select");
  };

  const formattedDate = selectedDate?.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });

  const displaySlots = slots.length > 0
    ? slots.map((s) => ({ id: s.id, label: new Date(s.startTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }))
    : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((t) => ({ id: null, label: t }));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Öğretmen bulunamadı
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-primary px-4 pb-16 pt-4">
        <button onClick={() => navigate(-1)} className="text-primary-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-lg px-6">
        <div className="-mt-12 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <img src={teacher.avatar} alt={teacher.name} className="h-20 w-20 rounded-full border-4 border-card object-cover shadow-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-card-foreground">{teacher.name}</h1>
              <p className="text-sm text-muted-foreground">{teacher.subject} Öğretmeni</p>
              {teacher.rating > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-semibold text-card-foreground">{teacher.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({teacher.reviewCount} yorum)</span>
                </div>
              )}
            </div>
            {teacher.price > 0 && (
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{teacher.price}₺</span>
                <p className="text-xs text-muted-foreground">/ 40 dk</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="hero" className="flex-1 gap-1.5" onClick={() => setBookingOpen(true)}>
              <Calendar className="h-4 w-4" />
              Ders Al
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate("/messages")}>
              <MessageCircle className="h-4 w-4" />
              Mesaj
            </Button>
          </div>
        </div>

        {teacher.description && (
          <div className="mt-6">
            <h3 className="mb-2 font-semibold text-foreground">Hakkında</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{teacher.description}</p>
          </div>
        )}

        {teacher.qualifications && (
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-foreground">Nitelikler</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{teacher.qualifications}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-foreground">İstatistikler</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <CheckCircle className="mx-auto h-5 w-5 text-success" />
              <p className="mt-1 font-bold text-foreground">{teacher.questionsSolved}</p>
              <p className="text-xs text-muted-foreground">Çözülen Soru</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Calendar className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 font-bold text-foreground">{teacher.lessonsGiven}</p>
              <p className="text-xs text-muted-foreground">Verilen Ders</p>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-6 mb-4">
            <h3 className="mb-3 font-semibold text-foreground">Yorumlar</h3>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">{r.studentId_data?.fullname ?? "Öğrenci"}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={bookingOpen} onOpenChange={(open) => { if (!open) resetBooking(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{step === "done" ? "Ders Planlandı! 🎉" : "Ders Al"}</DialogTitle>
          </DialogHeader>

          {step === "select" && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Tarih Seç</p>
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Saat Seç</p>
                  <div className="flex flex-wrap gap-2">
                    {displaySlots.map((slot) => (
                      <button
                        key={slot.label}
                        onClick={() => { setSelectedSlot(slot.label); setSelectedSlotId(slot.id); }}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          selectedSlot === slot.label
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedSlot && (
                <Button variant="hero" className="w-full" onClick={() => setStep("confirm")}>
                  Devam Et
                </Button>
              )}
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Öğretmen: <span className="font-medium text-foreground">{teacher.name}</span></p>
                <p className="text-sm text-muted-foreground">Tarih: <span className="font-medium text-foreground">{formattedDate}</span></p>
                <p className="text-sm text-muted-foreground">Saat: <span className="font-medium text-foreground">{selectedSlot}</span></p>
                {teacher.price > 0 && <p className="text-sm text-muted-foreground">Ücret: <span className="font-bold text-primary">{teacher.price}₺</span></p>}
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-foreground">Kupon Kodu (opsiyonel)</p>
                <Input placeholder="Kupon kodunuz" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              </div>
              <Button variant="hero" className="w-full" onClick={handleBook} disabled={bookMutation.isPending}>
                {bookMutation.isPending ? "İşleniyor..." : `Ders Planla${teacher.price > 0 ? ` · ${teacher.price}₺` : ""}`}
              </Button>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle className="mx-auto h-16 w-16 text-success" />
              <p className="text-foreground font-medium">{teacher.name} ile dersiniz planlandı.</p>
              <p className="text-sm text-muted-foreground">{formattedDate} · {selectedSlot}</p>
              <Button variant="hero" className="w-full" onClick={resetBooking}>Tamam</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default TeacherProfile;
