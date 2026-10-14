import React from "react";
import {
  Box,
  Select,
  MenuItem,
  Pagination,
  PaginationItem,
  type SelectChangeEvent,
} from "@mui/material";

interface Props {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number, pageSize: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent) => void;
}

const TablePaginationControls: React.FC<Props> = ({
  pageNumber,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const pageSizeOptions = [5, 10, 25, 50, "...", totalCount] as const;

  return (
    <Box
      mt={2}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" gap={1}>
        <span>Rows per page:</span>
        <Select
          value={pageSize?.toString()}
          onChange={onRowsPerPageChange}
          size="small"
        >
          {pageSizeOptions.map((size, idx) => {
            if (size === "...") {
              return (
                <MenuItem key={`divider-${idx}`} disabled>
                  ...
                </MenuItem>
              );
            }

            return (
              <MenuItem key={idx} value={size?.toString()}>
                {size === totalCount ? `All (${totalCount})` : size}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <Pagination
        count={totalPages}
        page={pageNumber}
        onChange={(_, value) => onPageChange(value, pageSize)}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
              color: item.selected ? "#fff" : "primary.main",
              "&:hover": {
                backgroundColor: item.selected
                  ? "primary.main"
                  : "primary.main",
                color: "#fff",
              },
              "&.Mui-selected": {
                backgroundColor: "primary.main",
              },
              minWidth: "25px",
              height: "25px",
            }}
          />
        )}
      />
    </Box>
  );
};

export default TablePaginationControls;
