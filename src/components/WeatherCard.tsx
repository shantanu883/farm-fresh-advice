import { Thermometer, Droplets, CloudRain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
}

interface WeatherCardProps {
  weather: WeatherData;
  className?: string;
}

const WeatherCard = ({ weather, className }: WeatherCardProps) => {
  return (
    <Card className={cn("overflow-hidden p-0 card-elevated", className)}>
      <div className="grid grid-cols-3 divide-x divide-border">
        {/* Temperature */}
        <div className="flex flex-col items-center p-4">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-weather-temp">
            <Thermometer className="h-6 w-6 text-white" />
          </div>
          <span className="text-farmer-xl font-bold text-foreground">
            {weather.temperature}°C
          </span>
          <span className="text-farmer-sm text-muted-foreground">Temperature</span>
        </div>

        {/* Humidity */}
        <div className="flex flex-col items-center p-4">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-weather-humidity">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <span className="text-farmer-xl font-bold text-foreground">
            {weather.humidity}%
          </span>
          <span className="text-farmer-sm text-muted-foreground">Humidity</span>
        </div>

        {/* Rainfall */}
        <div className="flex flex-col items-center p-4">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-weather-rain">
            <CloudRain className="h-6 w-6 text-white" />
          </div>
          <span className="text-farmer-xl font-bold text-foreground">
            {weather.rainfall}mm
          </span>
          <span className="text-farmer-sm text-muted-foreground">Rainfall</span>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;
