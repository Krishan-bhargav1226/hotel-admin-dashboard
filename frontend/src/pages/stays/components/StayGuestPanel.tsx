import { Box, Button, Typography } from "@mui/material";
import IdImage from "../../../components/ui/image/IdImage";
import BoxTitle from "../../../components/ui/container/BoxTitle";
import MaskedId from "../../../components/ui/MaskedId";
import { idTypeName } from "../../../utils/helper/constants";
import { buildPath } from "../../../utils/helper/helper";
import { partyTypeLabel, stayHeadcount, stayRoomCount } from "../../../utils/helper/stayRooms";
import { AppEndPoints } from "../../../utils/route-endpoints/AppEndPoints";
import type { Stay } from "../../../utils/interfaces/Interface";

export default function StayGuestPanel({ stay, onOpenGuest }: { stay: Stay; onOpenGuest: (path: string) => void }) {
  const guests = [
    { name: stay.guestName, idType: stay.guestIdType, idNumber: stay.guestIdNumber, idImage: stay.guestIdImage, primary: true },
    ...stay.companions.map((companion) => ({ ...companion, primary: false })),
  ];
  const rooms = stayRoomCount(stay);
  const headcount = stayHeadcount(stay);

  return (
    <BoxTitle title="Guest Folio Information">
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{partyTypeLabel(stay.partyType)}</span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{headcount} {headcount === 1 ? "guest" : "guests"}</span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{rooms} {rooms === 1 ? "room" : "rooms"}</span>
      </div>
      <Box className="mt-3 space-y-3">
        {guests.map((guest, index) => <Box key={`${guest.idType}-${index}`} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
          <IdImage value={guest.idImage} />
          <Box>
            <Typography fontWeight={800} className="text-slate-900">{guest.name}{guest.primary && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">Primary Guest</span>}</Typography>
            <span className="mt-0.5 flex flex-wrap items-center gap-1 text-sm text-gray-600">{idTypeName(guest.idType)} <MaskedId value={guest.idNumber} /></span>
            {guest.primary && <Button size="small" onClick={() => onOpenGuest(buildPath(AppEndPoints.GUEST_DETAILS, stay.guestId))} sx={{ mt: 0.5, p: 0, fontSize: "0.75rem", textTransform: "none" }}>View Full Guest History & CRM →</Button>}
          </Box>
        </Box>)}
      </Box>
    </BoxTitle>
  );
}
