import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Sun, CloudSun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/5" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo/Icon */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-primary shadow-elevated">
                <Sprout className="h-14 w-14 text-primary-foreground" />
              </div>
              <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent shadow-card">
                <Sun className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-farmer-3xl font-bold text-foreground">
            {t("appName")}
          </h1>

          {/* Tagline */}
          <p className="mb-10 max-w-xs text-farmer-lg text-muted-foreground">
            {t("tagline")}
          </p>

          {/* Weather decoration */}
          <div className="mb-10 flex items-center gap-2 rounded-full bg-muted px-6 py-3">
            <CloudSun className="h-6 w-6 text-secondary" />
            <span className="text-farmer-base font-medium text-foreground">
              {t("weatherPoweredGuidance")}
            </span>
          </div>

          {/* CTA Button */}
          <Button 
            variant="hero" 
            size="xl"
            onClick={() => navigate("/location")}
            className="w-full max-w-xs animate-fade-in"
          >
            {t("getTodaysAdvice")}
          </Button>
        </div>
      </div>

      {/* Footer decoration */}
      <div className="flex h-20 items-center justify-center border-t border-border bg-muted/30">
        <p className="text-farmer-sm text-muted-foreground">
          {t("madeForFarmers")}
        </p>
      </div>
    </div>
  );
};

export default Home;
