import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { AlertCircle, Heart, Phone, User, UserCheck, UserPlus, Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ID_TYPE_OPTIONS, validateIdFormat } from "../../../utils/checkin/idValidators";
import { isAtLeast18YearsOld } from "../../../utils/checkin/ageValidator";
import { lookupGuestByPhone } from "../../../services/checkinApi";
import IdFileUpload from "./IdFileUpload";
import type { CheckInFormValues, CheckInPerson, PartyType } from "../types";
import { PARTY_CARD_OPTIONS } from "../types";

interface NewGuestFlowProps {
  onSwitchToRepeatWithPhone: (phone: string) => void;
}

export default function NewGuestFlow({ onSwitchToRepeatWithPhone }: NewGuestFlowProps) {
  const { values, setFieldValue, setValues } = useFormikContext<CheckInFormValues>();
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check if entered phone already exists in this hotel
  useEffect(() => {
    const clean = (values.phone || "").replace(/\D/g, "");
    if (clean.length === 10) {
      void (async () => {
        try {
          const matches = await lookupGuestByPhone(clean);
          if (matches.length > 0) {
            setDuplicateWarning(clean);
          } else {
            setDuplicateWarning(null);
          }
        } catch {
          setDuplicateWarning(null);
        }
      })();
    } else {
      setDuplicateWarning(null);
    }
  }, [values.phone]);

  const handlePartyTypeSelect = (partyType: PartyType) => {
    const updatedMembers = syncMembersForPartyType(partyType, values.members);
    setValues({
      ...values,
      customerType: "NEW",
      partyType,
      guestCount: updatedMembers.length,
      members: updatedMembers,
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    void setFieldValue("phone", raw);
  };

  const handleMemberChange = (index: number, field: keyof CheckInPerson, val: string | boolean | undefined) => {
    const updated = [...values.members];
    updated[index] = { ...updated[index], [field]: val };
    void setFieldValue("members", updated);
  };

  const addFamilyAdult = () => {
    const newAdult: CheckInPerson = {
      fullName: "",
      idType: "AADHAAR",
      idNumber: "",
      idDocumentId: "",
      isPrimary: false,
    };
    const nextMembers = [...values.members, newAdult];
    setValues({
      ...values,
      members: nextMembers,
      guestCount: nextMembers.length,
    });
  };

  const removeMember = (index: number) => {
    if (values.members.length <= 1) return;
    const nextMembers = values.members.filter((_, i) => i !== index);
    setValues({
      ...values,
      members: nextMembers,
      guestCount: nextMembers.length,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Choose Guest Type Cards */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Select Guest Category
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Choose Solo, Couple, or Family guest configuration:
        </p>

        <div role="radiogroup" aria-label="Guest Type" className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PARTY_CARD_OPTIONS.map((card) => {
            const isSelected = values.partyType === card.id;
            const Icon = card.id === "COUPLE" ? Heart : card.id === "FAMILY" ? Users : User;

            return (
              <button
                key={card.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handlePartyTypeSelect(card.id)}
                className={cn(
                  "group relative flex min-h-24 cursor-pointer flex-col items-start justify-between rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                  isSelected
                    ? "border-brand-700 bg-brand-50/70 shadow-sm ring-1 ring-brand-700 dark:border-brand-500 dark:bg-brand-950/40 dark:ring-brand-500"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg transition-colors",
                      isSelected
                        ? "bg-brand-700 text-white dark:bg-brand-600"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isSelected
                        ? "bg-brand-700 text-white dark:bg-brand-500"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {card.badge}
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">{card.label}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{card.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Primary Booking Phone Number */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
          Booking Mobile Number <span className="text-rose-600">*</span>
        </label>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Primary 10-digit number used for communication and stay records.
        </p>

        <div className="mt-3 max-w-md">
          <label className="flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 shadow-sm transition-all focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900">
            <Phone className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={values.phone}
              onChange={handlePhoneChange}
              placeholder="10-digit mobile number"
              aria-label="Booking mobile number"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold tracking-wider text-slate-900 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 dark:text-slate-100"
            />
          </label>
        </div>

        {/* Duplicate Phone Prompt */}
        {duplicateWarning && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    This number is already registered — switch to returning guest?
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Records and government ID for +91 {duplicateWarning} already exist in the system.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSwitchToRepeatWithPhone(duplicateWarning)}
                className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-800 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 dark:bg-amber-700"
              >
                <UserCheck className="size-4" />
                <span>Load Returning Guest</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Persons / Members Fields according to Guest Type */}
      <section className="space-y-4">
        {values.partyType === "FAMILY" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Note: Children under 18 are not recorded.
            </p>
            <p className="mt-0.5 text-xs text-blue-800 dark:text-blue-300">
              Please record only adult members (18+) with valid government-issued ID.
            </p>
          </div>
        )}

        {values.members.map((member, index) => {
          const personTitle =
            values.partyType === "COUPLE"
              ? index === 0
                ? "Person 1 (Primary Contact)"
                : "Person 2 (Partner)"
              : values.partyType === "FAMILY"
                ? index === 0
                  ? "Adult 1 (Primary Contact)"
                  : `Adult ${index + 1}`
                : "Solo Guest";

          const idFormatCheck = validateIdFormat(member.idType, member.idNumber);
          const dobCheck =
            values.partyType === "COUPLE" && member.dateOfBirth
              ? isAtLeast18YearsOld(member.dateOfBirth)
              : undefined;

          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--card)]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    {personTitle}
                  </span>
                  {index === 0 && (
                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                      Primary
                    </span>
                  )}
                </div>
                {values.partyType === "FAMILY" && index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="cursor-pointer text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400"
                  >
                    Remove Adult
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.fullName}
                    onChange={(e) => handleMemberChange(index, "fullName", e.target.value)}
                    placeholder="Legal name as per ID"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Date of Birth (Mandatory for Couple with 18+ Check) */}
                {values.partyType === "COUPLE" && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of Birth (DD/MM/YYYY) <span className="text-rose-600">* (18+ Required)</span>
                    </label>
                    <input
                      type="text"
                      value={member.dateOfBirth || ""}
                      onChange={(e) => handleMemberChange(index, "dateOfBirth", e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className={cn(
                        "h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900",
                        dobCheck && !dobCheck.valid
                          ? "border-rose-400 text-rose-900 focus:ring-rose-400/30 dark:border-rose-700 dark:text-rose-200"
                          : "border-slate-300 text-slate-900 focus:border-brand-700 focus:ring-brand-500/20 dark:border-slate-700 dark:text-slate-100",
                      )}
                    />
                    {dobCheck && !dobCheck.valid && (
                      <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                        {dobCheck.error}
                      </p>
                    )}
                  </div>
                )}

                {/* ID Type */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ID Type <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={member.idType}
                    onChange={(e) => handleMemberChange(index, "idType", e.target.value)}
                    className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {ID_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ID Number */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ID Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.idNumber}
                    onChange={(e) => handleMemberChange(index, "idNumber", e.target.value)}
                    placeholder="Govt ID number"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-white px-3 text-sm uppercase focus:outline-none focus:ring-2 dark:bg-slate-900",
                      !idFormatCheck.valid && member.idNumber
                        ? "border-rose-400 text-rose-900 focus:ring-rose-400/30 dark:border-rose-700 dark:text-rose-200"
                        : "border-slate-300 text-slate-900 focus:border-brand-700 focus:ring-brand-500/20 dark:border-slate-700 dark:text-slate-100",
                    )}
                  />
                  {!idFormatCheck.valid && member.idNumber && (
                    <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {idFormatCheck.error}
                    </p>
                  )}
                </div>
              </div>

              {/* ID Document File Upload */}
              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <IdFileUpload
                  personName={member.fullName || personTitle}
                  documentId={member.idDocumentId}
                  documentUrl={member.idDocumentUrl}
                  fileName={member.idDocumentFileName}
                  required={true}
                  onUploaded={(doc) => {
                    handleMemberChange(index, "idDocumentId", doc.id);
                    handleMemberChange(index, "idDocumentUrl", doc.url);
                    handleMemberChange(index, "idDocumentFileName", doc.fileName);
                  }}
                  onRemove={() => {
                    handleMemberChange(index, "idDocumentId", "");
                    handleMemberChange(index, "idDocumentUrl", undefined);
                    handleMemberChange(index, "idDocumentFileName", undefined);
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Add Adult Button for Family */}
        {values.partyType === "FAMILY" && (
          <button
            type="button"
            onClick={addFamilyAdult}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-brand-300"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            <span>Add Adult Guest</span>
          </button>
        )}
      </section>
    </div>
  );
}

function syncMembersForPartyType(partyType: PartyType, currentMembers: CheckInPerson[]): CheckInPerson[] {
  const primary: CheckInPerson = currentMembers[0] || {
    fullName: "",
    idType: "AADHAAR",
    idNumber: "",
    idDocumentId: "",
    isPrimary: true,
  };

  switch (partyType) {
    case "SOLO":
      return [{ ...primary, isPrimary: true }];

    case "COUPLE": {
      const partner: CheckInPerson = currentMembers[1] || {
        fullName: "",
        idType: "AADHAAR",
        idNumber: "",
        idDocumentId: "",
        isPrimary: false,
      };
      return [{ ...primary, isPrimary: true }, { ...partner, isPrimary: false }];
    }

    case "FAMILY": {
      if (currentMembers.length < 1) {
        return [{ ...primary, isPrimary: true }];
      }
      return currentMembers.map((m, i) => ({ ...m, isPrimary: i === 0 }));
    }

    default:
      return [{ ...primary, isPrimary: true }];
  }
}
