import { hotelApi } from "../baseQuery";
import type {
  HousekeepingStatus,
  HousekeepingTask,
  MaintenancePriority,
  MaintenanceTicket,
} from "../../../utils/interfaces/Interface";

export interface CreateMaintenancePayload {
  roomId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  reportedBy: string;
  assignedTo?: string;
  cost?: number;
}

const mapBackendHousekeeping = (item: any): HousekeepingTask => ({
  id: String(item.id),
  roomId: String(item.roomId),
  roomNumber: item.roomNumber,
  roomTypeName: item.roomTypeName || "Standard",
  status: item.status || "CLEAN_INSPECTED",
  assignedTo: item.assignedTo ?? undefined,
  priority: item.priority || "NORMAL",
  notes: item.notes ?? undefined,
  lastCleanedAt: item.lastCleanedAt ?? undefined,
  updatedAt: item.updatedDate || item.createdDate || new Date().toISOString(),
});

const housekeepingApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getHousekeepingTasks: builder.query<HousekeepingTask[], void>({
      query: () => "/housekeeping",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendHousekeeping).sort((a: HousekeepingTask, b: HousekeepingTask) =>
          a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
        );
      },
      providesTags: ["Housekeeping", "Room"],
    }),

    updateHousekeepingStatus: builder.mutation<
      void,
      {
        roomId: string;
        status: HousekeepingStatus;
        assignedTo?: string;
        notes?: string;
        priority?: HousekeepingTask["priority"];
      }
    >({
      query: ({ roomId, status, assignedTo, notes, priority }) => {
        const body: Record<string, unknown> = { status };
        if (priority) body.priority = priority;
        if (assignedTo !== undefined) body.assignedTo = assignedTo;
        if (notes !== undefined) body.notes = notes;
        return {
          url: `/housekeeping/room/${roomId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Housekeeping", "Room"],
    }),

    getMaintenanceTickets: builder.query<MaintenanceTicket[], void>({
      query: () => "/maintenance",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map((t: any) => ({
          id: String(t.id),
          ticketNo: t.ticketNo || `MT-${t.id}`,
          roomId: String(t.roomId),
          roomNumber: t.roomNumber || String(t.roomId),
          title: t.title || "Maintenance task",
          description: t.description || "",
          priority: (t.priority || "MEDIUM") as MaintenancePriority,
          status: (t.status || "OPEN") as MaintenanceTicket["status"],
          reportedBy: t.reportedBy || "Staff",
          assignedTo: t.assignedTo || undefined,
          cost: Number(t.cost) || 0,
          createdAt: t.createdDate || new Date().toISOString(),
          resolvedAt: t.resolvedAt || undefined,
        }));
      },
      providesTags: ["Maintenance", "Housekeeping", "Room"],
    }),

    createMaintenanceTicket: builder.mutation<
      MaintenanceTicket,
      CreateMaintenancePayload
    >({
      query: (payload) => ({
        url: "/maintenance",
        method: "POST",
        body: {
          roomId: Number(payload.roomId),
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          priority: payload.priority || "MEDIUM",
          reportedBy: payload.reportedBy?.trim() || "Front Desk Staff",
          assignedTo: payload.assignedTo?.trim() || null,
          cost: Number(payload.cost) || 0,
        },
      }),
      transformResponse: (res: any, _meta: any, arg: CreateMaintenancePayload): MaintenanceTicket => {
        const createdId = typeof res === "number" ? res : res?.id;
        const item = res && typeof res === "object" ? res : undefined;
        return {
          id: String(createdId ?? Date.now()),
          ticketNo: item?.ticketNo ?? `MT-${Date.now().toString().slice(-4)}`,
          roomId: arg.roomId,
          roomNumber: item?.roomNumber ?? arg.roomId,
          title: arg.title,
          description: arg.description,
          priority: arg.priority,
          status: "OPEN",
          reportedBy: arg.reportedBy,
          assignedTo: arg.assignedTo,
          cost: arg.cost,
          createdAt: new Date().toISOString(),
        };
      },
      invalidatesTags: ["Maintenance", "Housekeeping", "Room"],
    }),

    updateMaintenanceTicket: builder.mutation<
      void,
      { id: string; status: MaintenanceTicket["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/maintenance/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Maintenance", "Housekeeping", "Room"],
    }),

    updateMaintenanceStatus: builder.mutation<
      void,
      { id: string; status: MaintenanceTicket["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/maintenance/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Maintenance", "Housekeeping", "Room"],
    }),

    deleteMaintenanceTicket: builder.mutation<void, string>({
      query: (id) => ({
        url: `/maintenance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Maintenance", "Housekeeping", "Room"],
    }),
  }),
});

export const {
  useGetHousekeepingTasksQuery,
  useUpdateHousekeepingStatusMutation,
  useGetMaintenanceTicketsQuery,
  useCreateMaintenanceTicketMutation,
  useUpdateMaintenanceTicketMutation,
  useUpdateMaintenanceStatusMutation,
  useDeleteMaintenanceTicketMutation,
} = housekeepingApi;

export default housekeepingApi;
