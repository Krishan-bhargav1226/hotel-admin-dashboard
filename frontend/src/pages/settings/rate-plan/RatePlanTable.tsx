import { Box } from "@mui/material";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import RenderTable from "../../../components/tables/RenderTable";
import { TableRow } from "../../../components/tables/TableRow";
import { IconButton } from "../../../components/ui/buttons/IconButton";
import StatusChip from "../../../components/ui/badges/StatusChip";
import { describePlan } from "../../../utils/helper/billing";
import { planKindName } from "../../../utils/helper/constants";
import { colors } from "../../../utils/theme/colorTheme";
import type { RatePlan, RoomType } from "../../../utils/interfaces/Interface";
import { planTableColumns } from "./ratePlanConfig";

interface RatePlanTableProps {
  plans: RatePlan[];
  roomTypes: RoomType[];
  onEdit: (plan: RatePlan) => void;
  onDelete: (plan: RatePlan) => void;
}

export default function RatePlanTable({ plans, roomTypes, onEdit, onDelete }: RatePlanTableProps) {
  return <RenderTable columns={planTableColumns}>
    {plans.map((plan, index) => <TableRow key={plan.id} itemIndex={index}>
      <td className="rounded-l-lg p-3">{index + 1}</td>
      <td className="p-3 font-semibold">{plan.name}</td>
      <td className="p-3 text-sm">{planKindName(plan.kind)}</td>
      <td className="p-3 text-sm">{describePlan(plan)}</td>
      <td className="p-3 text-sm">{plan.roomTypeIds.length === 0 ? "All rooms" : plan.roomTypeIds.map((id) => roomTypes.find((type) => type.id === id)?.name).filter(Boolean).join(", ")}</td>
      <td className="p-3"><StatusChip label={plan.isActive ? "Active" : "Inactive"} color={plan.isActive ? colors.success : colors.status.maintenance} /></td>
      <td className="rounded-r-lg p-3"><Box className="flex gap-1">
        <IconButton tooltip="Edit" icon={<FaPenToSquare size={16} />} bgColor="GREEN" onClick={() => onEdit(plan)} />
        <IconButton tooltip="Delete" icon={<FaTrashAlt size={16} />} onClick={() => onDelete(plan)} />
      </Box></td>
    </TableRow>)}
  </RenderTable>;
}
