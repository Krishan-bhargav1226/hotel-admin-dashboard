import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Moon, Printer } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { Button } from "../../components/ui/button";
import { openPrintWindow, generateNightAuditFlashHtml } from "../../components/print/printPdf/BillPrintService";
import {
  useExecuteNightAuditMutation,
  useGetNightAuditsQuery,
} from "../../store/services/night-audit/nightAuditSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetServiceOrdersQuery } from "../../store/services/pos/posSlice";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../store/services/settings/settingsSlice";
import type { NightAuditRecord } from "../../utils/interfaces/Interface";
import { AuditKpiCards } from "./components/AuditKpiCards";
import { AuditChecklist } from "./components/AuditChecklist";
import { CashierReconciliation } from "./components/CashierReconciliation";
import { AuditHistoryTable } from "./components/AuditHistoryTable";
import { AuditConfirmModal } from "./components/AuditConfirmModal";

export default function NightAudit() {
  const { data: audits = [] } = useGetNightAuditsQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: orders = [] } = useGetServiceOrdersQuery();
  const { data: settings } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  const [executeAudit, { isLoading: isExecuting }] = useExecuteNightAuditMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const activeStays = stays.filter((s) => s.status === "ACTIVE");
  const occupiedRoomsCount = activeStays.length;
  const totalRoomsCount = rooms.length || 20;
  const occupancyPercent = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;

  // Revenue computations
  const totalRoomRevenue = activeStays.reduce((acc, s) => acc + (s.bill?.baseAmount || s.totalAmount || 0), 0);
  const totalPosRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalServicesRevenue = activeStays.reduce(
    (acc, s) => acc + s.extraCharges.reduce((sum, c) => sum + c.amount, 0),
    0
  );
  const grossRevenue = totalRoomRevenue + totalPosRevenue + totalServicesRevenue;
  const adr = occupiedRoomsCount > 0 ? Math.round(totalRoomRevenue / occupiedRoomsCount) : 0;
  const revPar = totalRoomsCount > 0 ? Math.round(totalRoomRevenue / totalRoomsCount) : 0;
  const estGst = Math.round(grossRevenue * 0.12);

  // Settlements
  const cashTotal = activeStays
    .filter((s) => s.advanceMode === "CASH")
    .reduce((acc, s) => acc + s.advanceAmount, 0);
  const upiTotal = activeStays
    .filter((s) => s.advanceMode === "UPI")
    .reduce((acc, s) => acc + s.advanceAmount, 0);
  const cardTotal = activeStays
    .filter((s) => s.advanceMode === "CARD")
    .reduce((acc, s) => acc + s.advanceAmount, 0);

  // Operational checks
  const pendingDepartures = activeStays.filter(
    (s) => s.expectedCheckOutAt && dayjs(s.expectedCheckOutAt).isBefore(dayjs())
  ).length;
  const pendingArrivals = reservations.filter(
    (r) => r.status === "CONFIRMED" && dayjs(r.checkInDate).isSame(dayjs(), "day")
  ).length;
  const openPosOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;
  const dirtyRoomsCount = rooms.filter((r) => r.status === "CLEANING").length;

  const handleRunAudit = async () => {
    try {
      const today = dayjs().format("YYYY-MM-DD");
      await executeAudit({
        businessDate: today,
        auditedBy: settings?.managerSignatory || "Duty Manager Vikram Malhotra",
        totalRooms: totalRoomsCount,
        occupiedRooms: occupiedRoomsCount,
        occupancyRate: occupancyPercent,
        roomRevenue: totalRoomRevenue,
        posRevenue: totalPosRevenue,
        servicesRevenue: totalServicesRevenue,
        totalRevenue: grossRevenue,
        adr,
        revPar,
        totalGst: estGst,
        settlements: { cash: cashTotal, upi: upiTotal, card: cardTotal, corporate: 0 },
        notes: `Night audit completed. Business date ${today} closed. Room tariffs posted to folios.`,
      }).unwrap();

      toast.success("Night audit completed! Business date rolled to next cycle.");
      setShowConfirmModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Night audit execution failed");
    }
  };

  const handlePrintFlashReport = (record?: NightAuditRecord) => {
    const r = record || {
      id: "na-preview",
      businessDate: dayjs().format("YYYY-MM-DD"),
      auditTimestamp: new Date().toISOString(),
      auditedBy: settings?.managerSignatory || "General Manager",
      totalRooms: totalRoomsCount,
      occupiedRooms: occupiedRoomsCount,
      occupancyRate: occupancyPercent,
      roomRevenue: totalRoomRevenue,
      posRevenue: totalPosRevenue,
      servicesRevenue: totalServicesRevenue,
      totalRevenue: grossRevenue,
      adr,
      revPar,
      totalGst: estGst,
      settlements: { cash: cashTotal, upi: upiTotal, card: cardTotal, corporate: 0 },
      notes: "Daily Flash Summary Preview",
    };
    const html = generateNightAuditFlashHtml(r, settings);
    openPrintWindow(html);
  };

  return (
    <MainContainer>
      {settings?.enableNightAudit === false && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Moon className="size-4 text-amber-600" />
            <span>
              <strong>Night Audit (EOD) is currently disabled.</strong> Daily operations continue normally without mandatory daily rollover.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await updateSettings({ ...settings, enableNightAudit: true }).unwrap();
              toast.success("Night Audit enabled in property settings");
            }}
            className="h-7 text-xs font-semibold"
          >
            Re-Enable Night Audit
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle
          title="Night Audit (EOD) Operations"
          subtitle="Close operational business day, reconcile revenue & tender, and roll PMS date"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePrintFlashReport()} className="gap-2 font-semibold">
            <Printer className="size-4" />
            <span>Print Daily Flash</span>
          </Button>
          <Button variant="default" size="sm" onClick={() => setShowConfirmModal(true)} className="gap-2 font-semibold">
            <Moon className="size-4" />
            <span>Run Night Audit</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <AuditKpiCards
          occupancyPercent={occupancyPercent}
          occupiedRoomsCount={occupiedRoomsCount}
          totalRoomsCount={totalRoomsCount}
          grossRevenue={grossRevenue}
          totalRoomRevenue={totalRoomRevenue}
          adr={adr}
          revPar={revPar}
        />

        <AuditChecklist
          pendingDepartures={pendingDepartures}
          pendingArrivals={pendingArrivals}
          openPosOrders={openPosOrders}
          dirtyRoomsCount={dirtyRoomsCount}
        />

        <CashierReconciliation
          cashTotal={cashTotal}
          upiTotal={upiTotal}
          cardTotal={cardTotal}
          estGst={estGst}
        />

        <AuditHistoryTable audits={audits} onPrintReport={handlePrintFlashReport} />
      </div>

      <AuditConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleRunAudit}
        isLoading={isExecuting}
        businessDate={dayjs().format("YYYY-MM-DD")}
        grossRevenue={grossRevenue}
        occupancyPercent={occupancyPercent}
      />
    </MainContainer>
  );
}
