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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleListen = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Use ElevenLabs TTS for high-quality Hindi/Marathi voices
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: text.substring(0, 3000), // Limit text length
            language 
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback to browser TTS if ElevenLabs fails
      fallbackToWebSpeech();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToWebSpeech = () => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }

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

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = getLanguageCode(language);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
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
