import { Thermometer, Droplets, CloudRain, Wind, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description?: string;
  icon?: string;
  windSpeed?: number;
}

interface WeatherCardProps {
  weather: WeatherData;
  className?: string;
}

const WeatherCard = ({ weather, className }: WeatherCardProps) => {
  const { t } = useLanguage();

  const getWeatherIcon = () => {
    const desc = weather.description?.toLowerCase() || '';
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-10 w-10 text-white drop-shadow-lg" />;
    }
    if (desc.includes('cloud')) {
      return <Sun className="h-10 w-10 text-white drop-shadow-lg" />;
    }
    return <Sun className="h-10 w-10 text-white drop-shadow-lg" />;
  };

  return (
    <Card className={cn("overflow-hidden p-0 card-elevated border-0", className)}>
      {/* Header with weather description */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{t("currentWeather")}</p>
            <p className="text-xl font-bold capitalize mt-0.5">
              {weather.description || "Clear Sky"}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            {getWeatherIcon()}
          </div>
        </div>
      </div>

      {/* Weather stats grid */}
      <div className="grid grid-cols-3 divide-x divide-border/50 bg-card">
        {/* Temperature */}
        <div className="flex flex-col items-center p-4 group">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-weather-temp transition-transform duration-300 group-hover:scale-105">
            <Thermometer className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {weather.temperature}°
          </span>
          <span className="text-xs text-muted-foreground font-medium">{t("temperature")}</span>
        </div>

        {/* Humidity */}
        <div className="flex flex-col items-center p-4 group">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-weather-humidity transition-transform duration-300 group-hover:scale-105">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {weather.humidity}%
          </span>
          <span className="text-xs text-muted-foreground font-medium">{t("humidity")}</span>
        </div>

        {/* Rainfall or Wind */}
        <div className="flex flex-col items-center p-4 group">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-weather-rain transition-transform duration-300 group-hover:scale-105">
            <CloudRain className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {weather.rainfall}<span className="text-sm">mm</span>
          </span>
          <span className="text-xs text-muted-foreground font-medium">{t("rainfall")}</span>
        </div>
      </div>

      {/* Wind speed footer */}
      {weather.windSpeed !== undefined && (
        <div className="flex items-center justify-center gap-2 border-t border-border/50 bg-muted/30 py-3 px-4">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Wind: <span className="font-semibold text-foreground">{weather.windSpeed} km/h</span>
          </span>
        </div>
      )}
    </Card>
  );
};

export default WeatherCard;