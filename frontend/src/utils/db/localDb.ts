import { clear, createStore, del, entries, get, set } from "idb-keyval";
import { uid } from "../helper/helper";
import {
  defaultLostAndFound,
  defaultMenuItems,
  defaultNightAudits,
  defaultProperties,
  defaultRatePlans,
  defaultRoomTypes,
  defaultSettings,
  defaultStaff,
} from "../helper/seedData";
import { buildDemoData } from "../helper/demoData";
import type { HotelExpense, HotelProperty, Room, RoomType, StaffMember } from "../interfaces/Interface";

/**
 * Browser database (IndexedDB). Sab data isi device/browser me save hota hai.
 * This demo keeps app data on-device; there is no API server dependency.
 */
const store = createStore("hotel-admin-db", "records");
const demoSeedDisabledKey = "__meta:demo-seed-disabled";

const readValue = async <T>(key: string): Promise<T | undefined> => {
  return get<T>(key, store);
};

const writeValue = async (key: string, value: unknown): Promise<void> => {
  await set(key, value, store);
};

const deleteValue = async (key: string): Promise<void> => {
  await del(key, store);
};

const readEntries = async (): Promise<[IDBValidKey, unknown][]> => entries(store);

const clearValues = async (): Promise<void> => clear(store);

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
  PROPERTIES: "properties",
  LOST_AND_FOUND: "lostAndFound",
  NIGHT_AUDITS: "nightAudits",
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
  [DbKeys.PROPERTIES]: defaultProperties,
  [DbKeys.LOST_AND_FOUND]: defaultLostAndFound,
  [DbKeys.NIGHT_AUDITS]: defaultNightAudits,
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
  await writeValue(DbKeys.PROPERTIES, defaultProperties());
  await writeValue(DbKeys.LOST_AND_FOUND, defaultLostAndFound());
  await writeValue(DbKeys.NIGHT_AUDITS, defaultNightAudits());
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

        const existingProperties = await readValue<HotelProperty[]>(DbKeys.PROPERTIES);
        if (existingProperties?.some((property) => property.id === "prop-3")) {
          const remaining = existingProperties.filter((property) => property.id !== "prop-3");
          const activeWasRemoved = existingProperties.some((property) => property.id === "prop-3" && property.active);
          const nextProperties = (remaining.length ? remaining : defaultProperties()).map((property, index) => ({
            ...property,
            active: activeWasRemoved ? index === 0 : property.active,
          }));
          await writeValue(DbKeys.PROPERTIES, nextProperties);

          const existingStaff = await readValue<StaffMember[]>(DbKeys.STAFF);
          if (existingStaff) {
            await writeValue(DbKeys.STAFF, existingStaff.filter((member) => member.propertyId !== "prop-3"));
          }

          if (activeWasRemoved) {
            const activeProperty = nextProperties[0];
            const currentSettings = {
              ...defaultSettings,
              ...((await readValue<typeof defaultSettings>(DbKeys.SETTINGS)) ?? {}),
            };
            await writeValue(DbKeys.SETTINGS, {
              ...currentSettings,
              hotelName: activeProperty.name,
              brandTier: activeProperty.brandTier || currentSettings.brandTier,
              address: activeProperty.address,
              phone: activeProperty.phone,
              email: activeProperty.email,
              gstin: activeProperty.gstin,
              upiId: activeProperty.upiId,
            });
          }
        }

        const existingStaff = await readValue<StaffMember[]>(DbKeys.STAFF);
        if (existingStaff?.some((member) => member.propertyId === "ALL" && member.propertyName !== "Chain-wide (All Properties)")) {
          await writeValue(
            DbKeys.STAFF,
            existingStaff.map((member) =>
              member.propertyId === "ALL"
                ? { ...member, propertyName: "Chain-wide (All Properties)" }
                : member
            )
          );
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

export const setActiveHotelProperty = async (propertyId: string): Promise<HotelProperty | null> => {
  return runExclusive(async () => {
    let list = await readList<HotelProperty>(DbKeys.PROPERTIES);
    if (!list.length) {
      list = defaultProperties();
      await writeValue(DbKeys.PROPERTIES, list);
    }
    const target = list.find((p) => p.id === propertyId);
    if (!target) return null;

    const updatedList = list.map((p) => ({
      ...p,
      active: p.id === propertyId,
    }));
    await writeList(DbKeys.PROPERTIES, updatedList);

    const currentSettings = await readSettings();
    await writeSettings({
      ...currentSettings,
      hotelName: target.name,
      brandTier: target.brandTier || currentSettings.brandTier,
      address: target.address,
      phone: target.phone,
      email: target.email,
      gstin: target.gstin,
      upiId: target.upiId,
    });

    return target;
  });
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

  const importedProperties = nextData[DbKeys.PROPERTIES] as HotelProperty[] | undefined;
  if (importedProperties?.some((property) => property.id === "prop-3")) {
    const properties = importedProperties.filter((property) => property.id !== "prop-3");
    const activeWasRemoved = importedProperties.some((property) => property.id === "prop-3" && property.active);
    nextData[DbKeys.PROPERTIES] = (properties.length ? properties : defaultProperties()).map((property, index) => ({
      ...property,
      active: activeWasRemoved ? index === 0 : property.active,
    }));

    if (activeWasRemoved) {
      const activeProperty = (nextData[DbKeys.PROPERTIES] as HotelProperty[])[0];
      const importedSettings = nextData[DbKeys.SETTINGS] as typeof defaultSettings | undefined;
      nextData[DbKeys.SETTINGS] = {
        ...defaultSettings,
        ...importedSettings,
        hotelName: activeProperty.name,
        brandTier: activeProperty.brandTier || importedSettings?.brandTier || defaultSettings.brandTier,
        address: activeProperty.address,
        phone: activeProperty.phone,
        email: activeProperty.email,
        gstin: activeProperty.gstin,
        upiId: activeProperty.upiId,
      };
    }
  }

  const importedStaff = nextData[DbKeys.STAFF] as StaffMember[] | undefined;
  if (importedStaff) {
    nextData[DbKeys.STAFF] = importedStaff
      .filter((member) => member.propertyId !== "prop-3")
      .map((member) =>
        member.propertyId === "ALL"
          ? { ...member, propertyName: "Chain-wide (All Properties)" }
          : member
      );
  }

  await clear(store);
  for (const [key, value] of Object.entries(nextData)) await set(key, value, store);
};

export const clearAll = async () => {
  await clearValues();
  await writeValue(demoSeedDisabledKey, true);
};
