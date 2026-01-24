import { useEffect } from "react";
import WeatherCard from "@/components/WeatherCard";
import AdvisoryCard from "@/components/AdvisoryCard";
import AlertBanner from "@/components/AlertBanner";
import BottomNavigation from "@/components/BottomNavigation";
import { MapPin, RefreshCw, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { Skeleton } from "@/components/ui/skeleton";

const Advisory = () => {
  const { t } = useLanguage();
  const { 
    weather, 
    locationName, 
    isLoading, 
    error, 
    refreshWeather, 
    requestLocation,
    location 
  } = useWeather();

  // Request location on first visit if not cached
  useEffect(() => {
    if (!location && !isLoading) {
      requestLocation();
    }
  }, []);

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
            {isLoading && !locationName ? (
              <Skeleton className="h-4 w-32" />
            ) : locationName ? (
              <span>{locationName}</span>
            ) : (
              <button 
                onClick={requestLocation}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Navigation className="h-3 w-3" />
                {t("useGPSLocation")}
              </button>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={refreshWeather}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <AlertBanner
          message={error}
          type="warning"
          className="mb-6"
        />
      )}

      {/* Alert Banner */}
      {weather && weather.rainfall > 10 && (
        <AlertBanner
          message={t("heavyRainfallWarning")}
          type="warning"
          className="mb-6"
        />
      )}

      {/* Weather Card */}
      <div className="mb-6">
        <h2 className="mb-3 text-farmer-lg font-semibold text-foreground">
          {t("currentWeather")}
        </h2>
        {isLoading && !weather ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : weather ? (
          <WeatherCard weather={weather} />
        ) : (
          <div className="rounded-xl bg-muted/50 p-6 text-center">
            <p className="text-farmer-sm text-muted-foreground">
              {t("useGPSLocation")}
            </p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={requestLocation}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {t("detectingLocation")}
            </Button>
          </div>
        )}
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
