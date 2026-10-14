import type { ReactElement } from "react";
import Dashboard from "../../pages/dashboard/Dashboard";
import CheckIn from "../../pages/check-in/CheckIn";
import Stays from "../../pages/stays/Stays";
import StayDetails from "../../pages/stays/StayDetails";
import Rooms from "../../pages/rooms/Rooms";
import Guests from "../../pages/guests/Guests";
import GuestDetails from "../../pages/guests/GuestDetails";
import Reports from "../../pages/reports/Reports";
import Setting from "../../pages/settings/Setting";
import Reservations from "../../pages/reservations/Reservations";
import Housekeeping from "../../pages/housekeeping/Housekeeping";
import POSServices from "../../pages/pos/POSServices";
import StaffShifts from "../../pages/staff/StaffShifts";
import Expenses from "../../pages/expenses/Expenses";
import { AppEndPoints } from "../rout-endpoints/AppEndPoints";

export interface StaticRouteType {
  path: string;
  element: ReactElement;
}

export const StaticRoutes: StaticRouteType[] = [
  { path: AppEndPoints.DASHBOARD, element: <Dashboard /> },
  { path: AppEndPoints.CHECK_IN, element: <CheckIn /> },
  { path: AppEndPoints.RESERVATIONS, element: <Reservations /> },
  { path: AppEndPoints.STAY_LIST, element: <Stays /> },
  { path: AppEndPoints.STAY_DETAILS, element: <StayDetails /> },
  { path: AppEndPoints.ROOM_LIST, element: <Rooms /> },
  { path: AppEndPoints.HOUSEKEEPING, element: <Housekeeping /> },
  { path: AppEndPoints.POS_SERVICES, element: <POSServices /> },
  { path: AppEndPoints.EXPENSES, element: <Expenses /> },
  { path: AppEndPoints.STAFF_SHIFTS, element: <StaffShifts /> },
  { path: AppEndPoints.GUEST_LIST, element: <Guests /> },
  { path: AppEndPoints.GUEST_DETAILS, element: <GuestDetails /> },
  { path: AppEndPoints.REPORTS, element: <Reports /> },
  { path: AppEndPoints.SETTINGS, element: <Setting /> },
];
