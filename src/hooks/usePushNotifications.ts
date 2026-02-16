import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface WeatherAlert {
  type: 'heavy_rain' | 'frost' | 'heat' | 'strong_wind' | 'high_humidity' | 'disease_risk' | 'pest_alert' | 'irrigation_advisory';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  recommendation?: string;
  action?: string;
  timestamp?: number;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  checkWeatherAlerts: (forecast: any[], currentWeather?: any) => WeatherAlert[];
  showLocalNotification: (alert: WeatherAlert) => void;
  getAlertHistory: () => WeatherAlert[];
  clearAlertHistory: () => void;
}

// Weather thresholds for alerts
const THRESHOLDS = {
  HEAVY_RAIN_MM: 20,
  FROST_TEMP_C: 5,
  HEAT_TEMP_C: 40,
  STRONG_WIND_KMH: 40,
  HIGH_HUMIDITY_PERCENT: 85,
  LOW_RAINFALL_MM: 5,
};

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { t, language } = useLanguage();
  
  const isSupported = typeof window !== 'undefined' && 
    'Notification' in window && 
    'serviceWorker' in navigator;

  // Check current permission status
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Check if already subscribed
      const subscribed = localStorage.getItem('pushNotificationsEnabled') === 'true';
      setIsSubscribed(subscribed && Notification.permission === 'granted');
    }
  }, [isSupported]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      setSwRegistration(registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, []);

  // On mount, try to obtain an existing service worker registration (useful
  // when permission was granted in a previous session). This ensures we can
  // use `registration.showNotification` even if the hook wasn't the one that
  // registered the SW in this session.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    (async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistration();
        if (existing) {
          setSwRegistration(existing);
          console.log('Found existing SW registration in hook:', existing);
          return;
        }

        // Fallback to ready registration (waits until SW active)
        const ready = await navigator.serviceWorker.ready;
        if (ready) {
          setSwRegistration(ready);
          console.log('Service worker ready, set registration in hook');
        }
      } catch (e) {
        console.warn('Could not get existing service worker registration', e);
      }
    })();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    
    try {
      // Register service worker first
      await registerServiceWorker();
      
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setIsSubscribed(true);
        localStorage.setItem('pushNotificationsEnabled', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registerServiceWorker]);

  // Check forecast for weather alerts
  const checkWeatherAlerts = useCallback((forecast: any[], currentWeather?: any): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];
    
    if (!forecast || forecast.length === 0) return alerts;
    
    const today = new Date();
    const daysToCheck = forecast.slice(0, 3);
    
    for (const day of daysToCheck) {
      // Heavy rain check
      if (day.rainfall >= THRESHOLDS.HEAVY_RAIN_MM) {
        alerts.push({
          type: 'heavy_rain',
          title: `🌧️ ${t('heavyRainAlert')}`,
          message: `${t('heavyRainfallWarning')} (${day.rainfall}mm on ${day.dayName})`,
          recommendation: t('alertRecommendation') || 'Avoid irrigation, ensure proper drainage',
          action: t('alertAction') || 'Prepare drainage channels and cover vulnerable crops',
          severity: 'warning'
        });
      }
      
      // Frost/cold check
      if (day.tempMin <= THRESHOLDS.FROST_TEMP_C) {
        alerts.push({
          type: 'frost',
          title: `❄️ ${t('frostAlert')}`,
          message: `${t('frostAlert')} - ${day.tempMin}°C on ${day.dayName}`,
          recommendation: t('alertRecommendation') || 'Cover crops, use frost protection cloth',
          action: t('alertAction') || 'Apply protective measures before sunset',
          severity: 'danger'
        });
      }
      
      // Heat check
      if (day.tempMax >= THRESHOLDS.HEAT_TEMP_C) {
        alerts.push({
          type: 'heat',
          title: `🔥 ${t('heatAlert')}`,
          message: `${t('heatAlert')} - ${day.tempMax}°C on ${day.dayName}`,
          recommendation: t('alertRecommendation') || 'Increase irrigation frequency, provide shade',
          action: t('alertAction') || 'Water early morning and evening',
          severity: 'danger'
        });
      }
      
      // Strong wind check
      const windSpeedKmh = day.windSpeed * 3.6;
      if (windSpeedKmh >= THRESHOLDS.STRONG_WIND_KMH) {
        alerts.push({
          type: 'strong_wind',
          title: `💨 ${t('windAlert')}`,
          message: `${t('windAlert')} - ${Math.round(windSpeedKmh)} km/h on ${day.dayName}`,
          recommendation: t('alertRecommendation') || 'Suspend spraying, secure structures',
          action: t('alertAction') || 'Tie up climbing crops',
          severity: 'warning'
        });
      }
      
      // High humidity check (disease risk)
      if (day.humidity >= THRESHOLDS.HIGH_HUMIDITY_PERCENT) {
        alerts.push({
          type: 'disease_risk',
          title: `🦠 ${t('diseaseRiskAlert')}`,
          message: `${t('diseaseRiskAlert')} - ${day.humidity}% on ${day.dayName}`,
          recommendation: t('alertRecommendation') || 'Improve air circulation, apply fungicide preventively',
          action: t('alertAction') || 'Scout fields for disease signs',
          severity: 'warning'
        });
      }
      
      // Low rainfall warning
      if (day.rainfall < THRESHOLDS.LOW_RAINFALL_MM && day.rainfall > 0) {
        alerts.push({
          type: 'irrigation_advisory',
          title: `💧 ${t('irrigationAdvisoryAlert')}`,
          message: `${t('irrigationAdvisoryAlert')} - ${day.rainfall}mm on ${day.dayName}`,
          recommendation: t('alertRecommendation') || 'Schedule irrigation, check soil moisture',
          action: t('alertAction') || 'Arrange water supply',
          severity: 'info'
        });
      }
      
      // Pest alert based on temperature and humidity
      if (day.tempMax >= 25 && day.humidity >= 70) {
        alerts.push({
          type: 'pest_alert',
          title: `🐛 ${t('pestActivityAlert')}`,
          message: `${t('pestActivityAlert')} (${day.tempMax}°C, ${day.humidity}% humidity).`,
          recommendation: t('preventiveMeasures') || 'Monitor crops, use IPM',
          action: t('alertAction') || 'Scout field for pests',
          severity: 'warning'
        });
      }
    }
    
    // Remove duplicates by type (keep first occurrence)
    const uniqueAlerts = alerts.filter((alert, index, self) => 
      index === self.findIndex(a => a.type === alert.type)
    );
    
    return uniqueAlerts;
  }, []);

  // Show local notification
  const showLocalNotification = useCallback(async (alert: WeatherAlert) => {
    if (permission !== 'granted') return;

    // Check if we've already shown this alert today
    const alertKey = `alert_${alert.type}_${new Date().toDateString()}`;
    if (localStorage.getItem(alertKey)) return;

    const body = `${alert.message}${alert.recommendation ? ` - ${alert.recommendation}` : ''}`;

    try {
      // If service worker registration exists, use it to show notification (better on mobile/background)
      if (swRegistration) {
        await swRegistration.showNotification(alert.title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: alert.type,
          requireInteraction: true,
          data: { url: '/advisory' }
        });
      } else {
        const notification = new Notification(alert.title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: alert.type,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Mark as shown and save to history
      localStorage.setItem(alertKey, 'true');

      const history = getAlertHistory();
      const newAlert = { ...alert, timestamp: Date.now() };
      history.unshift(newAlert);
      const limitedHistory = history.slice(0, 30);
      localStorage.setItem('alertHistory', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission, swRegistration, t]);

  // Get alert history
  const getAlertHistory = useCallback((): WeatherAlert[] => {
    try {
      const history = localStorage.getItem('alertHistory');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }, []);

  // Clear alert history
  const clearAlertHistory = useCallback((): void => {
    localStorage.removeItem('alertHistory');
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    checkWeatherAlerts,
    showLocalNotification,
    getAlertHistory,
    clearAlertHistory,
  };
};
