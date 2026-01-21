import { Farm } from "@/types/farm";
import { Button } from "@/components/ui/button";
import { Trash2, Wheat, Ruler } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FarmCardProps {
  farm: Farm;
  onDelete: (id: string) => void;
  cropLabels: Record<string, string>;
  sizeLabels: Record<string, string>;
}

const FarmCard = ({ farm, onDelete, cropLabels, sizeLabels }: FarmCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-farmer-lg font-semibold text-foreground">
            {farm.name || t("unnamedFarm")}
          </h3>
          
          <div className="mt-2 flex items-center gap-2 text-farmer-sm text-muted-foreground">
            <Ruler className="h-4 w-4" />
            <span>{sizeLabels[farm.size] || farm.size}</span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {farm.crops.map((crop, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-farmer-sm font-medium text-primary"
              >
                <Wheat className="h-3 w-3" />
                {cropLabels[crop] || crop}
              </span>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(farm.id)}
          className="h-10 w-10 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FarmCard;
