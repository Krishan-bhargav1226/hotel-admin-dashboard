import { useEffect, useMemo } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MdPerson,
  MdPeople,
  MdFamilyRestroom,
  MdAccessTime,
  MdNightsStay,
  MdWbSunny,
  MdMeetingRoom,
  MdStar,
  MdAdd,
  MdDelete,
  MdCheckCircle,
  MdKey,
  MdArrowForward,
  MdSearch,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import { TextInput } from "../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../components/forms/SelectDropdown";
import ImageUploadField from "../../components/forms/ImageUploadField";
import { useCheckInMutation } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetRatePlansQuery } from "../../store/services/rate-plan/ratePlanSlice";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import { useGetGuestsQuery } from "../../store/services/guest/guestSlice";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { ID_TYPES, PAYMENT_MODES } from "../../utils/helper/constants";
import { describePlan, computeExpectedCheckOut } from "../../utils/helper/billing";
import { buildPath, formatCurrency, getErrorMessage } from "../../utils/helper/helper";
import { formatDateTime, fromLocalInput, toLocalInput } from "../../utils/date/dateUtils";
import type { Companion, PaymentMode, RatePlan } from "../../utils/interfaces/Interface";

export type CustomerType = "NEW" | "REPEAT";
export type PartyType = "SINGLE" | "COUPLE" | "FAMILY";
export type DurationType = "HOURLY" | "12_HOURS" | "FULL_DAY";

export interface CheckInFormValues {
  customerType: CustomerType;
  partyType: PartyType;
  durationType: DurationType;
  phone: string;
  name: string;
  idType: string;
  idNumber: string;
  idImage: string;
  address: string;
  companions: Companion[];
  roomId: string;
  planId: string;
  checkInAt: string;
  advanceAmount: string;
  advanceMode: PaymentMode;
  notes: string;
}

const blankCompanion = (name = ""): Companion => ({
  name,
  idType: "AADHAAR",
  idNumber: "",
  idImage: "",
});

const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number")
    .required("Phone number is required"),
  name: Yup.string().trim().required("Guest name is required"),
  idType: Yup.string().required("ID type is required"),
  idNumber: Yup.string().trim().min(4, "Enter a valid ID number").required("ID number is required"),
  roomId: Yup.string().required("Please select a room"),
  planId: Yup.string().required("Please select a rate plan"),
  checkInAt: Yup.string().required("Check-in time is required"),
  advanceAmount: Yup.number().min(0, "Amount cannot be negative").nullable(),
});

