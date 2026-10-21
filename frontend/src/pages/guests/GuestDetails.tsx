import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import BoxTitle from "../../components/ui/container/BoxTitle";
import StatusChip from "../../components/ui/badges/StatusChip";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import IdImage from "../../components/ui/image/IdImage";
import RenderTable from "../../components/tables/RenderTable";
import { TableRow } from "../../components/tables/TableRow";
import { IconButton } from "../../components/ui/buttons/IconButton";
import GuestForm from "./GuestForm";
import { useGetGuestByIdQuery } from "../../store/services/guest/guestSlice";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { buildPath, formatCurrency } from "../../utils/helper/helper";
import { formatDateTime } from "../../utils/date/dateUtils";
import { idTypeName } from "../../utils/helper/constants";
import { Skeleton } from "../../components/ui/skeleton";
import MaskedId from "../../components/ui/MaskedId";
import { colors } from "../../utils/theme/colorTheme";
import { Eye } from "lucide-react";

const columns = [{ label: "Stay" }, { label: "Room" }, { label: "Plan" }, { label: "Check In" }, { label: "Check Out" }, { label: "Amount" }, { label: "Action" }];

const GuestDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetGuestByIdQuery(id);
  const [edit, setEdit] = useState(false);

  if (isLoading) {
    return (
      <MainContainer>
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading guest</span>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-36 w-full" />
        </div>
      </MainContainer>
    );
  }
  if (!data) {
    return (
      <MainContainer>
        <PageTitle title="Guest not found" />
        <UISubmitButton type="button" text="Back to guests" onClick={() => navigate(AppEndPoints.GUEST_LIST)} />
      </MainContainer>
    );
  }

  const { guest, stays } = data;
  const spent = stays.filter((s) => s.status === "COMPLETED").reduce((sum, s) => sum + s.totalAmount, 0);
  const companions = stays.flatMap((s) => s.companions).filter((c, i, a) => a.findIndex((x) => x.idNumber === c.idNumber) === i);

  return (
    <MainContainer>
      <PageTitle
        title={guest.name}
        subtitle={`${guest.phone} · ${stays.length} ${stays.length === 1 ? "visit" : "visits"} · ${formatCurrency(spent)} spent`}
        actions={
          <>
            {guest.isFlagged && <StatusChip label="Flagged" color={colors.danger} />}
            <UISubmitButton type="button" text="Edit guest" onClick={() => setEdit(true)} />
          </>
        }
      />
      <Box className="grid gap-4 lg:grid-cols-3">
        <BoxTitle title="ID proof">
          <Box className="mt-3 space-y-3">
            <IdImage value={guest.idImage} className="h-44 w-full" />
            <Typography fontWeight={700}>{idTypeName(guest.idType)}</Typography>
            <MaskedId value={guest.idNumber} />
            {guest.address && <Typography variant="body2" className="text-gray-600">{guest.address}</Typography>}
            {guest.isFlagged && guest.flagReason && <Typography variant="body2" color="error">{guest.flagReason}</Typography>}
          </Box>
        </BoxTitle>
        <Box className="space-y-4 lg:col-span-2">
          {companions.length > 0 && (
            <BoxTitle title="Came along with">
              <Box className="mt-3 grid gap-3 sm:grid-cols-2">
                {companions.map((c) => (
                  <Box key={c.idNumber} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                    <IdImage value={c.idImage} className="h-14 w-20" />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{c.name}</Typography>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-gray-600">{idTypeName(c.idType)} <MaskedId value={c.idNumber} /></span>
                    </Box>
                  </Box>
                ))}
              </Box>
            </BoxTitle>
          )}
          <Typography variant="h6" fontWeight={700}>Visit history</Typography>
          <RenderTable columns={columns}>
            {stays.length === 0 ? (
              <TableRow itemIndex={1}><td className="p-4 text-center text-gray-500" colSpan={columns.length}>No visit history found</td></TableRow>
            ) : (
              stays.map((s, i) => (
                <TableRow key={s.id} itemIndex={i}>
                  <td className="p-3 text-sm font-semibold">{s.stayNo}</td>
                  <td className="p-3 text-sm">{s.roomNumber}</td>
                  <td className="p-3 text-sm">{s.plan.name}</td>
                  <td className="p-3 text-sm whitespace-nowrap">{formatDateTime(s.checkInAt)}</td>
                  <td className="p-3 text-sm whitespace-nowrap">{formatDateTime(s.checkOutAt)}</td>
                  <td className="p-3 text-sm">{s.status === "COMPLETED" ? formatCurrency(s.totalAmount) : "In house"}</td>
                  <td className="p-3">
                    <IconButton tooltip="View" icon={<Eye size={16} />} bgColor="ORANGE" onClick={() => navigate(buildPath(AppEndPoints.STAY_DETAILS, s.id))} />
                  </td>
                </TableRow>
              ))
            )}
          </RenderTable>
        </Box>
      </Box>
      <GuestForm open={edit} guest={guest} onClose={() => setEdit(false)} />
    </MainContainer>
  );
};

export default GuestDetails;
