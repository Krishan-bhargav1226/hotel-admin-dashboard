import type { Room, RoomCategory, RoomType } from "../interfaces/Interface";
import { API_BASE_URL } from "../../store/services/baseQuery";

export interface RoomPhotoMeta {
  id: string;
  name: string;
  category?: RoomCategory;
  guestTypeLabel: string;
  suitableFor?: string;
  guestDescription: string;
  bedConfig: string;
  maxGuests: number;
  sizeSqFt: number;
  basePrice: number;
  badge: string;
  badgeColor: string;
  primaryImage: string;
  image?: string;
  gallery: string[];
  amenities: string[];
}

const CATEGORIES = new Set<RoomCategory>(["COUPLE", "SOLO", "FAMILY", "ACCESSIBLE", "PRESIDENTIAL", "BUDGET"]);

export const CATEGORY_FALLBACK_IMAGES: Record<RoomCategory, string> = {
  COUPLE: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  SOLO: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
  FAMILY: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
  ACCESSIBLE: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  PRESIDENTIAL: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  BUDGET: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
};

export const DEFAULT_HOTEL_ROOM_PHOTO = "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80";

export const CATEGORY_FALLBACK_GALLERIES: Record<RoomCategory, string[]> = {
  COUPLE: [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
  ],
  SOLO: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  ],
  FAMILY: [
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  ],
  ACCESSIBLE: [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
  ],
  PRESIDENTIAL: [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  ],
  BUDGET: [
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
  ],
};

export const getFallbackRoomPhoto = (category?: RoomCategory | ""): string => {
  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }
  return DEFAULT_HOTEL_ROOM_PHOTO;
};

export const resolveRoomImageUrl = (url?: string | null, category?: RoomCategory | ""): string => {
  if (!url || typeof url !== "string" || !url.trim()) {
    return getFallbackRoomPhoto(category);
  }
  const clean = url.trim();
  if (clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    if (clean.includes("localhost:7444/Documents/") && !origin.includes("localhost:7444")) {
      return clean.replace(/https?:\/\/[^/]+\/Documents\//, `${origin}/Documents/`);
    }
    return clean;
  }
  return `${origin}${clean.startsWith("/") ? "" : "/"}${clean}`;
};

const asCategory = (value: unknown): RoomCategory | undefined =>
  typeof value === "string" && CATEGORIES.has(value as RoomCategory) ? (value as RoomCategory) : undefined;

const asList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Amenities are sometimes stored as a comma-separated string.
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const numberOr = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getRoomPhoto = (room?: Partial<Room> | null, roomType?: Partial<RoomType> | null): string => {
  const category = asCategory(room?.category || roomType?.category);
  const raw = room?.image || roomType?.image || (room?.images && room.images[0]) || (roomType?.images && roomType.images[0]);
  return resolveRoomImageUrl(raw, category);
};

export const getRoomGallery = (room?: Partial<Room> | null, roomType?: Partial<RoomType> | null): string[] => {
  const category = asCategory(room?.category || roomType?.category);
  const rawList = room?.images && room.images.length > 0
    ? room.images
    : roomType?.images && roomType.images.length > 0
    ? roomType.images
    : null;

  if (rawList && rawList.length > 0) {
    return rawList.map((img) => resolveRoomImageUrl(img, category));
  }

  const single = room?.image || roomType?.image;
  if (single) {
    return [resolveRoomImageUrl(single, category)];
  }

  if (category && CATEGORY_FALLBACK_GALLERIES[category]) {
    return CATEGORY_FALLBACK_GALLERIES[category];
  }

  return [DEFAULT_HOTEL_ROOM_PHOTO];
};

export const getRoomMeta = (room?: Partial<Room> | null, roomType?: Partial<RoomType> | null): RoomPhotoMeta => {
  const category = asCategory(room?.category || roomType?.category);
  const image = getRoomPhoto(room, roomType);
  const roomAmenities = asList(room?.amenities);
  const amenities = roomAmenities.length > 0 ? roomAmenities : asList(roomType?.amenities);
  return {
    id: roomType?.id || room?.roomTypeId || "",
    name: roomType?.name || (room?.number ? `Room ${room.number}` : "Room"),
    category,
    guestTypeLabel: room?.suitableFor || roomType?.suitableFor || "",
    suitableFor: room?.suitableFor || roomType?.suitableFor || "",
    guestDescription: roomType?.description || room?.notes || "",
    bedConfig: room?.bedType || room?.bedConfig || roomType?.bedConfig || "",
    maxGuests: numberOr(room?.maxGuests || roomType?.maxGuests),
    sizeSqFt: numberOr(room?.sizeSqFt || roomType?.sizeSqFt),
    basePrice: numberOr(room?.basePrice || roomType?.basePrice),
    badge: room?.badge || roomType?.badge || "",
    badgeColor: "bg-slate-50 text-slate-700 border border-slate-200",
    primaryImage: image,
    image: image || undefined,
    gallery: getRoomGallery(room, roomType),
    amenities,
  };
};
