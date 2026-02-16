import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface ListenButtonProps {
  text: string;
  className?: string;
  compact?: boolean;
}

const ListenButton = ({ text, className, compact = false }: ListenButtonProps) => {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices() || [];
      setVoices(availableVoices);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Reload voices when app language changes (some browsers expose new voices)
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const reload = () => setVoices(window.speechSynthesis.getVoices() || []);
    // small timeout to allow voices to load for the selected language
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [language]);

  const getLanguageCode = (lang: string): string => {
    switch (lang) {
      case "en":
        return "en-IN";
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      case "ta":
        return "ta-IN";
      case "te":
        return "te-IN";
      case "kn":
        return "kn-IN";
      case "bn":
        return "bn-IN";
      case "gu":
        return "gu-IN";
      case "or":
        return "or-IN";
      case "ml":
        return "ml-IN";
      case "pa":
        return "pa-IN";
      default:
        return "en-IN";
    }
  };

  const findBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const langPrefix = langCode.split('-')[0];
    
    // Priority order for Indian languages:
    // 1. Google voices (best quality)
    // 2. Microsoft voices 
    // 3. Any voice matching the language
    
    // Try to find Google voice first (best quality)
    let voice = voices.find(v => 
      v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes('google')
    );
    
    if (!voice) {
      // Try Microsoft voice
      voice = voices.find(v => 
        v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes('microsoft')
      );
    }
    
    if (!voice) {
      // Try any female voice (often clearer)
      voice = voices.find(v => 
        v.lang.startsWith(langPrefix) && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
      );
    }
    
    if (!voice) {
      // Any voice matching language
      voice = voices.find(v => v.lang.startsWith(langPrefix));
    }
    
    if (!voice) {
      // Exact match
      voice = voices.find(v => v.lang === langCode);
    }

    return voice || null;
  };

  const handleListen = async () => {
    if (!window.speechSynthesis) {
      toast.error(t('notificationsNotSupported') || 'Speech synthesis not supported on this device');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set language based on current app language
      const langCode = getLanguageCode(language);
      utterance.lang = langCode;
      
      // Optimize settings for different language groups
      // Indian languages need slower speech for clarity
      if (["hi", "mr", "ta", "te", "kn", "bn", "gu", "or", "ml", "pa"].includes(language)) {
        utterance.rate = 0.8; // Slower for better clarity in Indian languages
        utterance.pitch = 1.0;
      } else {
        utterance.rate = 0.9;
        utterance.pitch = 1;
      }
      utterance.volume = 1;

      // Find the best voice for this language
      const bestVoice = findBestVoice(langCode);
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log(`Using voice: ${bestVoice.name} (${bestVoice.lang})`);
      } else {
        console.log(`No specific voice found for ${langCode}, using default`);
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsPlaying(false);
        setIsLoading(false);
        if (event.error !== 'canceled') {
          toast.error(t('unexpectedError') || "Could not play audio");
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      setIsLoading(false);
      toast.error("Could not play audio");
    }
  };

  if (compact) {
    return (
      <Button
        variant="default"
        size="icon"
        onClick={handleListen}
        disabled={isLoading || !text}
        className={`h-12 w-12 rounded-full shadow-lg ${className}`}
        aria-label={isPlaying ? t("stopListening") : t("listenToAdvice")}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleListen}
      disabled={isLoading || !text}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("loading")}
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="mr-2 h-5 w-5" />
          {t("stopListening")}
        </>
      ) : (
        <>
          <Volume2 className="mr-2 h-5 w-5" />
          {t("listenToAdvice")}
        </>
      )}
    </Button>
  );
};

export default ListenButton;
