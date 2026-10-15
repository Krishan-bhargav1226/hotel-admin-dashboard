import type { Room, RoomType } from "../interfaces/Interface";

export interface RoomPhotoMeta {
  id: string;
  name: string;
  category: "COUPLE" | "SOLO" | "FAMILY" | "ACCESSIBLE" | "PRESIDENTIAL" | "BUDGET";
  guestTypeLabel: string;
  suitableFor?: string;
  guestDescription: string;
  bedConfig: string;
  maxGuests: number;
  sizeSqFt: number;
  basePrice: number;
  badge: string;
  badgeColor: string; // tailwind color class
  primaryImage: string;
  image?: string;
  gallery: string[];
  amenities: string[];
}

export const ROOM_CATALOG: Record<string, RoomPhotoMeta> = {
  "type-standard": {
    id: "type-standard",
    name: "Deluxe King Room",
    category: "COUPLE",
    guestTypeLabel: "Couples & Honeymooners",
    guestDescription: "Designed for couples seeking romance, comfort, and serenity with ambient lighting & bathtub.",
    bedConfig: "1 California King Bed",
    maxGuests: 2,
    sizeSqFt: 380,
    basePrice: 2800,
    badge: "Romantic & Couple Friendly",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    primaryImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: ["Plush King Bed", "Ensuite Bathtub", "4K Smart TV", "Ambient Mood Lighting", "City View Balcony", "High-Speed WiFi"],
  },
  "type-deluxe": {
    id: "type-deluxe",
    name: "Executive Business Studio",
    category: "SOLO",
    guestTypeLabel: "Solo Travelers & Corporate Executives",
    guestDescription: "Engineered for productive remote work and restful sleep with 300Mbps fiber WiFi & ergonomic desk.",
    bedConfig: "1 Queen Bed + Workstation",
    maxGuests: 2,
    sizeSqFt: 340,
    basePrice: 3200,
    badge: "Business & Solo Travel",
    badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
    primaryImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: ["Ergonomic Work Desk", "300 Mbps Fiber WiFi", "Nespresso Machine", "Soundproof Windows", "Universal Charging Dock", "Express Laundry"],
  },
  "type-family": {
    id: "type-family",
    name: "Grand Family 2-Bedroom Suite",
    category: "FAMILY",
    guestTypeLabel: "Families & Small Groups (3-5 Guests)",
    guestDescription: "Spacious inter-connected suite with separate kids room, lounge area, and family kitchenette.",
    bedConfig: "1 King Bed + 2 Twin Beds + Sofa",
    maxGuests: 5,
    sizeSqFt: 640,
    basePrice: 5200,
    badge: "Family & Group Friendly",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    primaryImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: ["Interconnecting Rooms", "2 Full Bathrooms", "Microwave & Mini-Fridge", "Kids Welcome Kit", "Streaming TV (Disney+/Netflix)", "Extra Rollaway Bed"],
  },
  "type-accessible": {
    id: "type-accessible",
    name: "Accessible Barrier-Free Deluxe",
    category: "ACCESSIBLE",
    guestTypeLabel: "Senior Citizens & Wheelchair Accessible",
    guestDescription: "100% barrier-free design with zero step thresholds, roll-in shower, wall grab bars & emergency alert system.",
    bedConfig: "1 Low-Profile King Bed",
    maxGuests: 3,
    sizeSqFt: 420,
    basePrice: 3000,
    badge: "Accessibility Certified",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    primaryImage: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: ["Wide 36\" Doorways", "Roll-In Shower with Bench", "Safety Grab Bars", "Emergency Call Pull-Cord", "Lowered Light Switches", "Ground Floor Access"],
  },
  "type-suite": {
    id: "type-suite",
    name: "Presidential Panoramic Penthouse",
    category: "PRESIDENTIAL",
    guestTypeLabel: "VIP Guests, Celebrities & Luxury Lovers",
    guestDescription: "The ultimate luxury penthouse on the highest floor with private heated jacuzzi, personal butler & private bar.",
    bedConfig: "1 Emperor King Bed + Private Terrace",
    maxGuests: 4,
    sizeSqFt: 960,
    basePrice: 8500,
    badge: "Ultra Luxury VIP",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
    primaryImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: ["Panoramic Skyline Terrace", "Outdoor Heated Jacuzzi", "24/7 Dedicated Butler", "Private Lounge & Bar", "Walk-in Dressing Room", "Bose Surround Sound"],
  },
  "type-budget": {
    id: "type-budget",
    name: "Urban Cozy Transit Queen",
    category: "BUDGET",
    guestTypeLabel: "Solo Transit & Budget-Conscious Stays",
    guestDescription: "Smart, immaculate and modern compact bedroom ideal for quick transit, overnight layovers, and light packers.",
    bedConfig: "1 Premium Queen Bed",
    maxGuests: 2,
    sizeSqFt: 250,
    basePrice: 1900,
    badge: "Transit & Budget Friendly",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    primaryImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
    ],
    amenities: ["Ultra-Comfort Queen Bed", "Power Rain Shower", "Contactless Keycard Entry", "Free Fast WiFi", "Mineral Water Bottles", "Sound-dampening Walls"],
  },
};

