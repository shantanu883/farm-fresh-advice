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

// Pest/disease translations
const pestTranslations = {
  en: {
    fungalDiseases: 'Fungal Diseases (Blight/Mildew)',
    fungalConditions: 'High humidity with warm temperatures favors fungal growth',
    fungalPrevention: [
      'Apply copper-based fungicide preventively',
      'Ensure good air circulation between plants',
      'Avoid overhead irrigation',
      'Remove and destroy infected plant parts'
    ],
    aphids: 'Aphids',
    aphidsConditions: 'Warm, dry weather promotes rapid aphid reproduction',
    aphidsPrevention: [
      'Spray neem oil solution (2-3ml/L)',
      'Introduce ladybugs as natural predators',
      'Use yellow sticky traps for monitoring',
      'Spray strong water jet to dislodge aphids'
    ],
    spiderMites: 'Spider Mites',
    spiderMitesConditions: 'Hot, dry conditions are ideal for spider mite outbreaks',
    spiderMitesPrevention: [
      'Increase humidity around plants with misting',
      'Apply sulfur-based miticide',
      'Spray water on leaf undersides',
      'Avoid dusty conditions near crops'
    ],
    whiteflies: 'Whiteflies',
    whitefliesConditions: 'Moderate warmth with humidity favors whitefly activity',
    whitefliesPrevention: [
      'Use yellow sticky traps',
      'Apply neem-based insecticide',
      'Introduce parasitic wasps (Encarsia)',
      'Remove heavily infested leaves'
    ],
    bacterialDiseases: 'Bacterial Diseases',
    bacterialConditions: 'Prolonged wet conditions promote bacterial infections',
    bacterialPrevention: [
      'Improve field drainage',
      'Avoid working in wet fields',
      'Apply streptocycline spray preventively',
      'Space plants for better air circulation'
    ],
    rootRot: 'Root Rot',
    rootRotConditions: 'Waterlogged soil leads to root diseases',
    rootRotPrevention: [
      'Ensure proper field drainage',
      'Create raised beds if possible',
      'Apply Trichoderma to soil',
      'Reduce irrigation frequency'
    ],
    fruitFlies: 'Fruit Flies',
    fruitFliesConditions: 'Warm, humid weather increases fruit fly activity',
    fruitFliesPrevention: [
      'Set up pheromone traps',
      'Collect and destroy fallen fruits',
      'Apply protein bait sprays',
      'Harvest fruits at proper maturity'
    ],
    caterpillars: 'Caterpillars & Borers',
    caterpillarsConditions: 'Post-rain warmth triggers caterpillar emergence',
    caterpillarsPrevention: [
      'Apply Bt (Bacillus thuringiensis) spray',
      'Set up pheromone traps for monitoring',
      'Hand-pick visible caterpillars',
      'Spray neem oil on affected areas'
    ]
  },
  hi: {
    fungalDiseases: 'फफूंद रोग (झुलसा/फफूंदी)',
    fungalConditions: 'उच्च आर्द्रता और गर्म तापमान फफूंद वृद्धि को बढ़ावा देते हैं',
    fungalPrevention: [
      'तांबा आधारित फफूंदनाशक का निवारक छिड़काव करें',
      'पौधों के बीच अच्छी वायु संचार सुनिश्चित करें',
      'ऊपरी सिंचाई से बचें',
      'संक्रमित पौधों के भागों को हटाएं और नष्ट करें'
    ],
    aphids: 'माहू (एफिड्स)',
    aphidsConditions: 'गर्म, शुष्क मौसम माहू की तेजी से वृद्धि को बढ़ावा देता है',
    aphidsPrevention: [
      'नीम तेल का घोल (2-3ml/L) छिड़कें',
      'प्राकृतिक शिकारी के रूप में लेडीबग लाएं',
      'निगरानी के लिए पीले चिपचिपे जाल का उपयोग करें',
      'माहू को हटाने के लिए तेज पानी की धार का छिड़काव करें'
    ],
    spiderMites: 'मकड़ी के कण',
    spiderMitesConditions: 'गर्म, शुष्क स्थितियां मकड़ी के कण के प्रकोप के लिए आदर्श हैं',
    spiderMitesPrevention: [
      'धुंध से पौधों के आसपास नमी बढ़ाएं',
      'सल्फर आधारित माइटिसाइड लगाएं',
      'पत्तियों के नीचे की तरफ पानी का छिड़काव करें',
      'फसलों के पास धूल भरी स्थितियों से बचें'
    ],
    whiteflies: 'सफेद मक्खी',
    whitefliesConditions: 'मध्यम गर्मी और आर्द्रता सफेद मक्खी की गतिविधि को बढ़ावा देती है',
    whitefliesPrevention: [
      'पीले चिपचिपे जाल का उपयोग करें',
      'नीम आधारित कीटनाशक लगाएं',
      'परजीवी ततैया (एनकार्सिया) लाएं',
      'अत्यधिक संक्रमित पत्तियां हटाएं'
    ],
    bacterialDiseases: 'जीवाणु रोग',
    bacterialConditions: 'लंबे समय तक गीली स्थितियां जीवाणु संक्रमण को बढ़ावा देती हैं',
    bacterialPrevention: [
      'खेत की जल निकासी में सुधार करें',
      'गीले खेतों में काम करने से बचें',
      'स्ट्रेप्टोसाइक्लिन का निवारक छिड़काव करें',
      'बेहतर वायु संचार के लिए पौधों को दूर-दूर लगाएं'
    ],
    rootRot: 'जड़ सड़न',
    rootRotConditions: 'जलभराव वाली मिट्टी जड़ रोगों का कारण बनती है',
    rootRotPrevention: [
      'उचित खेत जल निकासी सुनिश्चित करें',
      'यदि संभव हो तो उठी हुई क्यारियां बनाएं',
      'मिट्टी में ट्राइकोडर्मा लगाएं',
      'सिंचाई की आवृत्ति कम करें'
    ],
    fruitFlies: 'फल मक्खी',
    fruitFliesConditions: 'गर्म, आर्द्र मौसम फल मक्खी की गतिविधि बढ़ाता है',
    fruitFliesPrevention: [
      'फेरोमोन ट्रैप लगाएं',
      'गिरे हुए फलों को इकट्ठा करके नष्ट करें',
      'प्रोटीन बैट स्प्रे लगाएं',
      'उचित परिपक्वता पर फलों की कटाई करें'
    ],
    caterpillars: 'सुंडी और छेदक',
    caterpillarsConditions: 'बारिश के बाद गर्मी सुंडी के उभरने को बढ़ावा देती है',
    caterpillarsPrevention: [
      'बीटी (बैसिलस थुरिंजिएंसिस) स्प्रे लगाएं',
      'निगरानी के लिए फेरोमोन ट्रैप लगाएं',
      'दिखाई देने वाली सुंडियों को हाथ से चुनें',
      'प्रभावित क्षेत्रों पर नीम तेल का छिड़काव करें'
    ]
  },
  mr: {
    fungalDiseases: 'बुरशीजन्य रोग (करपा/भुरी)',
    fungalConditions: 'उच्च आर्द्रता आणि उबदार तापमान बुरशीच्या वाढीस अनुकूल असते',
    fungalPrevention: [
      'तांबे आधारित बुरशीनाशकाची प्रतिबंधात्मक फवारणी करा',
      'झाडांमध्ये चांगले हवा खेळण्याची खात्री करा',
      'वरून पाणी देणे टाळा',
      'संक्रमित वनस्पतींचे भाग काढून नष्ट करा'
    ],
    aphids: 'मावा',
    aphidsConditions: 'उबदार, कोरडे हवामान माव्याच्या जलद वाढीस प्रोत्साहन देते',
    aphidsPrevention: [
      'कडुलिंबाच्या तेलाचे द्रावण (2-3ml/L) फवारा',
      'नैसर्गिक शिकारी म्हणून लेडीबग आणा',
      'देखरेखीसाठी पिवळे चिकट सापळे वापरा',
      'मावा काढण्यासाठी जोरदार पाण्याचा फवारा मारा'
    ],
    spiderMites: 'कोळी माइट्स',
    spiderMitesConditions: 'गरम, कोरडी परिस्थिती कोळी माइट्सच्या प्रादुर्भावासाठी आदर्श आहे',
    spiderMitesPrevention: [
      'धुक्याने झाडांभोवती आर्द्रता वाढवा',
      'गंधक आधारित माइटिसाइड लावा',
      'पानांच्या खालच्या बाजूस पाणी फवारा',
      'पिकांजवळ धुळीची परिस्थिती टाळा'
    ],
    whiteflies: 'पांढरी माशी',
    whitefliesConditions: 'मध्यम उष्णता आणि आर्द्रता पांढऱ्या माशीच्या क्रियाकलापांना अनुकूल आहे',
    whitefliesPrevention: [
      'पिवळे चिकट सापळे वापरा',
      'कडुलिंब आधारित कीटकनाशक लावा',
      'परजीवी मावळी (एनकार्सिया) आणा',
      'जास्त संक्रमित पाने काढा'
    ],
    bacterialDiseases: 'जिवाणूजन्य रोग',
    bacterialConditions: 'दीर्घकाळ ओले राहिल्याने जिवाणू संसर्गास प्रोत्साहन मिळते',
    bacterialPrevention: [
      'शेताचा निचरा सुधारा',
      'ओल्या शेतात काम करणे टाळा',
      'स्ट्रेप्टोसायक्लिनची प्रतिबंधात्मक फवारणी करा',
      'चांगल्या हवा खेळण्यासाठी झाडे अंतरावर लावा'
    ],
    rootRot: 'मुळकुज',
    rootRotConditions: 'पाणी साचलेली माती मुळांच्या रोगांना कारणीभूत ठरते',
    rootRotPrevention: [
      'योग्य शेत निचरा सुनिश्चित करा',
      'शक्य असल्यास उंचवटा वाफे तयार करा',
      'मातीत ट्रायकोडर्मा लावा',
      'सिंचनाची वारंवारता कमी करा'
    ],
    fruitFlies: 'फळमाशी',
    fruitFliesConditions: 'उबदार, दमट हवामान फळमाशीच्या क्रियाकलाप वाढवते',
    fruitFliesPrevention: [
      'फेरोमोन सापळे लावा',
      'गळालेली फळे गोळा करून नष्ट करा',
      'प्रथिने आमिष फवारे लावा',
      'योग्य परिपक्वतेवर फळांची कापणी करा'
    ],
    caterpillars: 'अळी आणि खोडकिडा',
    caterpillarsConditions: 'पावसानंतरची उष्णता अळी बाहेर येण्यास प्रवृत्त करते',
    caterpillarsPrevention: [
      'बीटी (बॅसिलस थुरिंजिएन्सिस) फवारा लावा',
      'देखरेखीसाठी फेरोमोन सापळे लावा',
      'दिसणाऱ्या अळ्या हाताने वेचा',
      'प्रभावित भागावर कडुलिंब तेल फवारा'
    ]
  }
};

