import { clear, createStore, del, entries, get, set } from "idb-keyval";
import { uid } from "../helper/helper";
import {
  defaultMenuItems,
  defaultRatePlans,
  defaultRoomTypes,
  defaultSettings,
  defaultStaff,
} from "../helper/seedData";
import { buildDemoData } from "../helper/demoData";

/**
 * Browser database (IndexedDB). Sab data isi device/browser me save hota hai.
 * Real backend lagane par sirf store/services/* ke queryFn badalne honge.
 */
const store = createStore("hotel-admin-db", "records");

export const DbKeys = {
  ROOMS: "rooms",
  ROOM_TYPES: "roomTypes",
  RATE_PLANS: "ratePlans",
  GUESTS: "guests",
  STAYS: "stays",
  SETTINGS: "settings",
  RESERVATIONS: "reservations",
  HOUSEKEEPING: "housekeeping",
  MAINTENANCE: "maintenance",
  MENU_ITEMS: "menuItems",
  SERVICE_ORDERS: "serviceOrders",
  STAFF: "staff",
  SHIFTS: "shifts",
  EXPENSES: "expenses",
  IMAGE_PREFIX: "img:",
} as const;

/** Runs read-modify-write tasks one after another so writes never overlap. */
let queue: Promise<unknown> = Promise.resolve();
export const runExclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const result = queue.then(task);
  queue = result.catch(() => undefined);
  return result;
};

const seeds: Record<string, () => unknown> = {
  [DbKeys.ROOM_TYPES]: defaultRoomTypes,
  [DbKeys.RATE_PLANS]: defaultRatePlans,
  [DbKeys.MENU_ITEMS]: defaultMenuItems,
  [DbKeys.STAFF]: defaultStaff,
};

export const seedAllDemoData = async () => {
  const d = buildDemoData();
  await set(DbKeys.ROOM_TYPES, d.types, store);
  await set(DbKeys.RATE_PLANS, d.plans, store);
  await set(DbKeys.ROOMS, d.rooms, store);
  await set(DbKeys.GUESTS, d.guests, store);
  await set(DbKeys.STAYS, d.stays, store);
  await set(DbKeys.RESERVATIONS, d.reservations, store);
  await set(DbKeys.HOUSEKEEPING, d.housekeeping, store);
  await set(DbKeys.MAINTENANCE, d.maintenance, store);
  await set(DbKeys.MENU_ITEMS, d.menuItems, store);
  await set(DbKeys.SERVICE_ORDERS, d.serviceOrders, store);
  await set(DbKeys.STAFF, d.staff, store);
  await set(DbKeys.SHIFTS, d.shifts, store);
  await set(DbKeys.EXPENSES, d.expenses, store);
  await set(DbKeys.SETTINGS, d.settings, store);
};

let initPromise: Promise<void> | null = null;
export const ensureDemoInitialized = () => {
  if (!initPromise) {
    initPromise = (async () => {
      const existingRooms = await get<unknown[]>(DbKeys.ROOMS, store);
      // Auto-populate complete demo dataset if rooms haven't been seeded yet
      if (!existingRooms || existingRooms.length === 0) {
        await seedAllDemoData();
      }
    })().catch((err) => {
      console.error("Auto-seed demo data error:", err);
    });
  }
  return initPromise;
};

export const readList = async <T>(key: string): Promise<T[]> => {
  await ensureDemoInitialized();
  const value = await get<T[]>(key, store);
  if (value !== undefined && (value.length > 0 || key !== DbKeys.ROOMS)) return value;
  const seed = seeds[key]?.();
  if (seed) {
    await set(key, seed, store);
    return seed as T[];
  }
  return value ?? [];
};

export const writeList = async <T>(key: string, list: T[]): Promise<void> => {
  await set(key, list, store);
};

export const readSettings = async () => {
  await ensureDemoInitialized();
  return {
    ...defaultSettings,
    ...((await get<typeof defaultSettings>(DbKeys.SETTINGS, store)) ?? {}),
  };
};

export const writeSettings = async (value: typeof defaultSettings) => {
  await set(DbKeys.SETTINGS, value, store);
};

/* ---------- ID images (stored one key each, so lists stay light) ---------- */

export const saveImage = async (dataUrl: string): Promise<string> => {
  const key = `${DbKeys.IMAGE_PREFIX}${uid()}`;
  await set(key, dataUrl, store);
  return key;
};

export const readImage = async (key: string): Promise<string | null> =>
  (await get<string>(key, store)) ?? null;

export const deleteImage = async (key: string): Promise<void> => {
  if (key) await del(key, store);
};

/** New photo (data URL) -> saved & key returned. Existing key -> unchanged. */
export const persistImage = async (value?: string): Promise<string> => {
  if (!value) return "";
  return value.startsWith("data:") ? saveImage(value) : value;
};

/* ---------- Backup / restore ---------- */

export const exportAll = async (): Promise<Record<string, unknown>> =>
  Object.fromEntries((await entries(store)).map(([k, v]) => [String(k), v]));

export const importAll = async (data: Record<string, unknown>) => {
  await clear(store);
  for (const [key, value] of Object.entries(data)) {
    await set(key, value, store);
  }
};

export const clearAll = async () => clear(store);
