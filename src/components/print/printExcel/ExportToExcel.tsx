// exportToExcel.ts

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface TableColumn {
  label: string;
}

// Label → key converter
const labelToKey = (label: string) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
};

export const exportToExcel = (
  data: Record<string, unknown>[],
  columns: TableColumn[],
  fileName: string = "report.xlsx"
) => {

  if (!data?.length || !columns?.length) return;

  const formattedData = data.map((row) => {

    const obj: Record<string, unknown> = {};

    columns.forEach((col) => {

      const key = labelToKey(col.label);

      obj[col.label] = row[key];

    });

    return obj;

  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};