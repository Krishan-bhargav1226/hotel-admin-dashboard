import { useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import type { Room, RoomType, RoomCategory } from "../../../utils/interfaces/Interface";
import { getRoomGallery, getRoomMeta } from "../../../utils/helper/roomImages";
import RoomGalleryHero from "./RoomGalleryHero";
import RoomSpecifications from "./RoomSpecifications";

export interface RoomGalleryModalProps {
  open: boolean;
  onClose: () => void;
  room?: Partial<Room> | null;
  roomType?: Partial<RoomType> | null;
  roomNumber?: string;
  roomTypeName?: string;
  category?: RoomCategory;
  images?: string[];
  bedConfig?: string;
  maxGuests?: number;
  sizeSqFt?: number;
  amenities?: string[];
}

export default function RoomGalleryModal({ open, onClose, room, roomType, roomNumber, roomTypeName, category, images, bedConfig, maxGuests, sizeSqFt, amenities }: RoomGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const effectiveRoom = room || (roomNumber ? { number: roomNumber, category } : undefined);
  const effectiveRoomType = roomType || (roomTypeName ? { name: roomTypeName, category } : undefined);
  const meta = getRoomMeta(effectiveRoom, effectiveRoomType);
  const gallery = images?.length ? images : getRoomGallery(effectiveRoom, effectiveRoomType);
  const title = roomNumber ? `Room ${roomNumber} · ${roomTypeName || meta.name}` : room ? `Room ${room.number} · ${meta.name}` : meta.name;

  return <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(226, 232, 240, 0.8)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" } }}>
    <DialogContent className="!bg-white !p-0">
      <RoomGalleryHero room={room} meta={meta} gallery={gallery} title={title} activeIndex={activeIndex} onSelect={setActiveIndex} onClose={onClose} />
      <RoomSpecifications meta={meta} title={title} maxGuests={maxGuests} bedConfig={bedConfig} sizeSqFt={sizeSqFt} amenities={amenities} />
    </DialogContent>
  </Dialog>;
}
