import { useEffect, useMemo } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { computeExpectedCheckOut } from "../../../utils/helper/billing";
import { fromLocalInput } from "../../../utils/date/dateUtils";
import type { Companion, GuestWithStats, RatePlan, Room, RoomType } from "../../../utils/interfaces/Interface";
import GuestDetailsStep from "./GuestDetailsStep";
import StayDurationStep from "./StayDurationStep";
import RoomSelectionStep from "./RoomSelectionStep";
import AdvancePaymentStep from "./AdvancePaymentStep";
import CheckInSummary from "./CheckInSummary";
import type { CheckInFormValues, DurationType, PartyType } from "../types";

interface CheckInWizardFormProps {
  initialValues: CheckInFormValues;
  rooms: Room[];
  availableRooms: Room[];
  roomTypes: RoomType[];
  plans: RatePlan[];
  guests: GuestWithStats[];
  isLoading: boolean;
  roomCategoryFilter: string;
  setRoomCategoryFilter: (category: string) => void;
  onSubmit: (values: CheckInFormValues) => Promise<void>;
}

const validationSchema = Yup.object({
  phone: Yup.string().matches(/^\d{10}$/, "Enter a valid 10-digit mobile number").required("Phone number is required"),
  name: Yup.string().trim().required("Guest name is required"),
  idType: Yup.string().required("ID type is required"),
  idNumber: Yup.string().trim().min(4, "Enter a valid ID number").required("ID number is required"),
  roomId: Yup.string().required("Please select a room"),
  planId: Yup.string().required("Please select a rate plan"),
  checkInAt: Yup.string().required("Check-in time is required"),
  advanceAmount: Yup.number().min(0, "Amount cannot be negative").nullable(),
});

const blankCompanion = (name = ""): Companion => ({ name, idType: "AADHAAR", idNumber: "", idImage: "" });

export default function CheckInWizardForm({ initialValues, rooms, availableRooms, roomTypes, plans, guests, isLoading, roomCategoryFilter, setRoomCategoryFilter, onSubmit }: CheckInWizardFormProps) {
  return <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
    {({ values, setFieldValue, setValues }) => {
      const selectedRoom = rooms.find((room) => room.id === values.roomId);
      const roomPlans = plans.filter((plan) => plan.isActive && (plan.roomTypeIds.length === 0 || (selectedRoom && plan.roomTypeIds.includes(selectedRoom.roomTypeId))));

      const handleDurationChange = (duration: DurationType) => {
        setFieldValue("durationType", duration);
        const match = getMatchingPlan(duration, roomPlans);
        if (match) setFieldValue("planId", match.id);
      };

      const handleSelectRepeatGuest = (guest: GuestWithStats) => {
        setValues({ ...values, customerType: "REPEAT", phone: guest.phone, name: guest.name, idType: guest.idType, idNumber: guest.idNumber, address: guest.address, idImage: guest.idImage });
        toast.success(`Loaded details for returning guest ${guest.name}`);
      };

      const handlePhoneChange = (phone: string) => {
        setFieldValue("phone", phone);
        if (phone.length !== 10) return;
        const guest = guests.find((item) => item.phone === phone);
        if (!guest) return;
        setFieldValue("customerType", "REPEAT");
        setFieldValue("name", guest.name);
        setFieldValue("idType", guest.idType);
        setFieldValue("idNumber", guest.idNumber);
        setFieldValue("address", guest.address);
        setFieldValue("idImage", guest.idImage);
        toast.success(`Verified VIP guest profile for ${guest.name}!`);
      };

      const handlePartyTypeChange = (party: PartyType) => {
        setFieldValue("partyType", party);
        if (party === "SINGLE" || party === "ACCESSIBLE") {
          setFieldValue("companions", []);
          if (party === "SINGLE") setRoomCategoryFilter("SOLO");
          else setRoomCategoryFilter("ACCESSIBLE");
        } else if (party === "COUPLE") {
          setRoomCategoryFilter("COUPLE");
          setFieldValue("companions", [values.companions[0] || blankCompanion("Spouse / Partner")]);
        } else if (party === "FAMILY") {
          setRoomCategoryFilter("FAMILY");
          if (!values.companions.length) setFieldValue("companions", [blankCompanion(), blankCompanion()]);
        } else if (party === "VIP") {
          setRoomCategoryFilter("PRESIDENTIAL");
          if (!values.companions.length) setFieldValue("companions", [blankCompanion("VIP Companion")]);
        }
      };

      const activePlan = plans.find((plan) => plan.id === values.planId);
      const expectedCheckOut = activePlan && values.checkInAt ? computeExpectedCheckOut(activePlan, fromLocalInput(values.checkInAt)) : null;

      return <Form>
        <EnsurePlanSelected rooms={rooms} plans={plans} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <GuestDetailsStep guests={guests} onSelectRepeatGuest={handleSelectRepeatGuest} onPhoneChange={handlePhoneChange} onPartyTypeChange={handlePartyTypeChange} />
            <StayDurationStep roomPlans={roomPlans} onDurationChange={handleDurationChange} />
            <RoomSelectionStep availableRooms={availableRooms} roomTypes={roomTypes} roomCategoryFilter={roomCategoryFilter} setRoomCategoryFilter={setRoomCategoryFilter} />
            <AdvancePaymentStep />
          </div>
          <CheckInSummary selectedRoom={selectedRoom} roomTypes={roomTypes} activePlan={activePlan} expectedCheckOut={expectedCheckOut} isLoading={isLoading} />
        </div>
      </Form>;
    }}
  </Formik>;
}

function EnsurePlanSelected({ rooms, plans }: { rooms: Room[]; plans: RatePlan[] }) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const selectedRoom = rooms.find((room) => room.id === values.roomId);
  const roomPlans = useMemo(() => plans.filter((plan) => plan.isActive && (plan.roomTypeIds.length === 0 || (selectedRoom && plan.roomTypeIds.includes(selectedRoom.roomTypeId)))), [plans, selectedRoom]);
  useEffect(() => {
    if (values.planId || !roomPlans.length) return;
    const matched = getMatchingPlan(values.durationType, roomPlans);
    if (matched) void setFieldValue("planId", matched.id);
  }, [roomPlans, values.planId, values.durationType, setFieldValue]);
  return null;
}

function getMatchingPlan(duration: DurationType, plans: RatePlan[]) {
  if (duration === "HOURLY") return plans.find((plan) => plan.kind === "HOURLY") || plans[0];
  if (duration === "12_HOURS") return plans.find((plan) => plan.kind === "TILL_TIME" || plan.durationHours === 12) || plans.find((plan) => plan.kind === "FIXED" && plan.durationHours < 24) || plans[0];
  return plans.find((plan) => plan.kind === "FIXED" && plan.durationHours === 24) || plans.find((plan) => plan.kind === "FIXED") || plans[0];
}
