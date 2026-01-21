import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

export type RiskLevel = "low" | "medium" | "high";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig: Record<RiskLevel, { labelKey: TranslationKey; icon: typeof CheckCircle; className: string }> = {
  low: {
    labelKey: "lowRisk",
    icon: CheckCircle,
    className: "risk-low",
  },
  medium: {
    labelKey: "mediumRisk",
    icon: AlertCircle,
    className: "risk-medium",
  },
  high: {
    labelKey: "highRisk",
    icon: AlertTriangle,
    className: "risk-high",
  },
};

const RiskBadge = ({ level, className }: RiskBadgeProps) => {
  const { t } = useLanguage();
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold",
        config.className,
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-farmer-sm">{t(config.labelKey)}</span>
    </div>
  );
};

export default RiskBadge;
