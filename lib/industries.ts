export type Industry = {
  key: string;
  name: string;
  headline: string;        // short promise copy
  examples: string[];      // vendors / line-items we can spot
  commonCategories: string[];
  heroEmoji?: string;
};

export const INDUSTRIES: Industry[] = [
  {
    key: "bakery",
    name: "Bakery & Food Makers",
    headline: "From flour to profit—track COGS and waste without the headache.",
    examples: ["Flour & yeast", "Ovens & smallwares", "Packaging", "DoorDash/Toast fees", "Farmer’s market permits"],
    commonCategories: ["COGS","Utilities","Equipment","Packaging","Marketplace Fees","Marketing & Ads"],
    heroEmoji: "🥐"
  },
  {
    key: "cleaning",
    name: "Cleaning & Janitorial",
    headline: "Supplies, crews, mileage—know your true job costs.",
    examples: ["Disinfectant & rags", "Client site supplies", "Contractor payouts", "Gas & mileage"],
    commonCategories: ["COGS","Contractor Labor","Fuel & Mileage","Supplies","Insurance","Marketing & Ads"],
    heroEmoji: "🧽"
  },
  {
    key: "home_health",
    name: "Home Health / Care",
    headline: "Track caregiver hours, compliance docs, and payer refunds.",
    examples: ["Caregiver payouts", "Background checks", "Liability insurance", "EMR software"],
    commonCategories: ["Contractor Labor","Payroll","Insurance","Software","Training","Travel"],
    heroEmoji: "🩺"
  },
  {
    key: "construction",
    name: "Trades & Construction",
    headline: "Materials, subs, COIs—keep margins clean on every job.",
    examples: ["Lumber & fixtures", "Dump fees", "Subcontractors", "Permits"],
    commonCategories: ["COGS","Contractor Labor","Materials","Fuel & Mileage","Permits","Equipment"],
    heroEmoji: "🛠️"
  },
  {
    key: "beauty",
    name: "Beauty & Personal Care",
    headline: "Inventory, chair rent, bookings—make every service count.",
    examples: ["Products", "Supplies", "Booking fees", "Chair/studio rent"],
    commonCategories: ["COGS","Rent","Software","Supplies","Marketing & Ads","Bank Fees"],
    heroEmoji: "💄"
  }
  // add more as you learn your audience
];
