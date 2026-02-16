import { useEffect, useState } from "react";
import WeatherCard from "@/components/WeatherCard";
import AdvisoryCard from "@/components/AdvisoryCard";
import ForecastCard from "@/components/ForecastCard";
import ThreeDayPlanCard from "@/components/ThreeDayPlanCard";
import PestAlertCard from "@/components/PestAlertCard";
import AlertBanner from "@/components/AlertBanner";
import WeatherAlertBanner from "@/components/WeatherAlertBanner";
import ListenButton from "@/components/ListenButton";
import BottomNavigation from "@/components/BottomNavigation";
import { MapPin, RefreshCw, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { useAdvisory } from "@/hooks/useAdvisory";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { FarmerProfile } from "@/types/farm";

const Advisory = () => {
  const { t } = useLanguage();
  const { 
    weather, 
    forecast,
    locationName, 
    isLoading: isWeatherLoading, 
    error: weatherError, 
    refreshWeather, 
    requestLocation,
    location 
  } = useWeather();

  const {
    advisory,
    isLoading: isAdvisoryLoading,
    error: advisoryError,
    generateAdvisory
  } = useAdvisory();

  const {
    isSubscribed,
    checkWeatherAlerts,
    showLocalNotification
  } = usePushNotifications();

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const weatherAlerts = checkWeatherAlerts(forecast);

  // Load farmer profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('farmerProfile');
    if (saved) {
      try {
        setFarmerProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing farmer profile:', e);
      }
    }
  }, []);

  // Request location on first visit if not cached
  useEffect(() => {
    if (!location && !isWeatherLoading) {
      requestLocation();
    }
  }, []);

  // Generate advisory when weather and forecast data are available
  useEffect(() => {
    if (weather && !advisory && !isAdvisoryLoading) {
      const farmData = farmerProfile ? {
        crops: farmerProfile.farms.flatMap(f => f.crops),
        season: farmerProfile.farmingSeason
      } : undefined;

      generateAdvisory(weather, farmData, forecast);
    }
  }, [weather, forecast, farmerProfile]);

  // Send push notifications for weather alerts
  useEffect(() => {
    if (isSubscribed && weatherAlerts.length > 0) {
      // Show notification for the most severe alert
      const dangerAlerts = weatherAlerts.filter(a => a.severity === 'danger');
      const alertToShow = dangerAlerts[0] || weatherAlerts[0];
      if (alertToShow) {
        showLocalNotification(alertToShow);
      }
    }
  }, [isSubscribed, weatherAlerts, showLocalNotification]);

  // Poll weather every 60 seconds when subscribed to notifications so mobile/desktop get periodic updates
  useEffect(() => {
    if (!isSubscribed) return;

    let mounted = true;
    const interval = setInterval(async () => {
      try {
        // refreshWeather will update `weather` and `forecast` from useWeather
        await refreshWeather();
        if (!mounted) return;
        const newAlerts = checkWeatherAlerts(forecast);
        if (newAlerts && newAlerts.length > 0) {
          const dangerAlerts = newAlerts.filter(a => a.severity === 'danger');
          const alertToShow = dangerAlerts[0] || newAlerts[0];
          if (alertToShow) {
            showLocalNotification(alertToShow);
          }
        }
      } catch (e) {
        console.error('Periodic weather poll failed:', e);
      }
    }, 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isSubscribed, refreshWeather, forecast, checkWeatherAlerts, showLocalNotification]);

  const handleRefresh = async () => {
    await refreshWeather();
    if (weather) {
      const farmData = farmerProfile ? {
        crops: farmerProfile.farms.flatMap(f => f.crops),
        season: farmerProfile.farmingSeason
      } : undefined;
      generateAdvisory(weather, farmData, forecast);
    }
  };

  const isLoading = isWeatherLoading || isAdvisoryLoading;
  const error = weatherError || advisoryError;

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
            {isWeatherLoading && !locationName ? (
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
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <WeatherAlertBanner alerts={weatherAlerts} />
      )}

      {/* Error Banner */}
      {error && (
        <AlertBanner
          message={error}
          type="warning"
          className="mb-6"
        />
      )}

      {/* Alert Banner */}
      {advisory?.riskLevel === 'high' && !weatherAlerts.length && (
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
        {isWeatherLoading && !weather ? (
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

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <div className="mb-6">
          <ForecastCard forecast={forecast} />
        </div>
      )}

      {/* Advisory Card */}
      <div className="mb-6">
        <AdvisoryCard 
          advice={advisory?.mainAdvice || t("advisoryPlaceholder")} 
          riskLevel={advisory?.riskLevel || "medium"}
          tips={advisory?.tips}
          irrigationAdvice={advisory?.irrigationAdvice}
          fertilizerAdvice={advisory?.fertilizerAdvice}
          isLoading={isAdvisoryLoading}
        />
        
        {/* Listen to Advice Button */}
        {advisory?.mainAdvice && (
          <ListenButton 
            text={advisory.mainAdvice} 
            className="mt-4 w-full"
          />
        )}
      </div>

      {/* 3-Day Plan */}
      {advisory?.threeDayPlan && advisory.threeDayPlan.length > 0 && (
        <div className="mb-6">
          <ThreeDayPlanCard plan={advisory.threeDayPlan} />
        </div>
      )}

      {/* Pest & Disease Alerts */}
      {advisory?.pestAlerts && advisory.pestAlerts.length > 0 && (
        <div className="mb-6">
          <PestAlertCard alerts={advisory.pestAlerts} />
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Advisory;
