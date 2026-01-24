import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
  Settings
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import BottomNavigation from "@/components/BottomNavigation";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, loading: profileLoading } = useFarmerProfile();

  // Get all unique crops from all farms
  const allCrops = profile?.farms.flatMap(farm => farm.crops) || [];
  const uniqueCrops = [...new Set(allCrops)];
  
  // Calculate total farms
  const totalFarms = profile?.farms.length || 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 17) return t("goodAfternoon");
    return t("goodEvening");
  };

  // Get translated crop name
  const getCropName = (crop: string) => {
    // Try to get translation, fallback to original crop name
    const translated = t(crop as any);
    return translated !== crop ? translated : crop;
  };

  // Get season display name
  const getSeasonName = () => {
    if (!profile?.farmingSeason) return "";
    return t(profile.farmingSeason as any);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 pb-8 pt-10">
        {/* Decorative elements */}
        <div className="absolute right-4 top-4">
          <button 
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute -left-10 top-20 h-24 w-24 rounded-full bg-primary-foreground/5" />
        
        {/* Greeting */}
        <div className="relative z-10">
          <p className="text-farmer-base text-primary-foreground/80">{getGreeting()}</p>
          <h1 className="mt-1 text-farmer-2xl font-bold text-primary-foreground">
            {profile?.name || t("farmer")} 👨‍🌾
          </h1>
          
          {/* Location badge */}
          {profile?.location && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5">
              <MapPin className="h-4 w-4 text-primary-foreground/80" />
              <span className="text-farmer-sm font-medium text-primary-foreground">
                {profile.village ? `${profile.village}, ` : ""}{profile.location}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="relative z-10 -mt-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Farms Card */}
          <Card className="border-0 shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Wheat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-farmer-2xl font-bold text-foreground">{totalFarms}</p>
                <p className="text-farmer-sm text-muted-foreground">{t("myFarms")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Season Card */}
          <Card className="border-0 shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-farmer-base font-bold text-foreground">{getSeasonName()}</p>
                <p className="text-farmer-sm text-muted-foreground">{t("farmingSeason")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 px-4 pt-6">
        {/* Current Crops Section */}
        {uniqueCrops.length > 0 && (
          <div>
            <h2 className="mb-3 text-farmer-lg font-semibold text-foreground">{t("yourCrops")}</h2>
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {uniqueCrops.slice(0, 6).map((crop) => (
                    <div 
                      key={crop}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2"
                    >
                      <Leaf className="h-4 w-4 text-primary" />
                      <span className="text-farmer-sm font-medium text-primary">{getCropName(crop)}</span>
                    </div>
                  ))}
                  {uniqueCrops.length > 6 && (
                    <div className="inline-flex items-center rounded-full bg-muted px-3 py-2">
                      <span className="text-farmer-sm text-muted-foreground">+{uniqueCrops.length - 6}</span>
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
              <h2 className="text-farmer-lg font-semibold text-foreground">{t("myFarms")}</h2>
              <button 
                onClick={() => navigate("/settings")}
                className="text-farmer-sm font-medium text-primary"
              >
                {t("viewAll")}
              </button>
            </div>
            <div className="space-y-3">
              {profile.farms.slice(0, 2).map((farm) => (
                <Card key={farm.id} className="border-0 shadow-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                        <Sprout className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-farmer-base font-semibold text-foreground">
                          {farm.name || t("unnamedFarm")}
                        </p>
                        <p className="text-farmer-sm text-muted-foreground">
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

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-farmer-lg font-semibold text-foreground">{t("quickActions")}</h2>
          
          {/* Get Today's Advisory - Primary CTA */}
          <Button 
            variant="hero" 
            size="xl"
            onClick={() => navigate("/advisory")}
            className="w-full shadow-button"
          >
            <CloudSun className="mr-2 h-5 w-5" />
            {t("getTodaysAdvice")}
          </Button>

          {/* Crop Calendar Link */}
          <Card 
            className="cursor-pointer border-0 shadow-card transition-all hover:shadow-elevated"
            onClick={() => navigate("/crop-calendar")}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <Sun className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-farmer-base font-semibold text-foreground">{t("cropCalendar")}</p>
                  <p className="text-farmer-sm text-muted-foreground">{t("knowBestTimes")}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center border-t border-border bg-muted/30 py-4">
        <p className="text-farmer-sm text-muted-foreground">
          {t("madeForFarmers")}
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;
