import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Globe, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n/translations";

const languages: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "or", label: "Odia", native: "ଓଡିଆ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
  };

  const handleContinue = () => {
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/5" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-elevated">
            <Sprout className="h-12 w-12 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-farmer-2xl font-bold text-foreground">
            {t("appName")}
          </h1>

          {/* Tagline */}
          <p className="mb-8 max-w-xs text-farmer-base text-muted-foreground">
            {t("tagline")}
          </p>

          {/* Language Selection */}
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <Globe className="h-5 w-5" />
            <span className="text-farmer-base font-medium">{t("selectLanguage")}</span>
          </div>

          {/* Language Buttons */}
          <div className="flex w-full max-w-xs flex-col gap-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                size="xl"
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full justify-between ${
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
            onClick={handleContinue}
            className="mt-8 w-full max-w-xs"
          >
            {t("continue")}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-16 items-center justify-center border-t border-border bg-muted/30">
        <p className="text-farmer-sm text-muted-foreground">
          {t("madeForFarmers")}
        </p>
      </div>
    </div>
  );
};

export default Welcome;
