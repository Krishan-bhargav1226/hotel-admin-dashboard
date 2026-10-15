import type { ExpenseCategory } from "../../utils/interfaces/Interface";

export const CATEGORY_MAP: Record<ExpenseCategory, { label: string; color: string; short: string }> = {
  GROCERY_KITCHEN: { label: "Grocery & Kitchen Supplies", color: "#10B981", short: "Kitchen" },
  UTILITIES_ELECTRICITY: { label: "Electricity & Water Bills", color: "#557D8A", short: "Utilities" },
  LAUNDRY_SUPPLIES: { label: "Laundry & Detergents", color: "#0EA5E9", short: "Laundry" },
  MAINTENANCE_PARTS: { label: "Spares & Maintenance", color: "#F59E0B", short: "Maintenance" },
  FUEL_GENERATOR: { label: "Generator Fuel / Diesel", color: "#EF4444", short: "Diesel/Fuel" },
  STAFF_WELFARE: { label: "Staff Welfare & Meals", color: "#8B5CF6", short: "Staff" },
  OTHER: { label: "Miscellaneous / Other", color: "#64748B", short: "Other" },
};
