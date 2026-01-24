import { Card } from "@/components/ui/card";
import RiskBadge, { type RiskLevel } from "./RiskBadge";
import { Lightbulb, Droplets, Leaf, Loader2, Sparkles } from "lucide-react";
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
      <Card className={cn("card-elevated overflow-hidden border-0", className)}>
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {t("whatShouldIDoToday")}
              </h3>
              <p className="text-sm text-white/70">{t("loading")}...</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("card-elevated overflow-hidden border-0", className)}>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("whatShouldIDoToday")}
            </h3>
            <p className="text-sm text-white/70 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-powered advice
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {/* Main advice */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-base leading-relaxed text-foreground flex-1">
            {advice}
          </p>
          <ListenButton text={advice} compact className="shrink-0 h-10 w-10" />
        </div>
        
        <RiskBadge level={riskLevel} />

        {/* Tips Section */}
        {tips && tips.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-muted/50 border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("quickTips")}
            </h4>
            <ul className="space-y-2.5">
              {tips.map((tip, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Irrigation & Fertilizer Advice */}
        {(irrigationAdvice || fertilizerAdvice) && (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {irrigationAdvice && (
              <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 p-4 border border-secondary/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/20">
                      <Droplets className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="text-sm font-semibold text-secondary">
                      {t("bestIrrigationTime")}
                    </span>
                  </div>
                  <ListenButton text={irrigationAdvice} compact className="h-8 w-8" />
                </div>
                <p className="text-sm text-foreground ml-10">{irrigationAdvice}</p>
              </div>
            )}
            {fertilizerAdvice && (
              <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-4 border border-accent/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20">
                      <Leaf className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-semibold text-accent">
                      {t("fertilizerTip")}
                    </span>
                  </div>
                  <ListenButton text={fertilizerAdvice} compact className="h-8 w-8" />
                </div>
                <p className="text-sm text-foreground ml-10">{fertilizerAdvice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvisoryCard;