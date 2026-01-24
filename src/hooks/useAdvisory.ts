import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export interface Advisory {
  mainAdvice: string;
  riskLevel: 'low' | 'medium' | 'high';
  tips: string[];
  irrigationAdvice: string;
  fertilizerAdvice: string;
}

export interface WeatherInput {
  temperature: number;
  humidity: number;
  rainfall: number;
  description?: string;
  windSpeed?: number;
}

export interface FarmInput {
  crops: string[];
  farmSize?: string;
  season?: string;
}

interface UseAdvisoryReturn {
  advisory: Advisory | null;
  isLoading: boolean;
  error: string | null;
  generateAdvisory: (weather: WeatherInput, farm?: FarmInput) => Promise<void>;
}

export const useAdvisory = (): UseAdvisoryReturn => {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const generateAdvisory = useCallback(async (weather: WeatherInput, farm?: FarmInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-advisory', {
        body: { weather, farm, language }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate advisory');
      }

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (data.error.includes('credits')) {
          toast.error('AI service credits exhausted.');
        }
        throw new Error(data.error);
      }

      setAdvisory(data as Advisory);
    } catch (err) {
      console.error('Advisory generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate advisory';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return {
    advisory,
    isLoading,
    error,
    generateAdvisory,
  };
};
