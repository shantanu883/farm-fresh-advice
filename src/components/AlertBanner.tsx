import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  message: string;
  type?: "warning" | "danger";
  dismissible?: boolean;
  className?: string;
}

const AlertBanner = ({ 
  message, 
  type = "warning", 
  dismissible = true,
  className 
}: AlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl p-4",
        type === "warning" 
          ? "bg-amber-50 border border-amber-200" 
          : "bg-red-50 border border-red-200",
        className
      )}
    >
      <AlertTriangle 
        className={cn(
          "h-6 w-6 flex-shrink-0 mt-0.5",
          type === "warning" ? "text-amber-600" : "text-red-600"
        )} 
      />
      <p 
        className={cn(
          "flex-1 text-farmer-base font-medium",
          type === "warning" ? "text-amber-800" : "text-red-800"
        )}
      >
        {message}
      </p>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className={cn(
            "flex-shrink-0 rounded-lg p-1 transition-colors",
            type === "warning" 
              ? "text-amber-600 hover:bg-amber-100" 
              : "text-red-600 hover:bg-red-100"
          )}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
