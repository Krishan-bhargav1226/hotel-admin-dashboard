import Swal from "sweetalert2";

type ButtonColor = "red" | "yellow" | "green" | "blue";

interface ShowConfirmModalProps {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  buttonColor?: ButtonColor;
}

const colorMap: Record<ButtonColor, string> = {
  red: "#d33",
  yellow: "#eab308",
  green: "#16a34a",
  blue: "#2563eb",
};

export const ShowConfirmModal = async ({
  title = "Are you sure?",
  text = "This action cannot be undone!",
  confirmButtonText = "Confirm",
  buttonColor = "red",
}: ShowConfirmModalProps): Promise<boolean> => {

  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,

    confirmButtonColor: colorMap[buttonColor],
    cancelButtonColor: "#6b7280",

    confirmButtonText,
    cancelButtonText: "Cancel",

    didOpen: () => {
      const container = Swal.getContainer();
      const popup = Swal.getPopup();

      if (container) container.style.zIndex = "2000";
      if (popup) popup.style.zIndex = "2001";
    },
  });

  return result.isConfirmed;
};