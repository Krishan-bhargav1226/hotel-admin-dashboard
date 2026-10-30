import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { API_BASE_URL, ALL_TAGS, hotelApi } from "../store/services/baseQuery";
import type { AppDispatch } from "../store/store";

type Tag = (typeof ALL_TAGS)[number];

export interface EntityChangedEvent {
  entityType: string;
  entityId?: string | null;
  action?: string;
  organizationId?: number;
  propertyId?: number | null;
  fields?: Record<string, unknown> | null;
  refetch?: boolean;
}

const TAGS: Record<string, Tag[]> = {
  Property: ["Property", "Settings", "Staff", "Notification", "Room"],
  Room: ["Room", "Housekeeping", "Stay", "Reservation", "Property"],
  RatePlan: ["RatePlan", "Room"],
  Settings: ["Settings", "Property"],
  User: ["Staff", "Notification"],
  Role: ["Staff"],
  RoomType: ["RoomType", "Room"],
  Staff: ["Staff", "Shift"],
  Notification: ["Notification"],
  Stay: ["Stay", "Room", "Reservation", "Property", "Guest", "Housekeeping", "Report"],
  Reservation: ["Reservation", "Room", "Stay"],
  Housekeeping: ["Housekeeping", "Room", "Maintenance"],
  Maintenance: ["Maintenance", "Housekeeping", "Room"],
  Guest: ["Guest", "Stay", "Reservation"],
  Shift: ["Shift", "Staff"],
  Expense: ["Expense", "Report"],
  PosItem: ["MenuItem"],
  ServiceOrder: ["ServiceOrder", "Stay"],
  LostItem: ["LostAndFound"],
  NightAudit: ["NightAudit", "Report", "Property", "Stay", "Room"],
};

const hubUrl = `${API_BASE_URL.replace(/\/api\/?$/, "")}/hubs/live`;

let connection: HubConnection | null = null;
let refs = 0;
let connectGen = 0;
const listeners = new Set<(event: EntityChangedEvent) => void>();

const token = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("jwt") || "";

const normalize = (raw: EntityChangedEvent & { EntityType?: string; EntityId?: string; Action?: string }): EntityChangedEvent => ({
  entityType: raw.entityType || raw.EntityType || "",
  entityId: raw.entityId ?? raw.EntityId ?? null,
  action: raw.action || raw.Action,
  organizationId: raw.organizationId,
  propertyId: raw.propertyId,
  fields: raw.fields ?? null,
  refetch: raw.refetch !== false,
});

function buildConnection() {
  const next = new HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: token })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
    .configureLogging(LogLevel.Warning)
    .build();
  next.on("EntityChanged", (payload: EntityChangedEvent) => {
    const event = normalize(payload ?? { entityType: "" });
    listeners.forEach((listener) => listener(event));
  });
  next.onreconnected(() => {
    const active = localStorage.getItem("activePropertyId");
    if (active && Number(active) > 0) {
      next.invoke("JoinProperty", Number(active)).catch(() => {});
    }
  });
  next.onclose(() => {
    if (connection === next) connection = null;
    if (refs > 0) window.setTimeout(() => void open(connectGen), 3000);
  });
  return next;
}

async function open(gen: number) {
  if (!token() || refs <= 0 || gen !== connectGen) return;
  if (!connection) connection = buildConnection();
  const current = connection;
  if (current.state !== HubConnectionState.Disconnected) return;
  try {
    await current.start();
    const active = localStorage.getItem("activePropertyId");
    if (active && Number(active) > 0) {
      current.invoke("JoinProperty", Number(active)).catch(() => {});
    }
  } catch {
    if (gen !== connectGen || connection !== current) return;
    connection = null;
    window.setTimeout(() => void open(gen), 3000);
  }
}

export function joinPropertyGroup(propertyId: number) {
  if (propertyId > 0 && connection && connection.state === HubConnectionState.Connected) {
    connection.invoke("JoinProperty", propertyId).catch(() => {});
  }
}

export function subscribeLiveUpdates(listener: (event: EntityChangedEvent) => void) {
  listeners.add(listener);
  refs += 1;
  const gen = ++connectGen;
  void open(gen);
  return () => {
    listeners.delete(listener);
    refs -= 1;
    if (refs <= 0) {
      refs = 0;
      connectGen += 1;
      const current = connection;
      connection = null;
      void current?.stop();
    }
  };
}

export function invalidateForEntityChange(dispatch: AppDispatch, event: EntityChangedEvent) {
  if (!event.entityType) return;
  const matchKey = Object.keys(TAGS).find(
    (key) => key.toLowerCase() === event.entityType.trim().toLowerCase()
  );
  const tags = matchKey ? TAGS[matchKey] : undefined;
  if (tags && tags.length > 0) {
    dispatch(hotelApi.util.invalidateTags(tags));
  } else {
    // If unknown or generic entity event, invalidate all to ensure UI is never stale
    dispatch(hotelApi.util.invalidateTags([...ALL_TAGS]));
  }
}

export function useLiveUpdates() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => subscribeLiveUpdates((event) => invalidateForEntityChange(dispatch, event)), [dispatch]);
}
