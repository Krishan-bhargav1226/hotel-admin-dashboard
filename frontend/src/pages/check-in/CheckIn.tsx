import { useMemo } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { useCheckInMutation } from "../../store/services/stay/staySlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetRatePlansQuery } from "../../store/services/rate-plan/ratePlanSlice";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { getErrorMessage } from "../../utils/helper/helper";
import { fromLocalInput, toLocalInput } from "../../utils/date/dateUtils";
import CheckInWizardForm from "./components/CheckInWizardForm";
import type { CheckInFormValues } from "./types";

export type { CheckInFormValues, CustomerType, DurationType, PartyType } from "./types";

export default function CheckIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedRoom = params.get("room") ?? "";
  const [checkIn, { isLoading }] = useCheckInMutation();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: roomTypes = [] } = useGetRoomTypesQuery();
  const { data: plans = [] } = useGetRatePlansQuery();
  const { data: settings } = useGetSettingsQuery();

  const availableRooms = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    const blockedRoomIds = new Set(
      reservations
        .filter(
          (reservation) =>
            reservation.status === "CONFIRMED" &&
            reservation.roomId &&
            reservation.checkInDate <= today &&
            reservation.checkOutDate > today,
        )
        .map((reservation) => reservation.roomId as string),
    );
    return rooms.filter((room) => room.status === "AVAILABLE" && !blockedRoomIds.has(room.id));
  }, [rooms, reservations]);

  const initialValues = useMemo<CheckInFormValues>(
    () => ({
      customerType: "REPEAT", // Starts on 'Yes, Returning Guest' for fastest workflow
      partyType: "SOLO",
      guestCount: 1,
      roomsBooked: 1,
      durationType: "FULL_DAY",
      phone: "",
      members: [
        {
          fullName: "",
          idType: "AADHAAR",
          idNumber: "",
          idDocumentId: "",
          isPrimary: true,
        },
      ],
      roomIds: [],
      planId: "",
      checkInAt: toLocalInput(dayjs().toISOString()),
      advanceAmount: "",
      advanceMode: "CASH",
      notes: "",
    }),
    [],
  );

  const handleSubmit = async (values: CheckInFormValues) => {
    try {
      const primary = values.members[0] || {
        fullName: "Guest",
        idType: "AADHAAR",
        idNumber: "",
        idDocumentId: "",
      };

      const companions = values.members.slice(1).map((m) => ({
        name: m.fullName.trim(),
        idType: m.idType,
        idNumber: m.idNumber.trim(),
        idImage: m.idDocumentId || m.idDocumentUrl || "",
      }));

      // Synchronize in local RTK store
      const stay = await checkIn({
        guest: {
          name: primary.fullName.trim(),
          phone: values.phone.trim(),
          idType: primary.idType,
          idNumber: primary.idNumber.trim(),
          idImage: primary.idDocumentId || primary.idDocumentUrl || "",
          address: "",
        },
        companions,
        partyType: values.partyType,
        guestCount: values.members.length,
        roomIds: values.roomIds,
        planId: values.planId,
        checkInAt: fromLocalInput(values.checkInAt),
        advanceAmount: Number(values.advanceAmount) || 0,
        advanceMode: values.advanceMode,
        taxPercent: settings?.taxPercent ?? 0,
        notes: values.notes,
      }).unwrap();

      toast.success(`${stay.guestName} checked into room ${stay.roomNumber}`);
      // Redirect to updated room board
      navigate(AppEndPoints.DASHBOARD);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <MainContainer>
      <PageTitle
        title="Check in"
        subtitle="Fast counter check-in: repeat guest auto-lookup, government ID verification & room assignment."
      />
      <CheckInWizardForm
        initialValues={initialValues}
        rooms={rooms}
        availableRooms={availableRooms}
        roomTypes={roomTypes}
        plans={plans}
        isLoading={isLoading}
        requestedRoom={requestedRoom}
        taxPercent={settings?.taxPercent ?? 0}
        onSubmit={handleSubmit}
      />
    </MainContainer>
  );
}
