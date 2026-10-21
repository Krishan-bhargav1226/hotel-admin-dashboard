import { hotelApi, run } from "../baseQuery";
import { DbKeys, readList, runExclusive, writeList } from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type { LostAndFoundItem } from "../../../utils/interfaces/Interface";

export type CreateLostFoundPayload = Omit<LostAndFoundItem, "id" | "itemNo">;

const lostFoundApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getLostFoundItems: builder.query<LostAndFoundItem[], void>({
      queryFn: () =>
        run(async () => {
          const list = await readList<LostAndFoundItem>(DbKeys.LOST_AND_FOUND);
          return list.sort((a, b) => b.foundDate.localeCompare(a.foundDate));
        }),
      providesTags: ["LostAndFound"],
    }),

    createLostFoundItem: builder.mutation<LostAndFoundItem, CreateLostFoundPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<LostAndFoundItem>(DbKeys.LOST_AND_FOUND);
            const count = list.length + 1;
            const itemNo = `LF-2026-${String(count).padStart(4, "0")}`;

            const newItem: LostAndFoundItem = {
              ...payload,
              id: uid(),
              itemNo,
            };

            await writeList(DbKeys.LOST_AND_FOUND, [newItem, ...list]);
            return newItem;
          })
        ),
      invalidatesTags: ["LostAndFound"],
    }),

    updateLostFoundItem: builder.mutation<LostAndFoundItem, LostAndFoundItem>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<LostAndFoundItem>(DbKeys.LOST_AND_FOUND);
            const updated = list.map((item) => (item.id === payload.id ? payload : item));
            await writeList(DbKeys.LOST_AND_FOUND, updated);
            return payload;
          })
        ),
      invalidatesTags: ["LostAndFound"],
    }),

    deleteLostFoundItem: builder.mutation<void, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<LostAndFoundItem>(DbKeys.LOST_AND_FOUND);
            await writeList(
              DbKeys.LOST_AND_FOUND,
              list.filter((item) => item.id !== id)
            );
          })
        ),
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
