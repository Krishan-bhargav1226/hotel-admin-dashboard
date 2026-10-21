import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarDays,
  ConciergeBell,
  KeyRound,
  LayoutDashboard,
  LogIn,
  Moon,
  Settings,
  Sparkles,
  Tag,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";

export interface SidebarItem {
  label: string;
  icon: LucideIcon;
  link: string;
  group: SidebarGroup;
}

export const sidebarGroups = ["Front desk", "Rooms & service", "Management", "Property"] as const;
export type SidebarGroup = (typeof sidebarGroups)[number];

export const sidebarItems: SidebarItem[] = [
  { label: APP_TEXT.sidebar.DASHBOARD, icon: LayoutDashboard, link: AppEndPoints.DASHBOARD, group: "Front desk" },
  { label: APP_TEXT.sidebar.CHECK_IN, icon: LogIn, link: AppEndPoints.CHECK_IN, group: "Front desk" },
  { label: APP_TEXT.sidebar.RESERVATIONS, icon: CalendarDays, link: AppEndPoints.RESERVATIONS, group: "Front desk" },
  { label: APP_TEXT.sidebar.STAYS, icon: KeyRound, link: AppEndPoints.STAY_LIST, group: "Rooms & service" },
  { label: APP_TEXT.sidebar.ROOMS, icon: BedDouble, link: AppEndPoints.ROOM_LIST, group: "Rooms & service" },
  { label: APP_TEXT.sidebar.HOUSEKEEPING, icon: Sparkles, link: AppEndPoints.HOUSEKEEPING, group: "Rooms & service" },
  { label: "Lost & Found", icon: Tag, link: AppEndPoints.LOST_FOUND, group: "Rooms & service" },
  { label: APP_TEXT.sidebar.POS_SERVICES, icon: ConciergeBell, link: AppEndPoints.POS_SERVICES, group: "Rooms & service" },
  { label: "Night Audit (EOD)", icon: Moon, link: AppEndPoints.NIGHT_AUDIT, group: "Management" },
  { label: APP_TEXT.sidebar.EXPENSES, icon: Wallet, link: AppEndPoints.EXPENSES, group: "Management" },
  { label: APP_TEXT.sidebar.STAFF_SHIFTS, icon: UserRound, link: AppEndPoints.STAFF_SHIFTS, group: "Management" },
  { label: APP_TEXT.sidebar.GUESTS, icon: Users, link: AppEndPoints.GUEST_LIST, group: "Management" },
  { label: APP_TEXT.sidebar.REPORTS, icon: BarChart3, link: AppEndPoints.REPORTS, group: "Management" },
  { label: APP_TEXT.sidebar.SETTINGS, icon: Settings, link: AppEndPoints.SETTINGS, group: "Property" },
  { label: "Chain Hotels Portfolio", icon: Building2, link: AppEndPoints.CHAIN_PORTFOLIO, group: "Property" },
];
