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

interface FarmData {
  crops: string[];
  farmSize?: string;
  season?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weather, farm, language = 'en' } = await req.json();

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
    const farmData = farm as FarmData | undefined;

    const languageInstruction = language === 'hi' 
      ? 'Respond in Hindi using Devanagari script.' 
      : language === 'mr' 
        ? 'Respond in Marathi using Devanagari script.'
        : 'Respond in English.';

    const systemPrompt = `You are an expert agricultural advisor for Indian farmers. Provide practical, actionable farming advice based on current weather conditions. ${languageInstruction}

Your response must be a valid JSON object with this exact structure:
{
  "mainAdvice": "A clear 2-3 sentence main recommendation based on weather",
  "riskLevel": "low" | "medium" | "high",
  "tips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2", 
    "Specific actionable tip 3"
  ],
  "irrigationAdvice": "Specific irrigation recommendation",
  "fertilizerAdvice": "Specific fertilizer recommendation"
}

Consider these factors:
- Temperature affects crop growth, pest activity, and water needs
- Humidity impacts disease risk (high humidity = fungal risk)
- Rainfall affects irrigation needs and fieldwork timing
- Wind affects spraying operations and evaporation

Be practical and consider local Indian farming practices.`;

    const cropInfo = farmData?.crops?.length 
      ? `Crops grown: ${farmData.crops.join(', ')}` 
      : 'General farming';
    
    const seasonInfo = farmData?.season 
      ? `Current season: ${farmData.season}` 
      : '';

    const userPrompt = `Current weather conditions:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Rainfall: ${weatherData.rainfall}mm
- Conditions: ${weatherData.description || 'Not specified'}
- Wind Speed: ${weatherData.windSpeed || 0} m/s

Farm information:
- ${cropInfo}
${seasonInfo ? `- ${seasonInfo}` : ''}

Based on these conditions, provide farming advisory for today.`;

    console.log('Generating advisory with prompt:', userPrompt);

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
        max_tokens: 1000,
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

    // Parse the JSON from the AI response
    let advisory;
    try {
      // Extract JSON from the response (handle markdown code blocks if present)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      advisory = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Fallback response
      advisory = {
        mainAdvice: content.slice(0, 200),
        riskLevel: weatherData.rainfall > 10 ? 'high' : weatherData.temperature > 38 ? 'medium' : 'low',
        tips: ['Check weather updates regularly', 'Monitor crop health', 'Adjust irrigation as needed'],
        irrigationAdvice: 'Adjust based on current rainfall',
        fertilizerAdvice: 'Apply during cooler hours'
      };
    }

    console.log('Advisory generated successfully:', advisory);

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
