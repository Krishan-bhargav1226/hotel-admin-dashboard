import { Box, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import SectionBox from "../../../components/ui/container/SectionBox";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { useExportBackupMutation } from "../../../store/services/settings/settingsSlice";
import { getErrorMessage } from "../../../utils/helper/helper";

const Backup = () => {
  const [exportBackup, { isLoading: exporting }] = useExportBackupMutation();

  const handleExport = async () => {
    try {
      const data = await exportBackup().unwrap();
      saveAs(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `hotel-report-${dayjs().format("YYYY-MM-DD-HHmm")}.json`);
      toast.success("Report downloaded");
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <Box className="grid gap-4 md:grid-cols-2">
      <SectionBox>
        <Typography variant="h6" fontWeight={700}>Operations report</Typography>
        <Typography variant="body2" className="!mb-3 text-gray-600">
          Download the current operations summary from the hotel API. Guest records stay on the server.
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <UISubmitButton type="button" text="Download report" loading={exporting} onClick={handleExport} />
        </Box>
      </SectionBox>
    </Box>
  );
};

export default Backup;
