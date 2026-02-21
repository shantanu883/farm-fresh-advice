import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { toast } from "sonner";

interface ListenButtonProps {
  text: string;
  className?: string;
  compact?: boolean;
}

const ListenButton = ({ text, className, compact = false }: ListenButtonProps) => {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getLanguageCode = () => {
    switch (language) {
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

const speak = async () => {
  if (!text || text.trim().length === 0) return;

  try {
    setIsLoading(true);
    setIsSpeaking(true);

    // Normalize text (prevents speed jumps)
    const cleanText = text
      .replace(/\n/g, ". ")
      .replace(/  +/g, " ")
      .trim();

    await TextToSpeech.stop(); // Stop previous speech

    await TextToSpeech.speak({
      text: cleanText,
      lang: getLanguageCode(),
      rate: 0.6,   // Stable slow speed
      pitch: 1.0,
      volume: 1.0,
    });

    setIsSpeaking(false);
    setIsLoading(false);

  } catch (error) {
    console.error("Native TTS error:", error);
    setIsSpeaking(false);
    setIsLoading(false);
  }
};

  const stop = async () => {
    await TextToSpeech.stop();
    setIsSpeaking(false);
  };

  if (compact) {
    return (
      <Button
        variant="default"
        size="icon"
        onClick={isSpeaking ? stop : speak}
        disabled={isLoading || !text}
        className={`h-12 w-12 rounded-full shadow-lg ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isSpeaking ? (
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
      onClick={isSpeaking ? stop : speak}
      disabled={isLoading || !text}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("loading")}
        </>
      ) : isSpeaking ? (
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