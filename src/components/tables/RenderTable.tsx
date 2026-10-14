import React from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export interface TableColumn {
  label: string | React.ReactNode;
}

interface Props {
  columns: TableColumn[];
  children: React.ReactNode;
}

const RenderTable: React.FC<Props> = ({ columns, children }) => {
  return (
    <Box padding={1.5} borderRadius={3} className="border border-gray-200 bg-white">
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Table stickyHeader size="small" aria-label="data table">
          <TableHead className="[&_.MuiTableCell-root]:bg-primary [&_.MuiTableCell-root]:p-3">
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  component="th"
                  scope="col"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                  }}
                  className={`text-start ${index === 0 ? "rounded-l-md" : ""} ${
                    index === columns.length - 1 ? "rounded-r-md" : ""
                  }`}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className="text-gray-900">{children}</TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default RenderTable;
