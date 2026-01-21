import WeatherCard from "@/components/WeatherCard";
import AdvisoryCard from "@/components/AdvisoryCard";
import AlertBanner from "@/components/AlertBanner";
import BottomNavigation from "@/components/BottomNavigation";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// Placeholder data
const weatherData = {
  temperature: 32,
  humidity: 65,
  rainfall: 12,
};

const Advisory = () => {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-farmer-2xl font-bold text-foreground">
            {t("todaysAdvisory")}
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
        message={t("heavyRainfallWarning")}
        type="warning"
        className="mb-6"
      />

      {/* Weather Card */}
      <div className="mb-6">
        <h2 className="mb-3 text-farmer-lg font-semibold text-foreground">
          {t("currentWeather")}
        </h2>
        <WeatherCard weather={weatherData} />
      </div>

      {/* Advisory Card */}
      <div className="mb-6">
        <AdvisoryCard 
          advice={t("advisoryPlaceholder")} 
          riskLevel="medium" 
        />
      </div>

      {/* Quick Tips */}
      <div className="mb-6">
        <h2 className="mb-3 text-farmer-lg font-semibold text-foreground">
          {t("quickTips")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-farmer-sm font-medium text-primary">
              {t("bestIrrigationTime")}
            </p>
          </div>
          <div className="rounded-xl bg-accent/10 p-4">
            <p className="text-farmer-sm font-medium text-accent">
              {t("fertilizerTip")}
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Advisory;
