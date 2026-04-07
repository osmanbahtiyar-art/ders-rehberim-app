import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TeacherCardProps {
  id: number;
  name: string;
  subject: string;
  rating: number;
  reviewCount: number;
  price: number;
  avatar: string;
  online?: boolean;
}

const TeacherCard = ({ id, name, subject, rating, reviewCount, price, avatar, online }: TeacherCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover cursor-pointer"
      onClick={() => navigate(`/teacher/${id}`)}
    >
      <div className="relative">
        <img src={avatar} alt={name} className="h-16 w-16 rounded-full object-cover" />
        {online && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-success" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-card-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground">{subject}</p>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-sm font-medium text-card-foreground">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount} yorum)</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-lg font-bold text-primary">{price}₺</span>
        <span className="text-xs text-muted-foreground">/ 40 dk</span>
        <Button size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/teacher/${id}`); }}>
          Ders Al
        </Button>
      </div>
    </div>
  );
};

export default TeacherCard;
