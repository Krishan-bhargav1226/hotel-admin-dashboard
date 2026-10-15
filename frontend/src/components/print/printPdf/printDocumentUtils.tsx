import { createRoot } from "react-dom/client";
import PrintDocument from "./PrintDocument";

export const printDocument = (
  data: Record<string, unknown>[],
  columns: { label: string }[],
  title = "Report"
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write("<div id='print-root'></div>");
  printWindow.document.close();
  const rootElement = printWindow.document.getElementById("print-root");
  if (!rootElement) return;
  createRoot(rootElement).render(<PrintDocument data={data} columns={columns} title={title} />);
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