export default function CheckIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [checkIn, { isLoading }] = useCheckInMutation();

  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: roomTypes = [] } = useGetRoomTypesQuery();
  const { data: plans = [] } = useGetRatePlansQuery();
  const { data: guests = [] } = useGetGuestsQuery();
  const { data: settings } = useGetSettingsQuery();

  const availableRooms = useMemo(() => rooms.filter((r) => r.status === "AVAILABLE"), [rooms]);

  // Initial State
  const initialValues: CheckInFormValues = {
    customerType: "NEW",
    partyType: "SINGLE",
    durationType: "FULL_DAY",
    phone: "",
    name: "",
    idType: "AADHAAR",
    idNumber: "",
    idImage: "",
    address: "",
    companions: [],
    roomId: params.get("room") ?? (availableRooms[0]?.id || ""),
    planId: "",
    checkInAt: toLocalInput(dayjs().toISOString()),
    advanceAmount: "",
    advanceMode: "CASH",
    notes: "",
  };

  // Helper to pick matching plan based on durationType
  const getMatchingPlan = (durationType: DurationType, activePlans: RatePlan[]): RatePlan | undefined => {
    if (durationType === "HOURLY") {
      return activePlans.find((p) => p.kind === "HOURLY") || activePlans[0];
    }
    if (durationType === "12_HOURS") {
      return (
        activePlans.find((p) => p.kind === "TILL_TIME" || p.durationHours === 12) ||
        activePlans.find((p) => p.kind === "FIXED" && p.durationHours < 24) ||
        activePlans[0]
      );
    }
    // FULL_DAY (24h)
    return (
      activePlans.find((p) => p.kind === "FIXED" && p.durationHours === 24) ||
      activePlans.find((p) => p.kind === "FIXED") ||
      activePlans[0]
    );
  };

  const handleSubmit = async (v: CheckInFormValues) => {
    try {
      const stay = await checkIn({
        guest: {
          name: v.name,
          phone: v.phone,
          idType: v.idType,
          idNumber: v.idNumber,
          idImage: v.idImage,
          address: v.address,
        },
        companions: v.companions.filter((c) => c.name.trim()),
        roomId: v.roomId,
        planId: v.planId,
        checkInAt: fromLocalInput(v.checkInAt),
        advanceAmount: Number(v.advanceAmount) || 0,
        advanceMode: v.advanceMode,
        taxPercent: settings?.taxPercent ?? 0,
        notes: v.notes,
      }).unwrap();

      toast.success(`${stay.guestName} checked in successfully — Room ${stay.roomNumber}`);
      navigate(buildPath(AppEndPoints.STAY_DETAILS, stay.id));
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <MainContainer>
      {/* Editorial Header */}
      <div className="mb-6 border-b border-slate-200/70 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-900" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-500">
            Front Desk Concierge · Guided Guest Check-In
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Express Guest Check-In
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step guest verification, stay duration configuration, and instant room key assignment
        </p>
      </div>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, setValues }) => {
          // Keep plan valid and update duration matching
          const selectedRoom = rooms.find((r) => r.id === values.roomId);
          const roomPlans = plans.filter(
            (p) =>
              p.isActive &&
              (p.roomTypeIds.length === 0 ||
                (selectedRoom && p.roomTypeIds.includes(selectedRoom.roomTypeId)))
          );

          // Update plan when durationType changes
          const handleDurationChange = (d: DurationType) => {
            setFieldValue("durationType", d);
            const matched = getMatchingPlan(d, roomPlans);
            if (matched) {
              setFieldValue("planId", matched.id);
            }
          };

          // On mount or roomPlans change, ensure planId is set
          useEffect(() => {
            if (!values.planId && roomPlans.length > 0) {
              const matched = getMatchingPlan(values.durationType, roomPlans);
              if (matched) setFieldValue("planId", matched.id);
            }
          }, [roomPlans, values.planId, values.durationType, setFieldValue]);

          // Handle repeat guest auto-fetch
          const handleSelectRepeatGuest = (g: (typeof guests)[0]) => {
            setValues({
              ...values,
              customerType: "REPEAT",
              phone: g.phone,
              name: g.name,
              idType: g.idType,
              idNumber: g.idNumber,
              address: g.address,
              idImage: g.idImage,
            });
            toast.success(`Loaded details for returning guest ${g.name}`);
          };

          // Handle mobile number lookup on change
          const handlePhoneChange = (phoneStr: string) => {
            setFieldValue("phone", phoneStr);
            if (phoneStr.length === 10) {
              const matched = guests.find((g) => g.phone === phoneStr);
              if (matched) {
                setFieldValue("customerType", "REPEAT");
                setFieldValue("name", matched.name);
                setFieldValue("idType", matched.idType);
                setFieldValue("idNumber", matched.idNumber);
                setFieldValue("address", matched.address);
                setFieldValue("idImage", matched.idImage);
                toast.success(`Verified VIP guest profile for ${matched.name}!`);
              }
            }
          };

          // Handle party type change
          const handlePartyTypeChange = (p: PartyType) => {
            setFieldValue("partyType", p);
            if (p === "SINGLE") {
              setFieldValue("companions", []);
            } else if (p === "COUPLE") {
              if (values.companions.length === 0) {
                setFieldValue("companions", [blankCompanion("Spouse / Partner")]);
              } else {
                setFieldValue("companions", [values.companions[0] || blankCompanion()]);
              }
            } else if (p === "FAMILY") {
              if (values.companions.length === 0) {
                setFieldValue("companions", [blankCompanion(), blankCompanion()]);
              }
            }
          };

          const activePlan = plans.find((p) => p.id === values.planId);
          const expectedCheckOut =
            activePlan && values.checkInAt
              ? computeExpectedCheckOut(activePlan, fromLocalInput(values.checkInAt))
              : null;

          const repeatGuestMatch = guests.find((g) => g.phone === values.phone && values.phone.length === 10);

          return (
            <Form>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left 2 Cols: Step-by-Step Guided Form */}
                <div className="space-y-6 lg:col-span-2">
                  {/* STEP 1: CUSTOMER STATUS (NEW VS REPEATING) */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          Step 1 of 4
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Guest Status: New or Repeating Customer?
                        </h2>
                      </div>
                    </div>

                    {/* Segmented Selector for Customer Status */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("customerType", "NEW");
                        }}
                        className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          values.customerType === "NEW"
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs font-bold"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 font-semibold"
                        }`}
                      >
                        <MdPerson size={18} />
                        <span>✨ New Customer (First-Time)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("customerType", "REPEAT");
                        }}
                        className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          values.customerType === "REPEAT"
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs font-bold"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 font-semibold"
                        }`}
                      >
                        <MdStar size={18} className={values.customerType === "REPEAT" ? "text-amber-400" : "text-amber-500"} />
                        <span>🔄 Repeating Customer (In CRM)</span>
                      </button>
                    </div>

                    {/* IF REPEATING: SHOW QUICK GUEST SELECTOR OR MOBILE SEARCH */}
                    {values.customerType === "REPEAT" && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                            <MdSearch size={16} className="text-indigo-600" />
                            Search & Select Returning Guest:
                          </span>
                          <span className="text-[11px] text-indigo-700 font-medium">
                            {guests.length} profiles in CRM
                          </span>
                        </div>

                        {/* Quick Pills for Recent Guests */}
                        {guests.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {guests.slice(0, 4).map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => handleSelectRepeatGuest(g)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                  values.phone === g.phone
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                    : "bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50"
                                }`}
                              >
                                <span>{g.name}</span>
                                <span className="opacity-70 font-mono text-[10px]">({g.phone.slice(-4)})</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="pt-1">
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Or Type Guest Mobile Number:
                          </label>
                          <TextInput
                            name="phone"
                            label=""
                            type="tel"
                            digitsOnly
                            maxLength={10}
                            required
                            prefix="+91"
                            placeholder="Enter 10-digit mobile number"
                            onValueChange={handlePhoneChange}
                          />
                        </div>

                        {repeatGuestMatch && (
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 border border-emerald-200/80 p-2.5 text-xs text-emerald-950">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>
                                <strong>{repeatGuestMatch.name}</strong> recognized · {repeatGuestMatch.visits} stays ({formatCurrency(repeatGuestMatch.totalSpent)} spent). Details autofilled below!
                              </span>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                              KYC Verified
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* IF NEW CUSTOMER: PARTY TYPE SELECTION (SINGLE / COUPLE / FAMILY) */}
                    {values.customerType === "NEW" && (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          Select Guest Party Type:
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => handlePartyTypeChange("SINGLE")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              values.partyType === "SINGLE"
                                ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <MdPerson size={20} className="mb-1" />
                            <span className="text-xs font-bold">Single Guest</span>
                            <span className="text-[10px] opacity-75">1 Person</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePartyTypeChange("COUPLE")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              values.partyType === "COUPLE"
                                ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <MdPeople size={20} className="mb-1" />
                            <span className="text-xs font-bold">Couple</span>
                            <span className="text-[10px] opacity-75">2 Persons</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePartyTypeChange("FAMILY")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              values.partyType === "FAMILY"
                                ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <MdFamilyRestroom size={20} className="mb-1" />
                            <span className="text-xs font-bold">Family / Group</span>
                            <span className="text-[10px] opacity-75">3+ Persons</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Primary Guest Details */}
                    <div className="space-y-4 pt-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Primary Guest Identification (KYC)
                      </div>

                      {values.customerType === "NEW" && (
                        <TextInput
                          name="phone"
                          label="Mobile Number"
                          type="tel"
                          digitsOnly
                          maxLength={10}
                          required
                          prefix="+91"
                          placeholder="10-digit mobile number"
                          onValueChange={handlePhoneChange}
                        />
                      )}

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <TextInput name="name" label="Full Name" required placeholder="Guest Name" />
                        <TextInput name="address" label="City / Residence Address" placeholder="e.g. Mumbai, Maharashtra" />
                        <SearchableSelectDropdown name="idType" label="Government ID Type" required options={ID_TYPES} />
                        <TextInput name="idNumber" label="ID Number" required placeholder="Document Number" />
                      </div>

                      <ImageUploadField name="idImage" label="ID Document Photo / Scan (Optional)" />
                    </div>

                    {/* Additional Guests (If Couple or Family) */}
                    {(values.partyType === "COUPLE" || values.partyType === "FAMILY") && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <FieldArray name="companions">
                          {({ push, remove }) => (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">
                                  {values.partyType === "COUPLE"
                                    ? "Co-Guest Details (Spouse / Partner)"
                                    : `Co-Guests & Family Members (${values.companions.length})`}
                                </span>
                                {values.partyType === "FAMILY" && (
                                  <button
                                    type="button"
                                    onClick={() => push(blankCompanion())}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                                  >
                                    <MdAdd size={15} />
                                    <span>Add Another Member</span>
                                  </button>
                                )}
                              </div>

                              {values.companions.map((_c, i) => (
                                <div
                                  key={i}
                                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all"
                                >
                                  <div className="mb-2.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">
                                      Member {i + 2}: {values.partyType === "COUPLE" ? "Spouse / Partner" : "Co-Traveler"}
                                    </span>
                                    {values.partyType === "FAMILY" && (
                                      <button
                                        type="button"
                                        onClick={() => remove(i)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                                      >
                                        <MdDelete size={14} />
                                        <span>Remove</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <TextInput name={`companions.${i}.name`} label="Full Name" required placeholder="Name" />
                                    <SearchableSelectDropdown name={`companions.${i}.idType`} label="ID Type" options={ID_TYPES} />
                                    <TextInput name={`companions.${i}.idNumber`} label="ID Number" required placeholder="ID Number" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    )}
                  </div>

                  {/* STEP 2: STAY DURATION NEED (HOURLY / 12 HOURS / FULL DAY) */}
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
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
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
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
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
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
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
                            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                          >
                            Set to Current Time
                          </button>
                        </div>
                        <TextInput name="checkInAt" label="" type="datetime-local" required />
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: SMART ROOM SELECTION */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          Step 3 of 4
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Room Allocation ({availableRooms.length} Available Rooms)
                        </h2>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        {values.partyType === "FAMILY"
                          ? "Suites recommended for families"
                          : values.partyType === "COUPLE"
                          ? "Deluxe King recommended for couples"
                          : "Standard or Deluxe for solo"}
                      </span>
                    </div>

                    {availableRooms.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No available rooms found. Please free up a room or mark one clean.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                        {availableRooms.map((r) => {
                          const rType = roomTypes.find((t) => t.id === r.roomTypeId);
                          const isSelected = values.roomId === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setFieldValue("roomId", r.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900/10"
                                  : "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-800"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-mono text-lg font-bold">
                                  {r.number}
                                </span>
                                {isSelected && (
                                  <MdCheckCircle size={16} className="text-emerald-400" />
                                )}
                              </div>
                              <div className="mt-2">
                                <span className="text-xs font-semibold block truncate">
                                  {rType?.name || "Standard Room"}
                                </span>
                                <span className="text-[10px] opacity-75 font-medium block">
                                  {r.floor || "Floor 1"}{rType?.description ? ` · ${rType.description}` : ""}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* STEP 4: ADVANCE PAYMENT & SPECIAL REQUESTS */}
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
                                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
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
                </div>

                {/* Right 1 Col: Sticky Check-In Folio & Key Preview */}
                <div>
                  <div className="sticky top-20 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <MdKey size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold tracking-tight text-slate-900">
                          Check-In Folio Preview
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Automated Billing Rules
                        </span>
                      </div>
                    </div>

                    {/* Room Key Card */}
                    <div className="mb-4 rounded-xl bg-slate-50/80 border border-slate-100 p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                          Assigned Key
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {selectedRoom ? `Room ${selectedRoom.number}` : "Select Room"}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {roomTypes.find((t) => t.id === selectedRoom?.roomTypeId)?.name || "—"} · {selectedRoom?.floor}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
                        <MdMeetingRoom size={20} />
                      </div>
                    </div>

                    {/* Summary Lines */}
                    <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Guest Type</span>
                        <span className="font-semibold text-slate-900">
                          {values.customerType === "REPEAT" ? "⭐ Returning Customer" : "✨ New Customer"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Party Size</span>
                        <span className="font-semibold text-slate-900">
                          {values.partyType} ({1 + values.companions.filter((c) => c.name.trim()).length} Person)
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Duration Model</span>
                        <span className="font-semibold text-indigo-900">
                          {values.durationType === "HOURLY"
                            ? "Hourly Stay"
                            : values.durationType === "12_HOURS"
                            ? "12 Hours Pass"
                            : "Full Day (24h)"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Rate Plan</span>
                        <span className="font-semibold text-slate-900">
                          {activePlan?.name || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Rate Structure</span>
                        <span className="font-mono text-slate-700 font-medium">
                          {activePlan ? describePlan(activePlan) : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Expected Check-Out</span>
                        <span className="font-semibold text-slate-900">
                          {expectedCheckOut ? formatDateTime(expectedCheckOut) : "Flexible / By Hour"}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Billing Disclosure Box */}
                    <div className="my-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 p-3 text-xs text-amber-950">
                      <div className="font-bold text-amber-900 mb-0.5">
                        💡 Checkout Billing Calculation:
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {values.durationType === "HOURLY"
                          ? "At checkout, total bill calculates automatically based on exact elapsed hours multiplied by the hourly rate."
                          : values.durationType === "12_HOURS"
                          ? "Flat 12-hour tariff applies. If stay exceeds 12h, overtime charges apply automatically at checkout."
                          : "24-hour tariff applies. Overtime or extra night extensions calculate automatically upon checkout."}
                      </p>
                    </div>

                    {/* Advance Summary */}
                    <div className="py-2 flex justify-between items-center text-xs border-b border-slate-100">
                      <span className="text-slate-500">Advance Paid</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(Number(values.advanceAmount) || 0)} ({values.advanceMode})
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading || !values.roomId}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>{isLoading ? "Assigning Room..." : "Confirm Check-In & Issue Room Key"}</span>
                        <MdArrowForward size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </MainContainer>
  );
}
