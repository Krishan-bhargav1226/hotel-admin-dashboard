import type { Companion, PaymentMode } from "../../utils/interfaces/Interface";

export type CustomerType = "NEW" | "REPEAT";
export type PartyType = "SINGLE" | "COUPLE" | "FAMILY" | "ACCESSIBLE" | "VIP";
export type DurationType = "HOURLY" | "12_HOURS" | "FULL_DAY";

export interface CheckInFormValues {
  customerType: CustomerType;
  partyType: PartyType;
  durationType: DurationType;
  phone: string;
  name: string;
  idType: string;
  idNumber: string;
  idImage: string;
  address: string;
  companions: Companion[];
  roomId: string;
  planId: string;
  checkInAt: string;
  advanceAmount: string;
  advanceMode: PaymentMode;
  notes: string;
}
