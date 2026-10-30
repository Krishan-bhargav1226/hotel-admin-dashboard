import React, { useEffect, useState } from "react";
import { Image as ImageIcon, ZoomIn } from "lucide-react";
import RoomGalleryModal from "./RoomGalleryModal";
import type { Room, RoomType, RoomCategory } from "../../../utils/interfaces/Interface";
import { getFallbackRoomPhoto, getRoomMeta, getRoomPhoto, resolveRoomImageUrl } from "../../../utils/helper/roomImages";

interface RoomPhotoProps {
  room?: Partial<Room> | null;
  roomType?: Partial<RoomType> | null;
  roomNumber?: string;
  roomTypeName?: string;
  category?: RoomCategory | "";
  image?: string;
  badge?: string;
  height?: string;
  src?: string;
  alt?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  showBadge?: boolean;
  enableZoom?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export const RoomPhoto: React.FC<RoomPhotoProps> = ({
  room,
  roomType,
  roomNumber,
  roomTypeName,
  category,
  image,
  badge,
  height,
  src,
  alt,
  className = "",
  aspectRatio = "video",
  showBadge = false,
  enableZoom = true,
  rounded = "xl",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const effectiveCategory = category || room?.category || roomType?.category;
  const effectiveRoom = room || (roomNumber ? { number: roomNumber, image, badge, category: effectiveCategory } : undefined);
  const effectiveRoomType = roomType || (roomTypeName ? { name: roomTypeName, category: effectiveCategory, badge } : undefined);

  const photoSrc = resolveRoomImageUrl(src || image || getRoomPhoto(effectiveRoom, effectiveRoomType), effectiveCategory);
  const [currentSrc, setCurrentSrc] = useState(photoSrc);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(photoSrc);
    setAttemptedFallback(false);
    setHasError(false);
    setIsLoaded(false);
  }, [photoSrc]);

  const handleImageError = () => {
    if (!attemptedFallback) {
      setAttemptedFallback(true);
      setCurrentSrc(getFallbackRoomPhoto(effectiveCategory));
    } else {
      setHasError(true);
    }
  };

  const missingPhoto = !currentSrc;
  const meta = getRoomMeta(effectiveRoom, effectiveRoomType);
  const title = alt || (roomNumber ? `Room ${roomNumber} - ${meta.name}` : room ? `Room ${room.number} - ${meta.name}` : meta.name);

  const aspectClass =
    aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "wide"
      ? "aspect-[21/9]"
      : "";

  const roundedClass =
    rounded === "2xl"
      ? "rounded-2xl"
      : rounded === "xl"
      ? "rounded-xl"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "md"
      ? "rounded-md"
      : rounded === "sm"
      ? "rounded-sm"
      : "rounded-none";

  return (
    <>
      <div
        className={`group relative overflow-hidden bg-slate-100 ${height ? height : aspectClass} ${roundedClass} ${className}`}
        onClick={(e) => {
          if (enableZoom) {
            e.stopPropagation();
            setGalleryOpen(true);
          }
        }}
        role={enableZoom ? "button" : undefined}
        tabIndex={enableZoom ? 0 : undefined}
        aria-label={enableZoom ? `View photos of ${title}` : undefined}
      >
        {/* Shimmer Placeholder while loading */}
        {!missingPhoto && !isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="text-slate-300 size-6" />
          </div>
        )}

        {/* Fallback if image fails to load */}
        {missingPhoto || hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-2 text-center text-slate-400">
            <ImageIcon className="size-8 text-slate-300 mb-1" />
            <span className="text-[10px] font-medium text-slate-500">{title}</span>
          </div>
        ) : (
          <img
            src={currentSrc}
            alt={title}
            loading="lazy"
            onLoad={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            onError={handleImageError}
            className={`h-full w-full object-cover transition-transform duration-500 will-change-transform ${
              enableZoom ? "group-hover:scale-105" : ""
            } ${isLoaded ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Subtle dark gradient overlay at bottom for badge contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Guest Suitability / Category Badge */}
        {showBadge && meta.badge ? (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs backdrop-blur-md ${meta.badgeColor}`}>
              {meta.badge}
            </span>
          </div>
        ) : null}

        {/* Zoom Hint on Hover */}
        {enableZoom && (
          <div className="absolute top-2 right-2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="size-3.5" />
          </div>
        )}

        {/* Bottom Details Label */}
        {room && (
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white drop-shadow-sm pointer-events-none">
            <span className="font-mono text-[11px] font-bold">Room {room.number}</span>
            <span className="text-[10px] font-medium opacity-90 truncate max-w-[120px]">{meta.name}</span>
          </div>
        )}
      </div>

      {/* Lightbox / Gallery Modal */}
      {enableZoom && (
        <RoomGalleryModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          room={room}
          roomType={roomType}
        />
      )}
    </>
  );
};

export default RoomPhoto;
