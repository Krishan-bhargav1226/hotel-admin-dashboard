import { GUEST_LOOKUP_SCOPE, DEFAULT_HOTEL_ID } from "../utils/checkin/config";
import type { CheckInPerson, RepeatGuestMatch } from "../pages/check-in/types";
import { DbKeys, readImage, readList, saveImage } from "../utils/db/localDb";
import type { Guest, Stay } from "../utils/interfaces/Interface";
import { normalizeIdNumber } from "../utils/checkin/idValidators";

export async function lookupGuestByPhone(
  phone: string,
  scope: string = GUEST_LOOKUP_SCOPE,
): Promise<RepeatGuestMatch[]> {
  const normalizedPhone = normalizeIdNumber(phone).slice(-10);
  if (normalizedPhone.length !== 10) return [];

  void scope;
  // Guest records and ID documents stay in this browser for the demo.
  const [guests, stays] = await Promise.all([
    readList<Guest>(DbKeys.GUESTS),
    readList<Stay>(DbKeys.STAYS),
  ]);

  const matched = guests.filter((g) => {
    const p = normalizeIdNumber(g.phone).slice(-10);
    return p === normalizedPhone;
  });

  return Promise.all(
    matched.map(async (guest) => {
      const guestStays = stays.filter((s) => s.guestId === guest.id);
      const sortedStays = [...guestStays].sort((a, b) => b.checkInAt.localeCompare(a.checkInAt));
      const lastStay = sortedStays[0];

      let members: CheckInPerson[] = [];

      // Check if stay had companions
      if (lastStay && lastStay.companions && lastStay.companions.length > 0) {
        members = [
          {
            id: `p-${guest.id}`,
            fullName: guest.name,
            idType: guest.idType || "AADHAAR",
            idNumber: guest.idNumber || "",
            idDocumentId: guest.idImage || "",
            idDocumentUrl: (guest.idImage?.startsWith("data:") ? guest.idImage : await readImage(guest.idImage)) || "",
            isPrimary: true,
            isExistingUploaded: Boolean(guest.idImage),
          },
          ...lastStay.companions.map((c, i) => ({
            id: `c-${i}`,
            fullName: c.name,
            idType: c.idType || "AADHAAR",
            idNumber: c.idNumber || "",
            idDocumentId: c.idImage || "",
            idDocumentUrl: c.idImage,
            isPrimary: false,
            isExistingUploaded: Boolean(c.idImage),
          })),
        ];
      } else {
        const previewUrl = guest.idImage?.startsWith("data:")
          ? guest.idImage
          : guest.idImage
            ? await readImage(guest.idImage)
            : null;

        members = [
          {
            id: `p-${guest.id}`,
            fullName: guest.name,
            idType: guest.idType || "AADHAAR",
            idNumber: guest.idNumber || "",
            idDocumentId: guest.idImage || "",
            idDocumentUrl: previewUrl || undefined,
            isPrimary: true,
            isExistingUploaded: Boolean(guest.idImage),
          },
        ];
      }

      const guestType =
        lastStay?.partyType || (members.length === 2 ? "COUPLE" : members.length > 2 ? "FAMILY" : "SOLO");

      return {
        id: guest.id,
        hotelId: DEFAULT_HOTEL_ID,
        guestType,
        primaryPhone: guest.phone,
        visitCount: Math.max(1, guestStays.length),
        lastVisitAt: lastStay?.checkInAt ?? guest.updatedAt ?? null,
        members,
      };
    }),
  );
}

export async function uploadIdDocument(file: File): Promise<{
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  previewUrl: string;
}> {
  // Store the selected document in IndexedDB and keep its preview in the browser.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const key = await saveImage(dataUrl);
      resolve({
        id: key,
        fileName: file.name,
        contentType: file.type || "image/jpeg",
        fileSizeBytes: file.size,
        previewUrl: dataUrl,
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function revealIdNumber(guestId: string, memberId: string): Promise<string> {
  void memberId;
  // Read the guest from the local browser database.
  const guests = await readList<Guest>(DbKeys.GUESTS);
  const guest = guests.find((g) => g.id === guestId);
  return guest?.idNumber || "•••• ••••";
}
