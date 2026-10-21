import { generateLuxuryInvoiceHtml, openPrintWindow } from "./BillPrintService";
import type { HotelSettings, Stay } from "../../../utils/interfaces/Interface";

/** Opens a luxury, brand-designed print-ready Tax Invoice / Folio for a stay. */
export const printReceipt = (stay: Stay, hotel: HotelSettings) => {
  const html = generateLuxuryInvoiceHtml({ stay, hotel, copyType: "ORIGINAL" });
  openPrintWindow(html);
};
