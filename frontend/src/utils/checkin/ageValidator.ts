export interface AgeValidationResult {
  valid: boolean;
  age: number;
  error?: string;
  parsedDate?: string; // YYYY-MM-DD
}

/**
 * Validates whether a date of birth corresponds to an individual who is at least 18 years old.
 * Supports DD/MM/YYYY or YYYY-MM-DD string formats.
 */
export function isAtLeast18YearsOld(dobString: string, referenceDate: Date = new Date()): AgeValidationResult {
  if (!dobString || !dobString.trim()) {
    return { valid: false, age: 0, error: "Date of birth is required" };
  }

  const clean = dobString.trim();
  let day: number;
  let month: number;
  let year: number;

  if (clean.includes("/")) {
    // DD/MM/YYYY
    const parts = clean.split("/").map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { valid: false, age: 0, error: "Enter a valid date in DD/MM/YYYY format" };
    }
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else if (clean.includes("-")) {
    const parts = clean.split("-").map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { valid: false, age: 0, error: "Enter a valid date" };
    }
    if (parts[0] > 1000) {
      // YYYY-MM-DD
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      // DD-MM-YYYY
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }
  } else {
    return { valid: false, age: 0, error: "Enter date as DD/MM/YYYY" };
  }

  if (year < 1900 || year > referenceDate.getFullYear()) {
    return { valid: false, age: 0, error: "Enter a valid year of birth" };
  }

  if (month < 1 || month > 12) {
    return { valid: false, age: 0, error: "Month must be between 01 and 12" };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { valid: false, age: 0, error: `Day must be between 01 and ${daysInMonth}` };
  }

  const birthDate = new Date(year, month - 1, day);
  if (birthDate > referenceDate) {
    return { valid: false, age: 0, error: "Date of birth cannot be in the future" };
  }

  // Calculate age
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  const parsedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  if (age < 18) {
    return {
      valid: false,
      age,
      parsedDate,
      error: `Must be 18+ years old (currently ${age} year${age === 1 ? "" : "s"} old). Underage guest not allowed in couple booking.`,
    };
  }

  return { valid: true, age, parsedDate };
}

/** Formats a date string into DD/MM/YYYY for display */
export function formatDobForDisplay(isoOrInput: string): string {
  if (!isoOrInput) return "";
  if (isoOrInput.includes("/")) return isoOrInput;
  const parts = isoOrInput.split("T")[0].split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoOrInput;
}
