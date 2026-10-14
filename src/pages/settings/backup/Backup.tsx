import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import SectionBox from "../../../components/ui/container/SectionBox";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import {
  useClearAllDataMutation, useExportBackupMutation, useImportBackupMutation, useLoadDemoDataMutation,
} from "../../../store/services/settings/settingsSlice";
import { ShowConfirmModal } from "../../../hooks/useShowConfirmModal";
import { getErrorMessage } from "../../../utils/helper/helper";

const Backup = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportBackup, { isLoading: exporting }] = useExportBackupMutation();
  const [importBackup, { isLoading: importing }] = useImportBackupMutation();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();
  const [clearAll, { isLoading: clearing }] = useClearAllDataMutation();

  const handleExport = async () => {
    try {
      const data = await exportBackup().unwrap();
      saveAs(new Blob([JSON.stringify(data)], { type: "application/json" }), `hotel-backup-${dayjs().format("YYYY-MM-DD-HHmm")}.json`);
      toast.success("Backup downloaded");
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    const ok = await ShowConfirmModal({ title: "Restore backup?", text: "Maujooda saara data replace ho jayega.", confirmButtonText: "Restore" });
    if (!ok) return;
    try {
      const json = JSON.parse(await file.text());
      await importBackup(json).unwrap();
      toast.success("Backup restored");
    } catch (e) { toast.error(e instanceof SyntaxError ? "Ye valid backup file nahi hai" : getErrorMessage(e)); }
  };

  const handleDemo = async () => {
    const ok = await ShowConfirmModal({
      title: "Load Complete Hotel Demo Data?",
      text: "Isse sample 15 rooms, in-house stays, advance bookings, room service menu & orders, housekeeping board, staff members, shift registers, aur operational expenses load ho jayenge.",
      confirmButtonText: "Load Demo Data",
      buttonColor: "yellow",
    });
    if (!ok) return;
    try {
      await loadDemo().unwrap();
      toast.success("Complete hotel management demo data loaded!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleClear = async () => {
    const ok = await ShowConfirmModal({ title: "Delete ALL data?", text: "Rooms, guests, ID photos, stays — sab hat jayega. Pehle backup le lo.", confirmButtonText: "Delete everything" });
    if (!ok) return;
    try { await clearAll().unwrap(); toast.success("All data cleared"); } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <Box className="grid gap-4 md:grid-cols-2">
      <SectionBox>
        <Typography variant="h6" fontWeight={700}>Backup & Export</Typography>
        <Typography variant="body2" className="!mb-3 text-gray-600">
          Data is browser/computer me save hota hai. Browser data clear karne se pehle ya computer badalne se pehle backup zaroor lo (ID photos bhi isme aati hain).
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <UISubmitButton type="button" text="Download backup" loading={exporting} onClick={handleExport} />
          <UISubmitButton type="button" variant="outlined" text="Restore from file" loading={importing} onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { handleImport(e.target.files?.[0]); e.target.value = ""; }} />
        </Box>
      </SectionBox>
      <SectionBox>
        <Typography variant="h6" fontWeight={700}>Complete Demo System</Typography>
        <Typography variant="body2" className="!mb-3 text-gray-600">
          Ek click me poore hotel ka realistic data load karo: 15 rooms, advance bookings, room service orders, housekeeping, staff, shift register, aur 30-day analytics.
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <UISubmitButton type="button" color="warning" text="Load All Hotel Demo Data" loading={loadingDemo} onClick={handleDemo} />
          <UISubmitButton type="button" color="danger" text="Delete all data" loading={clearing} onClick={handleClear} />
        </Box>
      </SectionBox>
    </Box>
  );
};

export default Backup;
