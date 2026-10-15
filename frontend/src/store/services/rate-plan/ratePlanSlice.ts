import { hotelApi, run } from "../baseQuery";
import { DbKeys, readList, runExclusive, writeList } from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type { RatePlan } from "../../../utils/interfaces/Interface";

export type RatePlanPayload = Omit<RatePlan, "id" | "createdAt">;

const ratePlanApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRatePlans: builder.query<RatePlan[], void>({
      queryFn: () => run(() => readList<RatePlan>(DbKeys.RATE_PLANS)),
      providesTags: ["RatePlan"],
    }),
    createRatePlan: builder.mutation<RatePlan, RatePlanPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<RatePlan>(DbKeys.RATE_PLANS);
            const item: RatePlan = {
              ...payload,
              id: uid(),
              name: payload.name.trim(),
              createdAt: new Date().toISOString(),
            };
            await writeList(DbKeys.RATE_PLANS, [...list, item]);
            return item;
          })
        ),
      invalidatesTags: ["RatePlan"],
    }),
    updateRatePlan: builder.mutation<RatePlan, { id: string; data: RatePlanPayload }>({
      queryFn: ({ id, data }) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<RatePlan>(DbKeys.RATE_PLANS);
            let updated: RatePlan | undefined;
            const next = list.map((p) =>
              p.id === id ? (updated = { ...p, ...data, name: data.name.trim() }) : p
            );
            if (!updated) throw new Error("Rate plan not found");
            await writeList(DbKeys.RATE_PLANS, next);
            return updated;
          })
        ),
      invalidatesTags: ["RatePlan"],
    }),
    deleteRatePlan: builder.mutation<boolean, string>({
      // Old stays keep their own plan snapshot, so deleting is always safe.
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<RatePlan>(DbKeys.RATE_PLANS);
            await writeList(DbKeys.RATE_PLANS, list.filter((p) => p.id !== id));
            return true;
          })
        ),
      invalidatesTags: ["RatePlan"],
    }),
  }),
});

export const {
  useGetRatePlansQuery,
  useCreateRatePlanMutation,
  useUpdateRatePlanMutation,
  useDeleteRatePlanMutation,
} = ratePlanApi;

export default ratePlanApi;
