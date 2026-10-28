import { hotelApi } from "../baseQuery";
import type { NightAuditRecord } from "../../../utils/interfaces/Interface";

export interface RunNightAuditPayload {
  businessDate: string;
  auditedBy: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  roomRevenue: number;
  posRevenue: number;
  servicesRevenue: number;
  totalRevenue: number;
  adr: number;
  revPar: number;
  totalGst: number;
  settlements: {
    cash: number;
    upi: number;
    card: number;
    corporate: number;
  };
  notes?: string;
}

const mapBackendNightAudit = (item: any): NightAuditRecord => ({
  id: String(item.id),
  businessDate: item.businessDate,
  auditTimestamp: item.auditTimestamp || new Date().toISOString(),
  auditedBy: item.auditedBy || "General Manager",
  totalRooms: Number(item.totalRooms) || 20,
  occupiedRooms: Number(item.occupiedRooms) || 0,
  occupancyRate: Number(item.occupancyRate) || 0,
  roomRevenue: Number(item.roomRevenue) || 0,
  posRevenue: Number(item.posRevenue) || 0,
  servicesRevenue: Number(item.servicesRevenue) || 0,
  totalRevenue: Number(item.totalRevenue) || 0,
  adr: Number(item.adr) || 0,
  revPar: Number(item.revPar) || 0,
  totalGst: Number(item.totalGst) || 0,
  settlements: {
    cash: Number(item.cashSettlement) || 0,
    upi: Number(item.upiSettlement) || 0,
    card: Number(item.cardSettlement) || 0,
    corporate: Number(item.corporateSettlement) || 0,
  },
  notes: item.notes ?? undefined,
});

const nightAuditApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getNightAudits: builder.query<NightAuditRecord[], void>({
      query: () => "/night-audit",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendNightAudit).sort((a: NightAuditRecord, b: NightAuditRecord) =>
          b.businessDate.localeCompare(a.businessDate)
        );
      },
      providesTags: ["NightAudit"],
    }),

    executeNightAudit: builder.mutation<NightAuditRecord, RunNightAuditPayload>({
      query: (payload) => ({
        url: "/night-audit",
        method: "POST",
        body: {
          businessDate: payload.businessDate,
          auditedBy: payload.auditedBy,
          totalRooms: Number(payload.totalRooms),
          occupiedRooms: Number(payload.occupiedRooms),
          occupancyRate: Number(payload.occupancyRate),
          roomRevenue: Number(payload.roomRevenue),
          posRevenue: Number(payload.posRevenue),
          servicesRevenue: Number(payload.servicesRevenue),
          totalRevenue: Number(payload.totalRevenue),
          adr: Number(payload.adr),
          revPar: Number(payload.revPar),
          totalGst: Number(payload.totalGst),
          settlements: payload.settlements,
          notes: payload.notes || null,
        },
      }),
      transformResponse: (res: any, _meta: any, arg: RunNightAuditPayload) => ({
        ...arg,
        id: String(res?.data ?? Date.now()),
        auditTimestamp: new Date().toISOString(),
      }),
      invalidatesTags: ["NightAudit", "Stay", "Room", "Shift", "Expense", "Report"],
    }),
  }),
});

export const { useGetNightAuditsQuery, useExecuteNightAuditMutation } = nightAuditApi;
export default nightAuditApi;
