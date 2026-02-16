import { AlertTriangle, X, ChevronDown } from 'lucide-react';
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
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-destructive/10 border border-destructive/20';
      case 'warning':
        return 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      default:
        return 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getSeverityIconColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-destructive/20 text-destructive';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-3 mb-4">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.type}
          className={`relative rounded-xl overflow-hidden transition-all ${getSeverityColor(alert.severity)}`}
        >
          <button
            onClick={() => handleDismiss(alert.type)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 z-10"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div 
            className="p-4 pr-10 cursor-pointer"
            onClick={() => setExpandedAlert(expandedAlert === alert.type ? null : alert.type)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getSeverityIconColor(alert.severity)}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-farmer-base ${
                  alert.severity === 'danger' 
                    ? 'text-destructive' 
                    : alert.severity === 'warning'
                    ? 'text-amber-800 dark:text-amber-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {alert.title}
                </h4>
                <p className={`text-farmer-sm mt-1 ${
                  alert.severity === 'danger' 
                    ? 'text-destructive/80' 
                    : alert.severity === 'warning'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {alert.message}
                </p>
              </div>
              {(alert.recommendation || alert.action) && (
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${
                  expandedAlert === alert.type ? 'rotate-180' : ''
                } mt-1`} />
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {expandedAlert === alert.type && (alert.recommendation || alert.action) && (
            <div className={`border-t ${
              alert.severity === 'danger'
                ? 'border-destructive/10 bg-destructive/5'
                : alert.severity === 'warning'
                ? 'border-amber-100 dark:border-amber-700 bg-amber-25 dark:bg-amber-900/10'
                : 'border-blue-100 dark:border-blue-700 bg-blue-25 dark:bg-blue-900/10'
            } px-4 py-3`}>
              {alert.recommendation && (
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    {t('alertRecommendation')}
                  </p>
                  <p className="text-farmer-sm text-foreground">{alert.recommendation}</p>
                </div>
              )}
              {alert.action && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    {t('alertAction')}
                  </p>
                  <p className="text-farmer-sm text-foreground flex items-center gap-2">
                    <span>💡</span>
                    {alert.action}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WeatherAlertBanner;
