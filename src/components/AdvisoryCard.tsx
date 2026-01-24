import { Card } from "@/components/ui/card";
import RiskBadge, { type RiskLevel } from "./RiskBadge";
import { Lightbulb, Droplets, Leaf, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import ListenButton from "./ListenButton";

interface AdvisoryCardProps {
  advice: string;
  riskLevel: RiskLevel;
  tips?: string[];
  irrigationAdvice?: string;
  fertilizerAdvice?: string;
  isLoading?: boolean;
  className?: string;
}

const AdvisoryCard = ({ 
  advice, 
  riskLevel, 
  tips,
  irrigationAdvice,
  fertilizerAdvice,
  isLoading,
  className 
}: AdvisoryCardProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card className={cn("card-elevated overflow-hidden", className)}>
        <div className="bg-primary p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
            </div>
            <h3 className="text-farmer-lg font-bold text-primary-foreground">
              {t("whatShouldIDoToday")}
            </h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("card-elevated overflow-hidden", className)}>
      <div className="bg-primary p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <h3 className="text-farmer-lg font-bold text-primary-foreground">
            {t("whatShouldIDoToday")}
          </h3>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-4">
          <p className="text-farmer-base leading-relaxed text-foreground flex-1">
            {advice}
          </p>
          <ListenButton text={advice} compact className="shrink-0" />
        </div>
        <RiskBadge level={riskLevel} />

        {/* Tips Section */}
        {tips && tips.length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-farmer-sm font-semibold text-foreground mb-2">
              {t("quickTips")}
            </h4>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-farmer-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Irrigation & Fertilizer Advice */}
        {(irrigationAdvice || fertilizerAdvice) && (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {irrigationAdvice && (
              <div className="rounded-xl bg-primary/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span className="text-farmer-sm font-semibold text-primary">
                      {t("bestIrrigationTime")}
                    </span>
                  </div>
                  <ListenButton text={irrigationAdvice} compact className="h-8 w-8" />
                </div>
                <p className="text-farmer-sm text-foreground">{irrigationAdvice}</p>
              </div>
            )}
            {fertilizerAdvice && (
              <div className="rounded-xl bg-accent/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-accent" />
                    <span className="text-farmer-sm font-semibold text-accent">
                      {t("fertilizerTip")}
                    </span>
                  </div>
                  <ListenButton text={fertilizerAdvice} compact className="h-8 w-8" />
                </div>
                <p className="text-farmer-sm text-foreground">{fertilizerAdvice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvisoryCard;
