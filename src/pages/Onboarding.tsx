import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, MapPin, Wheat, Mountain, Calendar, Ruler, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FarmerProfile {
  name: string;
  village: string;
  primaryCrop: string;
  soilType: string;
  farmingSeason: string;
  farmSize: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState<FarmerProfile>({
    name: "",
    village: "",
    primaryCrop: "",
    soilType: "",
    farmingSeason: "",
    farmSize: "",
  });

  const crops = [
    { value: "rice", label: t("rice") },
    { value: "wheat", label: t("wheat") },
    { value: "cotton", label: t("cotton") },
    { value: "tomato", label: t("tomato") },
  ];

  const soilTypes = [
    { value: "black", label: t("blackSoil") },
    { value: "red", label: t("redSoil") },
    { value: "sandy", label: t("sandySoil") },
    { value: "alluvial", label: t("alluvialSoil") },
  ];

  const seasons = [
    { value: "kharif", label: t("kharif") },
    { value: "rabi", label: t("rabi") },
    { value: "zaid", label: t("zaid") },
  ];

  const farmSizes = [
    { value: "small", label: t("small") },
    { value: "medium", label: t("medium") },
    { value: "large", label: t("large") },
  ];

  const handleSave = () => {
    localStorage.setItem("farmerProfile", JSON.stringify(profile));
    localStorage.setItem("onboardingComplete", "true");
    navigate("/");
  };

  const isFormValid = profile.village && profile.primaryCrop && profile.soilType && profile.farmingSeason;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-6">
        <h1 className="text-farmer-2xl font-bold text-foreground">
          {t("welcomeFarmer")}
        </h1>
        <p className="mt-1 text-farmer-base text-muted-foreground">
          {t("tellUsAboutFarm")}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto max-w-md space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <User className="h-5 w-5 text-primary" />
              {t("yourName")} {t("optional")}
            </Label>
            <Input
              placeholder={t("enterYourName")}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="h-14 text-farmer-lg"
            />
          </div>

          {/* Village Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <MapPin className="h-5 w-5 text-primary" />
              {t("villageDistrict")} {t("required")}
            </Label>
            <Input
              placeholder={t("enterVillageDistrict")}
              value={profile.village}
              onChange={(e) => setProfile({ ...profile, village: e.target.value })}
              className="h-14 text-farmer-lg"
            />
          </div>

          {/* Primary Crop */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Wheat className="h-5 w-5 text-primary" />
              {t("primaryCrop")} {t("required")}
            </Label>
            <Select
              value={profile.primaryCrop}
              onValueChange={(value) => setProfile({ ...profile, primaryCrop: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder={t("selectMainCrop")} />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.value} value={crop.value} className="text-farmer-lg py-3">
                    {crop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Soil Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Mountain className="h-5 w-5 text-primary" />
              {t("soilType")} {t("required")}
            </Label>
            <Select
              value={profile.soilType}
              onValueChange={(value) => setProfile({ ...profile, soilType: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder={t("selectSoilType")} />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((soil) => (
                  <SelectItem key={soil.value} value={soil.value} className="text-farmer-lg py-3">
                    {soil.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Farming Season */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Calendar className="h-5 w-5 text-primary" />
              {t("farmingSeason")} {t("required")}
            </Label>
            <Select
              value={profile.farmingSeason}
              onValueChange={(value) => setProfile({ ...profile, farmingSeason: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder={t("selectSeason")} />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.value} value={season.value} className="text-farmer-lg py-3">
                    {season.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Farm Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Ruler className="h-5 w-5 text-primary" />
              {t("farmSize")} {t("optional")}
            </Label>
            <Select
              value={profile.farmSize}
              onValueChange={(value) => setProfile({ ...profile, farmSize: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder={t("selectFarmSize")} />
              </SelectTrigger>
              <SelectContent>
                {farmSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value} className="text-farmer-lg py-3">
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-farmer-sm text-muted-foreground">
              {t("profileNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-6 py-4">
        <Button
          variant="hero"
          size="xl"
          onClick={handleSave}
          disabled={!isFormValid}
          className="w-full"
        >
          {t("saveAndContinue")}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
