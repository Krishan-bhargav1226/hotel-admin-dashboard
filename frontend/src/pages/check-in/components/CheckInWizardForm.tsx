import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { computeExpectedCheckOut, estimateStayCharge } from "../../../utils/helper/billing";
import { fromLocalInput } from "../../../utils/date/dateUtils";
import { validateIdFormat } from "../../../utils/checkin/idValidators";
import { isAtLeast18YearsOld } from "../../../utils/checkin/ageValidator";
import type { RatePlan, Room, RoomType } from "../../../utils/interfaces/Interface";
import GuestLookupToggle from "./GuestLookupToggle";
import RepeatGuestLookup from "./RepeatGuestLookup";
import NewGuestFlow from "./NewGuestFlow";
import StayDurationStep from "./StayDurationStep";
import RoomSelectionStep from "./RoomSelectionStep";
import MoreDetails from "./MoreDetails";
import CheckInSummary from "./CheckInSummary";
import ReviewModal from "./ReviewModal";
import CheckInStepper from "./CheckInStepper";
import { useUnsavedWarning } from "./useUnsavedWarning";
import { getMatchingPlan } from "../planMatch";
import type { CheckInFormValues, CustomerType, DurationType } from "../types";

interface CheckInWizardFormProps {
  initialValues: CheckInFormValues;
  rooms: Room[];
  availableRooms: Room[];
  roomTypes: RoomType[];
  plans: RatePlan[];
  isLoading: boolean;
  requestedRoom: string;
  taxPercent: number;
  onSubmit: (values: CheckInFormValues) => Promise<void>;
}

const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\d{10}$/, "Enter a 10-digit mobile number")
    .required("Phone number is required"),
  members: Yup.array()
    .of(
      Yup.object({
        fullName: Yup.string().trim().required("Guest name is required"),
        idType: Yup.string().required("ID type is required"),
        idNumber: Yup.string().test("id-format", function (value) {
          const parent = this.parent as { idType: string; isExistingUploaded?: boolean };
          if (!value?.trim()) return this.createError({ message: "ID number is required" });
          const res = validateIdFormat(parent.idType, value);
          return res.valid ? true : this.createError({ message: res.error || "Invalid ID number" });
        }),
        idDocumentId: Yup.string().required("ID document upload is mandatory for every person"),
        dateOfBirth: Yup.string().test("dob-18plus", function (value) {
          const formValues = (this.options.context as { formValues?: CheckInFormValues })?.formValues;
          if (formValues?.partyType === "COUPLE") {
            if (!value) return this.createError({ message: "DOB is required for couple check-in" });
            const check = isAtLeast18YearsOld(value);
            return check.valid
              ? true
              : this.createError({ message: check.error || "Both guests in a couple stay must be 18+ years old" });
          }
          return true;
        }),
      }),
    )
    .min(1, "At least one guest is required"),
  roomIds: Yup.array()
    .of(Yup.string().required())
    .test("room-count", function (value) {
      const needed = Math.max(1, (this.parent as CheckInFormValues)?.roomsBooked || 1);
      if (!value?.length) return this.createError({ message: "Choose a room" });
      if (value.length !== needed) {
        return this.createError({ message: needed === 1 ? "Choose a room" : `Pick ${needed} rooms` });
      }
      return true;
    }),
  planId: Yup.string().required("Choose how long they are staying"),
  checkInAt: Yup.string().required("Check-in time is required"),
  advanceAmount: Yup.number()
    .transform((value, original) => (original === "" || original == null ? 0 : value))
    .min(0, "Amount cannot be negative"),
});

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function CheckInWizardForm({
  initialValues,
  rooms,
  availableRooms,
  roomTypes,
  plans,
  isLoading,
  requestedRoom,
  taxPercent,
  onSubmit,
}: CheckInWizardFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
    >
      <CheckInFormContent
        rooms={rooms}
        availableRooms={availableRooms}
        roomTypes={roomTypes}
        plans={plans}
        isLoading={isLoading}
        requestedRoom={requestedRoom}
        taxPercent={taxPercent}
        onSubmit={onSubmit}
      />
    </Formik>
  );
}

