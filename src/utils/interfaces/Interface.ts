export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE";
export type PlanKind = "HOURLY" | "FIXED" | "TILL_TIME";
export type PaymentMode = "CASH" | "UPI" | "CARD";
export type StayStatus = "ACTIVE" | "COMPLETED";

export interface AppError {
  message: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Room {
  id: string;
  number: string;
  floor: string;
  roomTypeId: string;
  status: RoomStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatePlan {
  id: string;
  name: string;
  kind: PlanKind;
  /** HOURLY: per hour rate. FIXED / TILL_TIME: flat price. */
  rate: number;
  /** FIXED only: hours included in the flat price. */
  durationHours: number;
  /** TILL_TIME only: "HH:mm" until which the flat price is valid. */
  checkoutTime: string;
  /** HOURLY only: minimum hours billed. */
  minHours: number;
  /** FIXED / TILL_TIME: price per extra hour after the included time. */
  overtimeRate: number;
  graceMinutes: number;
  /** Empty = applies to every room type. */
  roomTypeIds: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  idType: string;
  idNumber: string;
  /** Image key (or a data URL while the form is still being filled). */
  idImage: string;
  address: string;
  isFlagged: boolean;
  flagReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestWithStats extends Guest {
  visits: number;
  totalSpent: number;
  lastVisitAt: string | null;
}

export interface GuestLookup {
  guest: Guest;
  visits: number;
  totalSpent: number;
  lastStay: Stay | null;
}

export interface Companion {
  name: string;
  idType: string;
  idNumber: string;
  idImage: string;
}

export interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
}

export interface BillBreakdown {
  elapsedMinutes: number;
  billableHours: number;
  baseLabel: string;
  baseAmount: number;
  overtimeHours: number;
  overtimeAmount: number;
  extraTotal: number;
  grossAmount: number;
  discount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
}

export interface Stay {
  id: string;
  stayNo: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestIdType: string;
  guestIdNumber: string;
  guestIdImage: string;
  companions: Companion[];
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  /** Plan snapshot, so later rate changes never alter old bills. */
  plan: RatePlan;
  checkInAt: string;
  expectedCheckOutAt: string | null;
  checkOutAt: string | null;
  status: StayStatus;
  advanceAmount: number;
  advanceMode: PaymentMode;
  extraCharges: ExtraCharge[];
  discount: number;
  taxPercent: number;
  bill: BillBreakdown | null;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: PaymentMode | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelSettings {
  hotelName: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  gstin: string;
  upiId?: string;
  taxPercent: number;
  autoCleaning: boolean;
  currencySymbol?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

/* ==================== RESERVATIONS & BOOKINGS ==================== */
export type ReservationStatus = "CONFIRMED" | "CHECKED_IN" | "CANCELLED" | "NO_SHOW";
export type BookingSource =
  | "DIRECT_WALKIN"
  | "PHONE"
  | "WEBSITE"
  | "BOOKING_COM"
  | "AGODA"
  | "MAKEMYTRIP"
  | "CORPORATE";

export interface Reservation {
  id: string;
  bookingNo: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  roomId?: string;
  roomNumber?: string;
  roomTypeId: string;
  roomTypeName: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  totalAmount: number;
  advanceAmount: number;
  paymentMode: PaymentMode;
  source: BookingSource;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

/* ==================== HOUSEKEEPING & MAINTENANCE ==================== */
export type HousekeepingStatus = "DIRTY" | "CLEANING" | "CLEAN_INSPECTED" | "OUT_OF_ORDER";

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  status: HousekeepingStatus;
  assignedTo?: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "RUSH";
  notes?: string;
  lastCleanedAt?: string;
  updatedAt: string;
}

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface MaintenanceTicket {
  id: string;
  ticketNo: string;
  roomId: string;
  roomNumber: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy: string;
  assignedTo?: string;
  cost?: number;
  createdAt: string;
  resolvedAt?: string;
}

/* ==================== POS / ROOM SERVICE & SERVICES ==================== */
export type MenuCategory =
  | "BREAKFAST"
  | "MAIN_COURSE"
  | "SNACKS"
  | "BEVERAGES"
  | "LAUNDRY"
  | "EXTRA_SERVICE";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  isAvailable: boolean;
  description?: string;
}

export interface ServiceOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ServiceOrder {
  id: string;
  orderNo: string;
  roomId: string;
  roomNumber: string;
  stayId?: string;
  guestName: string;
  items: ServiceOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  billedToRoom: boolean;
  paymentMode?: PaymentMode;
  status: "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

/* ==================== STAFF & SHIFT HANDOVER ==================== */
export type StaffRole = "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPING" | "CHEF" | "MAINTENANCE";
export type ShiftType = "MORNING" | "EVENING" | "NIGHT" | "FULL_DAY";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  shift: ShiftType;
  status: "ON_DUTY" | "OFF_DUTY";
  joinedDate: string;
}

export interface ShiftRegister {
  id: string;
  shiftDate: string;
  shiftType: ShiftType;
  staffName: string;
  openingCash: number;
  cashCollected: number;
  pettyExpensesPaid: number;
  closingCashExpected: number;
  actualCashCounted: number;
  cashDifference: number;
  handoverNotes: string;
  createdAt: string;
}

/* ==================== EXPENSES & PETTY CASH ==================== */
export type ExpenseCategory =
  | "GROCERY_KITCHEN"
  | "UTILITIES_ELECTRICITY"
  | "LAUNDRY_SUPPLIES"
  | "MAINTENANCE_PARTS"
  | "FUEL_GENERATOR"
  | "STAFF_WELFARE"
  | "OTHER";

export interface HotelExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  date: string; // YYYY-MM-DD
  paidTo?: string;
  notes?: string;
  createdAt: string;
}

