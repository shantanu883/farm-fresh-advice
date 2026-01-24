import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description?: string;
  windSpeed?: number;
}

interface ForecastDay {
  date: string;
  dayName: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainfall: number;
  description: string;
  windSpeed: number;
}

interface FarmData {
  crops: string[];
  farmSize?: string;
  season?: string;
}

interface PestAlert {
  pest: string;
  risk: 'low' | 'medium' | 'high';
  conditions: string;
  prevention: string[];
}

// Analyze weather conditions for pest/disease risks
function analyzePestRisks(weather: WeatherData, forecast: ForecastDay[]): PestAlert[] {
  const alerts: PestAlert[] = [];
  const temp = weather.temperature;
  const humidity = weather.humidity;
  const rainfall = weather.rainfall;
  
  // Check forecast for prolonged conditions
  const avgForecastHumidity = forecast.length > 0 
    ? forecast.reduce((sum, d) => sum + d.humidity, 0) / forecast.length 
    : humidity;
  const totalForecastRain = forecast.reduce((sum, d) => sum + d.rainfall, 0);
  const avgForecastTemp = forecast.length > 0
    ? forecast.reduce((sum, d) => sum + d.temperature, 0) / forecast.length
    : temp;

  // Fungal diseases (Late blight, Early blight, Powdery mildew)
  if (humidity > 80 && temp >= 18 && temp <= 28) {
    alerts.push({
      pest: 'Fungal Diseases (Blight/Mildew)',
      risk: humidity > 90 ? 'high' : 'medium',
      conditions: 'High humidity with warm temperatures favors fungal growth',
      prevention: [
        'Apply copper-based fungicide preventively',
        'Ensure good air circulation between plants',
        'Avoid overhead irrigation',
        'Remove and destroy infected plant parts'
      ]
    });
  }

  // Aphids - warm, dry conditions
  if (temp >= 25 && temp <= 35 && humidity < 60 && rainfall < 2) {
    alerts.push({
      pest: 'Aphids',
      risk: temp > 30 && humidity < 50 ? 'high' : 'medium',
      conditions: 'Warm, dry weather promotes rapid aphid reproduction',
      prevention: [
        'Spray neem oil solution (2-3ml/L)',
        'Introduce ladybugs as natural predators',
        'Use yellow sticky traps for monitoring',
        'Spray strong water jet to dislodge aphids'
      ]
    });
  }

  // Spider mites - hot, dry conditions
  if (temp >= 30 && humidity < 50 && rainfall < 1) {
    alerts.push({
      pest: 'Spider Mites',
      risk: 'high',
      conditions: 'Hot, dry conditions are ideal for spider mite outbreaks',
      prevention: [
        'Increase humidity around plants with misting',
        'Apply sulfur-based miticide',
        'Spray water on leaf undersides',
        'Avoid dusty conditions near crops'
      ]
    });
  }

  // Whiteflies - warm, humid conditions
  if (temp >= 22 && temp <= 32 && humidity >= 60 && humidity <= 80) {
    alerts.push({
      pest: 'Whiteflies',
      risk: 'medium',
      conditions: 'Moderate warmth with humidity favors whitefly activity',
      prevention: [
        'Use yellow sticky traps',
        'Apply neem-based insecticide',
        'Introduce parasitic wasps (Encarsia)',
        'Remove heavily infested leaves'
      ]
    });
  }

  // Bacterial diseases - prolonged wet conditions
  if ((rainfall > 10 || totalForecastRain > 30) && avgForecastHumidity > 75) {
    alerts.push({
      pest: 'Bacterial Diseases',
      risk: totalForecastRain > 50 ? 'high' : 'medium',
      conditions: 'Prolonged wet conditions promote bacterial infections',
      prevention: [
        'Improve field drainage',
        'Avoid working in wet fields',
        'Apply streptocycline spray preventively',
        'Space plants for better air circulation'
      ]
    });
  }

  // Root rot - wet soil conditions
  if (rainfall > 20 || totalForecastRain > 40) {
    alerts.push({
      pest: 'Root Rot',
      risk: 'high',
      conditions: 'Waterlogged soil leads to root diseases',
      prevention: [
        'Ensure proper field drainage',
        'Create raised beds if possible',
        'Apply Trichoderma to soil',
        'Reduce irrigation frequency'
      ]
    });
  }

  // Fruit flies - warm, humid with ripe fruits
  if (temp >= 25 && temp <= 35 && humidity >= 60) {
    alerts.push({
      pest: 'Fruit Flies',
      risk: humidity > 75 ? 'high' : 'medium',
      conditions: 'Warm, humid weather increases fruit fly activity',
      prevention: [
        'Set up pheromone traps',
        'Collect and destroy fallen fruits',
        'Apply protein bait sprays',
        'Harvest fruits at proper maturity'
      ]
    });
  }

  // Caterpillars/Borers - moderate conditions after rain
  if (temp >= 20 && temp <= 30 && (rainfall > 5 || totalForecastRain > 15)) {
    alerts.push({
      pest: 'Caterpillars & Borers',
      risk: 'medium',
      conditions: 'Post-rain warmth triggers caterpillar emergence',
      prevention: [
        'Apply Bt (Bacillus thuringiensis) spray',
        'Set up pheromone traps for monitoring',
        'Hand-pick visible caterpillars',
        'Spray neem oil on affected areas'
      ]
    });
  }

  // Limit to top 4 most relevant alerts
  return alerts
    .sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.risk] - riskOrder[a.risk];
    })
    .slice(0, 4);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weather, forecast, farm, language = 'en' } = await req.json();

    if (!weather) {
      return new Response(
        JSON.stringify({ error: 'Weather data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData = weather as WeatherData;
    const forecastData = (forecast || []) as ForecastDay[];
    const farmData = farm as FarmData | undefined;

    // Generate pest/disease alerts based on weather
    const pestAlerts = analyzePestRisks(weatherData, forecastData);
    console.log('Pest alerts generated:', pestAlerts.length);

    const languageInstruction = language === 'hi' 
      ? 'Respond in Hindi using Devanagari script.' 
      : language === 'mr' 
        ? 'Respond in Marathi using Devanagari script.'
        : 'Respond in English.';

    const hasForecast = forecastData.length >= 3;

    const systemPrompt = `You are an expert agricultural advisor for Indian farmers. Provide practical, actionable farming advice based on weather conditions. ${languageInstruction}

Your response must be a valid JSON object with this exact structure:
{
  "mainAdvice": "A clear 2-3 sentence main recommendation based on today's weather",
  "riskLevel": "low" | "medium" | "high",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "irrigationAdvice": "Specific irrigation recommendation for today",
  "fertilizerAdvice": "Specific fertilizer recommendation",
  ${hasForecast ? `"threeDayPlan": [
    { "day": 1, "dayName": "Tomorrow", "activity": "Main activity", "reason": "Why this day is good/bad for it", "riskLevel": "low|medium|high" },
    { "day": 2, "dayName": "Day after tomorrow", "activity": "Main activity", "reason": "Why", "riskLevel": "low|medium|high" },
    { "day": 3, "dayName": "In 3 days", "activity": "Main activity", "reason": "Why", "riskLevel": "low|medium|high" }
  ]` : ''}
}

Consider these factors:
- Temperature affects crop growth, pest activity, and water needs
- Humidity impacts disease risk (high humidity = fungal risk)
- Rainfall affects irrigation needs and fieldwork timing
- Wind affects spraying operations and evaporation
- Plan spraying for low-wind, no-rain days
- Schedule irrigation before dry spells
- Avoid fertilizer before heavy rain

Be practical and consider local Indian farming practices.`;

    const cropInfo = farmData?.crops?.length 
      ? `Crops grown: ${farmData.crops.join(', ')}` 
      : 'General farming';
    
    const seasonInfo = farmData?.season 
      ? `Current season: ${farmData.season}` 
      : '';

    let forecastInfo = '';
    if (hasForecast) {
      forecastInfo = '\n\n3-Day Forecast:\n' + forecastData.slice(0, 3).map((day, i) => 
        `Day ${i + 1} (${day.dayName}): ${day.temperature}°C, Humidity: ${day.humidity}%, Rain: ${day.rainfall}mm, Wind: ${day.windSpeed}m/s, ${day.description}`
      ).join('\n');
    }

    const userPrompt = `Current weather conditions (Today):
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Rainfall: ${weatherData.rainfall}mm
- Conditions: ${weatherData.description || 'Not specified'}
- Wind Speed: ${weatherData.windSpeed || 0} m/s
${forecastInfo}

Farm information:
- ${cropInfo}
${seasonInfo ? `- ${seasonInfo}` : ''}

Based on these conditions, provide:
1. Today's farming advisory
2. ${hasForecast ? 'A 3-day activity plan based on the forecast' : ''}`;

    console.log('Generating advisory with forecast:', hasForecast);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate advisory' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response:', aiResponse);
      return new Response(
        JSON.stringify({ error: 'Empty response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let advisory;
    try {
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      advisory = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      advisory = {
        mainAdvice: content.slice(0, 200),
        riskLevel: weatherData.rainfall > 10 ? 'high' : weatherData.temperature > 38 ? 'medium' : 'low',
        tips: ['Check weather updates regularly', 'Monitor crop health', 'Adjust irrigation as needed'],
        irrigationAdvice: 'Adjust based on current rainfall',
        fertilizerAdvice: 'Apply during cooler hours',
        threeDayPlan: []
      };
    }

    // Add pest alerts to the advisory response
    advisory.pestAlerts = pestAlerts;

    console.log('Advisory generated successfully with', pestAlerts.length, 'pest alerts');

    return new Response(
      JSON.stringify(advisory),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-advisory function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