// Analyze weather conditions for pest/disease risks
function analyzePestRisks(weather: WeatherData, forecast: ForecastDay[], language: string = 'en'): PestAlert[] {
  const alerts: PestAlert[] = [];
  const temp = weather.temperature;
  const humidity = weather.humidity;
  const rainfall = weather.rainfall;
  const t = pestTranslations[language as keyof typeof pestTranslations] || pestTranslations.en;
  
  // Check forecast for prolonged conditions
  const avgForecastHumidity = forecast.length > 0 
    ? forecast.reduce((sum, d) => sum + d.humidity, 0) / forecast.length 
    : humidity;
  const totalForecastRain = forecast.reduce((sum, d) => sum + d.rainfall, 0);

  // Fungal diseases (Late blight, Early blight, Powdery mildew)
  if (humidity > 80 && temp >= 18 && temp <= 28) {
    alerts.push({
      pest: t.fungalDiseases,
      risk: humidity > 90 ? 'high' : 'medium',
      conditions: t.fungalConditions,
      prevention: t.fungalPrevention
    });
  }

  // Aphids - warm, dry conditions
  if (temp >= 25 && temp <= 35 && humidity < 60 && rainfall < 2) {
    alerts.push({
      pest: t.aphids,
      risk: temp > 30 && humidity < 50 ? 'high' : 'medium',
      conditions: t.aphidsConditions,
      prevention: t.aphidsPrevention
    });
  }

  // Spider mites - hot, dry conditions
  if (temp >= 30 && humidity < 50 && rainfall < 1) {
    alerts.push({
      pest: t.spiderMites,
      risk: 'high',
      conditions: t.spiderMitesConditions,
      prevention: t.spiderMitesPrevention
    });
  }

  // Whiteflies - warm, humid conditions
  if (temp >= 22 && temp <= 32 && humidity >= 60 && humidity <= 80) {
    alerts.push({
      pest: t.whiteflies,
      risk: 'medium',
      conditions: t.whitefliesConditions,
      prevention: t.whitefliesPrevention
    });
  }

  // Bacterial diseases - prolonged wet conditions
  if ((rainfall > 10 || totalForecastRain > 30) && avgForecastHumidity > 75) {
    alerts.push({
      pest: t.bacterialDiseases,
      risk: totalForecastRain > 50 ? 'high' : 'medium',
      conditions: t.bacterialConditions,
      prevention: t.bacterialPrevention
    });
  }

  // Root rot - wet soil conditions
  if (rainfall > 20 || totalForecastRain > 40) {
    alerts.push({
      pest: t.rootRot,
      risk: 'high',
      conditions: t.rootRotConditions,
      prevention: t.rootRotPrevention
    });
  }

  // Fruit flies - warm, humid with ripe fruits
  if (temp >= 25 && temp <= 35 && humidity >= 60) {
    alerts.push({
      pest: t.fruitFlies,
      risk: humidity > 75 ? 'high' : 'medium',
      conditions: t.fruitFliesConditions,
      prevention: t.fruitFliesPrevention
    });
  }

  // Caterpillars/Borers - moderate conditions after rain
  if (temp >= 20 && temp <= 30 && (rainfall > 5 || totalForecastRain > 15)) {
    alerts.push({
      pest: t.caterpillars,
      risk: 'medium',
      conditions: t.caterpillarsConditions,
      prevention: t.caterpillarsPrevention
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

    // Generate pest/disease alerts based on weather (in selected language)
    const pestAlerts = analyzePestRisks(weatherData, forecastData, language);
    console.log('Pest alerts generated:', pestAlerts.length, 'in language:', language);

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
