import CropCalendarItem from "@/components/CropCalendarItem";
import BottomNavigation from "@/components/BottomNavigation";
import { Calendar } from "lucide-react";

const cropCalendarData = [
  {
    cropName: "Rice (Paddy)",
    sowingSeason: "June - July (Kharif)",
    harvestWindow: "November - December",
  },
  {
    cropName: "Wheat",
    sowingSeason: "October - November (Rabi)",
    harvestWindow: "March - April",
  },
  {
    cropName: "Cotton",
    sowingSeason: "April - May",
    harvestWindow: "October - December",
  },
  {
    cropName: "Tomato",
    sowingSeason: "Year-round (varies by region)",
    harvestWindow: "60-90 days after sowing",
  },
];

const CropCalendar = () => {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-farmer-2xl font-bold text-foreground">
            Crop Calendar
          </h1>
        </div>
        <p className="text-farmer-base text-muted-foreground">
          Know the best times to sow and harvest your crops
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
          📅 Calendar varies by region. Consult your local agricultural office for specific dates.
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CropCalendar;
