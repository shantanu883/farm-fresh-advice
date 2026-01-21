import { Card } from "@/components/ui/card";
import { Sprout, Calendar, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CropCalendarItemProps {
  cropName: string;
  sowingSeason: string;
  harvestWindow: string;
  className?: string;
}

const CropCalendarItem = ({ 
  cropName, 
  sowingSeason, 
  harvestWindow,
  className 
}: CropCalendarItemProps) => {
  const { t } = useLanguage();

  return (
    <Card className={cn("card-elevated p-4", className)}>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Wheat className="h-7 w-7 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="mb-2 text-farmer-lg font-bold text-foreground">
            {cropName}
          </h3>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <Sprout className="h-4 w-4 text-primary" />
              <span>
                <span className="font-medium">{t("sowingSeason")}:</span> {sowingSeason}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-accent" />
              <span>
                <span className="font-medium">{t("harvestWindow")}:</span> {harvestWindow}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CropCalendarItem;
