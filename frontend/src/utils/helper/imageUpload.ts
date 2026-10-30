import { API_BASE_URL } from "../../store/services/baseQuery";

export async function uploadImageFile(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file selected");
  }

  const formData = new FormData();
  formData.append("file", file);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    "";

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/fileupload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.messages)
      ? body.messages.join(" ")
      : body?.messages || body?.detail || "Failed to upload image";
    throw new Error(message);
  }

  const result = await res.json();
  const uploadedUrl = (result?.data ?? result?.url ?? result ?? "").toString();
  return uploadedUrl;
}

