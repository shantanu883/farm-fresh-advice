import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description?: string;
  icon?: string;
  windSpeed?: number;
  location?: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  location: GeoLocation | null;
  locationName: string;
  isLoading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  requestLocation: () => Promise<void>;
}

export const useWeather = (): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { lat, lon }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch weather');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setWeather({
        temperature: data.temperature,
        humidity: data.humidity,
        rainfall: data.rainfall,
        description: data.description,
        icon: data.icon,
        windSpeed: data.windSpeed,
      });
      setLocationName(data.location || '');
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          await fetchWeather(latitude, longitude);
          resolve();
        },
        (err) => {
          console.error('Geolocation error:', err);
          let errorMessage = 'Unable to get your location';
          if (err.code === err.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied. Please enable location access.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information is unavailable.';
          } else if (err.code === err.TIMEOUT) {
            errorMessage = 'Location request timed out.';
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache location for 5 minutes
        }
      );
    });
  }, [fetchWeather]);

  const refreshWeather = useCallback(async () => {
    if (location) {
      await fetchWeather(location.lat, location.lon);
    } else {
      await requestLocation();
    }
  }, [location, fetchWeather, requestLocation]);

  // Auto-fetch weather on mount if we have cached location
  useEffect(() => {
    const cachedLocation = localStorage.getItem('userGeoLocation');
    if (cachedLocation) {
      try {
        const { lat, lon } = JSON.parse(cachedLocation);
        setLocation({ lat, lon });
        fetchWeather(lat, lon);
      } catch (e) {
        console.error('Error parsing cached location:', e);
      }
    }
  }, [fetchWeather]);

  // Cache location when it changes
  useEffect(() => {
    if (location) {
      localStorage.setItem('userGeoLocation', JSON.stringify(location));
    }
  }, [location]);

  return {
    weather,
    location,
    locationName,
    isLoading,
    error,
    refreshWeather,
    requestLocation,
  };
};
