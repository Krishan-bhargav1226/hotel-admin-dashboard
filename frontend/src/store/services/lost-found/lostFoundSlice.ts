import { hotelApi } from "../baseQuery";
import type { LostAndFoundItem } from "../../../utils/interfaces/Interface";

export type CreateLostFoundPayload = Omit<LostAndFoundItem, "id" | "itemNo">;

const mapBackendLostItem = (item: any): LostAndFoundItem => ({
  id: String(item.id),
  itemNo: item.itemNo || `LF-2026-${String(item.id).padStart(4, "0")}`,
  title: item.title,
  category: item.category,
  locationFound: item.locationFound,
  roomNumber: item.roomNumber ?? undefined,
  foundDate: item.foundDate,
  foundTime: item.foundTime,
  foundByStaff: item.foundByStaff,
  storageLocker: item.storageLocker,
  guestName: item.guestName ?? undefined,
  guestPhone: item.guestPhone ?? undefined,
  status: item.status,
  notes: item.notes ?? undefined,
  claimedBy: item.claimedBy ?? undefined,
  claimantContact: item.claimantContact ?? undefined,
  claimedAt: item.claimedAt ?? undefined,
});

const lostFoundApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getLostFoundItems: builder.query<LostAndFoundItem[], void>({
      query: () => "/lost/item",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendLostItem).sort((a: LostAndFoundItem, b: LostAndFoundItem) =>
          b.foundDate.localeCompare(a.foundDate)
        );
      },
      providesTags: ["LostAndFound"],
    }),

    createLostFoundItem: builder.mutation<LostAndFoundItem, CreateLostFoundPayload>({
      query: (payload) => ({
        url: "/lost/item",
        method: "POST",
        body: {
          title: payload.title.trim(),
          category: payload.category,
          locationFound: payload.locationFound,
          roomNumber: payload.roomNumber || null,
          foundDate: payload.foundDate,
          foundTime: payload.foundTime,
          foundByStaff: payload.foundByStaff,
          storageLocker: payload.storageLocker,
          guestName: payload.guestName || null,
          guestPhone: payload.guestPhone || null,
          status: payload.status,
          notes: payload.notes || null,
        },
      }),
      transformResponse: (_res: any, _meta: any, arg: CreateLostFoundPayload) => ({
        ...arg,
        id: String(Date.now()),
        itemNo: `LF-2026-${Date.now().toString().slice(-4)}`,
      }),
      invalidatesTags: ["LostAndFound"],
    }),

    updateLostFoundItem: builder.mutation<LostAndFoundItem, LostAndFoundItem>({
      query: (payload) => ({
        url: `/lost/item/${payload.id}`,
        method: "PUT",
        body: {
          title: payload.title.trim(),
          category: payload.category,
          locationFound: payload.locationFound,
          roomNumber: payload.roomNumber || null,
          foundDate: payload.foundDate,
          foundTime: payload.foundTime,
          foundByStaff: payload.foundByStaff,
          storageLocker: payload.storageLocker,
          guestName: payload.guestName || null,
          guestPhone: payload.guestPhone || null,
          status: payload.status,
          notes: payload.notes || null,
          claimedBy: payload.claimedBy || null,
          claimantContact: payload.claimantContact || null,
          claimedAt: payload.claimedAt || null,
        },
      }),
      transformResponse: (_res: any, _meta: any, arg: LostAndFoundItem) => arg,
      invalidatesTags: ["LostAndFound"],
    }),

    deleteLostFoundItem: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/lost/item/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["LostAndFound"],
    }),
  }),
});

export const {
  useGetLostFoundItemsQuery,
  useCreateLostFoundItemMutation,
  useUpdateLostFoundItemMutation,
  useDeleteLostFoundItemMutation,
} = lostFoundApi;

export default lostFoundApi;
