import { GUEST_LOOKUP_SCOPE, DEFAULT_HOTEL_ID } from "../utils/checkin/config";
import type { CheckInPerson, RepeatGuestMatch } from "../pages/check-in/types";
import { normalizeIdNumber } from "../utils/checkin/idValidators";

const API_BASE = "http://localhost:7444/api";

const getAuthHeaders = (): HeadersInit => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const resolveImageUrl = (img?: string | null): string => {
  if (!img) return "";
  if (img.startsWith("data:") || img.startsWith("http://") || img.startsWith("https://")) return img;
  return `http://localhost:7444${img.startsWith("/") ? "" : "/"}${img}`;
};

export async function lookupGuestByPhone(
  phone: string,
  scope: string = GUEST_LOOKUP_SCOPE,
): Promise<RepeatGuestMatch[]> {
  const normalizedPhone = normalizeIdNumber(phone).slice(-10);
  if (normalizedPhone.length !== 10) return [];

  void scope;

  try {
    const [guestsRes, staysRes] = await Promise.all([
      fetch(`${API_BASE}/guest?search=${encodeURIComponent(normalizedPhone)}`, {
        headers: getAuthHeaders(),
      }),
      fetch(`${API_BASE}/stay`, {
        headers: getAuthHeaders(),
      }),
    ]);

    const guestsJson = await guestsRes.json();
    const staysJson = await staysRes.json();

    const guestsList: any[] = Array.isArray(guestsJson) ? guestsJson : (guestsJson?.data ?? []);
    const staysList: any[] = Array.isArray(staysJson) ? staysJson : (staysJson?.data ?? []);

    const matched = guestsList.filter((g) => {
      const p = normalizeIdNumber(g.phone || "").slice(-10);
      return p === normalizedPhone;
    });

    return matched.map((guest) => {
      const guestIdStr = String(guest.id);
      const guestStays = staysList.filter((s) => String(s.guestId) === guestIdStr);
      const sortedStays = [...guestStays].sort((a, b) =>
        (b.checkInAt || "").localeCompare(a.checkInAt || "")
      );
      const lastStay = sortedStays[0];

      let members: CheckInPerson[] = [];

      if (lastStay && Array.isArray(lastStay.companions) && lastStay.companions.length > 0) {
        members = [
          {
            id: `p-${guest.id}`,
            fullName: guest.name,
            idType: (guest.idType || "AADHAAR").toUpperCase(),
            idNumber: guest.idNumber || "",
            idDocumentId: guest.idImage || "",
            idDocumentUrl: resolveImageUrl(guest.idImage),
            isPrimary: true,
            isExistingUploaded: Boolean(guest.idImage),
          },
          ...lastStay.companions.map((c: any, i: number) => ({
            id: `c-${i}`,
            fullName: c.name,
            idType: (c.idType || "AADHAAR").toUpperCase(),
            idNumber: c.idNumber || "",
            idDocumentId: c.idImage || "",
            idDocumentUrl: resolveImageUrl(c.idImage),
            isPrimary: false,
            isExistingUploaded: Boolean(c.idImage),
          })),
        ];
      } else {
        members = [
          {
            id: `p-${guest.id}`,
            fullName: guest.name,
            idType: (guest.idType || "AADHAAR").toUpperCase(),
            idNumber: guest.idNumber || "",
            idDocumentId: guest.idImage || "",
            idDocumentUrl: resolveImageUrl(guest.idImage),
            isPrimary: true,
            isExistingUploaded: Boolean(guest.idImage),
          },
        ];
      }

      const guestType =
        lastStay?.partyType ||
        (members.length === 2 ? "COUPLE" : members.length > 2 ? "FAMILY" : "SOLO");

      return {
        id: guestIdStr,
        hotelId: DEFAULT_HOTEL_ID,
        guestType,
        primaryPhone: guest.phone,
        visitCount: Math.max(1, guestStays.length),
        lastVisitAt: lastStay?.checkInAt ?? guest.updatedDate ?? guest.createdDate ?? null,
        members,
      };
    });
  } catch (err) {
    console.error("Error looking up guest from backend API:", err);
    return [];
  }
}

export async function uploadIdDocument(file: File): Promise<{
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  previewUrl: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/fileupload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    const uploadedPath = (data?.data ?? data?.url ?? data ?? "").toString();
    const previewUrl = resolveImageUrl(uploadedPath) || URL.createObjectURL(file);

    return {
      id: uploadedPath,
      fileName: file.name,
      contentType: file.type || "image/jpeg",
      fileSizeBytes: file.size,
      previewUrl,
    };
  } catch (err) {
    console.warn("Backend file upload error, falling back to client blob:", err);
    const objectUrl = URL.createObjectURL(file);
    return {
      id: objectUrl,
      fileName: file.name,
      contentType: file.type || "image/jpeg",
      fileSizeBytes: file.size,
      previewUrl: objectUrl,
    };
  }
}

export async function revealIdNumber(guestId: string, memberId: string): Promise<string> {
  void memberId;
  try {
    const res = await fetch(`${API_BASE}/guest/${guestId}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    const guest = json?.data ?? json;
    return guest?.idNumber || "•••• ••••";
  } catch {
    return "•••• ••••";
  }
}
