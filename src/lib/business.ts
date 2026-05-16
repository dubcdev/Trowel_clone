export type BusinessProfile = {
  id: string;
  name: string;
  legalName: string;
  location: string;
  publicPhone: string;
  website: string;
  tradeCategories: string[];
  ownerUserId: string;
  timezone: string;
  status: "setup" | "ready" | "live" | "paused";
};

export const activeBusiness: BusinessProfile = {
  id: "business-bayview",
  name: "Bayview HVAC & Plumbing",
  legalName: "Bayview HVAC & Plumbing",
  location: "Hayward, CA",
  publicPhone: "(510) 555-0142",
  website: "https://bayviewhvacplumbing.example",
  tradeCategories: ["HVAC", "Plumbing"],
  ownerUserId: "user-jason-owner",
  timezone: "America/Los_Angeles",
  status: "ready",
};
