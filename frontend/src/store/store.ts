import { configureStore } from "@reduxjs/toolkit";
import { hotelApi } from "./services/baseQuery";
import "./services/room/roomSlice";
import "./services/room-type/roomTypeSlice";
import "./services/rate-plan/ratePlanSlice";
import "./services/guest/guestSlice";
import "./services/stay/staySlice";
import "./services/settings/settingsSlice";
import "./services/reservation/reservationSlice";
import "./services/housekeeping/housekeepingSlice";
import "./services/pos/posSlice";
import "./services/staff/staffSlice";
import "./services/expense/expenseSlice";

const store = configureStore({
  reducer: {
    [hotelApi.reducerPath]: hotelApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hotelApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
