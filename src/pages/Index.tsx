import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sprout, 
  Sun, 
  MapPin, 
  Calendar, 
  Leaf, 
  ChevronRight,
  Wheat,
  CloudSun,
  Settings,
  Download,
  AlertCircle,
  Bell
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import { useWeather } from "@/hooks/useWeather";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import WeatherAlertBanner from "@/components/WeatherAlertBanner";
import BottomNavigation from "@/components/BottomNavigation";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, loading: profileLoading } = useFarmerProfile();
  const { weather, forecast, isLoading: isWeatherLoading } = useWeather();
  const { checkWeatherAlerts, isSubscribed } = usePushNotifications();
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);

  // Get all unique crops from all farms
  const allCrops = profile?.farms.flatMap(farm => farm.crops) || [];
  const uniqueCrops = [...new Set(allCrops)];
  
  // Calculate total farms
  const totalFarms = profile?.farms.length || 0;

  // Update weather alerts when forecast changes
  useEffect(() => {
    if (forecast && forecast.length > 0) {
      const alerts = checkWeatherAlerts(forecast, weather);
      setWeatherAlerts(alerts);
    }
  }, [forecast, weather, checkWeatherAlerts]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 17) return t("goodAfternoon");
    return t("goodEvening");
  };

  // Get translated crop name
  const getCropName = (crop: string) => {
    const translated = t(crop as any);
    return translated !== crop ? translated : crop;
  };

  // Get season display name
  const getSeasonName = () => {
    if (!profile?.farmingSeason) return "";
    return t(profile.farmingSeason as any);
  };

  // Check if PWA is installed
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85 px-5 pb-10 pt-12">
        {/* Decorative elements */}
        <div className="absolute right-4 top-4 flex gap-2">
          {!isPWA && (
            <button 
              onClick={() => navigate("/install")}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25"
            >
              <Download className="h-5 w-5" />
            </button>
          )}
          <button 
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-16 top-16 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-20 top-32 h-16 w-16 rounded-full bg-accent/20" />
        
        {/* Greeting */}
        <div className="relative z-10">
          <p className="text-base text-white/80 font-medium">{getGreeting()}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">
            {profile?.name || t("farmer")} 👨‍🌾
          </h1>
          
          {/* Location badge */}
          {profile?.location && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-white/90" />
              <span className="text-sm font-medium text-white">
                {profile.village ? `${profile.village}, ` : ""}{profile.location}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="relative z-10 -mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Farms Card */}
          <Card 
            className="border-0 card-interactive cursor-pointer"
            onClick={() => navigate("/farms")}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Wheat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalFarms}</p>
                <p className="text-sm text-muted-foreground">{t("myFarms")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Season Card */}
          <Card className="border-0 card-elevated">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground line-clamp-1">{getSeasonName()}</p>
                <p className="text-sm text-muted-foreground">{t("farmingSeason")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 px-4 pt-6">
        {/* Weather Alerts Section */}
        {weatherAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">{t("activeAlerts")}</h2>
              <Badge variant="destructive" className="ml-auto">{weatherAlerts.length}</Badge>
            </div>
            <WeatherAlertBanner alerts={weatherAlerts} />
          </div>
        )}

        {/* Get Today's Advisory - Primary CTA */}
        <Button 
          size="lg"
          onClick={() => navigate("/advisory")}
          className="w-full h-16 text-lg font-semibold btn-glow-primary rounded-2xl"
        >
          <CloudSun className="mr-3 h-6 w-6" />
          {t("getTodaysAdvice")}
        </Button>

        {/* Actionable Recommendation Card */}
        {weatherAlerts.length > 0 && weatherAlerts[0].recommendation && (
          <Card className="border-0 card-elevated bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-200 dark:bg-amber-800 flex-shrink-0">
                  <Leaf className="h-5 w-5 text-amber-700 dark:text-amber-200" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{t("alertRecommendation")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{weatherAlerts[0].recommendation}</p>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-2">
                    💡 {weatherAlerts[0].action}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Current Crops Section */}
        {uniqueCrops.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">{t("yourCrops")}</h2>
            <Card className="border-0 card-elevated">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {uniqueCrops.slice(0, 6).map((crop) => (
                    <div 
                      key={crop}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-2.5 border border-primary/20"
                    >
                      <Leaf className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{getCropName(crop)}</span>
                    </div>
                  ))}
                  {uniqueCrops.length > 6 && (
                    <div className="inline-flex items-center rounded-2xl bg-muted/60 px-4 py-2.5">
                      <span className="text-sm text-muted-foreground">+{uniqueCrops.length - 6}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Farms List Preview */}
        {profile?.farms && profile.farms.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t("myFarms")}</h2>
              <button 
                onClick={() => navigate("/farms")}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("viewAll")}
              </button>
            </div>
            <div className="space-y-3">
              {profile.farms.slice(0, 2).map((farm) => (
                <Card 
                  key={farm.id} 
                  className="border-0 card-interactive cursor-pointer"
                  onClick={() => navigate("/farms")}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10">
                        <Sprout className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {farm.name || t("unnamedFarm")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(farm.size as any)} • {farm.crops.length} {t("cropsLabel")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Crop Calendar Link */}
        <Card 
          className="cursor-pointer border-0 card-interactive overflow-hidden"
          onClick={() => navigate("/crop-calendar")}
        >
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent/20">
                  <Sun className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{t("cropCalendar")}</p>
                  <p className="text-sm text-muted-foreground">{t("knowBestTimes")}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center py-4">
        <p className="text-sm text-muted-foreground">
          {t("madeForFarmers")}
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;