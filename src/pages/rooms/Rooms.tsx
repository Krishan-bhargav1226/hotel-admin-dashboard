import { useState } from "react";
import { Box, MenuItem, Select } from "@mui/material";
import toast from "react-hot-toast";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import RenderTable from "../../components/tables/RenderTable";
import { TableRow } from "../../components/tables/TableRow";
import LoadingTable from "../../components/constants/LoadingTable";
import { IconButton } from "../../components/ui/buttons/IconButton";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import StatusChip from "../../components/ui/badges/StatusChip";
import RoomForm from "./RoomForm";
import { useDeleteRoomMutation, useGetRoomsQuery, useUpdateRoomStatusMutation } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { ShowConfirmModal } from "../../hooks/useShowConfirmModal";
import { ROOM_STATUS } from "../../utils/helper/constants";
import { getErrorMessage } from "../../utils/helper/helper";
import type { Room, RoomStatus } from "../../utils/interfaces/Interface";

const columns = [{ label: "Sr No" }, { label: "Room" }, { label: "Floor" }, { label: "Type" }, { label: "Status" }, { label: "Notes" }, { label: "Action" }];

const Rooms = () => {
  const { data: rooms = [], isLoading } = useGetRoomsQuery();
  const { data: types = [] } = useGetRoomTypesQuery();
  const [deleteRoom] = useDeleteRoomMutation();
  const [updateStatus] = useUpdateRoomStatusMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; room: Room | null; bulk: boolean }>({ open: false, room: null, bulk: false });

  const handleDelete = async (r: Room) => {
    const ok = await ShowConfirmModal({ title: `Delete room ${r.number}?`, text: "Purani stays ka record bana rahega.", confirmButtonText: "Delete" });
    if (!ok) return;
    try { await deleteRoom(r.id).unwrap(); toast.success("Room deleted"); } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const changeStatus = async (r: Room, status: RoomStatus) => {
    try { await updateStatus({ id: r.id, status }).unwrap(); } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <MainContainer>
      <PageTitle
        title="Rooms"
        subtitle={`${rooms.length} rooms`}
        actions={
          <>
            <UISubmitButton type="button" variant="outlined" text="Add multiple" onClick={() => setDrawer({ open: true, room: null, bulk: true })} />
            <UISubmitButton type="button" color="secondary" text="Add room" onClick={() => setDrawer({ open: true, room: null, bulk: false })} />
          </>
        }
      />
      <RenderTable columns={columns}>
        {isLoading ? (
          <TableRow itemIndex={1}><td colSpan={columns.length}><LoadingTable /></td></TableRow>
        ) : rooms.length === 0 ? (
          <TableRow itemIndex={1}><td className="p-4 text-center text-gray-500" colSpan={columns.length}>Koi room nahi — "Add room" ya "Add multiple" se shuru karo</td></TableRow>
        ) : (
          rooms.map((r, index) => (
            <TableRow key={r.id} itemIndex={index}>
              <td className="p-3 rounded-l-lg">{index + 1}</td>
              <td className="p-3 font-bold">{r.number}</td>
              <td className="p-3 text-sm">{r.floor || "-"}</td>
              <td className="p-3 text-sm">{types.find((t) => t.id === r.roomTypeId)?.name ?? "-"}</td>
              <td className="p-3">
                {r.status === "OCCUPIED" ? (
                  <StatusChip label="Occupied" color={ROOM_STATUS.OCCUPIED.color} />
                ) : (
                  <Select size="small" variant="standard" disableUnderline value={r.status} onChange={(e) => changeStatus(r, e.target.value as RoomStatus)} sx={{ fontSize: 14 }}>
                    {(["AVAILABLE", "CLEANING", "MAINTENANCE"] as RoomStatus[]).map((s) => (
                      <MenuItem key={s} value={s}>{ROOM_STATUS[s].label}</MenuItem>
                    ))}
                  </Select>
                )}
              </td>
              <td className="p-3 text-sm text-gray-600">{r.notes || "-"}</td>
              <td className="p-3 rounded-r-lg">
                <Box className="flex gap-1">
                  <IconButton tooltip="Edit" icon={<FaPenToSquare size={16} />} bgColor="GREEN" onClick={() => setDrawer({ open: true, room: r, bulk: false })} />
                  <IconButton tooltip="Delete" icon={<FaTrashAlt size={16} />} onClick={() => handleDelete(r)} />
                </Box>
              </td>
            </TableRow>
          ))
        )}
      </RenderTable>
      <RoomForm open={drawer.open} room={drawer.room} bulk={drawer.bulk} onClose={() => setDrawer((d) => ({ ...d, open: false }))} />
    </MainContainer>
  );
};

export default Rooms;
