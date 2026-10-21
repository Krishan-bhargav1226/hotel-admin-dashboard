export * from "./billPrintStyles";
export * from "./invoiceTemplates";
export * from "./operationalTemplates";

/**
 * Opens a browser print window with given HTML document string.
 */
export const openPrintWindow = (html: string): void => {
  const win = window.open("", "_blank", "width=850,height=900");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
};
