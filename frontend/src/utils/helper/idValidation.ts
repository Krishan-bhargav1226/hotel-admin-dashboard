/** Format check for Indian ID numbers. Spaces and dashes are ignored. */
export function idNumberError(idType: string, raw: string): string | undefined {
  const value = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!value) return "ID number is required";

  switch (idType) {
    case "AADHAAR":
      return /^\d{12}$/.test(value) ? undefined : "Aadhaar needs 12 digits";
    case "PAN":
      return /^[A-Z]{5}\d{4}[A-Z]$/.test(value) ? undefined : "PAN looks like ABCDE1234F";
    case "PASSPORT":
      return /^[A-Z][0-9]{7}$/.test(value) ? undefined : "Passport is 1 letter and 7 digits";
    case "VOTER":
      return /^[A-Z]{3}\d{7}$/.test(value) ? undefined : "Voter ID is 3 letters and 7 digits";
    case "DL":
      return /^[A-Z0-9]{8,20}$/.test(value) ? undefined : "Enter the licence number (8–20 letters or digits)";
    default:
      return value.length >= 4 ? undefined : "Enter at least 4 characters";
  }
}
