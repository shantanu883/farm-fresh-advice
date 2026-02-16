import { useState, useEffect, useCallback } from 'react';

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
          title: '🌧️ Heavy Rain Warning',
          message: `Heavy rainfall of ${day.rainfall}mm expected on ${day.dayName}. This may cause waterlogging and crop damage.`,
          recommendation: 'Avoid irrigation, ensure proper drainage, delay pesticide application',
          action: 'Prepare drainage channels and cover vulnerable crops',
          severity: 'warning'
        });
      }
      
      // Frost/cold check
      if (day.tempMin <= THRESHOLDS.FROST_TEMP_C) {
        alerts.push({
          type: 'frost',
          title: '❄️ Frost Warning',
          message: `Temperature dropping to ${day.tempMin}°C on ${day.dayName}. Risk of crop damage from frost.`,
          recommendation: 'Cover crops, use frost protection cloth, increase irrigation',
          action: 'Apply protective measures before sunset',
          severity: 'danger'
        });
      }
      
      // Heat check
      if (day.tempMax >= THRESHOLDS.HEAT_TEMP_C) {
        alerts.push({
          type: 'heat',
          title: '🔥 Heat Warning',
          message: `Extreme heat of ${day.tempMax}°C expected on ${day.dayName}. High risk of crop stress.`,
          recommendation: 'Increase irrigation frequency, provide shade, mulch soil',
          action: 'Water early morning and evening, check soil moisture daily',
          severity: 'danger'
        });
      }
      
      // Strong wind check
      const windSpeedKmh = day.windSpeed * 3.6;
      if (windSpeedKmh >= THRESHOLDS.STRONG_WIND_KMH) {
        alerts.push({
          type: 'strong_wind',
          title: '💨 Strong Wind Warning',
          message: `Strong winds of ${Math.round(windSpeedKmh)} km/h expected on ${day.dayName}.`,
          recommendation: 'Suspend spraying, secure structures, support tall crops',
          action: 'Tie up climbing crops, store loose materials safely',
          severity: 'warning'
        });
      }
      
      // High humidity check (disease risk)
      if (day.humidity >= THRESHOLDS.HIGH_HUMIDITY_PERCENT) {
        alerts.push({
          type: 'disease_risk',
          title: '🦠 Disease Risk Alert',
          message: `High humidity of ${day.humidity}% on ${day.dayName}. Increased risk of fungal diseases.`,
          recommendation: 'Improve air circulation, apply fungicide preventively, reduce irrigation',
          action: 'Scout fields for disease signs, apply fungicide if needed',
          severity: 'warning'
        });
      }
      
      // Low rainfall warning
      if (day.rainfall < THRESHOLDS.LOW_RAINFALL_MM && day.rainfall > 0) {
        alerts.push({
          type: 'irrigation_advisory',
          title: '💧 Low Rainfall - Irrigation Needed',
          message: `Only ${day.rainfall}mm rainfall expected on ${day.dayName}. Plan supplemental irrigation.`,
          recommendation: 'Schedule irrigation, increase water supply, check soil moisture',
          action: 'Arrange water supply and irrigation equipment',
          severity: 'info'
        });
      }
      
      // Pest alert based on temperature and humidity
      if (day.tempMax >= 25 && day.humidity >= 70) {
        alerts.push({
          type: 'pest_alert',
          title: '🐛 Pest Activity Alert',
          message: `Favorable conditions for pest multiplication (${day.tempMax}°C, ${day.humidity}% humidity).`,
          recommendation: 'Monitor crops closely, use integrated pest management, apply insecticides if needed',
          action: 'Scout field for pests, maintain crop hygiene',
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
        body: alert.message + (alert.recommendation ? ` - ${alert.recommendation}` : ''),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: alert.type,
        requireInteraction: true
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // Mark as shown and save to history
      localStorage.setItem(alertKey, 'true');
      
      // Save to alert history
      const history = getAlertHistory();
      const newAlert = { ...alert, timestamp: Date.now() };
      history.unshift(newAlert);
      // Keep only last 30 alerts
      const limitedHistory = history.slice(0, 30);
      localStorage.setItem('alertHistory', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

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
