import type { Dispatch, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UiDialog from "../../../components/ui/models/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { formatCurrency } from "../../../utils/helper/helper";
import type { RatePlan, Reservation, Room, RoomType } from "../../../utils/interfaces/Interface";

interface CheckInDialogProps {
  reservation: Reservation | null;
  onClose: () => void;
  onConfirm: () => void;
  rooms: Room[];
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  roomId: string;
  setRoomId: Dispatch<SetStateAction<string>>;
  planId: string;
  setPlanId: Dispatch<SetStateAction<string>>;
  idType: string;
  setIdType: Dispatch<SetStateAction<string>>;
  idNumber: string;
  setIdNumber: Dispatch<SetStateAction<string>>;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  isConverting: boolean;
}

export default function CheckInDialog({
  reservation, onClose, onConfirm, rooms, roomTypes, ratePlans, roomId, setRoomId,
  planId, setPlanId, idType, setIdType, idNumber, setIdNumber, address, setAddress, isConverting,
}: CheckInDialogProps) {
  return (
    <UiDialog open={!!reservation} onClose={onClose} title={`Express Check-In: ${reservation?.guestName}`} maxWidth="sm">
      <div className="space-y-4 pt-1">
        {reservation && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
            <RoomPhoto roomType={roomTypes.find((type) => type.id === reservation.roomTypeId)} aspectRatio="video" showBadge className="h-28 w-full" />
            <div className="p-3">
              <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-brand-700">Booking #{reservation.bookingNo}</span><span className="text-xs font-bold text-emerald-700">Advance: {formatCurrency(reservation.advanceAmount)} ({reservation.paymentMode})</span></div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{reservation.roomTypeName}</div>
              {reservation.specialRequests && <p className="text-[11px] text-amber-800 italic mt-1 bg-amber-50 p-1.5 rounded border border-amber-200/60">Guest request: {reservation.specialRequests}</p>}
            </div>
          </div>
        )}
        <FormControl fullWidth size="small" required>
          <InputLabel>Assign Room *</InputLabel>
          <Select value={roomId} label="Assign Room *" onChange={(event) => setRoomId(event.target.value)}>
            {rooms.filter((room) => room.status === "AVAILABLE").map((room) => {
              const roomType = roomTypes.find((type) => type.id === room.roomTypeId);
              return <MenuItem key={room.id} value={room.id}>Room {room.number} - {roomType?.name} ({room.floor})</MenuItem>;
            })}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" required>
          <InputLabel>Rate Plan *</InputLabel>
          <Select value={planId} label="Rate Plan *" onChange={(event) => setPlanId(event.target.value)}>
            {ratePlans.map((plan) => <MenuItem key={plan.id} value={plan.id}>{plan.name} - {formatCurrency(plan.rate)}</MenuItem>)}
          </Select>
        </FormControl>
        <div className="grid grid-cols-2 gap-3">
          <FormControl fullWidth size="small">
            <InputLabel>ID Document Type</InputLabel>
            <Select value={idType} label="ID Document Type" onChange={(event) => setIdType(event.target.value)}>
              <MenuItem value="AADHAAR">Aadhaar Card</MenuItem><MenuItem value="PASSPORT">Passport</MenuItem><MenuItem value="DRIVING_LICENSE">Driving License</MenuItem><MenuItem value="VOTER_ID">Voter ID</MenuItem>
            </Select>
          </FormControl>
          <TextField label="ID Document Number" fullWidth size="small" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} />
        </div>
        <TextField label="Residential City / Address" fullWidth size="small" value={address} onChange={(event) => setAddress(event.target.value)} />
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="button" color="success" text="Complete Check-In & Issue Room Key" loading={isConverting} onClick={onConfirm} />
        </DialogActions>
      </div>
    </UiDialog>
  );
}
