import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout, CloudSun, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import { useWeather } from "@/hooks/useWeather";
import { useAdvisory, type Advisory } from "@/hooks/useAdvisory";
import BottomNavigation from "@/components/BottomNavigation";
import AdvisoryCard from "@/components/AdvisoryCard";
import ListenButton from "@/components/ListenButton";

const Farms = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useFarmerProfile();
  const { weather, forecast } = useWeather();
  const { generateAdvisory } = useAdvisory();
  
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farmAdvisories, setFarmAdvisories] = useState<Record<string, Advisory>>({});
  const [loadingFarmId, setLoadingFarmId] = useState<string | null>(null);

  const getCropName = (crop: string) => {
    const translated = t(crop as any);
    return translated !== crop ? translated : crop;
  };

  const handleGetAdvice = async (farmId: string, crops: string[]) => {
    if (!weather) {
      return;
    }

    setLoadingFarmId(farmId);
    setSelectedFarmId(farmId);

    try {
      const farmData = {
        crops,
        farmSize: profile?.farms.find(f => f.id === farmId)?.size,
        season: profile?.farmingSeason
      };

      const weatherInput = {
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall || 0,
        description: weather.description,
        windSpeed: weather.windSpeed
      };

      // Generate advisory and store it
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.functions.invoke('generate-advisory', {
          body: { 
            weather: weatherInput, 
            forecast, 
            farm: farmData, 
            language 
          }
        })
      );

      if (!error && data) {
        setFarmAdvisories(prev => ({
          ...prev,
          [farmId]: data as Advisory
        }));
      }
    } catch (err) {
      console.error('Error generating farm advice:', err);
    } finally {
      setLoadingFarmId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-4 pb-6 pt-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-farmer-xl font-bold text-primary-foreground">
            {t("myFarms")}
          </h1>
        </div>
      </div>

      {/* Farms List */}
      <div className="flex-1 space-y-4 px-4 pt-6">
        {profile?.farms && profile.farms.length > 0 ? (
          profile.farms.map((farm) => (
            <div key={farm.id} className="space-y-3">
              <Card className="border-0 shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Sprout className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-farmer-lg font-semibold text-foreground">
                          {farm.name || t("unnamedFarm")}
                        </p>
                        <p className="text-farmer-sm text-muted-foreground">
                          {t(farm.size as any)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Crops */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {farm.crops.map((crop) => (
                      <span
                        key={crop}
                        className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-farmer-sm font-medium text-secondary"
                      >
                        {getCropName(crop)}
                      </span>
                    ))}
                  </div>

                  {/* Get Advice Button */}
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => handleGetAdvice(farm.id, farm.crops)}
                    disabled={loadingFarmId === farm.id || !weather}
                  >
                    {loadingFarmId === farm.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        <CloudSun className="mr-2 h-4 w-4" />
                        {t("getAdviceForFarm")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Farm-specific Advisory */}
              {selectedFarmId === farm.id && farmAdvisories[farm.id] && (
                <div className="relative">
                  <AdvisoryCard
                    advice={farmAdvisories[farm.id].mainAdvice}
                    riskLevel={farmAdvisories[farm.id].riskLevel}
                    tips={farmAdvisories[farm.id].tips}
                    irrigationAdvice={farmAdvisories[farm.id].irrigationAdvice}
                    fertilizerAdvice={farmAdvisories[farm.id].fertilizerAdvice}
                  />
                  <div className="absolute bottom-4 right-4">
                    <ListenButton 
                      text={farmAdvisories[farm.id].mainAdvice} 
                      compact 
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Sprout className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-farmer-base text-muted-foreground">
              {t("noFarmsYet")}
            </p>
            <Button
              variant="default"
              className="mt-4"
              onClick={() => navigate("/settings")}
            >
              {t("addFarm")}
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Farms;
