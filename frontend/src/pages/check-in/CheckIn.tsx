import { useMemo, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { useCheckInMutation } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetRatePlansQuery } from "../../store/services/rate-plan/ratePlanSlice";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import { useGetGuestsQuery } from "../../store/services/guest/guestSlice";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { buildPath, getErrorMessage } from "../../utils/helper/helper";
import { fromLocalInput, toLocalInput } from "../../utils/date/dateUtils";
import CheckInWizardForm from "./components/CheckInWizardForm";
import type { CheckInFormValues } from "./types";
export type { CheckInFormValues, CustomerType, DurationType, PartyType } from "./types";

export default function CheckIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedRoom = params.get("room");
  const [checkIn, { isLoading }] = useCheckInMutation();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: roomTypes = [] } = useGetRoomTypesQuery();
  const { data: plans = [] } = useGetRatePlansQuery();
  const { data: guests = [] } = useGetGuestsQuery();
  const { data: settings } = useGetSettingsQuery();
  const [roomCategoryFilter, setRoomCategoryFilter] = useState("ALL");
  const availableRooms = useMemo(() => rooms.filter((room) => room.status === "AVAILABLE"), [rooms]);
  const initialValues = useMemo<CheckInFormValues>(() => ({
    customerType: "NEW", partyType: "SINGLE", durationType: "FULL_DAY",
    phone: "", name: "", idType: "AADHAAR", idNumber: "", idImage: "", address: "",
    companions: [], roomId: requestedRoom ?? availableRooms[0]?.id ?? "", planId: "",
    checkInAt: toLocalInput(dayjs().toISOString()), advanceAmount: "", advanceMode: "CASH", notes: "",
  }), [requestedRoom, availableRooms]);

  const handleSubmit = async (values: CheckInFormValues) => {
    try {
      const stay = await checkIn({
        guest: {
          name: values.name, phone: values.phone, idType: values.idType,
          idNumber: values.idNumber, idImage: values.idImage, address: values.address,
        },
        companions: values.companions.filter((companion) => companion.name.trim()),
        roomId: values.roomId, planId: values.planId,
        checkInAt: fromLocalInput(values.checkInAt),
        advanceAmount: Number(values.advanceAmount) || 0,
        advanceMode: values.advanceMode, taxPercent: settings?.taxPercent ?? 0, notes: values.notes,
      }).unwrap();
      toast.success(`${stay.guestName} checked in successfully — Room ${stay.roomNumber}`);
      navigate(buildPath(AppEndPoints.STAY_DETAILS, stay.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return <MainContainer>
    <PageTitle title="New check-in" subtitle="Add guest details, choose an available room, and select a stay plan." />
    <CheckInWizardForm
      initialValues={initialValues} rooms={rooms} availableRooms={availableRooms}
      roomTypes={roomTypes} plans={plans} guests={guests} isLoading={isLoading}
      roomCategoryFilter={roomCategoryFilter} setRoomCategoryFilter={setRoomCategoryFilter}
      onSubmit={handleSubmit}
    />
  </MainContainer>;
}
