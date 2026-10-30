import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import RoomForm from "./RoomForm";
import RoomCategoryFilter from "./RoomCategoryFilter";
import RoomInventoryGrid from "./RoomInventoryGrid";
import { useDeleteRoomMutation, useGetRoomsQuery, useUpdateRoomStatusMutation } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { ShowConfirmModal } from "../../hooks/useShowConfirmModal";
import { getErrorMessage } from "../../utils/helper/helper";
import { getRoomMeta } from "../../utils/helper/roomImages";
import type { Room, RoomStatus } from "../../utils/interfaces/Interface";

export default function Rooms() {
  const { data: rooms = [], isLoading } = useGetRoomsQuery();
  const { data: types = [] } = useGetRoomTypesQuery();
  const [deleteRoom] = useDeleteRoomMutation();
  const [updateStatus] = useUpdateRoomStatusMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; room: Room | null; bulk: boolean }>({ open: false, room: null, bulk: false });
  const [guestCategoryFilter, setGuestCategoryFilter] = useState("ALL");

  useEffect(() => {
    setDrawer((current) => {
      if (!current.open || !current.room) return current;
      const next = rooms.find((room) => room.id === current.room?.id);
      if (!next) return { ...current, open: false, room: null };
      return next === current.room ? current : { ...current, room: next };
    });
  }, [rooms]);

  const filteredRooms = useMemo(() => guestCategoryFilter === "ALL" ? rooms : rooms.filter((room) => getRoomMeta(room, types.find((type) => type.id === room.roomTypeId)).category === guestCategoryFilter), [rooms, types, guestCategoryFilter]);
  const floors = useMemo(() => {
    const groups = new Map<string, Room[]>();
    filteredRooms.forEach((room) => {
      const floor = room.floor?.trim() || "Unassigned";
      groups.set(floor, [...(groups.get(floor) ?? []), room]);
    });
    return [...groups.entries()];
  }, [filteredRooms]);

  const handleDelete = async (room: Room) => {
    const confirmed = await ShowConfirmModal({ title: `Delete room ${room.number}?`, text: "Previous stay records will remain intact.", confirmButtonText: "Delete" });
    if (!confirmed) return;
    try { await deleteRoom(room.id).unwrap(); toast.success("Room deleted"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };
  const changeStatus = async (room: Room, status: RoomStatus) => {
    try { await updateStatus({ id: room.id, status }).unwrap(); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  return <MainContainer>
    <PageTitle title="Room Inventory & Photo Gallery" subtitle={`${rooms.length} curated rooms catering to all guest profiles across 3 floors`} actions={<><UISubmitButton type="button" variant="outlined" text="Add multiple" onClick={() => setDrawer({ open: true, room: null, bulk: true })} /><UISubmitButton type="button" color="secondary" text="Add room" onClick={() => setDrawer({ open: true, room: null, bulk: false })} /></>} />
    <RoomCategoryFilter selected={guestCategoryFilter} count={rooms.length} onChange={setGuestCategoryFilter} />
    <RoomInventoryGrid loading={isLoading} rooms={filteredRooms} types={types} floors={floors} onStatusChange={changeStatus} onEdit={(room) => setDrawer({ open: true, room, bulk: false })} onDelete={handleDelete} />
    <RoomForm open={drawer.open} room={drawer.room} bulk={drawer.bulk} onClose={() => setDrawer((current) => ({ ...current, open: false }))} />
  </MainContainer>;
}
