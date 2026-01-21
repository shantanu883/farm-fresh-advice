import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { Wheat, Layers, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CropSoilSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedSoil, setSelectedSoil] = useState("");

  const crops = [
    { value: "rice", label: t("rice") },
    { value: "wheat", label: t("wheat") },
    { value: "cotton", label: t("cotton") },
    { value: "tomato", label: t("tomato") },
  ];

  const soilTypes = [
    { value: "black", label: t("blackSoil") },
    { value: "red", label: t("redSoil") },
    { value: "sandy", label: t("sandySoil") },
    { value: "alluvial", label: t("alluvialSoil") },
  ];

  const handleContinue = () => {
    if (selectedCrop && selectedSoil) {
      navigate("/advisory");
    }
  };

  const isComplete = selectedCrop && selectedSoil;

  return (
    <div className="page-container">
      <PageHeader title={t("cropAndSoil")} showBack />

      <div className="mx-auto max-w-md space-y-6">
        {/* Crop Selection */}
        <Card className="card-elevated p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Wheat className="h-6 w-6 text-primary" />
            </div>
            <label className="text-farmer-lg font-semibold text-foreground">
              {t("selectCrop")}
            </label>
          </div>
          
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="h-14 text-farmer-base">
              <SelectValue placeholder={t("chooseCrop")} />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem 
                  key={crop.value} 
                  value={crop.value}
                  className="text-farmer-base py-3"
                >
                  {crop.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Soil Type Selection */}
        <Card className="card-elevated p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
              <Layers className="h-6 w-6 text-accent" />
            </div>
            <label className="text-farmer-lg font-semibold text-foreground">
              {t("soilType")}
            </label>
          </div>
          
          <Select value={selectedSoil} onValueChange={setSelectedSoil}>
            <SelectTrigger className="h-14 text-farmer-base">
              <SelectValue placeholder={t("chooseSoilType")} />
            </SelectTrigger>
            <SelectContent>
              {soilTypes.map((soil) => (
                <SelectItem 
                  key={soil.value} 
                  value={soil.value}
                  className="text-farmer-base py-3"
                >
                  {soil.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Selection Summary */}
        {isComplete && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-4 animate-fade-in">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-farmer-base font-medium text-primary">
              {t("readyForAdvisory")}
            </span>
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            variant="hero"
            size="xl"
            onClick={handleContinue}
            disabled={!isComplete}
            className="w-full"
          >
            {t("saveAndContinue")}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropSoilSelection;
