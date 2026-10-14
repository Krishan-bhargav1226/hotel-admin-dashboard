import type {
  HotelSettings,
  MenuItem,
  RatePlan,
  RoomType,
  StaffMember,
} from "../interfaces/Interface";

const now = () => new Date().toISOString();

export const defaultSettings: HotelSettings = {
  hotelName: "Grand Horizon Hotel & Suites",
  address: "Sector 14, Commercial Hub, Gurgaon, Haryana, 122001",
  phone: "+91 98765 43210",
  email: "frontdesk@grandhorizon.com",
  website: "www.grandhorizonhotel.com",
  gstin: "07AAAAA0000A1Z5",
  upiId: "grandhorizon@okaxis",
  taxPercent: 12,
  autoCleaning: true,
  currencySymbol: "₹",
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM",
};

export const defaultRoomTypes = (): RoomType[] => [
  { id: "type-standard", name: "Deluxe King", description: "Spacious king-size bed, high-speed WiFi, smart TV and city view", createdAt: now() },
  { id: "type-deluxe", name: "Executive Suite", description: "Separate living area, minibar, jacuzzi bath and premium amenities", createdAt: now() },
  { id: "type-suite", name: "Presidential Luxury Suite", description: "Penthouse floor, panoramic view, complimentary butler and private lounge access", createdAt: now() },
];

export const defaultRatePlans = (): RatePlan[] => {
  const base = {
    durationHours: 0,
    checkoutTime: "11:00",
    minHours: 1,
    overtimeRate: 250,
    graceMinutes: 15,
    roomTypeIds: [],
    isActive: true,
    createdAt: now(),
  };
  return [
    { ...base, id: "plan-hourly", name: "Hourly Short Stay (3h)", kind: "HOURLY", rate: 450, minHours: 2 },
    {
      ...base,
      id: "plan-day",
      name: "Day Use Pass (8 AM - 8 PM)",
      kind: "TILL_TIME",
      rate: 1500,
      checkoutTime: "20:00",
      overtimeRate: 300,
    },
    {
      ...base,
      id: "plan-24h",
      name: "Standard Nightly Stay (24h)",
      kind: "FIXED",
      rate: 2800,
      durationHours: 24,
      overtimeRate: 350,
    },
    {
      ...base,
      id: "plan-premium",
      name: "Luxury Suite Package",
      kind: "FIXED",
      rate: 4500,
      durationHours: 24,
      overtimeRate: 500,
    },
  ];
};

export const defaultMenuItems = (): MenuItem[] => [
  { id: "m-1", name: "Continental Breakfast Buffet", category: "BREAKFAST", price: 350, isAvailable: true, description: "Eggs, toasts, sausages, fresh juice & coffee" },
  { id: "m-2", name: "Masala Dosa / Idli Platter", category: "BREAKFAST", price: 220, isAvailable: true, description: "Served with sambar and 3 types of chutneys" },
  { id: "m-3", name: "Paneer Butter Masala + 2 Naan", category: "MAIN_COURSE", price: 380, isAvailable: true, description: "Rich buttery cottage cheese gravy" },
  { id: "m-4", name: "Hyderabadi Chicken Dum Biryani", category: "MAIN_COURSE", price: 420, isAvailable: true, description: "Aromatic basmati rice cooked with tender spiced chicken" },
  { id: "m-5", name: "Club Sandwich with Fries", category: "SNACKS", price: 260, isAvailable: true, description: "Triple decker toasted sandwich with crispy golden fries" },
  { id: "m-6", name: "Cold Brew / Cappuccino Coffee", category: "BEVERAGES", price: 160, isAvailable: true, description: "Freshly roasted arabica bean coffee" },
  { id: "m-7", name: "Mineral Water (1L)", category: "BEVERAGES", price: 50, isAvailable: true, description: "Packaged sealed mineral water" },
  { id: "m-8", name: "Express Laundry & Ironing (Per Pair)", category: "LAUNDRY", price: 180, isAvailable: true, description: "Same day washed, pressed and neatly packed" },
  { id: "m-9", name: "Extra Rollaway Bed with Linens", category: "EXTRA_SERVICE", price: 800, isAvailable: true, description: "Includes extra soft pillow and warm blanket" },
  { id: "m-10", name: "Airport Pick-up / Drop Sedan", category: "EXTRA_SERVICE", price: 1200, isAvailable: true, description: "Private AC cab with chauffeur" },
];

export const defaultStaff = (): StaffMember[] => [
  { id: "st-1", name: "Vikram Malhotra", role: "MANAGER", phone: "9876500001", shift: "FULL_DAY", status: "ON_DUTY", joinedDate: "2024-01-10" },
  { id: "st-2", name: "Aarav Sharma", role: "RECEPTIONIST", phone: "9876500002", shift: "MORNING", status: "ON_DUTY", joinedDate: "2024-03-15" },
  { id: "st-3", name: "Sneha Patel", role: "RECEPTIONIST", phone: "9876500003", shift: "EVENING", status: "ON_DUTY", joinedDate: "2024-05-20" },
  { id: "st-4", name: "Rameshwar Yadav", role: "HOUSEKEEPING", phone: "9876500004", shift: "MORNING", status: "ON_DUTY", joinedDate: "2024-02-01" },
  { id: "st-5", name: "Sunita Devi", role: "HOUSEKEEPING", phone: "9876500005", shift: "EVENING", status: "ON_DUTY", joinedDate: "2024-04-12" },
  { id: "st-6", name: "Chef Sanjeev Negi", role: "CHEF", phone: "9876500006", shift: "MORNING", status: "ON_DUTY", joinedDate: "2024-01-25" },
  { id: "st-7", name: "Kishore Kumar", role: "MAINTENANCE", phone: "9876500007", shift: "FULL_DAY", status: "ON_DUTY", joinedDate: "2024-06-01" },
];

