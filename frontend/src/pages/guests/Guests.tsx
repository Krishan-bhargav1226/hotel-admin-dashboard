import { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Edit3, Trash2 } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import RenderTable from "../../components/tables/RenderTable";
import { TableRow } from "../../components/tables/TableRow";
import TablePaginationControls from "../../components/tables/TablePaginationControls";
import LoadingTable from "../../components/constants/LoadingTable";
import { IconButton } from "../../components/ui/buttons/IconButton";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import StatusChip from "../../components/ui/badges/StatusChip";
import { printDocument } from "../../components/print/printPdf/printDocumentUtils";
import { exportToExcel } from "../../components/print/printExcel/ExportToExcel";
import GuestForm from "./GuestForm";
import { useDeleteGuestMutation, useGetGuestsQuery } from "../../store/services/guest/guestSlice";
import { useClientPagination } from "../../hooks/useClientPagination";
import { ShowConfirmModal } from "../../hooks/useShowConfirmModal";
import { AppEndPoints } from "../../utils/route-endpoints/AppEndPoints";
import MaskedId from "../../components/ui/MaskedId";
import { buildPath, formatCurrency, getErrorMessage, maskId } from "../../utils/helper/helper";
import { formatFullDate } from "../../utils/date/dateUtils";
import { idTypeName } from "../../utils/helper/constants";
import { colors } from "../../utils/theme/colorTheme";
import type { Guest } from "../../utils/interfaces/Interface";

const columns = [{ label: "Sr No" }, { label: "Guest" }, { label: "ID" }, { label: "Visits" }, { label: "Last Visit" }, { label: "Total Spent" }, { label: "Action" }];
const excelColumns = [{ label: "Sr No" }, { label: "Name" }, { label: "Phone" }, { label: "ID Type" }, { label: "ID Number" }, { label: "Address" }, { label: "Visits" }, { label: "Last Visit" }, { label: "Total Spent" }];

const Guests = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryFromUrl = params.get("q") ?? "";
  const [search, setSearch] = useState(queryFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(queryFromUrl);
  useEffect(() => {
    setSearch(queryFromUrl);
  }, [queryFromUrl]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);
  const { data: guests = [], isLoading, isFetching } = useGetGuestsQuery(
    debouncedSearch.trim() ? { search: debouncedSearch.trim() } : undefined,
  );
  const [deleteGuest] = useDeleteGuestMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; guest: Guest | null }>({ open: false, guest: null });

  const pg = useClientPagination(guests);

  const rows = guests.map((g, i) => ({
    srNo: i + 1, name: g.name, phone: g.phone, idType: idTypeName(g.idType), address: g.address,
    visits: g.visits, lastVisit: formatFullDate(g.lastVisitAt), totalSpent: g.totalSpent,
    idNumber: maskId(g.idNumber),
  }));

  const handleDelete = async (g: Guest) => {
    const ok = await ShowConfirmModal({ title: "Delete guest?", text: "Guest ki ID aur profile hat jayegi. Purani stays ka record rahega.", confirmButtonText: "Delete" });
    if (!ok) return;
    try { await deleteGuest(g.id).unwrap(); toast.success("Guest deleted"); } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <MainContainer>
      <PageTitle
        title="Guests"
        subtitle={`${guests.length} guests`}
        actions={
          <>
            <UISubmitButton type="button" variant="outlined" text="Print" onClick={() => printDocument(rows, excelColumns, "Guests")} />
            <UISubmitButton type="button" color="success" text="Export to Excel" onClick={() => exportToExcel(rows, excelColumns, "Guests.xlsx")} />
            <UISubmitButton type="button" color="secondary" text="Add guest" onClick={() => setDrawer({ open: true, guest: null })} />
          </>
        }
      />
      <Box className="mb-4">
        <TextField
          size="small" label="Search by name, phone or ID number" value={search}
          onChange={(e) => { setSearch(e.target.value); pg.reset(); }} sx={{ minWidth: { xs: "100%", sm: 320 }, bgcolor: "white", "& .MuiInputBase-root": { minHeight: 44 } }}
        />
      </Box>

      <RenderTable columns={columns}>
        {isLoading || (isFetching && pg.pageItems.length === 0) ? (
          <TableRow itemIndex={1}><td colSpan={columns.length}><LoadingTable /></td></TableRow>
        ) : pg.pageItems.length === 0 ? (
          <TableRow itemIndex={1}><td className="p-4 text-center text-gray-500" colSpan={columns.length}>No Data Found</td></TableRow>
        ) : (
          pg.pageItems.map((g, index) => (
            <TableRow key={g.id} itemIndex={index}>
              <td className="p-3 rounded-l-lg">{pg.offset + index + 1}</td>
              <td className="p-3">
                <p className="font-semibold">{g.name}{g.isFlagged && <span className="ml-2 align-middle"><StatusChip label="Flagged" color={colors.danger} /></span>}</p>
                <p className="text-xs text-gray-500">{g.phone}</p>
              </td>
              <td className="p-3 text-sm">{idTypeName(g.idType)}<MaskedId value={g.idNumber} className="mt-0.5 text-gray-500" /></td>
              <td className="p-3 text-sm">
                {g.visits}
                {g.visits > 1 && <span className="ml-2 align-middle"><StatusChip label="Repeat" color={colors.success} /></span>}
              </td>
              <td className="p-3 text-sm">{formatFullDate(g.lastVisitAt)}</td>
              <td className="p-3 text-sm font-semibold">{formatCurrency(g.totalSpent)}</td>
              <td className="p-3 rounded-r-lg">
                <Box className="flex gap-1">
                  <IconButton tooltip="View" icon={<Eye size={16} />} bgColor="ORANGE" onClick={() => navigate(buildPath(AppEndPoints.GUEST_DETAILS, g.id))} />
                  <IconButton tooltip="Edit" icon={<Edit3 size={16} />} bgColor="GREEN" onClick={() => setDrawer({ open: true, guest: g })} />
                  <IconButton tooltip="Delete" icon={<Trash2 size={16} />} onClick={() => handleDelete(g)} />
                </Box>
              </td>
            </TableRow>
          ))
        )}
      </RenderTable>
      <TablePaginationControls
        pageNumber={pg.pageNumber} pageSize={pg.pageSize} totalPages={pg.totalPages} totalCount={pg.totalCount}
        onPageChange={(p) => pg.setPageNumber(p)} onRowsPerPageChange={(e) => pg.setPageSize(parseInt(e.target.value))}
      />
      <GuestForm open={drawer.open} guest={drawer.guest} onClose={() => setDrawer((d) => ({ ...d, open: false }))} />
    </MainContainer>
  );
};

export default Guests;
