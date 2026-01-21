import CropCalendarItem from "@/components/CropCalendarItem";
import BottomNavigation from "@/components/BottomNavigation";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CropCalendar = () => {
  const { t } = useLanguage();

  const cropCalendarData = [
    {
      cropName: t("ricePaddy"),
      sowingSeason: t("riceSowing"),
      harvestWindow: t("riceHarvest"),
    },
    {
      cropName: t("wheat"),
      sowingSeason: t("wheatSowing"),
      harvestWindow: t("wheatHarvest"),
    },
    {
      cropName: t("cotton"),
      sowingSeason: t("cottonSowing"),
      harvestWindow: t("cottonHarvest"),
    },
    {
      cropName: t("tomato"),
      sowingSeason: t("tomatoSowing"),
      harvestWindow: t("tomatoHarvest"),
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-farmer-2xl font-bold text-foreground">
            {t("cropCalendar")}
          </h1>
        </div>
        <p className="text-farmer-base text-muted-foreground">
          {t("knowBestTimes")}
        </p>
      </div>

      {/* Calendar List */}
      <div className="space-y-4">
        {cropCalendarData.map((crop, index) => (
          <div 
            key={crop.cropName}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CropCalendarItem
              cropName={crop.cropName}
              sowingSeason={crop.sowingSeason}
              harvestWindow={crop.harvestWindow}
            />
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-6 rounded-xl bg-muted p-4">
        <p className="text-center text-farmer-sm text-muted-foreground">
          {t("calendarNote")}
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CropCalendar;
