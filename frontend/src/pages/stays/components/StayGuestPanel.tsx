import { Box, Button, Typography } from "@mui/material";
import IdImage from "../../../components/ui/image/IdImage";
import BoxTitle from "../../../components/ui/container/BoxTitle";
import { idTypeName } from "../../../utils/helper/constants";
import { buildPath, maskId } from "../../../utils/helper/helper";
import { AppEndPoints } from "../../../utils/rout-endpoints/AppEndPoints";
import type { Stay } from "../../../utils/interfaces/Interface";

export default function StayGuestPanel({ stay, onOpenGuest }: { stay: Stay; onOpenGuest: (path: string) => void }) {
  const guests = [
    { name: stay.guestName, idType: stay.guestIdType, idNumber: stay.guestIdNumber, idImage: stay.guestIdImage, primary: true },
    ...stay.companions.map((companion) => ({ ...companion, primary: false })),
  ];

  return (
    <BoxTitle title="Guest Folio Information">
      <Box className="mt-3 space-y-3">
        {guests.map((guest, index) => <Box key={`${guest.idType}-${index}`} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
          <IdImage value={guest.idImage} />
          <Box>
            <Typography fontWeight={800} className="text-slate-900">{guest.name}{guest.primary && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">Primary Guest</span>}</Typography>
            <Typography variant="body2" className="mt-0.5 text-gray-600">{idTypeName(guest.idType)} · {maskId(guest.idNumber)}</Typography>
            {guest.primary && <Button size="small" onClick={() => onOpenGuest(buildPath(AppEndPoints.GUEST_DETAILS, stay.guestId))} sx={{ mt: 0.5, p: 0, fontSize: "0.75rem", textTransform: "none" }}>View Full Guest History & CRM →</Button>}
          </Box>
        </Box>)}
      </Box>
    </BoxTitle>
  );
}
