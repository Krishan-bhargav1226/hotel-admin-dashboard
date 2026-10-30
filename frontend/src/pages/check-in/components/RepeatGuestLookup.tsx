import { useCallback, useEffect, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { Check, Heart, Loader2, Phone, Sparkles, User, UserPlus, Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import { formatFullDate } from "../../../utils/date/dateUtils";
import { ID_TYPE_OPTIONS, validateIdFormat } from "../../../utils/checkin/idValidators";
import { isAtLeast18YearsOld } from "../../../utils/checkin/ageValidator";
import { lookupGuestByPhone } from "../../../services/checkinApi";
import IdFileUpload from "./IdFileUpload";
import type { CheckInFormValues, CheckInPerson, PartyType, RepeatGuestMatch } from "../types";
import { PARTY_CARD_OPTIONS } from "../types";

interface RepeatGuestLookupProps {
  onSwitchToNewGuestWithPhone: (phone: string) => void;
}

export default function RepeatGuestLookup({ onSwitchToNewGuestWithPhone }: RepeatGuestLookupProps) {
  const { values, setFieldValue, setFormikState } = useFormikContext<CheckInFormValues>();
  const [phoneInput, setPhoneInput] = useState(values.phone || "");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState<RepeatGuestMatch[]>([]);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus phone input on mount
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const selectGuestMatch = useCallback(
    (guest: RepeatGuestMatch) => {
      // Fill all saved details, preserving editability
      const members: CheckInPerson[] = guest.members.map((m, index) => ({
        id: m.id,
        fullName: m.fullName,
        dateOfBirth: m.dateOfBirth,
        idType: m.idType || "AADHAAR",
        idNumber: m.idNumber || "",
        idDocumentId: m.idDocumentId || "",
        idDocumentUrl: m.idDocumentUrl,
        isPrimary: index === 0,
        isExistingUploaded: Boolean(m.idDocumentId),
      }));

      // Ensure member count matches party type
      const partyType = guest.guestType || (members.length === 2 ? "COUPLE" : members.length > 2 ? "FAMILY" : "SOLO");
      const adjustedMembers = syncMembersToPartyType(partyType, members);

      setFormikState((state) => ({
        ...state,
        values: {
          ...state.values,
          customerType: "REPEAT",
          phone: guest.primaryPhone,
          partyType,
          guestCount: adjustedMembers.length,
          members: adjustedMembers,
          repeatGuestId: guest.id,
          repeatVisitCount: guest.visitCount,
          repeatLastVisitAt: guest.lastVisitAt,
        },
      }));
    },
    [setFormikState],
  );

  // Auto-search on 10th digit. Ignore the result if this lookup unmounts
  // (guest switched to New) so it cannot wipe a document uploaded afterwards.
  useEffect(() => {
    const clean = phoneInput.replace(/\D/g, "");
    if (clean.length !== 10) {
      setHasSearched(false);
      setMatches([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const results = await lookupGuestByPhone(clean);
        if (cancelled) return;
        setMatches(results);
        if (results.length === 1) {
          selectGuestMatch(results[0]);
        } else if (results.length === 0) {
          void setFieldValue("repeatGuestId", undefined);
        }
      } catch {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phoneInput, selectGuestMatch, setFieldValue]);

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneInput(raw);
    void setFieldValue("phone", raw);
  };

  const handlePartyTypeChange = (newPartyType: PartyType) => {
    setFormikState((state) => {
      const adjustedMembers = syncMembersToPartyType(newPartyType, state.values.members);
      return {
        ...state,
        values: {
          ...state.values,
          partyType: newPartyType,
          guestCount: adjustedMembers.length,
          members: adjustedMembers,
        },
      };
    });
  };

  const handleMemberFieldChange = (index: number, field: keyof CheckInPerson, val: string | boolean | undefined) => {
    patchMember(index, { [field]: val });
  };

  const patchMember = (index: number, patch: Partial<CheckInPerson>) => {
    setFormikState((state) => {
      const members = state.values.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, ...patch } : member,
      );
      return { ...state, values: { ...state.values, members } };
    });
  };

  const addFamilyAdult = () => {
    const newAdult: CheckInPerson = {
      fullName: "",
      idType: "AADHAAR",
      idNumber: "",
      idDocumentId: "",
      isPrimary: false,
    };
    setFormikState((state) => {
      const nextMembers = [...state.values.members, newAdult];
      return {
        ...state,
        values: { ...state.values, members: nextMembers, guestCount: nextMembers.length },
      };
    });
  };

  const removeMember = (index: number) => {
    setFormikState((state) => {
      if (state.values.members.length <= 1) return state;
      const nextMembers = state.values.members.filter((_, i) => i !== index);
      return {
        ...state,
        values: { ...state.values, members: nextMembers, guestCount: nextMembers.length },
      };
    });
  };

  const isSelected = Boolean(values.repeatGuestId);

  return (
    <div className="space-y-4">
      {/* Phone Number Input with Auto-search */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Returning Guest Mobile Number
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Enter 10-digit mobile number — auto-searches on 10th digit.
            </p>
          </div>
          {isSearching && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <Loader2 className="size-4 animate-spin" />
              <span>Searching guest records...</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 shadow-sm transition-all focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900">
            <Phone className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">+91</span>
            <input
              ref={phoneInputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={phoneInput}
              onChange={handlePhoneInputChange}
              placeholder="10-digit mobile number"
              aria-label="10-digit mobile number"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold tracking-wider text-slate-900 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 dark:text-slate-100"
            />
            {phoneInput.length === 10 && !isSearching && (
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
            )}
          </label>
        </div>

        {/* No Match State */}
        {hasSearched && !isSearching && matches.length === 0 && phoneInput.length === 10 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  No previous records found for +91 {phoneInput}.
                </p>
                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                  You can register this as a new guest and proceed immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchToNewGuestWithPhone(phoneInput)}
                className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:bg-brand-600"
              >
                <UserPlus className="size-4" aria-hidden="true" />
                <span>Register New Guest</span>
              </button>
            </div>
          </div>
        )}

        {/* Multiple Matches: Pick-List */}
        {hasSearched && !isSearching && matches.length > 1 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Multiple matches found — please select the matching guest profile:
            </p>
            <div className="grid gap-2">
              {matches.map((item) => {
                const isItemActive = values.repeatGuestId === item.id;
                const Icon = item.guestType === "COUPLE" ? Heart : item.guestType === "FAMILY" ? Users : User;
                const primaryName = item.members[0]?.fullName || "Guest";

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors",
                      isItemActive
                        ? "border-brand-700 bg-brand-50/70 dark:bg-brand-950/40"
                        : "border-slate-200 bg-slate-50/70 hover:bg-white dark:border-slate-700 dark:bg-slate-900",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{primaryName}</span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {item.guestType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Visit #{item.visitCount}
                          {item.lastVisitAt ? ` · Last visit: ${formatFullDate(item.lastVisitAt)}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectGuestMatch(item)}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold transition-colors",
                        isItemActive
                          ? "bg-brand-700 text-white"
                          : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
                      )}
                    >
                      {isItemActive ? (
                        <>
                          <Check className="size-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Selected Repeat Guest Banner & Editable Details */}
      {isSelected && (
        <section className="space-y-4">
          {/* Visit Badge Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-200/90 px-2 py-0.5 text-xs font-bold text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                    Repeat Guest · Visit #{values.repeatVisitCount || 1}
                  </span>
                  {values.repeatLastVisitAt && (
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Last stay: {formatFullDate(values.repeatLastVisitAt)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                  Data auto-filled from saved records. All details remain editable.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Change anything if needed
              </span>
            </div>
          </div>

          {/* Change Guest Type (Full editability) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Change Guest Type (Optional)
              </h3>
              <span className="text-xs text-slate-500">Current: {values.partyType}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Switch guest category if visiting as Solo, Couple, or Family this stay:
            </p>

            <div role="radiogroup" aria-label="Guest Type" className="mt-3 grid grid-cols-3 gap-2">
              {PARTY_CARD_OPTIONS.map((opt) => {
                const isCur = values.partyType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isCur}
                    onClick={() => handlePartyTypeChange(opt.id)}
                    className={cn(
                      "flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border p-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                      isCur
                        ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
                    )}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className={cn("text-[10px]", isCur ? "text-white/80" : "text-slate-500")}>
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Member Details & Per-Person ID Card */}
          <div className="space-y-4">
            {values.members.map((member, index) => {
              const personLabel =
                values.partyType === "COUPLE"
                  ? index === 0
                    ? "Person 1 (Primary Contact)"
                    : "Person 2 (Partner)"
                  : values.partyType === "FAMILY"
                    ? index === 0
                      ? "Adult 1 (Primary Contact)"
                      : `Adult ${index + 1}`
                    : "Solo Guest";

              const idCheck = validateIdFormat(member.idType, member.idNumber);
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
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                      {personLabel}
                    </span>
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
                        onChange={(e) => handleMemberFieldChange(index, "fullName", e.target.value)}
                        placeholder="Legal name on ID"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Date of Birth (Mandatory for Couple) */}
                    {values.partyType === "COUPLE" && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Date of Birth (DD/MM/YYYY) <span className="text-rose-600">* (18+ Required)</span>
                        </label>
                        <input
                          type="text"
                          value={member.dateOfBirth || ""}
                          onChange={(e) => handleMemberFieldChange(index, "dateOfBirth", e.target.value)}
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
                        onChange={(e) => handleMemberFieldChange(index, "idType", e.target.value)}
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
                        onChange={(e) => handleMemberFieldChange(index, "idNumber", e.target.value)}
                        placeholder="Govt ID number"
                        className={cn(
                          "h-11 w-full rounded-xl border bg-white px-3 text-sm uppercase focus:outline-none focus:ring-2 dark:bg-slate-900",
                          !idCheck.valid && member.idNumber
                            ? "border-rose-400 text-rose-900 focus:ring-rose-400/30 dark:border-rose-700 dark:text-rose-200"
                            : "border-slate-300 text-slate-900 focus:border-brand-700 focus:ring-brand-500/20 dark:border-slate-700 dark:text-slate-100",
                        )}
                      />
                      {!idCheck.valid && member.idNumber && (
                        <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                          {idCheck.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ID File Upload with replace photo button */}
                  <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <IdFileUpload
                      personName={member.fullName || personLabel}
                      documentId={member.idDocumentId}
                      documentUrl={member.idDocumentUrl}
                      fileName={member.idDocumentFileName}
                      isExistingUploaded={member.isExistingUploaded}
                      required={true}
                      onUploaded={(doc) => {
                        patchMember(index, {
                          idDocumentId: doc.id,
                          idDocumentUrl: doc.url,
                          idDocumentFileName: doc.fileName,
                          isExistingUploaded: false,
                        });
                      }}
                      onRemove={() => {
                        patchMember(index, {
                          idDocumentId: "",
                          idDocumentUrl: undefined,
                          idDocumentFileName: undefined,
                          isExistingUploaded: false,
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Add Adult button for Family */}
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
          </div>
        </section>
      )}
    </div>
  );
}

function syncMembersToPartyType(targetType: PartyType, existing: CheckInPerson[]): CheckInPerson[] {
  const primary: CheckInPerson = existing[0] || {
    fullName: "",
    idType: "AADHAAR",
    idNumber: "",
    idDocumentId: "",
    isPrimary: true,
  };

  switch (targetType) {
    case "SOLO":
      return [{ ...primary, isPrimary: true }];

    case "COUPLE": {
      const partner: CheckInPerson = existing[1] || {
        fullName: "",
        idType: "AADHAAR",
        idNumber: "",
        idDocumentId: "",
        isPrimary: false,
      };
      return [{ ...primary, isPrimary: true }, { ...partner, isPrimary: false }];
    }

    case "FAMILY": {
      if (existing.length < 1) {
        return [{ ...primary, isPrimary: true }];
      }
      return existing.map((m, i) => ({ ...m, isPrimary: i === 0 }));
    }

    default:
      return [{ ...primary, isPrimary: true }];
  }
}
