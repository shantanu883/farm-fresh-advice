import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ForecastDay {
  date: string;
  dayName: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon: string;
  windSpeed: number;
}

// Map Open-Meteo weather codes to descriptions and icons
const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '01d' },
  1: { description: 'Mainly clear', icon: '02d' },
  2: { description: 'Partly cloudy', icon: '03d' },
  3: { description: 'Overcast', icon: '04d' },
  45: { description: 'Foggy', icon: '50d' },
  48: { description: 'Depositing rime fog', icon: '50d' },
  51: { description: 'Light drizzle', icon: '09d' },
  53: { description: 'Moderate drizzle', icon: '09d' },
  55: { description: 'Dense drizzle', icon: '09d' },
  56: { description: 'Light freezing drizzle', icon: '09d' },
  57: { description: 'Dense freezing drizzle', icon: '09d' },
  61: { description: 'Slight rain', icon: '10d' },
  63: { description: 'Moderate rain', icon: '10d' },
  65: { description: 'Heavy rain', icon: '10d' },
  66: { description: 'Light freezing rain', icon: '13d' },
  67: { description: 'Heavy freezing rain', icon: '13d' },
  71: { description: 'Slight snow', icon: '13d' },
  73: { description: 'Moderate snow', icon: '13d' },
  75: { description: 'Heavy snow', icon: '13d' },
  77: { description: 'Snow grains', icon: '13d' },
  80: { description: 'Slight rain showers', icon: '09d' },
  81: { description: 'Moderate rain showers', icon: '09d' },
  82: { description: 'Violent rain showers', icon: '09d' },
  85: { description: 'Slight snow showers', icon: '13d' },
  86: { description: 'Heavy snow showers', icon: '13d' },
  95: { description: 'Thunderstorm', icon: '11d' },
  96: { description: 'Thunderstorm with slight hail', icon: '11d' },
  99: { description: 'Thunderstorm with heavy hail', icon: '11d' },
};

function getWeatherInfo(code: number): { description: string; icon: string } {
  return weatherCodeMap[code] || { description: 'Unknown', icon: '01d' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current weather and forecast from Open-Meteo (no API key needed!)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,relative_humidity_2m_max&timezone=auto&forecast_days=6`;
    
    console.log('Fetching weather from Open-Meteo...');

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      console.error('Open-Meteo API error:', weatherData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse current weather
    const currentWeather = weatherData.current;
    const currentWeatherInfo = getWeatherInfo(currentWeather.weather_code);

    // Parse daily forecast (skip today, get next 5 days)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const forecast: ForecastDay[] = [];
    
    if (weatherData.daily) {
      const daily = weatherData.daily;
      // Start from index 1 to skip today
      for (let i = 1; i < Math.min(daily.time.length, 6); i++) {
        const date = new Date(daily.time[i]);
        const weatherInfo = getWeatherInfo(daily.weather_code[i]);
        
        forecast.push({
          date: daily.time[i],
          dayName: dayNames[date.getDay()],
          temperature: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          tempMax: Math.round(daily.temperature_2m_max[i]),
          humidity: Math.round(daily.relative_humidity_2m_max[i] || 50),
          rainfall: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
          description: weatherInfo.description,
          icon: weatherInfo.icon,
          windSpeed: Math.round((daily.wind_speed_10m_max[i] || 0) * 10) / 10,
        });
      }
    }

    // Get location name using reverse geocoding
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    let locationName = 'Unknown Location';
    
    try {
      const geoResponse = await fetch(geoUrl, {
        headers: { 'User-Agent': 'FarmAdvisoryApp/1.0' }
      });
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county;
        const state = geoData.address?.state;
        if (city && state) {
          locationName = `${city}, ${state}`;
        } else if (city) {
          locationName = city;
        } else if (state) {
          locationName = state;
        }
      }
    } catch (geoError) {
      console.error('Geocoding error (non-fatal):', geoError);
    }

    const result = {
      current: {
        temperature: Math.round(currentWeather.temperature_2m),
        humidity: currentWeather.relative_humidity_2m,
        rainfall: currentWeather.precipitation || 0,
        description: currentWeatherInfo.description,
        icon: currentWeatherInfo.icon,
        windSpeed: Math.round((currentWeather.wind_speed_10m || 0) * 10) / 10,
      },
      forecast,
      location: locationName,
    };

    console.log('Weather data fetched successfully with', forecast.length, 'forecast days');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
