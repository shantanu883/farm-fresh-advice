import { Card } from "@/components/ui/card";
import RiskBadge, { type RiskLevel } from "./RiskBadge";
import { Calendar, CloudSun, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DayPlan } from "@/hooks/useAdvisory";
import ListenButton from "./ListenButton";

interface ThreeDayPlanCardProps {
  plan: DayPlan[];
  className?: string;
}

const ThreeDayPlanCard = ({ plan, className }: ThreeDayPlanCardProps) => {
  const { t } = useLanguage();

  if (!plan || plan.length === 0) {
    return null;
  }

  const getDayGradient = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'from-destructive/10 to-destructive/5 border-destructive/30';
      case 'medium':
        return 'from-amber-100/80 to-amber-50/50 border-amber-300/40 dark:from-amber-900/20 dark:to-amber-900/10';
      default:
        return 'from-primary/10 to-primary/5 border-primary/30';
    }
  };

  return (
    <Card className={cn("card-elevated overflow-hidden border-0", className)}>
      <div className="bg-gradient-to-br from-accent via-accent to-accent/90 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("threeDayPlan")}
            </h3>
            <p className="text-sm text-white/70">Plan your week ahead</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {plan.map((day, index) => (
          <div 
            key={day.day}
            className={cn(
              "p-4 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:shadow-md",
              getDayGradient(day.riskLevel)
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold",
                  day.riskLevel === 'high' ? 'bg-destructive/20 text-destructive' :
                  day.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                  'bg-primary/20 text-primary'
                )}>
                  {day.day}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {day.dayName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={day.riskLevel} />
                <ListenButton 
                  text={`${day.dayName}: ${day.activity}. ${day.reason}`} 
                  compact 
                  className="h-8 w-8"
                />
              </div>
            </div>
            <p className="text-base font-medium text-foreground mb-1.5">
              {day.activity}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {day.reason}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ThreeDayPlanCard;