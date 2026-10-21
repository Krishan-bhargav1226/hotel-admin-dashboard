import type { AuthUser } from "./authTypes";

export interface MockAccount {
  user: AuthUser;
  username: string;
  password: string;
  description: string;
  hotelBadge: string;
  badgeColor: "purple" | "blue" | "emerald";
  permissionsSummary: string[];
}

export const DEMO_PASSWORD = "admin 123";

export const MOCK_ACCOUNTS: MockAccount[] = [
  // 1. Super Admin (Chain-wide Executive Office)
  {
    user: {
      id: "usr-superadmin",
      email: "superadmin@grandhorizonhotels.com",
      name: "Devendra Singhania",
      role: "SUPER_ADMIN",
      title: "Group Managing Director & Chain Executive",
      department: "Chain Executive Office",
      phone: "+91 98765 00000",
      propertyId: "ALL",
      propertyName: "Jaipur and Goa hotel portfolio",
    },
    username: "superadmin",
    password: DEMO_PASSWORD,
    hotelBadge: "👑 Chain Headquarters",
    description: "Central command over the Jaipur and Goa portfolio, hotel operations, and financial reports.",
    badgeColor: "purple",
    permissionsSummary: [
      "Consolidated Multi-Hotel Executive Dashboard",
      "Live hotel switcher across both properties",
      "Chain Consolidated Financials & ADR Analytics",
      "Rate Plans, Room Types & Chain Settings",
      "Reveal Masked Government IDs & Audit Trails",
    ],
  },

  // 2. Hotel 1 (Jaipur Palace) - Admin
  {
    user: {
      id: "usr-admin-jaipur",
      email: "admin.jaipur@grandhorizonhotels.com",
      name: "Vikram Malhotra",
      role: "ADMIN",
      title: "General Manager — Jaipur Palace",
      department: "Property Administration",
      phone: "+91 98765 00001",
      propertyId: "prop-1",
      propertyName: "Grand Horizon Palace & Spa (Jaipur)",
    },
    username: "hotel1admin",
    password: DEMO_PASSWORD,
    hotelBadge: "🏰 Hotel 1: Jaipur Palace",
    description: "Jaipur Palace administration. 64 rooms, Jaipur staff roster, operating expenses, night audit.",
    badgeColor: "blue",
    permissionsSummary: [
      "Jaipur Palace Rooms & Inventory",
      "Staff Shifts & Roster Handover",
      "Jaipur Operating Expenses & Petty Cash",
      "Night Audit Execution & Day-End Closing",
      "Daily Occupancy & Revenue Analytics",
    ],
  },

  // 3. Hotel 1 (Jaipur Palace) - Reception
  {
    user: {
      id: "usr-reception-jaipur",
      email: "reception.jaipur@grandhorizonhotels.com",
      name: "Aarav Sharma",
      role: "RECEPTION",
      title: "Front Desk Supervisor — Jaipur Palace",
      department: "Front Office & Guest Services",
      phone: "+91 98765 00002",
      propertyId: "prop-1",
      propertyName: "Grand Horizon Palace & Spa (Jaipur)",
    },
    username: "hotel1desk",
    password: DEMO_PASSWORD,
    hotelBadge: "🏰 Hotel 1: Jaipur Palace",
    description: "Jaipur Palace front desk counter. Express check-in, guest folios, reservations, room service POS.",
    badgeColor: "emerald",
    permissionsSummary: [
      "Express Walk-In Guest Check-In & Invoices",
      "Jaipur Room Reservations & Stays Board",
      "Guest Directory & In-House Folios",
      "Room Service POS & Kitchen Orders",
      "Lost & Found Register",
    ],
  },

  // 4. Hotel 2 (Goa Resort) - Admin
  {
    user: {
      id: "usr-admin-goa",
      email: "admin.goa@grandhorizonhotels.com",
      name: "Sneha Patel",
      role: "ADMIN",
      title: "General Manager — Goa Beach Resort",
      department: "Property Administration",
      phone: "+91 98765 00003",
      propertyId: "prop-2",
      propertyName: "Grand Horizon Beach Resort & Suites (Goa)",
    },
    username: "hotel2admin",
    password: DEMO_PASSWORD,
    hotelBadge: "🏖️ Hotel 2: Goa Beach Resort",
    description: "Goa Beach Resort administration. 48 beach suites, coastal staff roster, Goa operating expenses, night audit.",
    badgeColor: "blue",
    permissionsSummary: [
      "Goa Beach Resort Rooms & Suites Inventory",
      "Goa Staff Shifts & Team Roster",
      "Goa Operating Expenses & Vendor Bills",
      "Night Audit & Revenue Closing",
      "Property Reports & Occupancy Analytics",
    ],
  },

  // 5. Hotel 2 (Goa Resort) - Reception
  {
    user: {
      id: "usr-reception-goa",
      email: "reception.goa@grandhorizonhotels.com",
      name: "Rohan Fernandes",
      role: "RECEPTION",
      title: "Front Desk Supervisor — Goa Beach Resort",
      department: "Front Office & Guest Services",
      phone: "+91 98765 00004",
      propertyId: "prop-2",
      propertyName: "Grand Horizon Beach Resort & Suites (Goa)",
    },
    username: "hotel2desk",
    password: DEMO_PASSWORD,
    hotelBadge: "🏖️ Hotel 2: Goa Beach Resort",
    description: "Goa Resort front desk. Coastal express check-in, beach cabana reservations, guest folios.",
    badgeColor: "emerald",
    permissionsSummary: [
      "Express Guest Check-In & Folios",
      "Advance Beach Villa Reservations",
      "Goa Resort In-House Stays",
      "Beachside Dining & Room Service POS",
      "Lost & Found Register",
    ],
  },

];

/** Match one of the five published demo accounts and its exact password. */
export function authenticateMockUser(rawInput: string, passwordInput: string): AuthUser | null {
  const identifier = rawInput.trim().toLowerCase();
  const account = MOCK_ACCOUNTS.find(
    (candidate) =>
      candidate.username.toLowerCase() === identifier &&
      candidate.password === passwordInput,
  );

  return account ? { ...account.user, lastLoginAt: new Date().toISOString() } : null;
}

export function getMockUserById(id: string): AuthUser {
  const account = MOCK_ACCOUNTS.find((acc) => acc.user.id === id) || MOCK_ACCOUNTS[0];
  return {
    ...account.user,
    lastLoginAt: new Date().toISOString(),
  };
}
