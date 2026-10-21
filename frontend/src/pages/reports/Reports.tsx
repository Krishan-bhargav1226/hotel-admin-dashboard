import { useMemo, useState } from "react";
import dayjs from "dayjs";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import InBetweenDateSearch from "../../components/forms/InBetweenDateSearch";
import { presetRange, type DateRangeValue } from "../../components/forms/dateRangePresets";
import { exportToExcel } from "../../components/print/printExcel/ExportToExcel";
import { printDocument } from "../../components/print/printPdf/printDocumentUtils";
import ReportSummary from "./components/ReportSummary";
import ReportMetrics from "./components/ReportMetrics";
import RevenueAnalytics from "./components/RevenueAnalytics";
import StayPatterns from "./components/StayPatterns";
import RoomPerformance from "./components/RoomPerformance";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetExpensesQuery } from "../../store/services/expense/expenseSlice";
import { useGetServiceOrdersQuery } from "../../store/services/pos/posSlice";
import { checkInsIn, collectionByMode, completedIn, peakCheckInHours, repeatGuestPercent, revenueByDay, revenueByPlan, roomStats, toRange, topGuests } from "../../utils/helper/analytics";

const ROOM_COLUMNS = ["Room", "Stays", "Occupied Hours", "Occupancy", "Revenue"].map((label) => ({ label }));

export default function Reports() {
  const { data: stays = [] } = useGetStaysQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: expenses = [] } = useGetExpensesQuery();
  const { data: serviceOrders = [] } = useGetServiceOrdersQuery();
  const [range, setRange] = useState<DateRangeValue>(presetRange("thisMonth"));
  const period = useMemo(() => toRange(range.from, range.to), [range]);
  const completedStays = useMemo(() => completedIn(stays, period), [stays, period]);
  const arrivals = useMemo(() => checkInsIn(stays, period), [stays, period]);
  const roomRevenue = completedStays.reduce((sum, stay) => sum + stay.totalAmount, 0);
  const directServiceRevenue = serviceOrders.filter((order) => !order.billedToRoom && dayjs(order.createdAt).isAfter(dayjs(range.from).startOf("day")) && dayjs(order.createdAt).isBefore(dayjs(range.to).endOf("day"))).reduce((sum, order) => sum + order.totalAmount, 0);
  const totalRevenue = roomRevenue + directServiceRevenue;
  const totalExpenses = expenses.filter((expense) => expense.date >= range.from && expense.date <= range.to).reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Compute previous period comparison (UX-06)
  const durationDays = Math.max(1, dayjs(range.to).diff(dayjs(range.from), "day") + 1);
  const prevFrom = dayjs(range.from).subtract(durationDays, "day").format("YYYY-MM-DD");
  const prevTo = dayjs(range.from).subtract(1, "day").format("YYYY-MM-DD");
  const prevPeriod = useMemo(() => toRange(prevFrom, prevTo), [prevFrom, prevTo]);
  const prevCompletedStays = useMemo(() => completedIn(stays, prevPeriod), [stays, prevPeriod]);
  const prevTotalRevenue = prevCompletedStays.reduce((sum, stay) => sum + stay.totalAmount, 0);
  const prevExpenses = expenses.filter((expense) => expense.date >= prevFrom && expense.date <= prevTo).reduce((sum, expense) => sum + expense.amount, 0);
  const prevNetProfit = prevTotalRevenue - prevExpenses;
  const revenueDelta = prevTotalRevenue > 0 ? Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100) : 0;
  const profitDelta = prevNetProfit !== 0 ? Math.round(((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100) : 0;

  const averageMinutes = completedStays.length ? completedStays.reduce((sum, stay) => sum + (stay.bill?.elapsedMinutes ?? 0), 0) / completedStays.length : 0;
  const daily = revenueByDay(stays, period);
  const plans = revenueByPlan(completedStays);
  const modes = collectionByMode(completedStays);
  const hours = peakCheckInHours(arrivals);
  const perRoom = roomStats(completedStays, rooms, period);
  const guests = topGuests(completedStays);
  const averageOccupancy = perRoom.length ? Math.round(perRoom.reduce((sum, room) => sum + room.occupancy, 0) / perRoom.length) : 0;
  const roomRows = perRoom.map((room) => ({ room: room.roomNumber, stays: room.stays, occupiedHours: room.occupiedHours, occupancy: `${room.occupancy}%`, revenue: room.revenue }));

  return <MainContainer>
    <PageTitle title="Reports" subtitle="Revenue, occupancy, payments, and operating costs for the selected period." actions={<div className="flex flex-wrap items-center gap-2"><InBetweenDateSearch value={range} onChange={setRange} /><UISubmitButton type="button" variant="outlined" text="Print P&L" onClick={() => printDocument(roomRows, ROOM_COLUMNS, "Hotel Room & Revenue Report")} /><UISubmitButton type="button" color="success" text="Export Excel" onClick={() => exportToExcel(roomRows, ROOM_COLUMNS, "Hotel-Financial-Report.xlsx")} /></div>} />
    <ReportSummary profit={netProfit} margin={profitMargin} revenue={totalRevenue} expenses={totalExpenses} from={range.from} to={range.to} revenueDelta={revenueDelta} profitDelta={profitDelta} />
    <ReportMetrics roomRevenue={roomRevenue} settledStays={completedStays.length} checkIns={arrivals.length} averageBill={completedStays.length ? roomRevenue / completedStays.length : 0} averageDuration={averageMinutes} retention={repeatGuestPercent(stays, arrivals)} occupancy={averageOccupancy} />
    <RevenueAnalytics daily={daily} modes={modes} />
    <StayPatterns hours={hours} plans={plans} roomRevenue={roomRevenue} />
    <RoomPerformance rooms={perRoom} guests={guests} />
  </MainContainer>;
}
