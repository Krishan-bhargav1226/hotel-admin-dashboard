import { hotelApi, run } from "../baseQuery";
import { DbKeys, readList, runExclusive, writeList } from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
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

const nightAuditApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getNightAudits: builder.query<NightAuditRecord[], void>({
      queryFn: () =>
        run(async () => {
          const list = await readList<NightAuditRecord>(DbKeys.NIGHT_AUDITS);
          return list.sort((a, b) => b.businessDate.localeCompare(a.businessDate));
        }),
      providesTags: ["NightAudit"],
    }),

    executeNightAudit: builder.mutation<NightAuditRecord, RunNightAuditPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<NightAuditRecord>(DbKeys.NIGHT_AUDITS);
            const now = new Date().toISOString();

            const record: NightAuditRecord = {
              ...payload,
              id: `na-${payload.businessDate.replace(/-/g, "")}-${uid().slice(0, 4)}`,
              auditTimestamp: now,
            };

            await writeList(DbKeys.NIGHT_AUDITS, [record, ...list]);
            return record;
          })
        ),
      invalidatesTags: ["NightAudit", "Stay", "Room", "Shift", "Expense"],
    }),
  }),
});

export const { useGetNightAuditsQuery, useExecuteNightAuditMutation } = nightAuditApi;
