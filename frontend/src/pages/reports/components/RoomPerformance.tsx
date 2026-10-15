import { Box, Typography } from "@mui/material";
import RenderTable from "../../../components/tables/RenderTable";
import { TableRow } from "../../../components/tables/TableRow";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { roomStats, topGuests } from "../../../utils/helper/analytics";

interface RoomPerformanceProps {
  rooms: ReturnType<typeof roomStats>;
  guests: ReturnType<typeof topGuests>;
}

const COLUMNS = ["Room", "Stays", "Occupied Hours", "Occupancy", "Revenue"].map((label) => ({ label }));

export default function RoomPerformance({ rooms, guests }: RoomPerformanceProps) {
  const sortedRooms = [...rooms].sort((a, b) => b.revenue - a.revenue);
  return <Box className="grid gap-4 lg:grid-cols-3">
    <Box className="lg:col-span-2"><Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">Individual Room Financial Performance</Typography><RenderTable columns={COLUMNS}>{sortedRooms.length === 0 ? <TableRow itemIndex={1}><td className="p-4 text-center text-gray-500" colSpan={COLUMNS.length}>No Data Found</td></TableRow> : sortedRooms.map((room, index) => <TableRow key={room.roomNumber} itemIndex={index}><td className="p-3 font-bold text-brand-950">Room {room.roomNumber}</td><td className="p-3 text-sm">{room.stays} stays</td><td className="p-3 text-sm">{room.occupiedHours} hrs</td><td className="p-3 text-sm font-semibold">{room.occupancy}%</td><td className="p-3 text-sm font-black text-emerald-700">{formatCurrency(room.revenue)}</td></TableRow>)}</RenderTable></Box>
    <SectionBox className="rounded-xl bg-white shadow-xs"><Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">Top High-Value Guests (CRM)</Typography>{guests.length === 0 ? <Typography variant="body2" className="py-6 text-center text-gray-400">No data</Typography> : guests.map((guest) => <Box key={guest.phone} className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0"><Box><Typography variant="body2" fontWeight={800} className="text-slate-900">{guest.name}</Typography><Typography variant="caption" className="text-gray-500">{guest.phone} · {guest.visits} stays</Typography></Box><Typography variant="subtitle2" fontWeight={900} className="text-brand-900">{formatCurrency(guest.spent)}</Typography></Box>)}</SectionBox>
  </Box>;
}
