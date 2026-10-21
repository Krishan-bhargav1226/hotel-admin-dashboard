import { hotelApi, run } from "../baseQuery";
import { DbKeys, readList, readSettings, runExclusive, writeList, writeSettings } from "../../../utils/db/localDb";
import type { HotelProperty, Room } from "../../../utils/interfaces/Interface";

const propertyApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<HotelProperty[], void>({
      queryFn: () =>
        run(async () => {
          return readList<HotelProperty>(DbKeys.PROPERTIES);
        }),
      providesTags: ["Property"],
    }),

    switchActiveProperty: builder.mutation<HotelProperty, string>({
      queryFn: (propertyId) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelProperty>(DbKeys.PROPERTIES);
            const target = list.find((p) => p.id === propertyId);
            if (!target) throw new Error("Selected property not found in chain portfolio");

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

            return { ...target, active: true };
          })
        ),
      invalidatesTags: ["Property", "Settings", "Room", "Stay"],
    }),

    createProperty: builder.mutation<HotelProperty, Partial<HotelProperty>>({
      queryFn: (input) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelProperty>(DbKeys.PROPERTIES);
            const newProperty: HotelProperty = {
              id: `prop-${Date.now()}`,
              name: input.name?.trim() || "New Chain Hotel",
              chain: input.chain?.trim() || "Grand Horizon Hotels & Resorts",
              brandTier: input.brandTier?.trim() || "★★★★ Premium Collection",
              location: input.location?.trim() || "India",
              starRating: input.starRating?.trim() || "4 Star Deluxe",
              roomCount: Number(input.roomCount) || 30,
              occupancyRate: Number(input.occupancyRate) || 0,
              phone: input.phone?.trim() || "+91 ...",
              email: input.email?.trim() || "hotel@grandhorizonhotels.com",
              address: input.address?.trim() || "Hotel Address",
              gstin: input.gstin?.trim() || "08AAAAA0000A1Z5",
              upiId: input.upiId?.trim() || "hotel@upi",
              dailyRevenue: Number(input.dailyRevenue) || 0,
              adr: Number(input.adr) || 4500,
              managerName: input.managerName?.trim() || "General Manager",
              status: input.status || "ACTIVE",
              active: false,
            };

            const updated = [newProperty, ...list];
            await writeList(DbKeys.PROPERTIES, updated);
            return newProperty;
          })
        ),
      invalidatesTags: ["Property"],
    }),

    updateProperty: builder.mutation<HotelProperty, HotelProperty>({
      queryFn: (updatedItem) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelProperty>(DbKeys.PROPERTIES);
            const index = list.findIndex((p) => p.id === updatedItem.id);
            if (index === -1) throw new Error("Property not found");

            const updatedList = [...list];
            updatedList[index] = updatedItem;
            await writeList(DbKeys.PROPERTIES, updatedList);

            // If active property was modified, sync active hotel settings
            if (updatedItem.active) {
              const currentSettings = await readSettings();
              await writeSettings({
                ...currentSettings,
                hotelName: updatedItem.name,
                brandTier: updatedItem.brandTier,
                address: updatedItem.address,
                phone: updatedItem.phone,
                email: updatedItem.email,
                gstin: updatedItem.gstin,
                upiId: updatedItem.upiId,
              });
            }

            return updatedItem;
          })
        ),
      invalidatesTags: ["Property", "Settings"],
    }),

    deleteProperty: builder.mutation<void, string>({
      queryFn: (propertyId) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelProperty>(DbKeys.PROPERTIES);
            if (list.length <= 1) {
              throw new Error("Cannot delete the only hotel property in the chain portfolio.");
            }

            const target = list.find((p) => p.id === propertyId);
            const remaining = list.filter((p) => p.id !== propertyId);

            // If deleted property was active, make first remaining property active
            if (target?.active && remaining.length > 0) {
              remaining[0].active = true;
              const currentSettings = await readSettings();
              await writeSettings({
                ...currentSettings,
                hotelName: remaining[0].name,
                brandTier: remaining[0].brandTier,
                address: remaining[0].address,
                phone: remaining[0].phone,
                email: remaining[0].email,
                gstin: remaining[0].gstin,
                upiId: remaining[0].upiId,
              });
            }

            await writeList(DbKeys.PROPERTIES, remaining);
          })
        ),
      invalidatesTags: ["Property", "Settings", "Room", "Stay"],
    }),

    addRoomToProperty: builder.mutation<
      HotelProperty,
      { propertyId: string; number: string; floor?: string; roomType?: string; price?: number }
    >({
      queryFn: ({ propertyId, number, floor = "Floor 1", roomType = "Deluxe Room", price = 4500 }) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelProperty>(DbKeys.PROPERTIES);
            const target = list.find((p) => p.id === propertyId);
            if (!target) throw new Error("Property not found");

            target.roomCount = (target.roomCount || 0) + 1;
            await writeList(DbKeys.PROPERTIES, list);

            // Also register the room into room inventory
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const newRoom: Room = {
              id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              number: number.trim(),
              floor: floor.trim(),
              roomTypeId: "type-deluxe",
              status: "AVAILABLE",
              notes: `${roomType} at ${target.name}`,
              propertyId: target.id,
              propertyName: target.name,
              basePrice: price,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await writeList(DbKeys.ROOMS, [...rooms, newRoom]);

            return target;
          })
        ),
      invalidatesTags: ["Property", "Room"],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useSwitchActivePropertyMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useAddRoomToPropertyMutation,
} = propertyApi;
