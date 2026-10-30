import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { AppError } from "../../utils/interfaces/Interface";

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredApiBase && configuredApiBase.length > 0
  ? configuredApiBase
  : "http://localhost:7444/api"
).replace(/\/$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    const requestUrl = typeof args === "string" ? args : args.url;
    if (result.error.status === 401 && !requestUrl.includes("/user/login") && !requestUrl.includes("/user/verify-otp")) {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("jwt");
      if (!window.location.pathname.endsWith("/login")) {
        window.location.assign(`${import.meta.env.BASE_URL}login`.replace(/\/{2,}/g, "/"));
      }
    }
    return result;
  }
  // If the backend wraps responses in { succeeded: true, data: ..., messages: [...] }
  if (
    result.data &&
    typeof result.data === "object" &&
    "data" in (result.data as Record<string, unknown>)
  ) {
    return { data: (result.data as Record<string, unknown>).data };
  }
  return result;
};

/**
 * Main RTK Query API slice connected directly to the .NET Backend WebApi.
 */
export const hotelApi = createApi({
  reducerPath: "hotelApi",
  baseQuery: customBaseQuery,
  tagTypes: [
    "Room",
    "RoomType",
    "RatePlan",
    "Guest",
    "Stay",
    "Settings",
    "Image",
    "Reservation",
    "Housekeeping",
    "Maintenance",
    "MenuItem",
    "ServiceOrder",
    "Staff",
    "Shift",
    "Expense",
    "Property",
    "LostAndFound",
    "NightAudit",
    "Report",
    "Notification",
  ],
  endpoints: () => ({}),
});

export const ALL_TAGS = [
  "Room",
  "RoomType",
  "RatePlan",
  "Guest",
  "Stay",
  "Settings",
  "Image",
  "Reservation",
  "Housekeeping",
  "Maintenance",
  "MenuItem",
  "ServiceOrder",
  "Staff",
  "Shift",
  "Expense",
  "Property",
  "LostAndFound",
  "NightAudit",
  "Report",
  "Notification",
] as const;

type RunResult<T> =
  | { data: T; error?: undefined }
  | { error: AppError; data?: undefined };

/** Wraps a task so queryFn always returns { data } or { error }. */
export const run = async <T>(task: () => Promise<T>): Promise<RunResult<T>> => {
  try {
    return { data: await task() };
  } catch (e) {
    return {
      error: {
        message: e instanceof Error ? e.message : "Something went wrong",
      },
    };
  }
};
