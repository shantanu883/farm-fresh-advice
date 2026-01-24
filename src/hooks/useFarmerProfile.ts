import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FarmerProfile, Farm } from "@/types/farm";

interface DatabaseProfile {
  id: string;
  user_id: string;
  name: string | null;
  location: string;
  village: string | null;
  farming_season: string;
}

interface DatabaseFarm {
  id: string;
  user_id: string;
  name: string | null;
  size: string;
  crops: string[];
}

export const useFarmerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile and farms from database
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Fetch farms
      const { data: farmsData, error: farmsError } = await supabase
        .from("farms")
        .select("*")
        .eq("user_id", user.id);

      if (farmsError) throw farmsError;

      if (profileData) {
        const dbProfile = profileData as DatabaseProfile;
        const dbFarms = (farmsData || []) as DatabaseFarm[];
        
        const farmerProfile: FarmerProfile = {
          name: dbProfile.name || "",
          location: dbProfile.location,
          village: dbProfile.village || "",
          farmingSeason: dbProfile.farming_season,
          farms: dbFarms.map((f) => ({
            id: f.id,
            name: f.name || "",
            size: f.size,
            crops: f.crops,
          })),
        };
        
        setProfile(farmerProfile);
        // Also update localStorage for offline access
        localStorage.setItem("farmerProfile", JSON.stringify(farmerProfile));
        localStorage.setItem("onboardingComplete", "true");
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
      
      // Fallback to localStorage
      const saved = localStorage.getItem("farmerProfile");
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing local profile:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Save profile to database
  const saveProfile = async (newProfile: FarmerProfile): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    try {
      // Upsert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          name: newProfile.name || null,
          location: newProfile.location,
          village: newProfile.village || null,
          farming_season: newProfile.farmingSeason,
        }, { onConflict: "user_id" });

      if (profileError) throw profileError;

      // Delete existing farms and insert new ones
      const { error: deleteError } = await supabase
        .from("farms")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Insert new farms
      if (newProfile.farms.length > 0) {
        const farmsToInsert = newProfile.farms.map((farm) => ({
          user_id: user.id,
          name: farm.name || null,
          size: farm.size,
          crops: farm.crops,
        }));

        const { error: insertError } = await supabase
          .from("farms")
          .insert(farmsToInsert);

        if (insertError) throw insertError;
      }

      // Update local state and storage
      setProfile(newProfile);
      localStorage.setItem("farmerProfile", JSON.stringify(newProfile));
      localStorage.setItem("onboardingComplete", "true");

      return { error: null };
    } catch (err) {
      console.error("Error saving profile:", err);
      return { error: err as Error };
    }
  };

  // Check if profile exists
  const hasProfile = (): boolean => {
    return profile !== null && profile.location !== "" && profile.farms.length > 0;
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    saveProfile,
    hasProfile,
    refetch: fetchProfile,
  };
};
