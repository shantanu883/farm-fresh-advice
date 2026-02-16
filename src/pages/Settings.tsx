import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BottomNavigation from "@/components/BottomNavigation";
import { Settings as SettingsIcon, Globe, WifiOff, Info, Sprout, LogOut, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Language } from "@/i18n/translations";
import NotificationSettings from "@/components/NotificationSettings";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-farmer-2xl font-bold text-foreground">
          {t("settings")}
        </h1>
      </div>

      <div className="space-y-4">
        {/* Account Section */}
        <Card className="card-elevated p-5">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-farmer-lg font-semibold text-foreground">
              {t("account")}
            </h2>
          </div>
          <div className="space-y-4">
            {/* Email Display */}
            <div className="rounded-lg bg-muted p-3">
              <p className="text-farmer-sm text-muted-foreground">Email</p>
              <p className="text-farmer-base font-medium text-foreground">
                {user?.email}
              </p>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Language Selection */}
        <Card className="card-elevated p-5">
          <div className="mb-4 flex items-center gap-3">
            <Globe className="h-6 w-6 text-secondary" />
            <h2 className="text-farmer-lg font-semibold text-foreground">
              {t("language")}
            </h2>
          </div>
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger className="h-14 text-farmer-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en" className="text-farmer-base py-3">
                English
              </SelectItem>
              <SelectItem value="hi" className="text-farmer-base py-3">
                हिंदी (Hindi)
              </SelectItem>
              <SelectItem value="mr" className="text-farmer-base py-3">
                मराठी (Marathi)
              </SelectItem>
              <SelectItem value="ta" className="text-farmer-base py-3">
                தமிழ் (Tamil)
              </SelectItem>
              <SelectItem value="te" className="text-farmer-base py-3">
                తెలుగు (Telugu)
              </SelectItem>
              <SelectItem value="kn" className="text-farmer-base py-3">
                ಕನ್ನಡ (Kannada)
              </SelectItem>
              <SelectItem value="bn" className="text-farmer-base py-3">
                বাংলা (Bengali)
              </SelectItem>
              <SelectItem value="gu" className="text-farmer-base py-3">
                ગુજરાતી (Gujarati)
              </SelectItem>
              <SelectItem value="or" className="text-farmer-base py-3">
                ଓଡିଆ (Odia)
              </SelectItem>
              <SelectItem value="ml" className="text-farmer-base py-3">
                മലയാളം (Malayalam)
              </SelectItem>
              <SelectItem value="pa" className="text-farmer-base py-3">
                ਪੰਜਾਬੀ (Punjabi)
              </SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Offline Mode Info */}
        <Card className="card-elevated p-5">
          <div className="mb-3 flex items-center gap-3">
            <WifiOff className="h-6 w-6 text-accent" />
            <h2 className="text-farmer-lg font-semibold text-foreground">
              {t("offlineMode")}
            </h2>
          </div>
          <p className="text-farmer-base text-muted-foreground">
            {t("offlineModeInfo")}
          </p>
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-farmer-sm text-muted-foreground">
              {t("lastSynced")}
            </p>
          </div>
        </Card>

        {/* About Section */}
        <Card className="card-elevated p-5">
          <div className="mb-3 flex items-center gap-3">
            <Info className="h-6 w-6 text-primary" />
            <h2 className="text-farmer-lg font-semibold text-foreground">
              {t("about")}
            </h2>
          </div>
          <div className="space-y-3 text-farmer-base text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("appName")}</p>
                <p className="text-farmer-sm">{t("version")}</p>
              </div>
            </div>
            <p>
              {t("aboutDescription")}
            </p>
            <p className="text-farmer-sm">
              {t("developedWith")}
            </p>
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Settings;
