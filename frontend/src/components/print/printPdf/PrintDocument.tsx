import React from "react";
import { labelToKey } from "./labelToKey";

interface TableColumn {
  label: string;
}

interface PrintDocumentProps {
  data: Record<string, unknown>[];
  columns: TableColumn[];
  title?: string;
}

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
