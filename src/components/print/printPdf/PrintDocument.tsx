import React from "react";
import { createRoot } from "react-dom/client";

interface TableColumn {
  label: string;
}

interface PrintDocumentProps {
  data: Record<string, unknown>[];
  columns: TableColumn[];
  title?: string;
}

// Label → key converter ("Check In" → "checkIn")
export const labelToKey = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("");

export const printDocument = (
  data: Record<string, unknown>[],
  columns: TableColumn[],
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

const PrintDocument: React.FC<PrintDocumentProps> = ({ data, columns, title = "Report" }) => {
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.label} style={{ border: "1px solid #000", padding: 6, backgroundColor: "#f0f0f0", textAlign: "left" }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => {
                const value = row[labelToKey(col.label)];
                return (
                  <td key={col.label} style={{ border: "1px solid #000", padding: 6 }}>
                    {typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintDocument;
