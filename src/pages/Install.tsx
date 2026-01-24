import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Smartphone, Share, ArrowLeft, Check, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: "🌤️", text: "Real-time weather updates" },
    { icon: "🌾", text: "AI-powered farming advice" },
    { icon: "📱", text: "Works offline" },
    { icon: "🔔", text: "Weather alerts" },
    { icon: "🗣️", text: "Voice support in Hindi & Marathi" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 px-4 pb-8 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("appName")}</h1>
            <p className="text-white/80 text-sm mt-1">Install for the best experience</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {isInstalled ? (
          <Card className="p-6 text-center card-elevated border-primary/20 bg-primary/5">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/20 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Already Installed!</h2>
            <p className="text-muted-foreground">
              You can find the app on your home screen.
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate("/")}>
              Open App
            </Button>
          </Card>
        ) : (
          <>
            {/* Install Card */}
            <Card className="p-6 card-elevated border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Install App</h2>
                  <p className="text-sm text-muted-foreground">Add to home screen</p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To install on iPhone/iPad:
                  </p>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                      <span>Tap the <Share className="inline h-4 w-4" /> Share button in Safari</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                      <span>Scroll down and tap "Add to Home Screen"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                      <span>Tap "Add" in the top right corner</span>
                    </li>
                  </ol>
                </div>
              ) : deferredPrompt ? (
                <Button 
                  className="w-full btn-glow-primary" 
                  size="lg"
                  onClick={handleInstall}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install Now
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To install on Android:
                  </p>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                      <span>Tap the menu (⋮) in your browser</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                      <span>Tap "Install app" or "Add to Home Screen"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                      <span>Tap "Install" to confirm</span>
                    </li>
                  </ol>
                </div>
              )}
            </Card>

            {/* Features */}
            <Card className="p-6 card-elevated border-0">
              <h3 className="font-bold text-foreground mb-4">Why install?</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => navigate("/")}
        >
          Continue in Browser
        </Button>
      </div>
    </div>
  );
};

export default Install;