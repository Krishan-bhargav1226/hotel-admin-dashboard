import { hotelApi } from "../baseQuery";
import type { RatePlan } from "../../../utils/interfaces/Interface";

export type RatePlanPayload = Omit<RatePlan, "id" | "createdAt">;

const mapBackendRatePlan = (item: any): RatePlan => ({
  id: String(item.id),
  name: item.name,
  kind: item.kind,
  rate: Number(item.rate) || 0,
  durationHours: Number(item.durationHours) || 0,
  checkoutTime: item.checkoutTime || "",
  minHours: Number(item.minHours) || 0,
  overtimeRate: Number(item.overtimeRate) || 0,
  graceMinutes: Number(item.graceMinutes) || 0,
  roomTypeIds: (item.roomTypeIds || []).map(String),
  isActive: item.isActive !== false,
  createdAt: item.createdDate || new Date().toISOString(),
});

const ratePlanApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRatePlans: builder.query<RatePlan[], void>({
      query: () => "/rate/plan",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendRatePlan);
      },
      providesTags: ["RatePlan"],
    }),

    createRatePlan: builder.mutation<RatePlan, RatePlanPayload>({
      query: (payload) => ({
        url: "/rate/plan",
        method: "POST",
        body: {
          name: payload.name.trim(),
          kind: payload.kind,
          rate: Number(payload.rate),
          durationHours: Number(payload.durationHours),
          checkoutTime: payload.checkoutTime || null,
          minHours: Number(payload.minHours),
          overtimeRate: Number(payload.overtimeRate),
          graceMinutes: Number(payload.graceMinutes),
          roomTypeIds: payload.roomTypeIds.map(Number),
        },
      }),
      transformResponse: (res: any) => mapBackendRatePlan(res?.data ?? res),
      invalidatesTags: ["RatePlan"],
    }),

    updateRatePlan: builder.mutation<RatePlan, { id: string; data: RatePlanPayload }>({
      query: ({ id, data }) => ({
        url: `/rate/plan/${id}`,
        method: "PUT",
        body: {
          name: data.name.trim(),
          kind: data.kind,
          rate: Number(data.rate),
          durationHours: Number(data.durationHours),
          checkoutTime: data.checkoutTime || null,
          minHours: Number(data.minHours),
          overtimeRate: Number(data.overtimeRate),
          graceMinutes: Number(data.graceMinutes),
          roomTypeIds: data.roomTypeIds.map(Number),
        },
      }),
      transformResponse: (res: any) => mapBackendRatePlan(res?.data ?? res),
      invalidatesTags: ["RatePlan"],
    }),

    deleteRatePlan: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/rate/plan/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
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
