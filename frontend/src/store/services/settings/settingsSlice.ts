import { hotelApi, run, ALL_TAGS } from "../baseQuery";
import {
  clearAll,
  exportAll,
  importAll,
  readSettings,
  runExclusive,
  seedAllDemoData,
  writeSettings,
} from "../../../utils/db/localDb";
import type { HotelSettings } from "../../../utils/interfaces/Interface";

const settingsApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<HotelSettings, void>({
      queryFn: () => run(() => readSettings()),
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<HotelSettings, HotelSettings>({
      queryFn: (data) =>
        run(() =>
          runExclusive(async () => {
            await writeSettings(data);
            return data;
          })
        ),
      invalidatesTags: ["Settings"],
    }),
    exportBackup: builder.mutation<Record<string, unknown>, void>({
      queryFn: () => run(() => exportAll()),
    }),
    importBackup: builder.mutation<boolean, Record<string, unknown>>({
      queryFn: (data) =>
        run(() =>
          runExclusive(async () => {
            await importAll(data);
            return true;
          })
        ),
      invalidatesTags: [...ALL_TAGS],
    }),
    loadDemoData: builder.mutation<boolean, void>({
      queryFn: () =>
        run(() =>
          runExclusive(async () => {
            await seedAllDemoData();
            return true;
          })
        ),
      invalidatesTags: [...ALL_TAGS],
    }),
    clearAllData: builder.mutation<boolean, void>({
      queryFn: () =>
        run(() =>
          runExclusive(async () => {
            await clearAll();
            return true;
          })
        ),
      invalidatesTags: [...ALL_TAGS],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useExportBackupMutation,
  useImportBackupMutation,
  useLoadDemoDataMutation,
  useClearAllDataMutation,
} = settingsApi;

export default settingsApi;
