import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ListenButtonProps {
  text: string;
  className?: string;
  compact?: boolean;
}

const ListenButton = ({ text, className, compact = false }: ListenButtonProps) => {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getLanguageCode = (lang: string): string => {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      default:
        return "en-US";
    }
  };

  const handleListen = async () => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
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
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a voice that matches the language
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
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
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      setIsLoading(false);
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