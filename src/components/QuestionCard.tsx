import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  image: string;
  subject: string;
  grade: string;
  answeredBy?: string;
}

const QuestionCard = ({ image, subject, grade, answeredBy }: QuestionCardProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <img src={image} alt="Soru" className="h-40 w-full object-cover" loading="lazy" />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{subject}</span>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{grade}</span>
        </div>
        {answeredBy ? (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">{answeredBy}</span> cevapladı
            </p>
            <Button size="sm" variant="outline" className="text-xs">
              Ders Al
            </Button>
          </div>
        ) : (
          <Button size="sm" className="mt-3 w-full gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Cevapla
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
