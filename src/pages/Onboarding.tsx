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

const crops = ["Rice", "Wheat", "Cotton", "Tomato"];
const soilTypes = ["Black", "Red", "Sandy", "Alluvial"];
const seasons = ["Kharif", "Rabi", "Zaid"];
const farmSizes = ["Small", "Medium", "Large"];

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
  const [profile, setProfile] = useState<FarmerProfile>({
    name: "",
    village: "",
    primaryCrop: "",
    soilType: "",
    farmingSeason: "",
    farmSize: "",
  });

  const handleSave = () => {
    // Store farmer profile locally
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
          Welcome, Farmer! 👨‍🌾
        </h1>
        <p className="mt-1 text-farmer-base text-muted-foreground">
          Tell us about your farm
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto max-w-md space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <User className="h-5 w-5 text-primary" />
              Your Name (Optional)
            </Label>
            <Input
              placeholder="Enter your name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="h-14 text-farmer-lg"
            />
          </div>

          {/* Village Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <MapPin className="h-5 w-5 text-primary" />
              Village / District *
            </Label>
            <Input
              placeholder="Enter your village or district"
              value={profile.village}
              onChange={(e) => setProfile({ ...profile, village: e.target.value })}
              className="h-14 text-farmer-lg"
            />
          </div>

          {/* Primary Crop */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Wheat className="h-5 w-5 text-primary" />
              Primary Crop *
            </Label>
            <Select
              value={profile.primaryCrop}
              onValueChange={(value) => setProfile({ ...profile, primaryCrop: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder="Select your main crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop} className="text-farmer-lg py-3">
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Soil Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Mountain className="h-5 w-5 text-primary" />
              Soil Type *
            </Label>
            <Select
              value={profile.soilType}
              onValueChange={(value) => setProfile({ ...profile, soilType: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((soil) => (
                  <SelectItem key={soil} value={soil} className="text-farmer-lg py-3">
                    {soil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Farming Season */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Calendar className="h-5 w-5 text-primary" />
              Farming Season *
            </Label>
            <Select
              value={profile.farmingSeason}
              onValueChange={(value) => setProfile({ ...profile, farmingSeason: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season} className="text-farmer-lg py-3">
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Farm Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Ruler className="h-5 w-5 text-primary" />
              Farm Size (Optional)
            </Label>
            <Select
              value={profile.farmSize}
              onValueChange={(value) => setProfile({ ...profile, farmSize: value })}
            >
              <SelectTrigger className="h-14 text-farmer-lg">
                <SelectValue placeholder="Select farm size" />
              </SelectTrigger>
              <SelectContent>
                {farmSizes.map((size) => (
                  <SelectItem key={size} value={size} className="text-farmer-lg py-3">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-farmer-sm text-muted-foreground">
              This information helps provide accurate farming advice tailored to your needs. Your data stays on your device.
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
          Save & Continue
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
