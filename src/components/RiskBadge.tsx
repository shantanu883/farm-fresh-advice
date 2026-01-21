import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export type RiskLevel = "low" | "medium" | "high";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig = {
  low: {
    label: "Low Risk",
    icon: CheckCircle,
    className: "risk-low",
  },
  medium: {
    label: "Medium Risk",
    icon: AlertCircle,
    className: "risk-medium",
  },
  high: {
    label: "High Risk",
    icon: AlertTriangle,
    className: "risk-high",
  },
};

const RiskBadge = ({ level, className }: RiskBadgeProps) => {
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
      <span className="text-farmer-sm">{config.label}</span>
    </div>
  );
};

export default RiskBadge;
