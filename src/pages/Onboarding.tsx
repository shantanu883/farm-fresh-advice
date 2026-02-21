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
import { User, MapPin, Calendar, Info, Tractor, Navigation } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Farm, FarmerProfile } from "@/types/farm";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import FarmCard from "@/components/FarmCard";
import AddFarmDialog from "@/components/AddFarmDialog";
import { toast } from "sonner";
import { Geolocation } from "@capacitor/geolocation"; // ✅ ADDED

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { saveProfile } = useFarmerProfile();
  const [isGPSLoading, setIsGPSLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<FarmerProfile>({
    name: "",
    location: "",
    village: "",
    farms: [],
    farmingSeason: "",
  });

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
        toast.error("Failed to save profile.");
      } else {
        toast.success("Profile saved successfully!");
        navigate("/");
      }
    } catch (err) {
      toast.error("Unexpected error");
    } finally {
      setIsSaving(false);
    }
  };

  const getLocationFromGPS = async () => {
    try {
      setIsGPSLoading(true);

      const permission = await Geolocation.requestPermissions();

      if (permission.location !== "granted") {
        toast.error("Location permission denied");
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { "User-Agent": "FarmAdvisoryApp/1.0" } }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};

        const locality =
          address.village ||
          address.town ||
          address.city ||
          address.county ||
          address.state ||
          "";

        setProfile({
          ...profile,
          location:
            locality ||
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });

        localStorage.setItem(
          "userGeoLocation",
          JSON.stringify({ lat: latitude, lon: longitude })
        );
      } else {
        setProfile({
          ...profile,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      }
    } catch (error) {
      console.error("GPS Error:", error);
      toast.error("Unable to get location");
    } finally {
      setIsGPSLoading(false);
    }
  };

  const isFormValid =
    profile.location && profile.farms.length > 0 && profile.farmingSeason;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b bg-card px-6 py-6">
        <h1 className="text-xl font-bold">{t("welcomeFarmer")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("tellUsAboutFarm")}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto max-w-md space-y-6">

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t("enterCityDistrict")}
            </Label>

            <Input
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
            />

            <button
              type="button"
              onClick={getLocationFromGPS}  // ✅ UPDATED
              disabled={isGPSLoading}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Navigation
                className={`h-4 w-4 ${
                  isGPSLoading ? "animate-pulse" : ""
                }`}
              />
              {isGPSLoading
                ? "Detecting..."
                : t("useGPSLocation")}
            </button>
          </div>

          <AddFarmDialog onAdd={handleAddFarm} crops={[]} farmSizes={[]} />

          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
