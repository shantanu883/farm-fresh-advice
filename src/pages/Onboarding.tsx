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
import { User, MapPin, Calendar, Info, Tractor, Navigation, Globe, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Farm, FarmerProfile } from "@/types/farm";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import { Language } from "@/i18n/translations";
import FarmCard from "@/components/FarmCard";
import AddFarmDialog from "@/components/AddFarmDialog";
import { toast } from "sonner";

const languages: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { saveProfile } = useFarmerProfile();
  const [step, setStep] = useState<"language" | "profile">("language");
  const [isGPSLoading, setIsGPSLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<FarmerProfile>({
    name: "",
    location: "",
    village: "",
    farms: [],
    farmingSeason: "",
  });

  const crops = [
    { value: "rice", label: t("rice") },
    { value: "wheat", label: t("wheat") },
    { value: "cotton", label: t("cotton") },
    { value: "tomato", label: t("tomato") },
  ];

  const cropLabels = crops.reduce((acc, crop) => {
    acc[crop.value] = crop.label;
    return acc;
  }, {} as Record<string, string>);

  const farmSizes = [
    { value: "small", label: t("small") },
    { value: "medium", label: t("medium") },
    { value: "large", label: t("large") },
  ];

  const sizeLabels = farmSizes.reduce((acc, size) => {
    acc[size.value] = size.label;
    return acc;
  }, {} as Record<string, string>);

  const seasons = [
    { value: "kharif", label: t("kharif") },
    { value: "rabi", label: t("rabi") },
    { value: "zaid", label: t("zaid") },
  ];

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
  };

  const handleContinueToProfile = () => {
    setStep("profile");
  };

  const handleAddFarm = (farm: Farm) => {
    setProfile({ ...profile, farms: [...profile.farms, farm] });
  };

  const handleDeleteFarm = (farmId: string) => {
    setProfile({
      ...profile,
      farms: profile.farms.filter((f) => f.id !== farmId),
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await saveProfile(profile);
      if (error) {
        toast.error("Failed to save profile. Please try again.");
        console.error("Save error:", error);
      } else {
        toast.success("Profile saved successfully!");
        navigate("/");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = profile.location && profile.farms.length > 0 && profile.farmingSeason;

  // Step 1: Language Selection
  if (step === "language") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/5" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/10" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Globe className="h-10 w-10 text-primary" />
            </div>

            {/* Title */}
            <h1 className="mb-3 text-farmer-2xl font-bold text-foreground">
              {t("selectLanguage")}
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-xs text-farmer-base text-muted-foreground">
              {t("choosePreferredLanguage")}
            </p>

            {/* Language Buttons */}
            <div className="flex w-full max-w-xs flex-col gap-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "outline"}
                  size="xl"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full justify-between gap-3 ${
                    language === lang.code 
                      ? "border-2 border-primary" 
                      : "border-2 border-border"
                  }`}
                >
                  <span className="text-farmer-lg">{lang.native}</span>
                  {lang.code !== "en" && (
                    <span className="text-farmer-sm opacity-70">({lang.label})</span>
                  )}
                </Button>
              ))}
            </div>

            {/* Continue Button */}
            <Button
              variant="hero"
              size="xl"
              onClick={handleContinueToProfile}
              className="mt-8 w-full max-w-xs"
            >
              {t("continue")}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center border-t border-border bg-muted/30 py-4">
          <p className="text-farmer-sm text-muted-foreground">
            {t("madeForFarmers")}
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Profile Setup
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

          {/* Location Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <MapPin className="h-5 w-5 text-primary" />
              {t("enterCityDistrict")} {t("required")}
            </Label>
            <Input
              placeholder={t("cityPlaceholder")}
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="h-14 text-farmer-lg"
            />
            <button
              type="button"
              onClick={() => {
                setIsGPSLoading(true);
                setTimeout(() => {
                  setProfile({ ...profile, location: "Hyderabad, Telangana" });
                  setIsGPSLoading(false);
                }, 1500);
              }}
              disabled={isGPSLoading}
              className="flex items-center gap-2 text-farmer-sm text-primary hover:underline"
            >
              <Navigation className={`h-4 w-4 ${isGPSLoading ? "animate-pulse" : ""}`} />
              {isGPSLoading ? t("detectingLocation") : t("useGPSLocation")}
            </button>
          </div>

          {/* Village Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <MapPin className="h-5 w-5 text-primary" />
              {t("villageDistrict")} {t("optional")}
            </Label>
            <Input
              placeholder={t("enterVillageDistrict")}
              value={profile.village}
              onChange={(e) => setProfile({ ...profile, village: e.target.value })}
              className="h-14 text-farmer-lg"
            />
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
              <SelectContent className="bg-card">
                {seasons.map((season) => (
                  <SelectItem key={season.value} value={season.value} className="text-farmer-lg py-3">
                    {season.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Farms Section */}
          <div className="space-y-4 pt-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Tractor className="h-5 w-5 text-primary" />
              {t("myFarms")} {t("required")}
            </Label>

            {profile.farms.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                <Tractor className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-farmer-base text-muted-foreground">
                  {t("noFarmsYet")}
                </p>
                <p className="text-farmer-sm text-muted-foreground/70">
                  {t("addFirstFarm")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.farms.map((farm) => (
                  <FarmCard
                    key={farm.id}
                    farm={farm}
                    onDelete={handleDeleteFarm}
                    cropLabels={cropLabels}
                    sizeLabels={sizeLabels}
                  />
                ))}
              </div>
            )}

            <AddFarmDialog
              onAdd={handleAddFarm}
              crops={crops}
              farmSizes={farmSizes}
            />
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
          disabled={!isFormValid || isSaving}
          className="w-full"
        >
          {isSaving ? t("pleaseWait") : t("saveAndContinue")}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
