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
import type { HotelExpense, Room, RoomType } from "../interfaces/Interface";

/**
 * Browser database (IndexedDB). Sab data isi device/browser me save hota hai.
 * Real backend lagane par sirf store/services/* ke queryFn badalne honge.
 */
const store = createStore("hotel-admin-db", "records");
const backendBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
const demoSeedDisabledKey = "__meta:demo-seed-disabled";

const backendStorageUrl = `${backendBaseUrl}/api/storage`;

const ensureSuccessfulResponse = async (response: Response) => {
  if (response.ok) return;
  const detail = await response.text().catch(() => "");
  throw new Error(detail || `Hotel API request failed (${response.status}).`);
};

const readValue = async <T>(key: string): Promise<T | undefined> => {
  if (!backendBaseUrl) return get<T>(key, store);

  const response = await fetch(`${backendStorageUrl}/${encodeURIComponent(key)}`);
  if (response.status === 404) return undefined;
  await ensureSuccessfulResponse(response);
  return response.json() as Promise<T>;
};

const writeValue = async (key: string, value: unknown): Promise<void> => {
  if (!backendBaseUrl) {
    await set(key, value, store);
    return;
  }

  const response = await fetch(`${backendStorageUrl}/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  await ensureSuccessfulResponse(response);
};

const deleteValue = async (key: string): Promise<void> => {
  if (!backendBaseUrl) {
    await del(key, store);
    return;
  }

  const response = await fetch(`${backendStorageUrl}/${encodeURIComponent(key)}`, { method: "DELETE" });
  if (response.status !== 404) await ensureSuccessfulResponse(response);
};

const readEntries = async (): Promise<[IDBValidKey, unknown][]> => {
  if (!backendBaseUrl) return entries(store);

  const response = await fetch(backendStorageUrl);
  await ensureSuccessfulResponse(response);
  const values = (await response.json()) as Record<string, unknown>;
  return Object.entries(values);
};

const clearValues = async (): Promise<void> => {
  if (!backendBaseUrl) {
    await clear(store);
    return;
  }

  const response = await fetch(backendStorageUrl, { method: "DELETE" });
  await ensureSuccessfulResponse(response);
};

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

export const isBackendStorageEnabled = Boolean(backendBaseUrl);

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
  await writeValue(DbKeys.ROOM_TYPES, d.types);
  await writeValue(DbKeys.RATE_PLANS, d.plans);
  await writeValue(DbKeys.ROOMS, d.rooms);
  await writeValue(DbKeys.GUESTS, d.guests);
  await writeValue(DbKeys.STAYS, d.stays);
  await writeValue(DbKeys.RESERVATIONS, d.reservations);
  await writeValue(DbKeys.HOUSEKEEPING, d.housekeeping);
  await writeValue(DbKeys.MAINTENANCE, d.maintenance);
  await writeValue(DbKeys.MENU_ITEMS, d.menuItems);
  await writeValue(DbKeys.SERVICE_ORDERS, d.serviceOrders);
  await writeValue(DbKeys.STAFF, d.staff);
  await writeValue(DbKeys.SHIFTS, d.shifts);
  await writeValue(DbKeys.EXPENSES, d.expenses);
  await writeValue(DbKeys.SETTINGS, d.settings);
  await deleteValue(demoSeedDisabledKey);
};

let initPromise: Promise<void> | null = null;
export const ensureDemoInitialized = () => {
  if (!initPromise) {
    initPromise = (async () => {
      const existingRooms = await readValue<Room[]>(DbKeys.ROOMS);
      const demoSeedDisabled = await readValue<boolean>(demoSeedDisabledKey);
      // Auto-populate complete demo dataset if rooms haven't been seeded yet
      if ((!existingRooms || existingRooms.length === 0) && !demoSeedDisabled) {
        await seedAllDemoData();
      } else {
        // Upgrade existing room types and rooms if images or diverse categories are missing
        const existingTypes = await readValue<RoomType[]>(DbKeys.ROOM_TYPES);
        if (existingRooms && existingRooms.length > 0 && (!existingTypes || existingTypes.length < 6 || !existingTypes[0]?.image)) {
          const freshTypes = defaultRoomTypes();
          await writeValue(DbKeys.ROOM_TYPES, freshTypes);
          const enrichedRooms = existingRooms.map((r, i) => {
            const matched = freshTypes.find((t) => t.id === r.roomTypeId) || freshTypes[i % freshTypes.length];
            return {
              ...r,
              image: r.image || matched.image,
              images: r.images || matched.images,
              bedType: r.bedType || matched.bedConfig,
            };
          });
          await writeValue(DbKeys.ROOMS, enrichedRooms);
        }

        const existingExpenses = await readValue<HotelExpense[]>(DbKeys.EXPENSES);
        if (existingRooms && existingRooms.length > 0 && (!existingExpenses || existingExpenses.length < 8)) {
          const freshDemo = buildDemoData();
          await writeValue(DbKeys.EXPENSES, freshDemo.expenses);
        }
      }
    })().catch((err) => {
      console.error("Auto-seed demo data error:", err);
    });
  }
  return initPromise;
};

export const readList = async <T>(key: string): Promise<T[]> => {
  await ensureDemoInitialized();
  const value = await readValue<T[]>(key);
  if (value !== undefined && (value.length > 0 || key !== DbKeys.ROOMS)) return value;
  const seed = seeds[key]?.();
  if (seed) {
    await writeValue(key, seed);
    return seed as T[];
  }
  return value ?? [];
};

export const writeList = async <T>(key: string, list: T[]): Promise<void> => {
  await writeValue(key, list);
};

export const readSettings = async () => {
  await ensureDemoInitialized();
  return {
    ...defaultSettings,
    ...((await readValue<typeof defaultSettings>(DbKeys.SETTINGS)) ?? {}),
  };
};

export const writeSettings = async (value: typeof defaultSettings) => {
  await writeValue(DbKeys.SETTINGS, value);
};

/* ---------- ID images (stored one key each, so lists stay light) ---------- */

export const saveImage = async (dataUrl: string): Promise<string> => {
  const key = `${DbKeys.IMAGE_PREFIX}${uid()}`;
  await writeValue(key, dataUrl);
  return key;
};

export const readImage = async (key: string): Promise<string | null> =>
  (await readValue<string>(key)) ?? null;

export const deleteImage = async (key: string): Promise<void> => {
  if (key) await deleteValue(key);
};

/** New photo (data URL) -> saved & key returned. Existing key -> unchanged. */
export const persistImage = async (value?: string): Promise<string> => {
  if (!value) return "";
  return value.startsWith("data:") ? saveImage(value) : value;
};

/* ---------- Backup / restore ---------- */

export const exportAll = async (): Promise<Record<string, unknown>> =>
  Object.fromEntries(
    (await readEntries())
      .filter(([key]) => String(key) !== demoSeedDisabledKey)
      .map(([key, value]) => [String(key), value])
  );

export const importAll = async (data: Record<string, unknown>) => {
  const nextData = { ...data };
  if (!nextData[DbKeys.ROOMS]) nextData[demoSeedDisabledKey] = true;

  if (backendBaseUrl) {
    const response = await fetch(`${backendStorageUrl}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextData),
    });
    await ensureSuccessfulResponse(response);
    return;
  }

  await clear(store);
  for (const [key, value] of Object.entries(nextData)) await set(key, value, store);
};

export const clearAll = async () => {
  await clearValues();
  await writeValue(demoSeedDisabledKey, true);
};
