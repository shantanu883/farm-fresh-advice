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

    const apiKey = (Deno.env.get('OPENWEATHERMAP_API_KEY') ?? '').trim();
    if (!apiKey) {
      console.error('OPENWEATHERMAP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Weather API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    console.log('Fetching current weather...');

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      console.error('OpenWeatherMap API error:', weatherData);
      if (weatherResponse.status === 401) {
        return new Response(
          JSON.stringify({
            error: 'Weather API key is invalid or not activated yet. Please verify the key and wait up to ~2 hours after creating it.',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch 5-day forecast (returns 3-hour intervals, 40 data points)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    console.log('Fetching 5-day forecast...');
    
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    let forecast: ForecastDay[] = [];
    
    if (forecastResponse.ok && forecastData.list) {
      // Group forecast by day and calculate daily averages
      const dailyData: Record<string, { temps: number[], tempMins: number[], tempMaxs: number[], humidities: number[], rainfalls: number[], descriptions: string[], icons: string[], windSpeeds: number[] }> = {};
      
      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { temps: [], tempMins: [], tempMaxs: [], humidities: [], rainfalls: [], descriptions: [], icons: [], windSpeeds: [] };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].tempMins.push(item.main.temp_min);
        dailyData[dateKey].tempMaxs.push(item.main.temp_max);
        dailyData[dateKey].humidities.push(item.main.humidity);
        dailyData[dateKey].rainfalls.push(item.rain?.['3h'] || 0);
        dailyData[dateKey].descriptions.push(item.weather?.[0]?.description || '');
        dailyData[dateKey].icons.push(item.weather?.[0]?.icon || '01d');
        dailyData[dateKey].windSpeeds.push(item.wind?.speed || 0);
      }

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date().toISOString().split('T')[0];
      
      forecast = Object.entries(dailyData)
        .filter(([dateKey]) => dateKey !== today) // Exclude today
        .slice(0, 5) // Max 5 days
        .map(([dateKey, data]) => {
          const date = new Date(dateKey);
          const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
          const mostCommon = (arr: string[]) => arr.sort((a, b) => 
            arr.filter(v => v === a).length - arr.filter(v => v === b).length
          ).pop() || '';
          
          return {
            date: dateKey,
            dayName: dayNames[date.getDay()],
            temperature: Math.round(avg(data.temps)),
            tempMin: Math.round(Math.min(...data.tempMins)),
            tempMax: Math.round(Math.max(...data.tempMaxs)),
            humidity: Math.round(avg(data.humidities)),
            rainfall: Math.round(data.rainfalls.reduce((a, b) => a + b, 0) * 10) / 10,
            description: mostCommon(data.descriptions),
            icon: mostCommon(data.icons),
            windSpeed: Math.round(avg(data.windSpeeds) * 10) / 10,
          };
        });
    }

    // Get location name
    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    const locationName = geoResponse.ok && geoData?.[0]
      ? `${geoData[0].name}, ${geoData[0].state || geoData[0].country}`
      : 'Unknown Location';

    const result = {
      current: {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        rainfall: weatherData.rain?.['1h'] || weatherData.rain?.['3h'] || 0,
        description: weatherData.weather?.[0]?.description || '',
        icon: weatherData.weather?.[0]?.icon || '',
        windSpeed: weatherData.wind?.speed || 0,
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
