export interface Farm {
  id: string;
  name: string;
  size: string;
  crops: string[];
}

export interface FarmerProfile {
  name: string;
  location: string;
  village: string;
  farms: Farm[];
  farmingSeason: string;
}

export const generateFarmId = (): string => {
  return `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
