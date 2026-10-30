import { hotelApi } from "../baseQuery";

export interface ReportKpi {
  totalRevenue: number;
  roomRevenue: number;
  posRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  revPar: number;
  adr: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  activeStays: number;
  confirmedReservations: number;
}

export interface DailyRevenuePoint {
  date: string;
  roomRevenue: number;
  posRevenue: number;
  totalRevenue: number;
  occupancy: number;
}

export interface RoomPerformancePoint {
  roomNumber: string;
  category: string;
  staysCount: number;
  occupancyPercent: number;
  revenue: number;
}

export interface CategoryRevenuePoint {
  category: string;
  amount: number;
  percentage: number;
}

export interface ReportSummaryData {
  kpis: ReportKpi;
  revenueTrend: DailyRevenuePoint[];
  roomPerformance: RoomPerformancePoint[];
  revenueByCategory: CategoryRevenuePoint[];
}

export interface ReportSummaryParams {
  from?: string;
  to?: string;
}

const reportApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportSummary: builder.query<ReportSummaryData, ReportSummaryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.from) queryParams.set("from", params.from);
        if (params?.to) queryParams.set("to", params.to);
        const qs = queryParams.toString();
        return `/report/summary${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Report", "Stay", "Room", "Expense"],
    }),
  }),
});

export const { useGetReportSummaryQuery } = reportApi;
export default reportApi;
