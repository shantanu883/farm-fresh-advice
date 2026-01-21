import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Globe } from "lucide-react";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

const Welcome = () => {
  const navigate = useNavigate();

  const handleLanguageSelect = (langCode: string) => {
    localStorage.setItem("selectedLanguage", langCode);
    navigate("/onboarding");
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
          <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-primary shadow-elevated">
            <Sprout className="h-14 w-14 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="mb-3 text-farmer-3xl font-bold text-foreground">
            Smart Crop Advisory
          </h1>

          {/* Tagline */}
          <p className="mb-10 max-w-xs text-farmer-lg text-muted-foreground">
            Daily farming decisions using weather
          </p>

          {/* Language Selection */}
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <Globe className="h-5 w-5" />
            <span className="text-farmer-base font-medium">Select Language</span>
          </div>

          {/* Language Buttons */}
          <div className="flex w-full max-w-xs flex-col gap-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="secondary"
                size="xl"
                onClick={() => handleLanguageSelect(lang.code)}
                className="w-full justify-center gap-3 border-2 border-border"
              >
                <span className="text-farmer-lg">{lang.native}</span>
                {lang.code !== "en" && (
                  <span className="text-farmer-sm opacity-70">({lang.label})</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-16 items-center justify-center border-t border-border bg-muted/30">
        <p className="text-farmer-sm text-muted-foreground">
          Made for farmers 🌾
        </p>
      </div>
    </div>
  );
};

export default Welcome;
