import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WeatherAlert } from '@/hooks/usePushNotifications';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
  onDismiss?: (alertType: string) => void;
}

const WeatherAlertBanner = ({ alerts, onDismiss }: WeatherAlertBannerProps) => {
  const { t } = useLanguage();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Load dismissed alerts from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const dismissed = localStorage.getItem(`dismissed_alerts_${today}`);
    if (dismissed) {
      setDismissedAlerts(new Set(JSON.parse(dismissed)));
    }
  }, []);

  const handleDismiss = (alertType: string) => {
    const today = new Date().toDateString();
    const newDismissed = new Set(dismissedAlerts).add(alertType);
    setDismissedAlerts(newDismissed);
    localStorage.setItem(`dismissed_alerts_${today}`, JSON.stringify([...newDismissed]));
    onDismiss?.(alertType);
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.type));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.type}
          className={`relative rounded-xl p-4 ${
            alert.severity === 'danger' 
              ? 'bg-destructive/10 border border-destructive/20' 
              : 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
          }`}
        >
          <button
            onClick={() => handleDismiss(alert.type)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-start gap-3 pr-6">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              alert.severity === 'danger' 
                ? 'bg-destructive/20' 
                : 'bg-amber-100 dark:bg-amber-800'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                alert.severity === 'danger' 
                  ? 'text-destructive' 
                  : 'text-amber-600 dark:text-amber-400'
              }`} />
            </div>
            <div>
              <h4 className={`font-semibold text-farmer-base ${
                alert.severity === 'danger' 
                  ? 'text-destructive' 
                  : 'text-amber-800 dark:text-amber-200'
              }`}>
                {alert.title}
              </h4>
              <p className={`text-farmer-sm mt-1 ${
                alert.severity === 'danger' 
                  ? 'text-destructive/80' 
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {alert.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherAlertBanner;
