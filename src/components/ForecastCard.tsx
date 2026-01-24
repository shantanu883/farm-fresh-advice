import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cloud, CloudRain, Sun, CloudSun, Snowflake, CloudFog } from "lucide-react";
import type { ForecastDay } from "@/hooks/useWeather";

interface ForecastCardProps {
  forecast: ForecastDay[];
  className?: string;
}

const getWeatherIcon = (icon: string) => {
  if (icon.startsWith('01')) return <Sun className="h-6 w-6 text-warning" />;
  if (icon.startsWith('02') || icon.startsWith('03')) return <CloudSun className="h-6 w-6 text-warning" />;
  if (icon.startsWith('04')) return <Cloud className="h-6 w-6 text-muted-foreground" />;
  if (icon.startsWith('09') || icon.startsWith('10')) return <CloudRain className="h-6 w-6 text-primary" />;
  if (icon.startsWith('11')) return <CloudRain className="h-6 w-6 text-accent" />;
  if (icon.startsWith('13')) return <Snowflake className="h-6 w-6 text-primary" />;
  if (icon.startsWith('50')) return <CloudFog className="h-6 w-6 text-muted-foreground" />;
  return <Sun className="h-6 w-6 text-warning" />;
};

const ForecastCard = ({ forecast, className }: ForecastCardProps) => {
  const { t } = useLanguage();

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <Card className={cn("card-elevated overflow-hidden p-4", className)}>
      <h3 className="text-farmer-base font-semibold text-foreground mb-4">
        {t("fiveDayForecast")}
      </h3>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {forecast.slice(0, 5).map((day, index) => (
          <div 
            key={day.date}
            className={cn(
              "flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[72px]",
              index === 0 ? "bg-primary/10" : "bg-muted/50"
            )}
          >
            <span className="text-farmer-xs font-medium text-muted-foreground">
              {index === 0 ? t("tomorrow") : day.dayName.slice(0, 3)}
            </span>
            
            <div className="my-2">
              {getWeatherIcon(day.icon)}
            </div>
            
            <div className="flex items-center gap-1 text-farmer-sm">
              <span className="font-bold text-foreground">{day.tempMax}°</span>
              <span className="text-muted-foreground">{day.tempMin}°</span>
            </div>
            
            {day.rainfall > 0 && (
              <span className="text-farmer-xs text-primary mt-1">
                {day.rainfall}mm
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ForecastCard;