/** Get the best matching image for any room or room type with graceful fallbacks */
export const getRoomPhoto = (room?: Partial<Room> | null, roomType?: Partial<RoomType> | null): string => {
  if (room?.image) return room.image;
  if (roomType?.image) return roomType.image;

  // Match by roomTypeId
  const typeId = room?.roomTypeId || roomType?.id;
  if (typeId && ROOM_CATALOG[typeId]) {
    return ROOM_CATALOG[typeId].primaryImage;
  }

  // Fallback by name heuristics
  const name = (roomType?.name || "").toLowerCase();
  if (name.includes("suite") || name.includes("presidential") || name.includes("penthouse")) {
    return ROOM_CATALOG["type-suite"].primaryImage;
  }
  if (name.includes("family")) {
    return ROOM_CATALOG["type-family"].primaryImage;
  }
  if (name.includes("executive") || name.includes("business")) {
    return ROOM_CATALOG["type-deluxe"].primaryImage;
  }
  if (name.includes("access") || name.includes("barrier")) {
    return ROOM_CATALOG["type-accessible"].primaryImage;
  }
  if (name.includes("budget") || name.includes("transit") || name.includes("cozy") || name.includes("standard")) {
    return ROOM_CATALOG["type-budget"].primaryImage;
  }

  return ROOM_CATALOG["type-standard"].primaryImage;
};

/** Get the catalog metadata for any room or room type */
export const getRoomMeta = (room?: Partial<Room> | null, roomType?: Partial<RoomType> | null): RoomPhotoMeta => {
  const typeId = room?.roomTypeId || roomType?.id;
  let meta: RoomPhotoMeta;

  if (typeId && ROOM_CATALOG[typeId]) {
    meta = ROOM_CATALOG[typeId];
  } else {
    const name = (roomType?.name || "").toLowerCase();
    if (name.includes("presidential") || name.includes("penthouse")) meta = ROOM_CATALOG["type-suite"];
    else if (name.includes("family")) meta = ROOM_CATALOG["type-family"];
    else if (name.includes("executive") || name.includes("business")) meta = ROOM_CATALOG["type-deluxe"];
    else if (name.includes("access") || name.includes("barrier")) meta = ROOM_CATALOG["type-accessible"];
    else if (name.includes("budget") || name.includes("transit") || name.includes("cozy")) meta = ROOM_CATALOG["type-budget"];
    else meta = ROOM_CATALOG["type-standard"];
  }

  return {
    ...meta,
    image: meta.primaryImage,
    suitableFor: meta.guestTypeLabel,
  };
};

/** Gallery of photos for a room */
export const getRoomGallery = (room?: Partial<Room> | null, roomType?: Partial<RoomType> | null): string[] => {
  if (room?.images && room.images.length > 0) return room.images;
  if (roomType?.images && roomType.images.length > 0) return roomType.images;
  return getRoomMeta(room, roomType).gallery;
};
