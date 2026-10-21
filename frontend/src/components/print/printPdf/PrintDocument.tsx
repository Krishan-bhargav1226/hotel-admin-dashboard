import React from "react";
import { labelToKey } from "./labelToKey";

interface TableColumn {
  label: string;
}

interface PrintDocumentProps {
  data: Record<string, unknown>[];
  columns: TableColumn[];
  title?: string;
  hotelName?: string;
}

const PrintDocument: React.FC<PrintDocumentProps> = ({
  data,
  columns,
  title = "Report",
  hotelName = "Grand Horizon Hotels & Resorts",
}) => {
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div style={{ padding: "24px 30px", fontFamily: "'Inter', -apple-system, sans-serif", color: "#0f172a" }}>
      {/* Brand Header */}
      <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#b45309" }}>
            Luxury Hospitality Management Group
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 0 0", letterSpacing: 0.5, textTransform: "uppercase" }}>
            {hotelName}
          </h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a8a", marginTop: 2 }}>
            Official Executive Report · {title}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#64748b" }}>
          <div>Generated: <strong style={{ color: "#0f172a" }}>{generatedAt}</strong></div>
          <div>Total Records: <strong style={{ color: "#0f172a" }}>{data.length}</strong></div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>Confidential · Internal Hotel Records</div>
        </div>
      </div>

      {/* Report Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr>
            <th style={{ background: "#0f172a", color: "#ffffff", padding: "8px 10px", textAlign: "left", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", width: 40 }}>
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.label}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  padding: "8px 10px",
                  textAlign: "left",
                  fontSize: 9.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  borderLeft: "1px solid #1e293b",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
              <td style={{ borderBottom: "1px solid #e2e8f0", padding: "6px 10px", color: "#64748b", fontFamily: "monospace", fontSize: 9.5 }}>
                {i + 1}
              </td>
              {columns.map((col) => {
                const value = row[labelToKey(col.label)];
                const displayVal = typeof value === "object" ? JSON.stringify(value) : String(value ?? "—");
                const isNumeric = typeof value === "number" || (/^₹?\s?[\d,]+(\.\d+)?$/.test(displayVal) && !displayVal.includes(":"));
                return (
                  <td
                    key={col.label}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      padding: "6px 10px",
                      color: "#1e293b",
                      textAlign: isNumeric ? "right" : "left",
                      fontFamily: isNumeric ? "monospace, sans-serif" : "inherit",
                      fontWeight: isNumeric ? 600 : 400,
                    }}
                  >
                    {displayVal}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 8.5, color: "#94a3b8" }}>
        <div>Grand Horizon Hotels & Resorts · Management Information System</div>
        <div>Page 1 of 1 · Verified End-of-Period Snapshot</div>
      </div>
    </div>
  );
};

export default PrintDocument;
