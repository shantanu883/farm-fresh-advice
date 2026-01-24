import { Card } from "@/components/ui/card";
import RiskBadge, { type RiskLevel } from "./RiskBadge";
import { Calendar, Droplets, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DayPlan } from "@/hooks/useAdvisory";

interface ThreeDayPlanCardProps {
  plan: DayPlan[];
  className?: string;
}

const ThreeDayPlanCard = ({ plan, className }: ThreeDayPlanCardProps) => {
  const { t } = useLanguage();

  if (!plan || plan.length === 0) {
    return null;
  }

  return (
    <Card className={cn("card-elevated overflow-hidden", className)}>
      <div className="bg-accent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-foreground/20">
            <Calendar className="h-5 w-5 text-accent-foreground" />
          </div>
          <h3 className="text-farmer-lg font-bold text-accent-foreground">
            {t("threeDayPlan")}
          </h3>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {plan.map((day, index) => (
          <div 
            key={day.day}
            className={cn(
              "p-3 rounded-xl border",
              day.riskLevel === 'high' ? 'border-destructive/30 bg-destructive/5' :
              day.riskLevel === 'medium' ? 'border-warning/30 bg-warning/5' :
              'border-primary/30 bg-primary/5'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-farmer-sm font-semibold text-foreground">
                {t("day")} {day.day}: {day.dayName}
              </span>
              <RiskBadge level={day.riskLevel} />
            </div>
            <p className="text-farmer-base font-medium text-foreground mb-1">
              {day.activity}
            </p>
            <p className="text-farmer-sm text-muted-foreground">
              {day.reason}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ThreeDayPlanCard;
