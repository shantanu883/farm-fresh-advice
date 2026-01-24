import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BottomNavigation from "@/components/BottomNavigation";
import { Settings as SettingsIcon, Globe, WifiOff, Info, Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n/translations";
import NotificationSettings from "@/components/NotificationSettings";

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();

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
