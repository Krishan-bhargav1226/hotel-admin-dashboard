import DashboardIcon from "@mui/icons-material/Dashboard";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { IoIosSettings } from "react-icons/io";
import { FaUsers, FaKey, FaBed, FaUserTie } from "react-icons/fa";
import {
  MdLogin,
  MdInsights,
  MdCalendarMonth,
  MdCleaningServices,
  MdRoomService,
  MdAccountBalanceWallet,
} from "react-icons/md";

export const sidebarItems = [
  { label: APP_TEXT.sidebar.DASHBOARD, icon: <DashboardIcon />, link: AppEndPoints.DASHBOARD },
  { label: APP_TEXT.sidebar.CHECK_IN, icon: <MdLogin size={21} />, link: AppEndPoints.CHECK_IN },
  { label: APP_TEXT.sidebar.RESERVATIONS, icon: <MdCalendarMonth size={21} />, link: AppEndPoints.RESERVATIONS },
  { label: APP_TEXT.sidebar.STAYS, icon: <FaKey size={18} />, link: AppEndPoints.STAY_LIST },
  { label: APP_TEXT.sidebar.ROOMS, icon: <FaBed size={19} />, link: AppEndPoints.ROOM_LIST },
  { label: APP_TEXT.sidebar.HOUSEKEEPING, icon: <MdCleaningServices size={21} />, link: AppEndPoints.HOUSEKEEPING },
  { label: APP_TEXT.sidebar.POS_SERVICES, icon: <MdRoomService size={21} />, link: AppEndPoints.POS_SERVICES },
  { label: APP_TEXT.sidebar.EXPENSES, icon: <MdAccountBalanceWallet size={20} />, link: AppEndPoints.EXPENSES },
  { label: APP_TEXT.sidebar.STAFF_SHIFTS, icon: <FaUserTie size={18} />, link: AppEndPoints.STAFF_SHIFTS },
  { label: APP_TEXT.sidebar.GUESTS, icon: <FaUsers size={19} />, link: AppEndPoints.GUEST_LIST },
  { label: APP_TEXT.sidebar.REPORTS, icon: <MdInsights size={21} />, link: AppEndPoints.REPORTS },
  { label: APP_TEXT.sidebar.SETTINGS, icon: <IoIosSettings size={21} />, link: AppEndPoints.SETTINGS },
];
