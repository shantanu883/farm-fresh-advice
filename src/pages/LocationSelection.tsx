import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { MapPin, Navigation, ArrowRight } from "lucide-react";

const LocationSelection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [isGPSLoading, setIsGPSLoading] = useState(false);

  const handleGPSClick = () => {
    setIsGPSLoading(true);
    // Simulate GPS detection
    setTimeout(() => {
      setLocation("Hyderabad, Telangana");
      setIsGPSLoading(false);
    }, 1500);
  };

  const handleContinue = () => {
    if (location.trim()) {
      navigate("/crop-selection");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Select Location" showBack />

      <div className="mx-auto max-w-md space-y-6">
        {/* Location illustration */}
        <div className="flex justify-center py-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary/20">
            <MapPin className="h-12 w-12 text-secondary" />
          </div>
        </div>

        <p className="text-center text-farmer-base text-muted-foreground">
          Enter your city or district to get location-specific weather and farming advice.
        </p>

        {/* Manual Input */}
        <Card className="card-elevated p-5">
          <label className="mb-3 block text-farmer-base font-semibold text-foreground">
            Enter City / District
          </label>
          <Input
            type="text"
            placeholder="e.g., Hyderabad, Nagpur..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-14 text-farmer-base"
          />
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-farmer-sm text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* GPS Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleGPSClick}
          disabled={isGPSLoading}
          className="w-full"
        >
          <Navigation className={isGPSLoading ? "animate-pulse" : ""} />
          {isGPSLoading ? "Detecting Location..." : "Use GPS Location"}
        </Button>

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            variant="hero"
            size="xl"
            onClick={handleContinue}
            disabled={!location.trim()}
            className="w-full"
          >
            Continue
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelection;
