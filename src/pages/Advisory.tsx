import WeatherCard from "@/components/WeatherCard";
import AdvisoryCard from "@/components/AdvisoryCard";
import AlertBanner from "@/components/AlertBanner";
import BottomNavigation from "@/components/BottomNavigation";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder data
const weatherData = {
  temperature: 32,
  humidity: 65,
  rainfall: 12,
};

const advisoryText = `Based on current weather conditions, it's a good day for irrigation. The temperature is optimal for crop growth. Consider applying fertilizer in the evening when temperatures are cooler. Monitor for pest activity due to high humidity.`;

const Advisory = () => {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-farmer-2xl font-bold text-foreground">
            Today's Advisory
          </h1>
          <div className="mt-1 flex items-center gap-2 text-farmer-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Hyderabad, Telangana</span>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Alert Banner */}
      <AlertBanner
        message="Heavy rainfall expected tomorrow. Plan your irrigation accordingly."
        type="warning"
        className="mb-6"
      />

      {/* Weather Card */}
      <div className="mb-6">
        <h2 className="mb-3 text-farmer-lg font-semibold text-foreground">
          Current Weather
        </h2>
        <WeatherCard weather={weatherData} />
      </div>

      {/* Advisory Card */}
      <div className="mb-6">
        <AdvisoryCard 
          advice={advisoryText} 
          riskLevel="medium" 
        />
      </div>

      {/* Quick Tips */}
      <div className="mb-6">
        <h2 className="mb-3 text-farmer-lg font-semibold text-foreground">
          Quick Tips
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-farmer-sm font-medium text-primary">
              💧 Best irrigation time: 6-8 AM
            </p>
          </div>
          <div className="rounded-xl bg-accent/10 p-4">
            <p className="text-farmer-sm font-medium text-accent">
              🌱 Fertilizer: Evening preferred
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Advisory;
