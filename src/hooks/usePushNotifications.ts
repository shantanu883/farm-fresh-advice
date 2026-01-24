import { useState, useEffect, useCallback } from 'react';

export interface WeatherAlert {
  type: 'heavy_rain' | 'frost' | 'heat' | 'strong_wind';
  title: string;
  message: string;
  severity: 'warning' | 'danger';
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  checkWeatherAlerts: (forecast: any[]) => WeatherAlert[];
  showLocalNotification: (alert: WeatherAlert) => void;
}

// Weather thresholds for alerts
const THRESHOLDS = {
  HEAVY_RAIN_MM: 20,
  FROST_TEMP_C: 5,
  HEAT_TEMP_C: 40,
  STRONG_WIND_KMH: 40, // ~11.1 m/s
};

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
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
  const checkWeatherAlerts = useCallback((forecast: any[]): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];
    
    if (!forecast || forecast.length === 0) return alerts;
    
    // Check next 3 days
    const daysToCheck = forecast.slice(0, 3);
    
    for (const day of daysToCheck) {
      // Heavy rain check
      if (day.rainfall >= THRESHOLDS.HEAVY_RAIN_MM) {
        alerts.push({
          type: 'heavy_rain',
          title: '🌧️ Heavy Rain Warning',
          message: `Heavy rainfall of ${day.rainfall}mm expected on ${day.dayName}. Avoid irrigation and protect crops.`,
          severity: 'warning'
        });
      }
      
      // Frost/cold check
      if (day.tempMin <= THRESHOLDS.FROST_TEMP_C) {
        alerts.push({
          type: 'frost',
          title: '❄️ Frost Warning',
          message: `Temperature dropping to ${day.tempMin}°C on ${day.dayName}. Protect sensitive crops from frost damage.`,
          severity: 'danger'
        });
      }
      
      // Heat check
      if (day.tempMax >= THRESHOLDS.HEAT_TEMP_C) {
        alerts.push({
          type: 'heat',
          title: '🔥 Heat Warning',
          message: `Extreme heat of ${day.tempMax}°C expected on ${day.dayName}. Increase irrigation and provide shade.`,
          severity: 'danger'
        });
      }
      
      // Strong wind check (convert m/s to km/h for display, but compare in m/s)
      const windSpeedKmh = day.windSpeed * 3.6;
      if (windSpeedKmh >= THRESHOLDS.STRONG_WIND_KMH) {
        alerts.push({
          type: 'strong_wind',
          title: '💨 Strong Wind Warning',
          message: `Strong winds of ${Math.round(windSpeedKmh)} km/h expected on ${day.dayName}. Secure structures and avoid spraying.`,
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
  const showLocalNotification = useCallback((alert: WeatherAlert) => {
    if (permission !== 'granted') return;
    
    // Check if we've already shown this alert today
    const alertKey = `alert_${alert.type}_${new Date().toDateString()}`;
    if (localStorage.getItem(alertKey)) return;
    
    try {
      const notification = new Notification(alert.title, {
        body: alert.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: alert.type,
        requireInteraction: true
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // Mark as shown
      localStorage.setItem(alertKey, 'true');
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    checkWeatherAlerts,
    showLocalNotification,
  };
};
