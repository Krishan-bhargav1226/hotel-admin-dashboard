import { lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactElement } from "react";
import PageLoading from "../../components/ui/PageLoading";
import { AppEndPoints } from "../rout-endpoints/AppEndPoints";

const Dashboard = lazy(() => import("../../pages/dashboard/Dashboard"));
const CheckIn = lazy(() => import("../../pages/check-in/CheckIn"));
const Stays = lazy(() => import("../../pages/stays/Stays"));
const StayDetails = lazy(() => import("../../pages/stays/StayDetails"));
const Rooms = lazy(() => import("../../pages/rooms/Rooms"));
const Guests = lazy(() => import("../../pages/guests/Guests"));
const GuestDetails = lazy(() => import("../../pages/guests/GuestDetails"));
const Reports = lazy(() => import("../../pages/reports/Reports"));
const Setting = lazy(() => import("../../pages/settings/Setting"));
const Reservations = lazy(() => import("../../pages/reservations/Reservations"));
const Housekeeping = lazy(() => import("../../pages/housekeeping/Housekeeping"));
const POSServices = lazy(() => import("../../pages/pos/POSServices"));
const StaffShifts = lazy(() => import("../../pages/staff/StaffShifts"));
const Expenses = lazy(() => import("../../pages/expenses/Expenses"));
const NightAudit = lazy(() => import("../../pages/night-audit/NightAudit"));
const LostFound = lazy(() => import("../../pages/lost-found/LostFound"));
const ChainPortfolio = lazy(() => import("../../pages/chain-portfolio/ChainPortfolio"));

export interface StaticRouteType {
  path: string;
  element: ReactElement;
}

const renderPage = (Page: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<PageLoading />}>
    <Page />
  </Suspense>
);

export const StaticRoutes: StaticRouteType[] = [
  { path: AppEndPoints.DASHBOARD, element: renderPage(Dashboard) },
  { path: AppEndPoints.CHECK_IN, element: renderPage(CheckIn) },
  { path: AppEndPoints.RESERVATIONS, element: renderPage(Reservations) },
  { path: AppEndPoints.STAY_LIST, element: renderPage(Stays) },
  { path: AppEndPoints.STAY_DETAILS, element: renderPage(StayDetails) },
  { path: AppEndPoints.ROOM_LIST, element: renderPage(Rooms) },
  { path: AppEndPoints.HOUSEKEEPING, element: renderPage(Housekeeping) },
  { path: AppEndPoints.POS_SERVICES, element: renderPage(POSServices) },
  { path: AppEndPoints.LOST_FOUND, element: renderPage(LostFound) },
  { path: AppEndPoints.EXPENSES, element: renderPage(Expenses) },
  { path: AppEndPoints.STAFF_SHIFTS, element: renderPage(StaffShifts) },
  { path: AppEndPoints.NIGHT_AUDIT, element: renderPage(NightAudit) },
  { path: AppEndPoints.GUEST_LIST, element: renderPage(Guests) },
  { path: AppEndPoints.GUEST_DETAILS, element: renderPage(GuestDetails) },
  { path: AppEndPoints.REPORTS, element: renderPage(Reports) },
  { path: AppEndPoints.SETTINGS, element: renderPage(Setting) },
  { path: AppEndPoints.CHAIN_PORTFOLIO, element: renderPage(ChainPortfolio) },
];
