import dayjs from "dayjs";
import { useFormikContext } from "formik";
import { MdAccessTime, MdNightsStay, MdWbSunny } from "react-icons/md";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import { describePlan } from "../../../utils/helper/billing";
import { toLocalInput } from "../../../utils/date/dateUtils";
import type { RatePlan } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues, DurationType } from "../types";

interface StayDurationStepProps {
  roomPlans: RatePlan[];
  onDurationChange: (duration: DurationType) => void;
}

export default function StayDurationStep({ roomPlans, onDurationChange }: StayDurationStepProps) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const handleDurationChange = onDurationChange;
  return (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          Step 2 of 4
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Stay Duration: Hourly, 12 Hours, or Full Day?
                        </h2>
                      </div>
                    </div>

                    {/* 3 Clear Cards for Stay Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {/* 1. HOURLY */}
                      <button
                        type="button"
                        onClick={() => handleDurationChange("HOURLY")}
                        className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          values.durationType === "HOURLY"
                            ? "border-brand-700 bg-brand-700 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <MdAccessTime size={20} className={values.durationType === "HOURLY" ? "text-amber-400" : "text-amber-600"} />
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10">
                              Transit / Short
                            </span>
                          </div>
                          <div className="text-sm font-bold">Hourly Basis</div>
                          <div className="text-[11px] opacity-75 mt-0.5">
                            Billed per hour (min 2 hrs)
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10 font-mono text-xs font-semibold">
                          ₹450 / hour
                        </div>
                      </button>

                      {/* 2. 12 HOURS */}
                      <button
                        type="button"
                        onClick={() => handleDurationChange("12_HOURS")}
                        className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          values.durationType === "12_HOURS"
                            ? "border-brand-700 bg-brand-700 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <MdNightsStay size={20} className={values.durationType === "12_HOURS" ? "text-sky-300" : "text-sky-600"} />
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10">
                              Day Use / 12h
                            </span>
                          </div>
                          <div className="text-sm font-bold">12 Hours Stay</div>
                          <div className="text-[11px] opacity-75 mt-0.5">
                            Flat 12h or Day Pass
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10 font-mono text-xs font-semibold">
                          Flat ₹1,500
                        </div>
                      </button>

                      {/* 3. FULL DAY (24H) */}
                      <button
                        type="button"
                        onClick={() => handleDurationChange("FULL_DAY")}
                        className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          values.durationType === "FULL_DAY"
                            ? "border-brand-700 bg-brand-700 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <MdWbSunny size={20} className={values.durationType === "FULL_DAY" ? "text-amber-300" : "text-amber-500"} />
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10">
                              Standard Nightly
                            </span>
                          </div>
                          <div className="text-sm font-bold">Full Day (24 Hours)</div>
                          <div className="text-[11px] opacity-75 mt-0.5">
                            24h flexible hotel stay
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10 font-mono text-xs font-semibold">
                          From ₹2,800 / day
                        </div>
                      </button>
                    </div>

                    {/* Exact Plan Dropdown & Check-in Time */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Applicable Rate Plan
                        </label>
                        <SearchableSelectDropdown
                          name="planId"
                          label=""
                          required
                          options={roomPlans.map((p) => ({ id: p.id, name: p.name, hint: describePlan(p) }))}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Check-in Timestamp</label>
                          <button
                            type="button"
                            onClick={() => setFieldValue("checkInAt", toLocalInput(dayjs().toISOString()))}
                            className="text-[11px] font-semibold text-brand-700 hover:text-brand-900 cursor-pointer"
                          >
                            Set to Current Time
                          </button>
                        </div>
                        <TextInput name="checkInAt" label="" type="datetime-local" required />
                      </div>
                    </div>
                  </div>
  );
}


