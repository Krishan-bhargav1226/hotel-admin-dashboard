import { useState } from "react";
import type { Room, RoomType } from "../../../utils/interfaces/Interface";
import { getRoomMeta, getRoomPhoto } from "../../../utils/helper/roomImages";
import { formatCurrency } from "../../../utils/helper/helper";
import RoomGalleryModal from "./RoomGalleryModal";
import RoomCardPhoto from "./RoomCardPhoto";
import RoomCardDetails from "./RoomCardDetails";

interface RoomCardSelectProps {
  room: Room;
  roomType?: RoomType;
  isSelected: boolean;
  onSelect: () => void;
  priceNote?: string;
  recommendedReason?: string;
}

export const RoomCardSelect = ({ room, roomType, isSelected, onSelect, priceNote, recommendedReason }: RoomCardSelectProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const meta = getRoomMeta(room, roomType);
  const showGallery = () => setGalleryOpen(true);

  return <>
    <div onClick={onSelect} className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 ${isSelected ? "border-brand-700 bg-white ring-2 ring-slate-900 shadow-md" : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-card"}`}>
      <RoomCardPhoto
        number={room.number} floor={room.floor} photo={getRoomPhoto(room, roomType)}
        badge={meta.badge} badgeColor={meta.badgeColor}
        price={priceNote || formatCurrency(meta.basePrice)} selected={isSelected} onGallery={showGallery}
      />
      <RoomCardDetails
        name={roomType?.name || meta.name} recommendedReason={recommendedReason}
        description={room.notes || meta.guestDescription} maxGuests={meta.maxGuests}
        bedType={room.bedType || meta.bedConfig} selected={isSelected} onGallery={showGallery}
      />
    </div>
    <RoomGalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} room={room} roomType={roomType} />
  </>;
};

export default RoomCardSelect;
