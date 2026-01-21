import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MapPin, Ruler, Wheat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Farm, generateFarmId } from "@/types/farm";

interface AddFarmDialogProps {
  onAdd: (farm: Farm) => void;
  crops: { value: string; label: string }[];
  farmSizes: { value: string; label: string }[];
}

const AddFarmDialog = ({ onAdd, crops, farmSizes }: AddFarmDialogProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const handleCropToggle = (cropValue: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropValue)
        ? prev.filter((c) => c !== cropValue)
        : [...prev, cropValue]
    );
  };

  const handleAdd = () => {
    if (farmSize && selectedCrops.length > 0) {
      const newFarm: Farm = {
        id: generateFarmId(),
        name: farmName.trim(),
        size: farmSize,
        crops: selectedCrops,
      };
      onAdd(newFarm);
      setFarmName("");
      setFarmSize("");
      setSelectedCrops([]);
      setOpen(false);
    }
  };

  const isValid = farmSize && selectedCrops.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="w-full gap-2 border-2 border-dashed border-primary/30">
          <Plus className="h-5 w-5" />
          {t("addFarm")}
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-4 max-w-md rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-farmer-xl">{t("addNewFarm")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Farm Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <MapPin className="h-5 w-5 text-primary" />
              {t("farmName")} {t("optional")}
            </Label>
            <Input
              placeholder={t("enterFarmName")}
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="h-12 text-farmer-base"
            />
          </div>

          {/* Farm Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Ruler className="h-5 w-5 text-primary" />
              {t("farmSize")} {t("required")}
            </Label>
            <Select value={farmSize} onValueChange={setFarmSize}>
              <SelectTrigger className="h-12 text-farmer-base">
                <SelectValue placeholder={t("selectFarmSize")} />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {farmSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value} className="text-farmer-base py-3">
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crops Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-farmer-base">
              <Wheat className="h-5 w-5 text-primary" />
              {t("selectCrops")} {t("required")}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {crops.map((crop) => (
                <label
                  key={crop.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                    selectedCrops.includes(crop.value)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <Checkbox
                    checked={selectedCrops.includes(crop.value)}
                    onCheckedChange={() => handleCropToggle(crop.value)}
                  />
                  <span className="text-farmer-sm font-medium">{crop.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <Button
            variant="hero"
            size="lg"
            onClick={handleAdd}
            disabled={!isValid}
            className="w-full"
          >
            {t("addFarm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFarmDialog;
