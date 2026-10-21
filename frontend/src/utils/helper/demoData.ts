import dayjs from "dayjs";
import { uid } from "./helper";
import { calculateBill, computeExpectedCheckOut } from "./billing";
import { defaultMenuItems, defaultRatePlans, defaultRoomTypes, defaultSettings, defaultStaff } from "./seedData";
import type {
  Guest,
  HotelExpense,
  HousekeepingTask,
  MaintenanceTicket,
  PaymentMode,
  Reservation,
  Room,
  ServiceOrder,
  ShiftRegister,
  Stay,
} from "../interfaces/Interface";

const NAMES = [
  "Aarav Sharma", "Priya Verma", "Vikram Malhotra", "Neha Singh", "Rohan Mehta",
  "Pooja Rani", "Sandeep Rawat", "Kavita Devi", "Rohit Beniwal", "Simran Kaur",
  "Manoj Saini", "Ananya Sen", "Deepak Malik", "Ritu Bansal", "Kabir Khanna"
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Sample hotel data so the dashboard & reports can be previewed. */
export const buildDemoData = () => {
  const types = defaultRoomTypes();
  const plans = defaultRatePlans();
  const menuItems = defaultMenuItems();
  const staff = defaultStaff();
  const settings = defaultSettings;
  const now = dayjs();

  // 1. Rooms (3 floors, 15 rooms catering to all guest types)
  const roomConfigs = [
    // Floor 1 (Ground floor - accessible & cozy transit)
    { number: "101", floor: "Floor 1", typeId: "type-accessible", notes: "Ground floor barrier-free room with 36\" wide doors & roll-in shower" },
    { number: "102", floor: "Floor 1", typeId: "type-accessible", notes: "Wheelchair certified with bathroom safety grab bars & nurse pull-cord" },
    { number: "103", floor: "Floor 1", typeId: "type-budget", notes: "Smart transit queen with power rain shower & quick keycard access" },
    { number: "104", floor: "Floor 1", typeId: "type-standard", notes: "Romantic garden view deluxe king with ensuite soaking bathtub" },
    { number: "105", floor: "Floor 1", typeId: "type-standard", notes: "Spacious deluxe king with private outdoor patio & ambient lighting" },

    // Floor 2 (Mid floor - corporate executives & family suites)
    { number: "201", floor: "Floor 2", typeId: "type-deluxe", notes: "Executive work studio with 300Mbps fiber, ergonomic desk & Nespresso bar" },
    { number: "202", floor: "Floor 2", typeId: "type-deluxe", notes: "Soundproof business studio with USB-C universal dock & city skyline" },
    { number: "203", floor: "Floor 2", typeId: "type-standard", notes: "Deluxe King bedroom with California king mattress & luxury linens" },
    { number: "204", floor: "Floor 2", typeId: "type-family", notes: "Interconnected 2-bedroom suite with kids amenities & mini-kitchenette" },
    { number: "205", floor: "Floor 2", typeId: "type-family", notes: "Grand family suite with dual vanity bathrooms & streaming Netflix/Disney+" },

    // Floor 3 (Top floor - high executive, family & presidential penthouse)
    { number: "301", floor: "Floor 3", typeId: "type-deluxe", notes: "High-floor quiet executive studio with panoramic window & work area" },
    { number: "302", floor: "Floor 3", typeId: "type-family", notes: "Top floor family sanctuary with 2 separate bedrooms and living lounge" },
    { number: "303", floor: "Floor 3", typeId: "type-standard", notes: "Deluxe king room with private balcony and romantic sunset view" },
    { number: "304", floor: "Floor 3", typeId: "type-budget", notes: "Cozy urban transit room with queen mattress & ultra-fast WiFi" },
    { number: "305", floor: "Floor 3", typeId: "type-suite", notes: "Presidential Penthouse with panoramic terrace, private jacuzzi & butler service" },
  ];

  const rooms: Room[] = roomConfigs.map((cfg) => {
    const matchedType = types.find((t) => t.id === cfg.typeId);
    return {
      id: uid(),
      number: cfg.number,
      floor: cfg.floor,
      roomTypeId: cfg.typeId,
      status: "AVAILABLE",
      notes: cfg.notes,
      image: matchedType?.image,
      images: matchedType?.images,
      bedType: matchedType?.bedConfig,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  });

  // 2. Guests
  const guests: Guest[] = NAMES.map((name, i) => ({
    id: uid(),
    name,
    phone: `98${String(10000000 + i * 137913).slice(0, 8)}`,
    idType: i % 2 === 0 ? "AADHAAR" : "PASSPORT",
    idNumber: String(400000000000 + i * 7919133),
    idImage: "",
    address: i % 3 === 0 ? "South City 1, Gurgaon, HR" : i % 3 === 1 ? "Connaught Place, New Delhi" : "Bandra West, Mumbai",
    isFlagged: i === 7, // 1 flagged guest for demo
    flagReason: i === 7 ? "Previous disturbance and delayed checkout" : "",
    createdAt: now.subtract(45, "day").toISOString(),
    updatedAt: now.toISOString(),
  }));

  // 3. Stays
  const stays: Stay[] = [];
  const modes: PaymentMode[] = ["CASH", "UPI", "CARD"];

  const makeStay = (start: dayjs.Dayjs, hours: number, room: Room, active: boolean) => {
    const plan = hours > 20 ? plans[2] : hours > 6 ? plans[1] : plans[0];
    const guest = pick(guests);
    const checkInAt = start.toISOString();
    const expected = computeExpectedCheckOut(plan, checkInAt);
    const out = start.add(hours, "hour").toISOString();
    const extraCharges = [
      { id: uid(), label: "Room Service - Dum Biryani & Cold Brew", amount: 580 },
    ];
    const bill = calculateBill({
      plan,
      checkInAt,
      checkOutAt: out,
      expectedCheckOutAt: expected,
      extraCharges: active ? [] : extraCharges,
      discount: active ? 0 : 100,
      taxPercent: 12,
    });

    const companions =
      Math.random() > 0.4
        ? [
            {
              name: pick(NAMES),
              idType: "AADHAAR",
              idNumber: "123412341234",
              idImage: "",
            },
          ]
        : [];
    const guestCount = 1 + companions.length;
    const partyType = guestCount >= 3 ? "FAMILY" : guestCount === 2 ? "COUPLE" : "SOLO";

    stays.push({
      id: uid(),
      stayNo: `ST-${String(stays.length + 1).padStart(4, "0")}`,
      guestId: guest.id,
      guestName: guest.name,
      guestPhone: guest.phone,
      guestIdType: guest.idType,
      guestIdNumber: guest.idNumber,
      guestIdImage: "",
      companions,
      partyType,
      guestCount,
      roomId: room.id,
      roomIds: [room.id],
      roomNumber: room.number,
      roomTypeName: types.find((t) => t.id === room.roomTypeId)?.name ?? "-",
      plan,
      checkInAt,
      expectedCheckOutAt: expected,
      checkOutAt: active ? null : out,
      status: active ? "ACTIVE" : "COMPLETED",
      advanceAmount: active ? 500 : 0,
      advanceMode: "UPI",
      extraCharges: active ? extraCharges : extraCharges,
      discount: active ? 0 : 100,
      taxPercent: 12,
      bill: active ? null : bill,
      totalAmount: active ? 0 : bill.total,
      paidAmount: active ? 500 : bill.total,
      dueAmount: 0,
      paymentMode: active ? null : pick(modes),
      notes: active ? "Guest requested quiet room away from elevator" : "Corporate guest",
      createdAt: checkInAt,
      updatedAt: checkInAt,
    });
  };

  // Past 30 days completed stays
  for (let d = 30; d >= 1; d--) {
    const count = 2 + Math.floor(Math.random() * 4);
    for (let k = 0; k < count; k++) {
      const h = pick([3, 4, 8, 12, 24, 28]);
      makeStay(
        now.subtract(d, "day").hour(9 + Math.floor(Math.random() * 12)).minute(Math.floor(Math.random() * 60)),
        h,
        pick(rooms),
        false
      );
    }
  }

  // Active staying guests right now (5 rooms)
  rooms.slice(0, 5).forEach((room, i) => {
    makeStay(now.subtract(45 + i * 90, "minute"), 0, room, true);
    room.status = "OCCUPIED";
  });
  rooms[6].status = "CLEANING";
  rooms[9].status = "MAINTENANCE";

  // 4. Reservations (Upcoming advance bookings)
  const reservations: Reservation[] = [
    {
      id: uid(),
      bookingNo: "BK-1001",
      guestName: "Vikram Singhania",
      guestPhone: "9811223344",
      guestEmail: "vikram.s@singhania.com",
      roomTypeId: types[1].id,
      roomTypeName: types[1].name,
      roomId: rooms[5].id,
      roomNumber: rooms[5].number,
      checkInDate: now.add(1, "day").format("YYYY-MM-DD"),
      checkOutDate: now.add(3, "day").format("YYYY-MM-DD"),
      nights: 2,
      totalAmount: 5600,
      advanceAmount: 2000,
      paymentMode: "UPI",
      source: "BOOKING_COM",
      status: "CONFIRMED",
      specialRequests: "Airport transfer required at 3 PM, high floor prefered",
      createdAt: now.subtract(2, "day").toISOString(),
      updatedAt: now.subtract(2, "day").toISOString(),
    },
    {
      id: uid(),
      bookingNo: "BK-1002",
      guestName: "Meera Sen",
      guestPhone: "9822334455",
      guestEmail: "meera.sen@gmail.com",
      roomTypeId: types[0].id,
      roomTypeName: types[0].name,
      checkInDate: now.add(2, "day").format("YYYY-MM-DD"),
      checkOutDate: now.add(4, "day").format("YYYY-MM-DD"),
      nights: 2,
      totalAmount: 4800,
      advanceAmount: 1000,
      paymentMode: "CARD",
      source: "WEBSITE",
      status: "CONFIRMED",
      specialRequests: "King size bed with extra pillows",
      createdAt: now.subtract(1, "day").toISOString(),
      updatedAt: now.subtract(1, "day").toISOString(),
    },
    {
      id: uid(),
      bookingNo: "BK-1003",
      guestName: "Dr. Arvind Joshi",
      guestPhone: "9833445566",
      roomTypeId: types[2].id,
      roomTypeName: types[2].name,
      roomId: rooms[14].id,
      roomNumber: rooms[14].number,
      checkInDate: now.add(1, "day").format("YYYY-MM-DD"),
      checkOutDate: now.add(4, "day").format("YYYY-MM-DD"),
      nights: 3,
      totalAmount: 13500,
      advanceAmount: 5000,
      paymentMode: "UPI",
      source: "CORPORATE",
      status: "CONFIRMED",
      specialRequests: "Late night check-in around 11:30 PM",
      createdAt: now.subtract(3, "day").toISOString(),
      updatedAt: now.subtract(3, "day").toISOString(),
    },
    {
      id: uid(),
      bookingNo: "BK-1004",
      guestName: "Kunal Bansal",
      guestPhone: "9844556677",
      roomTypeId: types[0].id,
      roomTypeName: types[0].name,
      checkInDate: now.add(3, "day").format("YYYY-MM-DD"),
      checkOutDate: now.add(5, "day").format("YYYY-MM-DD"),
      nights: 2,
      totalAmount: 5600,
      advanceAmount: 1500,
      paymentMode: "CASH",
      source: "PHONE",
      status: "CONFIRMED",
      specialRequests: "Vegetarian breakfast setup",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // 5. Housekeeping & Maintenance
  const housekeeping: HousekeepingTask[] = rooms.map((r, idx) => {
    const type = types.find((t) => t.id === r.roomTypeId);
    let status: HousekeepingTask["status"] = "CLEAN_INSPECTED";
    let priority: HousekeepingTask["priority"] = "NORMAL";
    if (r.status === "CLEANING") {
      status = "CLEANING";
      priority = "RUSH";
    } else if (r.status === "MAINTENANCE") {
      status = "OUT_OF_ORDER";
    } else if (idx === 7) {
      status = "DIRTY";
      priority = "HIGH";
    }

    return {
      id: uid(),
      roomId: r.id,
      roomNumber: r.number,
      roomTypeName: type?.name || "Deluxe",
      status,
      assignedTo: idx % 2 === 0 ? "Rameshwar Yadav" : "Sunita Devi",
      priority,
      notes: status === "DIRTY" ? "Bed sheets changed, bathroom pending" : "Sanitized and inspected",
      lastCleanedAt: now.subtract(2, "hour").toISOString(),
      updatedAt: now.toISOString(),
    };
  });

  const maintenance: MaintenanceTicket[] = [
    {
      id: uid(),
      ticketNo: "MT-0001",
      roomId: rooms[9].id,
      roomNumber: rooms[9].number,
      title: "Split AC cooling issue & sensor error",
      description: "Air conditioner displaying error E4 and blowing ambient air. Gas check required.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      reportedBy: "Sneha Patel (Front Desk)",
      assignedTo: "Kishore Kumar",
      cost: 1200,
      createdAt: now.subtract(4, "hour").toISOString(),
    },
    {
      id: uid(),
      ticketNo: "MT-0002",
      roomId: rooms[6].id,
      roomNumber: rooms[6].number,
      title: "Bathroom mixer tap leakage",
      description: "Minor leak under the washbasin sink pipe.",
      priority: "MEDIUM",
      status: "OPEN",
      reportedBy: "Rameshwar (Housekeeping)",
      assignedTo: "Kishore Kumar",
      cost: 350,
      createdAt: now.subtract(1, "day").toISOString(),
    },
  ];

  // 6. Service Orders (POS / Room Service)
  const serviceOrders: ServiceOrder[] = [
    {
      id: uid(),
      orderNo: "ORD-0101",
      roomId: rooms[0].id,
      roomNumber: rooms[0].number,
      stayId: stays.find((s) => s.roomId === rooms[0].id)?.id,
      guestName: "Aarav Sharma",
      items: [
        { menuItemId: menuItems[3].id, name: menuItems[3].name, price: menuItems[3].price, quantity: 2 },
        { menuItemId: menuItems[5].id, name: menuItems[5].name, price: menuItems[5].price, quantity: 2 },
      ],
      subtotal: 1160,
      taxAmount: 58,
      totalAmount: 1218,
      billedToRoom: true,
      status: "DELIVERED",
      notes: "Less spicy, extra paper napkins",
      createdAt: now.subtract(35, "minute").toISOString(),
    },
    {
      id: uid(),
      orderNo: "ORD-0102",
      roomId: rooms[1].id,
      roomNumber: rooms[1].number,
      stayId: stays.find((s) => s.roomId === rooms[1].id)?.id,
      guestName: "Priya Verma",
      items: [
        { menuItemId: menuItems[0].id, name: menuItems[0].name, price: menuItems[0].price, quantity: 1 },
        { menuItemId: menuItems[7].id, name: menuItems[7].name, price: menuItems[7].price, quantity: 2 },
      ],
      subtotal: 710,
      taxAmount: 36,
      totalAmount: 746,
      billedToRoom: true,
      status: "PREPARING",
      notes: "Send coffee hot at 8 AM",
      createdAt: now.subtract(10, "minute").toISOString(),
    },
  ];

  // 7. Shift Registers
  const shifts: ShiftRegister[] = [
    {
      id: uid(),
      shiftDate: now.subtract(1, "day").format("YYYY-MM-DD"),
      shiftType: "MORNING",
      staffName: "Aarav Sharma",
      openingCash: 5000,
      cashCollected: 12400,
      pettyExpensesPaid: 1500,
      closingCashExpected: 15900,
      actualCashCounted: 15900,
      cashDifference: 0,
      handoverNotes: "Smooth shift. Room 204 AC reported to maintenance team.",
      createdAt: now.subtract(1, "day").toISOString(),
    },
  ];

  // 8. Operational Expenses (Past 30 days)
  const expenses: HotelExpense[] = [
    {
      id: uid(),
      title: "Fresh Vegetables & Dairy Supplies",
      category: "GROCERY_KITCHEN",
      amount: 4500,
      paymentMode: "UPI",
      date: now.format("YYYY-MM-DD"),
      paidTo: "Kisan Mandi Wholesale",
      notes: "Kitchen weekly stock replenishment",
      createdAt: now.toISOString(),
    },
    {
      id: uid(),
      title: "Commercial Laundry Detergent & Softener",
      category: "LAUNDRY_SUPPLIES",
      amount: 2800,
      paymentMode: "CASH",
      date: now.subtract(1, "day").format("YYYY-MM-DD"),
      paidTo: "ChemClean Traders",
      notes: "Bulk 50kg bag",
      createdAt: now.subtract(1, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Hotel Water Tanker Refill (10,000L)",
      category: "UTILITIES_ELECTRICITY",
      amount: 3200,
      paymentMode: "CASH",
      date: now.subtract(2, "day").format("YYYY-MM-DD"),
      paidTo: "City Water Carriers",
      notes: "Rooftop water tank supply",
      createdAt: now.subtract(2, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Backup Generator Diesel (50 Litres)",
      category: "FUEL_GENERATOR",
      amount: 4450,
      paymentMode: "CARD",
      date: now.subtract(3, "day").format("YYYY-MM-DD"),
      paidTo: "Indian Oil Petrol Pump",
      notes: "Generator fuel tank refill",
      createdAt: now.subtract(3, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Commercial LPG Cylinders (2x 19kg)",
      category: "GROCERY_KITCHEN",
      amount: 3600,
      paymentMode: "UPI",
      date: now.subtract(4, "day").format("YYYY-MM-DD"),
      paidTo: "Bharat Gas Agency",
      notes: "Kitchen cooking gas",
      createdAt: now.subtract(4, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Sanitary Fittings & LED Bulbs",
      category: "MAINTENANCE_PARTS",
      amount: 1950,
      paymentMode: "UPI",
      date: now.subtract(5, "day").format("YYYY-MM-DD"),
      paidTo: "Sharma Electricals",
      notes: "Spares for room repairs",
      createdAt: now.subtract(5, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Staff Tea, Snacks & Drinking Water",
      category: "STAFF_WELFARE",
      amount: 1200,
      paymentMode: "CASH",
      date: now.subtract(6, "day").format("YYYY-MM-DD"),
      paidTo: "Local Bakery",
      notes: "Monthly staff pantry",
      createdAt: now.subtract(6, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Monthly Electricity Substation Bill",
      category: "UTILITIES_ELECTRICITY",
      amount: 18500,
      paymentMode: "UPI",
      date: now.subtract(8, "day").format("YYYY-MM-DD"),
      paidTo: "State Power Distribution Corp",
      notes: "Commercial electricity bill",
      createdAt: now.subtract(8, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Bed Linen Replenishment & Bath Towels",
      category: "LAUNDRY_SUPPLIES",
      amount: 7800,
      paymentMode: "CARD",
      date: now.subtract(10, "day").format("YYYY-MM-DD"),
      paidTo: "Bombay Dyeing Wholesale",
      notes: "20 sets of luxury hotel bedsheets",
      createdAt: now.subtract(10, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Air Conditioner Refrigerant Gas R32",
      category: "MAINTENANCE_PARTS",
      amount: 3400,
      paymentMode: "CASH",
      date: now.subtract(12, "day").format("YYYY-MM-DD"),
      paidTo: "CoolTech Refrigeration",
      notes: "Gas top-up for Floor 2 AC units",
      createdAt: now.subtract(12, "day").toISOString(),
    },
    {
      id: uid(),
      title: "Staff Uniforms & Housekeeping Aprons",
      category: "STAFF_WELFARE",
      amount: 2600,
      paymentMode: "UPI",
      date: now.subtract(13, "day").format("YYYY-MM-DD"),
      paidTo: "Master Tailors",
      notes: "Replacement aprons and badges",
      createdAt: now.subtract(13, "day").toISOString(),
    },
  ];

  return {
    types,
    plans,
    rooms,
    guests,
    stays,
    reservations,
    housekeeping,
    maintenance,
    menuItems,
    serviceOrders,
    staff,
    shifts,
    expenses,
    settings,
  };
};
