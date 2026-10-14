import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AppError } from "../../utils/interfaces/Interface";

/**
 * Ek hi API instance, har entity ki file `injectEndpoints` se endpoints jodti hai.
 * `fakeBaseQuery` ka matlab: request network par nahi, local database par jaati hai.
 * Backend aane par fakeBaseQuery ko fetchBaseQuery se badal do.
 */
export const hotelApi = createApi({
  reducerPath: "hotelApi",
  baseQuery: fakeBaseQuery<AppError>(),
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
