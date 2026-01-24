import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

export type RiskLevel = "low" | "medium" | "high";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig: Record<RiskLevel, { 
  labelKey: TranslationKey; 
  icon: typeof CheckCircle; 
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  low: {
    labelKey: "lowRisk",
    icon: CheckCircle,
    bgClass: "bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20",
    textClass: "text-green-700 dark:text-green-300",
    borderClass: "border-green-200/60 dark:border-green-700/40",
  },
  medium: {
    labelKey: "mediumRisk",
    icon: AlertCircle,
    bgClass: "bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/20",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-200/60 dark:border-amber-700/40",
  },
  high: {
    labelKey: "highRisk",
    icon: AlertTriangle,
    bgClass: "bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20",
    textClass: "text-red-700 dark:text-red-300",
    borderClass: "border-red-200/60 dark:border-red-700/40",
  },
};

const RiskBadge = ({ level, className }: RiskBadgeProps) => {
  const { t } = useLanguage();
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold transition-all",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{t(config.labelKey)}</span>
    </div>
  );
};

export default RiskBadge;