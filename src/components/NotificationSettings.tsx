import { Bell, BellOff, BellRing, Check, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useLanguage } from '@/contexts/LanguageContext';

const NotificationSettings = () => {
  const { t } = useLanguage();
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    requestPermission 
  } = usePushNotifications();

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  if (!isSupported) {
    return (
      <Card className="card-elevated p-5">
        <div className="mb-3 flex items-center gap-3">
          <BellOff className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-farmer-lg font-semibold text-foreground">
            {t('notifications')}
          </h2>
        </div>
        <p className="text-farmer-base text-muted-foreground">
          {t('notificationsNotSupported')}
        </p>
      </Card>
    );
  }

  return (
    <Card className="card-elevated p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isSubscribed ? 'bg-primary/20' : 'bg-accent/20'
        }`}>
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5 text-accent" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-farmer-lg font-semibold text-foreground">
            {t('weatherAlerts')}
          </h2>
          <p className="text-farmer-sm text-muted-foreground">
            {isSubscribed ? t('alertsEnabled') : t('alertsDisabled')}
          </p>
        </div>
        {isSubscribed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>

      {!isSubscribed && (
        <>
          <p className="mb-4 text-farmer-base text-muted-foreground">
            {t('alertsDescription')}
          </p>
          
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>🌧️</span>
              <span>{t('heavyRainAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>❄️</span>
              <span>{t('frostAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>🔥</span>
              <span>{t('heatAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>💨</span>
              <span>{t('windAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>💧</span>
              <span>{t('highHumidityAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>🦠</span>
              <span>{t('diseaseRiskAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>🐛</span>
              <span>{t('pestActivityAlert')}</span>
            </div>
            <div className="flex items-center gap-2 text-farmer-sm text-muted-foreground">
              <span>💦</span>
              <span>{t('irrigationAdvisoryAlert')}</span>
            </div>
          </div>

          <Button 
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="w-full h-12 text-farmer-base"
          >
            {isLoading ? t('enabling') : t('enableAlerts')}
          </Button>
          
          {permission === 'denied' && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-farmer-sm text-destructive">
                {t('notificationsDenied')}
              </p>
            </div>
          )}
        </>
      )}

      {isSubscribed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">🌧️ {t('heavyRainAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">❄️ {t('frostAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">🔥 {t('heatAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">💨 {t('windAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">💧 {t('highHumidityAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">🦠 {t('diseaseRiskAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">🐛 {t('pestActivityAlert')}</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-farmer-base">💦 {t('irrigationAdvisoryAlert')}</span>
            <Switch checked disabled />
          </div>
        </div>
      )}
    </Card>
  );
};

export default NotificationSettings;
