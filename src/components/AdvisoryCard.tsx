import { Card } from "@/components/ui/card";
import RiskBadge, { type RiskLevel } from "./RiskBadge";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvisoryCardProps {
  advice: string;
  riskLevel: RiskLevel;
  className?: string;
}

const AdvisoryCard = ({ advice, riskLevel, className }: AdvisoryCardProps) => {
  return (
    <Card className={cn("card-elevated overflow-hidden", className)}>
      <div className="bg-primary p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <h3 className="text-farmer-lg font-bold text-primary-foreground">
            What should I do today?
          </h3>
        </div>
      </div>
      
      <div className="p-5">
        <p className="mb-4 text-farmer-base leading-relaxed text-foreground">
          {advice}
        </p>
        <RiskBadge level={riskLevel} />
      </div>
    </Card>
  );
};

export default AdvisoryCard;