interface CheckInFormContentProps {
  rooms: Room[];
  availableRooms: Room[];
  roomTypes: RoomType[];
  plans: RatePlan[];
  isLoading: boolean;
  requestedRoom: string;
  taxPercent: number;
  onSubmit: (values: CheckInFormValues) => Promise<void>;
}

function CheckInFormContent({
  rooms,
  availableRooms,
  roomTypes,
  plans,
  isLoading,
  requestedRoom,
  taxPercent,
  onSubmit,
}: CheckInFormContentProps) {
  const { values, setValues, dirty, isSubmitting } = useFormikContext<CheckInFormValues>();
  const guestIdsReady =
    values.members.length > 0 &&
    values.members.every((member) => Boolean(member.idDocumentId || member.isExistingUploaded));
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Warn if navigating away with unsaved checkin data
  useUnsavedWarning(dirty && !isSubmitting);

  const selectedRooms = rooms.filter((room) => values.roomIds.includes(room.id));
  const primaryRoom = selectedRooms[0];
  const roomPlans = plans.filter(
    (plan) =>
      plan.isActive &&
      (plan.roomTypeIds.length === 0 || (primaryRoom && plan.roomTypeIds.includes(primaryRoom.roomTypeId))),
  );
  const activePlan = plans.find((plan) => plan.id === values.planId);
  const checkInIso = values.checkInAt ? fromLocalInput(values.checkInAt) : "";
  const expectedCheckOut = activePlan && checkInIso ? computeExpectedCheckOut(activePlan, checkInIso) : null;
  const perRoom = activePlan && checkInIso ? estimateStayCharge(activePlan, checkInIso, taxPercent) : null;
  const roomMultiplier = Math.max(1, values.roomIds.length || values.roomsBooked || 1);
  const estimate = perRoom
    ? {
        ...perRoom,
        baseAmount: perRoom.baseAmount * roomMultiplier,
        overtimeAmount: perRoom.overtimeAmount * roomMultiplier,
        taxAmount: perRoom.taxAmount * roomMultiplier,
        total: perRoom.total * roomMultiplier,
        grossAmount: perRoom.grossAmount * roomMultiplier,
        taxableAmount: perRoom.taxableAmount * roomMultiplier,
      }
    : null;

  const handleCustomerTypeChange = (type: CustomerType) => {
    setValues({
      ...values,
      customerType: type,
      phone: values.phone,
    });
  };

  const handleSwitchToNewWithPhone = (phone: string) => {
    setValues({
      ...values,
      customerType: "NEW",
      phone,
      members: [
        {
          fullName: "",
          idType: "AADHAAR",
          idNumber: "",
          idDocumentId: "",
          isPrimary: true,
        },
      ],
      repeatGuestId: undefined,
    });
  };

  const handleSwitchToRepeatWithPhone = (phone: string) => {
    setValues({
      ...values,
      customerType: "REPEAT",
      phone,
    });
  };

  const handleDurationChange = (duration: DurationType) => {
    const match = getMatchingPlan(duration, roomPlans);
    setValues({ ...values, durationType: duration, planId: match?.id ?? "" });
  };

  return (
    <Form onKeyDown={moveToNextField}>
      <SyncStayDefaults
        rooms={rooms}
        plans={plans}
        availableRooms={availableRooms}
        requestedRoom={requestedRoom}
      />

      {/* Stepper indicator */}
      <CheckInStepper
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step > currentStep && step > 1 && !guestIdsReady) return;
          setCurrentStep(step);
        }}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
        {/* Left Column: Form Steps */}
        <div className="order-1 space-y-4 lg:col-start-1">
          {/* Step 1: Guest & ID */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <GuestLookupToggle
                value={values.customerType}
                onChange={handleCustomerTypeChange}
                disabled={isLoading}
              />

              {values.customerType === "REPEAT" ? (
                <RepeatGuestLookup onSwitchToNewGuestWithPhone={handleSwitchToNewWithPhone} />
              ) : (
                <NewGuestFlow onSwitchToRepeatWithPhone={handleSwitchToRepeatWithPhone} />
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  disabled={!guestIdsReady}
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  Next: Room & Rate Plan <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Room & Plan */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <StayDurationStep roomPlans={roomPlans} onDurationChange={handleDurationChange} />
              <RoomSelectionStep availableRooms={availableRooms} roomTypes={roomTypes} />

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" /> Back to Guest Details
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCurrentStep(3)}
                  className="gap-2"
                >
                  Next: Payment & Notes <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Advance Payment & Desk Notes */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <MoreDetails />

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" /> Back to Room Details
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsReviewOpen(true)}
                  className="gap-2"
                >
                  Review & Confirm Check-In
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary & Review Trigger */}
        <div className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CheckInSummary
            selectedRooms={selectedRooms}
            roomTypes={roomTypes}
            activePlan={activePlan}
            expectedCheckOut={expectedCheckOut}
            estimate={estimate}
            isLoading={isLoading}
            onOpenReview={() => setIsReviewOpen(true)}
          />
        </div>
      </div>

      {/* Review & Confirm Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={() => {
          setIsReviewOpen(false);
          void onSubmit(values);
        }}
        isSubmitting={isLoading}
        values={values}
        selectedRooms={selectedRooms}
        roomTypes={roomTypes}
        activePlan={activePlan}
        expectedCheckOut={expectedCheckOut}
        estimate={estimate}
      />
    </Form>
  );
}

function SyncStayDefaults({
  rooms,
  plans,
  availableRooms,
  requestedRoom,
}: {
  rooms: Room[];
  plans: RatePlan[];
  availableRooms: Room[];
  requestedRoom: string;
}) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const primaryRoom = rooms.find((room) => room.id === values.roomIds[0]);
  const roomPlans = useMemo(
    () =>
      plans.filter(
        (plan) =>
          plan.isActive &&
          (plan.roomTypeIds.length === 0 || (primaryRoom && plan.roomTypeIds.includes(primaryRoom.roomTypeId))),
      ),
    [plans, primaryRoom],
  );
  const needed = Math.max(1, values.roomsBooked || 1);

  useEffect(() => {
    const valid = values.roomIds.filter((id) => availableRooms.some((room) => room.id === id));
    if (valid.length === needed && valid.length === values.roomIds.length) return;

    const next = [...valid];
    if (requestedRoom && !next.includes(requestedRoom) && availableRooms.some((room) => room.id === requestedRoom)) {
      next.unshift(requestedRoom);
    }
    for (const room of availableRooms) {
      if (next.length >= needed) break;
      if (!next.includes(room.id)) next.push(room.id);
    }
    const trimmed = next.slice(0, needed);
    if (trimmed.join() !== values.roomIds.join()) void setFieldValue("roomIds", trimmed);
  }, [availableRooms, requestedRoom, needed, values.roomIds, setFieldValue]);

  useEffect(() => {
    if (!roomPlans.length) return;
    if (roomPlans.some((plan) => plan.id === values.planId)) return;
    const matched = getMatchingPlan(values.durationType, roomPlans);
    if (matched) void setFieldValue("planId", matched.id);
  }, [roomPlans, values.planId, values.durationType, setFieldValue]);

  return null;
}

function moveToNextField(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter") return;
  const target = event.target as HTMLElement;
  if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return;
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    event.currentTarget.requestSubmit();
    return;
  }
  event.preventDefault();
  if (target.getAttribute("role") === "combobox") return;
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>("input, select, textarea, button"),
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
  const index = items.indexOf(target);
  if (index >= 0 && index < items.length - 1) items[index + 1].focus();
}
