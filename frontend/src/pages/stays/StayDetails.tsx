import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { QrCode, ConciergeBell, FileText } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { Skeleton } from "../../components/ui/skeleton";
import StatusChip from "../../components/ui/badges/StatusChip";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import CheckoutDialog from "./components/CheckoutDialog";
import StayGuestPanel from "./components/StayGuestPanel";
import AssignedRoomPanel from "./components/AssignedRoomPanel";
import StayBillPanel from "./components/StayBillPanel";
import UpiQrModal from "../../components/ui/modals/UpiQrModal";
import FolioModal from "../../components/ui/modals/FolioModal";
import RoomGalleryModal from "../../components/ui/room/RoomGalleryModal";
import { useCollectDueMutation, useGetStayByIdQuery, useUpdateStayMutation } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import { getRoomMeta } from "../../utils/helper/roomImages";
import { useNow } from "../../hooks/useNow";
import { calculateBill } from "../../utils/helper/billing";
import { getErrorMessage, uid } from "../../utils/helper/helper";
import { billForStayRooms, stayRoomCount } from "../../utils/helper/stayRooms";
import { AppEndPoints } from "../../utils/route-endpoints/AppEndPoints";
import { colors } from "../../utils/theme/colorTheme";

const StayDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const now = useNow(30000);
  const { data: stay, isLoading } = useGetStayByIdQuery(id);
  const { data: settings } = useGetSettingsQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const [updateStay] = useUpdateStayMutation();
  const [collectDue, { isLoading: collecting }] = useCollectDueMutation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [folioOpen, setFolioOpen] = useState(false);
  const [upiOpen, setUpiOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  if (isLoading) return <MainContainer><div className="space-y-3" aria-busy="true" aria-live="polite"><span className="sr-only">Loading stay</span><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /></div></MainContainer>;
  if (!stay) return <MainContainer><PageTitle title="Stay not found" /><UISubmitButton type="button" text="Back to stays" onClick={() => navigate(AppEndPoints.STAY_LIST)} /></MainContainer>;

  const room = rooms.find((item) => item.id === stay.roomId);
  const roomMeta = getRoomMeta(room, { name: stay.roomTypeName, category: room?.category });
  const active = stay.status === "ACTIVE";
  const bill = active
    ? billForStayRooms(
        calculateBill({ plan: stay.plan, checkInAt: stay.checkInAt, checkOutAt: new Date(now).toISOString(), expectedCheckOutAt: stay.expectedCheckOutAt, extraCharges: stay.extraCharges, discount: stay.discount, taxPercent: stay.taxPercent }),
        stayRoomCount(stay),
      )
    : stay.bill;
  const currentPayable = active ? bill?.total || 0 : stay.dueAmount > 0 ? stay.dueAmount : stay.totalAmount;

  const addExtra = async () => {
    const value = Number(amount);
    if (!label.trim() || !(value > 0)) return toast.error("Charge ka naam aur amount daalo");
    try {
      await updateStay({ id: stay.id, data: { extraCharges: [...stay.extraCharges, { id: uid(), label: label.trim(), amount: value }] } }).unwrap();
      setLabel(""); setAmount(""); toast.success("Extra charge added to folio");
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const removeExtra = async (extraId: string) => {
    try {
      await updateStay({ id: stay.id, data: { extraCharges: stay.extraCharges.filter((charge) => charge.id !== extraId) } }).unwrap();
      toast.success("Charge removed");
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const receiveDue = async () => {
    try {
      await collectDue({ id: stay.id, amount: stay.dueAmount }).unwrap();
      toast.success("Due payment received");
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  return (
    <MainContainer>
      <PageTitle title={`${stay.stayNo} · Room ${stay.roomNumber}`} subtitle={`${stay.guestName} · ${stay.guestPhone}`} actions={
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip label={active ? "In House Guest" : "Completed Stay"} color={active ? colors.status.occupied : colors.status.available} />
          <Button size="small" variant="outlined" color="primary" startIcon={<QrCode size={16} />} onClick={() => setUpiOpen(true)} sx={{ fontWeight: 700, textTransform: "none" }}>UPI Payment QR</Button>
          <Button size="small" variant="outlined" color="info" startIcon={<FileText size={16} />} onClick={() => setFolioOpen(true)} sx={{ fontWeight: 700, textTransform: "none" }}>Folio & Bill Print</Button>
          {active && <Button size="small" variant="outlined" color="secondary" startIcon={<ConciergeBell size={16} />} onClick={() => navigate(AppEndPoints.POS_SERVICES)} sx={{ fontWeight: 700, textTransform: "none" }}>Room Service</Button>}
          {active ? <UISubmitButton type="button" color="secondary" text="Check out" onClick={() => setCheckoutOpen(true)} /> : <UISubmitButton type="button" variant="outlined" text="Print Tax Invoice" onClick={() => setFolioOpen(true)} />}
        </div>
      } />

      <Box className="grid gap-4 lg:grid-cols-3">
        <Box className="space-y-4 lg:col-span-2">
          <StayGuestPanel stay={stay} onOpenGuest={navigate} />
          <AssignedRoomPanel stay={stay} room={room} roomMeta={roomMeta} bill={bill} onOpenGallery={() => setGalleryOpen(true)} />
        </Box>
        <StayBillPanel stay={stay} bill={bill} active={active} collecting={collecting} label={label} setLabel={setLabel} amount={amount} setAmount={setAmount} onAddExtra={addExtra} onRemoveExtra={removeExtra} onReceiveDue={receiveDue} />
      </Box>

      <CheckoutDialog stay={checkoutOpen ? stay : null} onClose={() => setCheckoutOpen(false)} />
      <FolioModal open={folioOpen} onClose={() => setFolioOpen(false)} stay={stay} hotel={settings ?? null} />
      <UpiQrModal open={upiOpen} onClose={() => setUpiOpen(false)} hotelName={settings?.hotelName || "Hotel"} upiId={settings?.upiId || ""} amount={currentPayable} stayNo={stay.stayNo} description={`Room ${stay.roomNumber} Bill`} />
      <RoomGalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} roomNumber={stay.roomNumber} roomTypeName={stay.roomTypeName} category={room?.category || roomMeta.category} images={room?.images || roomMeta.gallery} bedConfig={room?.bedConfig || roomMeta.bedConfig} maxGuests={room?.maxGuests || roomMeta.maxGuests} sizeSqFt={room?.sizeSqFt || roomMeta.sizeSqFt} amenities={room?.amenities || roomMeta.amenities} />
    </MainContainer>
  );
};

export default StayDetails;
