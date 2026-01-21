import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  className?: string;
}

const PageHeader = ({ title, showBack = false, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("mb-6 flex items-center gap-3", className)}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/80"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <h1 className="text-farmer-2xl font-bold text-foreground">{title}</h1>
    </div>
  );
};

export default PageHeader;
