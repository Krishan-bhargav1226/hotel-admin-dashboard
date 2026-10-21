export const ID_TYPE_OPTIONS = [
  { id: "AADHAAR", label: "Aadhaar Card" },
  { id: "DL", label: "Driving License" },
  { id: "VOTER", label: "Voter ID (EPIC)" },
  { id: "PASSPORT", label: "Passport" },
  { id: "PAN", label: "PAN Card" },
  { id: "OTHER", label: "Other Government ID" },
] as const;

export function normalizeIdNumber(raw: string): string {
  if (!raw) return "";
  return raw.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function validateIdFormat(idType: string, rawNumber: string): { valid: boolean; error?: string } {
  const normalized = normalizeIdNumber(rawNumber);

  if (!normalized) {
    return { valid: false, error: "ID number is required" };
  }

  const type = idType?.toUpperCase().trim() || "OTHER";

  switch (type) {
    case "AADHAAR":
      if (!/^\d{12}$/.test(normalized)) {
        return { valid: false, error: "Aadhaar must be exactly 12 numeric digits" };
      }
      return { valid: true };

    case "PAN":
      if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(normalized)) {
        return { valid: false, error: "PAN format must be ABCDE1234F (5 letters, 4 digits, 1 letter)" };
      }
      return { valid: true };

    case "VOTER":
    case "VOTER_ID":
      if (!/^[A-Z]{3}\d{7}$/.test(normalized)) {
        return { valid: false, error: "Voter ID must be 3 letters followed by 7 digits" };
      }
      return { valid: true };

    case "PASSPORT":
      if (!/^[A-Z]\d{7}$/.test(normalized)) {
        return { valid: false, error: "Passport must be 1 letter followed by 7 digits" };
      }
      return { valid: true };

    case "DL":
    case "DRIVING_LICENSE":
      if (!/^[A-Z0-9]{8,20}$/.test(normalized)) {
        return { valid: false, error: "Driving License must be 8–20 alphanumeric characters" };
      }
      return { valid: true };

    case "OTHER":
    default:
      if (normalized.length < 3) {
        return { valid: false, error: "ID number must have at least 3 characters" };
      }
      return { valid: true };
  }
}

export function maskIdNumber(idType: string, rawNumber: string): string {
  const normalized = normalizeIdNumber(rawNumber);
  if (!normalized) return "";

  const last4 = normalized.length > 4 ? normalized.slice(-4) : normalized;
  const type = idType?.toUpperCase().trim() || "";

  if (type === "AADHAAR" && normalized.length === 12) {
    return `•••• •••• ${last4}`;
  }

  return `••••••${last4}`;
}
