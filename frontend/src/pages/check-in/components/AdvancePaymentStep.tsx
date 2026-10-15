import { useFormikContext } from "formik";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { PAYMENT_MODES } from "../../../utils/helper/constants";
import type { CheckInFormValues } from "../types";

export default function AdvancePaymentStep() {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  return (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          Step 4 of 4
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Advance Payment & Front Desk Notes
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextInput
                        name="advanceAmount"
                        label="Advance Deposit Collected (₹)"
                        type="number"
                        placeholder="e.g. 1000 (or leave 0 for pay at checkout)"
                      />

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          Advance Payment Mode
                        </label>
                        <div className="flex items-center gap-1.5">
                          {PAYMENT_MODES.map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setFieldValue("advanceMode", mode.id)}
                              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                values.advanceMode === mode.id
                                  ? "bg-brand-700 text-white border-brand-700 shadow-2xs"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {mode.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <TextInput
                        name="notes"
                        label="Special Requests / Front Desk Notes (Optional)"
                        multiline
                        rows={2}
                        placeholder="e.g. Extra pillows requested, early wake-up call, quiet corner room"
                      />
                    </div>
                  </div>
  );
}


