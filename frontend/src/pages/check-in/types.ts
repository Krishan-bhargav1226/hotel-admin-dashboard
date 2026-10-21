import type { PaymentMode } from "../../utils/interfaces/Interface";

export type CustomerType = "NEW" | "REPEAT";
export type DurationType = "HOURLY" | "12_HOURS" | "FULL_DAY";
export type PartyType = "SOLO" | "COUPLE" | "FAMILY";

export interface CheckInPerson {
  id?: string;
  fullName: string;
  dateOfBirth?: string; // DD/MM/YYYY for couple
  idType: string; // AADHAAR, DL, VOTER, PASSPORT, PAN, OTHER
  otherIdTypeName?: string;
  idNumber: string;
  idDocumentId: string;
  idDocumentUrl?: string; // Local preview or stream URL
  idDocumentFileName?: string;
  isPrimary: boolean;
  isExistingUploaded?: boolean;
}

export interface RepeatGuestMatch {
  id: string;
  hotelId: string;
  guestType: PartyType;
  primaryPhone: string;
  visitCount: number;
  lastVisitAt: string | null;
  members: CheckInPerson[];
}

export interface CheckInFormValues {
  customerType: CustomerType; // "NEW" | "REPEAT"
  partyType: PartyType;       // "SOLO" | "COUPLE" | "FAMILY"
  guestCount: number;
  roomsBooked: number;
  durationType: DurationType;
  phone: string;
  members: CheckInPerson[];
  roomIds: string[];
  planId: string;
  checkInAt: string;
  advanceAmount: string;
  advanceMode: PaymentMode;
  notes: string;
  repeatGuestId?: string;
  repeatVisitCount?: number;
  repeatLastVisitAt?: string | null;
}

export const PARTY_CARD_OPTIONS: {
  id: PartyType;
  label: string;
  hint: string;
  personCount: number;
  badge: string;
}[] = [
  {
    id: "SOLO",
    label: "Solo",
    hint: "Single guest staying alone",
    personCount: 1,
    badge: "1 Adult",
  },
  {
    id: "COUPLE",
    label: "Couple",
    hint: "Two adults (both 18+ required with ID & DOB)",
    personCount: 2,
    badge: "Exactly 2 Adults",
  },
  {
    id: "FAMILY",
    label: "Family / Group",
    hint: "Primary contact + adult members (children not recorded)",
    personCount: 3,
    badge: "Adults only",
  },
];

export const PARTY_TYPES: { id: PartyType; label: string; guests: number }[] = [
  { id: "SOLO", label: "Solo", guests: 1 },
  { id: "COUPLE", label: "Couple", guests: 2 },
  { id: "FAMILY", label: "Family", guests: 4 },
];
